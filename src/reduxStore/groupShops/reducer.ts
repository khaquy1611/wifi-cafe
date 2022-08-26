import { GroupShopsAllActionType, GroupShopsEnum, GroupShopsType } from './types';

const initialState: GroupShopsType = {
    result: {},
    loading: false,
    error: {},
};

function GroupShopsReducer(state = initialState, action: GroupShopsAllActionType) {
    const { type, payload } = action;
    switch (type) {
        case GroupShopsEnum.GET_GROUP_SHOPS: {
            return { ...state, loading: true };
        }
        case GroupShopsEnum.GET_GROUP_SHOPS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case GroupShopsEnum.GET_GROUP_SHOPS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default GroupShopsReducer;
