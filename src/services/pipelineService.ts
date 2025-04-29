import { EmailAction } from '../components/ActionPipeline';
import { Pipeline, ActionNode } from '../types/pipeline';

// Declare the electron window interface
declare global {
  interface Window {
    electron: {
      ipcRenderer: any;
      api: {
        getPipelines: () => Promise<any[]>;
        getPipelineById: (id: string) => Promise<any>;
        savePipeline: (pipeline: any) => Promise<any>;
        deletePipeline: (id: string) => Promise<boolean>;
        getAvailableActions: () => Promise<string[]>;
      };
    };
    api: {
      getPipelines: () => Promise<any[]>;
      getPipelineById: (id: string) => Promise<any>;
      savePipeline: (pipeline: any) => Promise<any>;
      deletePipeline: (id: string) => Promise<boolean>;
      getAvailableActions: () => Promise<string[]>;
    }
  }
}

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

  async getPipelines(): Promise<Pipeline[]> {
    try {
      return await window.api.getPipelines();
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  }

  async getPipelineById(id: string): Promise<Pipeline | null> {
    try {
      return await window.api.getPipelineById(id);
    } catch (error) {
      console.error(`Error fetching pipeline ${id}:`, error);
      throw error;
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
      throw error;
    }
  }

  async deletePipeline(id: string): Promise<boolean> {
    try {
      return await window.api.deletePipeline(id);
    } catch (error) {
      console.error(`Error deleting pipeline ${id}:`, error);
      throw error;
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