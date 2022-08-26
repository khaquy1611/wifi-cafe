import { useMemo } from 'react';
import { createStore, applyMiddleware, Store, Reducer, AnyAction } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createWrapper, MakeStore } from 'next-redux-wrapper';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApplicationState, rootReducer } from './store';

const persistConfig = {
    key: 'nextjs',
    storage: AsyncStorage,
    whitelist: ['login', 'groupIDState', 'bookingProducts'],
    blacklist: [
        'groupStores',
        'groupShops',
        'adminUsers',
        'department',
        'category',
        'products',
        'clientCategory',
        'clientProducts',
        'imageManager',
        'clientStoreInfo',
        'orders',
        'paymentMethods',
        'allOrders',
        'notification',
        'turnover',
        'withrawalHistory',
    ],
};

export const makeConfiguredStore = (reducer: Reducer<any, any> = rootReducer) =>
    createStore(reducer, undefined, applyMiddleware(thunkMiddleware));

const makeStore: MakeStore<ApplicationState, any> = () => {
    const isServer = typeof window === 'undefined';

    if (isServer) {
        return makeConfiguredStore(rootReducer);
    }
    const persistedReducer = persistReducer(persistConfig, rootReducer);
    const store: any = makeConfiguredStore(persistedReducer);

    store.__persistor = persistStore(store); // Nasty hack

    return store;
};

const wrapper = createWrapper(makeStore);

export const useStore = (initialState: Store<ApplicationState, AnyAction>) => {
    const store = useMemo(() => initialState, [initialState]);
    return store;
};

export default wrapper;
