import { ImageManagerActionType, ImageManagerEnum, ImageManagerType } from './types';

const initialState: ImageManagerType = {
    result: {},
    loading: false,
    error: {},
};

function ImageManagerReducer(state = initialState, action: ImageManagerActionType) {
    const { type, payload } = action;
    switch (type) {
        case ImageManagerEnum.GET_IMAGES: {
            return { ...state, loading: true };
        }
        case ImageManagerEnum.GET_IMAGES_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case ImageManagerEnum.GET_IMAGES_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default ImageManagerReducer;
