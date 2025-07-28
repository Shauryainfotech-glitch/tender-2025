import { apiClient } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedEntity?: {
    type: string;
    id: string;
  };
  createdAt: Date;
  readAt?: Date;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  recipientId?: string;
  relatedEntity?: {
    type: string;
    id: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: {
    tenders: boolean;
    bids: boolean;
    contracts: boolean;
    payments: boolean;
    system: boolean;
  };
}

export const notificationService = {
  // Get all notifications
  async getAll(params?: any): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications', params);
    return response.data;
  },

  // Get notification by ID
  async getById(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  // Delete notification
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  // Delete all read notifications
  async deleteAllRead(): Promise<void> {
    await apiClient.delete('/notifications/read');
  },

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await apiClient.patch<NotificationPreferences>('/notifications/preferences', preferences);
    return response.data;
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  // Subscribe to push notifications
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    await apiClient.post('/notifications/push/subscribe', subscription);
  },

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<void> {
    await apiClient.post('/notifications/push/unsubscribe');
  },

  // Send notification (admin only)
  async send(data: CreateNotificationDto): Promise<Notification> {
    const response = await apiClient.post<Notification>('/notifications/send', data);
    return response.data;
  },

  // Broadcast notification (admin only)
  async broadcast(data: CreateNotificationDto): Promise<void> {
    await apiClient.post('/notifications/broadcast', data);
  },
};