import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'events',
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, AuthenticatedSocket> = new Map();

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract user info from JWT token if available
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (token) {
      // TODO: Validate JWT and extract user info
      // For now, just store the client
      this.connectedClients.set(client.id, client);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(data.room);
    client.emit('joinedRoom', { room: data.room });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(data.room);
    client.emit('leftRoom', { room: data.room });
  }

  // Notification events
  sendNotificationToUser(userId: string, notification: any) {
    const userSockets = Array.from(this.connectedClients.values()).filter(
      (socket) => socket.userId === userId,
    );

    userSockets.forEach((socket) => {
      socket.emit('notification', notification);
    });
  }

  // Tender events
  broadcastTenderUpdate(tenderId: string, update: any) {
    this.server.to(`tender:${tenderId}`).emit('tenderUpdate', update);
  }

  broadcastNewTender(tender: any) {
    this.server.emit('newTender', tender);
  }

  // Bid events
  notifyBidSubmission(tenderId: string, bid: any) {
    this.server.to(`tender:${tenderId}`).emit('newBid', bid);
  }

  notifyBidStatusChange(bidId: string, status: any) {
    this.server.to(`bid:${bidId}`).emit('bidStatusChange', status);
  }

  // Workflow events
  notifyWorkflowStep(workflowId: string, step: any) {
    this.server.to(`workflow:${workflowId}`).emit('workflowStep', step);
  }

  // Contract events
  notifyContractUpdate(contractId: string, update: any) {
    this.server.to(`contract:${contractId}`).emit('contractUpdate', update);
  }

  // Payment events
  notifyPaymentStatus(paymentId: string, status: any) {
    this.server.to(`payment:${paymentId}`).emit('paymentStatus', status);
  }

  // Organization-wide broadcasts
  broadcastToOrganization(organizationId: string, event: string, data: any) {
    this.server.to(`org:${organizationId}`).emit(event, data);
  }

  // System-wide announcements
  broadcastAnnouncement(announcement: any) {
    this.server.emit('announcement', announcement);
  }

  // Chat/messaging support
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() message: { room: string; content: string; type: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const messageData = {
      ...message,
      userId: client.userId,
      timestamp: new Date(),
    };

    // Broadcast to room
    this.server.to(message.room).emit('message', messageData);
  }

  // Real-time collaboration
  @SubscribeMessage('documentUpdate')
  handleDocumentUpdate(
    @MessageBody() data: { documentId: string; changes: any },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.broadcast
      .to(`document:${data.documentId}`)
      .emit('documentChanged', {
        userId: client.userId,
        changes: data.changes,
        timestamp: new Date(),
      });
  }

  // Status updates
  @SubscribeMessage('userStatus')
  handleUserStatus(
    @MessageBody() status: { status: string; activity?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (client.userId) {
      this.server.emit('userStatusUpdate', {
        userId: client.userId,
        ...status,
        timestamp: new Date(),
      });
    }
  }
}