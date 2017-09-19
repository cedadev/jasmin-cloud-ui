/**
 * This module contains Redux stuff for loading tenancies.
 */

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import at from 'lodash/at';

import { combineEpics } from 'redux-observable';

import { actions as sessionActions } from '../session';

import {
    actions as quotaActions,
    actionCreators as quotaActionCreators,
    reducer as quotaReducer,
    epic as quotaEpic
} from './quotas';

import {
    actions as imageActions,
    actionCreators as imageActionCreators,
    reducer as imageReducer,
    epic as imageEpic
} from './images';

import {
    actions as sizeActions,
    actionCreators as sizeActionCreators,
    reducer as sizeReducer,
    epic as sizeEpic
} from './sizes';

import {
    actions as externalIpActions,
    actionCreators as externalIpActionCreators,
    reducer as externalIpReducer,
    epic as externalIpEpic
} from './external-ips';

import {
    actions as volumeActions,
    actionCreators as volumeActionCreators,
    reducer as volumeReducer,
    epic as volumeEpic
} from './volumes';

import {
    actions as machineActions,
    actionCreators as machineActionCreators,
    reducer as machineReducer,
    epic as machineEpic
} from './machines';


const tenancyActions = {
    RESET: 'TENANCIES/RESET',

    FETCH_LIST: 'TENANCIES/FETCH_LIST',
    FETCH_LIST_SUCCEEDED: 'TENANCIES/FETCH_LIST_SUCCEEDED',
    FETCH_LIST_FAILED: 'TENANCIES/FETCH_LIST_FAILED',
};


const tenancyActionCreators = {
    reset: () => ({ type: tenancyActions.RESET }),
    fetchList: () => ({
        type: tenancyActions.FETCH_LIST,
        apiRequest: true,
        successAction: tenancyActions.FETCH_LIST_SUCCEEDED,
        failureAction: tenancyActions.FETCH_LIST_FAILED,
        options: { url: '/api/tenancies/' }
    })
}

export const actionCreators = {
    ...tenancyActionCreators,
    quota: quotaActionCreators,
    image: imageActionCreators,
    size: sizeActionCreators,
    externalIp: externalIpActionCreators,
    volume: volumeActionCreators,
    machine: machineActionCreators,
}


// Initially, fetching is set to true since we assume the first thing we will do
// when possible is fetch the tenancy data
const initialState = { fetching: true, data: null };
export function reducer(state = initialState, action) {
    switch(action.type) {
        case tenancyActions.RESET:
            return initialState;
        case tenancyActions.FETCH_LIST:
            return { ...state, fetching: true };
        case tenancyActions.FETCH_LIST_SUCCEEDED:
            return {
                fetching: false,
                data: Object.assign(
                    {},
                    ...action.payload.map(t => {
                        const previous = (state.data || {})[t.id] || {
                            quotas: quotaReducer(undefined, action),
                            images: imageReducer(undefined, action),
                            sizes: sizeReducer(undefined, action),
                            externalIps: externalIpReducer(undefined, action),
                            volumes: volumeReducer(undefined, action),
                            machines: machineReducer(undefined, action)
                        };
                        return { [t.id]: { ...previous, ...t } };
                    })
                )
            };
        case tenancyActions.FETCH_LIST_FAILED:
            return { ...state, fetching: false };
        default:
            // If the action has an associated tenancy id for a tenancy that we
            // know about, apply the resource reducers
            if( state.data === null ) return state;
            const tenancyId = action.tenancyId || at(action, 'request.tenancyId')[0];
            if( !tenancyId || !state.data.hasOwnProperty(tenancyId) ) return state;
            return {
                ...state,
                data: {
                    ...state.data,
                    [tenancyId]: {
                        ...state.data[tenancyId],
                        quotas: quotaReducer(
                            state.data[tenancyId].quotas,
                            action
                        ),
                        images: imageReducer(
                            state.data[tenancyId].images,
                            action
                        ),
                        sizes: sizeReducer(
                            state.data[tenancyId].sizes,
                            action
                        ),
                        externalIps: externalIpReducer(
                            state.data[tenancyId].externalIps,
                            action
                        ),
                        volumes: volumeReducer(
                            state.data[tenancyId].volumes,
                            action
                        ),
                        machines: machineReducer(
                            state.data[tenancyId].machines,
                            action
                        )
                    }
                }
            };
    }
}


export const epic = combineEpics(
    // When a session is started, load the tenancy list
    action$ => action$
        .ofType(sessionActions.STARTED)
        .map(action => tenancyActionCreators.fetchList()),
    // When a session is terminated, reset the tenancy data
    action$ => action$
        .ofType(sessionActions.TERMINATED)
        .map(action => tenancyActionCreators.reset()),
    // Whenever the tenancies are successfully fetched (which should happen once
    // per session), fetch the data for each tenancy resource in parallel
    action$ => action$
        .ofType(tenancyActions.FETCH_LIST_SUCCEEDED)
        .mergeMap(action =>
            Observable.of(
                ...Array.prototype.concat(
                    ...action.payload.map(t => [
                        quotaActionCreators.fetchList(t.id),
                        imageActionCreators.fetchList(t.id),
                        sizeActionCreators.fetchList(t.id),
                        externalIpActionCreators.fetchList(t.id),
                        volumeActionCreators.fetchList(t.id),
                        machineActionCreators.fetchList(t.id)
                    ])
                )
            )
        ),
    quotaEpic,
    imageEpic,
    sizeEpic,
    externalIpEpic,
    volumeEpic,
    machineEpic
);
