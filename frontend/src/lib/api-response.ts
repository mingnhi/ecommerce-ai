import { isAxiosError } from 'axios';
import type { ApiEnvelope } from '@/types/common';

export function isApiSuccess<T>(response: ApiEnvelope<T> | unknown): response is ApiEnvelope<T> {
  if (!response || typeof response !== 'object') return false;
  const r = response as ApiEnvelope<T> & { succeeded?: boolean };
  return r.status === 'success' || r.succeeded === true;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiEnvelope<null> | undefined;
    const msg = body?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
    if (Array.isArray(msg) && msg[0]) return String(msg[0]);
    if (err.response?.status === 401) return 'Email hoặc mật khẩu không đúng.';
    if (err.response?.status === 409) return 'Email đã được sử dụng.';
    if (err.response?.status === 400) return 'Dữ liệu không hợp lệ.';
  }
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}
