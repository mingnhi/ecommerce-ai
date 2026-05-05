import { DecodedToken, JWTPayload } from './types';
import { JWT_ERROR_MESSAGES } from './constants';

export class JWTDecoder {
  private static validateTokenFormat(token: string): boolean {
    const parts = token.split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  private static base64UrlDecode(str: string): string {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

      const binaryString = atob(padded);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new TextDecoder().decode(bytes);
    } catch {
      throw new Error(JWT_ERROR_MESSAGES.MALFORMED);
    }
  }

  static decode(token: string): DecodedToken | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    if (!this.validateTokenFormat(token)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(JWT_ERROR_MESSAGES.INVALID_FORMAT);
      }
      return null;
    }

    try {
      const parts = token.split('.');
      const header = JSON.parse(this.base64UrlDecode(parts[0])) as Record<string, unknown>;
      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JWTPayload;

      return { header, payload };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('JWT decode error:', error);
      }
      return null;
    }
  }

  static isExpired(payload: JWTPayload): boolean {
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  }
}
