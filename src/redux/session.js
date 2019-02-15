/**
 * Action creators and reducers for the User section of the state.
 */

import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';
import { merge, map, filter, mergeMap, catchError } from 'rxjs/operators';

import { combineEpics, ofType } from 'redux-observable';

import Cookies from 'js-cookie';


export const actions = {
    // These are just sentinel actions that be consumed by other modules
    STARTED: 'SESSION/STARTED',
    TERMINATED: 'SESSION/TERMINATED',

    INITIALISE: 'SESSION/INITIALISE',
    INITIALISATION_SUCCEEDED: 'SESSION/INITIALISATION_SUCCEEDED',
    INITIALISATION_FAILED: 'SESSION/INITIALISATION_FAILED',

    AUTHENTICATE: 'SESSION/AUTHENTICATE',
    AUTHENTICATION_SUCCEEDED: 'SESSION/AUTHENTICATION_SUCCEEDED',
    AUTHENTICATION_FAILED: 'SESSION/AUTHENTICATION_FAILED',

    SIGN_OUT: 'SESSION/SIGN_OUT',
    SIGN_OUT_SUCCEEDED: 'SESSION/SIGN_OUT_SUCCEEDED',
    SIGN_OUT_FAILED: 'SESSION/SIGN_OUT_FAILED'
};


export const actionCreators = {
    initialise: () => ({
        type: actions.INITIALISE,
        apiRequest: true,
        failSilently: true,
        successAction: actions.INITIALISATION_SUCCEEDED,
        failureAction: actions.INITIALISATION_FAILED,
        options: { url: '/api/session/' }
    }),
    authenticate: (username, password) => ({
        type: actions.AUTHENTICATE,
        apiRequest: true,
        failSilently: true,
        successAction: actions.AUTHENTICATION_SUCCEEDED,
        failureAction: actions.AUTHENTICATION_FAILED,
        options: {
            url: '/api/authenticate/',
            method: 'POST',
            body: { username, password }
        }
    }),
    signOut: () => ({
        type: actions.SIGN_OUT,
        apiRequest: true,
        successAction: actions.SIGN_OUT_SUCCEEDED,
        failureAction: actions.SIGN_OUT_FAILED,
        options: {
            url: '/api/session/',
            method: 'DELETE'
        }
    })
};


const initialState = {
    initialising: true,
    authenticating: false,
    signingOut: false,
    username: null,
    authenticationError: null
};

/**
 * The redux reducer for the session state.
 */
export function reducer(state = initialState, action) {
    switch(action.type) {
        case actions.INITIALISE:
            return { ...state, initialising: true };
        case actions.INITIALISATION_SUCCEEDED:
            return {
                ...state,
                username: action.payload.username,
                initialising: false
            };
        case actions.INITIALISATION_FAILED:
            return { ...state, username: null, initialising: false };
        case actions.AUTHENTICATE:
            return { ...state, authenticating: true };
        case actions.AUTHENTICATION_SUCCEEDED:
            return {
                ...state,
                username: action.payload.username,
                authenticating: false,
                authenticationError: null
            };
        case actions.AUTHENTICATION_FAILED:
            return {
                ...state,
                username: null,
                authenticating: false,
                authenticationError: action.payload
            };
        case actions.SIGN_OUT:
            return { ...state, signingOut: true };
        case actions.SIGN_OUT_SUCCEEDED:
            return { ...state, username: null, signingOut: false };
        case actions.SIGN_OUT_FAILED:
            return { ...state, signingOut: false };
        default:
            return state;
    }
}

/**
 * redux-observable epic to dispatch the generic session started action when a
 * session is successfully initialised or authenticated.
 */
function sessionStartedEpic(action$) {
    return action$.pipe(
        ofType(actions.INITIALISATION_SUCCEEDED),
        merge(action$.pipe(ofType(actions.AUTHENTICATION_SUCCEEDED))),
        map(_ => ({ type: actions.STARTED }))
    );
}

/**
 * redux-observable epic to dispatch the generic session terminated action when
 * a session is terminated, either on purpose or due to an error.
 */
function sessionTerminatedEpic(action$) {
    return action$.pipe(
        ofType(actions.SIGN_OUT_SUCCEEDED),
        merge(action$.pipe(ofType(actions.INITIALISATION_FAILED))),
        merge(action$.pipe(ofType(actions.AUTHENTICATION_FAILED))),
        map(_ => ({ type: actions.TERMINATED }))
    );
}

/**
 * redux-observable epic to dispatch an AUTHENTICATION_FAILED action whenever an
 * API request fails with a 401 or 403.
 */
function apiAuthenticationErrorEpic(action$) {
    return action$.pipe(
        filter(action => !!action.error),
        filter(action => action.type !== actions.INITIALISATION_FAILED),
        filter(action => action.type !== actions.AUTHENTICATION_FAILED),
        filter(action =>
            action.payload.status === 401 || action.payload.status === 403
        ),
        map(action => ({ ...action, type: actions.AUTHENTICATION_FAILED }))
    );
}


export class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status;
    }
}

/**
 * redux-observable epic that reacts to actions flagged as API requests by making
 * the corresponding API call.
 *
 * If the request completes successfully, it dispatches the specified success action
 * with the response data as the payload.
 *
 * If the request fails, it dispatches the specified failure action with an ``ApiError``
 * as the payload.
 */
function apiRequestEpic(action$) {
    // Listen for actions with the apiRequest flag
    return action$.pipe(
        filter(action => action.apiRequest),
        mergeMap(
            action => {
                // The action then has an expected structure
                const { options, successAction, failureAction } = action;
                const method = options.method || 'GET';
                // Make sure we ask for JSON
                const headers = { 'Content-Type': 'application/json' };
                // For POST/PUT/DELETE, include the CSRF token if present
                if( ['POST', 'PUT', 'DELETE'].includes(method.toUpperCase()) ) {
                    const csrfToken = Cookies.get('csrftoken');
                    if( csrfToken ) headers['X-CSRFToken'] = csrfToken;
                }
                // Make the API request
                // If the session is terminated, discard any active requests
                const request = {
                    ...options,
                    withCredentials: true, // Include cookies with the request
                    headers: headers,
                    responseType: 'json' /* Ask for JSON please! */
                };
                return ajax(request).pipe(
                    map(response => ({
                        type: successAction,
                        payload: response.response,
                        request: action
                    })),
                    catchError(error => {
                        // Transform AjaxErrors into ApiErrors by inspecting the response for details
                        const response = error.xhr.response;
                        const apiError = response === null ?
                            new ApiError(
                                'Error communicating with API server.', error.status
                            ) : (
                                response.detail ?
                                    new ApiError(response.detail, error.status):
                                    new ApiError(JSON.stringify(response), error.status)
                            );
                        return of({
                            type: failureAction,
                            error: true,
                            silent: !!action.failSilently,
                            payload: apiError,
                            request: action
                        });
                    })
                );
            },
            // Allow at most 2 concurrent requests
            // This means one long-running request, like a large list fetch,
            // won't block other small requests, but our requests are reasonably
            // rate limited
            2
        )
    );
}


export const epic = combineEpics(
    apiRequestEpic,
    sessionStartedEpic,
    sessionTerminatedEpic,
    apiAuthenticationErrorEpic
);
