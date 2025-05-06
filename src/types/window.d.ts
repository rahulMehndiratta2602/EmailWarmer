import { Pipeline } from './pipeline';
import { EmailAccount } from './emailAccount';
import { Proxy, ProxyMappingResult } from './proxy';

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
  updateEmailAccount: (id: string, data: { email?: string; password: string }) => Promise<EmailAccount | null>;
  deleteEmailAccount: (id: string) => Promise<boolean>;
  batchUpsertEmailAccounts: (accounts: EmailAccount[]) => Promise<{ count: number }>;
  bulkImportEmailAccounts: (accounts: EmailAccount[]) => Promise<{ count: number }>;
  batchDeleteEmailAccounts: (ids: string[]) => Promise<{ count: number }>;
  
  // Proxy operations
  getProxies: () => Promise<Proxy[]>;
  getProxyById: (id: string) => Promise<Proxy | null>;
  createProxy: (proxy: Partial<Proxy>) => Promise<Proxy>;
  updateProxy: (id: string, data: Partial<Proxy>) => Promise<Proxy>;
  deleteProxy: (id: string) => Promise<boolean>;
  fetchProxies: (params: { country?: string, protocol?: string, limit?: number }) => Promise<Proxy[]>;
  batchDeleteProxies: (ids: string[]) => Promise<{ count: number }>;
  checkProxies: () => Promise<boolean>;
  
  // Proxy mapping operations
  getProxyMappings: () => Promise<ProxyMappingResult[]>;
  createProxyMapping: (emailIds: string[], maxProxies?: number, maxEmailsPerProxy?: number) => Promise<ProxyMappingResult[]>;
  deleteProxyMapping: (emailId: string) => Promise<boolean>;
  
  // Environment
  getEnvironment: () => Promise<{
    nodeEnv: string;
    isPackaged: boolean;
    appVersion: string;
    platform: string;
    apiBaseUrl: string;
    isWindowsOS: boolean;
  }>;
} 