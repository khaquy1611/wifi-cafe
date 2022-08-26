import { ActionType } from 'typesafe-actions';
import { ActionLogResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ActionLogActionType = ActionType<typeof actions>;

export enum ActionLogEnum {
    GET_ACTION_LOG = '@@actionLog/GET_ACTION_LOG',
    GET_ACTION_LOG_SUCCESS = '@@actionLog/GET_ACTION_LOG_SUCCESS',
    GET_ACTION_LOG_ERROR = '@@actionLog/GET_ACTION_LOG_ERROR',
}

export interface ActionLogType {
    result: ActionLogResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
