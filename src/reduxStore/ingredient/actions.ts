import { message } from 'antd';
import { getIngredient } from 'api/store';
import { AllOrdersResponeType, ErrorType, IngredientReqType } from 'api/types';
import { Dispatch } from 'redux';
import { action } from 'typesafe-actions';
import { IngredientEnum } from './types';

export const getIngredientStarted = () => action(IngredientEnum.GET_INGREDIENT, {});
export const getIngredientSuccess = (res: AllOrdersResponeType) => action(IngredientEnum.GET_INGREDIENT_SUCCESS, res);
export const getIngredientError = (error: ErrorType) => action(IngredientEnum.GET_INGREDIENT_ERROR, error);

export const getAllIngredients = (data: IngredientReqType) => async (dispatch: Dispatch) => {
    try {
        dispatch(getIngredientStarted());

        const res: AllOrdersResponeType = await getIngredient(data);

        dispatch(getIngredientSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getIngredientError(err));
    }
};
