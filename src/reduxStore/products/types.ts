import { ActionType } from 'typesafe-actions';
import { CategoryResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type PropductsActionType = ActionType<typeof actions>;

export enum PropductsEnum {
    GET_PRODUCT = '@@products/GET_PRODUCT',
    GET_PRODUCT_SUCCESS = '@@products/GET_CATEGORY_SUCCESS',
    GET_PRODUCT_ERROR = '@@products/GET_CATEGORY_ERROR',
}

export interface PropductsType {
    result: CategoryResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
