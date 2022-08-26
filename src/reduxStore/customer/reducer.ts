import { CustomerActionType, CustomerEnum, CustomerType } from './types';

const initialState: CustomerType = {
    result: {},
    loading: false,
    error: {},
};

function CustomerReducer(state = initialState, action: CustomerActionType) {
    const { type, payload } = action;
    switch (type) {
        case CustomerEnum.GET_CUSTOMER: {
            return { ...state, loading: true };
        }
        case CustomerEnum.GET_CUSTOMER_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case CustomerEnum.GET_CUSTOMER_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default CustomerReducer;
