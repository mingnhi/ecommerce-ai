import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

function processQueue(error: any) {
    failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(undefined)));
    failedQueue = [];
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(original));
            }
            isRefreshing = true;
            try {
                await api.post('/auth/refresh');
                processQueue(null);
                return api(original);
            } catch (e) {
                processQueue(e);
                useAuthStore.getState().logout();
                window.location.href = '/admin/login';
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);

export default api;
