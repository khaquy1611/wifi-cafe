import { PropductsActionType, PropductsEnum, PropductsType } from './types';

const initialState: PropductsType = {
    result: {},
    loading: false,
    error: {},
};

function ProductsReducer(state = initialState, action: PropductsActionType) {
    const { type, payload } = action;
    switch (type) {
        case PropductsEnum.GET_PRODUCT: {
            return { ...state, loading: true };
        }
        case PropductsEnum.GET_PRODUCT_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case PropductsEnum.GET_PRODUCT_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ProductsReducer;
