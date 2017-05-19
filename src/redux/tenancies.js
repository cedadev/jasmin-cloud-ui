/**
 * This module contains Redux stuff for loading tenancies.
 */

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/takeUntil';

import at from 'lodash/at';

import { combineEpics } from 'redux-observable';

import { Actions as SessionActions } from './session';


const Actions = {
    RESET_TENANCY_LIST: 'TENANCIES/RESET_TENANCY_LIST',

    FETCH_TENANCY_LIST: 'TENANCIES/FETCH_TENANCY_LIST',
    FETCH_TENANCY_LIST_SUCCEEDED: 'TENANCIES/FETCH_TENANCY_LIST_SUCCEEDED',
    FETCH_TENANCY_LIST_FAILED: 'TENANCIES/FETCH_TENANCY_LIST_FAILED',

    FETCH_QUOTAS: 'TENANCIES/FETCH_QUOTAS',
    FETCH_QUOTAS_SUCCEEDED: 'TENANCIES/FETCH_QUOTAS_SUCCEEDED',
    FETCH_QUOTAS_FAILED: 'TENANCIES/FETCH_QUOTAS_FAILED',

    FETCH_IMAGES: 'TENANCIES/FETCH_IMAGES',
    FETCH_IMAGES_SUCCEEDED: 'TENANCIES/FETCH_IMAGES_SUCCEEDED',
    FETCH_IMAGES_FAILED: 'TENANCIES/FETCH_IMAGES_FAILED',

    FETCH_SIZES: 'TENANCIES/FETCH_SIZES',
    FETCH_SIZES_SUCCEEDED: 'TENANCIES/FETCH_SIZES_SUCCEEDED',
    FETCH_SIZES_FAILED: 'TENANCIES/FETCH_SIZES_FAILED',

    FETCH_MACHINES: 'TENANCIES/FETCH_MACHINES',
    FETCH_MACHINES_SUCCEEDED: 'TENANCIES/FETCH_MACHINES_SUCCEEDED',
    FETCH_MACHINES_FAILED: 'TENANCIES/FETCH_MACHINES_FAILED',

    FETCH_MACHINE: 'TENANCIES/FETCH_MACHINE',
    FETCH_MACHINE_SUCCEEDED: 'TENANCIES/FETCH_MACHINE_SUCCEEDED',
    FETCH_MACHINE_FAILED: 'TENANCIES/FETCH_MACHINE_FAILED',

    CREATE_MACHINE: 'TENANCIES/CREATE_MACHINE',
    CREATE_MACHINE_SUCCEEDED: 'TENANCIES/CREATE_MACHINE_SUCCEEDED',
    CREATE_MACHINE_FAILED: 'TENANCIES/CREATE_MACHINE_FAILED',

    START_MACHINE: 'TENANCIES/START_MACHINE',
    START_MACHINE_SUCCEEDED: 'TENANCIES/START_MACHINE_SUCCEEDED',
    START_MACHINE_FAILED: 'TENANCIES/START_MACHINE_FAILED',

    STOP_MACHINE: 'TENANCIES/STOP_MACHINE',
    STOP_MACHINE_SUCCEEDED: 'TENANCIES/STOP_MACHINE_SUCCEEDED',
    STOP_MACHINE_FAILED: 'TENANCIES/STOP_MACHINE_FAILED',

    RESTART_MACHINE: 'TENANCIES/RESTART_MACHINE',
    RESTART_MACHINE_SUCCEEDED: 'TENANCIES/RESTART_MACHINE_SUCCEEDED',
    RESTART_MACHINE_FAILED: 'TENANCIES/RESTART_MACHINE_FAILED',

    DELETE_MACHINE: 'TENANCIES/DELETE_MACHINE',
    DELETE_MACHINE_SUCCEEDED: 'TENANCIES/DELETE_MACHINE_SUCCEEDED',
    DELETE_MACHINE_FAILED: 'TENANCIES/DELETE_MACHINE_FAILED',

    ATTACH_VOLUME: 'TENANCIES/ATTACH_VOLUME',
    ATTACH_VOLUME_SUCCEEDED: 'TENANCIES/ATTACH_VOLUME_SUCCEEDED',
    ATTACH_VOLUME_FAILED: 'TENANCIES/ATTACH_VOLUME_FAILED',

    DETACH_VOLUME: 'TENANCIES/DETACH_VOLUME',
    DETACH_VOLUME_SUCCEEDED: 'TENANCIES/DETACH_VOLUME_SUCCEEDED',
    DETACH_VOLUME_FAILED: 'TENANCIES/DETACH_VOLUME_FAILED'
};

