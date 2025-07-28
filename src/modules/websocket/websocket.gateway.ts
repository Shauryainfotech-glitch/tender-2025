import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketService } from './websocket.service';
import { UsersService } from '../users/users.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { EventType, WebSocketEvent } from './interfaces/websocket.interface';

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly webSocketService: WebSocketService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.webSocketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromClient(client);
      if (!token) {
        throw new WsException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new WsException('User not found');
      }

      // Store user info in socket
      client.data.userId = user.id;
      client.data.organizationId = user.organizationId;
      client.data.roles = user.roles;

      // Join user-specific room
      client.join(`user:${user.id}`);
      
      // Join organization room
      if (user.organizationId) {
        client.join(`org:${user.organizationId}`);
      }

      // Join role-based rooms
      user.roles.forEach(role => {
        client.join(`role:${role.name}`);
      });

      this.logger.log(`Client connected: ${client.id} (User: ${user.email})`);

      // Send connection success event
      client.emit('connected', {
        message: 'Successfully connected to WebSocket',
        userId: user.id,
      });

    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    if (!data.channels || !Array.isArray(data.channels)) {
      throw new WsException('Invalid channels');
    }

    // Subscribe to specific channels based on permissions
    data.channels.forEach(channel => {
      if (this.canSubscribeToChannel(client, channel)) {
        client.join(channel);
        this.logger.log(`Client ${client.id} subscribed to ${channel}`);
      }
    });

    return { event: 'subscribed', data: { channels: data.channels } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    if (!data.channels || !Array.isArray(data.channels)) {
      throw new WsException('Invalid channels');
    }

    data.channels.forEach(channel => {
      client.leave(channel);
      this.logger.log(`Client ${client.id} unsubscribed from ${channel}`);
    });

    return { event: 'unsubscribed', data: { channels: data.channels } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  // Emit events to specific rooms/users
  emitToUser(userId: number, event: WebSocketEvent) {
    this.server.to(`user:${userId}`).emit(event.type, event.data);
  }

  emitToOrganization(organizationId: number, event: WebSocketEvent) {
    this.server.to(`org:${organizationId}`).emit(event.type, event.data);
  }

  emitToRole(roleName: string, event: WebSocketEvent) {
    this.server.to(`role:${roleName}`).emit(event.type, event.data);
  }

  emitToChannel(channel: string, event: WebSocketEvent) {
    this.server.to(channel).emit(event.type, event.data);
  }

  broadcast(event: WebSocketEvent) {
    this.server.emit(event.type, event.data);
  }

  private extractTokenFromClient(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Also check query params for token
    const token = client.handshake.query.token as string;
    return token || null;
  }

  private canSubscribeToChannel(client: Socket, channel: string): boolean {
    // Implement channel subscription authorization logic
    const channelParts = channel.split(':');
    const channelType = channelParts[0];

    switch (channelType) {
      case 'tender':
        // Check if user has permission to view tenders
        return true;
      case 'bid':
        // Check if user can view bids
        return true;
      case 'notification':
        // Users can subscribe to their own notifications
        return channel === `notification:${client.data.userId}`;
      case 'admin':
        // Only admin users can subscribe to admin channels
        return client.data.roles.some(role => role.name === 'ADMIN');
      default:
        return false;
    }
  }
}
