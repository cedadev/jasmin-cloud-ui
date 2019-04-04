/**
 * This module contains Redux bits for loading cluster types sizes.
 */

import { map, filter } from 'rxjs/operators';

import { combineEpics, ofType } from 'redux-observable';

import { createTenancyResource } from './resource';


const {
    actions,
    actionCreators: resourceActionCreators,
    reducer,
    epic: resourceEpic,
} = createTenancyResource('cluster_type', { id: ct => ct.name });

const actionCreators = {
    ...resourceActionCreators,

    // A cluster-type fetchList operation should fail silently
    // That way, we can check for a 404, which indicates clusters not supported,
    // without resulting in a notification
    fetchList: tenancyId => ({
        ...resourceActionCreators.fetchList(tenancyId),
        failSilently: true
    })
};

const epic = combineEpics(
    resourceEpic,
    // When a list operation fails with anything that is not a 404, reissue it
    // as not silent
    action$ => action$.pipe(
        ofType(actions.FETCH_LIST_FAILED),
        filter(action => action.payload.status !== 404),
        filter(action => !!action.silent),
        map(action => ({ ...action, silent: false }))
    )
);

export { actions, actionCreators, reducer, epic };
