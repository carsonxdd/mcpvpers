import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis | null {
  if (globalForRedis.redis) return globalForRedis.redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  globalForRedis.redis = new Redis(url, { maxRetriesPerRequest: 2 });
  return globalForRedis.redis;
}
