import { ImportListIngredientReq, IngredientType, UpdateIngredientType } from './types';
import api from './index';

export const createInventoryApi = (data: IngredientType) => {
    return api.callApi({ endpoint: `api/ware-house`, method: 'POST', data });
};

export const getInventoryApi = (params: any) => {
    return api.callApi({
        endpoint: `api/ware-house`,
        method: 'GET',
        params,
    });
};

export const updateInventoryApi = (id: string, data: UpdateIngredientType) => {
    return api.callApi({
        endpoint: `api/ware-house/${id}`,
        method: 'PUT',
        data,
    });
};

export const deleteInventoryApi = (
    id: string,
    data: {
        group_id: string;
        store_id: string;
    },
) => {
    return api.callApi({
        endpoint: `api/ware-house/${id}`,
        method: 'DELETE',
        data,
    });
};

export const imPortInventory = (data: ImportListIngredientReq) => {
    return api.callApi({ endpoint: `api/ware-house/import`, method: 'POST', data });
};
