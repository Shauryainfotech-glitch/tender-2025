import api from './api';
import { Bid, CreateBidDto, UpdateBidDto, BidSearchParams } from '../types/bid';

export const bidService = {
  // Get all bids with pagination and filters
  async getBids(params?: BidSearchParams) {
    const response = await api.get('/bids', { params });
    return response.data;
  },

  // Get single bid by ID
  async getBidById(id: number) {
    const response = await api.get<Bid>(`/bids/${id}`);
    return response.data;
  },

  // Get my bids
  async getMyBids(params?: BidSearchParams) {
    const response = await api.get('/bids/my-bids', { params });
    return response.data;
  },

  // Create new bid
  async createBid(data: CreateBidDto) {
    const response = await api.post<Bid>('/bids', data);
    return response.data;
  },

  // Update bid
  async updateBid(id: number, data: UpdateBidDto) {
    const response = await api.put<Bid>(`/bids/${id}`, data);
    return response.data;
  },

  // Submit bid
  async submitBid(id: number) {
    const response = await api.post(`/bids/${id}/submit`);
    return response.data;
  },

  // Withdraw bid
  async withdrawBid(id: number, reason: string) {
    const response = await api.post(`/bids/${id}/withdraw`, { reason });
    return response.data;
  },

  // Delete bid (only draft)
  async deleteBid(id: number) {
    const response = await api.delete(`/bids/${id}`);
    return response.data;
  },

  // Get bid documents
  async getBidDocuments(id: number) {
    const response = await api.get(`/bids/${id}/documents`);
    return response.data;
  },

  // Upload bid document
  async uploadBidDocument(id: number, file: File, documentType: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await api.post(`/bids/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete bid document
  async deleteBidDocument(bidId: number, documentId: number) {
    const response = await api.delete(`/bids/${bidId}/documents/${documentId}`);
    return response.data;
  },

  // Evaluate bid (admin only)
  async evaluateBid(id: number, evaluation: any) {
    const response = await api.post(`/bids/${id}/evaluate`, evaluation);
    return response.data;
  },

  // Shortlist bid (admin only)
  async shortlistBid(id: number) {
    const response = await api.post(`/bids/${id}/shortlist`);
    return response.data;
  },

  // Reject bid (admin only)
  async rejectBid(id: number, reason: string) {
    const response = await api.post(`/bids/${id}/reject`, { reason });
    return response.data;
  },

  // Award bid (admin only)
  async awardBid(id: number) {
    const response = await api.post(`/bids/${id}/award`);
    return response.data;
  },

  // Get bid history
  async getBidHistory(id: number) {
    const response = await api.get(`/bids/${id}/history`);
    return response.data;
  },

  // Calculate EMD
  async calculateEMD(tenderId: number, bidAmount: number) {
    const response = await api.post('/bids/calculate-emd', { tenderId, bidAmount });
    return response.data;
  },

  // Verify bid security
  async verifyBidSecurity(id: number, securityDetails: any) {
    const response = await api.post(`/bids/${id}/verify-security`, securityDetails);
    return response.data;
  },

  // Export bid data
  async exportBids(format: 'pdf' | 'excel' | 'csv', params?: BidSearchParams) {
    const response = await api.get(`/bids/export/${format}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Get bid templates
  async getBidTemplates(tenderId: number) {
    const response = await api.get(`/bids/templates/${tenderId}`);
    return response.data;
  },
};
