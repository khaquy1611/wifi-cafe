import { ActionType } from 'typesafe-actions';
import { CategoryResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ClientProductsActionType = ActionType<typeof actions>;

export enum ClientProductsEnum {
    GET_CLIENT_PRODUCTS = '@@clientProducts/GET_CLIENT_PRODUCTS',
    GET_CLIENT_PRODUCTS_SUCCESS = '@@clientProducts/GET_CLIENT_PRODUCTS_SUCCESS',
    GET_CLIENT_PRODUCTS_ERROR = '@@clientProducts/GET_CLIENT_PRODUCTS_ERROR',
}

export interface ClientProductsType {
    result: CategoryResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
