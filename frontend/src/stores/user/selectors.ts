import { createSelector, Selector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { UserState } from './slice';
import { IUser } from '@/types/user';
import { getRoleFromToken } from '@/utils/jwt';

const selectUserState = (state: RootState): UserState => state.user;

/**
 * Chỉ trả về state.user (từ API /me). Không dùng getUserFromToken vì JWT có thể chứa
 * thông tin cũ (firstName, lastName) gây hiện tượng nhấp nháy khi refresh.
 */
export const selectUser: Selector<RootState, IUser | null> = createSelector(
    [selectUserState],
    (state: UserState): IUser | null => state.user
);

export const selectAccessToken: Selector<RootState, string> = createSelector(
    [selectUserState],
    (state: UserState): string => state.accessToken
);

export const selectRefreshToken: Selector<RootState, string> = createSelector(
    [selectUserState],
    (state: UserState): string => state.refreshToken
);

export const selectUserRole: Selector<RootState, string | null> = createSelector(
    [selectUserState],
    (state: UserState): string | null => {
        if (state.user?.roles) {
            return Array.isArray(state.user.roles) ? state.user.roles[0] : state.user.roles;
        }
        if (typeof window === 'undefined') return null;
        return getRoleFromToken(state.accessToken);
    }
);

// Dùng selectIsAuthenticated từ @/stores/auth/selectors (token-based)
// Selector này không dùng để tránh nhầm lẫn với auth/selectors

