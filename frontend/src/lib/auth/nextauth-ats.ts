import { KEYS } from '@/apis/auth/keys';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44389';

export function isAccessTokenExpired(accessToken: string): boolean {
  try {
    const [, payload] = accessToken.split('.');
    if (!payload) return true;
    const decoded =
      typeof Buffer !== 'undefined'
        ? Buffer.from(payload, 'base64url').toString('utf8')
        : atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { exp } = JSON.parse(decoded) as { exp?: number };
    return exp != null && Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export async function postToAts(path: string, body: object): Promise<Response> {
  const url = `${API}${path}`;
  const skipTls = url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1');
  const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (skipTls) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } finally {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev;
  }
}

export function isAtsSuccess(raw: Record<string, unknown>): boolean {
  return raw?.succeeded === true || raw?.Status === true || raw?.status === true;
}

export function getAtsData(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  return (raw?.data ?? raw?.Data) as Record<string, unknown> | undefined;
}

export function getAtsTokenPair(
  d: Record<string, unknown> | undefined
): { token: string; refreshToken: string } {
  return {
    token: (d?.token ?? d?.Token ?? '') as string,
    refreshToken: (d?.refreshToken ?? d?.RefreshToken ?? '') as string,
  };
}

export async function refreshAtsTokens(
  accessToken: string,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const res = await postToAts(KEYS.TOKEN_REFRESH, { accessToken, refreshToken });
  if (!res.ok) return null;
  const raw = (await res.json()) as Record<string, unknown>;
  if (!isAtsSuccess(raw)) return null;
  const data = getAtsData(raw);
  const { token, refreshToken: newRefresh } = getAtsTokenPair(data);
  return token ? { accessToken: token, refreshToken: newRefresh || refreshToken } : null;
}
