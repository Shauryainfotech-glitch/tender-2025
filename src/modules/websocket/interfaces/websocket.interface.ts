export enum EventType {
  // Notification events
  NOTIFICATION = 'notification',
  
  // Tender events
  TENDER_UPDATE = 'tender:update',
  TENDER_CREATED = 'tender:created',
  TENDER_DELETED = 'tender:deleted',
  TENDER_PUBLISHED = 'tender:published',
  TENDER_CLOSED = 'tender:closed',
  
  // Bid events
  BID_UPDATE = 'bid:update',
  BID_SUBMITTED = 'bid:submitted',
  BID_WITHDRAWN = 'bid:withdrawn',
  BID_AWARDED = 'bid:awarded',
  BID_REJECTED = 'bid:rejected',
  
  // EMD events
  EMD_UPDATE = 'emd:update',
  EMD_SUBMITTED = 'emd:submitted',
  EMD_VERIFIED = 'emd:verified',
  EMD_REFUNDED = 'emd:refunded',
  EMD_FORFEITED = 'emd:forfeited',
  
  // System events
  ANNOUNCEMENT = 'system:announcement',
  MAINTENANCE = 'system:maintenance',
  
  // Analytics events
  ANALYTICS_UPDATE = 'analytics:update',
  
  // User events
  USER_ACTIVITY = 'user:activity',
  USER_STATUS_CHANGE = 'user:status',
}

export interface WebSocketEvent {
  type: EventType;
  data: any;
  timestamp: Date;
}

export interface NotificationPayload {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface TenderUpdatePayload {
  tenderId: number;
  updateType: 'created' | 'updated' | 'deleted' | 'published' | 'closed';
  tender?: any;
  changedFields?: string[];
  performedBy?: {
    userId: number;
    userName: string;
  };
}

export interface BidUpdatePayload {
  bidId: number;
  tenderId: number;
  updateType: 'submitted' | 'updated' | 'withdrawn' | 'awarded' | 'rejected';
  bid?: any;
  performedBy?: {
    userId: number;
    userName: string;
    organizationName?: string;
  };
}

export interface EMDUpdatePayload {
  emdId: number;
  tenderId?: number;
  bidId?: number;
  status: string;
  amount?: number;
  organizationId?: number;
  userId?: number;
  performedBy?: {
    userId: number;
    userName: string;
  };
}

export interface AnnouncementPayload {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  targetRoles?: string[];
  targetOrganizations?: number[];
}

export interface AnalyticsUpdatePayload {
  metric: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  period?: string;
  breakdown?: Record<string, any>;
}

export interface UserActivityPayload {
  userId: number;
  userName: string;
  action: string;
  resource: string;
  resourceId?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ConnectionInfo {
  socketId: string;
  userId: number;
  organizationId?: number;
  roles: string[];
  connectedAt: Date;
  lastActivity?: Date;
}

export interface RoomInfo {
  name: string;
  type: 'user' | 'organization' | 'role' | 'channel';
  members: string[];
  createdAt?: Date;
}
