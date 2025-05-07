import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import abcProxyClient from '../utils/abc-proxy-client';

// Define our Proxy interface
interface Proxy {
  id?: string;
  host: string;
  port: number;
  country?: string | null;
  protocol: string;
  isActive: boolean;
  lastChecked?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define interface for proxy with mapped email data
interface ProxyWithMappedEmail extends Proxy {
  mappedEmailId: string | null;
  mappedEmail: string | null;
}

// Define interfaces for mapping results
interface RawEmailAccount {
  id: string;
  email: string;
}

interface RawProxy {
  id: string;
  host: string;
  port: number;
  isActive: boolean;
}

interface ProxyMappingResult {
  emailId: string;
  email: string;
  proxyId: string;
  proxyHost: string;
  proxyPort: number;
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
   * @param country Country code (e.g., 'us', 'in')
   * @param limit Maximum number of proxies to fetch
   * @returns Array of saved proxies
   */
  async fetchAndSaveProxies(
    country?: string,
    limit = 100
  ): Promise<Proxy[]> {
    try {
      logger.info(`Fetching proxies from ABCProxy: country=${country}, limit=${limit}`);
      
      // Fetch proxies from ABCProxy
      const proxyConfigs = await abcProxyClient.getProxies(country, limit);
      
      // Map to our internal format
      const proxies = proxyConfigs.map(config => ({
        host: config.host,
        port: config.port,
        country: config.country,
        protocol: config.protocol,
        isActive: true
      }));
      
      // Save proxies to the database in smaller batches to avoid transaction timeouts
      const savedProxies = await this.saveProxies(proxies);
      
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
      
      // Process proxies in smaller batches (25 at a time) to avoid transaction timeouts
      const batchSize = 25;
      for (let i = 0; i < proxies.length; i += batchSize) {
        const batch = proxies.slice(i, i + batchSize);
        
        try {
          // Use individual calls instead of a transaction for better reliability
          for (const proxy of batch) {
            try {
              // Check if proxy already exists with same host and port
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const existingProxy = await (prisma as any).proxy.findFirst({
                where: {
                  host: proxy.host,
                  port: proxy.port
                }
              });
              
              if (existingProxy) {
                // Update existing proxy
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const updated = await (prisma as any).proxy.update({
                  where: { id: existingProxy.id },
                  data: {
                    country: proxy.country,
                    protocol: proxy.protocol,
                    isActive: proxy.isActive,
                    lastChecked: new Date()
                  }
                });
                savedProxies.push(updated);
              } else {
                // Create new proxy
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const created = await (prisma as any).proxy.create({
                  data: {
                    host: proxy.host,
                    port: proxy.port,
                    country: proxy.country || null,
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
        } catch (error) {
          logger.error(`Error processing batch of proxies:`, error);
        }
      }
      
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
   * @returns Array of proxies with email mapping information
   */
  async getProxies(limit = 100, offset = 0): Promise<ProxyWithMappedEmail[]> {
    try {
      // Use raw query to get proxies with their mapped emails
      const proxies = await prisma.$queryRaw<ProxyWithMappedEmail[]>`
        SELECT 
          p.id, 
          p.host, 
          p.port, 
          p.country, 
          p.protocol, 
          p."isActive",
          p."lastChecked", 
          p."createdAt", 
          p."updatedAt",
          e.id as "mappedEmailId",
          e.email as "mappedEmail"
        FROM "Proxy" p
        LEFT JOIN "EmailAccount" e ON p.id = e."proxyId"
        WHERE p."isActive" = true
        ORDER BY p."createdAt" DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      
      logger.info(`Retrieved ${proxies.length} proxies with mapped email information`);
      console.log('Proxy data with mappings:', JSON.stringify(proxies.slice(0, 2), null, 2));
      return proxies;
    } catch (error) {
      logger.error('Error retrieving proxies with mapped emails from database:', error);
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
        country: proxyConfig.country,
        protocol: proxyConfig.protocol,
        isActive: true
      }]);
      
      return savedProxies[0];
    } catch (error) {
      logger.error('Error creating session proxy:', error);
      throw new Error('Failed to create session proxy');
    }
  }

  /**
   * Get unmapped email accounts
   * @returns Array of unmapped email accounts
   */
  async getUnmappedEmails(): Promise<RawEmailAccount[]> {
    try {
      // Get all unmapped email accounts
      const emailAccounts = await prisma.$queryRaw<RawEmailAccount[]>`
        SELECT id, email FROM "EmailAccount" 
        WHERE "proxyId" IS NULL
      `;
        
      logger.info(`Found ${emailAccounts.length} unmapped email accounts`);
      return emailAccounts;
    } catch (error) {
      logger.error('Error getting unmapped emails:', error);
      return [];
    }
  }

  /**
   * Get unmapped proxies
   * @returns Array of unmapped proxies
   */
  async getUnmappedProxies(): Promise<RawProxy[]> {
    try {
      // Get unmapped proxies
      const unmappedProxies = await prisma.$queryRaw<RawProxy[]>`
        SELECT p.* FROM "Proxy" p
        LEFT JOIN "EmailAccount" e ON e."proxyId" = p.id
        WHERE e.id IS NULL AND p."isActive" = true
      `;
        
      logger.info(`Found ${unmappedProxies.length} unmapped proxies`);
      return unmappedProxies;
    } catch (error) {
      logger.error('Error getting unmapped proxies:', error);
      return [];
    }
  }

  /**
   * Create mappings between email accounts and proxies
   * @param emails Unmapped email accounts
   * @param proxies Unmapped proxies
   * @returns Array of created mappings
   */
  async createMappings(
    emails: RawEmailAccount[],
    proxies: RawProxy[]
  ): Promise<ProxyMappingResult[]> {
    try {
      // Determine how many mappings we can create
      const mappingsToCreate = Math.min(emails.length, proxies.length);
      logger.info(`Creating ${mappingsToCreate} email-to-proxy mappings`);
      
      // Create the mappings
      const mappingResults: ProxyMappingResult[] = [];
      
      for (let i = 0; i < mappingsToCreate; i++) {
        const emailId = emails[i].id;
        const proxy = proxies[i];
        
        try {
          // Update the email account with the proxy ID
          await prisma.$executeRaw`
            UPDATE "EmailAccount" 
            SET "proxyId" = ${proxy.id}
            WHERE id = ${emailId}
          `;
          
          // Get the updated email account
          const emailAccounts = await prisma.$queryRaw<{ emailId: string; email: string; proxyId: string; proxyHost: string; proxyPort: number }[]>`
            SELECT 
              e.id as "emailId", 
              e.email, 
              p.id as "proxyId", 
              p.host as "proxyHost", 
              p.port as "proxyPort" 
            FROM "EmailAccount" e
            JOIN "Proxy" p ON e."proxyId" = p.id
            WHERE e.id = ${emailId}
          `;
          
          if (emailAccounts.length > 0) {
            const account = emailAccounts[0];
            
            mappingResults.push({
              emailId: account.emailId,
              email: account.email,
              proxyId: account.proxyId,
              proxyHost: account.proxyHost,
              proxyPort: account.proxyPort
            });
          }
        } catch (error) {
          logger.error(`Error creating mapping for email ${emailId}:`, error);
        }
      }
      
      logger.info(`Successfully created ${mappingResults.length} email-to-proxy mappings`);
      return mappingResults;
    } catch (error) {
      logger.error('Error creating proxy mappings:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
export const proxyService = ProxyService.getInstance();
export default ProxyService.getInstance(); 