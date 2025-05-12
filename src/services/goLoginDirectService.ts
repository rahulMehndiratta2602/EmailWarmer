/**
 * Service for direct interaction with the GoLogin API running on localhost
 */
export const GoLoginDirectService = {
    /**
     * Start a profile
     * @param profileId The ID of the profile to start
     * @param sync Whether to start synchronously (default: false)
     * @returns Promise resolving to the API response
     */
    async startProfile(profileId: string, sync: boolean = false): Promise<any> {
        try {
            console.log(`Starting profile ${profileId}, sync mode: ${sync}`);

            // Use the API bridge instead of direct IPC
            const result = await window.api.startGoLoginProfile(profileId, sync);

            console.log(`Profile ${profileId} started successfully:`, result);
            return result;
        } catch (error) {
            console.error(`Error starting profile ${profileId}:`, error);
            throw error;
        }
    },

    /**
     * Stop a profile
     * @param profileId The ID of the profile to stop
     * @returns Promise resolving to the API response
     */
    async stopProfile(profileId: string): Promise<any> {
        try {
            console.log(`Stopping profile ${profileId}`);

            // Use the API bridge instead of direct IPC
            const result = await window.api.stopGoLoginProfile(profileId);

            console.log(`Profile ${profileId} stopped successfully:`, result);
            return result;
        } catch (error) {
            console.error(`Error stopping profile ${profileId}:`, error);
            throw error;
        }
    },
};

export default GoLoginDirectService;
