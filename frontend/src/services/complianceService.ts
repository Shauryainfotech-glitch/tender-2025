import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ComplianceChecklist {
  id: string;
  name: string;
  category: string;
  items: ChecklistItem[];
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  dueDate: Date;
  completionRate: number;
  lastUpdated: Date;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  evidence?: string[];
  comments?: string;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high';
}

interface ComplianceRegulation {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  requirements: string[];
  applicableTo: string[];
  effectiveDate: Date;
  status: 'active' | 'draft' | 'expired';
  documents: string[];
  lastReviewed: Date;
}

interface RetentionPolicy {
  id: string;
  documentType: string;
  category: string;
  retentionPeriod: number;
  retentionUnit: 'days' | 'months' | 'years';
  description: string;
  legalBasis: string;
  autoDelete: boolean;
  archiveAfter?: number;
  notifications: {
    beforeExpiry: number;
    notifyRoles: string[];
  };
  status: 'active' | 'inactive';
}

interface AuditFilter {
  user?: string;
  action?: string;
  entity?: string;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  severity?: string;
}

interface ComplianceStats {
  totalChecklists: number;
  completedChecklists: number;
  pendingChecklists: number;
  overallComplianceRate: number;
  regulationCount: number;
  activeRegulations: number;
  policyCount: number;
  documentsUnderRetention: number;
  upcomingExpirations: number;
  recentAuditLogs: number;
}

interface ComplianceReport {
  reportType: 'checklist' | 'audit' | 'regulation' | 'retention';
  format: 'pdf' | 'excel' | 'csv';
  filters: Record<string, any>;
  includeDetails: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const complianceService = {
  // Compliance Checklists
  async getChecklists(): Promise<ComplianceChecklist[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/checklists`);
    return response.data;
  },

  async getChecklistById(id: string): Promise<ComplianceChecklist> {
    const response = await axios.get(`${API_BASE_URL}/compliance/checklists/${id}`);
    return response.data;
  },

  async createChecklist(data: Partial<ComplianceChecklist>): Promise<ComplianceChecklist> {
    const response = await axios.post(`${API_BASE_URL}/compliance/checklists`, data);
    return response.data;
  },

  async updateChecklist(id: string, data: Partial<ComplianceChecklist>): Promise<ComplianceChecklist> {
    const response = await axios.put(`${API_BASE_URL}/compliance/checklists/${id}`, data);
    return response.data;
  },

  async deleteChecklist(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/compliance/checklists/${id}`);
  },

