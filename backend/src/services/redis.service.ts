import Redis from 'ioredis';
import { logger } from '../utils/logger';

class RedisService {
  private client: Redis;
  private static instance: RedisService;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  private constructor() {
    this.client = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', this.CACHE_TTL);
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis delete error:', error);
      throw error;
    }
  }

  async clearCache(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Redis clear cache error:', error);
      throw error;
    }
  }
}

export const redisService = RedisService.getInstance(); 