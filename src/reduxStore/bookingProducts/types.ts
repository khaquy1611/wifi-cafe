import { ActionType } from 'typesafe-actions';
import { ListProductType } from 'api/types';
import * as actions from './actions';

export type BookingProductsActionType = ActionType<typeof actions>;

export enum BookingProductsEnum {
    ADD_BOOKING_PRODUCT = '@@bookingProducts/ADD_BOOKING_PRODUCTS',
    DELETE_BOOKING_PRODUCT = '@@bookingProducts/DELETE_BOOKING_PRODUCTS',
    CHANGE_TOTAL_OF_PRODUCT = '@@bookingProducts/CHANGE_TOTAL_OF_PRODUCT',
    CHANGE_PRODUCT_NOTE = '@@bookingProducts/CHANGE_PRODUCT_NOTE',
    SET_BOOKING_PRODUCT = '@@bookingProducts/SET_BOOKING_PRODUCT',
    RESET_BOOKING_PRODUCT = '@@bookingProducts/RESET_BOOKING_PRODUCT',
    DETECT_LOCATIONID = '@@bookingProducts/DETECT_LOCATIONID',
}

export type ProductType = ListProductType & { quantity: number };

export interface BookingProductsType {
    result: {
        client: ProductType[];
        locationdID: string;
    };
}
