import { EmailAccount } from '../types/emailAccount';
// Window interface is now declared in types/window.d.ts

export class EmailAccountService {
  private static instance: EmailAccountService;

  private constructor() {}

  public static getInstance(): EmailAccountService {
    if (!EmailAccountService.instance) {
      EmailAccountService.instance = new EmailAccountService();
    }
    return EmailAccountService.instance;
  }

  async getEmailAccounts(): Promise<EmailAccount[]> {
    try {
      return await window.api.getEmailAccounts();
    } catch (error) {
      console.error('Error fetching email accounts:', error);
      throw error;
    }
  }

  async getEmailAccountById(id: string): Promise<EmailAccount | null> {
    try {
      return await window.api.getEmailAccountById(id);
    } catch (error) {
      console.error(`Error fetching email account ${id}:`, error);
      throw error;
    }
  }

  async createEmailAccount(account: EmailAccount): Promise<EmailAccount> {
    try {
      console.log('emailAccountService.createEmailAccount called with:', account);
      const result = await window.api.createEmailAccount(account);
      console.log('Result from createEmailAccount:', result);
      return result;
    } catch (error) {
      console.error('Error in emailAccountService.createEmailAccount:', error);
      throw error;
    }
  }

  async updateEmailAccount(id: string, data: { password: string }): Promise<EmailAccount | null> {
    try {
      return await window.api.updateEmailAccount(id, data);
    } catch (error) {
      console.error(`Error updating email account ${id}:`, error);
      throw error;
    }
  }

  async deleteEmailAccount(id: string): Promise<boolean> {
    try {
      return await window.api.deleteEmailAccount(id);
    } catch (error) {
      console.error(`Error deleting email account ${id}:`, error);
      throw error;
    }
  }
  
  async batchUpsertEmailAccounts(accounts: EmailAccount[]): Promise<any> {
    try {
      console.log('emailAccountService.batchUpsertEmailAccounts called with:', accounts.length, 'accounts');
      const result = await window.api.batchUpsertEmailAccounts(accounts);
      console.log('Result from batchUpsertEmailAccounts:', result);
      return result;
    } catch (error) {
      console.error('Error in emailAccountService.batchUpsertEmailAccounts:', error);
      throw error;
    }
  }
  
  async batchDeleteEmailAccounts(ids: string[]): Promise<any> {
    try {
      console.log('emailAccountService.batchDeleteEmailAccounts called with:', ids);
      const result = await window.api.batchDeleteEmailAccounts(ids);
      console.log('Result from batchDeleteEmailAccounts:', result);
      return result;
    } catch (error) {
      console.error('Error batch deleting email accounts:', error);
      throw error;
    }
  }
}

export const emailAccountService = EmailAccountService.getInstance(); 