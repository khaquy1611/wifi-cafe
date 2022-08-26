export type DataProduct = [
    {
        product_id: string;
        name: string;
        logo: string;
        quantity: number;
        price: number;
        note?: string;
    },
];

export type platformType = 'web' | 'miniapp' | 'app' | 'in_app';

export type ExtraCustomer = {
    id: string;
    name: string;
};
export interface TransferBankAccountInfoResponse {
    accountInfo: {
        accountNo: string;
        accountName: string;
        bankCode: string;
        accountType: string;
    };
}

export interface TransferMakeResponse {
    transaction: {
        amount: number;
        transferAmount: number;
        appotapayTransId: string;
        time: number;
    };
    account: {
        balance: number;
    };
}

export interface TransferTransactionResponse {
    transaction: {
        phoneNumber: string;
        amount: number;
        transferAmount: number;
        appotapayTransId: string;
        time: number;
    };
}

export interface TransferBankAccountInfoRequest {
    accountType: string;
    accountNo: string;
    bankCode: string;
    secret_key: string;
    partner_code: string;
    api_key: string;
}

export interface TransferMakeRequest {
    accountName: string;
    amount: number;
    contractNumber?: string;
    customerPhoneNumber?: string;
    feeType?: 'receiver';
    message?: string;
    accountType: string;
    accountNo: string;
    bankCode: string;
    partnerRefId: string;
    secret_key: string;
    partner_code: string;
    api_key: string;
}

export interface TransferTransactionRequest {
    partnerRefId: string;
    secret_key: string;
    partner_code: string;
    api_key: string;
}

export interface TransferAccountBalanceRequest {
    api_key: string;
    secret_key: string;
    partner_code: string;
}

export interface CouponCheckStatus {
    group_id: string;
    store_id: string;
    code: string;
    platform?: platformType;
    total: number;
    order_id?: string;
    customer_id?: string;
    list_products: DataProduct;
}

export interface DataVaildProduct {
    group_id: string;
    store_id: string;
    total: number;
    list_products: DataProduct;
    order_id: string;
    note?: string;
}

export interface DataCreateOrderProduct {
    product_id: string;
    name: string;
    logo: string;
    price: number;
    quantity: number;
    order_id: string;
    group_id: string;
    store_id: string;
    note?: string;
    time: number;
}

export interface DataAppotaPay {
    store_id: string;
    id: string;
    _id: string;
    total: number;
    bank_code: string;
    orderId: string;
    payment_method: string;
    platform?: string;
    qr_code?: string;
    order_code?: number;
}

export interface DataCheckStore {
    group_id: string;
    store_id: string;
    store_name: string;
    payment_method: string;
    status_order: string;
    total: number;
    number: number;
    user_agent: string;
    ip: string;
    deviceToken?: string;
    platform?: string;
    orderIdStore: number;
    orderCodeStore: number;
}

export interface LogActionAdminType {
    name: string;
    type: string;
    key: string;
    user_id: string;
    user_name: string;
    user_email: string;
    group_id: string;
    store_id: string;
    location?: string;
    order_id: string;
}

export interface AdminType {
    _id?: string;
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role?: 'ADMIN' | 'GROUP_ADMIN' | 'SUPER_ADMIN';
    loginAt?: number;
    token?: string;
    secret_pin: string;
    secret_url?: string;
    active: boolean;
    two_factor?: boolean;
    token_mini_app?: string;
    workspace_id?: string;
    login_multi_device: string;
    deviceToken?: string;
    platform?: string;
    stores?: Array<string>;
    groupStores: Array<string>;
    permissions?: Array<string>;
    role_permissions?: Array<string>;
}

export interface CouponType {
    _id: string;
    group_id: string;
    store_id: string;
    code: string;
    amount: number;
    discount_type: string;
    name: string;
    date_start: number;
    date_expires: number;
    time_start: number;
    time_expires: number;
    usage_count: number;
    product_ids: Array<string>;
    usage_limit: number;
    usage_limit_per_user: number;
    minimum_amount: number;
    maximum_amount: number;
    used_by: Array<string>;
    platform: Array<string>;
    active: boolean;
    show_user: boolean;
    available: boolean;
    limit_by_day: number;
}

