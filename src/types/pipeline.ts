import { EmailAction } from '../components/ActionPipeline';

export interface ActionNode {
  id: string;
  action: EmailAction | null;
}

export interface Pipeline {
  id: string;
  name: string;
  nodes: ActionNode[];
  createdAt?: string;
  updatedAt?: string;
} 