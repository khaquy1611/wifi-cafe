import { ClientProductsActionType, ClientProductsEnum, ClientProductsType } from './types';

const initialState: ClientProductsType = {
    result: {},
    loading: false,
    error: {},
};

function ClientProductsReducer(state = initialState, action: ClientProductsActionType) {
    const { type, payload } = action;
    switch (type) {
        case ClientProductsEnum.GET_CLIENT_PRODUCTS: {
            return { ...state, loading: true };
        }
        case ClientProductsEnum.GET_CLIENT_PRODUCTS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ClientProductsEnum.GET_CLIENT_PRODUCTS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ClientProductsReducer;
