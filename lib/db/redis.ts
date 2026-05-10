import { Redis } from '@upstash/redis';

const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

// Dummy implementation for development if variables are not set
const isRedisConfigured = redisUrl && redisToken;

export const redis = isRedisConfigured 
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Helper functions as defined in Phase 1 scope
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  return redis.get<T>(key);
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function deleteCache(key: string): Promise<void> {
  if (!redis) return;
  await redis.del(key);
}

export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
  if (!redis) return { allowed: true, remaining: limit };
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current)
  };
}

export async function blacklistToken(token: string, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  await setCache(`bl_${token}`, 'true', ttlSeconds);
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  if (!redis) return false;
  const isBlacklisted = await getCache<string>(`bl_${token}`);
  return !!isBlacklisted;
}
