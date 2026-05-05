import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import {
    loginAction,
    loginSuccessAction,
    loginFailureAction,
    registerAction,
    registerSuccessAction,
    registerFailureAction,
    clearAuthAction,
    setTokensAction,
} from './actions';
import { AuthenticatedResponse, AuthError } from '@/apis/auth/types';

export interface AuthState {
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    error: AuthError | null;
}

const initialAccess = (getCookie('accessToken') as string) || null;
const initialRefresh = (getCookie('refreshToken') as string) || null;

const initialState: AuthState = {
    token: initialAccess,
    refreshToken: initialRefresh,
    loading: false,
    error: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginAction, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginSuccessAction, (state, action: PayloadAction<AuthenticatedResponse>) => {
                state.loading = false;
                state.error = null;
                if (action.payload.token) {
                    state.token = action.payload.token;
                    setCookie('accessToken', action.payload.token, { maxAge: 60 * 60 * 24 });
                }
                if (action.payload.refreshToken) {
                    state.refreshToken = action.payload.refreshToken;
                    setCookie('refreshToken', action.payload.refreshToken, { maxAge: 60 * 60 * 24 * 7 });
                }
            })
            .addCase(loginFailureAction, (state, action: PayloadAction<AuthError>) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Register
        builder
            .addCase(registerAction, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerSuccessAction, (state, action: PayloadAction<AuthenticatedResponse>) => {
                state.loading = false;
                state.error = null;
                if (action.payload.token) {
                    state.token = action.payload.token;
                    setCookie('accessToken', action.payload.token, { maxAge: 60 * 60 * 24 });
                }
                if (action.payload.refreshToken) {
                    state.refreshToken = action.payload.refreshToken;
                    setCookie('refreshToken', action.payload.refreshToken, { maxAge: 60 * 60 * 24 * 7 });
                }
            })
            .addCase(registerFailureAction, (state, action: PayloadAction<AuthError>) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Clear Auth
        builder.addCase(clearAuthAction, (state) => {
            state.token = null;
            state.refreshToken = null;
            state.error = null;
            deleteCookie('accessToken');
            deleteCookie('refreshToken');
        });

        // Set Tokens
        builder.addCase(setTokensAction, (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            setCookie('accessToken', action.payload.token, { maxAge: 60 * 60 * 24 });
            setCookie('refreshToken', action.payload.refreshToken, { maxAge: 60 * 60 * 24 * 7 });
        });
    },
});

export const authReducer = authSlice.reducer;

