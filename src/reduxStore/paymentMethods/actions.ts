import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { PaymentMethodResponeType, ErrorType } from 'api/types';
import { getPaymentMethodsApi } from 'api/store';
import { message } from 'antd';
import { PaymentMethodsEnum } from './types';

export const getPaymentMethodsStarted = () => action(PaymentMethodsEnum.GET_PAYMENT_METHODS, {});
export const getPaymentMethodsSuccess = (res: PaymentMethodResponeType) =>
    action(PaymentMethodsEnum.GET_PAYMENT_METHODS_SUCCESS, res);
export const getPaymentMethodsError = (error: ErrorType) => action(PaymentMethodsEnum.GET_PAYMENT_METHODS_ERROR, error);

export const getPaymentMethods = (group_id: string, store_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getPaymentMethodsStarted());

        const res: PaymentMethodResponeType = await getPaymentMethodsApi(group_id, store_id, token);

        dispatch(getPaymentMethodsSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getPaymentMethodsError(err));
    }
};