export function resetTenancyList() {
    return { type: Actions.RESET_TENANCY_LIST };
}

export function fetchTenancyList() {
    return {
        type: Actions.FETCH_TENANCY_LIST,
        apiRequest: true,
        successAction: Actions.FETCH_TENANCY_LIST_SUCCEEDED,
        failureAction: Actions.FETCH_TENANCY_LIST_FAILED,
        options: { url: '/api/tenancies/' }
    };
}

export function fetchQuotas(tenancyId) {
    return {
        type: Actions.FETCH_QUOTAS,
        tenancyId: tenancyId,
        apiRequest: true,
        successAction: Actions.FETCH_QUOTAS_SUCCEEDED,
        failureAction: Actions.FETCH_QUOTAS_FAILED,
        options: { url: `/api/tenancies/${tenancyId}/quotas/` }
    };
}

export function fetchImages(tenancyId) {
    return {
        type: Actions.FETCH_IMAGES,
        tenancyId: tenancyId,
        apiRequest: true,
        successAction: Actions.FETCH_IMAGES_SUCCEEDED,
        failureAction: Actions.FETCH_IMAGES_FAILED,
        options: { url: `/api/tenancies/${tenancyId}/images/` }
    };
}

export function fetchSizes(tenancyId) {
    return {
        type: Actions.FETCH_SIZES,
        tenancyId: tenancyId,
        apiRequest: true,
        successAction: Actions.FETCH_SIZES_SUCCEEDED,
        failureAction: Actions.FETCH_SIZES_FAILED,
        options: { url: `/api/tenancies/${tenancyId}/sizes/` }
    };
}

export function fetchMachines(tenancyId) {
    return {
        type: Actions.FETCH_MACHINES,
        tenancyId: tenancyId,
        apiRequest: true,
        successAction: Actions.FETCH_MACHINES_SUCCEEDED,
        failureAction: Actions.FETCH_MACHINES_FAILED,
        options: { url: `/api/tenancies/${tenancyId}/machines/` }
    };
}

export function createMachine(tenancyId, name, imageId, sizeId) {
    return {
        type: Actions.CREATE_MACHINE,
        tenancyId: tenancyId,
        apiRequest: true,
        successAction: Actions.CREATE_MACHINE_SUCCEEDED,
        failureAction: Actions.CREATE_MACHINE_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/`,
            method: 'POST',
            body: { name, image_id: imageId, size_id: sizeId }
        }
    };
}

export function fetchMachine(tenancyId, machineId) {
    return {
        type: Actions.FETCH_MACHINE,
        tenancyId: tenancyId,
        machineId: machineId,
        apiRequest: true,
        successAction: Actions.FETCH_MACHINE_SUCCEEDED,
        failureAction: Actions.FETCH_MACHINE_FAILED,
        options: { url: `/api/tenancies/${tenancyId}/machines/${machineId}` }
    };
}

export function startMachine(tenancyId, machineId) {
    return {
        type: Actions.START_MACHINE,
        tenancyId: tenancyId,
        machineId: machineId,
        apiRequest: true,
        successAction: Actions.START_MACHINE_SUCCEEDED,
        failureAction: Actions.START_MACHINE_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/${machineId}/start/`,
            method: 'POST'
        }
    };
}

export function stopMachine(tenancyId, machineId) {
    return {
        type: Actions.STOP_MACHINE,
        tenancyId: tenancyId,
        machineId: machineId,
        apiRequest: true,
        successAction: Actions.STOP_MACHINE_SUCCEEDED,
        failureAction: Actions.STOP_MACHINE_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/${machineId}/stop/`,
            method: 'POST'
        }
    };
}

export function restartMachine(tenancyId, machineId) {
    return {
        type: Actions.RESTART_MACHINE,
        tenancyId: tenancyId,
        machineId: machineId,
        apiRequest: true,
        successAction: Actions.RESTART_MACHINE_SUCCEEDED,
        failureAction: Actions.RESTART_MACHINE_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/${machineId}/restart/`,
            method: 'POST'
        }
    };
}

