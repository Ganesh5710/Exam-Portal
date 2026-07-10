"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisConnected = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
class MemoryMockRedis {
    store = new Map();
    expirations = new Map();
    async get(key) {
        const expiredAt = this.expirations.get(key);
        if (expiredAt && Date.now() > expiredAt) {
            this.del(key);
            return null;
        }
        return this.store.get(key) || null;
    }
    async set(key, value, mode, duration) {
        this.store.set(key, value);
        if (mode === 'EX' && duration) {
            this.expirations.set(key, Date.now() + duration * 1000);
        }
        else if (mode === 'PX' && duration) {
            this.expirations.set(key, Date.now() + duration);
        }
        return 'OK';
    }
    async del(key) {
        const existed = this.store.has(key);
        this.store.delete(key);
        this.expirations.delete(key);
        return existed ? 1 : 0;
    }
    async keys(pattern) {
        const cleanPattern = pattern.replace('*', '');
        return Array.from(this.store.keys()).filter(key => key.includes(cleanPattern));
    }
    async hset(key, field, value) {
        const compositeKey = `${key}::${field}`;
        this.store.set(compositeKey, value);
        return 1;
    }
    async hget(key, field) {
        const compositeKey = `${key}::${field}`;
        return this.store.get(compositeKey) || null;
    }
    async hdel(key, field) {
        const compositeKey = `${key}::${field}`;
        const existed = this.store.has(compositeKey);
        this.store.delete(compositeKey);
        return existed ? 1 : 0;
    }
    async hgetall(key) {
        const prefix = `${key}::`;
        const result = {};
        for (const [k, v] of this.store.entries()) {
            if (k.startsWith(prefix)) {
                const field = k.substring(prefix.length);
                result[field] = v;
            }
        }
        return result;
    }
}
let redisClient;
let isRedisConnected = false;
exports.isRedisConnected = isRedisConnected;
// Try to detect Redis without flooding logs
async function tryRedisConnection() {
    return new Promise((resolve) => {
        try {
            const testClient = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 0,
                connectTimeout: 1500,
                lazyConnect: true,
                retryStrategy: () => null, // Don't retry at all during probe
                showFriendlyErrorStack: false,
                enableOfflineQueue: false,
            });
            testClient.on('error', () => { });
            testClient.connect()
                .then(() => {
                testClient.disconnect();
                resolve(true);
            })
                .catch(() => {
                try {
                    testClient.disconnect();
                }
                catch (_e) { /* ignore */ }
                resolve(false);
            });
            // Hard timeout 2s
            setTimeout(() => {
                try {
                    testClient.disconnect();
                }
                catch (_e) { /* ignore */ }
                resolve(false);
            }, 2000);
        }
        catch {
            resolve(false);
        }
    });
}
// Initialize
async function initRedis() {
    const available = await tryRedisConnection();
    if (available) {
        logger_1.logger.info('Redis is available. Using real Redis client.');
        const client = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: 2,
            connectTimeout: 3000,
            retryStrategy: (times) => {
                if (times > 3)
                    return null;
                return Math.min(times * 500, 2000);
            },
            enableOfflineQueue: false,
        });
        client.on('error', () => { });
        client.on('connect', () => { exports.isRedisConnected = isRedisConnected = true; });
        client.on('close', () => { exports.isRedisConnected = isRedisConnected = false; });
        exports.redisClient = redisClient = client;
        exports.isRedisConnected = isRedisConnected = true;
    }
    else {
        logger_1.logger.info('Redis not available. Using in-memory cache (fully functional without Redis).');
        exports.redisClient = redisClient = new MemoryMockRedis();
        exports.isRedisConnected = isRedisConnected = false;
    }
}
// Synchronous init: start with memory, upgrade if Redis found
exports.redisClient = redisClient = new MemoryMockRedis();
initRedis().catch(() => {
    logger_1.logger.info('Redis initialization skipped. Using in-memory cache.');
});
exports.default = redisClient;
