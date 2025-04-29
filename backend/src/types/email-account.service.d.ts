declare module '../services/email-account.service' {
  class EmailAccountService {
    static getInstance(): EmailAccountService;
    getAllEmailAccounts(): Promise<any[]>;
    getEmailAccountById(id: string): Promise<any>;
    createEmailAccount(data: { email: string; password: string }): Promise<any>;
    updateEmailAccount(id: string, data: { password: string }): Promise<any>;
    deleteEmailAccount(id: string): Promise<boolean>;
    batchUpsertEmailAccounts(accounts: any[]): Promise<{ count: number }>;
    batchDeleteEmailAccounts(ids: string[]): Promise<{ count: number }>;
  }

  export const emailAccountService: EmailAccountService;
  export default EmailAccountService;
} 