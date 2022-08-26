import { ErrorType } from 'api/types';
import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type IngredientActionType = ActionType<typeof actions>;

export enum IngredientEnum {
    GET_INGREDIENT = '@@ingredient/GET_INGREDIENT',
    GET_INGREDIENT_SUCCESS = '@@allOrders/GET_INGREDIENT_SUCCESS',
    GET_INGREDIENT_ERROR = '@@allOrders/GET_INGREDIENT_ERROR',
    GET_PRODUCT = '@@ingredient/GET_PRODUCT',
    GET_PRODUCT_SUCCESS = '@@allOrders/GET_PRODUCT_SUCCESS',
    GET_PRODUCT_ERROR = '@@allOrders/GET_PRODUCT_ERROR',
}

export interface IngreType {
    result: any;
    readonly loading: boolean;
    error: ErrorType;
}
