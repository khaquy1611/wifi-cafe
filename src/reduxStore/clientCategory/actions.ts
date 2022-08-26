import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CategoryResponeType, ErrorType } from 'api/types';
import { getClientCategoryApi } from 'api/client';
import { message } from 'antd';
import { ClientCategoryEnum } from './types';

export const getClientCategoryStarted = () => action(ClientCategoryEnum.GET_CLIENT_CATEGORY, {});
export const getClientCategorySuccess = (res: CategoryResponeType) =>
    action(ClientCategoryEnum.GET_CLIENT_CATEGORY_SUCCESS, res);
export const getClientCategoryError = (error: ErrorType) => action(ClientCategoryEnum.GET_CLIENT_CATEGORY_ERROR, error);

export const getClientCategory = (qrCode: string) => async (dispatch: Dispatch) => {
    try {
        dispatch(getClientCategoryStarted());

        const res: CategoryResponeType = await getClientCategoryApi(qrCode);

        dispatch(getClientCategorySuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getClientCategoryError(err));
    }
};
