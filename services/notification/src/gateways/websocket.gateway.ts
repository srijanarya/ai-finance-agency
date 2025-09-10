import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Notification } from '../entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger(WebSocketGateway.name);
  private clients: Map<string, string> = new Map(); // socketId -> userId

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.clients.get(client.id);
    if (userId) {
      this.clients.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('authenticate')
  handleAuthentication(
    @MessageBody() data: { token: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // In a real implementation, validate the JWT token here
      // For now, we'll extract userId from the token payload
      const payload = this.extractPayloadFromToken(data.token);
      
      if (payload?.userId) {
        this.clients.set(client.id, payload.userId);
        client.join(`user_${payload.userId}`);
        
        this.logger.log(`User authenticated: ${payload.userId} (Socket: ${client.id})`);
        
        client.emit('authenticated', {
          success: true,
          userId: payload.userId,
        });
      } else {
        client.emit('authentication_error', {
          success: false,
          message: 'Invalid token',
        });
      }
    } catch (error) {
      this.logger.error('Authentication error', error.stack);
      client.emit('authentication_error', {
        success: false,
        message: 'Authentication failed',
      });
    }
  }

  @SubscribeMessage('subscribe_to_notifications')
  handleSubscribeToNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const authenticatedUserId = this.clients.get(client.id);
    
    if (!authenticatedUserId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    if (authenticatedUserId !== data.userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    client.join(`user_${data.userId}`);
    client.emit('subscribed', { userId: data.userId });
    
    this.logger.log(`User ${data.userId} subscribed to notifications`);
  }

  @SubscribeMessage('unsubscribe_from_notifications')
  handleUnsubscribeFromNotifications(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`user_${data.userId}`);
    client.emit('unsubscribed', { userId: data.userId });
    
    this.logger.log(`User ${data.userId} unsubscribed from notifications`);
  }

  @SubscribeMessage('mark_as_read')
  handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.clients.get(client.id);
    
    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Emit to notification service to mark as read
    // In a real implementation, you would call the notification service here
    this.logger.log(`Notification ${data.notificationId} marked as read by user ${userId}`);
    
    client.emit('marked_as_read', { notificationId: data.notificationId });
  }

  // Event listeners for notification events

  @OnEvent('notification.created')
  handleNotificationCreated(notification: Notification) {
    this.logger.log(`Broadcasting new notification to user ${notification.userId}`);
    
    this.server.to(`user_${notification.userId}`).emit('new_notification', {
      id: notification.id,
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      payload: notification.payload,
      createdAt: notification.createdAt,
    });
  }

  @OnEvent('notification.inapp')
  handleInAppNotification(notification: Notification) {
    this.logger.log(`Broadcasting in-app notification to user ${notification.userId}`);
    
    this.server.to(`user_${notification.userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      payload: notification.payload,
      createdAt: notification.createdAt,
    });
  }

  @OnEvent('notification.updated')
  handleNotificationUpdated(notification: Notification) {
    this.logger.log(`Broadcasting notification update to user ${notification.userId}`);
    
    this.server.to(`user_${notification.userId}`).emit('notification_updated', {
      id: notification.id,
      status: notification.status,
      readAt: notification.readAt,
      clickedAt: notification.clickedAt,
      updatedAt: notification.updatedAt,
    });
  }

  // Utility methods

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  sendToAllUsers(event: string, data: any) {
    this.server.emit(event, data);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.clients.values());
  }

  getUserConnections(userId: string): number {
    return Array.from(this.clients.values()).filter(id => id === userId).length;
  }

  private extractPayloadFromToken(token: string): any {
    try {
      // Simple JWT payload extraction (without verification for demo)
      // In production, you should properly verify the JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return {
        userId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      this.logger.error('Failed to extract token payload', error.stack);
      return null;
    }
  }
}