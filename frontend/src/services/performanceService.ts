import api from './api';

export const performanceService = {
  // Cache Management
  getCacheStats: async () => {
    return api.get('/performance/cache/stats');
  },

  clearCache: async (pattern?: string) => {
    return api.post('/performance/cache/clear', { pattern });
  },

  warmCache: async () => {
    return api.post('/performance/cache/warm');
  },

  updateCacheConfig: async (config: any) => {
    return api.put('/performance/cache/config', config);
  },

  getCacheKeys: async (params?: { pattern?: string; limit?: number }) => {
    return api.get('/performance/cache/keys', { params });
  },

  getCacheValue: async (key: string) => {
    return api.get(`/performance/cache/keys/${key}`);
  },

  setCacheValue: async (key: string, value: any, ttl?: number) => {
    return api.post('/performance/cache/keys', { key, value, ttl });
  },

  deleteCacheKey: async (key: string) => {
    return api.delete(`/performance/cache/keys/${key}`);
  },

  // Database Query Optimization
  getQueryOptimizations: async () => {
    return api.get('/performance/queries/optimizations');
  },

  analyzeQueries: async () => {
    return api.post('/performance/queries/analyze');
  },

  optimizeQuery: async (queryId: string) => {
    return api.post(`/performance/queries/${queryId}/optimize`);
  },

  getSlowQueries: async (params?: {
    threshold?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get('/performance/queries/slow', { params });
  },

  getQueryExplain: async (query: string) => {
    return api.post('/performance/queries/explain', { query });
  },

  createIndex: async (table: string, columns: string[], options?: any) => {
    return api.post('/performance/database/indexes', { table, columns, options });
  },

  getIndexes: async (table?: string) => {
    return api.get('/performance/database/indexes', { params: { table } });
  },

  dropIndex: async (indexName: string) => {
    return api.delete(`/performance/database/indexes/${indexName}`);
  },

  // Lazy Loading Configuration
  getLazyLoadingConfig: async () => {
    return api.get('/performance/lazy-loading/config');
  },

  updateLazyLoadingConfig: async (config: any) => {
    return api.put('/performance/lazy-loading/config', config);
  },

  getLazyLoadingStats: async () => {
    return api.get('/performance/lazy-loading/stats');
  },

  // Image Optimization
  getImageSettings: async () => {
    return api.get('/performance/images/settings');
  },

  updateImageSettings: async (settings: any) => {
    return api.put('/performance/images/settings', settings);
  },

  optimizeExistingImages: async (params?: {
    path?: string;
    batchSize?: number;
    format?: string;
  }) => {
    return api.post('/performance/images/optimize', params);
  },

  getImageOptimizationStats: async () => {
    return api.get('/performance/images/stats');
  },

  optimizeImage: async (imageId: string, options?: any) => {
    return api.post(`/performance/images/${imageId}/optimize`, options);
  },

  convertImageFormat: async (imageId: string, format: string) => {
    return api.post(`/performance/images/${imageId}/convert`, { format });
  },

  generateImageVariants: async (imageId: string, sizes: number[]) => {
    return api.post(`/performance/images/${imageId}/variants`, { sizes });
  },

  // CDN Integration
  getCDNStats: async () => {
    return api.get('/performance/cdn/stats');
  },

  getCDNConfig: async () => {
    return api.get('/performance/cdn/config');
  },

  updateCDNConfig: async (config: any) => {
    return api.put('/performance/cdn/config', config);
  },

  purgeCDN: async (path?: string) => {
    return api.post('/performance/cdn/purge', { path });
  },

  preloadCDN: async (urls: string[]) => {
    return api.post('/performance/cdn/preload', { urls });
  },

  getCDNUsage: async (params?: {
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'week' | 'month';
  }) => {
    return api.get('/performance/cdn/usage', { params });
  },

  getCDNZones: async () => {
    return api.get('/performance/cdn/zones');
  },

  createCDNZone: async (data: any) => {
    return api.post('/performance/cdn/zones', data);
  },

  updateCDNZone: async (zoneId: string, data: any) => {
    return api.put(`/performance/cdn/zones/${zoneId}`, data);
  },

  deleteCDNZone: async (zoneId: string) => {
    return api.delete(`/performance/cdn/zones/${zoneId}`);
  },

  // Performance Metrics
  getPerformanceMetrics: async () => {
    return api.get('/performance/metrics');
  },

  getPerformanceHistory: async (params?: {
    metrics?: string[];
    startDate?: string;
    endDate?: string;
    granularity?: 'minute' | 'hour' | 'day';
  }) => {
    return api.get('/performance/metrics/history', { params });
  },

  runPerformanceTest: async (params?: {
    url?: string;
    testType?: 'lighthouse' | 'webpagetest' | 'custom';
  }) => {
    return api.post('/performance/test', params);
  },

  getPerformanceReports: async () => {
    return api.get('/performance/reports');
  },

  generatePerformanceReport: async (params: {
    startDate: string;
    endDate: string;
    metrics?: string[];
  }) => {
    return api.post('/performance/reports', params);
  },

  // Resource Monitoring
  getResourceUsage: async () => {
    return api.get('/performance/resources/usage');
  },

  getMemoryUsage: async () => {
    return api.get('/performance/resources/memory');
  },

  getCPUUsage: async () => {
    return api.get('/performance/resources/cpu');
  },

  getDiskUsage: async () => {
    return api.get('/performance/resources/disk');
  },

  getNetworkUsage: async () => {
    return api.get('/performance/resources/network');
  },

  // Application Performance Monitoring (APM)
  getAPMData: async () => {
    return api.get('/performance/apm');
  },

  getTransactionTraces: async (params?: {
    transaction?: string;
    minDuration?: number;
    limit?: number;
  }) => {
    return api.get('/performance/apm/traces', { params });
  },

  getErrorRates: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'endpoint' | 'error_type';
  }) => {
    return api.get('/performance/apm/errors', { params });
  },

  getEndpointMetrics: async () => {
    return api.get('/performance/apm/endpoints');
  },

  // Optimization Recommendations
  getOptimizationRecommendations: async () => {
    return api.get('/performance/recommendations');
  },

  applyOptimization: async (recommendationId: string) => {
    return api.post(`/performance/recommendations/${recommendationId}/apply`);
  },

  dismissRecommendation: async (recommendationId: string) => {
    return api.post(`/performance/recommendations/${recommendationId}/dismiss`);
  },

  // Background Jobs
  getBackgroundJobs: async () => {
    return api.get('/performance/jobs');
  },

  createBackgroundJob: async (data: {
    type: string;
    schedule?: string;
    params?: any;
  }) => {
    return api.post('/performance/jobs', data);
  },

  updateBackgroundJob: async (jobId: string, data: any) => {
    return api.put(`/performance/jobs/${jobId}`, data);
  },

  deleteBackgroundJob: async (jobId: string) => {
    return api.delete(`/performance/jobs/${jobId}`);
  },

  runBackgroundJob: async (jobId: string) => {
    return api.post(`/performance/jobs/${jobId}/run`);
  },

  // Performance Alerts
  getPerformanceAlerts: async () => {
    return api.get('/performance/alerts');
  },

  createPerformanceAlert: async (data: {
    name: string;
    metric: string;
    threshold: number;
    condition: 'above' | 'below';
    duration?: number;
    actions?: any[];
  }) => {
    return api.post('/performance/alerts', data);
  },

  updatePerformanceAlert: async (alertId: string, data: any) => {
    return api.put(`/performance/alerts/${alertId}`, data);
  },

  deletePerformanceAlert: async (alertId: string) => {
    return api.delete(`/performance/alerts/${alertId}`);
  },

  togglePerformanceAlert: async (alertId: string, enabled: boolean) => {
    return api.patch(`/performance/alerts/${alertId}`, { enabled });
  },

  // Performance Budget
  getPerformanceBudget: async () => {
    return api.get('/performance/budget');
  },

  updatePerformanceBudget: async (budget: {
    metrics: Array<{
      name: string;
      target: number;
      warning?: number;
    }>;
  }) => {
    return api.put('/performance/budget', budget);
  },

  // Real User Monitoring (RUM)
  getRUMData: async (params?: {
    startDate?: string;
    endDate?: string;
    metrics?: string[];
  }) => {
    return api.get('/performance/rum', { params });
  },

  getRUMPageViews: async (params?: any) => {
    return api.get('/performance/rum/page-views', { params });
  },

  getRUMUserSessions: async (params?: any) => {
    return api.get('/performance/rum/sessions', { params });
  },

  // Database Connection Pooling
  getConnectionPoolStats: async () => {
    return api.get('/performance/database/pool/stats');
  },

  updateConnectionPoolConfig: async (config: {
    minConnections?: number;
    maxConnections?: number;
    idleTimeout?: number;
    acquireTimeout?: number;
  }) => {
    return api.put('/performance/database/pool/config', config);
  },

  resetConnectionPool: async () => {
    return api.post('/performance/database/pool/reset');
  },
};

export default performanceService;
