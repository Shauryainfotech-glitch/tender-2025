import { apiClient } from './api';

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: string;
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  tenderId: string;
  vendorId: string;
  description?: string;
  terms?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractDto {
  title: string;
  contractNumber: string;
  type: string;
  value: number;
  currency?: string;
  startDate: Date;
  endDate: Date;
  tenderId: string;
  vendorId: string;
  description?: string;
  terms?: any[];
  paymentTerms?: string;
  deliveryTerms?: string;
  penaltyClauses?: string;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {
  status?: string;
  approvalRemarks?: string;
  executionDate?: Date;
  terminationReason?: string;
  amendmentDetails?: string;
}

export const contractService = {
  // Create contract
  async create(data: CreateContractDto, files?: File[]): Promise<Contract> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });
    if (files) {
      files.forEach(file => formData.append('documents', file));
    }
    const response = await apiClient.post<Contract>('/contracts', formData);
    return response.data;
  },

  // Get all contracts
  async getAll(params?: any): Promise<Contract[]> {
    const response = await apiClient.get<Contract[]>('/contracts', params);
    return response.data;
  },

  // Get contract by ID
  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  // Update contract
  async update(id: string, data: UpdateContractDto): Promise<Contract> {
    const response = await apiClient.patch<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  // Approve contract
  async approve(id: string): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/approve`);
    return response.data;
  },

  // Reject contract
  async reject(id: string, reason: string): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/reject`, { reason });
    return response.data;
  },

  // Sign contract
  async sign(id: string, signData: any): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/sign`, signData);
    return response.data;
  },

  // Execute contract
  async execute(id: string): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/execute`);
    return response.data;
  },

  // Terminate contract
  async terminate(id: string, terminationData: any): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/terminate`, terminationData);
    return response.data;
  },

  // Renew contract
  async renew(id: string, renewData: any): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/renew`, renewData);
    return response.data;
  },

  // Amend contract
  async amend(id: string, amendmentData: any): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/contracts/${id}/amend`, amendmentData);
    return response.data;
  },

  // Get contract templates
  async getTemplates(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/contracts/templates');
    return response.data;
  },

  // Get contract documents
  async getDocuments(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/contracts/${id}/documents`);
    return response.data;
  },

  // Add documents to contract
  async addDocuments(id: string, files: File[]): Promise<Contract> {
    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));
    const response = await apiClient.post<Contract>(`/contracts/${id}/documents`, formData);
    return response.data;
  },

  // Remove document from contract
  async removeDocument(contractId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/contracts/${contractId}/documents/${documentId}`);
  },

  // Get contract statistics
  async getStatistics(params?: any): Promise<any> {
    const response = await apiClient.get('/contracts/statistics', params);
    return response.data;
  },

  // Get expiring contracts
  async getExpiring(days?: number): Promise<Contract[]> {
    const response = await apiClient.get<Contract[]>('/contracts/expiring', { days });
    return response.data;
  },
};