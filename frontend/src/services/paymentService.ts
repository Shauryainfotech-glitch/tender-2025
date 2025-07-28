import { apiClient } from './api';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: string;
  method: string;
  status: string;
  transactionId?: string;
  tenderId?: string;
  bidId?: string;
  emdId?: string;
  description?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface CreatePaymentDto {
  amount: number;
  currency?: string;
  type: string;
  method: string;
  tenderId?: string;
  bidId?: string;
  emdId?: string;
  description?: string;
  metadata?: any;
}

export interface ProcessPaymentDto {
  paymentId: string;
  gateway: string;
  cardDetails?: any;
  bankDetails?: any;
  upiId?: string;
  returnUrl?: string;
  webhookUrl?: string;
  metadata?: any;
}

export interface RefundPaymentDto {
  amount?: number;
  reason: string;
  description?: string;
  notifyUser?: boolean;
  metadata?: any;
}

export const paymentService = {
  // Create payment
  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments', data);
    return response.data;
  },

  // Process payment
  async process(data: ProcessPaymentDto): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments/process', data);
    return response.data;
  },

  // Get all payments
  async getAll(params?: any): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>('/payments', params);
    return response.data;
  },

  // Get payment by ID
  async getById(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  // Get payment by transaction ID
  async getByTransactionId(transactionId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/transaction/${transactionId}`);
    return response.data;
  },

  // Update payment
  async update(id: string, data: any): Promise<Payment> {
    const response = await apiClient.patch<Payment>(`/payments/${id}`, data);
    return response.data;
  },

  // Verify payment
  async verify(id: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/payments/${id}/verify`);
    return response.data;
  },

  // Refund payment
  async refund(id: string, data: RefundPaymentDto): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/payments/${id}/refund`, data);
    return response.data;
  },

  // Generate receipt
  async generateReceipt(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/payments/${id}/receipt`);
    return response.data;
  },

  // Get payments by organization
  async getByOrganization(organizationId: string, params?: any): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(`/payments/organization/${organizationId}`, params);
    return response.data;
  },

  // Get payments by tender
  async getByTender(tenderId: string): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(`/payments/tender/${tenderId}`);
    return response.data;
  },

  // Get payment statistics
  async getStatistics(params?: any): Promise<any> {
    const response = await apiClient.get('/payments/statistics', params);
    return response.data;
  },

  // Handle payment webhook
  async handleWebhook(provider: string, payload: any): Promise<void> {
    await apiClient.post(`/payments/webhook/${provider}`, payload);
  },
};