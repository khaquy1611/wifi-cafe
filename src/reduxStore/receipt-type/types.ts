import { ActionType } from 'typesafe-actions';
import { ReceiptResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ReceiptActionType = ActionType<typeof actions>;

export enum ReceiptEnum {
    GET_RECEIPT = '@@receipt/GET_RECEIPT',
    GET_RECEIPT_SUCCESS = '@@receipt/GET_RECEIPT_SUCCESS',
    GET_RECEIPT_ERROR = '@@receipt/GET_RECEIPT_ERROR',
}

export interface ReceiptType {
    result: ReceiptResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
