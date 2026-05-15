import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { userReducer } from './user/slice';
import { authReducer } from './auth/slice';
import { chatbotReducer } from '@/stores/chatbot/slice';
import { cartReducer } from '@/stores/cart/slice';

export const makeStore = (): EnhancedStore => {
    return configureStore({
        reducer: {
            user: userReducer,
            auth: authReducer,
            chatbot: chatbotReducer,
            cart: cartReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
    });
};

export const store: EnhancedStore = makeStore();
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>() as unknown as () => AppDispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>() as unknown as () => AppStore;
