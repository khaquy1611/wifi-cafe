import { CouponsActionType, CouponsEnum, CouponsType } from './types';

const initialState: CouponsType = {
    result: {},
    loading: false,
    error: {},
};

function CouponsReducer(state = initialState, action: CouponsActionType) {
    const { type, payload } = action;
    switch (type) {
        case CouponsEnum.GET_COUPONS: {
            return { ...state, loading: true };
        }
        case CouponsEnum.GET_COUPONS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case CouponsEnum.GET_COUPONS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default CouponsReducer;
