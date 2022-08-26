import { ActionType } from 'typesafe-actions';
import { AllOrdersResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type AllOrdersActionType = ActionType<typeof actions>;

export enum AllOrdersEnum {
    GET_ALL_ORDERS = '@@allOrders/GET_ALL_ORDERS',
    GET_ALL_ORDERS_SUCCESS = '@@allOrders/GET_ALL_ORDERS_SUCCESS',
    GET_ALL_ORDERS_ERROR = '@@allOrders/GET_ALL_ORDERS_ERROR',
}

export interface AllOrdersType {
    result: AllOrdersResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
