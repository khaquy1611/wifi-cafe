import { GroupStoresActionType, GroupStoresEnum, GroupStoresType } from './types';

const initialState: GroupStoresType = {
    result: {},
    loading: false,
    error: {},
};

function GroupStoresReducer(state = initialState, action: GroupStoresActionType) {
    const { type, payload } = action;
    switch (type) {
        case GroupStoresEnum.GET_GROUP_STORES: {
            return { ...state, loading: true };
        }
        case GroupStoresEnum.GET_GROUP_STORES_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case GroupStoresEnum.GET_GROUP_STORES_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default GroupStoresReducer;
