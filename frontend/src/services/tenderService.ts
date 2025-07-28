import api from './api';
import { Tender, CreateTenderDto, UpdateTenderDto, TenderSearchParams } from '../types/tender';

export const tenderService = {
  // Get all tenders with pagination and filters
  async getTenders(params?: TenderSearchParams) {
    const response = await api.get('/tenders', { params });
    return response.data;
  },

  // Get single tender by ID
  async getTenderById(id: number) {
    const response = await api.get<Tender>(`/tenders/${id}`);
    return response.data;
  },

  // Create new tender
  async createTender(data: CreateTenderDto) {
    const response = await api.post<Tender>('/tenders', data);
    return response.data;
  },

  // Update tender
  async updateTender(id: number, data: UpdateTenderDto) {
    const response = await api.put<Tender>(`/tenders/${id}`, data);
    return response.data;
  },

  // Delete tender
  async deleteTender(id: number) {
    const response = await api.delete(`/tenders/${id}`);
    return response.data;
  },

  // Publish tender
  async publishTender(id: number) {
    const response = await api.post(`/tenders/${id}/publish`);
    return response.data;
  },

  // Close tender
  async closeTender(id: number) {
    const response = await api.post(`/tenders/${id}/close`);
    return response.data;
  },

  // Cancel tender
  async cancelTender(id: number, reason: string) {
    const response = await api.post(`/tenders/${id}/cancel`, { reason });
    return response.data;
  },

  // Get tender documents
  async getTenderDocuments(id: number) {
    const response = await api.get(`/tenders/${id}/documents`);
    return response.data;
  },

  // Upload tender document
  async uploadTenderDocument(id: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await api.post(`/tenders/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get tender bids
  async getTenderBids(id: number) {
    const response = await api.get(`/tenders/${id}/bids`);
    return response.data;
  },

  // Get tender statistics
  async getTenderStatistics(id: number) {
    const response = await api.get(`/tenders/${id}/statistics`);
    return response.data;
  },

  // Export tender data
  async exportTenders(format: 'pdf' | 'excel' | 'csv', params?: TenderSearchParams) {
    const response = await api.get(`/tenders/export/${format}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Get tender categories
  async getCategories() {
    const response = await api.get('/tenders/categories');
    return response.data;
  },

  // Get tender templates
  async getTenderTemplates() {
    const response = await api.get('/tenders/templates');
    return response.data;
  },

  // Apply tender template
  async applyTemplate(templateId: number) {
    const response = await api.get(`/tenders/templates/${templateId}`);
    return response.data;
  },
};
