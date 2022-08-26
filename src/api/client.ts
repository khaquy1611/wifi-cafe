import { CreateProductsOrderType, OrderUpdateType, ClientCouponsResponeType } from 'api/types';
import api from './index';

export const getClientCategoryApi = (qrCode: string) => {
    return api.callApi({ endpoint: `api/client/category/products?q=${qrCode}`, method: 'GET' });
};

export const getClientProductsApi = (qrCode: string) => {
    return api.callApi({ endpoint: `api/client/products?q=${qrCode}`, method: 'GET' });
};

export const getClientStoreInfoApi = (qrCode: string) => {
    return api.callApi({ endpoint: `api/client/store/info?q=${qrCode}`, method: 'GET' });
};

export const createProductsOrderApi = (data: CreateProductsOrderType) => {
    return api.callApi({ endpoint: `api/orders/create`, method: 'POST', data });
};

export const createProductsOrderByAdminApi = (data: CreateProductsOrderType) => {
    return api.callApi({ endpoint: `api/orders/create/by/admin`, method: 'POST', data });
};

export const updateProductsOrderApi = (data: OrderUpdateType, orderId: string) => {
    return api.callApi({ endpoint: `api/orders/${orderId}`, method: 'PUT', data });
};

export const pushNotifyUserApi = (data: any) => {
    return api.callApi({ endpoint: `api/push/notify/user`, method: 'POST', data });
};

export const getClientCouponsApi = (data: {
    group_id: string;
    store_id: string;
    list_products: {
        product_id: string;
        name: string;
        logo: string;
        quantity: number;
        price: number;
        note?: string;
    }[];
    total: number;
    platform: string;
}): Promise<ClientCouponsResponeType> => {
    return api.callApi({ endpoint: `api/coupons/guest/list`, method: 'POST', data });
};
