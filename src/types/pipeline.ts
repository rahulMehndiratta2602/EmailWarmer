export interface Pipeline {
  id: string;
  name: string;
  nodes: PipelineNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineNode {
  id: string;
  action: string;
  pipelineId: string;
  createdAt: Date;
  updatedAt: Date;
} 