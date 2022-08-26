import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CustomerResponeType, ErrorType } from 'api/types';
import { getCustomerApi } from 'api/store';
import { message } from 'antd';
import { CustomerEnum } from './types';

export const getCustomerStarted = () => action(CustomerEnum.GET_CUSTOMER, {});
export const getCustomerSuccess = (res: CustomerResponeType) => action(CustomerEnum.GET_CUSTOMER_SUCCESS, res);
export const getCustomerError = (error: ErrorType) => action(CustomerEnum.GET_CUSTOMER_ERROR, error);

export const getCustomer = (
    data: {
        group_id: string;
        store_id: string;
        offset?: number;
        phone_number?: string;
    },
    token?: string,
) => async (dispatch: Dispatch) => {
    try {
        dispatch(getCustomerStarted());

        const res = await getCustomerApi(data, token);

        dispatch(getCustomerSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getCustomerError(err));
    }
};
