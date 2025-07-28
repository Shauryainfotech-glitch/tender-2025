// Permission constants
export const PERMISSIONS = {
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Tender permissions
  TENDER_CREATE: 'tender:create',
  TENDER_READ: 'tender:read',
  TENDER_UPDATE: 'tender:update',
  TENDER_DELETE: 'tender:delete',
  TENDER_PUBLISH: 'tender:publish',
  TENDER_CLOSE: 'tender:close',
  
  // Bid permissions
  BID_CREATE: 'bid:create',
  BID_READ: 'bid:read',
  BID_UPDATE: 'bid:update',
  BID_DELETE: 'bid:delete',
  BID_SUBMIT: 'bid:submit',
  BID_WITHDRAW: 'bid:withdraw',
  
  // Organization permissions
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_READ: 'organization:read',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
  
  // Vendor permissions
  VENDOR_CREATE: 'vendor:create',
  VENDOR_READ: 'vendor:read',
  VENDOR_UPDATE: 'vendor:update',
  VENDOR_DELETE: 'vendor:delete',
  
  // Payment permissions
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_READ: 'payment:read',
  PAYMENT_UPDATE: 'payment:update',
  PAYMENT_DELETE: 'payment:delete',
  PAYMENT_PROCESS: 'payment:process',
  
  // Contract permissions
  CONTRACT_CREATE: 'contract:create',
  CONTRACT_READ: 'contract:read',
  CONTRACT_UPDATE: 'contract:update',
  CONTRACT_DELETE: 'contract:delete',
  CONTRACT_SIGN: 'contract:sign',
  
  // Workflow permissions
  WORKFLOW_CREATE: 'workflow:create',
  WORKFLOW_READ: 'workflow:read',
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_DELETE: 'workflow:delete',
  WORKFLOW_APPROVE: 'workflow:approve',
  WORKFLOW_REJECT: 'workflow:reject',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_USERS: 'admin:users',
  ADMIN_REPORTS: 'admin:reports',
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.TENDER_CREATE,
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.TENDER_UPDATE,
    PERMISSIONS.TENDER_PUBLISH,
    PERMISSIONS.TENDER_CLOSE,
    PERMISSIONS.BID_READ,
    PERMISSIONS.ORGANIZATION_CREATE,
    PERMISSIONS.ORGANIZATION_READ,
    PERMISSIONS.ORGANIZATION_UPDATE,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.VENDOR_UPDATE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.CONTRACT_CREATE,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.CONTRACT_UPDATE,
    PERMISSIONS.CONTRACT_SIGN,
    PERMISSIONS.WORKFLOW_CREATE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_UPDATE,
    PERMISSIONS.WORKFLOW_APPROVE,
    PERMISSIONS.WORKFLOW_REJECT,
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_REPORTS,
  ],
  PROCUREMENT_OFFICER: [
    PERMISSIONS.TENDER_CREATE,
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.TENDER_UPDATE,
    PERMISSIONS.TENDER_PUBLISH,
    PERMISSIONS.TENDER_CLOSE,
    PERMISSIONS.BID_READ,
    PERMISSIONS.VENDOR_READ,
    PERMISSIONS.VENDOR_UPDATE,
    PERMISSIONS.CONTRACT_CREATE,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.CONTRACT_UPDATE,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_APPROVE,
    PERMISSIONS.WORKFLOW_REJECT,
  ],
  VENDOR: [
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.BID_CREATE,
    PERMISSIONS.BID_READ,
    PERMISSIONS.BID_UPDATE,
    PERMISSIONS.BID_SUBMIT,
    PERMISSIONS.BID_WITHDRAW,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.PAYMENT_READ,
  ],
  FINANCE_OFFICER: [
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_UPDATE,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.WORKFLOW_APPROVE,
  ],
  AUDITOR: [
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.BID_READ,
    PERMISSIONS.CONTRACT_READ,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.WORKFLOW_READ,
    PERMISSIONS.ADMIN_REPORTS,
  ],
  USER: [
    PERMISSIONS.TENDER_READ,
    PERMISSIONS.BID_READ,
  ],
} as const;

// User interface for permissions
interface User {
  id: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: string
): boolean => {
  if (!user) return false;

  // Check direct permissions
  if (user.permissions?.includes(permission)) {
    return true;
  }

  // Check role-based permissions
  if (user.roles) {
    for (const role of user.roles) {
      const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
      if (rolePermissions?.includes(permission as any)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: string[]
): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: string[]
): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if a user has a specific role
 */
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles!.includes(role));
};

/**
 * Get all permissions for a user based on their roles
 */
export const getUserPermissions = (user: User | null): string[] => {
  if (!user) return [];

  const permissions = new Set<string>();

  // Add direct permissions
  if (user.permissions) {
    user.permissions.forEach(permission => permissions.add(permission));
  }

  // Add role-based permissions
  if (user.roles) {
    user.roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
      if (rolePermissions) {
        rolePermissions.forEach(permission => permissions.add(permission));
      }
    });
  }

  return Array.from(permissions);
};

/**
 * Check if a user is an admin (has admin or super admin role)
 */
export const isAdmin = (user: User | null): boolean => {
  return hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN']);
};

/**
 * Check if a user is a super admin
 */
export const isSuperAdmin = (user: User | null): boolean => {
  return hasRole(user, 'SUPER_ADMIN');
};

/**
 * Check if a user can access admin features
 */
export const canAccessAdmin = (user: User | null): boolean => {
  return hasPermission(user, PERMISSIONS.ADMIN_DASHBOARD);
};
