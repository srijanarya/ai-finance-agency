/**
 * Content Stream Gateway
 * 
 * Real-time WebSocket gateway for streaming processed content, market insights,
 * trends, and scoring updates to connected clients. Provides:
 * 
 * - Real-time content processing notifications
 * - Market insight streaming
 * - Trend detection alerts  
 * - Content scoring updates
 * - Subscription management with filtering
 * - Rate limiting and backpressure handling
 * - Authentication and authorization
 * 
 * Supports multiple subscription types with granular filtering options
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ContentStreamEvent,
  TrendDetectionResult,
  MarketInsightResult,
  ContentScoringResult,
  NLPProcessingResult
} from '../interfaces/nlp.interface';

interface ClientSubscription {
  socketId: string;
  userId?: string;
  subscriptions: Set<SubscriptionType>;
  filters: SubscriptionFilters;
  lastActivity: Date;
  rateLimitTokens: number;
  connectedAt: Date;
}

interface SubscriptionFilters {
  symbols?: string[];
  categories?: string[];
  minScore?: number;
  minConfidence?: number;
  alertLevels?: ('low' | 'medium' | 'high' | 'critical')[];
  contentTypes?: string[];
  sources?: string[];
}

enum SubscriptionType {
  CONTENT_PROCESSED = 'content_processed',
  MARKET_INSIGHTS = 'market_insights',
  TREND_ALERTS = 'trend_alerts',
  SCORE_UPDATES = 'score_updates',
  REAL_TIME_TRENDS = 'real_time_trends',
  BREAKING_NEWS = 'breaking_news',
  SYSTEM_STATUS = 'system_status'
}

interface StreamMessage {
  type: SubscriptionType;
  timestamp: Date;
  data: any;
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    source?: string;
    contentId?: string;
    symbols?: string[];
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/content-stream',
  transports: ['websocket'],
})
@Injectable()
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ContentStreamGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ContentStreamGateway.name);
  private readonly clients = new Map<string, ClientSubscription>();
  
  // Rate limiting configuration
  private readonly rateLimitConfig = {
    maxTokens: 100,
    refillRate: 10, // tokens per minute
    refillInterval: 60000, // 1 minute
  };

  // Connection limits
  private readonly maxConnections = 1000;
  private readonly connectionTimeout = 30000; // 30 seconds for inactive connections

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    // Start rate limit token refill timer
    setInterval(() => this.refillRateLimitTokens(), this.rateLimitConfig.refillInterval);
    
    // Start cleanup timer for inactive connections
    setInterval(() => this.cleanupInactiveConnections(), 60000); // Every minute
  }

  afterInit(server: Server): void {
    this.logger.log('Content Stream Gateway initialized');
    
    // Set up global rate limiting
    server.engine.generateId = () => {
      return Math.random().toString(36).substring(2, 15);
    };
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      // Check connection limits
      if (this.clients.size >= this.maxConnections) {
        this.logger.warn(`Connection rejected: Maximum connections exceeded (${this.maxConnections})`);
        client.emit('error', { message: 'Maximum connections exceeded' });
        client.disconnect();
        return;
      }

      // Extract user information from JWT token (handled by guard)
      const userId = client.handshake.auth?.userId;
      
      const subscription: ClientSubscription = {
        socketId: client.id,
        userId,
        subscriptions: new Set(),
        filters: {},
        lastActivity: new Date(),
        rateLimitTokens: this.rateLimitConfig.maxTokens,
        connectedAt: new Date()
      };

      this.clients.set(client.id, subscription);

      this.logger.log(`Client connected: ${client.id} ${userId ? `(User: ${userId})` : '(Anonymous)'}`);

      // Send welcome message with available subscriptions
      client.emit('connection_established', {
        socketId: client.id,
        availableSubscriptions: Object.values(SubscriptionType),
        rateLimits: {
          maxTokens: this.rateLimitConfig.maxTokens,
          refillRate: this.rateLimitConfig.refillRate
        }
      });

      // Emit connection event for analytics
      this.eventEmitter.emit('gateway.client_connected', {
        socketId: client.id,
        userId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Connection handling failed:', error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const subscription = this.clients.get(client.id);
    
    if (subscription) {
      this.clients.delete(client.id);
      
      this.logger.log(`Client disconnected: ${client.id} ${subscription.userId ? `(User: ${subscription.userId})` : '(Anonymous)'}`);

      // Emit disconnection event for analytics
      this.eventEmitter.emit('gateway.client_disconnected', {
        socketId: client.id,
        userId: subscription.userId,
        connectedDuration: Date.now() - subscription.connectedAt.getTime(),
        timestamp: new Date()
      });
    }
  }

  /**
   * Subscribe to specific content types
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @MessageBody() data: { 
      types: SubscriptionType[], 
      filters?: SubscriptionFilters 
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      if (!this.checkRateLimit(client.id)) {
        client.emit('rate_limited', { message: 'Rate limit exceeded' });
        return;
      }

      const subscription = this.clients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Invalid client session' });
        return;
      }

      // Validate subscription types
      const validTypes = data.types.filter(type => 
        Object.values(SubscriptionType).includes(type)
      );

      if (validTypes.length === 0) {
        client.emit('error', { message: 'No valid subscription types provided' });
        return;
      }

      // Update client subscriptions
      validTypes.forEach(type => subscription.subscriptions.add(type));
      
      // Update filters
      if (data.filters) {
        subscription.filters = { ...subscription.filters, ...data.filters };
      }

      subscription.lastActivity = new Date();

      client.emit('subscribed', {
        types: validTypes,
        filters: subscription.filters,
        activeSubscriptions: Array.from(subscription.subscriptions)
      });

      this.logger.debug(`Client ${client.id} subscribed to: ${validTypes.join(', ')}`);

    } catch (error) {
      this.logger.error('Subscribe handling failed:', error);
      client.emit('error', { message: 'Subscription failed' });
    }
  }

  /**
   * Unsubscribe from specific content types
   */
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @MessageBody() data: { types: SubscriptionType[] },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      if (!this.checkRateLimit(client.id)) {
        client.emit('rate_limited', { message: 'Rate limit exceeded' });
        return;
      }

      const subscription = this.clients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Invalid client session' });
        return;
      }

      // Remove subscriptions
      data.types.forEach(type => subscription.subscriptions.delete(type));
      subscription.lastActivity = new Date();

      client.emit('unsubscribed', {
        types: data.types,
        activeSubscriptions: Array.from(subscription.subscriptions)
      });

      this.logger.debug(`Client ${client.id} unsubscribed from: ${data.types.join(', ')}`);

    } catch (error) {
      this.logger.error('Unsubscribe handling failed:', error);
      client.emit('error', { message: 'Unsubscription failed' });
    }
  }

  /**
   * Update subscription filters
   */
  @SubscribeMessage('update_filters')
  async handleUpdateFilters(
    @MessageBody() filters: SubscriptionFilters,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      if (!this.checkRateLimit(client.id)) {
        client.emit('rate_limited', { message: 'Rate limit exceeded' });
        return;
      }

      const subscription = this.clients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Invalid client session' });
        return;
      }

      subscription.filters = { ...subscription.filters, ...filters };
      subscription.lastActivity = new Date();

      client.emit('filters_updated', { filters: subscription.filters });

      this.logger.debug(`Client ${client.id} updated filters`);

    } catch (error) {
      this.logger.error('Filter update handling failed:', error);
      client.emit('error', { message: 'Filter update failed' });
    }
  }

  /**
   * Get current subscription status
   */
  @SubscribeMessage('get_status')
  async handleGetStatus(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const subscription = this.clients.get(client.id);
      if (!subscription) {
        client.emit('error', { message: 'Invalid client session' });
        return;
      }

      client.emit('status', {
        socketId: client.id,
        userId: subscription.userId,
        subscriptions: Array.from(subscription.subscriptions),
        filters: subscription.filters,
        connectedAt: subscription.connectedAt,
        rateLimitTokens: subscription.rateLimitTokens,
        totalClients: this.clients.size
      });

    } catch (error) {
      this.logger.error('Status request handling failed:', error);
      client.emit('error', { message: 'Status request failed' });
    }
  }

  /**
   * Ping endpoint for connection keepalive
   */
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket): Promise<void> {
    const subscription = this.clients.get(client.id);
    if (subscription) {
      subscription.lastActivity = new Date();
    }
    client.emit('pong', { timestamp: new Date() });
  }

  // Event listeners for streaming content

  /**
   * Stream content processing events
   */
  @OnEvent('content.processed')
  async streamContentProcessed(data: {
    content: string;
    nlpResult: NLPProcessingResult;
    source: string;
    contentId: string;
  }): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.CONTENT_PROCESSED,
      timestamp: new Date(),
      data: {
        contentId: data.contentId,
        source: data.source,
        sentiment: data.nlpResult.sentiment,
        entities: data.nlpResult.entities?.entities.slice(0, 10), // Limit for performance
        keyPhrases: data.nlpResult.keyPhrases?.keyPhrases.slice(0, 5),
        language: data.nlpResult.language,
        processingTime: data.nlpResult.processingTimeMs
      },
      metadata: {
        priority: 'medium',
        source: data.source,
        contentId: data.contentId,
        symbols: data.nlpResult.entities?.entities
          .filter(e => e.type === 'STOCK_SYMBOL')
          .map(e => e.text) || []
      }
    };

    await this.broadcastToSubscribers(message);
  }

  /**
   * Stream market insights
   */
  @OnEvent('insights.extracted')
  async streamMarketInsights(data: {
    insights: MarketInsightResult;
    contentId: string;
    source: string;
  }): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.MARKET_INSIGHTS,
      timestamp: new Date(),
      data: {
        contentId: data.contentId,
        confidence: data.insights.confidence,
        tradingSignals: data.insights.tradingSignals.filter(s => s.confidence > 0.6),
        priceTargets: data.insights.priceTargets.filter(pt => pt.confidence > 0.6),
        riskFactors: data.insights.riskFactors.filter(r => r.probability > 0.5),
        opportunities: data.insights.opportunities.filter(o => o.confidence > 0.6)
      },
      metadata: {
        priority: data.insights.confidence > 0.8 ? 'high' : 'medium',
        source: data.source,
        contentId: data.contentId,
        symbols: [
          ...data.insights.tradingSignals.map(s => s.symbol),
          ...data.insights.priceTargets.map(pt => pt.symbol)
        ]
      }
    };

    await this.broadcastToSubscribers(message);
  }

  /**
   * Stream trend detection alerts
   */
  @OnEvent('trend.detected')
  async streamTrendAlerts(data: {
    symbol?: string;
    alertLevel: 'low' | 'medium' | 'high' | 'critical';
    trends: any[];
  }): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.TREND_ALERTS,
      timestamp: new Date(),
      data: {
        symbol: data.symbol,
        alertLevel: data.alertLevel,
        trends: data.trends,
        detectedAt: new Date()
      },
      metadata: {
        priority: data.alertLevel,
        symbols: data.symbol ? [data.symbol] : []
      }
    };

    await this.broadcastToSubscribers(message);
  }

  /**
   * Stream real-time trend updates
   */
  @OnEvent('trend.real-time-update')
  async streamRealTimeTrends(data: {
    trends: any[];
    timestamp: Date;
  }): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.REAL_TIME_TRENDS,
      timestamp: new Date(),
      data: data,
      metadata: {
        priority: 'high'
      }
    };

    await this.broadcastToSubscribers(message);
  }

  /**
   * Stream content scoring updates
   */
  @OnEvent('content.scored')
  async streamContentScore(data: {
    contentId: string;
    score: ContentScoringResult;
    source: string;
  }): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.SCORE_UPDATES,
      timestamp: new Date(),
      data: {
        contentId: data.contentId,
        overallScore: data.score.overallScore,
        recommendation: data.score.recommendation,
        breakdown: data.score.breakdown,
        reasons: data.score.reasons
      },
      metadata: {
        priority: data.score.overallScore > 80 ? 'high' : 'medium',
        source: data.source,
        contentId: data.contentId
      }
    };

    await this.broadcastToSubscribers(message);
  }

  /**
   * Stream breaking news alerts
   */
  @OnEvent('news.breaking')
  async streamBreakingNews(data: any): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.BREAKING_NEWS,
      timestamp: new Date(),
      data,
      metadata: {
        priority: 'critical'
      }
    };

    await this.broadcastToSubscribers(message);
  }

  /**
   * Stream system status updates
   */
  @OnEvent('system.status')
  async streamSystemStatus(data: any): Promise<void> {
    const message: StreamMessage = {
      type: SubscriptionType.SYSTEM_STATUS,
      timestamp: new Date(),
      data,
      metadata: {
        priority: 'low'
      }
    };

    await this.broadcastToSubscribers(message);
  }

  // Private helper methods

  private async broadcastToSubscribers(message: StreamMessage): Promise<void> {
    const subscribedClients = Array.from(this.clients.entries())
      .filter(([_, subscription]) => 
        subscription.subscriptions.has(message.type) &&
        this.passesFilters(message, subscription.filters)
      );

    if (subscribedClients.length === 0) {
      return;
    }

    // Implement backpressure for high-priority messages
    const chunks = message.metadata?.priority === 'critical' ? 
      [subscribedClients] : 
      this.chunkArray(subscribedClients, 50);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async ([socketId, subscription]) => {
          try {
            const socket = this.server.sockets.sockets.get(socketId);
            if (socket && socket.connected) {
              subscription.lastActivity = new Date();
              socket.emit('stream_update', message);
            } else {
              // Remove disconnected client
              this.clients.delete(socketId);
            }
          } catch (error) {
            this.logger.warn(`Failed to send message to client ${socketId}:`, error);
          }
        })
      );
    }

    this.logger.debug(`Broadcasted ${message.type} to ${subscribedClients.length} clients`);
  }

  private passesFilters(message: StreamMessage, filters: SubscriptionFilters): boolean {
    // Symbol filter
    if (filters.symbols && filters.symbols.length > 0) {
      const messageSymbols = message.metadata?.symbols || [];
      if (!filters.symbols.some(symbol => 
        messageSymbols.some(msgSymbol => 
          msgSymbol.toLowerCase().includes(symbol.toLowerCase())
        )
      )) {
        return false;
      }
    }

    // Score filter
    if (filters.minScore && message.data.overallScore && message.data.overallScore < filters.minScore) {
      return false;
    }

    // Confidence filter
    if (filters.minConfidence && message.data.confidence && message.data.confidence < filters.minConfidence) {
      return false;
    }

    // Alert level filter
    if (filters.alertLevels && filters.alertLevels.length > 0) {
      const messagePriority = message.metadata?.priority || 'low';
      if (!filters.alertLevels.includes(messagePriority as any)) {
        return false;
      }
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      const messageSource = message.metadata?.source;
      if (!messageSource || !filters.sources.includes(messageSource)) {
        return false;
      }
    }

    return true;
  }

  private checkRateLimit(socketId: string): boolean {
    const subscription = this.clients.get(socketId);
    if (!subscription) return false;

    if (subscription.rateLimitTokens <= 0) {
      return false;
    }

    subscription.rateLimitTokens--;
    return true;
  }

  private refillRateLimitTokens(): void {
    for (const subscription of this.clients.values()) {
      subscription.rateLimitTokens = Math.min(
        this.rateLimitConfig.maxTokens,
        subscription.rateLimitTokens + this.rateLimitConfig.refillRate
      );
    }
  }

  private cleanupInactiveConnections(): void {
    const cutoffTime = new Date(Date.now() - this.connectionTimeout);
    
    for (const [socketId, subscription] of this.clients.entries()) {
      if (subscription.lastActivity < cutoffTime) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('timeout', { message: 'Connection timed out due to inactivity' });
          socket.disconnect();
        }
        this.clients.delete(socketId);
        
        this.logger.debug(`Cleaned up inactive connection: ${socketId}`);
      }
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get gateway statistics
   */
  getStatistics() {
    const subscriptionCounts = new Map<SubscriptionType, number>();
    
    for (const subscription of this.clients.values()) {
      for (const type of subscription.subscriptions) {
        subscriptionCounts.set(type, (subscriptionCounts.get(type) || 0) + 1);
      }
    }

    return {
      totalConnections: this.clients.size,
      subscriptionCounts: Object.fromEntries(subscriptionCounts),
      averageSubscriptions: this.clients.size > 0 ? 
        Array.from(this.clients.values()).reduce((sum, sub) => sum + sub.subscriptions.size, 0) / this.clients.size : 0
    };
  }

  /**
   * Force disconnect a client (admin function)
   */
  async disconnectClient(socketId: string, reason = 'Administrative disconnect'): Promise<boolean> {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('forced_disconnect', { reason });
      socket.disconnect();
      this.clients.delete(socketId);
      return true;
    }
    return false;
  }

  /**
   * Broadcast admin message to all connected clients
   */
  async broadcastAdminMessage(message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<void> {
    const adminMessage: StreamMessage = {
      type: SubscriptionType.SYSTEM_STATUS,
      timestamp: new Date(),
      data: {
        type: 'admin_message',
        message,
        priority
      },
      metadata: { priority }
    };

    this.server.emit('admin_message', adminMessage);
  }
}