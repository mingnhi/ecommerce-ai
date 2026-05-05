import axios, { AxiosError, AxiosResponse, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { signOut } from 'next-auth/react';
import { IAxiosResponse } from '@/types/common';
import { envConfig } from '@/lib/const';
import { store } from '@/stores';
import { clearUserAction, setAccessTokenAction, setRefreshTokenAction, setUserAction } from '@/stores/user/actions';
import { clearAuthAction, setTokensAction } from '@/stores/auth/actions';
import { getRoleFromToken } from '@/utils/jwt';

const safeJsonParse = (data: string): unknown => {
  const t = typeof data === 'string' ? data.trim() : '';
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
};

const instance = axios.create({
  baseURL: `${envConfig.API_URL}/api`,
  transformResponse: [(data) => (typeof data === 'string' ? safeJsonParse(data) : data)],
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
    const state = store.getState();
    const accessToken = state.user.accessToken;
    const refreshToken = state.user.refreshToken;

    if (!accessToken || !refreshToken) {
        throw new Error('No tokens available');
    }

    const url = `${envConfig.API_URL}/api/token/refresh`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
    });
    const data = (await res.json()) as {
        succeeded?: boolean;
        status?: boolean;
        data?: { token?: string; refreshToken?: string };
    } | null;

    if (res.ok && (data?.succeeded || data?.status)) {
        const newAccessToken = data?.data?.token;
        const newRefreshToken = data?.data?.refreshToken;

        if (newAccessToken) {
            store.dispatch(setAccessTokenAction(newAccessToken));
            const state = store.getState();
            const currentUser = state.user.user;
            if (currentUser) {
                store.dispatch(setUserAction({
                    ...currentUser,
                    roles: getRoleFromToken(newAccessToken) ?? currentUser.roles,
                }));
            }
        }
        if (newRefreshToken) {
            store.dispatch(setRefreshTokenAction(newRefreshToken));
        }
        if (newAccessToken) {
            store.dispatch(setTokensAction({ token: newAccessToken, refreshToken: newRefreshToken || refreshToken }));
        }

        if (newAccessToken) return newAccessToken;
    }

    throw new Error('Refresh token failed');
};

const handleSuccess = (response: AxiosResponse) => {
    return response.data;
};

const handleError = async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const originalError = error.response?.data as IAxiosResponse;
    const statusCode = error.response?.status;

    if (statusCode === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return instance(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            store.dispatch(clearUserAction());
            store.dispatch(clearAuthAction());
            signOut({ redirect: false });
            return Promise.reject(originalError || error);
        } finally {
            isRefreshing = false;
        }
    }

    const errorMessage = (originalError as any)?.message || (originalError as any)?.messages?.[0] || '';
    const isPermissionError = errorMessage.includes('Bạn không có quyền thực hiện chức năng này');

    if (statusCode === 403 && !isPermissionError) {
        store.dispatch(clearUserAction());
        store.dispatch(clearAuthAction());
    }

    return Promise.reject(originalError || error);
};

instance.interceptors.request.use(
    async (config) => {
        const state = store.getState();
        const token = state.user.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(handleSuccess, handleError);

interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'delete' | 'patch'> {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

export const request = instance as unknown as CustomAxiosInstance;
