import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { storage } from "@/shared/lib/storage";
import { STORAGE_KEYS } from "@/shared/constants";

const BASE_URL = import.meta.env.VITE_API_URL;

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  accessToken: string;
}

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.get(STORAGE_KEYS.accessToken);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
httpClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    const url = originalRequest?.url ?? "";
    const isPublicAuth = /\/auth\/(login|register|refresh-token)/.test(url);

    if (error.response?.status === 401 && !originalRequest?._retry && !isPublicAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(httpClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.get<string>(STORAGE_KEYS.refreshToken);

        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        storage.set(STORAGE_KEYS.accessToken, accessToken);
        if (newRefreshToken) {
          storage.set(STORAGE_KEYS.refreshToken, newRefreshToken);
        }

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return httpClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        storage.clear();

        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);