// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    PROFILE: '/api/auth/profile',
  },

  // MFA
  MFA: {
    METHODS: '/api/auth/mfa/methods',
    TOTP_SETUP: '/api/auth/mfa/totp/setup',
    TOTP_VERIFY: '/api/auth/mfa/totp/verify',
    TOTP_ENABLE: '/api/auth/mfa/totp/enable',
    SMS_SETUP: '/api/auth/mfa/sms/setup',
    SMS_VERIFY: '/api/auth/mfa/sms/verify',
    SMS_ENABLE: '/api/auth/mfa/sms/enable',
    EMAIL_SETUP: '/api/auth/mfa/email/setup',
    EMAIL_VERIFY: '/api/auth/mfa/email/verify',
    EMAIL_ENABLE: '/api/auth/mfa/email/enable',
    BACKUP_CODES: '/api/auth/mfa/backup-codes/generate',
  },

  // SSO
  SSO: {
    PROVIDERS: '/api/auth/sso/providers',
    METADATA: '/api/auth/sso/metadata',
    LOGIN: '/api/auth/sso/login',
    CALLBACK: '/api/auth/sso/callback',
  },

  // Sessions
  SESSIONS: {
    LIST: '/api/auth/sessions',
    DETAILS: '/api/auth/sessions/:id',
    TERMINATE: '/api/auth/sessions/:id',
    TERMINATE_USER: '/api/auth/sessions/user/:userId',
  },

  // Documents
  DOCUMENTS: {
    LIST: '/api/documents',
    DETAILS: '/api/documents/:id',
    UPLOAD: '/api/documents/upload',
    DOWNLOAD: '/api/documents/:id/download',
    DELETE: '/api/documents/:id',
    VERSIONS: '/api/documents/:id/versions',
    PREVIEW: '/api/documents/:id/preview',
    LOCK: '/api/documents/:id/lock',
    UNLOCK: '/api/documents/:id/unlock',
    SEARCH: '/api/documents/search',
    CATEGORIES: '/api/documents/categories',
    TAGS: '/api/documents/tags',
  },

  // Templates
  TEMPLATES: {
    LIST: '/api/documents/templates',
    DETAILS: '/api/documents/templates/:id',
    CREATE: '/api/documents/templates',
    UPDATE: '/api/documents/templates/:id',
    DELETE: '/api/documents/templates/:id',
    DUPLICATE: '/api/documents/templates/:id/duplicate',
    GENERATE: '/api/documents/templates/:id/generate',
    CATEGORIES: '/api/documents/templates/categories',
  },

  // Bulk Operations
  BULK: {
    UPLOAD_INIT: '/api/documents/bulk/upload/init',
    UPLOAD_CHUNK: '/api/documents/bulk/upload/:sessionId/:fileId/chunk',
    UPLOAD_CANCEL: '/api/documents/bulk/upload/:sessionId/cancel',
    DOWNLOAD_ITEMS: '/api/documents/bulk/download/items',
    DOWNLOAD_INIT: '/api/documents/bulk/download/init',
  },

  // Policies
  POLICIES: {
    PASSWORD: '/api/auth/password-policy',
    LOCKOUT: '/api/auth/lockout-policy',
  },

  // Audit
  AUDIT: {
    AUTH: '/api/auth/audit',
    DOCUMENTS: '/api/documents/audit',
  },

  // Users
  USERS: {
    LIST: '/api/users',
    DETAILS: '/api/users/:id',
    CREATE: '/api/users',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
    BLOCK: '/api/users/:id/block',
    UNBLOCK: '/api/users/:id/unblock',
    PERMISSIONS: '/api/users/:id/permissions',
  },

  // Tenders (for future implementation)
  TENDERS: {
    LIST: '/api/tenders',
    DETAILS: '/api/tenders/:id',
    CREATE: '/api/tenders',
    UPDATE: '/api/tenders/:id',
    DELETE: '/api/tenders/:id',
    SUBMIT_BID: '/api/tenders/:id/bids',
    BIDS: '/api/tenders/:id/bids',
    DOCUMENTS: '/api/tenders/:id/documents',
    TIMELINE: '/api/tenders/:id/timeline',
    NOTIFICATIONS: '/api/tenders/:id/notifications',
  },

  // Vendors (for future implementation)
  VENDORS: {
    LIST: '/api/vendors',
    DETAILS: '/api/vendors/:id',
    REGISTER: '/api/vendors/register',
    UPDATE: '/api/vendors/:id',
    VERIFY: '/api/vendors/:id/verify',
    DOCUMENTS: '/api/vendors/:id/documents',
    RATINGS: '/api/vendors/:id/ratings',
    BLACKLIST: '/api/vendors/:id/blacklist',
  },

  // Reports (for future implementation)
  REPORTS: {
    DASHBOARD: '/api/reports/dashboard',
    TENDER_ANALYTICS: '/api/reports/tenders/analytics',
    VENDOR_ANALYTICS: '/api/reports/vendors/analytics',
    DOCUMENT_ANALYTICS: '/api/reports/documents/analytics',
    EXPORT: '/api/reports/export',
  },

  // Notifications (for future implementation)
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read',
    MARK_ALL_READ: '/api/notifications/read-all',
    PREFERENCES: '/api/notifications/preferences',
  },
};

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
  ],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Session configuration
export const SESSION_CONFIG = {
  TIMEOUT_WARNING: 5 * 60 * 1000, // 5 minutes before timeout
  REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutes
};

// MFA configuration
export const MFA_CONFIG = {
  CODE_LENGTH: 6,
  SMS_RESEND_COOLDOWN: 60, // seconds
  EMAIL_RESEND_COOLDOWN: 60, // seconds
  MAX_ATTEMPTS: 5,
};

// Export helper function to build URLs
export const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = endpoint;
  
  // Replace path parameters
  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
  }
  
  return `${API_BASE_URL}${url}`;
};