export interface CouponCustomerType {
    usage_count: number;
    usage_count_by_day: number;
    customer_id: string;
    coupon_id: string;
    createdAt: string;
    updatedAt: string;
}
export interface CustomerType {
    _id: string;
    id: string;
    is_hrm: boolean;
    token: string;
    staff_id: string;
    workspace_id: string;
    name: string;
    avatar: string;
    birthday: string;
    gender: string;
    is_owner: boolean;
    is_leader: boolean;
    email: string;
    phone_number: string;
    company: ExtraCustomer;
    department: ExtraCustomer;
    sub_department: ExtraCustomer;
    team: ExtraCustomer;
    office: ExtraCustomer;
}

export interface FileType {
    _id: string;
    name: string;
    type: string;
    location: string;
    size: number;
    group_id: string;
    bucket: string;
    key: string;
}

export interface OrderProductType {
    _id: string;
    order_id: string;
    product_id: string;
    status: string;
    number_recieve: number;
    price: number;
}

export interface OrderType {
    _id: string;
    id: string;
    name: string;
    status: string;
    store_id: string;
    store_name: string;
    group_id: string;
    workspace_id: string;
    bank_code: string;
    transaction_id: string;
    sub_department_id: string;
    sub_department_name: string;
    department_id: string;
    department_name: string;
    total: number;
    number: number;
    status_order: string;
    status_order_name: string;
    status_service: string;
    status_payment: string;
    list_products: Array<OrderProductType>;
    products: Array<string>;
    payment_method: string;
    payment_method_name: string;
    note: string;
    orderId: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    date_modified: number;
    date_payment: number;
    store: { name: string };
    staff_id: string;
    customer_id: string;
    customer_name: string;
    customer_avatar: string;
    customer_user_agent: string;
    customer_phone_number: string;
    customer_ip_address: string;
    discount_code: string;
    discount_id: string;
    discount_name: string;
    discount_amount: number;
    payment_url: string;
    order_code: number;
    createdAt: string;
    order_closing: string;
    order_closing_note: string;
    deviceToken: string;
    platform: string;
}

export interface TransactionType {
    _id: string;
    status: string;
    amount_bank: number;
    error_code: number;
    currency: string;
    payment_type: string;
    appotapay_trans_id: string;
    orderId: string;
    order_id: string;
    transaction_ts: number;
    extra_data: string;
    message: string;
    bank_code: string;
    payment_method: string;
}

export interface ProductType {
    _id: string;
    id: string;
    name: string;
    desc: string;
    logo: string;
    price: number;
    status: string;
    order: number;
    group_id: string;
    type_warehouse: string;
    category_id: string;
    amount?: number;
    min_amount?: number;
    link_warehouse?: {
        id: string;
        quantity: number;
        name: string;
        unit: string;
        amount: number;
        min_amount: number;
    }[];
}

export interface GroupStoreType {
    _id: string;
    name: string;
    desc: string;
    logo: string;
    workspace_id: string;
    active: boolean;
    receive_message_order: boolean;
    order: number;
    api_key: string;
    secret_key: string;
    partner_code: string;
    ip: string;
}

export interface StoreType {
    _id: string;
    id: string;
    name: string;
    desc: string;
    logo: string;
    phone_number: string;
    address: string;
    lat: number;
    long: number;
    active: boolean;
    order: number;
    orderId: number;
    receipt_no: number;
    order_code: number;
    order_card_table: number;
    group_id: string;
    ips: Array<string>;
    receive_message_order: boolean;
    api_key: string;
    secret_key: string;
    partner_code: string;
    ip: string;
}

export interface StoreSubDepartmentType {
    _id: string;
    id: string;
    name: string;
    desc: string;
    active: boolean;
    status: string;
    request: string;
    order: number;
    chair: number;
    department_id: string;
    store_id: string;
    orders: Array<string>;
}

export interface StoreDepartmentType {
    _id: string;
    name: string;
    desc: string;
    active: boolean;
    order: number;
    store_id: string;
    subDepartment: Array<string>;
}

export interface IDataBank {
    orderId: string;
    errorCode: number;
    amount: number;
    currency: string;
    paymentType: string;
    appotapayTransId: string;
    transactionTs: number;
    extraData: string;
    message: string;
    bankCode: string;
    apiKey: string;
    partnerCode: string;
    paymentMethod: string;
    signature: string;
}

export interface FCMPushType {
    group_id: string;
    store_id: string;
    total: number;
    discount_amount: number;
    customer_name: string;
}

export interface WareHouseType {
    group_id: string;
    store_id: string;
    product_id?: string;
    name: string;
    amount: number;
    min_amount: number;
    type: string;
    unit: string;
    import_amount: number;
    export_amount: number;
    sell_amount: number;
}

