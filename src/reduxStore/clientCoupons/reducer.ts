import { ClientCouponsActionType, ClientCouponsEnum, ClientCouponsType } from './types';

const initialState: ClientCouponsType = {
    result: {},
    loading: false,
    error: {},
};

function ClientCouponsReducer(state = initialState, action: ClientCouponsActionType) {
    const { type, payload } = action;
    switch (type) {
        case ClientCouponsEnum.GET_CLIENT_COUPONS: {
            return { ...state, loading: true };
        }
        case ClientCouponsEnum.GET_CLIENT_COUPONS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ClientCouponsEnum.GET_CLIENT_COUPONS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ClientCouponsReducer;
