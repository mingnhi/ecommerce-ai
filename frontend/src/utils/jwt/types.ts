export interface JWTPayload {
  [key: string]: unknown;
  exp?: number;
  iat?: number;
  iss?: string;
  id?: string;
  role?: string;
  roleId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email'?: string;
}

export interface DecodedToken {
  payload: JWTPayload;
  header: Record<string, unknown>;
}

export type UserRole = 'Admin' | 'User' | 'Company' | string;

export interface TokenClaims {
  userId?: string;
  role?: UserRole;
  roleId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  expiresAt?: number;
  issuedAt?: number;
}
