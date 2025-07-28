import api from './api';

export const securityService = {
  // API Key Management
  getApiKeys: async () =undefined> {
    return api.get('/security/api-keys');
  },

  generateApiKey: async (data: {
    name: string;
    permissions: string[];
    expiresAt?: string;
  }) =undefined> {
    return api.post('/security/api-keys', data);
  },

  updateApiKey: async (id: string, data: any) =undefined> {
    return api.put(`/security/api-keys/${id}`, data);
  },

  deleteApiKey: async (id: string) =undefined> {
    return api.delete(`/security/api-keys/${id}`);
  },

  toggleApiKeyStatus: async (id: string, enabled: boolean) =undefined> {
    return api.patch(`/security/api-keys/${id}/status`, { enabled });
  },

  regenerateApiKey: async (id: string) =undefined> {
    return api.post(`/security/api-keys/${id}/regenerate`);
  },

  // Rate Limiting
  getRateLimits: async () =undefined> {
    return api.get('/security/rate-limits');
  },

  updateRateLimits: async (data: any) =undefined> {
    return api.put('/security/rate-limits', data);
  },

  // Security Configuration
  getSecurityConfig: async () =undefined> {
    return api.get('/security/config');
  },

  updateSecurityConfig: async (config: any) =undefined> {
    return api.put('/security/config', config);
  },

  getCorsConfiguration: async () =undefined> {
    return api.get('/security/cors');
  },

  updateCorsConfiguration: async (config: any) =undefined> {
    return api.put('/security/cors', config);
  },

  // Encryption Management
  encryptData: async (data: any) =undefined> {
    return api.post('/security/encrypt', data);
  },

  decryptData: async (encryptedData: string) =undefined> {
    return api.post('/security/decrypt', { encryptedData });
  },

  getEncryptionSettings: async () =undefined> {
    return api.get('/security/encryption/settings');
  },

  updateEncryptionSettings: async (settings: any) =undefined> {
    return api.put('/security/encryption/settings', settings);
  },

  // Input Validation
  validateInput: async (data: any) =undefined> {
    return api.post('/security/input-validation', data);
  },

  sanitizeInput: async (data: any) =undefined> {
    return api.post('/security/sanitize', data);
  },

  // Security Alerts
  getSecurityAlerts: async () =undefined> {
    return api.get('/security/alerts');
  },

  createSecurityAlert: async (data: {
    name: string;
    condition: string;
    actions: any[];
  }) =undefined> {
    return api.post('/security/alerts', data);
  },

  updateSecurityAlert: async (alertId: string, data: any) =undefined> {
    return api.put(`/security/alerts/${alertId}`, data);
  },

  deleteSecurityAlert: async (alertId: string) =undefined> {
    return api.delete(`/security/alerts/${alertId}`);
  },

  // Authentication Logs
  getAuthLogs: async (params?: any) =undefined> {
    return api.get('/security/auth-logs', { params });
  },

  getAuthLogDetails: async (logId: string) =undefined> {
    return api.get(`/security/auth-logs/${logId}`);
  },
};

export default securityService;

