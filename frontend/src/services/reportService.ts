import api from './api';

export const reportService = {
  // Report Builder APIs
  getDataSources: async () => {
    return api.get('/reports/data-sources');
  },

  getSavedReports: async (params?: any) => {
    return api.get('/reports', { params });
  },

  getReport: async (id: string) => {
    return api.get(`/reports/${id}`);
  },

  createReport: async (data: any) => {
    return api.post('/reports', data);
  },

  updateReport: async (id: string, data: any) => {
    return api.put(`/reports/${id}`, data);
  },

  deleteReport: async (id: string) => {
    return api.delete(`/reports/${id}`);
  },

  previewReport: async (data: any) => {
    return api.post('/reports/preview', data);
  },

  exportReport: async (report: any, format: 'pdf' | 'excel' | 'csv') => {
    return api.post('/reports/export', { report, format }, {
      responseType: 'blob',
    });
  },

  // Dashboard APIs
  getDashboards: async (params?: any) => {
    return api.get('/dashboards', { params });
  },

  getDashboard: async (id: string) => {
    return api.get(`/dashboards/${id}`);
  },

  createDashboard: async (data: any) => {
    return api.post('/dashboards', data);
  },

  updateDashboard: async (id: string, data: any) => {
    return api.put(`/dashboards/${id}`, data);
  },

  deleteDashboard: async (id: string) => {
    return api.delete(`/dashboards/${id}`);
  },

  shareDashboard: async (id: string, data: any) => {
    return api.post(`/dashboards/${id}/share`, data);
  },

  exportDashboard: async (dashboard: any, format: 'pdf' | 'image') => {
    return api.post('/dashboards/export', { dashboard, format }, {
      responseType: 'blob',
    });
  },

  // Widget APIs
  getWidgetData: async (params: {
    dataSource: string;
    config: any;
    filters?: any[];
    dateRange?: any;
  }) => {
    return api.post('/widgets/data', params);
  },

  getWidgetTemplates: async () => {
    return api.get('/widgets/templates');
  },

  // Scheduled Reports
  getScheduledReports: async (params?: any) => {
    return api.get('/reports/scheduled', { params });
  },

  createScheduledReport: async (data: any) => {
    return api.post('/reports/scheduled', data);
  },

  updateScheduledReport: async (id: string, data: any) => {
    return api.put(`/reports/scheduled/${id}`, data);
  },

  deleteScheduledReport: async (id: string) => {
    return api.delete(`/reports/scheduled/${id}`);
  },

  pauseScheduledReport: async (id: string) => {
    return api.put(`/reports/scheduled/${id}/pause`);
  },

  resumeScheduledReport: async (id: string) => {
    return api.put(`/reports/scheduled/${id}/resume`);
  },

  // Report Analytics
  getReportUsageStats: async (params?: any) => {
    return api.get('/reports/analytics/usage', { params });
  },

  getPopularReports: async (params?: any) => {
    return api.get('/reports/analytics/popular', { params });
  },

  // Data Visualization
  getChartTypes: async () => {
    return api.get('/visualization/chart-types');
  },

  getColorSchemes: async () => {
    return api.get('/visualization/color-schemes');
  },

  // Real-time Analytics
  subscribeToMetrics: async (metrics: string[]) => {
    return api.post('/analytics/subscribe', { metrics });
  },

  unsubscribeFromMetrics: async (subscriptionId: string) => {
    return api.delete(`/analytics/subscribe/${subscriptionId}`);
  },

  // Report Templates
  getReportTemplates: async (params?: any) => {
    return api.get('/reports/templates', { params });
  },

  createReportTemplate: async (data: any) => {
    return api.post('/reports/templates', data);
  },

  updateReportTemplate: async (id: string, data: any) => {
    return api.put(`/reports/templates/${id}`, data);
  },

  deleteReportTemplate: async (id: string) => {
    return api.delete(`/reports/templates/${id}`);
  },

  // SQL Query Builder
  validateSQL: async (query: string) => {
    return api.post('/reports/sql/validate', { query });
  },

  executeSQL: async (query: string, params?: any) => {
    return api.post('/reports/sql/execute', { query, params });
  },

  // Custom Metrics
  getCustomMetrics: async () => {
    return api.get('/reports/metrics');
  },

  createCustomMetric: async (data: any) => {
    return api.post('/reports/metrics', data);
  },

  updateCustomMetric: async (id: string, data: any) => {
    return api.put(`/reports/metrics/${id}`, data);
  },

  deleteCustomMetric: async (id: string) => {
    return api.delete(`/reports/metrics/${id}`);
  },

  // Report Permissions
  getReportPermissions: async (reportId: string) => {
    return api.get(`/reports/${reportId}/permissions`);
  },

  updateReportPermissions: async (reportId: string, permissions: any) => {
    return api.put(`/reports/${reportId}/permissions`, permissions);
  },

  // Drill-down Analytics
  getDrillDownData: async (params: {
    dataSource: string;
    metric: string;
    dimension: string;
    value: any;
    filters?: any[];
  }) => {
    return api.post('/analytics/drill-down', params);
  },

  // Comparative Analytics
  getComparativeData: async (params: {
    dataSource: string;
    metrics: string[];
    periods: any[];
    groupBy?: string;
  }) => {
    return api.post('/analytics/compare', params);
  },

  // Predictive Analytics
  getPredictions: async (params: {
    dataSource: string;
    metric: string;
    period: number;
    algorithm?: string;
  }) => {
    return api.post('/analytics/predict', params);
  },

  // Anomaly Detection
  detectAnomalies: async (params: {
    dataSource: string;
    metric: string;
    sensitivity?: number;
  }) => {
    return api.post('/analytics/anomalies', params);
  },
};

export default reportService;
