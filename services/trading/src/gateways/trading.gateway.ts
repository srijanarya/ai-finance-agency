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
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../guards/ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
  subscriptions?: Set<string>;
}

interface SubscriptionRequest {
  type: 'market-data' | 'orders' | 'positions' | 'trades';
  symbols?: string[];
  channels?: string[];
}

@WebSocketGateway(3001, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: '/trading',
})
export class TradingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TradingGateway.name);
  private readonly clients = new Map<string, AuthenticatedSocket>();
  private readonly subscriptions = new Map<string, Set<string>>(); // channel -> client IDs

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('Trading WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;
      client.tenantId = payload.tenantId;
      client.subscriptions = new Set();

      this.clients.set(client.id, client);
      
      this.logger.log(`Client ${client.id} connected (user: ${client.userId}, tenant: ${client.tenantId})`);
      
      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to trading gateway',
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    // Clean up subscriptions
    if (client.subscriptions) {
      for (const channel of client.subscriptions) {
        const subscribers = this.subscriptions.get(channel);
        if (subscribers) {
          subscribers.delete(client.id);
          if (subscribers.size === 0) {
            this.subscriptions.delete(channel);
          }
        }
      }
    }

    this.clients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe')
  @UseGuards(WsJwtGuard)
  handleSubscription(
    @MessageBody() data: SubscriptionRequest,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { type, symbols = [], channels = [] } = data;

      if (!client.userId || !client.tenantId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      let subscriptionChannels: string[] = [];

      switch (type) {
        case 'market-data':
          subscriptionChannels = symbols.map(symbol => `market-data:${symbol.toUpperCase()}`);
          break;
        case 'orders':
          subscriptionChannels = [`orders:${client.tenantId}:${client.userId}`];
          break;
        case 'positions':
          subscriptionChannels = [`positions:${client.tenantId}:${client.userId}`];
          break;
        case 'trades':
          subscriptionChannels = [`trades:${client.tenantId}:${client.userId}`];
          break;
        default:
          subscriptionChannels = channels;
      }

      // Add subscriptions
      for (const channel of subscriptionChannels) {
        if (!this.subscriptions.has(channel)) {
          this.subscriptions.set(channel, new Set());
        }
        this.subscriptions.get(channel)!.add(client.id);
        client.subscriptions!.add(channel);
      }

      this.logger.log(`Client ${client.id} subscribed to: ${subscriptionChannels.join(', ')}`);
      
      client.emit('subscribed', {
        type,
        channels: subscriptionChannels,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Subscription failed for client ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Subscription failed' });
    }
  }

  @SubscribeMessage('unsubscribe')
  @UseGuards(WsJwtGuard)
  handleUnsubscription(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { channels } = data;

      for (const channel of channels) {
        const subscribers = this.subscriptions.get(channel);
        if (subscribers) {
          subscribers.delete(client.id);
          if (subscribers.size === 0) {
            this.subscriptions.delete(channel);
          }
        }
        client.subscriptions?.delete(channel);
      }

      this.logger.log(`Client ${client.id} unsubscribed from: ${channels.join(', ')}`);
      
      client.emit('unsubscribed', {
        channels,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error(`Unsubscription failed for client ${client.id}: ${error.message}`);
      client.emit('error', { message: 'Unsubscription failed' });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Event listeners for real-time updates
  @OnEvent('market-data.updated')
  handleMarketDataUpdate(marketData: any) {
    const channel = `market-data:${marketData.symbol}`;
    this.broadcastToChannel(channel, 'market-data-update', {
      symbol: marketData.symbol,
      dataType: marketData.dataType,
      bidPrice: marketData.bidPrice,
      askPrice: marketData.askPrice,
      lastPrice: marketData.lastPrice,
      volume: marketData.volume,
      change: marketData.change,
      changePercent: marketData.changePercent,
      timestamp: marketData.timestamp,
    });
  }

  @OnEvent('order.created')
  handleOrderCreated(order: any) {
    const channel = `orders:${order.tenantId}:${order.userId}`;
    this.broadcastToChannel(channel, 'order-created', {
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
    });
  }

  @OnEvent('order.updated')
  handleOrderUpdated(order: any) {
    const channel = `orders:${order.tenantId}:${order.userId}`;
    this.broadcastToChannel(channel, 'order-updated', {
      id: order.id,
      status: order.status,
      executedQuantity: order.executedQuantity,
      remainingQuantity: order.remainingQuantity,
      averagePrice: order.averagePrice,
      updatedAt: order.updatedAt,
    });
  }

  @OnEvent('order.filled')
  handleOrderFilled(data: any) {
    const { order, trade } = data;
    const orderChannel = `orders:${order.tenantId}:${order.userId}`;
    const tradeChannel = `trades:${order.tenantId}:${order.userId}`;

    // Broadcast order update
    this.broadcastToChannel(orderChannel, 'order-filled', {
      orderId: order.id,
      symbol: order.symbol,
      executedQuantity: order.executedQuantity,
      remainingQuantity: order.remainingQuantity,
      averagePrice: order.averagePrice,
      status: order.status,
      fillCount: order.fillCount,
    });

    // Broadcast trade notification
    this.broadcastToChannel(tradeChannel, 'trade-executed', {
      id: trade.id,
      orderId: trade.orderId,
      symbol: trade.symbol,
      type: trade.type,
      quantity: trade.quantity,
      price: trade.price,
      grossValue: trade.grossValue,
      executedAt: trade.executedAt,
    });
  }

  @OnEvent('order.cancelled')
  handleOrderCancelled(order: any) {
    const channel = `orders:${order.tenantId}:${order.userId}`;
    this.broadcastToChannel(channel, 'order-cancelled', {
      id: order.id,
      symbol: order.symbol,
      status: order.status,
      cancelledAt: order.cancelledAt,
      executedQuantity: order.executedQuantity,
    });
  }

  @OnEvent('position.updated')
  handlePositionUpdated(position: any) {
    const channel = `positions:${position.tenantId}:${position.userId}`;
    this.broadcastToChannel(channel, 'position-updated', {
      id: position.id,
      symbol: position.symbol,
      quantity: position.quantity,
      averageCost: position.averageCost,
      currentPrice: position.currentPrice,
      marketValue: position.marketValue,
      unrealizedPnl: position.unrealizedPnl,
      dayPnl: position.dayPnl,
      totalPnl: position.totalPnl,
      lastUpdated: position.lastUpdated,
    });
  }

  @OnEvent('position.price-updated')
  handlePositionPriceUpdate(data: any) {
    const { position, oldPrice, newPrice } = data;
    const channel = `positions:${position.tenantId}:${position.userId}`;
    
    this.broadcastToChannel(channel, 'position-price-update', {
      symbol: position.symbol,
      oldPrice,
      newPrice,
      marketValue: position.marketValue,
      unrealizedPnl: position.unrealizedPnl,
      dayPnl: position.dayPnl,
      changePercent: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : 0,
      timestamp: new Date().toISOString(),
    });
  }

  @OnEvent('position.trade-added')
  handlePositionTradeAdded(data: any) {
    const { position, trade } = data;
    const channel = `positions:${position.tenantId}:${position.userId}`;
    
    this.broadcastToChannel(channel, 'position-trade-added', {
      positionId: position.id,
      symbol: position.symbol,
      trade: {
        quantity: trade.quantity,
        price: trade.price,
        isBuy: trade.isBuy,
        tradeDate: trade.tradeDate,
      },
      newQuantity: position.quantity,
      newAverageCost: position.averageCost,
      newMarketValue: position.marketValue,
    });
  }

  private broadcastToChannel(channel: string, event: string, data: any) {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers || subscribers.size === 0) {
      return;
    }

    const payload = {
      ...data,
      channel,
      event,
      timestamp: new Date().toISOString(),
    };

    let sentCount = 0;
    const disconnectedClients: string[] = [];

    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client && client.connected) {
        client.emit(event, payload);
        sentCount++;
      } else {
        disconnectedClients.push(clientId);
      }
    }

    // Clean up disconnected clients
    for (const clientId of disconnectedClients) {
      subscribers.delete(clientId);
    }

    if (sentCount > 0) {
      this.logger.debug(`Broadcasted '${event}' to ${sentCount} clients on channel '${channel}'`);
    }
  }

  // Public methods for external use
  public broadcastMarketData(symbol: string, data: any) {
    this.broadcastToChannel(`market-data:${symbol}`, 'market-data-update', data);
  }

  public broadcastToUser(tenantId: string, userId: string, event: string, data: any) {
    // Find all clients for this user
    for (const [clientId, client] of this.clients) {
      if (client.tenantId === tenantId && client.userId === userId) {
        client.emit(event, {
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  public getConnectionStats(): {
    totalConnections: number;
    totalSubscriptions: number;
    channelStats: Record<string, number>;
  } {
    const channelStats: Record<string, number> = {};
    for (const [channel, subscribers] of this.subscriptions) {
      channelStats[channel] = subscribers.size;
    }

    return {
      totalConnections: this.clients.size,
      totalSubscriptions: this.subscriptions.size,
      channelStats,
    };
  }
}