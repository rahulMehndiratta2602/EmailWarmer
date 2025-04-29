import { Pipeline } from './pipeline';
import { EmailAccount } from './emailAccount';

// Global window interface declarations
declare global {
  interface Window {
    electron: {
      ipcRenderer: any;
      api: ElectronAPI;
    };
    api: ElectronAPI;
  }
}

export interface ElectronAPI {
  // Pipeline operations
  getPipelines: () => Promise<Pipeline[]>;
  getPipelineById: (id: string) => Promise<Pipeline | null>;
  savePipeline: (pipeline: any) => Promise<Pipeline>;
  deletePipeline: (id: string) => Promise<boolean>;
  getAvailableActions: () => Promise<string[]>;
  
  // Email account operations
  getEmailAccounts: () => Promise<EmailAccount[]>;
  getEmailAccountById: (id: string) => Promise<EmailAccount | null>;
  createEmailAccount: (account: EmailAccount) => Promise<EmailAccount>;
  updateEmailAccount: (id: string, data: { password: string }) => Promise<EmailAccount | null>;
  deleteEmailAccount: (id: string) => Promise<boolean>;
  batchUpsertEmailAccounts: (accounts: EmailAccount[]) => Promise<{ count: number }>;
  batchDeleteEmailAccounts: (ids: string[]) => Promise<{ count: number }>;
  
  // Environment
  getEnvironment: () => Promise<{
    nodeEnv: string;
    isPackaged: boolean;
    appVersion: string;
    platform: string;
    apiBaseUrl: string;
  }>;
} 