export function deleteMachine(tenancyId, machineId) {
    return {
        type: Actions.DELETE_MACHINE,
        tenancyId: tenancyId,
        machineId: machineId,
        apiRequest: true,
        successAction: Actions.DELETE_MACHINE_SUCCEEDED,
        failureAction: Actions.DELETE_MACHINE_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/${machineId}/`,
            method: 'DELETE'
        }
    };
}

export function attachVolume(tenancyId, machineId, size) {
    return {
        type: Actions.ATTACH_VOLUME,
        tenancyId: tenancyId,
        machineId: machineId,
        apiRequest: true,
        successAction: Actions.ATTACH_VOLUME_SUCCEEDED,
        failureAction: Actions.ATTACH_VOLUME_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/${machineId}/volumes/`,
            method: 'POST',
            body: { size }
        }
    };
}

export function detachVolume(tenancyId, machineId, volumeId) {
    return {
        type: Actions.DETACH_VOLUME,
        tenancyId: tenancyId,
        machineId: machineId,
        volumeId: volumeId,
        apiRequest: true,
        successAction: Actions.DETACH_VOLUME_SUCCEEDED,
        failureAction: Actions.DETACH_VOLUME_FAILED,
        options: {
            url: `/api/tenancies/${tenancyId}/machines/${machineId}/volumes/${volumeId}/`,
            method: 'DELETE'
        }
    };
}


// Initially, fetching is set to true since we assume the first thing we will do
// when possible is fetch the tenancy data
const initialState = { fetching: true, data: {} };

function mergeMachine(oldState = {}, newState) {
    const newMachine = { ...oldState, ...newState };
    if( newState.hasOwnProperty('created') )
        newMachine.created = new Date(newState.created);
    return newMachine;
}

function updateMachineInState(state, machineId, newState) {
    if( !state.data.hasOwnProperty(machineId) ) return state;
    return {
        ...state,
        data: {
            ...state.data,
            [machineId]: mergeMachine(state.data[machineId], newState)
        }
    };
}

function machinesReducer(state = initialState, action) {
    switch(action.type) {
        case Actions.FETCH_MACHINES:
            return { ...state, fetching: true };
        case Actions.FETCH_MACHINES_SUCCEEDED:
            return {
                fetching: false,
                data: Object.assign(
                    {},
                    ...action.payload.map(m => ({
                        [m.id]: mergeMachine(state.data[m.id], m)
                    }))
                )
            };
        case Actions.FETCH_MACHINES_FAILED:
            return { ...state, fetching: false };
        case Actions.CREATE_MACHINE:
            return { ...state, creating: true };
        case Actions.CREATE_MACHINE_SUCCEEDED:
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.payload.id]: mergeMachine(undefined, action.payload)
                },
                creating: false
            };
        case Actions.CREATE_MACHINE_FAILED:
            return { ...state, creating: false };
        case Actions.FETCH_MACHINE_SUCCEEDED:
            return updateMachineInState(state, action.payload.id, action.payload);
        case Actions.START_MACHINE:
        case Actions.STOP_MACHINE:
        case Actions.RESTART_MACHINE:
        case Actions.DELETE_MACHINE:
            return updateMachineInState(
                state,
                action.machineId,
                { actionInProgress: true }
            );
        case Actions.ATTACH_VOLUME:
            return updateMachineInState(
                state,
                action.machineId,
                { attachingVolume: true }
            );
        case Actions.DETACH_VOLUME:
            return updateMachineInState(
                state,
                action.machineId,
                { detachingVolume: action.volumeId }
            );
        case Actions.START_MACHINE_SUCCEEDED:
        case Actions.STOP_MACHINE_SUCCEEDED:
        case Actions.RESTART_MACHINE_SUCCEEDED:
            return updateMachineInState(
                state,
                action.payload.id,
                { ...action.payload, actionInProgress: false }
            );
        case Actions.DELETE_MACHINE_SUCCEEDED:
            if( !state.data.hasOwnProperty(action.request.machineId) ) return state;
            const { [action.request.machineId]: deletedKey, ...newData } = state.data;
            return { ...state, data: newData };
        case Actions.ATTACH_VOLUME_SUCCEEDED:
            return updateMachineInState(
                state,
                action.request.machineId,
                {
                    attached_volumes: [
                        ...state.data[action.request.machineId].attached_volumes,
                        action.payload
                    ],
                    attachingVolume: false
                }
            );
        case Actions.DETACH_VOLUME_SUCCEEDED:
            return updateMachineInState(
                state,
                action.request.machineId,
                {
                    attached_volumes: state.
                        data[action.request.machineId].
                        attached_volumes.
                        filter(v => v.id !== action.request.volumeId),
                    detachingVolume: null
                }
            );
        case Actions.START_MACHINE_FAILED:
        case Actions.STOP_MACHINE_FAILED:
        case Actions.RESTART_MACHINE_FAILED:
        case Actions.DELETE_MACHINE_FAILED:
            return updateMachineInState(
                state,
                action.request.machineId,
                { actionInProgress: false }
            );
        case Actions.ATTACH_VOLUME_FAILED:
            return updateMachineInState(
                state,
                action.request.machineId,
                { attachingVolume: false }
            );
        case Actions.DETACH_VOLUME_FAILED:
            return updateMachineInState(
                state,
                action.request.machineId,
                { detachingVolume: null }
            );
        default:
            return state;
    }
}

