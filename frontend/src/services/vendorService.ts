import { apiClient } from './api';

export interface Vendor {
  id: string;
  companyName: string;
  registrationNumber: string;
  type: string;
  status: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  categories?: string[];
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorDto {
  companyName: string;
  registrationNumber: string;
  type: string;
  email: string;
  phone: string;
  address?: string;
  taxId?: string;
  categories?: string[];
  contactPerson?: string;
  website?: string;
  bankDetails?: any;
}

export interface UpdateVendorDto extends Partial<CreateVendorDto> {
  status?: string;
  rating?: number;
  verificationRemarks?: string;
  suspensionReason?: string;
  blacklistReason?: string;
}

export interface VendorPerformance {
  vendorId: string;
  totalBids: number;
  wonBids: number;
  completedContracts: number;
  averageRating: number;
  totalRevenue: number;
}

export const vendorService = {
  // Create vendor
  async create(data: CreateVendorDto): Promise<Vendor> {
    const response = await apiClient.post<Vendor>('/vendors', data);
    return response.data;
  },

  // Get all vendors
  async getAll(params?: any): Promise<Vendor[]> {
    const response = await apiClient.get<Vendor[]>('/vendors', params);
    return response.data;
  },

  // Search vendors
  async search(searchTerm: string, filters?: any): Promise<Vendor[]> {
    const response = await apiClient.get<Vendor[]>('/vendors/search', { q: searchTerm, ...filters });
    return response.data;
  },

  // Get vendor by ID
  async getById(id: string): Promise<Vendor> {
    const response = await apiClient.get<Vendor>(`/vendors/${id}`);
    return response.data;
  },

  // Update vendor
  async update(id: string, data: UpdateVendorDto): Promise<Vendor> {
    const response = await apiClient.patch<Vendor>(`/vendors/${id}`, data);
    return response.data;
  },

  // Verify vendor
  async verify(id: string): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/verify`);
    return response.data;
  },

  // Approve vendor
  async approve(id: string): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/approve`);
    return response.data;
  },

  // Reject vendor
  async reject(id: string, reason: string): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/reject`, { reason });
    return response.data;
  },

  // Suspend vendor
  async suspend(id: string, data: any): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/suspend`, data);
    return response.data;
  },

  // Activate vendor
  async activate(id: string): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/activate`);
    return response.data;
  },

  // Rate vendor
  async rate(id: string, ratingData: any): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/rate`, ratingData);
    return response.data;
  },

  // Blacklist vendor
  async blacklist(id: string, data: any): Promise<Vendor> {
    const response = await apiClient.post<Vendor>(`/vendors/${id}/blacklist`, data);
    return response.data;
  },

  // Remove from blacklist
  async removeFromBlacklist(id: string): Promise<Vendor> {
    const response = await apiClient.delete<Vendor>(`/vendors/${id}/blacklist`);
    return response.data;
  },

  // Get vendor categories
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/vendors/categories');
    return response.data;
  },

  // Get vendor performance
  async getPerformance(id: string, params?: any): Promise<VendorPerformance> {
    const response = await apiClient.get<VendorPerformance>(`/vendors/${id}/performance`, params);
    return response.data;
  },

  // Get vendor bid history
  async getBidHistory(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/vendors/${id}/bids`);
    return response.data;
  },

  // Get vendor contracts
  async getContracts(id: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/vendors/${id}/contracts`);
    return response.data;
  },

  // Get vendor statistics
  async getStatistics(): Promise<any> {
    const response = await apiClient.get('/vendors/statistics');
    return response.data;
  },

  // Delete vendor
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/vendors/${id}`);
  },
};