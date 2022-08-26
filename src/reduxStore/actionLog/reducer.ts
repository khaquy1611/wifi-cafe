import { ActionLogActionType, ActionLogEnum, ActionLogType } from './types';

const initialState: ActionLogType = {
    result: {},
    loading: false,
    error: {},
};

function ActionLogReducer(state = initialState, action: ActionLogActionType) {
    const { type, payload } = action;
    switch (type) {
        case ActionLogEnum.GET_ACTION_LOG: {
            return { ...state, loading: true };
        }
        case ActionLogEnum.GET_ACTION_LOG_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ActionLogEnum.GET_ACTION_LOG_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ActionLogReducer;
