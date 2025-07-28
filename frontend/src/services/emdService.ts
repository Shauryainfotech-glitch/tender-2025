import { apiClient } from './api';

export interface EMD {
  id: number;
  emdNumber: string;
  tenderId: number;
  bidId?: number;
  organizationId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  validityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEMDDto {
  tenderId: number;
  amount: number;
  paymentMethod: string;
  instrumentNumber?: string;
  bankName?: string;
  validityDate: Date;
}

export interface VerifyEMDDto {
  verificationRemarks: string;
}

export interface RefundEMDDto {
  refundReason: string;
}

export const emdService = {
  // Create EMD
  async create(data: CreateEMDDto): Promise<EMD> {
    const response = await apiClient.post<EMD>('/emd', data);
    return response.data;
  },

  // Get all EMDs
  async getAll(params?: any): Promise<EMD[]> {
    const response = await apiClient.get<EMD[]>('/emd', params);
    return response.data;
  },

  // Get EMD by ID
  async getById(id: number): Promise<EMD> {
    const response = await apiClient.get<EMD>(`/emd/${id}`);
    return response.data;
  },

  // Get EMDs by tender
  async getByTender(tenderId: number): Promise<EMD[]> {
    const response = await apiClient.get<EMD[]>(`/emd/tender/${tenderId}`);
    return response.data;
  },

  // Get EMDs by organization
  async getByOrganization(organizationId: number): Promise<EMD[]> {
    const response = await apiClient.get<EMD[]>(`/emd/organization/${organizationId}`);
    return response.data;
  },

  // Verify EMD
  async verify(id: number, data: VerifyEMDDto): Promise<EMD> {
    const response = await apiClient.post<EMD>(`/emd/${id}/verify`, data);
    return response.data;
  },

  // Refund EMD
  async refund(id: number, data: RefundEMDDto): Promise<EMD> {
    const response = await apiClient.post<EMD>(`/emd/${id}/refund`, data);
    return response.data;
  },

  // Forfeit EMD
  async forfeit(id: number, reason: string): Promise<EMD> {
    const response = await apiClient.post<EMD>(`/emd/${id}/forfeit`, { reason });
    return response.data;
  },

  // Calculate EMD amount
  async calculate(tenderId: number): Promise<{ amount: number; currency: string }> {
    const response = await apiClient.get<{ amount: number; currency: string }>(`/emd/calculate/${tenderId}`);
    return response.data;
  },

  // Get EMD statistics
  async getStatistics(): Promise<any> {
    const response = await apiClient.get('/emd/statistics');
    return response.data;
  },
};