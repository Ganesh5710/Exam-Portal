import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

class MemoryMockRedis {
  private store: Map<string, string> = new Map();
  private expirations: Map<string, number> = new Map();

  async get(key: string): Promise<string | null> {
    const expiredAt = this.expirations.get(key);
    if (expiredAt && Date.now() > expiredAt) {
      this.del(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      this.expirations.set(key, Date.now() + duration * 1000);
    } else if (mode === 'PX' && duration) {
      this.expirations.set(key, Date.now() + duration);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    this.expirations.delete(key);
    return existed ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const cleanPattern = pattern.replace('*', '');
    return Array.from(this.store.keys()).filter(key => key.includes(cleanPattern));
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    const compositeKey = `${key}::${field}`;
    this.store.set(compositeKey, value);
    return 1;
  }

  async hget(key: string, field: string): Promise<string | null> {
    const compositeKey = `${key}::${field}`;
    return this.store.get(compositeKey) || null;
  }

  async hdel(key: string, field: string): Promise<number> {
    const compositeKey = `${key}::${field}`;
    const existed = this.store.has(compositeKey);
    this.store.delete(compositeKey);
    return existed ? 1 : 0;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const prefix = `${key}::`;
    const result: Record<string, string> = {};
    for (const [k, v] of this.store.entries()) {
      if (k.startsWith(prefix)) {
        const field = k.substring(prefix.length);
        result[field] = v;
      }
    }
    return result;
  }
}

let redisClient: Redis | MemoryMockRedis;
let isRedisConnected = false;

// Try to detect Redis without flooding logs
async function tryRedisConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const testClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 0,
        connectTimeout: 1500,
        lazyConnect: true,
        retryStrategy: () => null, // Don't retry at all during probe
        showFriendlyErrorStack: false,
        enableOfflineQueue: false,
      });

      testClient.on('error', () => { /* swallow */ });

      testClient.connect()
        .then(() => {
          testClient.disconnect();
          resolve(true);
        })
        .catch(() => {
          try { testClient.disconnect(); } catch (_e) { /* ignore */ }
          resolve(false);
        });

      // Hard timeout 2s
      setTimeout(() => {
        try { testClient.disconnect(); } catch (_e) { /* ignore */ }
        resolve(false);
      }, 2000);
    } catch {
      resolve(false);
    }
  });
}

// Initialize
async function initRedis() {
  const available = await tryRedisConnection();

  if (available) {
    logger.info('Redis is available. Using real Redis client.');
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      connectTimeout: 3000,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 500, 2000);
      },
      enableOfflineQueue: false,
    });

    client.on('error', () => { /* silently ignore recurring errors */ });
    client.on('connect', () => { isRedisConnected = true; });
    client.on('close', () => { isRedisConnected = false; });

    redisClient = client;
    isRedisConnected = true;
  } else {
    logger.info('Redis not available. Using in-memory cache (fully functional without Redis).');
    redisClient = new MemoryMockRedis();
    isRedisConnected = false;
  }
}

// Synchronous init: start with memory, upgrade if Redis found
redisClient = new MemoryMockRedis();
initRedis().catch(() => {
  logger.info('Redis initialization skipped. Using in-memory cache.');
});

export { redisClient, isRedisConnected };
export default redisClient;
