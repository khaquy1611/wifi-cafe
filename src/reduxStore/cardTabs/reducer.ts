import findLast from 'lodash/findLast';
import { CardTabsActionType, CardTabsEnum, CardTabsType } from './types';

export const initialState: CardTabsType = {
    result: {
        cards: [
            {
                _id: '',
                orderId: 'Đơn mới',
                listProducts: [],
                tableState: '',
                statusAction: false,
                paymentMethod: '',
                bankUrl: '',
            },
        ], // admin - orderDetail
    },
};

function CardTabsReducer(state = initialState, action: CardTabsActionType) {
    const { type, payload } = action;
    switch (type) {
        case CardTabsEnum.ADD_CARD: {
            const lastNewCard = findLast(state.result.cards, (item) => item.orderId.includes('Đơn mới'));
            const lastNewCardOrderId = lastNewCard?.orderId.split(' ')[2];
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: [
                        ...state.result.cards,
                        payload.card || {
                            _id: '',
                            orderId: `Đơn mới${
                                lastNewCard ? (lastNewCardOrderId ? ` ${Number(lastNewCardOrderId) + 1}` : ' 1') : ''
                            }`,
                            listProducts: [],
                            tableState: '',
                            statusAction: false,
                            paymentMethod: '',
                            bankUrl: '',
                        },
                    ],
                },
            };
        }
        case CardTabsEnum.DELETE_CARD: {
            return {
                ...state,
                result: {
                    ...state.result,
                    cards:
                        state.result.cards.length === 1
                            ? [
                                  {
                                      _id: '',
                                      orderId: 'Đơn mới',
                                      listProducts: [],
                                      tableState: '',
                                      statusAction: false,
                                      paymentMethod: '',
                                      bankUrl: '',
                                  },
                              ]
                            : state.result.cards.filter((item) => item.orderId !== payload.orderId),
                },
            };
        }
        case CardTabsEnum.CHOOSE_CARD_TABLE: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.tableState = payload.data.tableId;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.ADD_CARD_PRODUCTS: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.listProducts?.push(payload.data.products);
                card.discount_amount = payload.data.discount_amount;
                card.discount_name = payload.data.discount_name;
                card.discount_id = payload.data.discount_id;
                card.discount_code = payload.data.discount_code;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.DELETE_CARD_PRODUCTS: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.listProducts = card.listProducts?.filter((item) => item.product_id !== payload.data.product_id);
                card.discount_amount = payload.data.discount_amount;
                card.discount_name = payload.data.discount_name;
                card.discount_id = payload.data.discount_id;
                card.discount_code = payload.data.discount_code;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.CHANGE_CARD_PRODUCTS_QUANTITY: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                const productIndex =
                    card.listProducts?.findIndex((item) => item.product_id === payload.data.products.product_id) || 0;
                card.listProducts?.splice(productIndex, 1, payload.data.products);
                card.discount_amount = payload.data.discount_amount;
                card.discount_name = payload.data.discount_name;
                card.discount_id = payload.data.discount_id;
                card.discount_code = payload.data.discount_code;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.CHOOSE_CARD_PAYMENT_METHOD: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.paymentMethod = payload.data.paymentMethod;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.CHOOSE_CARD_STATUS_ORDER: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.statusAction = payload.data.statusOrder;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.SET_CARD: {
            const newCards = [...state.result.cards];
            const cardIndex = state.result.cards.findIndex((item) => item.orderId === payload.orderId) || 0;
            if (payload.card) newCards.splice(cardIndex, 1, payload.card);
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.SET_ALL_CARDS: {
            return initialState;
        }
        case CardTabsEnum.SET_CARD_CREATED: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.created = payload.data.created;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.SET_CARD_COUPON: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                card.discount_amount = payload.data.discount_amount;
                card.discount_name = payload.data.discount_name;
                card.discount_id = payload.data.discount_id;
                card.discount_code = payload.data.discount_code;
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }
        case CardTabsEnum.CHANGE_CARD_PRODUCTS_NOTE: {
            const newCards = [...state.result.cards];
            const card = newCards.find((item) => item.orderId === payload.data.orderId);
            const cardIndex = newCards.findIndex((item) => item.orderId === payload.data.orderId);
            if (card) {
                const productIndex =
                    card.listProducts?.findIndex((item) => item.product_id === payload.data.products.product_id) || 0;
                card.listProducts?.splice(productIndex, 1, payload.data.products);
                newCards.splice(cardIndex, 1, card);
            }
            return {
                ...state,
                result: {
                    ...state.result,
                    cards: newCards,
                },
            };
        }

        default:
            return state;
    }
}

export default CardTabsReducer;
