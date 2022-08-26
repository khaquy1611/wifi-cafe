import { AllOrdersActionType, AllOrdersEnum, AllOrdersType } from './types';

const initialState: AllOrdersType = {
    result: {},
    loading: false,
    error: {},
};

function AllOrdersReducer(state = initialState, action: AllOrdersActionType) {
    const { type, payload } = action;
    switch (type) {
        case AllOrdersEnum.GET_ALL_ORDERS: {
            return { ...state, loading: true };
        }
        case AllOrdersEnum.GET_ALL_ORDERS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case AllOrdersEnum.GET_ALL_ORDERS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default AllOrdersReducer;
