/**
 * This module contains Redux bits for loading tenancy quotas.
 */

import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { combineEpics } from 'redux-observable';

import { createTenancyResource } from './resource';

import { actions as externalIpActions } from './external-ips';
import { actions as volumeActions } from './volumes';
import { actions as machineActions } from './machines';


const {
    actions,
    actionCreators,
    reducer,
    epic: resourceEpic
} = createTenancyResource('quota', { id: quota => quota.resource });


export { actions, actionCreators, reducer };

export const epic = combineEpics(
    resourceEpic,
    // When an action takes place that might effect the quotas, refresh them
    action$ => action$
        .ofType(externalIpActions.CREATE_SUCCEEDED)
        .merge(action$.ofType(volumeActions.CREATE_SUCCEEDED))
        .merge(action$.ofType(volumeActions.DELETE_SUCCEEDED))
        .merge(action$.ofType(machineActions.CREATE_SUCCEEDED))
        .merge(action$.ofType(machineActions.DELETE_SUCCEEDED))
        // Also consider a failed FETCH_ONE, as this might signify that a resource
        // was in a "deleting" phase that has now completed
        .merge(action$
            .ofType(externalIpActions.FETCH_ONE_FAILED)
            .merge(action$.ofType(volumeActions.FETCH_ONE_FAILED))
            .merge(action$.ofType(machineActions.FETCH_ONE_FAILED))
            .filter(action => action.payload.status === 404)
        )
        .map(action => actionCreators.fetchList(action.request.tenancyId))
);