export interface WareHouseImportType {
    group_id: string;
    store_id: string;
    name: string;
    type: string;
    amount: number;
    min_amount: number;
    unit: string;
    status: string;
}

export interface ReceiptTypeType {
    group_id: string;
    store_id: string;
    name: string;
    type: string;
}

export interface ReceiptType {
    code: string;
    group_id: string;
    store_id: string;
    type: string;
    receipt_type: string;
    name: string;
    file: string;
    desc: string;
    link_warehouse: {
        warehouse_id: string;
        quantity: number;
        name?: string;
        unit?: string;
    }[];
    status: string;
    list_operator: {
        name: string;
        action: string;
        time: number;
    }[];
}

export interface WareHouseLogType {
    group_id: string;
    store_id: string;
    warehouse_id: string;
    action: string;
    quantity: number;
}

export interface WareHouseDailyLogType {
    group_id: string;
    store_id: string;
    warehouse_id: string;
    time: number;
    name: string;
    amount: number;
    min_amount: number;
    import_amount: number;
    export_amount: number;
    sell_amount: number;
    unit: string;
    warehouse_type: 'item' | 'ingredient';
    status: 'init' | 'consume';
}

export interface ReceiptItemType {
    group_id: string;
    store_id: string;
    warehouse_id: string;
    receipt_id: string;
    orderId: string;
    name: string;
    code: string;
    status: 'order' | 'cancel' | 'import' | 'export' | 'sell' | 'init' | 'delete';
    import_amount: number;
    export_amount: number;
    sell_amount: number;
    unit: string;
    note: string;
    warehouse_type: 'item' | 'ingredient';
    time: number;
    remain_amount: number;
}

export interface WarehouseDailyLogQueryDTO {
    _id: string;
    group_id: string;
    store_id: string;
    name: string;
    warehouse_type: string;
    amount: number;
    min_amount: number;
    unit: string;
    status: string;
    time: number;
    totalImport: number;
    totalExport: number;
    totalSell: number;
}

export interface ReceiptItemInputType {
    name: string;
    unit: string;
    group_id: string;
    store_id: string;
    warehouse_type?: string;
    warehouse_id?: string;
    note?: string;
    orderId?: string;
    code?: string;
    receipt_id?: string;
    import_amount?: number;
    export_amount?: number;
    sell_amount?: number;
    remain_amount?: number;
    type?: string;
}
export interface WarehouseQueryConditionType {
    group_id: string;
    store_id: string;
    type?: string;
    warehouse_type?: string;
    name?: {
        $regex: string;
        $options: string;
    };
    deleted?: boolean;
    status?: {
        $in: string[];
    };
    time?: { $gte: number; $lte: number };
    'receipt_item.status'?: {
        $in: string[];
    };
}

export interface WarehouseResponseDataType {
    id?: string;
    warehouse_id: string;
    group_id: string;
    store_id: string;
    name: string;
    amount: number;
    min_amount: number;
    unit: string;
    warehouse_type: string;
    createdAt: string;
    updatedAt: string;
    totalImport: number;
    totalExport: number;
    totalSell: number;
    remainAmount: number;
    status: string;
}

export interface ProductAttributeType {
    product_id: string;
    warehouse_id: string;
    quantity: number;
}

export interface ReceiptItemAttribute {
    receipt_id: string;
    warehouse_id: string;
    quantity: number;
}

export interface ProductDetailResponseDataType {
    _id: string;
    id: string;
    name: string;
    desc: string;
    logo: string;
    price: number;
    status: string;
    order: number;
    group_id: string;
    type_warehouse: string;
    category_id: string;
    amount?: number;
    min_amount?: number;
    link_warehouse?: {
        id: string;
        quantity: number;
        name: string;
        unit: string;
        amount: number;
        min_amount: number;
    }[];
}

export interface ReceiptDetailResponseDataType {
    code: string;
    group_id: string;
    store_id: string;
    type: string;
    receipt_type: string;
    name: string;
    file: string;
    desc: string;
    link_warehouse: {
        warehouse_id: string;
        quantity: number;
        name: string;
        unit: string;
    }[];
    status: string;
    list_operator: {
        name: string;
        action: string;
        time: number;
    }[];
}
export interface ReceiptItemAttributeResponse {
    receipt_id: string;
    warehouse_id: {
        _id: string;
        name: string;
        unit: string;
        id?: string;
    };
    quantity: number;
}
export type ReceiptItemStatusType = 'delete' | 'init' | 'import' | 'export' | 'order' | 'cancel' | 'sell';

export interface QuerySortType {
    [key: string]: number;
}
