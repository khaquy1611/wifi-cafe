import { ActionType } from 'typesafe-actions';
import { PaymentMethodResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type PaymentMethodsActionType = ActionType<typeof actions>;

export enum PaymentMethodsEnum {
    GET_PAYMENT_METHODS = '@@paymentMethods/GET_PAYMENT_METHODS',
    GET_PAYMENT_METHODS_SUCCESS = '@@paymentMethods/GET_PAYMENT_METHODS_SUCCESS',
    GET_PAYMENT_METHODS_ERROR = '@@paymentMethods/GET_PAYMENT_METHODS_ERROR',
}

export interface PaymentMethodsType {
    result: PaymentMethodResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
