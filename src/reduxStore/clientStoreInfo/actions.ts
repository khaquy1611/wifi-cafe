import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ClientStoreInfoResponeType, ErrorType } from 'api/types';
import { getClientStoreInfoApi } from 'api/client';
import { message } from 'antd';
import { ClientStoreInfoEnum } from './types';

export const getClientStoreInfoStarted = () => action(ClientStoreInfoEnum.GET_CLIENT_STORE_INFO, {});
export const getClientStoreInfoSuccess = (res: ClientStoreInfoResponeType) =>
    action(ClientStoreInfoEnum.GET_CLIENT_STORE_INFO_SUCCESS, res);
export const getClientStoreInfoError = (error: ErrorType) =>
    action(ClientStoreInfoEnum.GET_CLIENT_STORE_INFO_ERROR, error);

export const getClientStoreInfo = (qrCode: string) => async (dispatch: Dispatch) => {
    try {
        dispatch(getClientStoreInfoStarted());

        const res: ClientStoreInfoResponeType = await getClientStoreInfoApi(qrCode);

        dispatch(getClientStoreInfoSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getClientStoreInfoError(err));
    }
};
