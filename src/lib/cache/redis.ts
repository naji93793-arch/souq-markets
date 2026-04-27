// src/lib/cache/redis.ts
// Unified cache layer: uses Redis when available, falls back to in-memory Map

import { Redis } from 'ioredis';

// ─── In-memory fallback ───────────────────────────────────────────────────────
interface MemCacheEntry {
  value: string;
  expiresAt: number;
}
const memCache = new Map<string, MemCacheEntry>();

// ─── Redis client ─────────────────────────────────────────────────────────────
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  
  const url = process.env.REDIS_URL;
  if (!url) return null;
  
  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 3000,
    });
    redisClient.on('error', (err) => {
      console.warn('[Cache] Redis error, using in-memory fallback:', err.message);
      redisClient = null;
    });
    return redisClient;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null if missing or expired.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  
  if (redis) {
    try {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      // fall through to memory cache
    }
  }
  
  // In-memory fallback
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return JSON.parse(entry.value);
}

/**
 * Set a cached value with TTL in seconds.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  const serialized = JSON.stringify(value);
  const redis = getRedis();
  
  if (redis) {
    try {
      await redis.set(key, serialized, 'EX', ttlSeconds);
      return;
    } catch {
      // fall through to memory cache
    }
  }
  
  memCache.set(key, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete a cached key.
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.del(key);
    } catch { /* ignore */ }
  }
  memCache.delete(key);
}

/**
 * Cache-aside helper: fetches from cache or runs fetcher and caches result.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

// Cache key helpers
export const CacheKeys = {
  metals: (currency: string) => `metals:${currency}`,
  metalHistory: (metal: string, range: string) => `metals:history:${metal}:${range}`,
  crypto: () => 'crypto:all',
  cryptoHistory: (symbol: string, range: string) => `crypto:history:${symbol}:${range}`,
  forex: () => 'forex:all',
  dashboard: () => 'dashboard:summary',
} as const;
