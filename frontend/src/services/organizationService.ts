import api from './api';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto, OrganizationSearchParams } from '../types/organization';

export const organizationService = {
  // Get all organizations with pagination and filters
  async getOrganizations(params?: OrganizationSearchParams) {
    const response = await api.get('/organizations', { params });
    return response.data;
  },

  // Get single organization by ID
  async getOrganizationById(id: number) {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  // Get my organization
  async getMyOrganization() {
    const response = await api.get<Organization>('/organizations/my-organization');
    return response.data;
  },

  // Create new organization
  async createOrganization(data: CreateOrganizationDto) {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  // Update organization
  async updateOrganization(id: number, data: UpdateOrganizationDto) {
    const response = await api.put<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  // Delete organization
  async deleteOrganization(id: number) {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  },

  // Verify organization
  async verifyOrganization(id: number) {
    const response = await api.post(`/organizations/${id}/verify`);
    return response.data;
  },

  // Reject organization verification
  async rejectVerification(id: number, reason: string) {
    const response = await api.post(`/organizations/${id}/reject-verification`, { reason });
    return response.data;
  },

  // Get organization documents
  async getOrganizationDocuments(id: number) {
    const response = await api.get(`/organizations/${id}/documents`);
    return response.data;
  },

  // Upload organization document
  async uploadOrganizationDocument(id: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await api.post(`/organizations/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get organization users
  async getOrganizationUsers(id: number) {
    const response = await api.get(`/organizations/${id}/users`);
    return response.data;
  },

  // Invite user to organization
  async inviteUser(id: number, email: string, role: string) {
    const response = await api.post(`/organizations/${id}/invite`, { email, role });
    return response.data;
  },

  // Remove user from organization
  async removeUser(organizationId: number, userId: number) {
    const response = await api.delete(`/organizations/${organizationId}/users/${userId}`);
    return response.data;
  },

  // Get organization tenders
  async getOrganizationTenders(id: number) {
    const response = await api.get(`/organizations/${id}/tenders`);
    return response.data;
  },

  // Get organization bids
  async getOrganizationBids(id: number) {
    const response = await api.get(`/organizations/${id}/bids`);
    return response.data;
  },

  // Get organization statistics
  async getOrganizationStatistics(id: number) {
    const response = await api.get(`/organizations/${id}/statistics`);
    return response.data;
  },

  // Get organization types
  async getOrganizationTypes() {
    const response = await api.get('/organizations/types');
    return response.data;
  },

  // Search organizations
  async searchOrganizations(query: string) {
    const response = await api.get('/organizations/search', { params: { q: query } });
    return response.data;
  },

  // Export organization data
  async exportOrganizations(format: 'pdf' | 'excel' | 'csv', params?: OrganizationSearchParams) {
    const response = await api.get(`/organizations/export/${format}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
