import { toast } from 'react-hot-toast';
import GoLoginDirectService from './goLoginDirectService';
import { EmailAccount } from '../types/emailAccount';
import { Proxy } from '../types/proxy';
import { Pipeline } from '../types/pipeline';

// Track running automation profiles
interface RunningAutomation {
    profileId: string;
    email: string;
    proxy: Proxy;
    pipeline: Pipeline;
}

class AutomationService {
    private runningAutomations: RunningAutomation[] = [];
    private isRunning = false;

    // Node handlers registry
    private nodeHandlers: Record<
        string,
        (profileId: string, email: string, password: string, metadata?: any) => Promise<void>
    > = {
        // All automation now happens in the main process via automateGmail
    };

    // Get mapped email accounts and proxies
    async getProxyMappedEmails(): Promise<{ email: EmailAccount; proxy: Proxy }[]> {
        try {
            // Get all email accounts
            const emails = await window.api.getEmailAccounts();

            // Get all proxies
            const proxies = await window.api.getProxies();

            // Return only emails with mapped proxies
            const mappedPairs: { email: EmailAccount; proxy: Proxy }[] = [];

            for (const email of emails) {
                // Check if email has proxy ID
                if (email.proxyId) {
                    const matchedProxy = proxies.find((p) => p.id === email.proxyId);
                    if (matchedProxy) {
                        mappedPairs.push({
                            email,
                            proxy: matchedProxy,
                        });
                    }
                }
            }

            return mappedPairs;
        } catch (error) {
            console.error('Error getting mapped email accounts:', error);
            throw error;
        }
    }

    // Start automation with selected pipeline
    async startAutomation(pipelineId: string): Promise<void> {
        if (this.isRunning) {
            toast.error('Automation is already running');
            return;
        }

        try {
            this.isRunning = true;

            // Get the pipeline
            const pipeline = await window.api.getPipelineById(pipelineId);
            if (!pipeline) {
                throw new Error(`Pipeline with ID ${pipelineId} not found`);
            }

            // Get mapped emails and proxies
            const mappedPairs = await this.getProxyMappedEmails();

            if (mappedPairs.length === 0) {
                toast.error('No mapped email accounts found. Please map emails to proxies first.');
                this.isRunning = false;
                return;
            }

            toast.success(`Starting automation with ${mappedPairs.length} email accounts`);

            // For each mapped pair, create a profile and start automation
            for (const { email, proxy } of mappedPairs) {
                await this.runAutomationForEmailProxy(email, proxy, pipeline);
            }
        } catch (error) {
            console.error('Error starting automation:', error);
            toast.error(
                `Automation error: ${error instanceof Error ? error.message : String(error)}`
            );
            this.isRunning = false;
        }
    }

    /**
     * Run an automation for a specific email-proxy pair
     */
    private async runAutomationForEmailProxy(
        email: EmailAccount,
        proxy: Proxy,
        pipeline: Pipeline
    ): Promise<void> {
        try {
            console.log(`Creating profile for ${email.email}...`);

            // Create a GoLogin profile configured for Gmail
            const profileData = {
                name: `${email.email.split('@')[0]}_${Date.now()}`,
                notes: `Automation profile for ${email.email}`,
                browserType: 'chrome',
                // Don't set Gmail as startUrl to avoid detection
                startUrl: 'https://www.google.com',
                os: 'win',
                navigator: {
                    userAgent:
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                    platform: 'Win32',
                    language: 'en-US',
                    resolution: '1920x1080',
                    hardwareConcurrency: 8,
                },
                // Enable Google services to avoid "unsafe browser" warnings
                googleServicesEnabled: true,
                // Add realistic timezone
                timezone: {
                    enabled: true,
                    fillBasedOnIp: true,
                    timezone: 'America/New_York',
                },
                // Add noise to canvas/WebGL/audio to appear more realistic
                canvas: {
                    mode: 'noise',
                    noise: 0.5,
                },
                webGL: {
                    mode: 'noise',
                    noise: 0.5,
                },
                audioContext: {
                    mode: 'noise',
                    noise: 0.5,
                },
                // Disable WebRTC to prevent IP leaks
                webRTC: {
                    mode: 'disabled',
                    enabled: false,
                },
                // Add fonts to appear more realistic
                fonts: {
                    enableMasking: true,
                    enableDomRect: true,
                    families: [
                        'Arial',
                        'Courier',
                        'Courier New',
                        'Georgia',
                        'Helvetica',
                        'Times',
                        'Times New Roman',
                        'Verdana',
                        'Roboto',
                        'Tahoma',
                    ],
                },
                // Add proxy configuration
                proxy: {
                    mode: proxy.protocol || 'http',
                    host: proxy.host,
                    port: proxy.port,
                    username: '',
                    password: '',
                },
            };

            // Create the profile using the GoLogin API
            const profileResult = await window.api.createGoLoginProfile(profileData);
            const profileId = profileResult.id;
            console.log(`Created profile ${profileId} for ${email.email}`);

            // Start the profile - this opens a browser window
            console.log(`Starting profile for ${email.email}...`);
            await GoLoginDirectService.startProfile(profileId, false);
            console.log(`Browser started for ${email.email}`);

            // Add to running automations
            this.runningAutomations.push({
                profileId,
                email: email.email,
                proxy,
                pipeline,
            });

            // Find the pipeline node for transferring from spam to inbox
            const transferNode = pipeline.nodes.find(
                (node) => node.action === 'Transfer from Spam to Inbox'
            );

            if (transferNode) {
                console.log(`Executing "Transfer from Spam to Inbox" node for ${email.email}`);

                // Use the specific sender addresses from the node's metadata if available
                const senderAddresses = transferNode.metadata?.from || [];

                // Call the Gmail automation with the current profile ID and email credentials
                console.log(
                    `Running Gmail automation for profile ${profileId}, email: ${email.email}`
                );

                try {
                    // Use the automateGmail IPC handler to run Gmail automation
                    const result = await window.api.automateGmail({
                        profileId,
                        email: email.email,
                        password: email.password,
                        fromAddresses: senderAddresses,
                    });

                    if (result.success) {
                        console.log(
                            `Gmail automation for ${email.email} completed successfully:`,
                            result.message
                        );
                        toast.success(`Successfully processed emails for ${email.email}`);
                    } else {
                        console.log(`Gmail automation failed: ${result.message}`);
                        toast.error(
                            `Failed to process emails for ${email.email}: ${result.message}`
                        );
                    }
                } catch (error) {
                    console.log(`Gmail automation failed: ${error.message}`);
                    toast.error(`Error during automation for ${email.email}: ${error.message}`);
                }
            } else {
                // No transfer node found, provide manual instructions
                console.log(
                    `No "Transfer from Spam to Inbox" node found in pipeline for ${email.email}`
                );
                toast.success(
                    `Browser opened for ${email.email}. Please navigate to Gmail and manually transfer emails from spam.`
                );
            }
        } catch (error) {
            console.error(`Error running automation for ${email.email}:`, error);
            toast.error(`Failed to run automation for ${email.email}: ${error.message}`);
        }
    }

