import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { proxyService } from './proxy.service';

// Create the Prisma client
const prisma = new PrismaClient();

interface ProxyMappingResult {
  emailId: string;
  email: string;
  proxyId: string;
  proxyHost: string;
  proxyPort: number;
}

export class ProxyMappingService {
  private static instance: ProxyMappingService;

  private constructor() {}

  public static getInstance(): ProxyMappingService {
    if (!ProxyMappingService.instance) {
      ProxyMappingService.instance = new ProxyMappingService();
    }
    return ProxyMappingService.instance;
  }

  /**
   * Create a mapping between emails and proxies
   * @param emailIds List of email IDs to map
   * @param maxProxies Maximum number of proxies to use
   * @param maxEmailsPerProxy Maximum number of emails per proxy
   * @returns Array of email-to-proxy mappings
   */
  async createProxyMapping(
    emailIds: string[],
    maxProxies: number,
    maxEmailsPerProxy: number
  ): Promise<ProxyMappingResult[]> {
    try {
      logger.info(`Creating proxy mapping for ${emailIds.length} emails, maxProxies=${maxProxies}, maxEmailsPerProxy=${maxEmailsPerProxy}`);

      // Get active proxies
      const proxies = await proxyService.getProxies(maxProxies);
      if (proxies.length === 0) {
        throw new Error('No active proxies available');
      }

      // Limit the number of proxies to use
      const limitedProxies = proxies.slice(0, maxProxies);
      
      // Track proxy usage
      const proxyUsage = new Map<string, number>();
      const mappingResults: ProxyMappingResult[] = [];
      
      // First, clear any existing mappings for these emails
      await this.clearExistingMappings(emailIds);
      
      // Create the transaction to map emails to proxies
      await prisma.$transaction(async (tx) => {
        for (const emailId of emailIds) {
          // Find the least loaded proxy
          let selectedProxyIndex = 0;
          let minLoad = Number.MAX_SAFE_INTEGER;
          
          for (let i = 0; i < limitedProxies.length; i++) {
            const proxyId = limitedProxies[i].id!;
            const currentLoad = proxyUsage.get(proxyId) || 0;
            
            if (currentLoad < minLoad && currentLoad < maxEmailsPerProxy) {
              selectedProxyIndex = i;
              minLoad = currentLoad;
            }
          }
          
          // If all proxies are at capacity, skip this email
          if ((proxyUsage.get(limitedProxies[selectedProxyIndex].id!) || 0) >= maxEmailsPerProxy) {
            logger.warn(`All proxies at capacity, skipping email ID ${emailId}`);
            continue;
          }
          
          const selectedProxy = limitedProxies[selectedProxyIndex];
          
          try {
            // Get the email account
            const emailAccount = await tx.emailAccount.findUnique({
              where: { id: emailId }
            });
            
            if (!emailAccount) {
              logger.warn(`Email account with ID ${emailId} not found, skipping`);
              continue;
            }
            
            // Create or update proxy mapping
            let proxyMapping = await tx.proxyMapping.findFirst({
              where: { proxyId: selectedProxy.id }
            });
            
            if (!proxyMapping) {
              // Create new mapping
              proxyMapping = await tx.proxyMapping.create({
                data: {
                  proxyId: selectedProxy.id!,
                  emailAccounts: {
                    connect: [{ id: emailId }]
                  }
                }
              });
            } else {
              // Update existing mapping
              await tx.emailAccount.update({
                where: { id: emailId },
                data: {
                  proxyMappingId: proxyMapping.id
                }
              });
            }
            
            // Increment the proxy usage counter
            const currentCount = proxyUsage.get(selectedProxy.id!) || 0;
            proxyUsage.set(selectedProxy.id!, currentCount + 1);
            
            // Add to results
            mappingResults.push({
              emailId,
              email: emailAccount.email,
              proxyId: selectedProxy.id!,
              proxyHost: selectedProxy.host,
              proxyPort: selectedProxy.port
            });
            
          } catch (error) {
            logger.error(`Error mapping email ID ${emailId} to proxy:`, error);
          }
        }
      });
      
      logger.info(`Successfully created ${mappingResults.length} email-to-proxy mappings`);
      return mappingResults;
    } catch (error) {
      logger.error('Error creating proxy mapping:', error);
      throw new Error('Failed to create proxy mapping');
    }
  }

  /**
   * Clear existing mappings for the specified email IDs
   * @param emailIds Array of email IDs
   */
  private async clearExistingMappings(emailIds: string[]): Promise<void> {
    try {
      await prisma.emailAccount.updateMany({
        where: {
          id: {
            in: emailIds
          }
        },
        data: {
          proxyMappingId: null
        }
      });
    } catch (error) {
      logger.error('Error clearing existing proxy mappings:', error);
      throw new Error('Failed to clear existing proxy mappings');
    }
  }

  /**
   * Get current proxy mappings
   * @returns Array of email-to-proxy mappings
   */
  async getProxyMappings(): Promise<ProxyMappingResult[]> {
    try {
      const emailAccounts = await prisma.emailAccount.findMany({
        where: {
          proxyMappingId: {
            not: null
          }
        },
        include: {
          proxyMapping: {
            include: {
              proxy: true
            }
          }
        }
      });
      
      const results: ProxyMappingResult[] = [];
      
      for (const account of emailAccounts) {
        if (account.proxyMapping && account.proxyMapping.proxy) {
          results.push({
            emailId: account.id,
            email: account.email,
            proxyId: account.proxyMapping.proxy.id,
            proxyHost: account.proxyMapping.proxy.host,
            proxyPort: account.proxyMapping.proxy.port
          });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error retrieving proxy mappings:', error);
      throw new Error('Failed to retrieve proxy mappings');
    }
  }

  /**
   * Delete a proxy mapping
   * @param emailId Email ID to unmap
   * @returns Success indicator
   */
  async deleteProxyMapping(emailId: string): Promise<boolean> {
    try {
      await prisma.emailAccount.update({
        where: { id: emailId },
        data: {
          proxyMappingId: null
        }
      });
      
      return true;
    } catch (error) {
      logger.error(`Error deleting proxy mapping for email ID ${emailId}:`, error);
      return false;
    }
  }
}

export const proxyMappingService = ProxyMappingService.getInstance();
export default ProxyMappingService.getInstance(); 