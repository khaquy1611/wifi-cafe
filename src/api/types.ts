import { Moment } from 'moment';

export interface VoucherType {
    _id?: string;
    name?: string;
    type?: string;
    group_id: string;
    store_id: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CouponsFormType {
    group_id: string;
    store_id: string;
    offset?: number;
    code?: string;
    discount_type?: string;
    platform?: string;
}
export interface OrdersFormValuesType {
    group_id: string;
    store_id: string;
    payment_method?: string;
    status_order?: string;
    status?: string;
    offset?: string;
    start?: string;
    end?: string;
    id?: string;
    orderId?: string;
    customer_id?: string;
    discount_id?: string;
    order_closing?: string;
}
export interface OrdersForm extends OrdersFormValuesType {
    dateFormat?: Moment[];
}
export interface DataExporting {
    _id?: string;
    name: string;
    remainAmount: number;
    min_amount: number;
    unit: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface IngredientType {
    _id: string;
    group_id?: string;
    store_id?: string;
    name: string;
    type?: string;
    amount: number;
    min_amount: number;
    unit: string;
}
export interface ImportDataExcel {
    name: string;
    type: string;
    amount: number;
    min_amount: number;
    unit: number;
}
export interface ImportListIngredientReq {
    ware_houses: ImportDataExcel[];
    group_id: string;
    store_id: string;
}
export interface UpdateIngredientType {
    group_id: string;
    store_id: string;
    name?: string;
    min_amount?: number;
    unit?: string;
}

export interface ErrorType {
    errorCode?: number;
    message?: string;
    messageStatus?: string;
    stack?: string;
}

export interface LoginType {
    email: string;
    password: string;
    token?: string;
}
export interface AdminInfoDataType {
    active?: boolean;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
    email?: string;
    groupStores?: string[];
    name?: string;
    permissions: string[];
    role?: 'SUPER_ADMIN' | 'GROUP_ADMIN' | 'ADMIN';
    role_permissions?: string[];
    two_factor?: boolean;
    stores?: string[];
    _id?: string;
    secret_url?: string;
}

export interface AdminInfoResponeType {
    data?: AdminInfoDataType;
    message?: string;
    errorCode?: number;
}

export interface LoginDataType {
    avatar?: string;
    email?: string;
    name?: string;
    role?: 'SUPER_ADMIN' | 'GROUP_ADMIN' | 'ADMIN';
}

export interface CreateGroupShopType {
    _id: string;
    name: string;
    desc?: string;
    logo: string;
    phone_number?: string;
    address?: string;
    lat?: number;
    long?: number;
    active?: boolean;
    order?: number;
    group_id: string;
    store_id?: string;
    ip?: string;
    ips?: string[];
    api_key?: string;
    secret_key?: string;
    createdAt?: string;
    updatedAt?: string;
    workspace_id: string;
}

export interface CreateGroupStoreResponeType {
    data?: CreateGroupShopType[];
    message?: string;
    errorCode?: number;
}

export interface AdminUsersDataType {
    _id: string;
    active: boolean;
    avatar: string;
    createdAt: string;
    updatedAt: string;
    loginAt: number;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'GROUP_ADMIN' | 'ADMIN';
    password: string;
    group_id: string;
    stores?: string[];
    permissions?: string[];
    login_multi_device?: boolean;
    receive_message_order?: boolean;
    two_factor?: boolean;
}

export interface AdminUsersResponeType {
    data?: AdminUsersDataType[];
    message?: string;
    errorCode?: number;
}

export interface CreateDepartmentType {
    name: string;
    desc?: string;
    active: boolean;
    order?: number;
    group_id: string;
    store_id: string;
}

export interface SubDepartmentDataType {
    _id: string;
    id: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    name: string;
    desc?: string;
    order?: number;
    chair: number;
    department_id: string;
    request?: 'Gọi phục vụ' | 'Gọi thanh toán';
    status: 'take-away' | 'at-place' | 'none';
    orders: OrdersDataType[];
}

export interface DepartmentDataType {
    _id: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    name: string;
    desc?: string;
    order?: number;
    store_id: string;
    subDepartment: SubDepartmentDataType[];
}

export interface DepartmentResponeType {
    data?: DepartmentDataType[];
    message?: string;
    errorCode?: number;
}

export interface CreateSubDepartmentType {
    name: string;
    desc?: string;
    active: boolean;
    chair: number;
    order?: number;
    group_id: string;
    store_id: string;
    department_id: string;
}

export interface CategoryDataType {
    name: string;
    desc?: string;
    store_id?: string;
    logo: string;
    active?: boolean;
    _id: string;
    createdAt?: string;
    updatedAt?: string;
    order?: number;
    group_id?: string;
    id?: string;
    price: number;
    status?: 'available' | 'unavailable' | 'pending';
    category_id: string;
    tags?: [string];
    link_warehouse?: [any];
    type_warehouse?: string;
}

export interface CategoryResponeType {
    data?: CategoryDataType[];
    message?: string;
    errorCode?: number;
}

export interface ImportListProductType {
    products: CategoryDataType[];
    store_id: string;
    group_id: string;
}

export interface ImageManagerDataType {
    _id: string;
    createdAt: string;
    group_id: string;
    location: string;
    name: string;
    size: number;
    type: string;
}

export interface ImageManagerResponeType {
    data?: ImageManagerDataType[];
    message?: string;
    errorCode?: number;
    total?: number;
}

export interface ClientStoreInfoDataType {
    store: {
        _id: string;
        logo: string;
        name: string;
        address: string;
        group_id: string;
    };
    sub_deparment: {
        _id: string;
        name: string;
        department_id: string;
    };
    deparment: {
        _id: string;
        name: string;
    };
    payment_method: PaymentMethodDataType[];
}

export interface ClientStoreInfoResponeType {
    data?: ClientStoreInfoDataType;
    message?: string;
    errorCode?: number;
}

export interface CreateProductsOrderType {
    type?: 'save' | 'payment';
    qr_code?: string;
    sub_department_id?: string;
    list_products: {
        product_id: string;
        name: string;
        logo: string;
        quantity: number;
        price: number;
        note?: string;
    }[];
    total: number;
    payment_method: string;
    bank_code?: string;
    status_order: 'take-away' | 'at-place';
    agent?: string;
    group_id?: string;
    store_id?: string;
    c?: string;
    t?: number;
    discount_amount?: number;
    discount_code?: string;
    discount_id?: string;
    discount_name?: string;
    customer_phone_number?: string;
}

export interface OrdersDataType {
    createdAt: string;
    updatedAt: string;
    currency: string;
    customer_id: string;
    customer_name: string;
    customer_avatar: string;
    staff_id: string;
    department_id: string;
    department_name: string;
    group_id: string;
    id: string;
    name: string;
    number: number;
    payment_method: 'EWALLET' | 'MONEY' | 'ATM' | 'CC';
    payment_method_name: string;
    payment_url?: string;
    status: 'pending' | 'processing' | 'cancelled' | 'completed';
    status_payment: 'pending' | 'completed';
    status_service: 'pending' | 'completed';
    status_order: 'take-away' | 'at-place';
    status_order_name: string;
    store_id: string;
    sub_department_id: string;
    sub_department_name: string;
    total: number;
    _id: string;
    list_products: ListProductType[];
    products: ListProductType[];
    transaction_id: string;
    bank_code: string;
    user_id: string;
    user_name: string;
    note: string;
    store: {
        address: string;
        message: string;
        name: string;
        phone_number: string;
        _id: string;
    };
    date_created: number;
    date_payment: number;
    discount_amount?: number;
    discount_name?: string;
    discount_id?: string;
    discount_code?: string;
    orderId?: string;
    group_ws?: string;
    order_closing_note?: string;
}

export interface OrdersResponeType {
    data?: OrdersDataType[];
    message?: string;
    errorCode?: number;
}

export interface PaymentMethodDataType {
    active: boolean;
    _id?: string;
    code?: string;
    desc?: string;
    name?: string;
    icon?: string;
    phone_number?: string;
    order: number;
    group_id?: string;
    store_id?: string;
}

export interface PaymentMethodResponeType {
    data?: PaymentMethodDataType[];
    message?: string;
    errorCode?: number;
}

export type ListProductType = CategoryDataType & {
    quantity: number;
    id?: string;
    order_id?: string;
    product_id: string;
    number_recieve?: number;
    note?: string;
};

export interface OrderDetailResponeType {
    data: OrdersDataType;
    message?: string;
    errorCode?: number;
}

export interface OrderUpdateType {
    group_id: string;
    store_id: string;
    list_products: {
        product_id: string;
        name: string;
        logo: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    payment_method: string;
    bank_code?: string;
    status_order: 'take-away' | 'at-place';
    type: 'save' | 'payment';
    sub_department_id?: string;
    discount_amount?: number;
    discount_name?: string;
    discount_id?: string;
    discount_code?: string;
    customer_phone_number?: string;
}

export interface ChangeOrderStatusType {
    type: 'cancel_order' | 'complete_service' | 'complete_payment';
    note?: string;
    group_id: string;
    store_id: string;
}

export interface CreateProductsOrderResponeType {
    data: OrdersDataType;
    message?: string;
    errorCode?: number;
    orderId: string;
    url: string;
}

export interface ChangeOrderStatusResponeType {
    message?: string;
    errorCode?: number;
}

export interface AllOrdersResponeType {
    data?: OrdersDataType[];
    message?: string;
    errorCode?: number;
    total?: number;
}

export interface NotificationDataType {
    createdAt: string;
    updatedAt: string;
    message: string;
    store_id: string;
    icon: string;
    _id: string;
    unread: boolean;
    orderId?: string;
    order_id: string;
}

export interface NotificationResponeType {
    data?: NotificationDataType[];
    message?: string;
    errorCode?: number;
}

export interface ChangeTableStatusType {
    group_id: string;
    store_id: string;
    department_id: string;
    type: 'reset' | 'service';
}

export interface ActionLogDataType {
    _id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    user_name: string;
    user_email: string;
    user_id: string;
    type: string;
    group_id: string;
    order_id: string;
    location?: string;
}

export interface ActionLogResponeType {
    data?: ActionLogDataType[];
    message?: string;
    errorCode?: number;
    total?: number;
}

export interface SampleProductsType {
    store_id: string;
    group_id: string;
    init_product: boolean;
    init_payment: boolean;
    init_department: boolean;
}

export interface GetStatOrderRequestDataType {
    store_id: string;
    group_id: string;
    start?: number;
    end?: number;
    user_id?: string;
    type?: string;
    status?: string;
}
export interface GetStatOrderDataType {
    _id?: string;
    id?: string;
    time?: number;
    count: number;
    total: number;
    total_voucher: number;
    user_name?: string;
    user_avatar?: string;
    customer_name?: string;
    customer_avatar?: string;
    name?: string;
    logo?: string;
}

export interface GetStatOrderResponeType {
    data?: GetStatOrderDataType[];
    message?: string;
    errorCode?: number;
}

export interface CustomerDataResponseType {
    avatar: string;
    birthday: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    gender: string;
    group_id: string;
    id: string;
    is_leader: boolean;
    is_owner: boolean;
    name: string;
    phone_number: string;
    staff_id: string;
    workspace_id: string;
    _id: string;
    customer_avatar: string;
    customer_name: string;
}

export interface CustomerResponeType {
    data?: CustomerDataResponseType[];
    message?: string;
    errorCode?: number;
    total?: number;
}

export interface CustomerInfoDataResponseType {
    name: string;
}

export interface CustomerInfoResponeType {
    data?: CustomerInfoDataResponseType;
    message?: string;
    errorCode?: number;
}

export interface ChangeReceivedProductType {
    group_id: string;
    store_id: string;
    quantity: number;
}

export interface CouponsDataResponseType {
    active: boolean;
    amount: number;
    code: string;
    createdAt: string;
    updatedAt: string;
    date_start: number;
    date_expires: number;
    limit_by_day: number;
    discount_type: 'fixed_cart' | 'percent_cart' | 'fixed_product' | 'percent_product';
    platform: 'web' | 'miniapp' | 'app';
    group_id: string;
    maximum_amount: number;
    minimum_amount: number;
    name: string;
    product_ids: Array<string>;
    store_id: string;
    usage_count: number;
    usage_limit: number;
    usage_limit_per_user: number;
    _id: string;
}

export interface CouponsResponeType {
    data?: CouponsDataResponseType[];
    message?: string;
    errorCode?: number;
    total?: number;
}

export interface CreateCouponType {
    group_id: string;
    store_id: string;
    code: string;
    amount: number;
    discount_type: 'fixed_cart' | 'percent_cart' | 'fixed_product' | 'percent_product';
    name: string;
    date_start: number;
    date_expires: number;
    product_ids?: string[];
    platform: Array<string>;
    usage_limit?: number;
    usage_limit_per_user?: number;
    minimum_amount?: number;
    maximum_amount?: number;
    limit_by_day?: number;
    number_duplicate?: number;
}

export interface CheckCouponStatusType {
    group_id: string;
    store_id: string;
    code: string;
    list_products: {
        product_id: string;
        name: string;
        logo: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    order_id?: string;
    admin?: boolean;
    platform: 'web' | 'miniapp' | 'app';
    customer_id?: string;
}

export interface CheckCouponStatusDataResponseType {
    discount_amount: number;
    discount_name: string;
    discount_id: string;
    discount_code: string;
}

export interface CheckCouponStatusResponseType {
    data: CheckCouponStatusDataResponseType;
    message?: string;
    errorCode?: number;
}

export interface ClientCouponsDataType {
    amount: number;
    code: string;
    date_expires: number;
    name: string;
    _id: string;
    discount_type: string;
    maximum_amount: number;
    minimum_amount: number;
    product_ids: Array<string>;
    available: boolean;
}

export interface ClientCouponsResponeType {
    data?: ClientCouponsDataType[];
    message?: string;
    errorCode?: number;
}

export interface CreateCustomerRequestType {
    group_id: string;
    store_id: string;
    name: string;
    phone_number: string;
    email?: string;
    avatar?: string;
    birthday?: string;
    gender: string;
}

export interface GetExistingRevenueRequestType {
    group_id: string;
    store_id: string;
}

export interface BalanceDataType {
    balance: number;
}

export interface ExistingRevenueResponeType {
    data?: BalanceDataType;
    message?: string;
    errorCode?: number;
}

export interface TransferRequestType {
    group_id: string;
    store_id: string;
    bankCode: string;
    accountNo: string;
    accountType: string;
    accountName: string;
    remember: boolean;
    token: string;
    amount: number;
    message?: string;
    customerPhoneNumber?: string;
}

export interface WithdrawalDataType {
    _id: string;
    group_id: string;
    bankCode: string;
    accountNo: string;
    accountType: string;
    accountName: string;
    customerPhoneNumber: string;
}

export interface WithdrawalResponeType {
    data?: WithdrawalDataType[];
    message?: string;
    errorCode?: number;
}

export interface AccountInformationRequestType {
    group_id: string;
    store_id: string;
    bankCode: string;
    accountNo: string;
    accountType: string;
}

export interface AccountInFormationDataType {
    accountNo: number;
    accountName: string;
    bankCode: string;
    accountType: string;
}

export interface AccountInFormationResponeType {
    data?: AccountInFormationDataType;
    message?: string;
    errorCode?: number;
}
export interface ChangeTablesRequestType {
    group_id: string;
    store_id: string;
    order_id: string;
    department_id: string;
    sub_department_id: string;
}

declare const ValidateStatuses: ['success', 'warning', 'error', 'validating', ''];

export declare type ValidateStatus = typeof ValidateStatuses[number];

export interface ResetPasswordType {
    password?: string;
    password_confirmation?: string;
    email: string;
    token?: string;
}

export interface IngredientReqType {
    group_id: string;
    store_id: string;
    status?: string;
    page?: number;
    limit?: number;
    name?: string;
    type?: string;
}
export interface IngredientResType {
    _id?: string;
    name: string;
    unit: string;
    min_amount: number;
    remainAmount: number;
    status: number;
}
export interface link_warehouse {
    quantity: number;
    warehouse_id: string;
    _id: string;
}

export interface list_operator {
    action: string;
    name: string;
    time: number;
    _id: string;
}
export interface filterWareHouse {
    group_id: string;
    store_id: string;
    type: string;
    create_by?: string;
    receipt_by?: string;
    status?: string;
    from?: number | string;
    to?: number | string;
    dateFormat?: Moment[];
    page?: number;
}

export interface dataWareHouse {
    code: string;
    createdAt: string;
    group_id: string;
    link_warehouse: link_warehouse[];
    list_operator: list_operator[];
    name: string;
    receipt_type: string;
    status: string;
    store_id: string;
    type: string;
    _id: string;
}

export interface dataWareHouseRes {
    data: dataWareHouse[];
    errorCode: number;
    message: string;
    total: number;
}

export interface dataReceipt {
    createdAt: string;
    group_id: string;
    name: string;
    store_id: string;
    type: string;
    _id: string;
}
export interface dataReceiptRes {
    data: dataReceipt[];
    errorCode: number;
}
export interface AddReceiptType {
    group_id: string;
    store_id: string;
    type: string;
    receipt_type?: string;
    name?: string;
    code?: string;
    file?: string;
    desc?: string;
    link_warehouse?: {
        warehouse_id: string;
        quantity: number;
    };
    status?: string;
}

export interface ReceiptTypeType {
    group_id: string;
    store_id: string;
    type?: string;
    name?: string;
    page?: number;
}
export interface ReceiptResponeType {
    data?: ReceiptResponeType[];
    message?: string;
    errorCode?: number;
    total?: number;
}

export interface ReportReqType {
    group_id?: string;
    store_id?: string;
    to?: string | number;
    page?: number;
    type?: string;
    from?: string | number;
    dateFormat?: Moment[];
    create_by?: string;
    limit?: number;
    status?: string;
}

export interface ReportResponseType {
    _id?: string;
    amount: number;
    name: string;
    unit: string;
    amountEnd: number;
    amountStart: number;
    sell: number;
    import: number;
    export: number;
    min_amount: number;
}

export interface ReportWareHouseRes {
    data: ReportResponseType[];
    errorCode: number;
    message: string;
    total: number;
}

export interface HistoryReportReqType {
    _id?: string;
    name?: string;
    page?: number;
    from?: number | string;
    to?: number | string;
    warehouse_status?: string;
    dateFormat?: Moment[];
    create_by?: string;
}
export interface HistoryResponseType {
    _id?: string;
    name?: string;
    note?: string;
    ref?: string;
    change_amount?: number;
    remain_amount?: number;
    createdAt?: string;
    updatedAt?: string;
}
