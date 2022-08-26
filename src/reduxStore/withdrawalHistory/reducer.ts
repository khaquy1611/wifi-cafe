import { WithdrawalHistoryActionType, WithdrawalHistoryEnum, WithdrawalHistoryType } from './types';

const initialState: WithdrawalHistoryType = {
    result: {},
    loading: false,
    error: {},
};

function WithdrawalHistoryReducer(state = initialState, action: WithdrawalHistoryActionType) {
    const { type, payload } = action;
    switch (type) {
        case WithdrawalHistoryEnum.GET_WITHDRAWAL_HISTORY: {
            return { ...state, loading: true };
        }
        case WithdrawalHistoryEnum.GET_WITHDRAWAL_HISTORY_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case WithdrawalHistoryEnum.GET_WITHDRAWAL_HISTORY_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default WithdrawalHistoryReducer;
