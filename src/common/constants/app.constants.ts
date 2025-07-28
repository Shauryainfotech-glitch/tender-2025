export const APP_CONSTANTS = {
  APP_NAME: 'AVGC Tender Management Platform',
  APP_VERSION: '1.0.0',
  API_PREFIX: 'api/v1',
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  
  // JWT Token Types
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
    EMAIL_VERIFICATION: 'email_verification',
  },
  
  // User Roles
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    TENDER_MANAGER: 'tender_manager',
    BIDDER: 'bidder',
    VIEWER: 'viewer',
  },
  
  // Tender Status
  TENDER_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ACTIVE: 'active',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
    AWARDED: 'awarded',
  },
  
  // Bid Status
  BID_STATUS: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    SHORTLISTED: 'shortlisted',
    REJECTED: 'rejected',
    AWARDED: 'awarded',
    WITHDRAWN: 'withdrawn',
  },
  
  // Document Types
  DOCUMENT_TYPES: {
    TENDER_DOCUMENT: 'tender_document',
    BID_DOCUMENT: 'bid_document',
    SUPPORTING_DOCUMENT: 'supporting_document',
    TECHNICAL_SPECIFICATION: 'technical_specification',
    FINANCIAL_DOCUMENT: 'financial_document',
    LEGAL_DOCUMENT: 'legal_document',
  },
  
  // Notification Types
  NOTIFICATION_TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    IN_APP: 'in_app',
    PUSH: 'push',
  },
  
  // File Size Limits (in bytes)
  FILE_SIZE_LIMITS: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
  },
  
  // Cache TTL (in seconds)
  CACHE_TTL: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },
};
