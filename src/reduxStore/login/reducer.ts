import { LoginAllActionType, LoginEnum, LoginType } from './types';

const initialState: LoginType = {
    result: {},
    loading: false,
    error: {},
};

function LoginReducer(state = initialState, action: LoginAllActionType) {
    const { type, payload } = action;
    switch (type) {
        case LoginEnum.LOGIN: {
            return { ...state, loading: true };
        }
        case LoginEnum.LOGIN_SUCCESS:
            return { ...state, loading: false, result: payload };
        case LoginEnum.LOGIN_ERROR:
            return { ...state, loading: false, result: {} };

        default:
            return state;
    }
}

export default LoginReducer;
