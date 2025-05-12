// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, webFrame } from 'electron';

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

// GoLogin profile interface
interface GoLoginProfile {
    id: string;
    name: string;
    canBeRunning?: boolean;
    lastActivity?: string;
    browserType?: string;
    os?: string;
}

// GoLogin profile creation interface
interface GoLoginProfileCreateParams {
    name: string;
    os: string;
    osSpec?: string;
    proxy?: {
        mode: string;
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        changeIpUrl?: string;
        customName?: string;
        autoProxyRegion?: string;
        torProxyRegion?: string;
    };
    navigator?: {
        userAgent: string;
        resolution: string;
        language: string;
        platform: string;
    };
    fonts?: {
        families?: string[];
        enableMasking?: boolean;
        enableDomRect?: boolean;
    };
    webGLMetadata?: {
        mode: string;
        vendor?: string;
        renderer?: string;
    };
    notes?: string;
    startUrl?: string;
    googleServicesEnabled?: boolean;
    lockEnabled?: boolean;
    storage?: {
        local?: boolean;
        extensions?: boolean;
        bookmarks?: boolean;
        history?: boolean;
        passwords?: boolean;
        session?: boolean;
        indexedDb?: boolean;
        enableExternalExtensions?: boolean;
    };
    plugins?: {
        enableVulnerable?: boolean;
        enableFlash?: boolean;
    };
    timezone?: {
        enabled?: boolean;
        fillBasedOnIp?: boolean;
        timezone?: string;
    };
    audioContext?: {
        mode: string;
    };
    canvas?: {
        mode: string;
    };
    mediaDevices?: {
        enableMasking?: boolean;
        videoInputs?: number;
        audioInputs?: number;
        audioOutputs?: number;
    };
    webRTC?: {
        mode: string;
    };
    webGL?: {
        mode: string;
    };
    clientRects?: {
        mode: string;
    };
    chromeExtensions?: string[];
    [key: string]: any;
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
        },
    },
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
                await new Promise((resolve) => setTimeout(resolve, 500));
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
        },
    } as NetworkDebug);
}

// Expose zoom controls to the renderer process
contextBridge.exposeInMainWorld('zoomControl', {
    zoomIn: () => {
        const currentZoom = webFrame.getZoomFactor();
        const newZoom = Math.min(currentZoom + 0.1, 3.0); // Max 300%
        webFrame.setZoomFactor(newZoom);
        console.log(`Zoomed in to: ${newZoom * 100}%`);
        return newZoom;
    },
    zoomOut: () => {
        const currentZoom = webFrame.getZoomFactor();
        const newZoom = Math.max(currentZoom - 0.1, 0.5); // Min 50%
        webFrame.setZoomFactor(newZoom);
        console.log(`Zoomed out to: ${newZoom * 100}%`);
        return newZoom;
    },
    resetZoom: () => {
        webFrame.setZoomFactor(1.0);
        console.log('Zoom reset to 100%');
        return 1.0;
    },
    getZoomFactor: () => {
        return webFrame.getZoomFactor();
    },
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

    fetchProxies: (params: { country: string; protocol: string; limit: number }) => {
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

    // GoLogin profile operations
    getGoLoginProfiles: () => {
        console.log('preload: getGoLoginProfiles called');
        return ipcRenderer.invoke('api:getGoLoginProfiles');
    },

    deleteGoLoginProfile: (id: string) => {
        console.log('preload: deleteGoLoginProfile called with:', id);
        return ipcRenderer.invoke('api:deleteGoLoginProfile', id);
    },

    createGoLoginProfile: (profile: GoLoginProfileCreateParams) => {
        console.log('preload: createGoLoginProfile called');
        return ipcRenderer.invoke('api:createGoLoginProfile', profile);
    },

    // Proxy mapping operations
    getProxyMappings: () => {
        console.log(
            'preload: getProxyMappings called (DEPRECATED - mappings now included with proxies/emails)'
        );
        return ipcRenderer.invoke('api:getProxyMappings');
    },

    createProxyMapping: () => {
        console.log('preload: createProxyMapping called - will map all unmapped emails');
        return ipcRenderer.invoke('api:createProxyMapping');
    },

    deleteProxyMapping: (emailId: string) => {
        console.log(
            'preload: deleteProxyMapping called (DEPRECATED - use updateEmailAccount instead)'
        );
        return ipcRenderer.invoke('api:deleteProxyMapping', emailId);
    },

    // Environment information
    getEnvironment: () => ipcRenderer.invoke('getEnvironment'),
});

// Declare the window APIs for TypeScript
declare global {
    interface Window {
        api: {
            // Add for GoLogin profiles
            getGoLoginProfiles: () => Promise<GoLoginResponse>;
            deleteGoLoginProfile: (id: string) => Promise<{ success: boolean; message: string }>;
            createGoLoginProfile: (profile: GoLoginProfileCreateParams) => Promise<GoLoginProfile>;
        };
    }
}
