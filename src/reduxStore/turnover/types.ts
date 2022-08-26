import { ActionType } from 'typesafe-actions';
import { ErrorType, ExistingRevenueResponeType } from 'api/types';
import * as actions from './actions';

export type TurnoverActionType = ActionType<typeof actions>;

export enum TurnoverEnum {
    GET_TURNOVER = '@@turnover/GET_TURNOVER',
    GET_TURNOVER_SUCCESS = '@@turnover/GET_TURNOVER_SUCCESS',
    GET_TURNOVER_ERROR = '@@turnover/GET_TURNOVER_ERROR',
}

export interface TurnoverType {
    result: ExistingRevenueResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
