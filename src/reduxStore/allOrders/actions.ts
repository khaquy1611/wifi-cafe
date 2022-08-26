import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { AllOrdersResponeType, ErrorType } from 'api/types';
import { getAllOrdersApi } from 'api/store';
import { message } from 'antd';
import { AllOrdersEnum } from './types';

export const getAllOrdersStarted = () => action(AllOrdersEnum.GET_ALL_ORDERS, {});
export const getAllOrdersSuccess = (res: AllOrdersResponeType) => action(AllOrdersEnum.GET_ALL_ORDERS_SUCCESS, res);
export const getAllOrdersError = (error: ErrorType) => action(AllOrdersEnum.GET_ALL_ORDERS_ERROR, error);

export const getAllOrders = (
    data: {
        group_id: string;
        store_id: string;
        payment_method?: string;
        status_order?: string;
        status?: string;
        offset?: string;
        start?: string;
        end?: string;
        id?: string;
        orderId?: string;
        customer_id?: string;
        discount_id?: string;
        order_closing?: string;
    },
    token?: string,
) => async (dispatch: Dispatch) => {
    try {
        dispatch(getAllOrdersStarted());

        const res: AllOrdersResponeType = await getAllOrdersApi(data, token);

        dispatch(getAllOrdersSuccess(res));
    } catch (err) {
        message.error((err as Error).message);
        dispatch(getAllOrdersError(err as Error));
    }
};
