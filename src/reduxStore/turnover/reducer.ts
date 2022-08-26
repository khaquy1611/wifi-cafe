import { TurnoverEnum, TurnoverType, TurnoverActionType } from './types';

const initialState: TurnoverType = {
    result: {},
    loading: false,
    error: {},
};

function TurnoverReducer(state = initialState, action: TurnoverActionType) {
    const { type, payload } = action;
    switch (type) {
        case TurnoverEnum.GET_TURNOVER: {
            return { ...state, loading: true };
        }
        case TurnoverEnum.GET_TURNOVER_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case TurnoverEnum.GET_TURNOVER_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default TurnoverReducer;
