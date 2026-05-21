import { STORAGE_KEYS } from "@/shared/constants";
import { storage } from "@/shared/lib/storage";
import type { ApiEnvelope, AuthUser, LoginPayload } from "./types";

function unwrapData<T>(envelope: unknown): T | null {
  if (!envelope || typeof envelope !== "object") return null;

  let current: unknown = (envelope as ApiEnvelope<T>).data;
  if (!current || typeof current !== "object") return null;

  const record = current as Record<string, unknown>;
  if ("data" in record && record.data && typeof record.data === "object") {
    current = record.data;
  }

  return current as T;
}

export function parseLoginPayload(response: unknown): LoginPayload | null {
  const payload = unwrapData<LoginPayload>(response);
  if (!payload?.user || !payload.accessToken) return null;
  return payload;
}

export function parseMeUser(response: unknown): AuthUser | null {
  const user = unwrapData<AuthUser>(response);
  if (!user?.id || !Array.isArray(user.roles)) return null;
  return user;
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

export function getCachedAuthUser() {
  return storage.get<AuthUser>(STORAGE_KEYS.authUser);
}
