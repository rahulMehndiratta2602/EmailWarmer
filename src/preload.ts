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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, data: any) => {
      // whitelist channels
      const validChannels = ['toMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel: string, func: (...args: any[]) => void) => {
      const validChannels = ['fromMain'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    invoke: (channel: string, ...args: any[]) => {
      const validChannels = ['getEnvironment'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
    }
  }
});

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
