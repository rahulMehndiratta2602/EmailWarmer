import { Pipeline } from './pipeline';
import { EmailAccount } from './emailAccount';

// Define IPC renderer interface
interface IpcRenderer {
  send: (channel: string, ...args: unknown[]) => void;
  on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

// Global window interface declarations
declare global {
  interface Window {
    electron: {
      ipcRenderer: IpcRenderer;
      api: ElectronAPI;
    };
    api: ElectronAPI;
    networkDebug?: {
      getProxyUrl: () => string;
      fetchViaProxy: (url: string, options?: RequestInit) => Promise<Response>;
    };
  }
}

export interface ElectronAPI {
  // Pipeline operations
  getPipelines: () => Promise<Pipeline[]>;
  getPipelineById: (id: string) => Promise<Pipeline | null>;
  savePipeline: (pipeline: Pipeline) => Promise<Pipeline>;
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