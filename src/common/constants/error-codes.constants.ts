export const ERROR_CODES = {
  // Authentication Errors (1000-1099)
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_1001',
    message: 'Invalid email or password',
  },
  AUTH_USER_NOT_FOUND: {
    code: 'AUTH_1002',
    message: 'User not found',
  },
  AUTH_USER_INACTIVE: {
    code: 'AUTH_1003',
    message: 'User account is inactive',
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_1004',
    message: 'Invalid or expired token',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_1005',
    message: 'Token has expired',
  },
  AUTH_UNAUTHORIZED: {
    code: 'AUTH_1006',
    message: 'Unauthorized access',
  },
  AUTH_FORBIDDEN: {
    code: 'AUTH_1007',
    message: 'Access forbidden',
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    code: 'AUTH_1008',
    message: 'Email not verified',
  },
  
  // User Errors (1100-1199)
  USER_ALREADY_EXISTS: {
    code: 'USER_1101',
    message: 'User with this email already exists',
  },
  USER_NOT_FOUND: {
    code: 'USER_1102',
    message: 'User not found',
  },
  USER_UPDATE_FAILED: {
    code: 'USER_1103',
    message: 'Failed to update user',
  },
  USER_DELETE_FAILED: {
    code: 'USER_1104',
    message: 'Failed to delete user',
  },
  USER_INVALID_PASSWORD: {
    code: 'USER_1105',
    message: 'Password does not meet requirements',
  },
  
  // Tender Errors (1200-1299)
  TENDER_NOT_FOUND: {
    code: 'TENDER_1201',
    message: 'Tender not found',
  },
  TENDER_ALREADY_EXISTS: {
    code: 'TENDER_1202',
    message: 'Tender with this reference already exists',
  },
  TENDER_INVALID_STATUS: {
    code: 'TENDER_1203',
    message: 'Invalid tender status',
  },
  TENDER_EXPIRED: {
    code: 'TENDER_1204',
    message: 'Tender has expired',
  },
  TENDER_NOT_ACTIVE: {
    code: 'TENDER_1205',
    message: 'Tender is not active',
  },
  
  // Bid Errors (1300-1399)
  BID_NOT_FOUND: {
    code: 'BID_1301',
    message: 'Bid not found',
  },
  BID_ALREADY_SUBMITTED: {
    code: 'BID_1302',
    message: 'Bid already submitted for this tender',
  },
  BID_SUBMISSION_CLOSED: {
    code: 'BID_1303',
    message: 'Bid submission period has closed',
  },
  BID_INVALID_AMOUNT: {
    code: 'BID_1304',
    message: 'Invalid bid amount',
  },
  BID_CANNOT_MODIFY: {
    code: 'BID_1305',
    message: 'Cannot modify submitted bid',
  },
  
  // Organization Errors (1400-1499)
  ORG_NOT_FOUND: {
    code: 'ORG_1401',
    message: 'Organization not found',
  },
  ORG_ALREADY_EXISTS: {
    code: 'ORG_1402',
    message: 'Organization already exists',
  },
  ORG_NOT_VERIFIED: {
    code: 'ORG_1403',
    message: 'Organization not verified',
  },
  
  // File Errors (1500-1599)
  FILE_NOT_FOUND: {
    code: 'FILE_1501',
    message: 'File not found',
  },
  FILE_UPLOAD_FAILED: {
    code: 'FILE_1502',
    message: 'File upload failed',
  },
  FILE_SIZE_EXCEEDED: {
    code: 'FILE_1503',
    message: 'File size exceeds limit',
  },
  FILE_TYPE_NOT_ALLOWED: {
    code: 'FILE_1504',
    message: 'File type not allowed',
  },
  
  // Validation Errors (1600-1699)
  VALIDATION_FAILED: {
    code: 'VAL_1601',
    message: 'Validation failed',
  },
  INVALID_INPUT: {
    code: 'VAL_1602',
    message: 'Invalid input data',
  },
  MISSING_REQUIRED_FIELD: {
    code: 'VAL_1603',
    message: 'Missing required field',
  },
  
  // System Errors (1900-1999)
  INTERNAL_SERVER_ERROR: {
    code: 'SYS_1901',
    message: 'Internal server error',
  },
  DATABASE_ERROR: {
    code: 'SYS_1902',
    message: 'Database operation failed',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SYS_1903',
    message: 'Service temporarily unavailable',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'SYS_1904',
    message: 'Rate limit exceeded',
  },
};
