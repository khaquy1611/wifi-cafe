import { DepartmentActionType, DepartmentEnum, DepartmentType } from './types';

const initialState: DepartmentType = {
    result: {},
    loading: false,
    error: {},
};

function DepartmentReducer(state = initialState, action: DepartmentActionType) {
    const { type, payload } = action;
    switch (type) {
        case DepartmentEnum.GET_DEPARTMENT: {
            return { ...state, loading: true };
        }
        case DepartmentEnum.GET_DEPARTMENT_SUCCESS:
            return { ...state, loading: false, result: payload, error: {} };
        case DepartmentEnum.GET_DEPARTMENT_ERROR:
            return { ...state, loading: false, result: {}, error: payload };
        default:
            return state;
    }
}

export default DepartmentReducer;
