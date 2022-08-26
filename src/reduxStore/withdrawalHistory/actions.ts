import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ActionLogResponeType, ErrorType } from 'api/types';
import { getActionLogApi } from 'api/store';
import { message } from 'antd';
import { WithdrawalHistoryEnum } from './types';

export const getWithdrawalHistoryStarted = () => action(WithdrawalHistoryEnum.GET_WITHDRAWAL_HISTORY, {});
export const getWithdrawalHistorySuccess = (res: ActionLogResponeType) =>
    action(WithdrawalHistoryEnum.GET_WITHDRAWAL_HISTORY_SUCCESS, res);
export const getWithdrawalHistoryError = (error: ErrorType) =>
    action(WithdrawalHistoryEnum.GET_WITHDRAWAL_HISTORY_ERROR, error);

export const getWithdrawalHistory = (
    data: { group_id: string; store_id: string; offset?: string; key: string; user_id?: string },
    token = '',
) => async (dispatch: Dispatch) => {
    try {
        dispatch(getWithdrawalHistoryStarted());

        const res: ActionLogResponeType = await getActionLogApi(data, token);

        dispatch(getWithdrawalHistorySuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getWithdrawalHistoryError(err));
    }
};
