import { Pipeline } from './pipeline';
import { EmailAccount } from './emailAccount';
import { Proxy, ProxyMappingResult } from './proxy';

// GoLogin interfaces
export interface GoLoginProfile {
    id: string;
    name: string;
    notes?: string;
    browserType?: string;
    os: string;
    startUrl?: string;
    googleServicesEnabled?: boolean;
    lockEnabled?: boolean;
    debugMode?: boolean;
    navigator?: {
        userAgent?: string;
        resolution?: string;
        language?: string;
        platform?: string;
        doNotTrack?: boolean;
        hardwareConcurrency?: number;
        deviceMemory?: number;
    };
    geoProfiles?: {
        [key: string]: unknown;
    }[];
    proxy?: {
        mode?: string;
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        changeIpUrl?: string;
        customName?: string;
        autoProxyRegion?: string;
        torProxyRegion?: string;
    };
    dns?: string;
    plugins?: {
        enableVulnerable?: boolean;
        enableFlash?: boolean;
    };
    timezone?: {
        id?: string;
        GMT?: string;
        enabled?: boolean;
        fillBasedOnIp?: boolean;
        timezone?: string;
    };
    webGLMetadata?: {
        mode?: string;
        vendor?: string;
        renderer?: string;
    };
    webglParams?: {
        glCanvas?: string;
        supportedFunctions?: Array<{
            name: string;
            supported: boolean;
        }>;
        glParamValues?: Array<{
            name: string;
            value: {
                [key: string]: number;
            };
        }>;
        antialiasing?: boolean;
        textureMaxAnisotropyExt?: number;
        shaiderPrecisionFormat?: string;
        extensions?: string[];
    };
    fonts?: {
        families?: string[];
        enableMasking?: boolean;
        enableDomRect?: boolean;
    };
    audioContext?: {
        mode?: string;
    };
    canvas?: {
        mode?: string;
    };
    mediaDevices?: {
        enableMasking?: boolean;
        videoInputs?: number;
        audioInputs?: number;
        audioOutputs?: number;
    };
    webRTC?: {
        mode?: string;
    };
    webGL?: {
        mode?: string;
    };
    clientRects?: {
        mode?: string;
    };
    chromeExtensions?: string[];
    createDate?: string;
    lastActivity?: string;
    canBeRunning?: boolean;
    osSpec?: string;
}

export interface GoLoginResponse {
    profiles: GoLoginProfile[];
    allProfilesCount: number;
}

export type GoLoginProfileCreateParams = Partial<GoLoginProfile>;

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
    updateEmailAccount: (
        id: string,
        data: { email?: string; password: string }
    ) => Promise<EmailAccount | null>;
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
    fetchProxies: (params: {
        country?: string;
        protocol?: string;
        limit?: number;
    }) => Promise<Proxy[]>;
    batchDeleteProxies: (ids: string[]) => Promise<{ count: number }>;
    checkProxies: () => Promise<boolean>;

    // Proxy mapping operations
    getProxyMappings: () => Promise<ProxyMappingResult[]>;
    createProxyMapping: () => Promise<ProxyMappingResult[]>;
    deleteProxyMapping: (emailId: string) => Promise<boolean>;

    // GoLogin profile operations
    getGoLoginProfiles: () => Promise<GoLoginResponse>;
    deleteGoLoginProfile: (id: string) => Promise<{ success: boolean; message: string }>;
    createGoLoginProfile: (profile: GoLoginProfileCreateParams) => Promise<GoLoginProfile>;
    getGoLoginProfileById: (id: string) => Promise<GoLoginProfile>;
    updateGoLoginProfile: (
        id: string,
        profile: GoLoginProfileCreateParams
    ) => Promise<GoLoginProfile>;
    batchDeleteGoLoginProfiles: (ids: string[]) => Promise<{
        success: boolean;
        message: string;
        count?: number;
    }>;
    startGoLoginProfile: (profileId: string, sync?: boolean) => Promise<any>;
    stopGoLoginProfile: (profileId: string) => Promise<any>;

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
