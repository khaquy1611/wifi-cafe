import pickBy from 'lodash/pickBy';
import _ from 'lodash';

import api from './index';
import {
    CreateGroupShopType,
    CreateDepartmentType,
    CreateSubDepartmentType,
    CategoryDataType,
    OrderDetailResponeType,
    ChangeOrderStatusType,
    ChangeOrderStatusResponeType,
    ChangeTableStatusType,
    SampleProductsType,
    CustomerResponeType,
    CustomerInfoResponeType,
    ChangeReceivedProductType,
    CouponsResponeType,
    CreateCouponType,
    CheckCouponStatusType,
    CheckCouponStatusResponseType,
    CreateCustomerRequestType,
    ImportListProductType,
    ExistingRevenueResponeType,
    TransferRequestType,
    AccountInformationRequestType,
    WithdrawalResponeType,
    ChangeTablesRequestType,
    PaymentMethodDataType,
    IngredientReqType,
    ReceiptTypeType,
    ReportReqType,
} from './types';

export const getGroupStoresApi = (token: string) => {
    return api.callApi({ endpoint: `api/group/stores`, method: 'GET', token });
};

export const createGroupStore = (data: CreateGroupShopType) => {
    return api.callApi({ endpoint: `api/group/stores/create`, method: 'POST', data });
};

export const updateGroupStore = (data: CreateGroupShopType & { group_id: string }, groupId: string) => {
    return api.callApi({ endpoint: `api/group/stores/${groupId}`, method: 'PUT', data });
};

export const getGroupShopsApi = (group_id: string, token: string) => {
    return api.callApi({ endpoint: `api/stores?group_id=${group_id}`, method: 'GET', token });
};

export const createGroupShop = (data: CreateGroupShopType) => {
    return api.callApi({ endpoint: `api/stores/create`, method: 'POST', data });
};

export const updateGroupShop = (data: CreateGroupShopType, storeId: string) => {
    return api.callApi({ endpoint: `api/stores/${storeId}`, method: 'PUT', data });
};

