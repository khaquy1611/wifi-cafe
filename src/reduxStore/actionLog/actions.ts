import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ActionLogResponeType, ErrorType } from 'api/types';
import { getActionLogApi } from 'api/store';
import { message } from 'antd';
import { ActionLogEnum } from './types';

export const getActionLogStarted = () => action(ActionLogEnum.GET_ACTION_LOG, {});
export const getActionLogSuccess = (res: ActionLogResponeType) => action(ActionLogEnum.GET_ACTION_LOG_SUCCESS, res);
export const getActionLogError = (error: ErrorType) => action(ActionLogEnum.GET_ACTION_LOG_ERROR, error);

export const getActionLog = (
    data: { group_id: string; store_id: string; offset?: string; key?: string; user_id?: string },
    token = '',
) => async (dispatch: Dispatch) => {
    try {
        dispatch(getActionLogStarted());

        const res: ActionLogResponeType = await getActionLogApi(data, token);

        dispatch(getActionLogSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getActionLogError(err));
    }
};
