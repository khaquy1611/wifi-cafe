import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { OrdersResponeType, ErrorType } from 'api/types';
import { getOrdersApi } from 'api/store';
import { message } from 'antd';
import { OrdersEnum } from './types';

export const getOrdersStarted = () => action(OrdersEnum.GET_ORDERS, {});
export const getOrdersSuccess = (res: OrdersResponeType) => action(OrdersEnum.GET_ORDERS_SUCCESS, res);
export const getOrdersError = (error: ErrorType) => action(OrdersEnum.GET_ORDERS_ERROR, error);

export const getOrders = (group_id: string, store_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getOrdersStarted());

        const res: OrdersResponeType = await getOrdersApi(group_id, store_id, token);

        dispatch(getOrdersSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getOrdersError(err));
    }
};
