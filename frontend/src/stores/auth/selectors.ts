import { createSelector, Selector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { AuthState } from './slice';
import { AuthError } from '@/apis/auth/types';

const selectAuthState = (state: RootState): AuthState => state.auth;

export const selectAuthToken: Selector<RootState, string | null> = createSelector(
    [selectAuthState],
    (auth: AuthState): string | null => auth.token
);

export const selectAuthRefreshToken: Selector<RootState, string | null> = createSelector(
    [selectAuthState],
    (auth: AuthState): string | null => auth.refreshToken
);

export const selectAuthLoading: Selector<RootState, boolean> = createSelector(
    [selectAuthState],
    (auth: AuthState): boolean => auth.loading
);

export const selectAuthError: Selector<RootState, AuthError | null> = createSelector(
    [selectAuthState],
    (auth: AuthState): AuthError | null => auth.error
);

const selectUserAccessToken = (state: RootState): string => state.user.accessToken;

export const selectIsAuthenticated: Selector<RootState, boolean> = createSelector(
    [selectAuthToken, selectUserAccessToken],
    (token, accessToken): boolean => !!(token || accessToken)
);

