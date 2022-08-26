import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CategoryResponeType, ErrorType } from 'api/types';
import { getProductsApi } from 'api/store';
import { message } from 'antd';
import { PropductsEnum } from './types';

export const getProductsStarted = () => action(PropductsEnum.GET_PRODUCT, {});
export const getProductsSuccess = (res: CategoryResponeType) => action(PropductsEnum.GET_PRODUCT_SUCCESS, res);
export const getProductsError = (error: ErrorType) => action(PropductsEnum.GET_PRODUCT_ERROR, error);

export const getProducts = (group_id: string, store_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getProductsStarted());

        const res: CategoryResponeType = await getProductsApi(group_id, store_id, token);

        dispatch(getProductsSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getProductsError(err));
    }
};
