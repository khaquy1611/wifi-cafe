import { CategoryActionType, CategoryEnum, CategoryType } from './types';

const initialState: CategoryType = {
    result: {},
    loading: false,
    error: {},
};

function CategoryReducer(state = initialState, action: CategoryActionType) {
    const { type, payload } = action;
    switch (type) {
        case CategoryEnum.GET_CATEGORY: {
            return { ...state, loading: true };
        }
        case CategoryEnum.GET_CATEGORY_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case CategoryEnum.GET_CATEGORY_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default CategoryReducer;
