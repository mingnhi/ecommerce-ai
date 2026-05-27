import { isAxiosError } from 'axios';
import type { ApiEnvelope } from '@/types/common';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng.',
  'Account is not active': 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.',
  'Email already exists': 'Email đã được sử dụng.',
  'Unauthorized access': 'Email hoặc mật khẩu không đúng.',
  'Invalid request data': 'Dữ liệu không hợp lệ.',
  CredentialsSignin: 'Email hoặc mật khẩu không đúng.',
  AccessDenied: 'Bạn đã hủy đăng nhập Google.',
  Configuration: 'Đăng nhập thất bại. Vui lòng thử lại.',
  CallbackRouteError: 'Đăng nhập thất bại. Vui lòng thử lại.',
  OAuthAccountNotLinked: 'Tài khoản Google này chưa được liên kết.',
  GoogleAuthFailed: 'Đăng nhập Google thất bại.',
  'Current password is incorrect': 'Mật khẩu hiện tại không đúng.',
  'New password must be different from current password': 'Mật khẩu mới phải khác mật khẩu hiện tại.',
  'newPassword must be longer than or equal to 6 characters': 'Mật khẩu mới phải có ít nhất 6 ký tự.',
  'currentPassword should not be empty': 'Vui lòng nhập mật khẩu hiện tại.',
  'Register successfully. Please verify OTP.': 'Đăng ký thành công! Vui lòng xác thực mã OTP.',
};

export function normalizeApiMessage(message: string | string[] | undefined): string | null {
  if (!message) return null;
  const text = Array.isArray(message) ? message.join(', ') : message;
  const trimmed = text.trim();
  return trimmed || null;
}

export function localizeAuthMessage(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}

export function isApiSuccess<T>(response: ApiEnvelope<T> | unknown): response is ApiEnvelope<T> {
  if (!response || typeof response !== 'object') return false;
  const r = response as ApiEnvelope<T> & { succeeded?: boolean };
  return r.status === 'success' || r.succeeded === true;
}

export function getEnvelopeData<T>(response: ApiEnvelope<T> | unknown): T | undefined {
  if (!isApiSuccess(response)) return undefined;
  return (response as ApiEnvelope<T>).data;
}

export function getApiMessage(
  response: { message?: string | string[]; messages?: string[] } | null | undefined,
  fallback: string,
): string {
  const fromMessage = normalizeApiMessage(response?.message);
  if (fromMessage) return localizeAuthMessage(fromMessage);
  const fromMessages = response?.messages?.filter(Boolean).join(', ');
  if (fromMessages) return localizeAuthMessage(fromMessages);
  return fallback;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiEnvelope<null> | undefined;
    const msg = normalizeApiMessage(body?.message);
    if (msg) return localizeAuthMessage(msg);
    const legacy = body?.messages?.filter(Boolean).join(', ');
    if (legacy) return localizeAuthMessage(legacy);
    if (err.response?.status === 401) {
      const bodyMsg = normalizeApiMessage(body?.message);
      if (bodyMsg) return localizeAuthMessage(bodyMsg);
      return 'Email hoặc mật khẩu không đúng.';
    }
    if (err.response?.status === 409) return 'Email đã được sử dụng.';
    if (err.response?.status === 400) return 'Dữ liệu không hợp lệ.';
    if (err.response?.status && err.response.status >= 500) {
      return 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.';
    }
  }
  if (err instanceof Error && err.message.trim()) {
    return localizeAuthMessage(err.message);
  }
  return fallback;
}

export function getSignInErrorMessage(error: string | undefined, fallback: string): string {
  if (!error?.trim()) return fallback;
  return localizeAuthMessage(error);
}
