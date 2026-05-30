import { JWTDecoder } from './decoder';
import { JWTClaimsExtractor } from './claims';
import { jwtCache } from './cache';
import { DecodedToken, TokenClaims, UserRole } from './types';
import type { IUser } from '@/types/user';

export const decodeJWT = (token: string | null | undefined): DecodedToken | null => {
  if (!token) return null;

  const cached = jwtCache.get(token);
  if (cached) return cached;

  const decoded = JWTDecoder.decode(token);
  if (decoded) {
    jwtCache.set(token, decoded);
  }

  return decoded;
};

export const getRoleFromToken = (token: string | null | undefined): UserRole | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  if (JWTDecoder.isExpired(decoded.payload)) {
    jwtCache.clear();
    return null;
  }

  return JWTClaimsExtractor.extractRole(decoded.payload);
};

export const getUserIdFromToken = (token: string | null | undefined): string | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return JWTClaimsExtractor.extractUserId(decoded.payload);
};

export const getEmailFromToken = (token: string | null | undefined): string | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return JWTClaimsExtractor.extractEmail(decoded.payload);
};

export const getClaimsFromToken = (token: string | null | undefined): TokenClaims | null => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;

  if (JWTDecoder.isExpired(decoded.payload)) {
    jwtCache.clear();
    return null;
  }

  return JWTClaimsExtractor.extractAll(decoded.payload);
};

export const isTokenExpired = (token: string | null | undefined): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded) return true;

  return JWTDecoder.isExpired(decoded.payload);
};

export function getUserFromToken(token: string | null | undefined): IUser | null {
  const claims = getClaimsFromToken(token);
  if (!claims) return null;

  const fullName = [claims.firstName, claims.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: claims.userId ?? '',
    email: claims.email ?? '',
    fullName: fullName || undefined,
    image: claims.avatar ?? undefined,
    roles: claims.role ? [claims.role] : undefined,
  };
}

export { JWTDecoder, JWTClaimsExtractor, jwtCache };
export type { DecodedToken, TokenClaims, UserRole, JWTPayload } from './types';
