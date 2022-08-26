import { ActionType } from 'typesafe-actions';
import { AdminInfoResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type LoginAllActionType = ActionType<typeof actions>;

export enum LoginEnum {
    LOGIN = '@@login/LOGIN',
    LOGIN_SUCCESS = '@@login/LOGIN_SUCCESS',
    LOGIN_ERROR = '@@login/LOGIN_ERROR',
}

export interface LoginType {
    result: AdminInfoResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
