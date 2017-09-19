/**
 * This module manages the Redux state for the messaging subsystem.
 */

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';


export const actions = {
    NOTIFY: 'NOTIFICATIONS/NOTIFY',
    REMOVE: 'NOTIFICATIONS/REMOVE',
    CLEAR: 'NOTIFICATIONS/CLEAR'
};


function notify(message, context) {
    return {
        type: actions.NOTIFY,
        payload: { message, context }
    };
}
export const actionCreators = {
    notify,
    info: (message) => notify(message, 'info'),
    success: (message) => notify(message, 'success'),
    warning: (message) => notify(message, 'warning'),
    error: (message) => notify(message, 'danger'),
    remove: (index) => ({ type: actions.REMOVE, index: index }),
    clear: () => ({ type: actions.CLEAR })
};


export function reducer(state = [], action) {
    switch(action.type) {
        case actions.NOTIFY:
            // As well as context and message, we also record how many times we
            // have seen the same notification before it is cleared
            const index = state.findIndex(n =>
                n.context === action.payload.context &&
                n.message === action.payload.message
            );
            if( index >= 0 ) {
                const prev = state[index];
                const next = { ...prev, times: prev.times + 1 };
                return [...state.slice(0, index), next].concat(state.slice(index + 1));
            }
            else {
                return [...state, { ...action.payload, times: 1 }];
            }
        case actions.REMOVE:
            return state.slice(0, action.index).concat(state.slice(action.index + 1));
        case actions.CLEAR:
            return [];
        default:
            return state;
    }
}

/**
 * This epic will raise an error notification for any action with the error flag
 * except those that are explicitly silenced.
 */
export function epic(action$) {
    return action$
        .filter(action => !!action.error)
        .filter(action => !action.silent)
        .map(action => actionCreators.error(action.payload.message));
}
