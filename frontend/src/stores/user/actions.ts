import { createAction } from '@reduxjs/toolkit';
import { IUser } from '@/types/user';
import {
    SET_USER,
    SET_ACCESS_TOKEN,
    SET_REFRESH_TOKEN,
    CLEAR_USER,
} from './constants';

export const setUserAction = createAction<IUser>(SET_USER);
export const setAccessTokenAction = createAction<string>(SET_ACCESS_TOKEN);
export const setRefreshTokenAction = createAction<string>(SET_REFRESH_TOKEN);
export const clearUserAction = createAction(CLEAR_USER);