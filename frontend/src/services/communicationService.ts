import api from './api';

// In-App Messaging APIs
export const communicationService = {
  // Conversations
  getConversations: async (params?: any) => {
    return api.get('/communication/conversations', { params });
  },
  
  getConversation: async (id: string) => {
    return api.get(`/communication/conversations/${id}`);
  },
  
  createConversation: async (data: any) => {
    return api.post('/communication/conversations', data);
  },
  
  updateConversation: async (id: string, data: any) => {
    return api.put(`/communication/conversations/${id}`, data);
  },
  
  deleteConversation: async (id: string) => {
    return api.delete(`/communication/conversations/${id}`);
  },
  
  // Messages
  getMessages: async (conversationId: string, params?: any) => {
    return api.get(`/communication/conversations/${conversationId}/messages`, { params });
  },
  
  sendMessage: async (conversationId: string, data: any) => {
    return api.post(`/communication/conversations/${conversationId}/messages`, data);
  },
  
  editMessage: async (conversationId: string, messageId: string, data: any) => {
    return api.put(`/communication/conversations/${conversationId}/messages/${messageId}`, data);
  },
  
  deleteMessage: async (conversationId: string, messageId: string) => {
    return api.delete(`/communication/conversations/${conversationId}/messages/${messageId}`);
  },
  
  // Users
  getUsers: async (params?: any) => {
    return api.get('/communication/users', { params });
  },
  
  getUserPresence: async (userId: string) => {
    return api.get(`/communication/users/${userId}/presence`);
  },
  
  // File uploads
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/communication/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Email Integration APIs
  getEmailTemplates: async (params?: any) => {
    return api.get('/communication/email/templates', { params });
  },
  
  getEmailTemplate: async (id: string) => {
    return api.get(`/communication/email/templates/${id}`);
  },
  
  createEmailTemplate: async (data: any) => {
    return api.post('/communication/email/templates', data);
  },
  
  updateEmailTemplate: async (id: string, data: any) => {
    return api.put(`/communication/email/templates/${id}`, data);
  },
  
  deleteEmailTemplate: async (id: string) => {
    return api.delete(`/communication/email/templates/${id}`);
  },
  
  sendEmail: async (data: any) => {
    return api.post('/communication/email/send', data);
  },
  
  scheduleEmail: async (data: any) => {
    return api.post('/communication/email/schedule', data);
  },
  
  getEmailLogs: async (params?: any) => {
    return api.get('/communication/email/logs', { params });
  },
  
  getEmailStats: async () => {
    return api.get('/communication/email/stats');
  },
  
  // Notification System APIs
  getNotificationChannels: async () => {
    return api.get('/communication/notifications/channels');
  },
  
  updateChannelStatus: async (channelId: string, enabled: boolean) => {
    return api.put(`/communication/notifications/channels/${channelId}`, { enabled });
  },
  
  getNotificationTemplates: async (params?: any) => {
    return api.get('/communication/notifications/templates', { params });
  },
  
  createNotificationTemplate: async (data: any) => {
    return api.post('/communication/notifications/templates', data);
  },
  
  updateNotificationTemplate: async (id: string, data: any) => {
    return api.put(`/communication/notifications/templates/${id}`, data);
  },
  
  deleteNotificationTemplate: async (id: string) => {
    return api.delete(`/communication/notifications/templates/${id}`);
  },
  
  sendNotification: async (data: any) => {
    return api.post('/communication/notifications/send', data);
  },
  
  getRecipients: async (params?: any) => {
    return api.get('/communication/recipients', { params });
  },
  
  getRecipientGroups: async (params?: any) => {
    return api.get('/communication/recipients/groups', { params });
  },
  
  createRecipientGroup: async (data: any) => {
    return api.post('/communication/recipients/groups', data);
  },
  
  updateRecipientGroup: async (id: string, data: any) => {
    return api.put(`/communication/recipients/groups/${id}`, data);
  },
  
  deleteRecipientGroup: async (id: string) => {
    return api.delete(`/communication/recipients/groups/${id}`);
  },
  
  // Announcements
  getAnnouncements: async (params?: any) => {
    return api.get('/communication/announcements', { params });
  },
  
  getAnnouncement: async (id: string) => {
    return api.get(`/communication/announcements/${id}`);
  },
  
  createAnnouncement: async (data: any) => {
    return api.post('/communication/announcements', data);
  },
  
  updateAnnouncement: async (id: string, data: any) => {
    return api.put(`/communication/announcements/${id}`, data);
  },
  
  deleteAnnouncement: async (id: string) => {
    return api.delete(`/communication/announcements/${id}`);
  },
  
  archiveAnnouncement: async (id: string) => {
    return api.put(`/communication/announcements/${id}/archive`);
  },
  
  // Notification Logs
  getNotificationLogs: async (params?: any) => {
    return api.get('/communication/notifications/logs', { params });
  },
  
  getNotificationStats: async () => {
    return api.get('/communication/notifications/stats');
  },
  
  // SMS specific
  testSMS: async (data: any) => {
    return api.post('/communication/sms/test', data);
  },
  
  getSMSConfig: async () => {
    return api.get('/communication/sms/config');
  },
  
  updateSMSConfig: async (data: any) => {
    return api.put('/communication/sms/config', data);
  },
  
  // Push notifications specific
  testPushNotification: async (data: any) => {
    return api.post('/communication/push/test', data);
  },
  
  getPushConfig: async () => {
    return api.get('/communication/push/config');
  },
  
  updatePushConfig: async (data: any) => {
    return api.put('/communication/push/config', data);
  },
  
  getDeviceStats: async () => {
    return api.get('/communication/push/devices/stats');
  },
  
  // WebSocket events (for real-time features)
  subscribeToConversation: (conversationId: string) => {
    // This would be implemented with your WebSocket solution
    console.log('Subscribing to conversation:', conversationId);
  },
  
  unsubscribeFromConversation: (conversationId: string) => {
    // This would be implemented with your WebSocket solution
    console.log('Unsubscribing from conversation:', conversationId);
  },
  
  // Notification preferences
  getNotificationPreferences: async (userId: string) => {
    return api.get(`/communication/users/${userId}/preferences`);
  },
  
  updateNotificationPreferences: async (userId: string, data: any) => {
    return api.put(`/communication/users/${userId}/preferences`, data);
  },
};

export default communicationService;
