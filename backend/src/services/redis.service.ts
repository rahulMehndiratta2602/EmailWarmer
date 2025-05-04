import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { RedisMemoryServer } from 'redis-memory-server';

export class RedisService {
  private static instance: RedisService;
  private client!: Redis;
  private memoryServer: RedisMemoryServer | null = null;

  private constructor() {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      // Check environment
      const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      
      // Get Redis connection details
      let host = process.env.REDIS_HOST || 'localhost';
      let port = parseInt(process.env.REDIS_PORT || '6379');
      let password = process.env.REDIS_PASSWORD || undefined;

      // In development mode, try to connect to existing Redis first
      if (isDev) {
        try {
          const tempClient = new Redis({
            host,
            port,
            password,
            connectTimeout: 1000,
            retryStrategy: () => null // Don't retry
          });
          
          await new Promise<void>((resolve, reject) => {
            tempClient.on('error', (err) => {
              logger.info('Could not connect to external Redis, falling back to memory server');
              tempClient.disconnect();
              reject(err);
            });
            
            tempClient.on('connect', () => {
              logger.info('Connected to external Redis server');
              tempClient.disconnect();
              resolve();
            });
          });
        } catch (err) {
          // If connection fails, start Redis memory server
          this.memoryServer = new RedisMemoryServer();
          
          // Get host and port from memory server
          host = await this.memoryServer.getHost();
          port = await this.memoryServer.getPort();
          password = undefined;
          
          logger.info(`Started Redis memory server at ${host}:${port}`);
        }
      }

      // Create the actual Redis client
      this.client = new Redis({
        host,
        port,
        password,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      this.client.on('error', (err: Error) => {
        logger.error('Redis error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Connected to Redis');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis connection:', error);
      throw error;
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async set(key: string, value: string, expiry?: number): Promise<void> {
    try {
      if (expiry) {
        await this.client.setex(key, expiry, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
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

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      throw error;
    }
  }

  // Cleanup method for memory server
  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
      }
      
      if (this.memoryServer) {
        await this.memoryServer.stop();
      }
    } catch (error) {
      logger.error('Redis close error:', error);
    }
  }
}

export const redisService = RedisService.getInstance(); 