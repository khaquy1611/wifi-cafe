import { ActionType } from 'typesafe-actions';
import { ActionLogResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type WithdrawalHistoryActionType = ActionType<typeof actions>;

export enum WithdrawalHistoryEnum {
    GET_WITHDRAWAL_HISTORY = '@@withdrawalHistory/GET_WITHDRAWAL_HISTORY',
    GET_WITHDRAWAL_HISTORY_SUCCESS = '@@withdrawalHistory/GET_WITHDRAWAL_HISTORY_SUCCESS',
    GET_WITHDRAWAL_HISTORY_ERROR = '@@withdrawalHistory/GET_WITHDRAWAL_HISTORY_ERROR',
}

export interface WithdrawalHistoryType {
    result: ActionLogResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
