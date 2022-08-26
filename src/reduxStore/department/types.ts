import { ActionType } from 'typesafe-actions';
import { DepartmentResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type DepartmentActionType = ActionType<typeof actions>;

export enum DepartmentEnum {
    GET_DEPARTMENT = '@@department/GET_DEPARTMENT',
    GET_DEPARTMENT_SUCCESS = '@@department/GET_DEPARTMENT_SUCCESS',
    GET_DEPARTMENT_ERROR = '@@department/GET_DEPARTMENT_ERROR',
}

export interface DepartmentType {
    result: DepartmentResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