    // Stop all automations
    async stopAllAutomations(): Promise<void> {
        if (!this.isRunning || this.runningAutomations.length === 0) {
            toast.success('No automations running');
            return;
        }

        try {
            toast.success(`Stopping ${this.runningAutomations.length} automation(s)...`);

            // Stop each profile
            const stopPromises = this.runningAutomations.map(async (automation) => {
                try {
                    await GoLoginDirectService.stopProfile(automation.profileId);
                    console.log(`Stopped profile ${automation.profileId} for ${automation.email}`);
                } catch (error) {
                    console.error(`Error stopping profile ${automation.profileId}:`, error);
                }
            });

            await Promise.all(stopPromises);

            // Clear running automations
            this.runningAutomations = [];
            this.isRunning = false;

            toast.success('All automations stopped');
        } catch (error) {
            console.error('Error stopping automations:', error);
            toast.error(
                `Error stopping automations: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    // Check if automation is running
    isAutomationRunning(): boolean {
        return this.isRunning;
    }

    // Get count of running automations
    getRunningAutomationsCount(): number {
        return this.runningAutomations.length;
    }

    async createProfileForEmail(email: string, proxy?: Proxy): Promise<string> {
        try {
            console.log(`Creating profile for ${email}...`);

            // Generate a realistic profile name based on email
            const profileName = `${email.split('@')[0]}_${Date.now()}`;

            // Create a profile with Gmail-friendly settings
            const profileData = {
                name: profileName,
                notes: `Automation profile for ${email}`,
                browserType: 'chrome',
                // Don't set Gmail as startUrl to avoid detection
                startUrl: 'https://www.google.com',
                navigator: {
                    userAgent:
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                    platform: 'Win32',
                    language: 'en-US',
                    resolution: '1920x1080',
                    hardwareConcurrency: 8,
                },
                // Enable Google services to avoid "unsafe browser" warnings
                googleServicesEnabled: true,
                // Add realistic timezone
                timezone: {
                    enabled: true,
                    fillBasedOnIp: true,
                    timezone: 'America/New_York',
                },
                // Add noise to canvas/WebGL/audio to appear more realistic
                canvas: {
                    mode: 'noise',
                    noise: 0.5,
                },
                webGL: {
                    mode: 'noise',
                    noise: 0.5,
                },
                audioContext: {
                    mode: 'noise',
                    noise: 0.5,
                },
                // Disable WebRTC to prevent IP leaks
                webRTC: {
                    mode: 'disabled',
                    enabled: false,
                },
                // Add fonts to appear more realistic
                fonts: {
                    enableMasking: true,
                    enableDomRect: true,
                    families: [
                        'Arial',
                        'Courier',
                        'Courier New',
                        'Georgia',
                        'Helvetica',
                        'Times',
                        'Times New Roman',
                        'Verdana',
                        'Roboto',
                        'Tahoma',
                    ],
                },
                // Add proxy configuration if provided
                proxy: proxy
                    ? {
                          mode: 'http',
                          host: proxy.host,
                          port: proxy.port,
                          // Don't include username/password if not defined in Proxy type
                          username: '',
                          password: '',
                      }
                    : null,
            };

            // Create the profile using the GoLogin API through IPC
            const result = (await window.electron.ipcRenderer.invoke(
                'api:createGoLoginProfile',
                profileData
            )) as { id: string };

            if (result && result.id) {
                console.log(`Created profile ${result.id} for ${email}`);
                return result.id;
            } else {
                throw new Error('Failed to create GoLogin profile - no ID returned');
            }
        } catch (error) {
            console.error(`Error creating profile for ${email}:`, error);
            throw error;
        }
    }
}

export default new AutomationService();
