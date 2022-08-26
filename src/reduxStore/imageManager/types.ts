import { ActionType } from 'typesafe-actions';
import { ImageManagerResponeType, ErrorType } from 'api/types';
import * as actions from './actions';

export type ImageManagerActionType = ActionType<typeof actions>;

export enum ImageManagerEnum {
    GET_IMAGES = '@@imageManager/GET_IMAGES',
    GET_IMAGES_SUCCESS = '@@imageManager/GET_IMAGES_SUCCESS',
    GET_IMAGES_ERROR = '@@imageManager/GET_IMAGES_ERROR',
}

export interface ImageManagerType {
    result: ImageManagerResponeType;
    readonly loading: boolean;
    error: ErrorType;
}