function quotasReducer(state = initialState, action) {
    switch(action.type) {
        case Actions.FETCH_QUOTAS:
            return { ...state, fetching: true };
        case Actions.FETCH_QUOTAS_SUCCEEDED:
            return { ...state, fetching: false, data: action.payload };
        case Actions.FETCH_QUOTAS_FAILED:
            return { ...state, fetching: false };
        default:
            return state;
    }
}

function imagesReducer(state = initialState, action) {
    switch(action.type) {
        case Actions.FETCH_IMAGES:
            return { ...state, fetching: true };
        case Actions.FETCH_IMAGES_SUCCEEDED:
            return {
                fetching: false,
                data: Object.assign({}, ...action.payload.map(i => ({ [i.id]: i })))
            };
        case Actions.FETCH_IMAGES_FAILED:
            return { ...state, fetching: false };
        default:
            return state;
    }
}

function sizesReducer(state = initialState, action) {
    switch(action.type) {
        case Actions.FETCH_SIZES:
            return { ...state, fetching: true };
        case Actions.FETCH_SIZES_SUCCEEDED:
            return {
                fetching: false,
                data: Object.assign({}, ...action.payload.map(s => ({ [s.id]: s })))
            };
        case Actions.FETCH_SIZES_FAILED:
            return { ...state, fetching: false };
        default:
            return state;
    }
}

export function reducer(state = initialState, action) {
    switch(action.type) {
        case Actions.RESET_TENANCY_LIST:
            return initialState;
        case Actions.FETCH_TENANCY_LIST:
            return { ...state, fetching: true };
        case Actions.FETCH_TENANCY_LIST_SUCCEEDED:
            return {
                fetching: false,
                data: Object.assign(
                    {},
                    ...action.payload.map(t => {
                        const previous = state.data[t.id] || {
                            quotas: initialState,
                            machines: initialState,
                            images: initialState,
                            sizes: initialState
                        };
                        return { [t.id]: { ...previous, ...t } };
                    })
                )
            };
        case Actions.FETCH_TENANCY_LIST_FAILED:
            return { ...state, fetching: false };
        default:
            const tenancyId = action.tenancyId || at(action, 'request.tenancyId');
            if( tenancyId ) {
                if( !state.data.hasOwnProperty(tenancyId) ) return state;
                return {
                    ...state,
                    data: {
                        ...state.data,
                        [tenancyId]: {
                            ...state.data[tenancyId],
                            quotas: quotasReducer(
                                state.data[tenancyId].quotas, action
                            ),
                            machines: machinesReducer(
                                state.data[tenancyId].machines, action
                            ),
                            images: imagesReducer(
                                state.data[tenancyId].images, action
                            ),
                            sizes: sizesReducer(
                                state.data[tenancyId].sizes, action
                            )
                        }
                    }
                };
            }
            return state;
    }
}

