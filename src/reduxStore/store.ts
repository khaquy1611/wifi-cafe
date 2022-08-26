import { combineReducers } from 'redux';

import { LoginType } from './login/types';
import LoginReducer from './login/reducer';

import { GroupStoresType } from './groupStores/types';
import GroupStoresReducer from './groupStores/reducer';

import { ChooseGroupIDType } from './groupIDState/types';
import GroupIDStateReducer from './groupIDState/reducer';

import { GroupShopsType } from './groupShops/types';
import GroupShopsReducer from './groupShops/reducer';

import { AdminUsersType } from './adminUsers/types';
import AdminUsersReducer from './adminUsers/reducer';

import { DepartmentType } from './department/types';
import DepartmentReducer from './department/reducer';

import { CategoryType } from './category/types';
import CategoryReducer from './category/reducer';

import { PropductsType } from './products/types';
import ProductsReducer from './products/reducer';

import { ClientCategoryType } from './clientCategory/types';
import ClientCategoryReducer from './clientCategory/reducer';

import { ClientProductsType } from './clientProducts/types';
import ClientProductsReducer from './clientProducts/reducer';

import { BookingProductsType } from './bookingProducts/types';
import BookingProductsReducer from './bookingProducts/reducer';

import { ImageManagerType } from './imageManager/types';
import ImageManagerReducer from './imageManager/reducer';

import { ClientStoreInfoType } from './clientStoreInfo/types';
import ClientStoreInfoReducer from './clientStoreInfo/reducer';

import { OrdersType } from './orders/types';
import OrdersReducer from './orders/reducer';

import { PaymentMethodsType } from './paymentMethods/types';
import PaymentMethodsReducer from './paymentMethods/reducer';

import { AllOrdersType } from './allOrders/types';
import AllOrdersReducer from './allOrders/reducer';

import { NotificationType } from './notification/types';
import NotificationReducer from './notification/reducer';

import { ActionLogType } from './actionLog/types';
import ActionLogReducer from './actionLog/reducer';

import { CustomerType } from './customer/types';
import CustomerReducer from './customer/reducer';

import { CardTabsType } from './cardTabs/types';
import CardTabsReducer from './cardTabs/reducer';

import { CouponsType } from './coupons/types';
import CouponsReducer from './coupons/reducer';

import { ClientCouponsType } from './clientCoupons/types';
import ClientCouponsReducer from './clientCoupons/reducer';

import { TurnoverType } from './turnover/types';
import TurnoverReducer from './turnover/reducer';

import { WithdrawalHistoryType } from './withdrawalHistory/types';
import WithdrawalHistoryReducer from './withdrawalHistory/reducer';
import IngredientReducer from './ingredient/reducer';
import { IngreType } from './ingredient/types';
import { ReceiptType } from './receipt-type/types';
import ReceiptReducer from './receipt-type/reducer';

export interface ApplicationState {
    login: LoginType;
    groupStores: GroupStoresType;
    groupIDState: ChooseGroupIDType;
    groupShops: GroupShopsType;
    adminUsers: AdminUsersType;
    department: DepartmentType;
    category: CategoryType;
    products: PropductsType;
    clientCategory: ClientCategoryType;
    clientProducts: ClientProductsType;
    bookingProducts: BookingProductsType;
    imageManager: ImageManagerType;
    clientStoreInfo: ClientStoreInfoType;
    orders: OrdersType;
    paymentMethods: PaymentMethodsType;
    allOrders: AllOrdersType;
    notification: NotificationType;
    actionLog: ActionLogType;
    customer: CustomerType;
    cardTabs: CardTabsType;
    coupons: CouponsType;
    clientCoupons: ClientCouponsType;
    turnover: TurnoverType;
    withdrawalHistory: WithdrawalHistoryType;
    ingredient: IngreType;
    receipt: ReceiptType;
}

export const rootReducer = combineReducers({
    login: LoginReducer,
    groupStores: GroupStoresReducer,
    groupIDState: GroupIDStateReducer,
    groupShops: GroupShopsReducer,
    adminUsers: AdminUsersReducer,
    department: DepartmentReducer,
    category: CategoryReducer,
    products: ProductsReducer,
    clientCategory: ClientCategoryReducer,
    clientProducts: ClientProductsReducer,
    bookingProducts: BookingProductsReducer,
    imageManager: ImageManagerReducer,
    clientStoreInfo: ClientStoreInfoReducer,
    orders: OrdersReducer,
    paymentMethods: PaymentMethodsReducer,
    allOrders: AllOrdersReducer,
    notification: NotificationReducer,
    actionLog: ActionLogReducer,
    customer: CustomerReducer,
    cardTabs: CardTabsReducer,
    coupons: CouponsReducer,
    clientCoupons: ClientCouponsReducer,
    turnover: TurnoverReducer,
    withdrawalHistory: WithdrawalHistoryReducer,
    ingredient: IngredientReducer,
    receipt: ReceiptReducer,
});
