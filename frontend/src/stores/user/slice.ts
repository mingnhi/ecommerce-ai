import { createSlice, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { IUser } from '@/types/user';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { clearUserAction, setAccessTokenAction, setRefreshTokenAction, setUserAction } from './actions';

const initialAccess = (getCookie('accessToken') as string) || '';
const initialRefresh = (getCookie('refreshToken') as string) || '';

export interface UserState {
    user: IUser | null;
    accessToken: string;
    refreshToken: string;
}

const initialState: UserState = {
    user: null,
    accessToken: initialAccess,
    refreshToken: initialRefresh,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder: ActionReducerMapBuilder<UserState>) => {
        builder.addCase(setUserAction, (state: UserState, action: PayloadAction<IUser>) => {
            state.user = action.payload;
        });

        builder.addCase(setAccessTokenAction, (state: UserState, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            setCookie('accessToken', action.payload, { maxAge: 60 * 60 * 24 });
        });

        builder.addCase(setRefreshTokenAction, (state: UserState, action: PayloadAction<string>) => {
            state.refreshToken = action.payload;
            setCookie('refreshToken', action.payload, { maxAge: 60 * 60 * 24 * 7 });
        });

        builder.addCase(clearUserAction, (state: UserState) => {
            state.user = null;
            state.accessToken = '';
            state.refreshToken = '';
            deleteCookie('accessToken');
            deleteCookie('refreshToken');
        });
    },
});

export const userReducer = userSlice.reducer;