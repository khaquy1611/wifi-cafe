import { IngredientActionType, IngredientEnum } from './types';

const initialState = {
    result: {},
    loading: false,
    error: {},
};

function IngredientReducer(state = initialState, action: IngredientActionType) {
    const { type, payload } = action;
    switch (type) {
        case IngredientEnum.GET_INGREDIENT:
            return { ...state, loading: true };
        case IngredientEnum.GET_INGREDIENT_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case IngredientEnum.GET_INGREDIENT_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default IngredientReducer;
