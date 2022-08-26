import { ActionType } from 'typesafe-actions';
import { AdminUsersResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type AdminUsersActionType = ActionType<typeof actions>;

export enum AdminUsersEnum {
    GET_ADMIN_USERS = '@@adminUsers/GET_ADMIN_USERS',
    GET_ADMIN_USERS_SUCCESS = '@@adminUsers/GET_ADMIN_USERS_SUCCESS',
    GET_ADMIN_USERS_ERROR = '@@adminUsers/GET_ADMIN_USERS_ERROR',
}

export interface AdminUsersType {
    result: AdminUsersResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
