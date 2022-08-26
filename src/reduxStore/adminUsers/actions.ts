import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { AdminUsersResponeType, ErrorType } from 'api/types';
import { getAdminUsersApi } from 'api/admin';
import { message } from 'antd';
import { AdminUsersEnum } from './types';

export const getAdminUsersStarted = () => action(AdminUsersEnum.GET_ADMIN_USERS, {});
export const getAdminUsersSuccess = (res: AdminUsersResponeType) => action(AdminUsersEnum.GET_ADMIN_USERS_SUCCESS, res);
export const getAdminUsersError = (error: ErrorType) => action(AdminUsersEnum.GET_ADMIN_USERS_ERROR, error);

export const getAdminUsers = (group_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getAdminUsersStarted());

        const res: AdminUsersResponeType = await getAdminUsersApi(group_id, token);

        dispatch(getAdminUsersSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getAdminUsersError(err));
    }
};
