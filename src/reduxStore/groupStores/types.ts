import { ActionType } from 'typesafe-actions';
import { CreateGroupStoreResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type GroupStoresActionType = ActionType<typeof actions>;

export enum GroupStoresEnum {
    GET_GROUP_STORES = '@@groupStores/GET_GROUP_STORES',
    GET_GROUP_STORES_SUCCESS = '@@groupStores/GET_GROUP_STORES_SUCCESS',
    GET_GROUP_STORES_ERROR = '@@groupStores/GET_GROUP_STORES_ERROR',
}

export interface GroupStoresType {
    result: CreateGroupStoreResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