function loadTenanciesOnSessionStartEpic(action$) {
    // When a session is started, load the tenancy list
    return action$.ofType(SessionActions.SESSION_STARTED)
        .map(action => fetchTenancyList());
}

function resetTenanciesOnSessionTerminatedEpic(action$) {
    // When a session is terminated, reset the tenancy data
    return action$.ofType(SessionActions.SESSION_TERMINATED)
        .map(action => resetTenancyList());
}

function loadTenancyDataEpic(action$) {
    // Whenever the tenancies are successfully fetched (which happens once per
    // session), fetch the data for each tenancy in parallel
    return action$.ofType(Actions.FETCH_TENANCY_LIST_SUCCEEDED)
        .mergeMap(action =>
            Observable.of(
                ...Array.prototype.concat(
                    ...action.payload.map(t => [
                        fetchQuotas(t.id),
                        fetchMachines(t.id),
                        fetchImages(t.id),
                        fetchSizes(t.id)
                    ])
                )
            )
        );
}

function repeatFetchMachinesEpic(action$) {
    // Whenever the machines for a tenancy are successfully fetched, wait for
    // 2 mins and fetch them again
    return action$.ofType(Actions.FETCH_MACHINES_SUCCEEDED)
        .switchMap(action =>
            Observable.of(fetchMachines(action.request.tenancyId))
                .delay(2 * 60 * 1000)
        );
}

function fetchActiveMachinesEpic(action$) {
    // Whenever the machine list for a tenancy is fetched, trigger more frequent
    // fetches for any machines that are building or have tasks running
    return action$.ofType(Actions.FETCH_MACHINES_SUCCEEDED)
        .mergeMap(action => Observable.of(
            ...action.payload
                .filter(m => (m.status.type === 'BUILD' || !!m.task))
                .map(m => fetchMachine(action.request.tenancyId, m.id))
        ));
}

function fetchMachineAfterActionEpic(action$) {
    // When an action takes place on a machine, fetch the machine
    return action$
        .filter(action => {
            switch(action.type) {
                case Actions.CREATE_MACHINE_SUCCEEDED:
                case Actions.START_MACHINE_SUCCEEDED:
                case Actions.STOP_MACHINE_SUCCEEDED:
                case Actions.RESTART_MACHINE_SUCCEEDED:
                    return true;
                default:
                    return false;
            }
        })
        .map(action => fetchMachine(action.request.tenancyId, action.payload.id));
}

function repeatFetchMachineUntilTaskCompleteEpic(action$) {
    // When a fetched machine has a task in progress, wait 1s and fetch it again
    return action$.ofType(Actions.FETCH_MACHINE_SUCCEEDED)
        .filter(action => !!action.payload.task)
        .switchMap(action =>
            Observable
                .of(fetchMachine(action.request.tenancyId, action.payload.id))
                .delay(1000)
        );
}

function fetchQuotasAfterActionEpic(action$) {
    // When an action takes place that might effect the quotas, refresh them
    return action$
        .filter(action => {
            switch(action.type) {
                case Actions.CREATE_MACHINE_SUCCEEDED:
                case Actions.DELETE_MACHINE_SUCCEEDED:
                case Actions.ATTACH_VOLUME_SUCCEEDED:
                case Actions.DETACH_VOLUME_SUCCEEDED:
                    return true;
                default:
                    return false;
            }
        })
        .map(action => fetchQuotas(action.request.tenancyId));
}

function repeatFetchQuotasEpic(action$) {
    // Whenever the quotas for a tenancy are successfully fetched, wait for
    // 2 mins and fetch them again
    return action$.ofType(Actions.FETCH_QUOTAS_SUCCEEDED)
        .switchMap(action =>
            Observable.of(fetchQuotas(action.request.tenancyId))
                .delay(2 * 60 * 1000)
        );
}

export const epic = combineEpics(
    loadTenanciesOnSessionStartEpic,
    resetTenanciesOnSessionTerminatedEpic,
    loadTenancyDataEpic,
    repeatFetchMachinesEpic,
    fetchActiveMachinesEpic,
    fetchMachineAfterActionEpic,
    repeatFetchMachineUntilTaskCompleteEpic,
    fetchQuotasAfterActionEpic,
    repeatFetchQuotasEpic
);
