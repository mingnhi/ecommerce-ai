import { DecodedToken } from './types';

interface CacheEntry {
  token: string;
  decoded: DecodedToken;
  timestamp: number;
}

class JWTCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000;
  private readonly MAX_SIZE = 50;

  get(token: string): DecodedToken | null {
    const entry = this.cache.get(token);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(token);
      return null;
    }

    return entry.decoded;
  }

  set(token: string, decoded: DecodedToken): void {
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(token, {
      token,
      decoded,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const jwtCache = new JWTCache();

if (typeof window !== 'undefined') {
  setInterval(() => jwtCache.clearExpired(), 60000);
}
