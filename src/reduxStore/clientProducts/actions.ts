import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CategoryResponeType, ErrorType } from 'api/types';
import { getClientProductsApi } from 'api/client';
import { message } from 'antd';
import { ClientProductsEnum } from './types';

export const getClientProductsStarted = () => action(ClientProductsEnum.GET_CLIENT_PRODUCTS, {});
export const getClientProductsSuccess = (res: CategoryResponeType) =>
    action(ClientProductsEnum.GET_CLIENT_PRODUCTS_SUCCESS, res);
export const getClientProductsError = (error: ErrorType) => action(ClientProductsEnum.GET_CLIENT_PRODUCTS_ERROR, error);

export const getClientProducts = (qrCode: string) => async (dispatch: Dispatch) => {
    try {
        dispatch(getClientProductsStarted());

        const res: CategoryResponeType = await getClientProductsApi(qrCode);

        dispatch(getClientProductsSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getClientProductsError(err));
    }
};
