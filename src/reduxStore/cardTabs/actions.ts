import { action } from 'typesafe-actions';
import { CardTabsEnum, CardType, ProductType } from './types';

export const addCard = (card?: CardType) =>
    action(CardTabsEnum.ADD_CARD, {
        card,
        orderId: '',
        data: {
            orderId: '',
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const deleteCard = (orderId: string) =>
    action(CardTabsEnum.DELETE_CARD, {
        card: undefined,
        orderId,
        data: {
            orderId: '',
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const chooseCardTable = (data: { orderId: string; tableId: string }) =>
    action(CardTabsEnum.CHOOSE_CARD_TABLE, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const addCardProduct = (data: { orderId: string; products: ProductType }) =>
    action(CardTabsEnum.ADD_CARD_PRODUCTS, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const deleteCardProduct = (data: { orderId: string; product_id: string }) =>
    action(CardTabsEnum.DELETE_CARD_PRODUCTS, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const changeCardProductQuantity = (data: { orderId: string; products: ProductType }) =>
    action(CardTabsEnum.CHANGE_CARD_PRODUCTS_QUANTITY, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const chooseCardPaymentMethod = (data: { orderId: string; paymentMethod: string }) =>
    action(CardTabsEnum.CHOOSE_CARD_PAYMENT_METHOD, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const chooseCardStatusOrder = (data: { orderId: string; statusOrder: boolean }) =>
    action(CardTabsEnum.CHOOSE_CARD_STATUS_ORDER, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            paymentMethod: '',
            product_id: '',
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const setCard = (data: { orderId: string; card: CardType }) =>
    action(CardTabsEnum.SET_CARD, {
        card: data.card,
        orderId: data.orderId,
        data: {
            orderId: '',
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const setAllCards = () =>
    action(CardTabsEnum.SET_ALL_CARDS, {
        card: undefined,
        orderId: '',
        data: {
            orderId: '',
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
export const setCardCreated = (data: { orderId: string; created: boolean }) =>
    action(CardTabsEnum.SET_CARD_CREATED, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
        },
    });
export const setCardCoupon = (data: {
    orderId: string;
    discount_amount: number;
    discount_code: string;
    discount_id: string;
    discount_name: string;
}) =>
    action(CardTabsEnum.SET_CARD_COUPON, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            products: {
                logo: '',
                name: '',
                _id: '',
                price: 0,
                category_id: '',
                quantity: 0,
                product_id: '',
            },
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            created: false,
        },
    });
export const changeCardProductNote = (data: { orderId: string; products: ProductType }) =>
    action(CardTabsEnum.CHANGE_CARD_PRODUCTS_NOTE, {
        card: undefined,
        orderId: '',
        data: {
            ...data,
            tableId: '',
            product_id: '',
            paymentMethod: '',
            statusOrder: false,
            discount_amount: 0,
            discount_name: '',
            discount_id: '',
            discount_code: '',
            created: false,
        },
    });
