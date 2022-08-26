import { ActionType } from 'typesafe-actions';
import { CouponsResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type CouponsActionType = ActionType<typeof actions>;

export enum CouponsEnum {
    GET_COUPONS = '@@coupons/GET_COUPONS',
    GET_COUPONS_SUCCESS = '@@coupons/GET_COUPONS_SUCCESS',
    GET_COUPONS_ERROR = '@@coupons/GET_COUPONS_ERROR',
}

export interface CouponsType {
    result: CouponsResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
