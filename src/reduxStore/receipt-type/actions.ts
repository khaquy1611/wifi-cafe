import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ReceiptResponeType, ErrorType, ReceiptTypeType } from 'api/types';
import { getReceiptTypeApi } from 'api/store';
import { message } from 'antd';
import { ReceiptEnum } from './types';

export const getReceiptStarted = () => action(ReceiptEnum.GET_RECEIPT, {});
export const getReceiptSuccess = (res: ReceiptResponeType) => action(ReceiptEnum.GET_RECEIPT_SUCCESS, res);
export const getReceiptError = (error: ErrorType) => action(ReceiptEnum.GET_RECEIPT_ERROR, error);

export const getReceipt = (params: ReceiptTypeType) => async (dispatch: Dispatch) => {
    try {
        dispatch(getReceiptStarted());

        const res: ReceiptResponeType = await getReceiptTypeApi(params);

        dispatch(getReceiptSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getReceiptError(err));
    }
};
