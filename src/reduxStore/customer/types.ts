import { ActionType } from 'typesafe-actions';
import { CustomerResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type CustomerActionType = ActionType<typeof actions>;

export enum CustomerEnum {
    GET_CUSTOMER = '@@customer/GET_CUSTOMER',
    GET_CUSTOMER_SUCCESS = '@@customer/GET_CUSTOMER_SUCCESS',
    GET_CUSTOMER_ERROR = '@@customer/GET_CUSTOMER_ERROR',
}

export interface CustomerType {
    result: CustomerResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
