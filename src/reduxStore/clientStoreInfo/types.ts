import { ActionType } from 'typesafe-actions';
import { ClientStoreInfoResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ClientStoreInfoActionType = ActionType<typeof actions>;

export enum ClientStoreInfoEnum {
    GET_CLIENT_STORE_INFO = '@@clientStoreInfo/GET_CLIENT_STORE_INFO',
    GET_CLIENT_STORE_INFO_SUCCESS = '@@clientStoreInfo/GET_CLIENT_STORE_INFO_SUCCESS',
    GET_CLIENT_STORE_INFO_ERROR = '@@clientStoreInfo/GET_CLIENT_STORE_INFO_ERROR',
}

export interface ClientStoreInfoType {
    result: ClientStoreInfoResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
