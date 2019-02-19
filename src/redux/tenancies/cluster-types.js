/**
 * This module contains Redux bits for loading cluster types sizes.
 */

import { createTenancyResource } from './resource';


const {
    actions,
    actionCreators,
    reducer,
    epic,
} = createTenancyResource('cluster_type');

export { actions, actionCreators, reducer, epic };
