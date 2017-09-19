/**
 * This module contains Redux bits for loading tenancy volumes.
 */

import { createTenancyResource } from './resource';


const {
    actions,
    actionCreators,
    reducer,
    epic,
} = createTenancyResource('volume', {
    isActive: volume =>
        ['CREATING', 'ATTACHING', 'DETACHING', 'DELETING'].includes(volume.status.toUpperCase())
});

export { actions, actionCreators, reducer, epic };
