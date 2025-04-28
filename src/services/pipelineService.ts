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
      };
    };
    api: {
      getPipelines: () => Promise<any[]>;
      getPipelineById: (id: string) => Promise<any>;
      savePipeline: (pipeline: any) => Promise<any>;
      deletePipeline: (id: string) => Promise<boolean>;
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
      return await window.api.savePipeline(pipeline);
    } catch (error) {
      console.error('Error saving pipeline:', error);
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
}

export const pipelineService = PipelineService.getInstance(); 