import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CreateGroupStoreResponeType, ErrorType } from 'api/types';
import { getGroupStoresApi } from 'api/store';
import { message } from 'antd';
import { GroupStoresEnum } from './types';

export const getGroupStoresStarted = () => action(GroupStoresEnum.GET_GROUP_STORES, {});
export const getGroupStoresSuccess = (res: CreateGroupStoreResponeType) =>
    action(GroupStoresEnum.GET_GROUP_STORES_SUCCESS, res);
export const getGroupStoresError = (error: ErrorType) => action(GroupStoresEnum.GET_GROUP_STORES_ERROR, error);

export const getGroupStores = (token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getGroupStoresStarted());

        const res: CreateGroupStoreResponeType = await getGroupStoresApi(token);

        dispatch(getGroupStoresSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getGroupStoresError(err));
    }
};
