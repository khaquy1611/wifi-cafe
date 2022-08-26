import { BookingProductsActionType, BookingProductsEnum, BookingProductsType } from './types';

const initialState: BookingProductsType = {
    result: {
        client: [], // admin - new order
        locationdID: '', // detect location of client
    },
};

function BookingProductsReducer(state = initialState, action: BookingProductsActionType) {
    const { type, payload } = action;
    switch (type) {
        case BookingProductsEnum.ADD_BOOKING_PRODUCT: {
            return {
                ...state,
                result: {
                    ...state.result,
                    client: [...state.result.client, payload.product],
                },
            };
        }
        case BookingProductsEnum.DELETE_BOOKING_PRODUCT: {
            const filteredResult = !Array.isArray(payload.product)
                ? state.result.client.filter((item) => item.product_id !== payload?.product?.product_id)
                : [];
            return {
                ...state,
                result: {
                    ...state.result,
                    client: filteredResult,
                },
            };
        }
        case BookingProductsEnum.CHANGE_TOTAL_OF_PRODUCT: {
            const changeProductIndex = !Array.isArray(payload.product)
                ? state.result.client.findIndex((item) => item.product_id === payload?.product?.product_id)
                : 0;
            const newResult = [...state.result.client];
            if (payload.product && !Array.isArray(payload.product))
                newResult.splice(changeProductIndex, 1, payload.product);
            return {
                ...state,
                result: {
                    ...state.result,
                    client: newResult,
                },
            };
        }
        case BookingProductsEnum.CHANGE_PRODUCT_NOTE: {
            const changeProductIndex = !Array.isArray(payload.product)
                ? state.result.client.findIndex((item) => item.product_id === payload?.product?.product_id)
                : 0;
            const newResult = [...state.result.client];
            if (payload.product && !Array.isArray(payload.product))
                newResult.splice(changeProductIndex, 1, payload.product);
            return {
                ...state,
                result: {
                    ...state.result,
                    client: newResult,
                },
            };
        }
        case BookingProductsEnum.SET_BOOKING_PRODUCT: {
            return {
                ...state,
                result: {
                    ...state.result,
                    client: payload.products,
                },
            };
        }
        case BookingProductsEnum.RESET_BOOKING_PRODUCT: {
            return {
                ...state,
                result: {
                    ...state.result,
                    client: [],
                },
            };
        }
        case BookingProductsEnum.DETECT_LOCATIONID: {
            return {
                ...state,
                result: {
                    ...state.result,
                    client: [],
                    locationdID: payload.locationID,
                },
            };
        }
        default:
            return state;
    }
}

export default BookingProductsReducer;
