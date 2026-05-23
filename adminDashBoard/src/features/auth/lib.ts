import { isAxiosError } from "axios";
import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib/storage";
import type { AuthUser, LoginPayload } from "./types";

type ApiErrorBody = {
  message?: string | string[];
};

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  "Invalid email or password": "Email hoặc mật khẩu không đúng.",
  "Account is not active": "Tài khoản chưa được kích hoạt hoặc đã bị khóa.",
  "Unauthorized access": "Email hoặc mật khẩu không đúng.",
  "Invalid request data": "Dữ liệu không hợp lệ.",
};

function normalizeApiMessage(message: string | string[] | undefined): string | null {
  if (!message) return null;
  const text = Array.isArray(message) ? message.join(", ") : message;
  const trimmed = text.trim();
  return trimmed || null;
}

function localizeLoginMessage(message: string): string {
  return LOGIN_ERROR_MESSAGES[message] ?? message;
}

export function parseLoginErrorMessage(
  err: unknown,
  fallback = "Đăng nhập thất bại. Vui lòng thử lại."
): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    const fromBody = normalizeApiMessage(body?.message);
    if (fromBody) return localizeLoginMessage(fromBody);

    const status = err.response?.status;
    if (status === 401) return "Email hoặc mật khẩu không đúng.";
    if (status === 400) return "Thông tin đăng nhập không hợp lệ.";
    if (status === 403) return "Bạn không có quyền truy cập.";
    if (status && status >= 500) return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }

  if (err instanceof Error && err.message.trim()) {
    return localizeLoginMessage(err.message);
  }

  return fallback;
}

function isLoginPayload(record: Record<string, unknown>) {
  return Boolean(record.accessToken && record.refreshToken);
}

function isAuthUser(record: Record<string, unknown>) {
  return Boolean(record.id && record.email);
}

function unwrapData<T>(envelope: unknown): T | null {
  if (!envelope || typeof envelope !== "object") return null;

  let current: unknown = envelope;

  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== "object") return null;

    const record = current as Record<string, unknown>;
    if (isLoginPayload(record) || isAuthUser(record)) {
      return current as T;
    }

    if ("data" in record && record.data && typeof record.data === "object") {
      current = record.data;
      continue;
    }

    return current as T;
  }

  return null;
}

export function parseLoginPayload(response: unknown): LoginPayload | null {
  const payload = unwrapData<Record<string, unknown>>(response);
  if (!payload?.accessToken || !payload.refreshToken) return null;

  const userRaw = payload.user;
  if (!userRaw || typeof userRaw !== "object") return null;

  const user = normalizeAuthUser(userRaw as Record<string, unknown>);
  if (!user) return null;

  return {
    user,
    accessToken: String(payload.accessToken),
    refreshToken: String(payload.refreshToken),
  };
}

function parseRoleNames(roles: unknown): string[] {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => {
      if (typeof role === "string") return role;
      if (role && typeof role === "object" && "name" in role) {
        return String((role as { name: string }).name);
      }
      return "";
    })
    .filter(Boolean);
}

function parsePermissionKeys(source: Record<string, unknown>): string[] {
  if (Array.isArray(source.permissions)) {
    return [...new Set(source.permissions.filter((p): p is string => typeof p === "string"))];
  }

  const roles = source.roles;
  if (!Array.isArray(roles)) return [];

  const merged: string[] = [];
  for (const role of roles) {
    if (!role || typeof role !== "object" || !("permissions" in role)) continue;
    const perms = (role as { permissions: unknown }).permissions;
    if (!Array.isArray(perms)) continue;
    perms.forEach((p) => {
      if (typeof p === "string") merged.push(p);
      if (p && typeof p === "object" && "action" in p && "resource" in p) {
        const resource = String((p as { resource: string }).resource).toLowerCase();
        const action = String((p as { action: string }).action);
        merged.push(`${resource}:${action}`);
      }
    });
  }

  return [...new Set(merged)];
}

function normalizeAuthUser(raw: Record<string, unknown>): AuthUser | null {
  if (!raw.id || !raw.email) return null;

  const roles = parseRoleNames(raw.roles);
  const permissions = parsePermissionKeys(raw);

  return {
    id: String(raw.id),
    email: String(raw.email),
    fullName: String(raw.fullName ?? ""),
    status: String(raw.status ?? ""),
    roles,
    permissions,
  };
}

export function parseMeUser(response: unknown): AuthUser | null {
  const raw = unwrapData<Record<string, unknown>>(response);
  if (!raw) return null;
  return normalizeAuthUser(raw);
}

export function isAdmin(user: AuthUser) {
  return user.roles.includes("ADMIN");
}

export function saveAuthSession(payload: LoginPayload) {
  storage.set(STORAGE_KEYS.accessToken, payload.accessToken);
  storage.set(STORAGE_KEYS.refreshToken, payload.refreshToken);
  storage.set(STORAGE_KEYS.authUser, payload.user);
}

export function clearAuthSession() {
  storage.remove(STORAGE_KEYS.accessToken);
  storage.remove(STORAGE_KEYS.refreshToken);
  storage.remove(STORAGE_KEYS.authUser);
}

export function hasAuthToken() {
  return Boolean(storage.get<string>(STORAGE_KEYS.accessToken));
}

export function getCachedAuthUser(): AuthUser | null {
  const user = storage.get<AuthUser>(STORAGE_KEYS.authUser);
  if (!user) return null;
  return {
    ...user,
    roles: user.roles ?? [],
    permissions: user.permissions ?? [],
  };
}
