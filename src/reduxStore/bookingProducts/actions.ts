import { action } from 'typesafe-actions';
import { BookingProductsEnum, ProductType } from './types';

export const addBookingProduct = (product: ProductType, locationID?: string) =>
    action(BookingProductsEnum.ADD_BOOKING_PRODUCT, { product, products: [], locationID });
export const removeBookingProduct = (product: ProductType) =>
    action(BookingProductsEnum.DELETE_BOOKING_PRODUCT, { product, products: [], locationID: '' });
export const changeTotalOfProduct = (product: ProductType) =>
    action(BookingProductsEnum.CHANGE_TOTAL_OF_PRODUCT, { product, products: [], locationID: '' });
export const changeProductNote = (product: ProductType) =>
    action(BookingProductsEnum.CHANGE_PRODUCT_NOTE, { product, products: [], locationID: '' });
export const setBookingProduct = (products: ProductType[]) =>
    action(BookingProductsEnum.SET_BOOKING_PRODUCT, { products, product: undefined, locationID: '' });
export const resetBookingProduct = () =>
    action(BookingProductsEnum.RESET_BOOKING_PRODUCT, { products: [], product: undefined, locationID: '' });
export const detectLocationID = (locationID: string) =>
    action(BookingProductsEnum.DETECT_LOCATIONID, { products: [], product: undefined, locationID });
