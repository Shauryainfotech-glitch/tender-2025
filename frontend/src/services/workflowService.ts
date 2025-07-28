import { apiClient } from './api';

export interface WorkflowStage {
  name: string;
  description: string;
  approvers?: string[];
  duration?: number;
  status?: string;
  completedAt?: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  entityId?: string;
  entityType?: string;
  stages: WorkflowStage[];
  currentStageIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkflowDto {
  name: string;
  description: string;
  type: string;
  entityId?: string;
  entityType?: string;
  stages: WorkflowStage[];
  metadata?: any;
}

export interface UpdateWorkflowDto extends Partial<CreateWorkflowDto> {
  status?: string;
  currentStageIndex?: number;
  notes?: string;
}

export const workflowService = {
  // Create workflow
  async create(data: CreateWorkflowDto): Promise<Workflow> {
    const response = await apiClient.post<Workflow>('/workflow', data);
    return response.data;
  },

  // Get all workflows
  async getAll(params?: any): Promise<Workflow[]> {
    const response = await apiClient.get<Workflow[]>('/workflow', params);
    return response.data;
  },

  // Get workflow by ID
  async getById(id: string): Promise<Workflow> {
    const response = await apiClient.get<Workflow>(`/workflow/${id}`);
    return response.data;
  },

  // Update workflow
  async update(id: string, data: UpdateWorkflowDto): Promise<Workflow> {
    const response = await apiClient.patch<Workflow>(`/workflow/${id}`, data);
    return response.data;
  },

  // Advance workflow to next stage
  async advance(id: string, data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflow/${id}/advance`, data);
    return response.data;
  },

  // Revert workflow to previous stage
  async revert(id: string, data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflow/${id}/revert`, data);
    return response.data;
  },

  // Approve workflow stage
  async approve(id: string, data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflow/${id}/approve`, data);
    return response.data;
  },

  // Reject workflow stage
  async reject(id: string, data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflow/${id}/reject`, data);
    return response.data;
  },

  // Assign workflow
  async assign(id: string, data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflow/${id}/assign`, data);
    return response.data;
  },

  // Escalate workflow
  async escalate(id: string, data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflow/${id}/escalate`, data);
    return response.data;
  },

  // Get workflow templates
  async getTemplates(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/workflow/templates');
    return response.data;
  },

  // Get workflow stages
  async getStages(id: string): Promise<WorkflowStage[]> {
    const response = await apiClient.get<WorkflowStage[]>(`/workflow/${id}/stages`);
    return response.data;
  },

  // Get workflow history
  async getHistory(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/workflow/${id}/history`);
    return response.data;
  },

  // Delete workflow
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workflow/${id}`);
  },
};