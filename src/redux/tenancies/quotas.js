/**
 * This module contains Redux bits for loading tenancy quotas.
 */

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
        .filter(action => {
            switch(action.type) {
                case externalIpActions.CREATE_SUCCEEDED:
                case volumeActions.CREATE_SUCCEEDED:
                case volumeActions.DELETE_SUCCEEDED:
                case machineActions.CREATE_SUCCEEDED:
                case machineActions.DELETE_SUCCEEDED:
                    return true;
                default:
                    return false;
            }
        })
        .map(action => actionCreators.fetchList(action.request.tenancyId))
);
