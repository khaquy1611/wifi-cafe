import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { CreateGroupStoreResponeType, ErrorType } from 'api/types';
import { getGroupShopsApi } from 'api/store';
import { message } from 'antd';
import { GroupShopsEnum } from './types';

export const getGroupShopsStarted = () => action(GroupShopsEnum.GET_GROUP_SHOPS, {});
export const getGroupShopsSuccess = (res: CreateGroupStoreResponeType) =>
    action(GroupShopsEnum.GET_GROUP_SHOPS_SUCCESS, res);
export const getGroupShopsError = (error: ErrorType) => action(GroupShopsEnum.GET_GROUP_SHOPS_ERROR, error);

export const getGroupShops = (group_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getGroupShopsStarted());

        const res: CreateGroupStoreResponeType = await getGroupShopsApi(group_id, token);

        dispatch(getGroupShopsSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getGroupShopsError(err));
    }
};
