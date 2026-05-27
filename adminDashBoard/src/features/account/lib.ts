import { isAxiosError } from "axios";
import { parseLoginErrorMessage } from "@/features/auth/lib";
import type { UserProfile } from "./types";

type ApiBody = {
  status?: string;
  message?: string | string[];
  data?: unknown;
};

const API_MESSAGES: Record<string, string> = {
  "Current password is incorrect": "Mật khẩu hiện tại không đúng.",
  "New password must be different from current password": "Mật khẩu mới phải khác mật khẩu hiện tại.",
  "newPassword must be longer than or equal to 6 characters": "Mật khẩu mới phải có ít nhất 6 ký tự.",
};

function localize(message: string) {
  return API_MESSAGES[message] ?? message;
}

function normalizeMessage(message: string | string[] | undefined) {
  if (!message) return null;
  const text = Array.isArray(message) ? message.join(", ") : message;
  return text.trim() || null;
}

export function isApiSuccess(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as ApiBody;
  return record.status === "success";
}

export function getApiMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as ApiBody;
  const msg = normalizeMessage(record.message);
  return msg ? localize(msg) : fallback;
}

export function parseApiError(err: unknown, fallback: string) {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiBody | undefined;
    const msg = normalizeMessage(body?.message);
    if (msg) return localize(msg);
    if (err.response?.status === 400) return "Dữ liệu không hợp lệ.";
    if (err.response?.status === 401) return "Phiên đăng nhập không hợp lệ.";
  }
  return parseLoginErrorMessage(err, fallback);
}

export function parseProfile(payload: unknown): UserProfile | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as ApiBody;
  if (record.data && typeof record.data === "object") {
    return record.data as UserProfile;
  }
  return record as UserProfile;
}

export function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
