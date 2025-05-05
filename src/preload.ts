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

// Declare the global window interface with our custom properties
declare global {
  interface Window {
    networkDebug: NetworkDebug;
  }
}

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
      if (!url.startsWith('http://localhost:3001')) {
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
      const proxyUrl = url.replace('http://localhost:3001', mainProcessProxyUrl);
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
  
  batchDeleteEmailAccounts: (ids: string[]) => {
    console.log('preload: batchDeleteEmailAccounts called');
    return ipcRenderer.invoke('api:batchDeleteEmailAccounts', ids);
  },
  
  // Environment information
  getEnvironment: () => ipcRenderer.invoke('getEnvironment')
});
