import { ChooseGroupIDActionType, ChooseGroupIDEnum, ChooseGroupIDType } from './types';

const initialState: ChooseGroupIDType = {
    group_id: '',
    store_id: '',
};

function GroupIDStateReducer(state = initialState, action: ChooseGroupIDActionType) {
    const { type, payload } = action;
    switch (type) {
        case ChooseGroupIDEnum.CHOOSE_GROUP_ID: {
            return { ...state, group_id: payload.group_id, store_id: payload.store_id };
        }
        default:
            return state;
    }
}

export default GroupIDStateReducer;
