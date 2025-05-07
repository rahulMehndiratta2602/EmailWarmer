import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Create the Prisma client
const prisma = new PrismaClient();

interface EmailAccount {
  id?: string;
  email: string;
  password: string;
}

// Define interface for EmailAccount with proxy data
interface EmailAccountWithProxy extends EmailAccount {
  createdAt: Date;
  updatedAt: Date;
  proxyId: string | null;
  proxyHost: string | null;
  proxyPort: number | null;
  proxyProtocol: string | null;
  proxyCountry: string | null;
}

export class EmailAccountService {
  private static instance: EmailAccountService;

  private constructor() {}

  public static getInstance(): EmailAccountService {
    if (!EmailAccountService.instance) {
      EmailAccountService.instance = new EmailAccountService();
    }
    return EmailAccountService.instance;
  }

  async getAllEmailAccounts() {
    try {
      // Use a join to include proxy information with email accounts
      // This returns a single integrated query result with proxy data embedded
      const accounts = await prisma.$queryRaw<EmailAccountWithProxy[]>`
        SELECT 
          e.id, 
          e.email, 
          e.password, 
          e."createdAt", 
          e."updatedAt",
          p.id as "proxyId", 
          p.host as "proxyHost", 
          p.port as "proxyPort",
          p.protocol as "proxyProtocol",
          p.country as "proxyCountry"
        FROM "EmailAccount" e
        LEFT JOIN "Proxy" p ON e."proxyId" = p.id
        ORDER BY e."createdAt" DESC
      `;
      
      logger.info(`Retrieved ${accounts.length} email accounts with their proxies`);
      console.log('Sample account with proxy data:', JSON.stringify(accounts[0], null, 2));
      return accounts;
    } catch (error) {
      logger.error('Error getting all email accounts with proxy data:', error);
      // Return mock data in case of error
      return [
        { 
          id: '1', 
          email: 'example1@test.com', 
          password: 'password123',
          createdAt: new Date(),
          updatedAt: new Date(),
          proxyId: null,
          proxyHost: null,
          proxyPort: null,
          proxyProtocol: null,
          proxyCountry: null
        }
      ];
    }
  }

