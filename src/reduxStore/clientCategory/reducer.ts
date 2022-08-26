import { ClientCategoryActionType, ClientCategoryEnum, ClientCategoryType } from './types';

const initialState: ClientCategoryType = {
    result: {},
    loading: false,
    error: {},
};

function ClientCategoryReducer(state = initialState, action: ClientCategoryActionType) {
    const { type, payload } = action;
    switch (type) {
        case ClientCategoryEnum.GET_CLIENT_CATEGORY: {
            return { ...state, loading: true };
        }
        case ClientCategoryEnum.GET_CLIENT_CATEGORY_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ClientCategoryEnum.GET_CLIENT_CATEGORY_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ClientCategoryReducer;
