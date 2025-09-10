import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { MonitoringService } from '../monitoring/monitoring.service';
import { ServiceDiscoveryService } from '../service-discovery/service-discovery.service';
import { User } from '../auth/interfaces/user.interface';

interface AuthenticatedSocket extends Socket {
  user?: User;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebSocketGatewayService.name);
  private redisAdapter: any;
  private connectedClients = new Map<string, AuthenticatedSocket>();
  private userConnections = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private subscriptions = new Map<string, Set<string>>(); // socketId -> Set of subscriptions

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private monitoringService: MonitoringService,
    private serviceDiscovery: ServiceDiscoveryService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');

    // Setup Redis adapter for horizontal scaling
    // this.setupRedisAdapter(server); // Temporarily disabled for initial startup

    // Setup authentication middleware
    // Temporarily disabled entire middleware block for initial startup
    /*
    server.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          throw new Error('No authentication token provided');
        }

        const payload = this.jwtService.verify(token);
        socket.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions,
          subscriptionTier: payload.subscriptionTier,
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.logger.debug(`Socket authenticated for user: ${socket.user.email}`);
        next();
      } catch (error) {
        this.logger.error(`Socket authentication failed: ${error.message}`);
        next(new Error('Authentication failed'));
      }
    });
    */
  }

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.user?.id;
    const clientId = client.id;

    this.logger.log(
      `Client connected: ${clientId} ${userId ? `(User: ${userId})` : '(Anonymous)'}`,
    );

    // Track connected clients
    this.connectedClients.set(clientId, client);

    if (userId) {
      // Track user connections
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(clientId);
    }

    // Initialize subscription tracking
    this.subscriptions.set(clientId, new Set());

    // Send welcome message
    client.emit('connected', {
      message: 'Connected to TREUM Trading Gateway',
      timestamp: new Date().toISOString(),
      clientId,
    });

    // Log connection for monitoring
    this.monitoringService.getLogger().info('WebSocket Connection', {
      clientId,
      userId,
      userAgent: client.handshake.headers['user-agent'],
      ip: client.handshake.address,
      type: 'websocket_connection',
    });
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.user?.id;
    const clientId = client.id;

    this.logger.log(`Client disconnected: ${clientId}`);

    // Clean up tracking
    this.connectedClients.delete(clientId);
    this.subscriptions.delete(clientId);

    if (userId) {
      const userSockets = this.userConnections.get(userId);
      if (userSockets) {
        userSockets.delete(clientId);
        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }

    // Log disconnection
    this.monitoringService.getLogger().info('WebSocket Disconnection', {
      clientId,
      userId,
      type: 'websocket_disconnection',
    });
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channels: string[] },
  ) {
    const clientId = client.id;

    this.logger.debug(
      `Client ${clientId} subscribing to channels: ${data.channels.join(', ')}`,
    );

    const clientSubscriptions = this.subscriptions.get(clientId)!;

    for (const channel of data.channels) {
      // Validate subscription permissions
      if (!this.canSubscribeToChannel(client.user!, channel)) {
        client.emit('subscription_error', {
          channel,
          error: 'Insufficient permissions to subscribe to this channel',
        });
        continue;
      }

      // Add to subscriptions
      clientSubscriptions.add(channel);

      // Join Socket.IO room
      client.join(channel);

      // Proxy subscription to trading service if needed
      if (channel.startsWith('trading.') || channel.startsWith('prices.')) {
        await this.proxySubscriptionToTradingService(channel, 'subscribe');
      }

      client.emit('subscribed', { channel });

      this.logger.debug(`Client ${clientId} subscribed to ${channel}`);
    }
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channels: string[] },
  ) {
    const clientId = client.id;

    this.logger.debug(
      `Client ${clientId} unsubscribing from channels: ${data.channels.join(', ')}`,
    );

    const clientSubscriptions = this.subscriptions.get(clientId)!;

    for (const channel of data.channels) {
      // Remove from subscriptions
      clientSubscriptions.delete(channel);

      // Leave Socket.IO room
      client.leave(channel);

      // Proxy unsubscription to trading service
      if (channel.startsWith('trading.') || channel.startsWith('prices.')) {
        await this.proxySubscriptionToTradingService(channel, 'unsubscribe');
      }

      client.emit('unsubscribed', { channel });

      this.logger.debug(`Client ${clientId} unsubscribed from ${channel}`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Broadcast methods
  broadcastToChannel(channel: string, event: string, data: any) {
    this.server.to(channel).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: any) {
    const userSockets = this.userConnections.get(userId);
    if (userSockets) {
      userSockets.forEach((socketId) => {
        const socket = this.connectedClients.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
      });
    }
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Private methods
  private async setupRedisAdapter(server: Server) {
    try {
      const redisUrl = this.configService.get<string>('redis.url');
      const pubClient = new Redis(redisUrl);
      const subClient = pubClient.duplicate();

      this.redisAdapter = createAdapter(pubClient, subClient);
      server.adapter(this.redisAdapter);

      this.logger.log('Redis adapter configured for WebSocket scaling');
    } catch (error) {
      this.logger.error('Failed to setup Redis adapter:', error.message);
    }
  }

  private canSubscribeToChannel(user: User, channel: string): boolean {
    // Define channel permission mapping
    const channelPermissions: { [key: string]: string[] } = {
      'prices.basic': [], // Public
      'prices.premium': ['premium_user', 'vip_user'],
      'prices.vip': ['vip_user'],
      'trading.executions': ['read:trading'],
      'trading.orders': ['read:trading'],
      'signals.basic': ['read:signals'],
      'signals.premium': ['read:premium_signals'],
      'signals.vip': ['read:vip_signals'],
      'user.notifications': ['read:profile'],
      'portfolio.updates': ['read:portfolio'],
    };

    const requiredPermissions = channelPermissions[channel];

    if (!requiredPermissions) {
      // Unknown channel, deny by default
      return false;
    }

    if (requiredPermissions.length === 0) {
      // Public channel
      return true;
    }

    // Check if user has required permissions or subscription tier
    return requiredPermissions.some((permission) => {
      if (
        user.subscriptionTier &&
        ['premium_user', 'vip_user'].includes(permission)
      ) {
        return user.subscriptionTier.includes(permission.split('_')[0]);
      }
      return user.permissions.includes(permission as any);
    });
  }

  private async proxySubscriptionToTradingService(
    channel: string,
    action: string,
  ) {
    try {
      const tradingService =
        this.serviceDiscovery.getServiceInstance('trading');
      if (!tradingService) {
        this.logger.error('Trading service not available for WebSocket proxy');
        return;
      }

      // In a real implementation, you would establish a WebSocket connection
      // to the trading service and proxy the subscription request
      this.logger.debug(
        `Proxying ${action} for channel ${channel} to trading service`,
      );

      // This is a placeholder - implement actual WebSocket proxy logic
      // based on your trading service WebSocket API
    } catch (error) {
      this.logger.error(
        `Failed to proxy subscription to trading service: ${error.message}`,
      );
    }
  }

  // Health check and statistics
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      authenticatedConnections: Array.from(
        this.connectedClients.values(),
      ).filter((socket) => socket.user).length,
      uniqueUsers: this.userConnections.size,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (total, subs) => total + subs.size,
        0,
      ),
    };
  }
}
