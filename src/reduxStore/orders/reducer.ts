import { OrdersActionType, OrdersEnum, OrdersType } from './types';

const initialState: OrdersType = {
    result: {},
    loading: false,
    error: {},
};

function OrdersReducer(state = initialState, action: OrdersActionType) {
    const { type, payload } = action;
    switch (type) {
        case OrdersEnum.GET_ORDERS: {
            return { ...state, loading: true };
        }
        case OrdersEnum.GET_ORDERS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case OrdersEnum.GET_ORDERS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default OrdersReducer;
