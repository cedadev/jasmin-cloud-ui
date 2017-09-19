/**
 * This module contains Redux bits for loading tenancy external ips.
 */

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

import { combineEpics } from 'redux-observable';

import { createTenancyResource } from './resource';

import { actions as machineActions } from './machines';


const {
    actions,
    actionCreators,
    reducer,
    epic: resourceEpic,
} = createTenancyResource('external_ip', { id: ip => ip.external_ip });


export { actions, actionCreators, reducer };

export const epic = combineEpics(
    resourceEpic,
    // An update of an external IP record may affect others, so refresh the
    // whole list
    action$ => action$
        .ofType(actions.UPDATE_SUCCEEDED)
        .map(action => actionCreators.fetchList(action.request.tenancyId)),
    // When a machine is deleted or a fetch fails with a 404, refresh the IP list
    // in case it had an external IP
    action$ => action$
        .ofType(machineActions.DELETE_SUCCEEDED)
        .merge(action$
            .ofType(machineActions.FETCH_ONE_FAILED)
            .filter(action => action.payload.status === 404))
        .map(action => actionCreators.fetchList(action.request.tenancyId))
);
