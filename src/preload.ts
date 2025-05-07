// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Define types for our API
interface Pipeline {
  id?: string;
  name: string;
  nodes: Array<{
    id: string;
    action: string | null;
  }>;
}

interface EmailAccount {
  id?: string;
  email: string;
  password: string;
}

interface Proxy {
  id?: string;
  host: string;
  port: number;
  country?: string | null;
  protocol: string;
  isActive: boolean;
  lastChecked?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Define types for IPC channels
type ValidSendChannel = 'toMain' | 'network-debug-proxy-ready';
type ValidReceiveChannel = 'fromMain' | 'network-debug-proxy-ready';
type ValidInvokeChannel = 'getEnvironment';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: ValidSendChannel, data: unknown) => {
      ipcRenderer.send(channel, data);
    },
    receive: (channel: ValidReceiveChannel, func: (...args: unknown[]) => void) => {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    invoke: (channel: ValidInvokeChannel, ...args: unknown[]) => {
      return ipcRenderer.invoke(channel, ...args);
    }
  }
});

// Define NetworkDebug interface for TypeScript
interface NetworkDebug {
  getProxyUrl: () => string;
  fetchViaProxy: (url: string, options?: RequestInit) => Promise<Response>;
}

// Window interface is already declared in types/window.d.ts

// Network debugging helper for development
if (process.env.NODE_ENV === 'development') {
  // Create a global for the main process proxy URL
  let mainProcessProxyUrl = '';
  
  // Listen for the proxy ready event from main process
  ipcRenderer.on('network-debug-proxy-ready', (event, { proxyUrl }) => {
    console.log('Network debug proxy ready:', proxyUrl);
    mainProcessProxyUrl = proxyUrl;
  });
  
  // Expose the proxy information to renderer
  contextBridge.exposeInMainWorld('networkDebug', {
    getProxyUrl: () => mainProcessProxyUrl,
    // Function to intercept a fetch and route it through our proxy
    fetchViaProxy: async (url: string, options?: RequestInit) => {
      if (!url.startsWith('http://localhost:3002')) {
        // Only proxy backend requests
        return fetch(url, options);
      }
      
      // Wait for proxy to be ready
      if (!mainProcessProxyUrl) {
        console.log('Waiting for network debug proxy to be ready...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (!mainProcessProxyUrl) {
        console.warn('Network debug proxy not available, using direct fetch');
        return fetch(url, options);
      }
      
      // Transform the URL to go through our proxy
      const proxyUrl = url.replace('http://localhost:3002', mainProcessProxyUrl);
      console.log(`Proxying request to ${url} via ${proxyUrl}`);
      
      // Make the fetch request through our proxy
      return fetch(proxyUrl, options);
    }
  } as NetworkDebug);
}

// Expose API methods through contextBridge
contextBridge.exposeInMainWorld('api', {
  // Pipeline operations
  getPipelines: () => {
    console.log('preload: getPipelines called');
    return ipcRenderer.invoke('api:getPipelines');
  },
  
  getPipelineById: (id: string) => {
    console.log('preload: getPipelineById called with:', id);
    return ipcRenderer.invoke('api:getPipelineById', id);
  },
  
  savePipeline: (pipeline: Pipeline) => {
    console.log('preload: savePipeline called with:', pipeline);
    return ipcRenderer.invoke('api:savePipeline', pipeline);
  },
  
  deletePipeline: (id: string) => {
    console.log('preload: deletePipeline called with:', id);
    return ipcRenderer.invoke('api:deletePipeline', id);
  },
  
  getAvailableActions: () => {
    console.log('preload: getAvailableActions called');
    return ipcRenderer.invoke('api:getAvailableActions');
  },
  
  // Email account operations
  getEmailAccounts: () => {
    console.log('preload: getEmailAccounts called');
    return ipcRenderer.invoke('api:getEmailAccounts');
  },
  
  getEmailAccountById: (id: string) => {
    console.log('preload: getEmailAccountById called with:', id);
    return ipcRenderer.invoke('api:getEmailAccountById', id);
  },
  
  createEmailAccount: (account: EmailAccount) => {
    console.log('preload: createEmailAccount called with:', account);
    return ipcRenderer.invoke('api:createEmailAccount', account);
  },
  
  updateEmailAccount: (id: string, data: { password: string }) => {
    console.log('preload: updateEmailAccount called with:', id, data);
    return ipcRenderer.invoke('api:updateEmailAccount', id, data);
  },
  
  deleteEmailAccount: (id: string) => {
    console.log('preload: deleteEmailAccount called with:', id);
    return ipcRenderer.invoke('api:deleteEmailAccount', id);
  },
  
  batchUpsertEmailAccounts: (accounts: EmailAccount[]) => {
    console.log('preload: batchUpsertEmailAccounts called');
    return ipcRenderer.invoke('api:batchUpsertEmailAccounts', accounts);
  },
  
  bulkImportEmailAccounts: (accounts: EmailAccount[]) => {
    console.log('preload: bulkImportEmailAccounts called with', accounts.length, 'accounts');
    return ipcRenderer.invoke('api:bulkImportEmailAccounts', accounts);
  },
  
  batchDeleteEmailAccounts: (ids: string[]) => {
    console.log('preload: batchDeleteEmailAccounts called');
    return ipcRenderer.invoke('api:batchDeleteEmailAccounts', ids);
  },
  
  // Proxy operations
  getProxies: () => {
    console.log('preload: getProxies called');
    return ipcRenderer.invoke('api:getProxies');
  },
  
  getProxyById: (id: string) => {
    console.log('preload: getProxyById called with:', id);
    return ipcRenderer.invoke('api:getProxyById', id);
  },
  
  createProxy: (proxy: Proxy) => {
    console.log('preload: createProxy called with:', proxy);
    return ipcRenderer.invoke('api:createProxy', proxy);
  },
  
  updateProxy: (id: string, data: Partial<Proxy>) => {
    console.log('preload: updateProxy called with:', id, data);
    return ipcRenderer.invoke('api:updateProxy', id, data);
  },
  
  deleteProxy: (id: string) => {
    console.log('preload: deleteProxy called with:', id);
    return ipcRenderer.invoke('api:deleteProxy', id);
  },
  
  fetchProxies: (params: { country: string, protocol: string, limit: number }) => {
    console.log('preload: fetchProxies called with:', params);
    return ipcRenderer.invoke('api:fetchProxies', params);
  },
  
  batchDeleteProxies: (ids: string[]) => {
    console.log('preload: batchDeleteProxies called with:', ids);
    return ipcRenderer.invoke('api:batchDeleteProxies', ids);
  },
  
  checkProxies: () => {
    console.log('preload: checkProxies called');
    return ipcRenderer.invoke('api:checkProxies');
  },
  
  // Proxy mapping operations
  getProxyMappings: () => {
    console.log('preload: getProxyMappings called (DEPRECATED - mappings now included with proxies/emails)');
    return ipcRenderer.invoke('api:getProxyMappings');
  },
  
  createProxyMapping: () => {
    console.log('preload: createProxyMapping called - will map all unmapped emails');
    return ipcRenderer.invoke('api:createProxyMapping');
  },
  
  deleteProxyMapping: (emailId: string) => {
    console.log('preload: deleteProxyMapping called (DEPRECATED - use updateEmailAccount instead)');
    return ipcRenderer.invoke('api:deleteProxyMapping', emailId);
  },
  
  // Environment information
  getEnvironment: () => ipcRenderer.invoke('getEnvironment')
});
