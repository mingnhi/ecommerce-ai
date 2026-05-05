export const JWT_CLAIM_TYPES = {
  ROLE: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ROLE_ALT: 'role',
  ROLE_ID: 'roleId',
  USER_ID: 'id',
  NAME_IDENTIFIER: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  EMAIL: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  AVATAR: 'avatar',
  EXP: 'exp',
  IAT: 'iat',
  ISS: 'iss',
} as const;

export const JWT_ERROR_MESSAGES = {
  INVALID_FORMAT: 'Invalid JWT token format',
  INVALID_PAYLOAD: 'Invalid JWT payload',
  EXPIRED: 'JWT token has expired',
  MALFORMED: 'Malformed JWT token',
} as const;
