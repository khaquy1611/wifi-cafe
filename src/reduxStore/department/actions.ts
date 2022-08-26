import { action } from 'typesafe-actions';
import { Dispatch } from 'redux';
import { DepartmentResponeType, ErrorType } from 'api/types';
import { getDepartmentApi } from 'api/store';
import { message } from 'antd';
import { DepartmentEnum } from './types';

export const getDepartmentStarted = () => action(DepartmentEnum.GET_DEPARTMENT, {});
export const getDepartmentSuccess = (res: DepartmentResponeType) => action(DepartmentEnum.GET_DEPARTMENT_SUCCESS, res);
export const getDepartmentError = (error: ErrorType) => action(DepartmentEnum.GET_DEPARTMENT_ERROR, error);

export const getDepartment = (group_id: string, store_id: string, token = '') => async (dispatch: Dispatch) => {
    try {
        dispatch(getDepartmentStarted());

        const res: DepartmentResponeType = await getDepartmentApi(group_id, store_id, token);

        dispatch(getDepartmentSuccess(res));
    } catch (err) {
        message.error(err.message);
        dispatch(getDepartmentError(err));
    }
};
