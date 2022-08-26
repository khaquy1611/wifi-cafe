import { ActionType } from 'typesafe-actions';
import { CategoryResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type CategoryActionType = ActionType<typeof actions>;

export enum CategoryEnum {
    GET_CATEGORY = '@@category/GET_CATEGORY',
    GET_CATEGORY_SUCCESS = '@@category/GET_CATEGORY_SUCCESS',
    GET_CATEGORY_ERROR = '@@category/GET_CATEGORY_ERROR',
}

export interface CategoryType {
    result: CategoryResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
