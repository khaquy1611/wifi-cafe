import { ActionType } from 'typesafe-actions';
import { OrdersResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type OrdersActionType = ActionType<typeof actions>;

export enum OrdersEnum {
    GET_ORDERS = '@@orders/GET_ORDERS',
    GET_ORDERS_SUCCESS = '@@orders/GET_ORDERS_SUCCESS',
    GET_ORDERS_ERROR = '@@orders/GET_ORDERS_ERROR',
}

export interface OrdersType {
    result: OrdersResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
