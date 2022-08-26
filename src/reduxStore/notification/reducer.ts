import { NotificationActionType, NotificationEnum, NotificationType } from './types';

const initialState: NotificationType = {
    result: {},
    loading: false,
    error: {},
};

function NotificationReducer(state = initialState, action: NotificationActionType) {
    const { type, payload } = action;
    switch (type) {
        case NotificationEnum.GET_NOTIFICATION: {
            return { ...state, loading: true };
        }
        case NotificationEnum.GET_NOTIFICATION_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case NotificationEnum.GET_NOTIFICATION_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default NotificationReducer;
