import api from './index';
import { AddReceiptType } from './types';

export const listReceiptType = ({ type, group_id, store_id }: { type: string; group_id: string; store_id: string }) => {
    return api.callApi({ endpoint: `api/receipt-type`, method: 'GET', params: { type, group_id, store_id } });
};

export const addReceipt = (data: AddReceiptType) => {
    return api.callApi({ endpoint: `api/receipt`, method: 'POST', data });
};
