import { apiClient } from './api';

export interface AnalyticsData {
  totalTenders: number;
  activeTenders: number;
  totalBids: number;
  totalVendors: number;
  totalContracts: number;
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
}

export interface TenderAnalytics {
  tenderId: string;
  title: string;
  status: string;
  bidCount: number;
  averageBidAmount: number;
  lowestBid: number;
  highestBid: number;
  participationRate: number;
}

export interface VendorAnalytics {
  vendorId: string;
  name: string;
  totalBids: number;
  wonBids: number;
  successRate: number;
  averageRating: number;
  totalRevenue: number;
}

export interface RevenueAnalytics {
  period: string;
  revenue: number;
  growth: number;
  transactions: number;
}

export interface PerformanceMetrics {
  processingTime: number;
  approvalTime: number;
  completionRate: number;
  satisfactionScore: number;
}

export const analyticsService = {
  // Get dashboard analytics
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>('/analytics/dashboard');
    return response.data;
  },

  // Get tender analytics
  async getTenderAnalytics(params?: any): Promise<TenderAnalytics[]> {
    const response = await apiClient.get<TenderAnalytics[]>('/analytics/tenders', params);
    return response.data;
  },

  // Get vendor analytics
  async getVendorAnalytics(params?: any): Promise<VendorAnalytics[]> {
    const response = await apiClient.get<VendorAnalytics[]>('/analytics/vendors', params);
    return response.data;
  },

  // Get revenue analytics
  async getRevenueAnalytics(period: string): Promise<RevenueAnalytics[]> {
    const response = await apiClient.get<RevenueAnalytics[]>('/analytics/revenue', { period });
    return response.data;
  },

  // Get performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get<PerformanceMetrics>('/analytics/performance');
    return response.data;
  },

  // Get bid analysis
  async getBidAnalysis(tenderId: string): Promise<any> {
    const response = await apiClient.get(`/analytics/bids/${tenderId}`);
    return response.data;
  },

  // Get contract performance
  async getContractPerformance(params?: any): Promise<any> {
    const response = await apiClient.get('/analytics/contracts', params);
    return response.data;
  },

  // Get payment trends
  async getPaymentTrends(params?: any): Promise<any> {
    const response = await apiClient.get('/analytics/payments', params);
    return response.data;
  },

  // Generate report
  async generateReport(type: string, params: any): Promise<Blob> {
    const response = await apiClient.post<Blob>('/analytics/reports', { type, ...params });
    return response.data;
  },

  // Export analytics data
  async exportData(type: string, format: 'csv' | 'xlsx' | 'pdf'): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/analytics/export/${type}`, { format });
    return response.data;
  },

  // Get real-time statistics
  async getRealTimeStats(): Promise<any> {
    const response = await apiClient.get('/analytics/realtime');
    return response.data;
  },

  // Get forecasting data
  async getForecast(params: any): Promise<any> {
    const response = await apiClient.post('/analytics/forecast', params);
    return response.data;
  },
};