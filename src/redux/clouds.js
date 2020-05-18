/**
 * This module manages the Redux state for the available clouds.
 */


export const actions = {
    FETCH: 'CLOUDS/FETCH',
    FETCH_SUCCEEDED: 'CLOUDS/FETCH_SUCCEEDED',
    FETCH_FAILED: 'CLOUDS/FETCH_FAILED'
};


export const actionCreators = {
    fetch: () => ({
        type: actions.FETCH,
        apiRequest: true,
        successAction: actions.FETCH_SUCCEEDED,
        failureAction: actions.FETCH_FAILED,
        options: { url: '/api/' }
    })
};


/**
 * The redux reducer for the session state.
 */
const initialState = { available_clouds: [], current_cloud: null };
export function reducer(state = initialState, action) {
    switch(action.type) {
        case actions.FETCH_SUCCEEDED:
            return action.payload;
        default:
            return state;
    }
}
