import api from './api';

export const devOpsService = {
  // CI/CD Pipeline Management
  getPipelines: async (filters?: any) => {
    return api.get('/devops/pipelines', { params: filters });
  },

  getPipeline: async (id: string) => {
    return api.get(`/devops/pipelines/${id}`);
  },

  runPipeline: async (id: string, config?: any) => {
    return api.post(`/devops/pipelines/${id}/run`, config);
  },

  cancelPipeline: async (id: string) => {
    return api.post(`/devops/pipelines/${id}/cancel`);
  },

  getPipelineConfig: async (id: string) => {
    return api.get(`/devops/pipelines/${id}/config`);
  },

  updatePipelineConfig: async (id: string, config: any) => {
    return api.put(`/devops/pipelines/${id}/config`, config);
  },

  getPipelineLogs: async (id: string, stageId?: string) => {
    return api.get(`/devops/pipelines/${id}/logs`, { params: { stageId } });
  },

  // Automated Testing
  getTestSuites: async () => {
    return api.get('/devops/tests/suites');
  },

  getTestSuite: async (id: string) => {
    return api.get(`/devops/tests/suites/${id}`);
  },

  runTestSuite: async (id: string) => {
    return api.post(`/devops/tests/suites/${id}/run`);
  },

  getTestResults: async (suiteId: string, runId?: string) => {
    return api.get(`/devops/tests/suites/${suiteId}/results`, { params: { runId } });
  },

  getCodeCoverage: async (params?: any) => {
    return api.get('/devops/tests/coverage', { params });
  },

  createTestSuite: async (data: any) => {
    return api.post('/devops/tests/suites', data);
  },

  updateTestSuite: async (id: string, data: any) => {
    return api.put(`/devops/tests/suites/${id}`, data);
  },

  deleteTestSuite: async (id: string) => {
    return api.delete(`/devops/tests/suites/${id}`);
  },

  // Performance Monitoring
  getPerformanceMetrics: async (filters?: any) => {
    return api.get('/devops/monitoring/performance', { params: filters });
  },

  getSystemMetrics: async () => {
    return api.get('/devops/monitoring/system');
  },

  getApplicationMetrics: async (appId?: string) => {
    return api.get('/devops/monitoring/applications', { params: { appId } });
  },

  createPerformanceAlert: async (data: any) => {
    return api.post('/devops/monitoring/alerts', data);
  },

  getPerformanceAlerts: async () => {
    return api.get('/devops/monitoring/alerts');
  },

  updatePerformanceAlert: async (id: string, data: any) => {
    return api.put(`/devops/monitoring/alerts/${id}`, data);
  },

  deletePerformanceAlert: async (id: string) => {
    return api.delete(`/devops/monitoring/alerts/${id}`);
  },

  // Error Tracking (Sentry Integration)
  getErrorEvents: async (filters?: any) => {
    return api.get('/devops/errors/events', { params: filters });
  },

  getErrorEvent: async (id: string) => {
    return api.get(`/devops/errors/events/${id}`);
  },

  resolveError: async (id: string) => {
    return api.post(`/devops/errors/events/${id}/resolve`);
  },

  ignoreError: async (id: string) => {
    return api.post(`/devops/errors/events/${id}/ignore`);
  },

  getErrorStats: async (params?: any) => {
    return api.get('/devops/errors/stats', { params });
  },

  createErrorAlert: async (data: any) => {
    return api.post('/devops/errors/alerts', data);
  },

  getErrorAlerts: async () => {
    return api.get('/devops/errors/alerts');
  },

  configureSentry: async (config: any) => {
    return api.put('/devops/errors/sentry/config', config);
  },

  // Log Aggregation (ELK Stack)
  getLogs: async (filters?: any) => {
    return api.get('/devops/logs', { params: filters });
  },

  searchLogs: async (query: string, filters?: any) => {
    return api.post('/devops/logs/search', { query, ...filters });
  },

  exportLogs: async (filters?: any) => {
    return api.get('/devops/logs/export', { 
      params: filters,
      responseType: 'blob'
    });
  },

  getLogSources: async () => {
    return api.get('/devops/logs/sources');
  },

  configureLogSource: async (source: string, config: any) => {
    return api.put(`/devops/logs/sources/${source}/config`, config);
  },

  getLogStats: async (params?: any) => {
    return api.get('/devops/logs/stats', { params });
  },

  createLogAlert: async (data: any) => {
    return api.post('/devops/logs/alerts', data);
  },

  getLogAlerts: async () => {
    return api.get('/devops/logs/alerts');
  },

  // Infrastructure Management
  getInfrastructureStatus: async () => {
    return api.get('/devops/infrastructure/status');
  },

  getServers: async () => {
    return api.get('/devops/infrastructure/servers');
  },

  getServer: async (id: string) => {
    return api.get(`/devops/infrastructure/servers/${id}`);
  },

  restartServer: async (id: string) => {
    return api.post(`/devops/infrastructure/servers/${id}/restart`);
  },

  scaleService: async (serviceId: string, replicas: number) => {
    return api.post(`/devops/infrastructure/services/${serviceId}/scale`, { replicas });
  },

  // Deployment Management
  getDeployments: async (filters?: any) => {
    return api.get('/devops/deployments', { params: filters });
  },

  createDeployment: async (data: any) => {
    return api.post('/devops/deployments', data);
  },

  rollbackDeployment: async (id: string) => {
    return api.post(`/devops/deployments/${id}/rollback`);
  },

  getDeploymentStatus: async (id: string) => {
    return api.get(`/devops/deployments/${id}/status`);
  },

  // Build Artifacts
  getBuildArtifacts: async (buildId: string) => {
    return api.get(`/devops/builds/${buildId}/artifacts`);
  },

  downloadArtifact: async (artifactId: string) => {
    return api.get(`/devops/artifacts/${artifactId}/download`, {
      responseType: 'blob'
    });
  },

  uploadArtifact: async (buildId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/devops/builds/${buildId}/artifacts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Environment Management
  getEnvironments: async () => {
    return api.get('/devops/environments');
  },

  getEnvironment: async (id: string) => {
    return api.get(`/devops/environments/${id}`);
  },

  createEnvironment: async (data: any) => {
    return api.post('/devops/environments', data);
  },

  updateEnvironment: async (id: string, data: any) => {
    return api.put(`/devops/environments/${id}`, data);
  },

  deleteEnvironment: async (id: string) => {
    return api.delete(`/devops/environments/${id}`);
  },

  // Secrets Management
  getSecrets: async (environmentId?: string) => {
    return api.get('/devops/secrets', { params: { environmentId } });
  },

  createSecret: async (data: any) => {
    return api.post('/devops/secrets', data);
  },

  updateSecret: async (id: string, data: any) => {
    return api.put(`/devops/secrets/${id}`, data);
  },

  deleteSecret: async (id: string) => {
    return api.delete(`/devops/secrets/${id}`);
  },

  // Backup Management
  getBackups: async () => {
    return api.get('/devops/backups');
  },

  createBackup: async (data: any) => {
    return api.post('/devops/backups', data);
  },

  restoreBackup: async (id: string) => {
    return api.post(`/devops/backups/${id}/restore`);
  },

  downloadBackup: async (id: string) => {
    return api.get(`/devops/backups/${id}/download`, {
      responseType: 'blob'
    });
  },

  deleteBackup: async (id: string) => {
    return api.delete(`/devops/backups/${id}`);
  },

  // Health Checks
  getHealthChecks: async () => {
    return api.get('/devops/health');
  },

  runHealthCheck: async (serviceId: string) => {
    return api.post(`/devops/health/${serviceId}/check`);
  },

  getHealthHistory: async (serviceId: string, params?: any) => {
    return api.get(`/devops/health/${serviceId}/history`, { params });
  },

  // Incident Management
  getIncidents: async (filters?: any) => {
    return api.get('/devops/incidents', { params: filters });
  },

  createIncident: async (data: any) => {
    return api.post('/devops/incidents', data);
  },

  updateIncident: async (id: string, data: any) => {
    return api.put(`/devops/incidents/${id}`, data);
  },

  resolveIncident: async (id: string) => {
    return api.post(`/devops/incidents/${id}/resolve`);
  },

  getIncidentTimeline: async (id: string) => {
    return api.get(`/devops/incidents/${id}/timeline`);
  },

  // Metrics and Analytics
  getDevOpsMetrics: async (params?: any) => {
    return api.get('/devops/metrics', { params });
  },

  getMTTR: async (params?: any) => {
    return api.get('/devops/metrics/mttr', { params });
  },

  getDeploymentFrequency: async (params?: any) => {
    return api.get('/devops/metrics/deployment-frequency', { params });
  },

  getChangeFailureRate: async (params?: any) => {
    return api.get('/devops/metrics/change-failure-rate', { params });
  },

  getLeadTime: async (params?: any) => {
    return api.get('/devops/metrics/lead-time', { params });
  },
};

export default devOpsService;
