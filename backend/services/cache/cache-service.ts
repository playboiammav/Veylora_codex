interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  storedAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private requestTimestamps = new Map<string, number[]>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
      storedAt: Date.now(),
    });

    // Cleanup old keys periodically
    if (this.cache.size > 2000) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (now > v.expiresAt) {
          this.cache.delete(k);
        }
      }
    }
  }

  // Rate limit helper: e.g., max 180 requests per 300 seconds
  checkRateLimit(domain: string, maxRequests: number = 180, windowSeconds: number = 300): boolean {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const timestamps = this.requestTimestamps.get(domain) || [];
    const filtered = timestamps.filter((t) => t > windowStart);

    if (filtered.length >= maxRequests) {
      return false; // rate limited
    }

    filtered.push(now);
    this.requestTimestamps.set(domain, filtered);
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const serverCache = new MemoryCache();
