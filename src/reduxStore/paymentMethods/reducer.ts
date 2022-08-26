import { PaymentMethodsActionType, PaymentMethodsEnum, PaymentMethodsType } from './types';

const initialState: PaymentMethodsType = {
    result: {},
    loading: false,
    error: {},
};

function PaymentMethodsReducer(state = initialState, action: PaymentMethodsActionType) {
    const { type, payload } = action;
    switch (type) {
        case PaymentMethodsEnum.GET_PAYMENT_METHODS: {
            return { ...state, loading: true };
        }
        case PaymentMethodsEnum.GET_PAYMENT_METHODS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case PaymentMethodsEnum.GET_PAYMENT_METHODS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default PaymentMethodsReducer;
