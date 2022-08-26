import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ErrorType, ExistingRevenueResponeType } from 'api/types';
import { getExistingRevenueApi } from 'api/store';
import { message } from 'antd';
import { TurnoverEnum } from './types';

export const getTurnoverStarted = () => action(TurnoverEnum.GET_TURNOVER, {});
export const getTurnoverSuccess = (res: ExistingRevenueResponeType) => action(TurnoverEnum.GET_TURNOVER_SUCCESS, res);
export const getTurnoverError = (error: ErrorType) => action(TurnoverEnum.GET_TURNOVER_ERROR, error);

export const getTurnover = (
    data: {
        group_id: string;
        store_id: string;
    },
    token?: string,
) => async (dispatch: Dispatch) => {
    try {
        dispatch(getTurnoverStarted());

        const res = await getExistingRevenueApi(data, token);

        dispatch(getTurnoverSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getTurnoverError(err));
    }
};
