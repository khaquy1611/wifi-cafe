import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CategoryResponeType, ErrorType } from 'api/types';
import { getCategoryApi } from 'api/store';
import { message } from 'antd';
import { CategoryEnum } from './types';

export const getCategoryStarted = () => action(CategoryEnum.GET_CATEGORY, {});
export const getCategorySuccess = (res: CategoryResponeType) => action(CategoryEnum.GET_CATEGORY_SUCCESS, res);
export const getCategoryError = (error: ErrorType) => action(CategoryEnum.GET_CATEGORY_ERROR, error);

export const getCategory = (group_id: string, store_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getCategoryStarted());

        const res: CategoryResponeType = await getCategoryApi(group_id, store_id, token);

        dispatch(getCategorySuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getCategoryError(err));
    }
};
