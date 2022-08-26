import api from './index';
import { LoginType, AdminUsersDataType, AdminInfoResponeType, ResetPasswordType } from './types';

export const loginApi = (data: LoginType) => {
    return api.callApi({ endpoint: `api/admin/login`, method: 'POST', data });
};

export const getAdminUsersApi = (group_id: string, token: string) => {
    return api.callApi({ endpoint: `api/admin?group_id=${group_id}`, method: 'GET', token });
};

export const createAdminUserApi = (data: AdminUsersDataType) => {
    return api.callApi({ endpoint: `api/admin/create`, method: 'POST', data });
};

export const updateAdminUserApi = (data: AdminUsersDataType, adminUserId: string) => {
    return api.callApi({ endpoint: `api/admin/${adminUserId}`, method: 'PUT', data });
};

export const deleteAdminUserApi = (group_id: string, adminUserId: string) => {
    return api.callApi({ endpoint: `api/admin/${adminUserId}`, method: 'DELETE', data: { group_id } });
};

export const getAdminInfoApi = (adminId: string, token = ''): Promise<AdminInfoResponeType> => {
    return api.callApi({ endpoint: `api/admin/${adminId}`, method: 'GET', token });
};

export const logoutApi = (data: { admin_id: string }) => {
    return api.callApi({ endpoint: `api/admin/logout`, method: 'POST', data });
};

export const requestChangePasswordApi = (data: ResetPasswordType) => {
    return api.callApi({ endpoint: `api/admin/request/reset/password`, method: 'POST', data });
};

export const changePasswordApi = (data: ResetPasswordType, token: string) => {
    return api.callApi({
        endpoint: `api/admin/new/reset/password`,
        method: 'POST',
        data,
        token,
    });
};

export const changePassword = (data: ResetPasswordType, adminId: string) => {
    return api.callApi({ endpoint: `api/admin/change/password/${adminId}`, method: 'PUT', data });
};
