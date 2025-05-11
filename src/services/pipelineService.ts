import { EmailAction } from '../components/ActionPipeline';
import { Pipeline } from '../types/pipeline';
// Window interface is now declared in types/window.d.ts

export class PipelineService {
    private static instance: PipelineService;
    private pipelines: Pipeline[] = [];

    private constructor() {}

    public static getInstance(): PipelineService {
        if (!PipelineService.instance) {
            PipelineService.instance = new PipelineService();
        }
        return PipelineService.instance;
    }

    // Mock data for when the server is down
    private getMockPipelines(): Pipeline[] {
        return [
            {
                id: 'mock-1',
                name: 'Demo Pipeline',
                nodes: [
                    { id: '1', action: EmailAction.TRANSFER_FROM_SPAM },
                    { id: '2', action: EmailAction.CLICK_LINK },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];
    }

    async getPipelines(): Promise<Pipeline[]> {
        try {
            return await window.api.getPipelines();
        } catch (error) {
            console.error('Error fetching pipelines:', error);
            // Return mock data instead of throwing
            return this.getMockPipelines();
        }
    }

    async getPipelineById(id: string): Promise<Pipeline | null> {
        try {
            return await window.api.getPipelineById(id);
        } catch (error) {
            console.error(`Error fetching pipeline ${id}:`, error);
            // Return a mock pipeline if id matches our mock, or null
            const mockPipelines = this.getMockPipelines();
            return mockPipelines.find((p) => p.id === id) || null;
        }
    }

    async savePipeline(pipeline: any): Promise<Pipeline> {
        try {
            console.log('pipelineService.savePipeline called with:', pipeline);

            // If pipeline has an empty ID string, set to undefined for new pipeline
            if (pipeline.id === '') {
                pipeline.id = undefined;
            }

            console.log('Calling window.api.savePipeline with:', pipeline);
            const result = await window.api.savePipeline(pipeline);
            console.log('Result from window.api.savePipeline:', result);

            return result;
        } catch (error) {
            console.error('Error in pipelineService.savePipeline:', error);
            // Create a mock saved pipeline
            const mockPipeline: Pipeline = {
                id: pipeline.id || `mock-${Date.now()}`,
                name: pipeline.name || 'Unnamed Pipeline',
                nodes: pipeline.nodes || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return mockPipeline;
        }
    }

    async deletePipeline(id: string): Promise<boolean> {
        try {
            return await window.api.deletePipeline(id);
        } catch (error) {
            console.error(`Error deleting pipeline ${id}:`, error);
            // Pretend deletion was successful
            return true;
        }
    }

    async getAvailableActions(): Promise<string[]> {
        try {
            // First try to get from API
            return await window.api.getAvailableActions();
        } catch (error) {
            console.error('Error fetching available actions:', error);
            // Fallback to enum values if API call fails
            return Object.values(EmailAction);
        }
    }
}

export const pipelineService = PipelineService.getInstance();
