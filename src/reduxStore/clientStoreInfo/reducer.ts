import { ClientStoreInfoActionType, ClientStoreInfoEnum, ClientStoreInfoType } from './types';

const initialState: ClientStoreInfoType = {
    result: {},
    loading: false,
    error: {},
};

function ClientStoreInfoReducer(state = initialState, action: ClientStoreInfoActionType) {
    const { type, payload } = action;
    switch (type) {
        case ClientStoreInfoEnum.GET_CLIENT_STORE_INFO: {
            return { ...state, loading: true };
        }
        case ClientStoreInfoEnum.GET_CLIENT_STORE_INFO_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ClientStoreInfoEnum.GET_CLIENT_STORE_INFO_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ClientStoreInfoReducer;