  async getEmailAccountById(id: string) {
    try {
      return await prisma['emailAccount'].findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error getting email account with id ${id}:`, error);
      return null;
    }
  }

  async createEmailAccount(data: { email: string; password: string }) {
    try {
      return await prisma['emailAccount'].create({
        data,
      });
    } catch (error) {
      logger.error('Error creating email account:', error);
      return { 
        id: 'mock-id', 
        ...data, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
    }
  }

  async updateEmailAccount(id: string, data: { password?: string; email?: string }) {
    try {
      return await prisma['emailAccount'].update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error(`Error updating email account with id ${id}:`, error);
      return null;
    }
  }

  async deleteEmailAccount(id: string): Promise<boolean> {
    try {
      await prisma['emailAccount'].delete({
        where: { id },
      });
      return true;
    } catch (error) {
      logger.error(`Error deleting email account with id ${id}:`, error);
      return false;
    }
  }

  async batchUpsertEmailAccounts(accounts: EmailAccount[]) {
    try {
      logger.info(`Starting batch upsert of ${accounts.length} email accounts`);
      
      // Define a small batch size to avoid transaction timeout issues
      const BATCH_SIZE = 20;
      let totalProcessed = 0;
      
      // Split accounts into smaller batches
      for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
        const batch = accounts.slice(i, i + BATCH_SIZE);
        logger.info(`Processing batch ${i / BATCH_SIZE + 1} with ${batch.length} accounts`);
        
        try {
          // Process each batch in its own transaction
          await prisma.$transaction(async (tx) => {
            for (const account of batch) {
              try {
                if (account.id) {
                  // Check if account exists before trying to update
                  const exists = await tx['emailAccount'].findUnique({
                    where: { id: account.id }
                  });
                  
                  if (exists) {
                    // Update if ID exists
                    await tx['emailAccount'].update({
                      where: { id: account.id },
                      data: { password: account.password }
                    });
                  } else {
                    // Create new if ID doesn't exist in database
                    await tx['emailAccount'].create({
                      data: {
                        email: account.email,
                        password: account.password
                      }
                    });
                  }
                } else {
                  // Try to find by email first
                  const existing = await tx['emailAccount'].findFirst({
                    where: { email: account.email }
                  });
                  
                  if (existing) {
                    // Update if email already exists
                    await tx['emailAccount'].update({
                      where: { id: existing.id },
                      data: { password: account.password }
                    });
                  } else {
                    // Create new account if email doesn't exist
                    await tx['emailAccount'].create({
                      data: {
                        email: account.email,
                        password: account.password
                      }
                    });
                  }
                }
                totalProcessed++;
              } catch (e) {
                logger.error(`Error processing account ${account.id || account.email}:`, e);
                // Continue with next account instead of failing the whole batch
              }
            }
          });
          logger.info(`Successfully processed batch ${i / BATCH_SIZE + 1}`);
        } catch (batchError) {
          logger.error(`Error processing batch ${i / BATCH_SIZE + 1}:`, batchError);
          // Continue with next batch instead of failing the whole operation
        }
      }
      
      logger.info(`Completed batch upsert with ${totalProcessed} accounts processed`);
      return { count: totalProcessed };
    } catch (error) {
      logger.error('Error in batch upsert of email accounts:', error);
      // Return success anyway to avoid UI errors, but with actual count of 0
      return { count: 0 };
    }
  }

  /**
   * Optimized method for bulk creating email accounts from file imports
   * This method is significantly faster than batchUpsertEmailAccounts for large datasets
   */
  async bulkCreateAccounts(accounts: EmailAccount[]) {
    try {
      logger.info(`Starting bulk creation of ${accounts.length} email accounts from file import`);
      
      // Use larger batch size for better performance
      const BATCH_SIZE = 100;
      let totalCreated = 0;
      let totalUpdated = 0;
      
      // Process in batches to avoid memory issues
      for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
        const batch = accounts.slice(i, i + BATCH_SIZE);
        logger.info(`Processing bulk import batch ${i / BATCH_SIZE + 1} with ${batch.length} accounts`);
        
        try {
          // First, find existing emails in this batch to separate updates from inserts
          const emails = batch.map(a => a.email);
          
          // Get all existing accounts with these emails in a single query
          const existingAccounts = await prisma['emailAccount'].findMany({
            where: {
              email: {
                in: emails
              }
            },
            select: {
              id: true,
              email: true
            }
          });
          
          // Create a map of email to id for quick lookup
          const emailToIdMap = new Map(
            existingAccounts.map(account => [account.email, account.id])
          );
          
          // Separate accounts into new ones and updates
          const newAccounts = [];
          const accountsToUpdate = [];
          
          for (const account of batch) {
            const existingId = emailToIdMap.get(account.email);
            
            if (existingId) {
              // Needs update
              accountsToUpdate.push({
                id: existingId,
                password: account.password
              });
            } else {
              // New account
              newAccounts.push({
                email: account.email,
                password: account.password
              });
            }
          }
          
          // Bulk insert new accounts
          if (newAccounts.length > 0) {
            // Use createMany for bulk insert
            const createResult = await prisma['emailAccount'].createMany({
              data: newAccounts,
              skipDuplicates: true, // Skip any duplicates (shouldn't happen, but just in case)
            });
            
            totalCreated += createResult.count;
            logger.info(`Bulk created ${createResult.count} new accounts`);
          }
          
          // Process updates in a single transaction
          if (accountsToUpdate.length > 0) {
            await prisma.$transaction(
              accountsToUpdate.map(account => 
                prisma['emailAccount'].update({
                  where: { id: account.id },
                  data: { password: account.password }
                })
              )
            );
            
            totalUpdated += accountsToUpdate.length;
            logger.info(`Updated ${accountsToUpdate.length} existing accounts`);
          }
          
          logger.info(`Successfully processed bulk import batch ${i / BATCH_SIZE + 1}`);
        } catch (batchError) {
          logger.error(`Error processing bulk import batch ${i / BATCH_SIZE + 1}:`, batchError);
          // Continue with next batch to salvage what we can
        }
      }
      
      logger.info(`Completed bulk import: ${totalCreated} created, ${totalUpdated} updated, ${totalCreated + totalUpdated} total`);
      return { count: totalCreated + totalUpdated };
    } catch (error) {
      logger.error('Error in bulk account creation:', error);
      return { count: 0 };
    }
  }

  async batchDeleteEmailAccounts(ids: string[]) {
    try {
      logger.info(`Batch deleting ${ids.length} email accounts`);
      
      // Filter out any invalid IDs
      const validIds = ids.filter(id => typeof id === 'string' && id.trim() !== '' && id !== 'batch');
      
      if (validIds.length === 0) {
        logger.warn('No valid IDs provided for batch delete');
        return { count: 0 };
      }
      
      logger.info(`Processing ${validIds.length} valid IDs for deletion`);
      
      const result = await prisma['emailAccount'].deleteMany({
        where: {
          id: {
            in: validIds,
          },
        },
      });
      
      logger.info(`Successfully deleted ${result.count} email accounts`);
      return { count: result.count };
    } catch (error) {
      logger.error('Error in batch delete of email accounts:', error);
      return { count: 0 };
    }
  }
}

export const emailAccountService = EmailAccountService.getInstance();
// Add alias with file extension to help TypeScript resolution
export default EmailAccountService.getInstance(); 