/**
 * This module contains Redux bits for loading clusters sizes.
 */

import { createTenancyResource } from './resource';


const {
    actions,
    actionCreators,
    reducer,
    epic,
} = createTenancyResource('cluster');

export { actions, actionCreators, reducer, epic };
