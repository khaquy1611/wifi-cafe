import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { ImageManagerResponeType, ErrorType } from 'api/types';
import { getImageManagerApi } from 'api/store';
import { message } from 'antd';
import { ImageManagerEnum } from './types';

export const getImageManagerStarted = () => action(ImageManagerEnum.GET_IMAGES, {});
export const getImageManagerSuccess = (res: ImageManagerResponeType) =>
    action(ImageManagerEnum.GET_IMAGES_SUCCESS, res);
export const getImageManagerError = (error: ErrorType) => action(ImageManagerEnum.GET_IMAGES_ERROR, error);

export const getImageManager = (data: { group_id: string; store_id: string; offset: number }, token = '') => async (
    dispatch: Dispatch,
) => {
    try {
        dispatch(getImageManagerStarted());

        const res: ImageManagerResponeType = await getImageManagerApi(data, token);

        dispatch(getImageManagerSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getImageManagerError(err));
    }
};
