import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { AdminInfoResponeType, ErrorType } from 'api/types';
import { getAdminInfoApi, logoutApi } from 'api/admin';
import { setCookie, destroyCookie } from 'nookies';
import { message } from 'antd';
import { LoginEnum } from './types';

export const loginStarted = () => action(LoginEnum.LOGIN, {});
export const loginSuccess = (res: AdminInfoResponeType) => action(LoginEnum.LOGIN_SUCCESS, res);
export const loginError = (error: ErrorType) => action(LoginEnum.LOGIN_ERROR, error);

export const login = (admin_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(loginStarted());

        const res = await getAdminInfoApi(admin_id, token);
        const { data } = res;

        setCookie(null, 'role', `${data?.role}`, {
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        dispatch(loginSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(loginError(err));
    }
};

export const logout = (admin_id: string) => async (dispatch: Dispatch) => {
    await logoutApi({ admin_id });
    destroyCookie(null, 'admin_id');
    destroyCookie(null, 'group_id');
    destroyCookie(null, 'store_id');
    destroyCookie(null, 'role');
    destroyCookie(null, 'couponCode');
    dispatch(loginSuccess({}));
    window.location.replace('/login');
};
