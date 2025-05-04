import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import abcProxyClient from '../utils/abc-proxy-client';

// Define our Proxy interface
interface Proxy {
  id?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  protocol: string;
  isActive: boolean;
  lastChecked?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the Prisma client
const prisma = new PrismaClient();

export class ProxyService {
  private static instance: ProxyService;

  private constructor() {}

  public static getInstance(): ProxyService {
    if (!ProxyService.instance) {
      ProxyService.instance = new ProxyService();
    }
    return ProxyService.instance;
  }

  /**
   * Fetch proxies from ABCProxy and save them to the database
   * @param country Optional country filter
   * @param state Optional state filter
   * @param city Optional city filter
   * @param limit Maximum number of proxies to fetch
   * @returns Array of saved proxies
   */
  async fetchAndSaveProxies(
    country?: string,
    state?: string,
    city?: string,
    limit = 100
  ): Promise<Proxy[]> {
    try {
      logger.info(`Fetching proxies from ABCProxy: country=${country}, state=${state}, city=${city}, limit=${limit}`);
      
      // Fetch proxies from ABCProxy
      const proxyConfigs = await abcProxyClient.getProxies(country, state, city, limit);
      
      // Save proxies to the database
      const savedProxies = await this.saveProxies(
        proxyConfigs.map(config => ({
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          country: config.country,
          state: config.state,
          city: config.city,
          protocol: config.protocol,
          isActive: true
        }))
      );
      
      logger.info(`Successfully fetched and saved ${savedProxies.length} proxies`);
      return savedProxies;
    } catch (error) {
      logger.error('Error fetching and saving proxies:', error);
      throw new Error('Failed to fetch and save proxies');
    }
  }

  /**
   * Save proxies to the database
   * @param proxies Array of proxies to save
   * @returns Array of saved proxies with IDs
   */
  async saveProxies(proxies: Proxy[]): Promise<Proxy[]> {
    try {
      const savedProxies: Proxy[] = [];
      
      // Use a transaction for better performance and atomicity
      await prisma.$transaction(async (tx) => {
        for (const proxy of proxies) {
          try {
            // Check if proxy already exists with same host, port, and username
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const existingProxy = await (tx as any).proxy.findFirst({
              where: {
                host: proxy.host,
                port: proxy.port,
                username: proxy.username
              }
            });
            
            if (existingProxy) {
              // Update existing proxy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const updated = await (tx as any).proxy.update({
                where: { id: existingProxy.id },
                data: {
                  password: proxy.password,
                  country: proxy.country,
                  state: proxy.state,
                  city: proxy.city,
                  protocol: proxy.protocol,
                  isActive: proxy.isActive,
                  lastChecked: new Date()
                }
              });
              savedProxies.push(updated);
            } else {
              // Create new proxy
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const created = await (tx as any).proxy.create({
                data: {
                  host: proxy.host,
                  port: proxy.port,
                  username: proxy.username,
                  password: proxy.password,
                  country: proxy.country || null,
                  state: proxy.state || null,
                  city: proxy.city || null,
                  protocol: proxy.protocol,
                  isActive: proxy.isActive
                }
              });
              savedProxies.push(created);
            }
          } catch (error) {
            logger.error(`Error saving proxy ${proxy.host}:${proxy.port}:`, error);
          }
        }
      });
      
      return savedProxies;
    } catch (error) {
      logger.error('Error saving proxies to database:', error);
      throw new Error('Failed to save proxies to database');
    }
  }

  /**
   * Get proxies from the database
   * @param limit Maximum number of proxies to retrieve
   * @param offset Offset for pagination
   * @returns Array of proxies
   */
  async getProxies(limit = 100, offset = 0): Promise<Proxy[]> {
    try {
      // Using type assertion because Prisma's generated types don't include the 'proxy' model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proxies = await (prisma as any).proxy.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });
      
      return proxies;
    } catch (error) {
      logger.error('Error retrieving proxies from database:', error);
      throw new Error('Failed to retrieve proxies from database');
    }
  }

  /**
   * Get a proxy by ID
   * @param id Proxy ID
   * @returns Proxy or null if not found
   */
  async getProxyById(id: string): Promise<Proxy | null> {
    try {
      // Using type assertion because Prisma's generated types don't include the 'proxy' model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proxy = await (prisma as any).proxy.findUnique({
        where: { id }
      });
      
      return proxy;
    } catch (error) {
      logger.error(`Error retrieving proxy with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete proxies from the database
   * @param ids Array of proxy IDs to delete
   * @returns Number of deleted proxies
   */
  async deleteProxies(ids: string[]): Promise<number> {
    try {
      // Using type assertion because Prisma's generated types don't include the 'proxy' model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (prisma as any).proxy.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
      
      return result.count;
    } catch (error) {
      logger.error('Error deleting proxies from database:', error);
      throw new Error('Failed to delete proxies from database');
    }
  }

  /**
   * Update a proxy in the database
   * @param id Proxy ID
   * @param data Updated proxy data
   * @returns Updated proxy or null if not found
   */
  async updateProxy(id: string, data: Partial<Proxy>): Promise<Proxy | null> {
    try {
      // Using type assertion because Prisma's generated types don't include the 'proxy' model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const proxy = await (prisma as any).proxy.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      });
      
      return proxy;
    } catch (error) {
      logger.error(`Error updating proxy with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a session proxy
   * @param minutes Minutes to retain the session (1-120)
   * @returns Created proxy
   */
  async createSessionProxy(minutes = 30): Promise<Proxy> {
    try {
      const proxyConfig = await abcProxyClient.createSessionProxy(minutes);
      
      const savedProxies = await this.saveProxies([{
        host: proxyConfig.host,
        port: proxyConfig.port,
        username: proxyConfig.username,
        password: proxyConfig.password,
        protocol: proxyConfig.protocol,
        isActive: true
      }]);
      
      return savedProxies[0];
    } catch (error) {
      logger.error('Error creating session proxy:', error);
      throw new Error('Failed to create session proxy');
    }
  }
}

export const proxyService = ProxyService.getInstance();
export default ProxyService.getInstance(); 