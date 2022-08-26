import { ActionType } from 'typesafe-actions';
import { ClientCouponsResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ClientCouponsActionType = ActionType<typeof actions>;

export enum ClientCouponsEnum {
    GET_CLIENT_COUPONS = '@@clientCoupons/GET_CLIENT_COUPONS',
    GET_CLIENT_COUPONS_SUCCESS = '@@clientCoupons/GET_CLIENT_COUPONS_SUCCESS',
    GET_CLIENT_COUPONS_ERROR = '@@clientCoupons/GET_CLIENT_COUPONS_ERROR',
}

export interface ClientCouponsType {
    result: ClientCouponsResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
