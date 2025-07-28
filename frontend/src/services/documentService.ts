import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/documents`;

export interface DocumentVersion {
  id: string;
  versionNumber: string;
  fileName: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
  comment?: string;
  status: 'current' | 'archived' | 'draft';
  downloadUrl: string;
  changes?: string;
  tags?: string[];
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  currentVersion: DocumentVersion;
  versions: DocumentVersion[];
  isLocked: boolean;
  lockedBy?: {
    id: string;
    name: string;
  };
  lockedAt?: Date;
  category: string;
  tags: string[];
  permissions: {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canLock: boolean;
  };
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  variables?: TemplateVariable[];
  tags: string[];
  isFavorite: boolean;
  isLocked: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  lastModified: Date;
  usage: number;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description?: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon?: string;
  count: number;
}

export interface BulkUploadFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  progress: number;
  error?: string;
  folderId?: string;
  tags?: string[];
}

export interface BulkDownloadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  downloadUrl: string;
  selected: boolean;
}

export interface UploadOptions {
  compressImages: boolean;
  maxImageSize: number;
  preserveFolderStructure: boolean;
  skipDuplicates: boolean;
  autoRename: boolean;
  defaultTags: string[];
}

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Version Control APIs
  async getDocumentVersions(documentId: string): Promise<{ data: Document }> {
    const response = await axios.get(`${API_URL}/${documentId}/versions`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async uploadNewVersion(documentId: string, formData: FormData): Promise<{ data: DocumentVersion }> {
    const response = await axios.post(
      `${API_URL}/${documentId}/versions`,
      formData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  async downloadVersion(documentId: string, versionId: string): Promise<Blob> {
    const response = await axios.get(
      `${API_URL}/${documentId}/versions/${versionId}/download`,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      }
    );
    return response.data;
  }

  async restoreVersion(documentId: string, versionId: string): Promise<{ data: Document }> {
    const response = await axios.post(
      `${API_URL}/${documentId}/versions/${versionId}/restore`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async deleteVersion(documentId: string, versionId: string): Promise<void> {
    await axios.delete(`${API_URL}/${documentId}/versions/${versionId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async updateVersionStatus(
    documentId: string,
    versionId: string,
    status: 'current' | 'archived' | 'draft'
  ): Promise<{ data: DocumentVersion }> {
    const response = await axios.patch(
      `${API_URL}/${documentId}/versions/${versionId}/status`,
      { status },
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async compareVersions(
    documentId: string,
    versionId1: string,
    versionId2: string
  ): Promise<{ data: { differences: any[] } }> {
    const response = await axios.get(
      `${API_URL}/${documentId}/versions/compare`,
      {
        params: { version1: versionId1, version2: versionId2 },
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async lockDocument(documentId: string): Promise<{ data: Document }> {
    const response = await axios.post(
      `${API_URL}/${documentId}/lock`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async unlockDocument(documentId: string): Promise<{ data: Document }> {
    const response = await axios.post(
      `${API_URL}/${documentId}/unlock`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  // Document Preview APIs
  async getDocumentPreviewUrl(documentId: string): Promise<{ data: { url: string; type: string } }> {
    const response = await axios.get(`${API_URL}/${documentId}/preview`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async generateThumbnail(documentId: string): Promise<{ data: { thumbnailUrl: string } }> {
    const response = await axios.post(
      `${API_URL}/${documentId}/thumbnail`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  // Bulk Operations APIs
  async initiateBulkUpload(files: File[], options: UploadOptions): Promise<{ data: { sessionId: string } }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append('options', JSON.stringify(options));

    const response = await axios.post(`${API_URL}/bulk/upload/init`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  async uploadFileChunk(
    sessionId: string,
    fileId: string,
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number
  ): Promise<{ data: { progress: number } }> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());

    const response = await axios.post(
      `${API_URL}/bulk/upload/${sessionId}/${fileId}/chunk`,
      formData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  async cancelBulkUpload(sessionId: string): Promise<void> {
    await axios.post(`${API_URL}/bulk/upload/${sessionId}/cancel`, {}, {
      headers: this.getAuthHeaders(),
    });
  }

  async getBulkDownloadItems(folderPath?: string): Promise<{ data: BulkDownloadItem[] }> {
    const response = await axios.get(`${API_URL}/bulk/download/items`, {
      params: { folderPath },
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async initiateBulkDownload(itemIds: string[]): Promise<{ data: { downloadUrl: string } }> {
    const response = await axios.post(
      `${API_URL}/bulk/download/init`,
      { itemIds },
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  // Template APIs
  async getTemplates(filters?: {
    category?: string;
    search?: string;
    favorites?: boolean;
  }): Promise<{ data: DocumentTemplate[] }> {
    const response = await axios.get(`${API_URL}/templates`, {
      params: filters,
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async getTemplateCategories(): Promise<{ data: TemplateCategory[] }> {
    const response = await axios.get(`${API_URL}/templates/categories`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async createTemplate(formData: FormData): Promise<{ data: DocumentTemplate }> {
    const response = await axios.post(`${API_URL}/templates`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  async updateTemplate(templateId: string, formData: FormData): Promise<{ data: DocumentTemplate }> {
    const response = await axios.put(`${API_URL}/templates/${templateId}`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await axios.delete(`${API_URL}/templates/${templateId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async toggleTemplateFavorite(templateId: string): Promise<{ data: { isFavorite: boolean } }> {
    const response = await axios.post(
      `${API_URL}/templates/${templateId}/favorite`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async toggleTemplateLock(templateId: string): Promise<{ data: { isLocked: boolean } }> {
    const response = await axios.post(
      `${API_URL}/templates/${templateId}/lock`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async duplicateTemplate(templateId: string): Promise<{ data: DocumentTemplate }> {
    const response = await axios.post(
      `${API_URL}/templates/${templateId}/duplicate`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async generateFromTemplate(
    templateId: string,
    variables: Record<string, any>
  ): Promise<{ data: Blob }> {
    const response = await axios.post(
      `${API_URL}/templates/${templateId}/generate`,
      { variables },
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      }
    );
    return response;
  }

  async getTemplateVariables(templateId: string): Promise<{ data: TemplateVariable[] }> {
    const response = await axios.get(`${API_URL}/templates/${templateId}/variables`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  // Search and Filter APIs
  async searchDocuments(query: string, filters?: {
    category?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    fileType?: string[];
  }): Promise<{ data: Document[] }> {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query, ...filters },
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async getDocumentCategories(): Promise<{ data: Array<{ id: string; name: string; count: number }> }> {
    const response = await axios.get(`${API_URL}/categories`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async getDocumentTags(): Promise<{ data: string[] }> {
    const response = await axios.get(`${API_URL}/tags`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  // Permission Management APIs
  async getDocumentPermissions(documentId: string): Promise<{ data: any }> {
    const response = await axios.get(`${API_URL}/${documentId}/permissions`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async updateDocumentPermissions(
    documentId: string,
    permissions: any
  ): Promise<{ data: any }> {
    const response = await axios.put(
      `${API_URL}/${documentId}/permissions`,
      permissions,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  // Audit Trail APIs
  async getDocumentAuditTrail(documentId: string): Promise<{ data: any[] }> {
    const response = await axios.get(`${API_URL}/${documentId}/audit`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  // Collaboration APIs
  async addComment(documentId: string, versionId: string, comment: string): Promise<{ data: any }> {
    const response = await axios.post(
      `${API_URL}/${documentId}/versions/${versionId}/comments`,
      { comment },
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async getComments(documentId: string, versionId: string): Promise<{ data: any[] }> {
    const response = await axios.get(
      `${API_URL}/${documentId}/versions/${versionId}/comments`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  // OCR APIs
  async performOCR(formData: FormData): Promise<{ 
    data: {
      text: string;
      confidence: number;
      pages: Array<{
        pageNumber: number;
        text: string;
        confidence: number;
        words: Array<{
          text: string;
          confidence: number;
          boundingBox: { x: number; y: number; width: number; height: number };
        }>;
        lines: Array<{
          text: string;
          confidence: number;
          words: any[];
          boundingBox: { x: number; y: number; width: number; height: number };
        }>;
        paragraphs: Array<{
          text: string;
          confidence: number;
          lines: any[];
          boundingBox: { x: number; y: number; width: number; height: number };
        }>;
        imageUrl: string;
        dimensions: { width: number; height: number };
      }>;
      processedUrl?: string;
    }
  }> {
    const response = await axios.post(`${API_URL}/ocr/process`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes for OCR processing
    });
    return response;
  }

  async exportOCRDocument(
    documentId: string,
    format: 'pdf' | 'docx' | 'json',
    text: string
  ): Promise<{ data: Blob }> {
    const response = await axios.post(
      `${API_URL}/ocr/export`,
      { documentId, format, text },
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      }
    );
    return response;
  }

  async getOCRLanguages(): Promise<{ data: Array<{ code: string; name: string; native: string }> }> {
    const response = await axios.get(`${API_URL}/ocr/languages`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async getOCRStatus(taskId: string): Promise<{ 
    data: {
      status: 'pending' | 'processing' | 'completed' | 'error';
      progress: number;
      result?: any;
      error?: string;
    }
  }> {
    const response = await axios.get(`${API_URL}/ocr/status/${taskId}`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }

  async enhanceImage(formData: FormData): Promise<{ data: { enhancedUrl: string } }> {
    const response = await axios.post(`${API_URL}/ocr/enhance`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  async detectDocumentLayout(documentId: string): Promise<{
    data: {
      tables: Array<{ boundingBox: any; cells: any[] }>;
      images: Array<{ boundingBox: any; caption?: string }>;
      headings: Array<{ text: string; level: number; boundingBox: any }>;
      paragraphs: Array<{ text: string; boundingBox: any }>;
    }
  }> {
    const response = await axios.post(
      `${API_URL}/ocr/detect-layout/${documentId}`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response;
  }

  async batchOCR(files: File[], settings: any): Promise<{ data: { batchId: string } }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append('settings', JSON.stringify(settings));

    const response = await axios.post(`${API_URL}/ocr/batch`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  async getBatchOCRStatus(batchId: string): Promise<{
    data: {
      status: 'processing' | 'completed' | 'error';
      progress: number;
      results: Array<{
        fileId: string;
        fileName: string;
        status: 'pending' | 'processing' | 'completed' | 'error';
        result?: any;
        error?: string;
      }>;
    }
  }> {
    const response = await axios.get(`${API_URL}/ocr/batch/${batchId}`, {
      headers: this.getAuthHeaders(),
    });
    return response;
  }
}

export const documentService = new DocumentService();
