import { JWTPayload, TokenClaims, UserRole } from './types';
import { JWT_CLAIM_TYPES } from './constants';

export class JWTClaimsExtractor {
  static extractRole(payload: JWTPayload): UserRole | null {
    return (
      payload[JWT_CLAIM_TYPES.ROLE] as UserRole ||
      payload[JWT_CLAIM_TYPES.ROLE_ALT] as UserRole ||
      null
    );
  }

  static extractUserId(payload: JWTPayload): string | null {
    return (
      (payload[JWT_CLAIM_TYPES.USER_ID] as string) ||
      (payload[JWT_CLAIM_TYPES.NAME_IDENTIFIER] as string) ||
      null
    );
  }

  static extractEmail(payload: JWTPayload): string | null {
    return (
      (payload[JWT_CLAIM_TYPES.EMAIL] as string) ||
      null
    );
  }

  static extractFirstName(payload: JWTPayload): string | null {
    return (payload[JWT_CLAIM_TYPES.FIRST_NAME] as string) || null;
  }

  static extractLastName(payload: JWTPayload): string | null {
    return (payload[JWT_CLAIM_TYPES.LAST_NAME] as string) || null;
  }

  static extractAvatar(payload: JWTPayload): string | null {
    return (payload[JWT_CLAIM_TYPES.AVATAR] as string) || null;
  }

  static extractRoleId(payload: JWTPayload): string | null {
    return (payload[JWT_CLAIM_TYPES.ROLE_ID] as string) || null;
  }

  static extractAll(payload: JWTPayload): TokenClaims {
    return {
      userId: this.extractUserId(payload) ?? undefined,
      role: this.extractRole(payload) ?? undefined,
      roleId: this.extractRoleId(payload) ?? undefined,
      email: this.extractEmail(payload) ?? undefined,
      firstName: this.extractFirstName(payload) ?? undefined,
      lastName: this.extractLastName(payload) ?? undefined,
      avatar: this.extractAvatar(payload) ?? undefined,
      expiresAt: payload.exp ? payload.exp * 1000 : undefined,
      issuedAt: payload.iat ? payload.iat * 1000 : undefined,
    };
  }
}
