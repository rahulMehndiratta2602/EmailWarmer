import axios from 'axios';
import { config } from 'dotenv';

config();

const GOLOGIN_API_TOKEN =
    process.env.GOLOGIN_API_TOKEN ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODFiN2M1NzEyNDI2ZTgxMWNjNTFiZmQiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2ODFiN2ZlMmE5YjJlOTZjODNhMDc4OTYifQ.YvctsNBxEmEOJxifTZh9hiGPyhJi68Vet84PaGqE7iw';
const GOLOGIN_API_URL = process.env.GOLOGIN_API_URL || 'https://api.gologin.com';

export interface GoLoginProfile {
    id: string;
    name: string;
    notes?: string;
    browserType: string;
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

/**
 * Service for interacting with the GoLogin API
 */
export class GoLoginService {
    /**
     * Get all profiles from GoLogin
     */
    static async getProfiles(): Promise<GoLoginResponse> {
        try {
            const response = await axios.get(`${GOLOGIN_API_URL}/browser/v2`, {
                headers: {
                    Authorization: `Bearer ${GOLOGIN_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching GoLogin profiles:', error);
            throw error;
        }
    }

    /**
     * Get a specific profile by ID
     */
    static async getProfileById(profileId: string): Promise<GoLoginProfile> {
        try {
            const response = await axios.get(`${GOLOGIN_API_URL}/browser/${profileId}`, {
                headers: {
                    Authorization: `Bearer ${GOLOGIN_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching GoLogin profile ${profileId}:`, error);
            throw error;
        }
    }

    /**
     * Delete a profile by ID
     */
    static async deleteProfile(profileId: string): Promise<void> {
        try {
            await axios.delete(`${GOLOGIN_API_URL}/browser/${profileId}`, {
                headers: {
                    Authorization: `Bearer ${GOLOGIN_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error(`Error deleting GoLogin profile ${profileId}:`, error);
            throw error;
        }
    }

    /**
     * Create a new profile
     */
    static async createProfile(profileData: Partial<GoLoginProfile>): Promise<GoLoginProfile> {
        try {
            // Log the received profile data for debugging
            console.log(
                'Creating GoLogin profile with data:',
                JSON.stringify(profileData, null, 2)
            );

            // Ensure required fields are present for GoLogin API
            const fullProfileData = {
                ...profileData,
                // Ensure these fields are always present as they're required by GoLogin API
                webglParams: profileData.webglParams || {
                    glCanvas: 'webgl2',
                    supportedFunctions: [
                        {
                            name: 'beginQuery',
                            supported: true,
                        },
                    ],
                    glParamValues: [
                        {
                            name: 'ALIASED_LINE_WIDTH_RANGE',
                            value: {
                                '0': 1,
                                '1': 8,
                            },
                        },
                    ],
                    antialiasing: true,
                    textureMaxAnisotropyExt: 16,
                    shaiderPrecisionFormat: 'highp/highp',
                    extensions: ['EXT_color_buffer_float'],
                },
                chromeExtensions: profileData.chromeExtensions || [],
                // Add browserType if missing (required by GoLogin API)
                browserType: profileData.browserType || 'chrome',
                // Add navigator if missing or ensure it has required fields
                navigator: {
                    // Default navigator values
                    userAgent:
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36',
                    resolution: '1280x720',
                    language: 'en-US',
                    platform: 'Win32',
                    // Override with any provided values
                    ...(profileData.navigator || {}),
                },
            };

            // Make sure navigator has all required fields even if partial navigator was provided
            if (!fullProfileData.navigator.userAgent) {
                fullProfileData.navigator.userAgent =
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.36 Safari/537.36';
            }

            if (!fullProfileData.navigator.resolution) {
                fullProfileData.navigator.resolution = '1280x720';
            }

            console.log('Sending to GoLogin API:', JSON.stringify(fullProfileData, null, 2));
            console.log(`Using endpoint: ${GOLOGIN_API_URL}/browser/custom`);

            // Use browser/custom endpoint instead of browser
            const response = await axios.post(
                `${GOLOGIN_API_URL}/browser/custom`,
                fullProfileData,
                {
                    headers: {
                        Authorization: `Bearer ${GOLOGIN_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(
                'GoLogin profile created successfully:',
                JSON.stringify(response.data, null, 2)
            );
            return response.data;
        } catch (error) {
            console.error('Error creating GoLogin profile:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', JSON.stringify(error.response.data, null, 2));
                // Add more detailed error information
                const responseData = error.response.data;
                if (typeof responseData === 'object' && responseData !== null) {
                    // Log specific validation errors if available
                    if (responseData.errors) {
                        console.error(
                            'Validation errors:',
                            JSON.stringify(responseData.errors, null, 2)
                        );
                    }
                    if (responseData.message) {
                        console.error('Error message:', responseData.message);
                    }
                }
                throw new Error(
                    `Request failed with status code ${error.response.status}: ${JSON.stringify(
                        error.response.data
                    )}`
                );
            }
            throw error;
        }
    }

    /**
     * Update an existing profile
     */
    static async updateProfile(
        profileId: string,
        profileData: Partial<GoLoginProfile>
    ): Promise<GoLoginProfile> {
        try {
            const response = await axios.put(
                `${GOLOGIN_API_URL}/browser/${profileId}`,
                profileData,
                {
                    headers: {
                        Authorization: `Bearer ${GOLOGIN_API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating GoLogin profile ${profileId}:`, error);
            throw error;
        }
    }
}
