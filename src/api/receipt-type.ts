import api from './index';
import { ReceiptTypeType } from './types';

export const getReceiptTypeApi = (params: ReceiptTypeType) => {
    return api.callApi({
        endpoint: `api/receipt-type`,
        method: 'GET',
        params,
    });
};
export const createReceiptTypeApi = (data: ReceiptTypeType) => {
    return api.callApi({ endpoint: `api/receipt-type`, method: 'POST', data });
};
