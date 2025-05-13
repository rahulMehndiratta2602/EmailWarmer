/**
 * GoLoginDirectService - Service for direct operations with GoLogin profiles
 * This service provides methods to start and stop GoLogin profiles
 */
class GoLoginDirectService {
    /**
     * Start a GoLogin profile
     * @param profileId - The ID of the profile to start
     * @param sync - Whether to wait for the profile to start before returning
     * @returns A promise that resolves with the profile start response, which includes the debuggerAddress
     */
    static async startProfile(profileId: string, sync: boolean = true): Promise<any> {
        try {
            console.log(`Starting GoLogin profile: ${profileId} (sync: ${sync})`);
            const result = await window.api.startGoLoginProfile(profileId, sync);
            console.log(`GoLogin profile started: ${profileId}`);

            // Log the debugging address if available
            if (result && result.debuggingAddress) {
                console.log(`Debugging address: ${result.debuggingAddress}`);
            } else if (result && result.wsUrl) {
                console.log(`WebSocket URL: ${result.wsUrl}`);
            }

            return result;
        } catch (error) {
            console.error(`Error starting GoLogin profile ${profileId}:`, error);
            throw error;
        }
    }

    /**
     * Stop a GoLogin profile
     * @param profileId - The ID of the profile to stop
     * @returns A promise that resolves when the profile has stopped
     */
    static async stopProfile(profileId: string): Promise<any> {
        try {
            console.log(`Stopping GoLogin profile: ${profileId}`);
            const result = await window.api.stopGoLoginProfile(profileId);
            console.log(`GoLogin profile stopped: ${profileId}`);
            return result;
        } catch (error) {
            console.error(`Error stopping GoLogin profile ${profileId}:`, error);
            throw error;
        }
    }
}

export default GoLoginDirectService;
