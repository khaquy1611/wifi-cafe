import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { NotificationResponeType, ErrorType } from 'api/types';
import { getNotificationApi } from 'api/store';
import { message } from 'antd';
import { NotificationEnum } from './types';

export const getNotificationStarted = () => action(NotificationEnum.GET_NOTIFICATION, {});
export const getNotificationSuccess = (res: NotificationResponeType) =>
    action(NotificationEnum.GET_NOTIFICATION_SUCCESS, res);
export const getNotificationError = (error: ErrorType) => action(NotificationEnum.GET_NOTIFICATION_ERROR, error);

export const getNotification = (group_id: string, store_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getNotificationStarted());

        const res: NotificationResponeType = await getNotificationApi(group_id, store_id, token);

        dispatch(getNotificationSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getNotificationError(err));
    }
};
