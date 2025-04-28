import { EmailAction } from '../components/ActionPipeline';
import { Pipeline, ActionNode } from '../types/pipeline';

const API_BASE_URL = 'http://localhost:3001/api';

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
      const response = await fetch(`${API_BASE_URL}/pipelines`);
      if (!response.ok) {
        throw new Error('Failed to fetch pipelines');
      }
      const data = await response.json();
      this.pipelines = data.map((pipeline: any) => ({
        ...pipeline,
        nodes: pipeline.nodes.map((node: any) => ({
          id: node.id,
          action: node.action as EmailAction | null
        }))
      }));
      return this.pipelines;
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      throw error;
    }
  }

  async getPipelineById(id: string): Promise<Pipeline | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch pipeline');
      }
      const data = await response.json();
      return {
        ...data,
        nodes: data.nodes.map((node: any) => ({
          id: node.id,
          action: node.action as EmailAction | null
        }))
      };
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      throw error;
    }
  }

  async savePipeline(pipeline: Omit<Pipeline, 'id'> & { id?: string }): Promise<Pipeline> {
    try {
      const method = pipeline.id ? 'PUT' : 'POST';
      const url = pipeline.id 
        ? `${API_BASE_URL}/pipelines/${pipeline.id}`
        : `${API_BASE_URL}/pipelines`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipeline),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} pipeline`);
      }

      const data = await response.json();
      const savedPipeline = {
        ...data,
        nodes: data.nodes.map((node: any) => ({
          id: node.id,
          action: node.action as EmailAction | null
        }))
      };
      
      // Update local cache
      if (method === 'POST') {
        this.pipelines.push(savedPipeline);
      } else {
        const index = this.pipelines.findIndex(p => p.id === pipeline.id);
        if (index !== -1) {
          this.pipelines[index] = savedPipeline;
        }
      }

      return savedPipeline;
    } catch (error) {
      console.error('Error saving pipeline:', error);
      throw error;
    }
  }

  async deletePipeline(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to delete pipeline');
      }

      // Update local cache
      this.pipelines = this.pipelines.filter(p => p.id !== id);
      return true;
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      throw error;
    }
  }
}

export const pipelineService = PipelineService.getInstance(); 