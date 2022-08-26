import { AdminUsersActionType, AdminUsersEnum, AdminUsersType } from './types';

const initialState: AdminUsersType = {
    result: {},
    loading: false,
    error: {},
};

function AdminUsersReducer(state = initialState, action: AdminUsersActionType) {
    const { type, payload } = action;
    switch (type) {
        case AdminUsersEnum.GET_ADMIN_USERS: {
            return { ...state, loading: true };
        }
        case AdminUsersEnum.GET_ADMIN_USERS_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case AdminUsersEnum.GET_ADMIN_USERS_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default AdminUsersReducer;
