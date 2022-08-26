import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CouponsResponeType, ErrorType } from 'api/types';
import { getCouponsApi } from 'api/store';
import { message } from 'antd';
import { CouponsEnum } from './types';

export const getCouponsStarted = () => action(CouponsEnum.GET_COUPONS, {});
export const getCouponsSuccess = (res: CouponsResponeType) => action(CouponsEnum.GET_COUPONS_SUCCESS, res);
export const getCouponsError = (error: ErrorType) => action(CouponsEnum.GET_COUPONS_ERROR, error);

export const getCoupons = (
    data: {
        group_id: string;
        store_id: string;
        offset?: number;
        code?: string;
        discount_type?: string;
        platform?: string;
    },
    token?: string,
) => async (dispatch: Dispatch) => {
    try {
        dispatch(getCouponsStarted());

        const res = await getCouponsApi(data, token);

        dispatch(getCouponsSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getCouponsError(err));
    }
};
