import { ActionType } from 'typesafe-actions';
import { CreateGroupStoreResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type GroupShopsAllActionType = ActionType<typeof actions>;

export enum GroupShopsEnum {
    GET_GROUP_SHOPS = '@@groupShops/GET_GROUP_SHOPS',
    GET_GROUP_SHOPS_SUCCESS = '@@groupShops/GET_GROUP_SHOPS_SUCCESS',
    GET_GROUP_SHOPS_ERROR = '@@groupShops/GET_GROUP_SHOPS_ERROR',
}

export interface GroupShopsType {
    result: CreateGroupStoreResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
