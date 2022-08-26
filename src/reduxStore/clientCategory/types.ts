import { ActionType } from 'typesafe-actions';
import { CategoryResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ClientCategoryActionType = ActionType<typeof actions>;

export enum ClientCategoryEnum {
    GET_CLIENT_CATEGORY = '@@clientCategory/GET_CLIENT_CATEGORY',
    GET_CLIENT_CATEGORY_SUCCESS = '@@clientCategory/GET_CLIENT_CATEGORY_SUCCESS',
    GET_CLIENT_CATEGORY_ERROR = '@@clientCategory/GET_CLIENT_CATEGORY_ERROR',
}

export interface ClientCategoryType {
    result: CategoryResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
