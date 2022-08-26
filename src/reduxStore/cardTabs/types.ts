import { ActionType } from 'typesafe-actions';
import { ListProductType } from 'api/types';
import * as actions from './actions';

export type CardTabsActionType = ActionType<typeof actions>;

export enum CardTabsEnum {
    ADD_CARD = '@@cardTabs/ADD_CARD',
    DELETE_CARD = '@@cardTabs/DELETE_CARD',
    CHOOSE_CARD_TABLE = '@@cardTabs/CHOOSE_CARD_TABLE',
    ADD_CARD_PRODUCTS = '@@cardTabs/ADD_CARD_PRODUCTS',
    DELETE_CARD_PRODUCTS = '@@cardTabs/DELETE_CARD_PRODUCTS',
    CHANGE_CARD_PRODUCTS_QUANTITY = '@@cardTabs/CHANGE_CARD_PRODUCTS_QUANTITY',
    CHOOSE_CARD_PAYMENT_METHOD = '@@cardTabs/CHOOSE_CARD_PAYMENT_METHOD',
    SET_CARD = '@@cardTabs/SET_CARD',
    CHOOSE_CARD_STATUS_ORDER = '@@cardTabs/CHOOSE_CARD_STATUS_ORDER',
    SET_ALL_CARDS = '@@cardTabs/SET_ALL_CARDS',
    SET_CARD_CREATED = '@@cardTabs/SET_CARD_CREATED',
    SET_CARD_COUPON = '@@cardTabs/SET_CARD_COUPON',
    CHANGE_CARD_PRODUCTS_NOTE = '@@cardTabs/CHANGE_CARD_PRODUCTS_NOTE',
}

export type ProductType = ListProductType;

export interface CardType {
    _id: string;
    orderId: string;
    listProducts: ProductType[];
    tableState: string;
    statusAction: boolean;
    paymentMethod: string;
    bankUrl: string;
    created?: boolean;
    createdAt?: string;
    updatedAt?: string;
    currency?: string;
    customer_id?: string;
    customer_name?: string;
    customer_avatar?: string;
    customer_phone_number?: string;
    department_id?: string;
    department_name?: string;
    group_id?: string;
    id?: string;
    name?: string;
    number?: number;
    payment_method?: 'EWALLET' | 'MONEY' | 'ATM' | 'CC';
    payment_method_name?: string;
    payment_url?: string;
    status?: 'pending' | 'processing' | 'cancelled' | 'completed';
    status_payment?: 'pending' | 'completed';
    status_service?: 'pending' | 'completed';
    status_order?: 'take-away' | 'at-place';
    store_id?: string;
    sub_department_id?: string;
    sub_department_name?: string;
    total?: number;
    list_products?: ListProductType[];
    products?: ListProductType[];
    transaction_id?: string;
    bank_code?: string;
    user_id?: string;
    user_name?: string;
    note?: string;
    store?: {
        address: string;
        message: string;
        name: string;
        phone_number: string;
        _id: string;
    };
    date_created?: number;
    date_payment?: number;
    discount_amount?: number;
    discount_code?: string;
    discount_id?: string;
    discount_name?: string;
    order_code?: string;
    platform?: string;
}

export interface CardTabsType {
    result: {
        cards: CardType[];
    };
}
