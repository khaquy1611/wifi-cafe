import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ClientCouponsResponeType, ErrorType } from 'api/types';
import { getClientCouponsApi } from 'api/client';
import { message } from 'antd';
import { ClientCouponsEnum } from './types';

export const getClientCouponsStarted = () => action(ClientCouponsEnum.GET_CLIENT_COUPONS, {});
export const getClientCouponsSuccess = (res: ClientCouponsResponeType) =>
    action(ClientCouponsEnum.GET_CLIENT_COUPONS_SUCCESS, res);
export const getClientCouponsError = (error: ErrorType) => action(ClientCouponsEnum.GET_CLIENT_COUPONS_ERROR, error);

export const getClientCoupons = (data: {
    group_id: string;
    store_id: string;
    list_products: {
        product_id: string;
        name: string;
        logo: string;
        quantity: number;
        price: number;
        note?: string;
    }[];
    total: number;
    platform: string;
}) => async (dispatch: Dispatch) => {
    try {
        dispatch(getClientCouponsStarted());

        const res = await getClientCouponsApi(data);

        dispatch(getClientCouponsSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getClientCouponsError(err));
    }
};
