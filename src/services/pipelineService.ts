import { EmailAction } from '../components/ActionPipeline';
import { Pipeline } from '../types/pipeline';

export interface ActionNode {
  id: string;
  action: EmailAction | null;
}

export interface Pipeline {
  id: string;
  name: string;
  nodes: ActionNode[];
}

const API_BASE_URL = 'http://localhost:3000/api';

export class PipelineService {
  private static instance: PipelineService;

  private constructor() {}

  public static getInstance(): PipelineService {
    if (!PipelineService.instance) {
      PipelineService.instance = new PipelineService();
    }
    return PipelineService.instance;
  }

  async getAllPipelines(): Promise<Pipeline[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines`);
      if (!response.ok) {
        throw new Error('Failed to fetch pipelines');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting all pipelines:', error);
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
      return await response.json();
    } catch (error) {
      console.error(`Error getting pipeline with id ${id}:`, error);
      throw error;
    }
  }

  async createPipeline(data: { name: string; nodes: { action: string }[] }): Promise<Pipeline> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create pipeline');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw error;
    }
  }

  async updatePipeline(id: string, data: { name: string; nodes: { action: string }[] }): Promise<Pipeline> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update pipeline');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating pipeline with id ${id}:`, error);
      throw error;
    }
  }

  async deletePipeline(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete pipeline');
      }
    } catch (error) {
      console.error(`Error deleting pipeline with id ${id}:`, error);
      throw error;
    }
  }
} 