export const getDepartmentApi = (group_id: string, store_id: string, token: string) => {
    return api.callApi({
        endpoint: `api/stores/department?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const createDepartment = (data: CreateDepartmentType) => {
    return api.callApi({ endpoint: `api/stores/department/create`, method: 'POST', data });
};

export const updateDepartment = (data: CreateDepartmentType, deparmentId: string) => {
    return api.callApi({ endpoint: `api/stores/department/${deparmentId}`, method: 'PUT', data });
};

export const deleteDepartment = (deparmentId: string, group_id: string, store_id: string) => {
    return api.callApi({
        endpoint: `api/stores/department/${deparmentId}`,
        method: 'DELETE',
        data: { group_id, store_id },
    });
};

export const createSubDepartment = (data: CreateSubDepartmentType) => {
    return api.callApi({ endpoint: `api/stores/department/sub/create`, method: 'POST', data });
};

export const updateSubDepartment = (data: CreateSubDepartmentType, subDeparmentId: string) => {
    return api.callApi({ endpoint: `api/stores/department/sub/${subDeparmentId}`, method: 'PUT', data });
};

export const deleteSubDepartment = (subDeparmentId: string, group_id: string, store_id: string) => {
    return api.callApi({
        endpoint: `api/stores/department/sub/${subDeparmentId}`,
        method: 'DELETE',
        data: { group_id, store_id },
    });
};

export const getCategoryApi = (group_id: string, store_id: string, token: string) => {
    return api.callApi({
        endpoint: `api/products/category?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const createCategory = (data: CategoryDataType) => {
    return api.callApi({ endpoint: `api/products/category/create`, method: 'POST', data });
};

export const updateCategory = (data: CategoryDataType, categoryId: string) => {
    return api.callApi({ endpoint: `api/products/category/${categoryId}`, method: 'PUT', data });
};

export const deleteCategory = (categoryId: string, group_id: string, store_id: string) => {
    return api.callApi({
        endpoint: `api/products/category/${categoryId}`,
        method: 'DELETE',
        data: { group_id, store_id },
    });
};

export const getProductsApi = (group_id: string, store_id: string, token: string) => {
    return api.callApi({ endpoint: `api/products?group_id=${group_id}&store_id=${store_id}`, method: 'GET', token });
};

export const createProduct = (data: CategoryDataType) => {
    return api.callApi({ endpoint: `api/products/create`, method: 'POST', data });
};

export const imPortListProduct = (data: ImportListProductType) => {
    return api.callApi({ endpoint: `api/products/import`, method: 'POST', data });
};

export const updateProduct = (data: CategoryDataType, productId: string) => {
    return api.callApi({ endpoint: `api/products/${productId}`, method: 'PUT', data });
};

export const deleteProduct = (productId: string, group_id: string, store_id: string) => {
    return api.callApi({ endpoint: `api/products/${productId}`, method: 'DELETE', data: { group_id, store_id } });
};

export const getImageManagerApi = (data: { group_id: string; store_id: string; offset: number }, token: string) => {
    return api.callApi({
        endpoint: `api/upload/file?group_id=${data.group_id}&store_id=${data.store_id}&offset=${data.offset}`,
        method: 'GET',
        token,
    });
};

export const deleteImage = (imageId: string, group_id: string, store_id: string) => {
    return api.callApi({ endpoint: `api/upload/file/${imageId}`, method: 'DELETE', data: { group_id, store_id } });
};

export const getOrdersApi = (group_id: string, store_id: string, token: string) => {
    return api.callApi({ endpoint: `api/orders?group_id=${group_id}&store_id=${store_id}`, method: 'GET', token });
};

export const getOrderDetailApi = (
    orderId: string,
    group_id: string,
    store_id: string,
    token?: string,
): Promise<OrderDetailResponeType> => {
    return api.callApi({
        endpoint: `api/orders/${orderId}?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const changeOrderStatusApi = (
    data: ChangeOrderStatusType,
    orderId: string,
): Promise<ChangeOrderStatusResponeType> => {
    return api.callApi({ endpoint: `api/orders/${orderId}/status`, method: 'PUT', data });
};

export const getPaymentMethodsApi = (group_id: string, store_id: string, token: string) => {
    return api.callApi({
        endpoint: `api/payment/method?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const updatePaymentMethod = (data: PaymentMethodDataType, paymentMethodId: string) => {
    return api.callApi({ endpoint: `api/payment/method/${paymentMethodId}`, method: 'PUT', data });
};

export const getAllOrdersApi = (data: any, token = '') => {
    const pickData = pickBy(data, _.identity);
    const params = Object.keys(pickData)
        .map((k) => {
            return `${k}=${data[k]}`;
        })
        .join('&');
    return api.callApi({
        endpoint: `api/orders/cms/list?${params}`,
        method: 'GET',
        token,
    });
};

export const getNotificationApi = (group_id: string, store_id: string, token: string) => {
    return api.callApi({ endpoint: `api/log/notify?group_id=${group_id}&store_id=${store_id}`, method: 'GET', token });
};

export const changeTableStatus = (data: ChangeTableStatusType, tableId: string) => {
    return api.callApi({ endpoint: `api/stores/department/sub/${tableId}/status`, method: 'PUT', data });
};

export const getActionLogApi = (
    data: { group_id: string; store_id: string; offset?: string; key?: string; user_id?: string },
    token?: string,
) => {
    const { group_id, store_id, offset = '0', key, user_id } = data;
    return api.callApi({
        endpoint: `api/log/action?group_id=${group_id}&store_id=${store_id}&offset=${offset}${
            key ? `&key=${key}` : ''
        }${user_id ? `&user_id=${user_id}` : ''}`,
        method: 'GET',
        token,
    });
};

export const setSampleProducts = (data: SampleProductsType) => {
    return api.callApi({ endpoint: `api/log/sample/data`, method: 'POST', data });
};

export const readNotify = (data: { store_id: string; group_id: string; notify_id?: string }) => {
    return api.callApi({ endpoint: `api/log/notify/read`, method: 'POST', data });
};

export const getCustomerApi: (
    data: {
        group_id: string;
        store_id: string;
        offset?: number;
        phone_number?: string;
    },
    token?: string,
) => Promise<CustomerResponeType> = ({ group_id, store_id, offset = 0, phone_number }, token = '') => {
    return api.callApi({
        endpoint: `api/customer/list?group_id=${group_id}&store_id=${store_id}&offset=${offset}${
            phone_number ? `&phone_number=${phone_number}` : ''
        }`,
        method: 'GET',
        token,
    });
};

export const getCustomerInfoApi: (
    data: {
        id: string;
        group_id: string;
        store_id: string;
    },
    token?: string,
) => Promise<CustomerInfoResponeType> = ({ id, group_id, store_id }, token = '') => {
    return api.callApi({
        endpoint: `api/customer/info/${id}?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const changeReceivedProduct = (data: ChangeReceivedProductType, productId: string) => {
    return api.callApi({ endpoint: `api/orders/update/quantity/product/${productId}`, method: 'PUT', data });
};

export const getCouponsApi: (data: any, token?: string) => Promise<CouponsResponeType> = (data, token = '') => {
    const pickData = pickBy(data, _.identity);
    const params = Object.keys(pickData)
        .map((k) => {
            return `${k}=${data[k]}`;
        })
        .join('&');
    return api.callApi({
        endpoint: `api/coupons?${params}`,
        method: 'GET',
        token,
    });
};

export const createCoupon = (data: CreateCouponType) => {
    return api.callApi({ endpoint: `api/coupons/create`, method: 'POST', data });
};

export const updateCouponApi = (data: CreateCouponType, couponId: string) => {
    return api.callApi({ endpoint: `api/coupons/${couponId}`, method: 'PUT', data });
};

export const checkCouponStatus = (data: CheckCouponStatusType): Promise<CheckCouponStatusResponseType> => {
    return api.callApi({ endpoint: `api/coupons/guest/check/status`, method: 'POST', data });
};

export const cancelCoupon = (data: {
    group_id: string;
    store_id: string;
    order_id: string;
}): Promise<{ errorCode: number; message: string }> => {
    return api.callApi({ endpoint: `api/coupons/cancel/coupon/order`, method: 'POST', data });
};

export const createCustomerApi = (data: CreateCustomerRequestType) => {
    return api.callApi({ endpoint: `api/customer/create`, method: 'POST', data });
};

export const updateCustomerApi = (data: CreateCustomerRequestType, customerId: string) => {
    return api.callApi({ endpoint: `api/customer/${customerId}`, method: 'PUT', data });
};

export const getWithdrawalHistoryApi: (
    data: {
        group_id: string;
        store_id: string;
    },
    token?: string,
) => Promise<WithdrawalResponeType> = ({ group_id, store_id }, token = '') => {
    return api.callApi({
        endpoint: `api/transfer/bank/account/archive?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const getExistingRevenueApi: (
    data: {
        group_id: string;
        store_id: string;
    },
    token?: string,
) => Promise<ExistingRevenueResponeType> = ({ group_id, store_id }, token = '') => {
    return api.callApi({
        endpoint: `api/transfer/accounts/balance?group_id=${group_id}&store_id=${store_id}`,
        method: 'GET',
        token,
    });
};

export const transferApi = (data: TransferRequestType) => {
    return api.callApi({ endpoint: `api/transfer/make`, method: 'POST', data });
};

export const accountInformationApi = (data: AccountInformationRequestType) => {
    return api.callApi({ endpoint: `api/transfer/bank/account/info`, method: 'POST', data });
};

export const changeTablesApi = (data: ChangeTablesRequestType) => {
    return api.callApi({ endpoint: `api/stores/department/sub/change/table`, method: 'POST', data });
};

export const getIngredient = (data: IngredientReqType) => {
    return api.callApi({
        endpoint: `api/ware-house`,
        method: 'GET',
        params: {
            group_id: data.group_id,
            store_id: data.store_id,
            status: data.status,
            name: data.name,
            page: data.page,
            limit: data.limit,
            type: data.type,
        },
    });
};

export const getDetailProduct = (data: any) => {
    return api.callApi({
        endpoint: `api/products/${data?.id}`,
        method: 'GET',
        params: {
            group_id: data?.group_id,
            store_id: data?.store_id,
        },
    });
};

export const linkProductWarehouse = (data: any) => {
    return api.callApi({
        endpoint: `api/ware-house/item`,
        method: 'POST',
        params: {
            group_id: data?.group_id,
            store_id: data?.store_id,
            product_id: data?.id,
            amount: data?.amount,
            min_amount: data?.min_amount,
        },
    });
};

export const getListWareHouse = (data: any) => {
    return api.callApi({
        endpoint: 'api/receipt',
        method: 'GET',
        params: {
            group_id: data?.group_id,
            store_id: data?.store_id,
            type: data?.type,
            create_by: data?.create_by,
            receipt_type: data?.receipt_type,
            status: data?.status,
            from: data?.from,
            to: data?.to,
            page: data?.page || 1,
        },
    });
};

export const getListReceipt = (data: any) => {
    return api.callApi({
        endpoint: 'api/receipt-type',
        method: 'GET',
        params: {
            group_id: data?.group_id,
            store_id: data?.store_id,
            type: data?.type,
        },
    });
};

export const cancelReceipt = (id: string, group_id: string, store_id: string) => {
    return api.callApi({
        endpoint: `api/receipt/update-status/${id}`,
        method: 'PUT',
        data: {
            status: 'cancel',
            group_id,
            store_id,
        },
    });
};

export const detailReceipt = (data: any) => {
    return api.callApi({
        endpoint: `api/receipt/${data?.id}`,
        method: 'GET',
        params: {
            group_id: data?.group_id,
            store_id: data?.store_id,
        },
    });
};

export const exportPdfDetail = (data: any) => {
    return api.callApi({
        endpoint: `api/receipt/export-pdf/${data?.id}`,
        method: 'GET',
        params: {
            group_id: data?.group_id,
            store_id: data?.store_id,
        },
    });
};

export const updateReceipt = (id: string, data: any) => {
    return api.callApi({
        endpoint: `api/receipt/${id}`,
        method: 'PUT',
        data,
    });
};

export const updateStatusReceipt = (id: string, group_id: string, store_id: string) => {
    return api.callApi({
        endpoint: `api/receipt/update-status/${id}`,
        method: 'PUT',
        data: {
            status: 'import',
            group_id,
            store_id,
        },
    });
};

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

export const getReportWareHouse = (data: ReportReqType) => {
    return api.callApi({
        endpoint: `api/report/ware-house`,
        method: 'GET',
        params: {
            group_id: data.group_id,
            store_id: data.store_id,
            to: data.to,
            page: data.page,
            type: data.type,
            from: data.from,
            limit: data.limit,
            status: data.status,
        },
    });
};

export const exportReportWareHouse = (data: ReportReqType) => {
    return api.callApi({
        endpoint: `api/report/ware-house`,
        method: 'GET',
        params: {
            group_id: data.group_id,
            store_id: data.store_id,
            to: data.to,
            exports: true,
            type: data.type,
            from: data.from,
        },
    });
};

export const getHistoryWareHouse = (data: any) => {
    return api.callApi({
        endpoint: `api/ware-house/history`,
        method: `GET`,
        params: {
            group_id: data.group_id,
            store_id: data.store_id,
            page: data.page,
            limit: data.limit,
            name: data.name,
            from: data.from,
            to: data.to,
        },
    });
};
