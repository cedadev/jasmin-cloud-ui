/**
 * This module manages the Redux state for the messaging subsystem.
 */


export const Actions = {
    NOTIFY: 'NOTIFICATIONS/NOTIFY',
    REMOVE_NOTIFICATION: 'NOTIFICATIONS/REMOVE_NOTIFICATION',
    CLEAR_NOTIFICATIONS: 'NOTIFICATIONS/CLEAR_NOTIFICATIONS'
};


export function notify(message, context) {
    return {
        type: Actions.NOTIFY,
        payload: { message, context }
    };
}
export const notifyInfo    = (message) => notify(message, 'info')
export const notifySuccess = (message) => notify(message, 'success')
export const notifyWarning = (message) => notify(message, 'warning')
export const notifyError   = (message) => notify(message, 'danger')

export function removeNotification(index) {
    return {
        type: Actions.REMOVE_NOTIFICATION,
        index: index
    };
}

export function clearNotifications() {
    return { type: Actions.CLEAR_NOTIFICATIONS };
}


export function reducer(state = [], action) {
    switch(action.type) {
        case Actions.NOTIFY:
            return [...state, action.payload];
        case Actions.REMOVE_NOTIFICATION:
            const index = action.index;
            return state.slice(0, index).concat(state.slice(index + 1));
        case Actions.CLEAR_NOTIFICATIONS:
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
        .map(action => notifyError(action.payload.message));
}
