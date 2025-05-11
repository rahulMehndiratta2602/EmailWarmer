import { EmailAction } from '../components/ActionPipeline';

export interface ActionNode {
    id: string;
    action: EmailAction | null;
    metadata?: Record<string, any>;
}

export interface Pipeline {
    id: string;
    name: string;
    nodes: ActionNode[];
    createdAt?: string;
    updatedAt?: string;
}
