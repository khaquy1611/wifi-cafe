import { ActionType } from 'typesafe-actions';
import { NotificationResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type NotificationActionType = ActionType<typeof actions>;

export enum NotificationEnum {
    GET_NOTIFICATION = '@@notification/GET_NOTIFICATION',
    GET_NOTIFICATION_SUCCESS = '@@notification/GET_NOTIFICATION_SUCCESS',
    GET_NOTIFICATION_ERROR = '@@notification/GET_NOTIFICATION_ERROR',
}

export interface NotificationType {
    result: NotificationResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
