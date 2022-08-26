import { ReceiptActionType, ReceiptEnum, ReceiptType } from './types';

const initialState: ReceiptType = {
    result: {},
    loading: false,
    error: {},
};

function ReceiptReducer(state = initialState, action: ReceiptActionType) {
    const { type, payload } = action;
    switch (type) {
        case ReceiptEnum.GET_RECEIPT: {
            return { ...state, loading: true };
        }
        case ReceiptEnum.GET_RECEIPT_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ReceiptEnum.GET_RECEIPT_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ReceiptReducer;
