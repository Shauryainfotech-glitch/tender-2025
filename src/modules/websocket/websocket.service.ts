import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { EventType, WebSocketEvent, NotificationPayload } from './interfaces/websocket.interface';

@Injectable()
export class WebSocketService {
  private server: Server;
  private readonly logger = new Logger(WebSocketService.name);

  setServer(server: Server) {
    this.server = server;
  }

  // Send notification to specific user
  sendNotificationToUser(userId: number, notification: NotificationPayload) {
    const event: WebSocketEvent = {
      type: EventType.NOTIFICATION,
      data: notification,
      timestamp: new Date(),
    };

    this.server.to(`user:${userId}`).emit(event.type, event.data);
    this.logger.log(`Notification sent to user ${userId}: ${notification.title}`);
  }

  // Send notification to all users in an organization
  sendNotificationToOrganization(organizationId: number, notification: NotificationPayload) {
    const event: WebSocketEvent = {
      type: EventType.NOTIFICATION,
      data: notification,
      timestamp: new Date(),
    };

    this.server.to(`org:${organizationId}`).emit(event.type, event.data);
    this.logger.log(`Notification sent to organization ${organizationId}: ${notification.title}`);
  }

  // Send tender update events
  sendTenderUpdate(tenderId: number, updateType: 'created' | 'updated' | 'deleted', data: any) {
    const event: WebSocketEvent = {
      type: EventType.TENDER_UPDATE,
      data: {
        tenderId,
        updateType,
        ...data,
      },
      timestamp: new Date(),
    };

    // Send to tender-specific channel
    this.server.to(`tender:${tenderId}`).emit(event.type, event.data);
    
    // Also broadcast to all tender subscribers
    this.server.to('tender:all').emit(event.type, event.data);
    
    this.logger.log(`Tender update sent: ${updateType} for tender ${tenderId}`);
  }

  // Send bid update events
  sendBidUpdate(bidId: number, tenderId: number, updateType: 'submitted' | 'updated' | 'withdrawn', data: any) {
    const event: WebSocketEvent = {
      type: EventType.BID_UPDATE,
      data: {
        bidId,
        tenderId,
        updateType,
        ...data,
      },
      timestamp: new Date(),
    };

    // Send to bid-specific channel
    this.server.to(`bid:${bidId}`).emit(event.type, event.data);
    
    // Send to tender channel for tender owner
    this.server.to(`tender:${tenderId}:bids`).emit(event.type, event.data);
    
    this.logger.log(`Bid update sent: ${updateType} for bid ${bidId}`);
  }

  // Send EMD status update
  sendEMDUpdate(emdId: number, status: string, data: any) {
    const event: WebSocketEvent = {
      type: EventType.EMD_UPDATE,
      data: {
        emdId,
        status,
        ...data,
      },
      timestamp: new Date(),
    };

    // Send to relevant channels
    if (data.organizationId) {
      this.server.to(`org:${data.organizationId}`).emit(event.type, event.data);
    }
    
    if (data.userId) {
      this.server.to(`user:${data.userId}`).emit(event.type, event.data);
    }
    
    this.logger.log(`EMD update sent: ${status} for EMD ${emdId}`);
  }

  // Send system-wide announcements
  broadcastAnnouncement(announcement: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
  }) {
    const event: WebSocketEvent = {
      type: EventType.ANNOUNCEMENT,
      data: announcement,
      timestamp: new Date(),
    };

    this.server.emit(event.type, event.data);
    this.logger.log(`Announcement broadcast: ${announcement.title}`);
  }

  // Send real-time analytics updates
  sendAnalyticsUpdate(channel: string, data: any) {
    const event: WebSocketEvent = {
      type: EventType.ANALYTICS_UPDATE,
      data,
      timestamp: new Date(),
    };

    this.server.to(`analytics:${channel}`).emit(event.type, event.data);
    this.logger.log(`Analytics update sent to channel: ${channel}`);
  }

  // Send user activity updates (for admin dashboard)
  sendUserActivityUpdate(activity: {
    userId: number;
    action: string;
    resource: string;
    timestamp: Date;
  }) {
    const event: WebSocketEvent = {
      type: EventType.USER_ACTIVITY,
      data: activity,
      timestamp: new Date(),
    };

    // Send to admin channel
    this.server.to('role:ADMIN').emit(event.type, event.data);
    this.logger.log(`User activity update sent: ${activity.action} by user ${activity.userId}`);
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    if (!this.server) return 0;
    return this.server.sockets.sockets.size;
  }

  // Get clients in a specific room
  getClientsInRoom(room: string): string[] {
    if (!this.server) return [];
    const clients = this.server.sockets.adapter.rooms.get(room);
    return clients ? Array.from(clients) : [];
  }

  // Disconnect a specific client
  disconnectClient(socketId: string, reason: string = 'Forced disconnect') {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('force-disconnect', { reason });
      socket.disconnect(true);
      this.logger.log(`Client ${socketId} disconnected: ${reason}`);
    }
  }
}