  async toggleChecklistItem(checklistId: string, itemId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/compliance/checklists/${checklistId}/items/${itemId}/toggle`);
  },

  async addChecklistEvidence(checklistId: string, itemId: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach(file => formData.append('evidence', file));
    await axios.post(
      `${API_BASE_URL}/compliance/checklists/${checklistId}/items/${itemId}/evidence`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  async assignChecklist(checklistId: string, assigneeId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/compliance/checklists/${checklistId}/assign`, { assigneeId });
  },

  async getChecklistTemplates(): Promise<ComplianceChecklist[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/checklists/templates`);
    return response.data;
  },

  async createFromTemplate(templateId: string, data: Partial<ComplianceChecklist>): Promise<ComplianceChecklist> {
    const response = await axios.post(`${API_BASE_URL}/compliance/checklists/from-template/${templateId}`, data);
    return response.data;
  },

  // Audit Trail
  async getAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/audit-logs`, { params: filter });
    return response.data;
  },

  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await axios.get(`${API_BASE_URL}/compliance/audit-logs/${id}`);
    return response.data;
  },

  async exportAuditLogs(filter: AuditFilter): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/compliance/audit-logs/export`, filter, {
      responseType: 'blob'
    });
    return response.data;
  },

  async getAuditLogStats(period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/compliance/audit-logs/stats`, { params: { period } });
    return response.data;
  },

  async configureAuditSettings(settings: any): Promise<void> {
    await axios.put(`${API_BASE_URL}/compliance/audit-logs/settings`, settings);
  },

  // Regulatory Compliance
  async getRegulations(): Promise<ComplianceRegulation[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/regulations`);
    return response.data;
  },

  async getRegulationById(id: string): Promise<ComplianceRegulation> {
    const response = await axios.get(`${API_BASE_URL}/compliance/regulations/${id}`);
    return response.data;
  },

  async createRegulation(data: Partial<ComplianceRegulation>): Promise<ComplianceRegulation> {
    const response = await axios.post(`${API_BASE_URL}/compliance/regulations`, data);
    return response.data;
  },

  async updateRegulation(id: string, data: Partial<ComplianceRegulation>): Promise<ComplianceRegulation> {
    const response = await axios.put(`${API_BASE_URL}/compliance/regulations/${id}`, data);
    return response.data;
  },

  async deleteRegulation(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/compliance/regulations/${id}`);
  },

  async checkRegulationCompliance(regulationId: string, entityId: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/compliance/regulations/${regulationId}/check`, { entityId });
    return response.data;
  },

  async getRegulationUpdates(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/regulations/updates`);
    return response.data;
  },

  async subscribeToRegulationUpdates(categories: string[]): Promise<void> {
    await axios.post(`${API_BASE_URL}/compliance/regulations/subscribe`, { categories });
  },

  // Document Retention
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/retention-policies`);
    return response.data;
  },

  async getRetentionPolicyById(id: string): Promise<RetentionPolicy> {
    const response = await axios.get(`${API_BASE_URL}/compliance/retention-policies/${id}`);
    return response.data;
  },

  async createRetentionPolicy(data: Partial<RetentionPolicy>): Promise<RetentionPolicy> {
    const response = await axios.post(`${API_BASE_URL}/compliance/retention-policies`, data);
    return response.data;
  },

  async updateRetentionPolicy(id: string, data: Partial<RetentionPolicy>): Promise<RetentionPolicy> {
    const response = await axios.put(`${API_BASE_URL}/compliance/retention-policies/${id}`, data);
    return response.data;
  },

  async deleteRetentionPolicy(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/compliance/retention-policies/${id}`);
  },

  async applyRetentionPolicy(policyId: string, documentIds: string[]): Promise<void> {
    await axios.post(`${API_BASE_URL}/compliance/retention-policies/${policyId}/apply`, { documentIds });
  },

  async getExpiringDocuments(days: number = 30): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/retention-policies/expiring`, { params: { days } });
    return response.data;
  },

  async processRetentionActions(): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/compliance/retention-policies/process`);
    return response.data;
  },

  async getRetentionHistory(documentId: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/retention-policies/history/${documentId}`);
    return response.data;
  },

  // Compliance Statistics and Reports
  async getComplianceStats(): Promise<ComplianceStats> {
    const response = await axios.get(`${API_BASE_URL}/compliance/stats`);
    return response.data;
  },

  async generateComplianceReport(report: ComplianceReport): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/compliance/reports/generate`, report, {
      responseType: 'blob'
    });
    return response.data;
  },

  async getComplianceDashboard(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/compliance/dashboard`);
    return response.data;
  },

  async getComplianceAlerts(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/alerts`);
    return response.data;
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/compliance/alerts/${alertId}/acknowledge`);
  },

  // Compliance Workflows
  async getComplianceWorkflows(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/workflows`);
    return response.data;
  },

  async createWorkflow(workflow: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/compliance/workflows`, workflow);
    return response.data;
  },

  async triggerWorkflow(workflowId: string, data: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/compliance/workflows/${workflowId}/trigger`, data);
    return response.data;
  },

  // Evidence Management
  async uploadEvidence(entityType: string, entityId: string, files: File[]): Promise<any[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('evidence', file));
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    
    const response = await axios.post(
      `${API_BASE_URL}/compliance/evidence/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getEvidence(entityType: string, entityId: string): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/evidence/${entityType}/${entityId}`);
    return response.data;
  },

  async deleteEvidence(evidenceId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/compliance/evidence/${evidenceId}`);
  },

  // Compliance Training
  async getTrainingModules(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/compliance/training`);
    return response.data;
  },

  async assignTraining(moduleId: string, userIds: string[]): Promise<void> {
    await axios.post(`${API_BASE_URL}/compliance/training/${moduleId}/assign`, { userIds });
  },

  async completeTraining(moduleId: string, score: number): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/compliance/training/${moduleId}/complete`, { score });
    return response.data;
  },

  async getTrainingReport(userId?: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/compliance/training/report`, { params: { userId } });
    return response.data;
  }
};

export default complianceService;
