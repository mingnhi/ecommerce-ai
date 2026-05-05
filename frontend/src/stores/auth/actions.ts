import { createAction } from '@reduxjs/toolkit';
import {
    LOGIN,
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    REGISTER,
    REGISTER_SUCCESS,
    REGISTER_FAILURE,
    CLEAR_AUTH,
    SET_TOKENS,
} from './constants';
import { LoginRequest, RegisterRequest, AuthenticatedResponse, AuthError } from '@/apis/auth/types';

export const loginAction = createAction<LoginRequest>(LOGIN);
export const loginSuccessAction = createAction<AuthenticatedResponse>(LOGIN_SUCCESS);
export const loginFailureAction = createAction<AuthError>(LOGIN_FAILURE);

export const registerAction = createAction<RegisterRequest>(REGISTER);
export const registerSuccessAction = createAction<AuthenticatedResponse>(REGISTER_SUCCESS);
export const registerFailureAction = createAction<AuthError>(REGISTER_FAILURE);

export const clearAuthAction = createAction(CLEAR_AUTH);
export const setTokensAction = createAction<{ token: string; refreshToken: string }>(SET_TOKENS);

