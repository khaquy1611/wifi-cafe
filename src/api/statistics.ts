import api from './index';
import { GetStatOrderRequestDataType, GetStatOrderResponeType } from './types';

export const getStatOrderOverview: (
    data: GetStatOrderRequestDataType,
    url?: string,
    token?: string,
) => Promise<GetStatOrderResponeType> = (data: any, url = '') => {
    const params = Object.keys(data)
        .map((k) => {
            return `${k}=${data[k]}`;
        })
        .join('&');
    return api.callApi({
        endpoint: `api/stat/order/overview/${url}?${params}`,
        method: 'GET',
    });
};

export const getStatOrderProduct: (
    data: GetStatOrderRequestDataType,
    token?: string,
) => Promise<GetStatOrderResponeType> = ({ group_id, store_id, start, end }, token = '') => {
    return api.callApi({
        endpoint: `api/stat/order/product?group_id=${group_id}&store_id=${store_id}&start=${start}&end=${end}`,
        method: 'GET',
        token,
    });
};

export const getStatOrderType: (
    data: GetStatOrderRequestDataType,
    token?: string,
) => Promise<GetStatOrderResponeType> = ({ group_id, store_id, type, start, end }, token = '') => {
    return api.callApi({
        endpoint: `api/stat/order/type?group_id=${group_id}&store_id=${store_id}&type=${type}&start=${start}&end=${end}`,
        method: 'GET',
        token,
    });
};

export const getStatOrderToday: (
    data: GetStatOrderRequestDataType,
    token?: string,
) => Promise<GetStatOrderResponeType> = ({ group_id, store_id, status }, token = '') => {
    return api.callApi({
        endpoint: `api/stat/order/today?group_id=${group_id}&store_id=${store_id}${status ? `&status=${status}` : ''}`,
        method: 'GET',
        token,
    });
};

export const getStatOrderCustomer: (
    data: GetStatOrderRequestDataType,
    token?: string,
) => Promise<GetStatOrderResponeType> = ({ group_id, store_id, start, end }, token = '') => {
    return api.callApi({
        endpoint: `api/stat/order/customer?group_id=${group_id}&store_id=${store_id}&start=${start}&end=${end}`,
        method: 'GET',
        token,
    });
};

export const getAdminRevenueOverviewApi: (
    data: GetStatOrderRequestDataType,
    token?: string,
) => Promise<GetStatOrderResponeType> = ({ group_id, store_id, start, end }, token = '') => {
    return api.callApi({
        endpoint: `api/stat/order/user?group_id=${group_id}&store_id=${store_id}&start=${start}&end=${end}`,
        method: 'GET',
        token,
    });
};
