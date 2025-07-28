import api from './api';

export const integrationService = {
  // API Documentation
  getApiSpec: async () => {
    return api.get('/api-docs/spec');
  },

  // Integrations Management
  getIntegrations: async (params?: any) => {
    return api.get('/integrations', { params });
  },

  getIntegration: async (id: string) => {
    return api.get(`/integrations/${id}`);
  },

  createIntegration: async (data: {
    type: string;
    provider: string;
    name: string;
    config: any;
  }) => {
    return api.post('/integrations', data);
  },

  updateIntegration: async (id: string, data: any) => {
    return api.put(`/integrations/${id}`, data);
  },

  deleteIntegration: async (id: string) => {
    return api.delete(`/integrations/${id}`);
  },

  testIntegration: async (id: string) => {
    return api.post(`/integrations/${id}/test`);
  },

  syncIntegration: async (id: string) => {
    return api.post(`/integrations/${id}/sync`);
  },

  getIntegrationLogs: async (id: string, params?: any) => {
    return api.get(`/integrations/${id}/logs`, { params });
  },

  // Webhook Management
  getWebhooks: async (params?: any) => {
    return api.get('/webhooks', { params });
  },

  getWebhook: async (id: string) => {
    return api.get(`/webhooks/${id}`);
  },

  createWebhook: async (data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    headers?: Record<string, string>;
    retryPolicy?: {
      maxRetries: number;
      retryDelay: number;
    };
  }) => {
    return api.post('/webhooks', data);
  },

  updateWebhook: async (id: string, data: any) => {
    return api.put(`/webhooks/${id}`, data);
  },

  deleteWebhook: async (id: string) => {
    return api.delete(`/webhooks/${id}`);
  },

  testWebhook: async (id: string) => {
    return api.post(`/webhooks/${id}/test`);
  },

  getWebhookLogs: async (webhookId: string, params?: any) => {
    return api.get(`/webhooks/${webhookId}/logs`, { params });
  },

  retryWebhook: async (webhookId: string, logId: string) => {
    return api.post(`/webhooks/${webhookId}/logs/${logId}/retry`);
  },

  // Cloud Storage Integration
  uploadFile: async (integrationId: string, file: File, path?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (path) formData.append('path', path);

    return api.post(`/integrations/${integrationId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  listFiles: async (integrationId: string, path?: string) => {
    return api.get(`/integrations/${integrationId}/files`, {
      params: { path },
    });
  },

  downloadFile: async (integrationId: string, fileId: string) => {
    return api.get(`/integrations/${integrationId}/files/${fileId}/download`, {
      responseType: 'blob',
    });
  },

  deleteFile: async (integrationId: string, fileId: string) => {
    return api.delete(`/integrations/${integrationId}/files/${fileId}`);
  },

  // Email Integration
  sendEmail: async (integrationId: string, data: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    attachments?: any[];
    template?: string;
    templateData?: any;
  }) => {
    return api.post(`/integrations/${integrationId}/send-email`, data);
  },

  getEmailTemplates: async (integrationId: string) => {
    return api.get(`/integrations/${integrationId}/email-templates`);
  },

  createEmailTemplate: async (integrationId: string, data: any) => {
    return api.post(`/integrations/${integrationId}/email-templates`, data);
  },

  updateEmailTemplate: async (integrationId: string, templateId: string, data: any) => {
    return api.put(`/integrations/${integrationId}/email-templates/${templateId}`, data);
  },

  deleteEmailTemplate: async (integrationId: string, templateId: string) => {
    return api.delete(`/integrations/${integrationId}/email-templates/${templateId}`);
  },

  // SMS Integration
  sendSMS: async (integrationId: string, data: {
    to: string[];
    message: string;
    template?: string;
    templateData?: any;
  }) => {
    return api.post(`/integrations/${integrationId}/send-sms`, data);
  },

  getSMSTemplates: async (integrationId: string) => {
    return api.get(`/integrations/${integrationId}/sms-templates`);
  },

  createSMSTemplate: async (integrationId: string, data: any) => {
    return api.post(`/integrations/${integrationId}/sms-templates`, data);
  },

  updateSMSTemplate: async (integrationId: string, templateId: string, data: any) => {
    return api.put(`/integrations/${integrationId}/sms-templates/${templateId}`, data);
  },

  deleteSMSTemplate: async (integrationId: string, templateId: string) => {
    return api.delete(`/integrations/${integrationId}/sms-templates/${templateId}`);
  },

  // Payment Integration
  createPaymentLink: async (integrationId: string, data: {
    amount: number;
    currency: string;
    description?: string;
    customer?: any;
    metadata?: any;
    expiresAt?: string;
  }) => {
    return api.post(`/integrations/${integrationId}/payment-links`, data);
  },

  getPaymentLink: async (integrationId: string, linkId: string) => {
    return api.get(`/integrations/${integrationId}/payment-links/${linkId}`);
  },

  getPaymentTransactions: async (integrationId: string, params?: any) => {
    return api.get(`/integrations/${integrationId}/transactions`, { params });
  },

  refundPayment: async (integrationId: string, transactionId: string, data: {
    amount?: number;
    reason?: string;
  }) => {
    return api.post(`/integrations/${integrationId}/transactions/${transactionId}/refund`, data);
  },

  // Automation Integration (Make, Zapier)
  getAutomationScenarios: async (integrationId: string) => {
    return api.get(`/integrations/${integrationId}/scenarios`);
  },

  triggerAutomation: async (integrationId: string, scenarioId: string, data?: any) => {
    return api.post(`/integrations/${integrationId}/scenarios/${scenarioId}/trigger`, data);
  },

  getAutomationWebhookUrl: async (integrationId: string) => {
    return api.get(`/integrations/${integrationId}/webhook-url`);
  },

  // Integration Analytics
  getIntegrationStats: async (integrationId: string, params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }) => {
    return api.get(`/integrations/${integrationId}/stats`, { params });
  },

  getIntegrationUsage: async (integrationId: string, params?: any) => {
    return api.get(`/integrations/${integrationId}/usage`, { params });
  },

  // OAuth Management
  getOAuthUrl: async (provider: string, redirectUri?: string) => {
    return api.get('/integrations/oauth/authorize', {
      params: { provider, redirectUri },
    });
  },

  exchangeOAuthToken: async (provider: string, code: string, redirectUri?: string) => {
    return api.post('/integrations/oauth/token', {
      provider,
      code,
      redirectUri,
    });
  },

  refreshOAuthToken: async (integrationId: string) => {
    return api.post(`/integrations/${integrationId}/refresh-token`);
  },

  // API Key Management
  generateApiKey: async (data: {
    name: string;
    permissions: string[];
    expiresAt?: string;
  }) => {
    return api.post('/api-keys', data);
  },

  getApiKeys: async () => {
    return api.get('/api-keys');
  },

  revokeApiKey: async (keyId: string) => {
    return api.delete(`/api-keys/${keyId}`);
  },

  // Rate Limiting
  getRateLimits: async () => {
    return api.get('/rate-limits');
  },

  updateRateLimits: async (data: any) => {
    return api.put('/rate-limits', data);
  },

  // Integration Marketplace
  getAvailableIntegrations: async (params?: {
    category?: string;
    search?: string;
  }) => {
    return api.get('/integrations/marketplace', { params });
  },

  installIntegration: async (integrationId: string) => {
    return api.post(`/integrations/marketplace/${integrationId}/install`);
  },

  // Webhook Event Types
  getWebhookEventTypes: async () => {
    return api.get('/webhooks/event-types');
  },

  // Integration Health Check
  checkIntegrationHealth: async (integrationId: string) => {
    return api.get(`/integrations/${integrationId}/health`);
  },

  checkAllIntegrationsHealth: async () => {
    return api.get('/integrations/health');
  },
};

export default integrationService;
