/**
 * Action creators and reducers for the User section of the state.
 */

import { Observable } from 'rxjs/Observable';
import { ajax } from 'rxjs/observable/dom/ajax';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/merge';

import { combineEpics } from 'redux-observable';

import Cookies from 'js-cookie';

import { notifyError } from './notifications';


/*****
 **  STUFF TO DO WITH API CALLS
 *****/

export class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status;
    }
}

const CSRF_REQUIRED = ['POST', 'PUT', 'DELETE'];

function apiRequestEpic(action$, store) {
    // Listen for actions with the apiRequest flag
    return action$.filter(action => action.apiRequest)
        .mergeMap(action => {
            // The action then has an expected structure
            const { options, successAction, failureAction } = action;
            const method = options.method || 'GET';
            // Make sure we ask for JSON
            const headers = { 'Content-Type': 'application/json' };
            // For POST/PUT/DELETE, include the CSRF token if present
            if( CSRF_REQUIRED.includes(method.toUpperCase()) ) {
                const csrfToken = Cookies.get('csrftoken');
                if( csrfToken ) headers['X-CSRFToken'] = csrfToken;
            }
            // Make the API request
            return ajax({ ...options,
                          withCredentials: true, // Include cookies with the request
                          headers: headers,
                          responseType: 'json' /* Ask for JSON please! */ })
                .map(res => ({
                    type: successAction,
                    payload: res.response,
                    request: action
                }))
                .catch(error => {
                    // Transform AjaxErrors into ApiErrors by inspecting the response for details
                    const res = error.xhr.response;
                    let apiError;
                    if( res === null ) {
                        apiError = new ApiError(
                            'Error communicating with API server.', error.status);
                    }
                    else if( res.detail ) {
                        apiError = new ApiError(res.detail, error.status);
                    }
                    else {
                        apiError = new ApiError(JSON.stringify(res), error.status);
                    }
                    return Observable.of({
                        type: failureAction,
                        error: true,
                        silent: !!action.failSilently,
                        payload: apiError,
                        request: action
                    });
                });
        })
}


/*****
 **  STUFF TO DO WITH SESSION MANAGEMENT
 *****/

export const Actions = {
    // These are just sentinel actions that be consumed by other modules
    SESSION_STARTED: 'USER/SESSION_STARTED',
    SESSION_TERMINATED: 'USER/SESSION_TERMINATED',

    INITIALISE_SESSION: 'USER/INITIALISE_SESSION',
    INITIALISATION_SUCCEEDED: 'USER/INITIALISATION_SUCCEEDED',
    INITIALISATION_FAILED: 'USER/INITIALISATION_FAILED',

    AUTHENTICATE: 'USER/AUTHENTICATE',
    AUTHENTICATION_SUCCEEDED: 'USER/AUTHENTICATION_SUCCEEDED',
    AUTHENTICATION_FAILED: 'USER/AUTHENTICATION_FAILED',

    SIGN_OUT: 'USER/SIGN_OUT',
    SIGN_OUT_SUCCEEDED: 'USER/SIGN_OUT_SUCCEEDED',
    SIGN_OUT_FAILED: 'USER/SIGN_OUT_FAILED'
};

function sessionStarted() {
    return { type: Actions.SESSION_STARTED };
}

function sessionTerminated() {
    return { type: Actions.SESSION_TERMINATED };
}

export function initialiseSession() {
    return {
        type: Actions.INITIALISE_SESSION,
        apiRequest: true,
        successAction: Actions.INITIALISATION_SUCCEEDED,
        failureAction: Actions.INITIALISATION_FAILED,
        options: { url: '/api/session/' }
    };
}

export function authenticate(username, password) {
    return {
        type: Actions.AUTHENTICATE,
        apiRequest: true,
        successAction: Actions.AUTHENTICATION_SUCCEEDED,
        failureAction: Actions.AUTHENTICATION_FAILED,
        options: {
            url: '/api/authenticate/',
            method: 'POST',
            body: { username, password }
        }
    };
}

export function signOut() {
    return {
        type: Actions.SIGN_OUT,
        apiRequest: true,
        successAction: Actions.SIGN_OUT_SUCCEEDED,
        failureAction: Actions.SIGN_OUT_FAILED,
        options: {
            url: '/api/session/',
            method: 'DELETE'
        }
    };
}


const initialState = {
    initialising: true,
    authenticating: false,
    signingOut: false,
    username: null,
    authenticationError: null
};

export function reducer(state = initialState, action) {
    switch(action.type) {
        case Actions.INITIALISE_SESSION:
            return { ...state, initialising: true };
        case Actions.INITIALISATION_SUCCEEDED:
            return {
                ...state,
                username: action.payload.username,
                initialising: false
            };
        case Actions.INITIALISATION_FAILED:
            return { ...state, username: null, initialising: false };
        case Actions.AUTHENTICATE:
            return { ...state, authenticating: true };
        case Actions.AUTHENTICATION_SUCCEEDED:
            return {
                ...state,
                username: action.payload.username,
                authenticating: false
            };
        case Actions.AUTHENTICATION_FAILED:
            return { ...state, username: null, authenticating: false };
        case Actions.SIGN_OUT:
            return { ...state, signingOut: true };
        case Actions.SIGN_OUT_SUCCEEDED:
            return { ...state, username: null, signingOut: false };
        case Actions.SIGN_OUT_FAILED:
            return { ...state, signingOut: false };
        default:
            return state;
    }
}

function sessionStartedEpic(action$) {
    return action$.ofType(Actions.INITIALISATION_SUCCEEDED)
        .merge(action$.ofType(Actions.AUTHENTICATION_SUCCEEDED))
        .map(action => sessionStarted());
}

function sessionTerminatedEpic(action$) {
    return action$.ofType(Actions.SIGN_OUT_SUCCEEDED)
        .merge(action$.ofType(Actions.INITIALISATION_FAILED))
        .merge(action$.ofType(Actions.AUTHENTICATION_FAILED))
        .map(action => sessionTerminated());
}

function apiAuthenticationErrorEpic(action$) {
    return action$
        .filter(action => !!action.error)
        .filter(action => action.type !== Actions.INITIALISATION_FAILED)
        .filter(action => action.type !== Actions.AUTHENTICATION_FAILED)
        .filter(action =>
            action.payload.status === 401 || action.payload.status === 403
        )
        .map(action => ({ ...action, type: Actions.AUTHENTICATION_FAILED }));
}

export const epic = combineEpics(
    apiRequestEpic,
    sessionStartedEpic,
    sessionTerminatedEpic,
    apiAuthenticationErrorEpic
);
