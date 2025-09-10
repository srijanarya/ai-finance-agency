import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";

import { MarketDataService } from "../services/market-data.service";
import { WatchlistService } from "../services/watchlist.service";
import { RateLimiterService } from "../services/rate-limiter.service";
import { DataAggregationService } from "../services/data-aggregation.service";
import { MarketData } from "../entities/market-data.entity";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  subscribedSymbols?: Set<string>;
}

@WebSocketGateway({
  namespace: "/market-data",
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  },
})
export class MarketDataGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MarketDataGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();
  private symbolSubscriptions = new Map<string, Set<string>>(); // symbol -> set of socket IDs

  constructor(
    private marketDataService: MarketDataService,
    private watchlistService: WatchlistService,
    private rateLimiterService: RateLimiterService,
    private dataAggregationService: DataAggregationService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (token) {
        try {
          const payload = this.jwtService.verify(token);
          client.userId = payload.sub;
          this.logger.log(`Client connected with user ID: ${client.userId}`);
        } catch {
          this.logger.warn(
            "Invalid token provided during WebSocket connection",
          );
        }
      }

      client.subscribedSymbols = new Set();
      this.connectedClients.set(client.id, client);

      // Send connection confirmation
      client.emit("connected", {
        message: "Connected to Market Data WebSocket",
        timestamp: new Date().toISOString(),
        authenticated: !!client.userId,
      });

      this.logger.log(
        `Client connected: ${client.id} (Total: ${this.connectedClients.size})`,
      );
    } catch (error) {
      this.logger.error("Error handling client connection:", error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      // Unsubscribe from all symbols
      if (client.subscribedSymbols) {
        for (const symbol of client.subscribedSymbols) {
          this.unsubscribeFromSymbol(client.id, symbol);
        }
      }

      this.connectedClients.delete(client.id);

      this.logger.log(
        `Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`,
      );
    } catch (error) {
      this.logger.error("Error handling client disconnection:", error);
    }
  }

  @SubscribeMessage("subscribe")
  async handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { symbols: string[] },
  ) {
    try {
      // Check rate limit
      const rateLimitResult = await this.rateLimiterService.checkWebSocketLimit(
        client.id,
        "subscribe",
      );
      if (!rateLimitResult.allowed) {
        client.emit("rate_limit_exceeded", {
          message: "Subscribe rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        });
        return;
      }

      const { symbols } = data;

      if (!Array.isArray(symbols) || symbols.length === 0) {
        client.emit("error", { message: "Invalid symbols array" });
        return;
      }

      // Limit subscription to 50 symbols per client
      if (symbols.length > 50) {
        client.emit("error", {
          message: "Too many symbols. Maximum 50 allowed.",
        });
        return;
      }

      const subscribedSymbols: string[] = [];

      for (const symbol of symbols) {
        const normalizedSymbol = symbol.toUpperCase();

        if (!client.subscribedSymbols.has(normalizedSymbol)) {
          this.subscribeToSymbol(client.id, normalizedSymbol);
          client.subscribedSymbols.add(normalizedSymbol);
          subscribedSymbols.push(normalizedSymbol);
        }
      }

      // Send current market data for subscribed symbols
      const currentData =
        await this.marketDataService.getMultipleRealtimeData(subscribedSymbols);

      client.emit("subscription_confirmed", {
        symbols: subscribedSymbols,
        count: subscribedSymbols.length,
        data: currentData,
      });

      this.logger.log(
        `Client ${client.id} subscribed to ${subscribedSymbols.length} symbols`,
      );
    } catch (error) {
      this.logger.error("Error handling subscribe:", error);
      client.emit("error", { message: "Subscription failed" });
    }
  }

  @SubscribeMessage("unsubscribe")
  async handleUnsubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { symbols: string[] },
  ) {
    try {
      // Check rate limit
      const rateLimitResult = await this.rateLimiterService.checkWebSocketLimit(
        client.id,
        "unsubscribe",
      );
      if (!rateLimitResult.allowed) {
        client.emit("rate_limit_exceeded", {
          message: "Unsubscribe rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        });
        return;
      }

      const { symbols } = data;

      if (!Array.isArray(symbols)) {
        client.emit("error", { message: "Invalid symbols array" });
        return;
      }

      const unsubscribedSymbols: string[] = [];

      for (const symbol of symbols) {
        const normalizedSymbol = symbol.toUpperCase();

        if (client.subscribedSymbols.has(normalizedSymbol)) {
          this.unsubscribeFromSymbol(client.id, normalizedSymbol);
          client.subscribedSymbols.delete(normalizedSymbol);
          unsubscribedSymbols.push(normalizedSymbol);
        }
      }

      client.emit("unsubscription_confirmed", {
        symbols: unsubscribedSymbols,
        count: unsubscribedSymbols.length,
      });

      this.logger.log(
        `Client ${client.id} unsubscribed from ${unsubscribedSymbols.length} symbols`,
      );
    } catch (error) {
      this.logger.error("Error handling unsubscribe:", error);
      client.emit("error", { message: "Unsubscription failed" });
    }
  }

  @SubscribeMessage("subscribe_watchlist")
  async handleSubscribeWatchlist(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit("error", {
          message: "Authentication required for watchlist subscription",
        });
        return;
      }

      // Get user's watchlist symbols
      const watchlistSymbols =
        await this.watchlistService.getUserWatchlistSymbols(client.userId);

      if (watchlistSymbols.length === 0) {
        client.emit("watchlist_subscription_confirmed", {
          message: "No symbols in watchlist",
          symbols: [],
          count: 0,
        });
        return;
      }

      // Subscribe to all watchlist symbols
      const subscribedSymbols: string[] = [];

      for (const symbol of watchlistSymbols) {
        if (!client.subscribedSymbols.has(symbol)) {
          this.subscribeToSymbol(client.id, symbol);
          client.subscribedSymbols.add(symbol);
          subscribedSymbols.push(symbol);
        }
      }

      // Send current market data for watchlist symbols
      const currentData =
        await this.marketDataService.getMultipleRealtimeData(subscribedSymbols);

      client.emit("watchlist_subscription_confirmed", {
        symbols: subscribedSymbols,
        count: subscribedSymbols.length,
        data: currentData,
      });

      this.logger.log(
        `Client ${client.id} subscribed to watchlist (${subscribedSymbols.length} symbols)`,
      );
    } catch (error) {
      this.logger.error("Error handling watchlist subscription:", error);
      client.emit("error", { message: "Watchlist subscription failed" });
    }
  }

  @SubscribeMessage("get_market_data")
  async handleGetMarketData(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { symbol: string },
  ) {
    try {
      // Check rate limit
      const rateLimitResult = await this.rateLimiterService.checkWebSocketLimit(
        client.id,
        "get_market_data",
      );
      if (!rateLimitResult.allowed) {
        client.emit("rate_limit_exceeded", {
          message: "Get market data rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        });
        return;
      }

      const { symbol } = data;

      if (!symbol) {
        client.emit("error", { message: "Symbol is required" });
        return;
      }

      const marketData = await this.marketDataService.getRealtimeData(
        symbol.toUpperCase(),
      );

      client.emit("market_data_response", {
        symbol: symbol.toUpperCase(),
        data: marketData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error("Error handling get market data:", error);
      client.emit("error", { message: "Failed to get market data" });
    }
  }

  @SubscribeMessage("ping")
  async handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      // Check rate limit
      const rateLimitResult = await this.rateLimiterService.checkWebSocketLimit(
        client.id,
        "ping",
      );
      if (!rateLimitResult.allowed) {
        client.emit("rate_limit_exceeded", {
          message: "Ping rate limit exceeded",
          retryAfter: rateLimitResult.retryAfter,
          resetTime: rateLimitResult.resetTime,
        });
        return;
      }

      client.emit("pong", { timestamp: new Date().toISOString() });
    } catch (error) {
      this.logger.error("Error handling ping:", error);
    }
  }

  @OnEvent("market.data.updated")
  handleMarketDataUpdate(payload: { symbol: string; data: MarketData }) {
    try {
      const { symbol, data } = payload;

      // Get all clients subscribed to this symbol
      const subscribedClients = this.symbolSubscriptions.get(symbol);

      if (subscribedClients && subscribedClients.size > 0) {
        const updatePayload = {
          symbol,
          data: {
            price: data.price,
            bid: data.bid,
            ask: data.ask,
            volume: data.volume,
            change: data.change,
            changePercent: data.changePercent,
            dayHigh: data.dayHigh,
            dayLow: data.dayLow,
            timestamp: data.timestamp,
            isMarketOpen: data.isMarketOpen,
            marketSession: data.marketSession,
          },
          timestamp: new Date().toISOString(),
        };

        // Emit to all subscribed clients
        for (const clientId of subscribedClients) {
          const client = this.connectedClients.get(clientId);
          if (client) {
            client.emit("market_data_update", updatePayload);
          }
        }

        this.logger.debug(
          `Broadcasted market data update for ${symbol} to ${subscribedClients.size} clients`,
        );
      }
    } catch (error) {
      this.logger.error("Error broadcasting market data update:", error);
    }
  }

  @OnEvent("alert.triggered")
  handleAlertTriggered(payload: { alert: any; marketData: MarketData }) {
    try {
      const { alert, marketData } = payload;

      // Find client by user ID
      const client = Array.from(this.connectedClients.values()).find(
        (c) => c.userId === alert.userId,
      );

      if (client) {
        client.emit("alert_triggered", {
          alert: {
            id: alert.id,
            symbol: alert.symbol,
            title: alert.title,
            alertType: alert.alertType,
            triggeredPrice: alert.triggeredPrice,
            priority: alert.priority,
          },
          marketData: {
            symbol: marketData.symbol,
            price: marketData.price,
            change: marketData.change,
            changePercent: marketData.changePercent,
          },
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`Sent alert notification to user ${alert.userId}`);
      }
    } catch (error) {
      this.logger.error("Error handling alert triggered:", error);
    }
  }

  private subscribeToSymbol(clientId: string, symbol: string) {
    if (!this.symbolSubscriptions.has(symbol)) {
      this.symbolSubscriptions.set(symbol, new Set());
    }

    this.symbolSubscriptions.get(symbol).add(clientId);
  }

  private unsubscribeFromSymbol(clientId: string, symbol: string) {
    const subscribers = this.symbolSubscriptions.get(symbol);
    if (subscribers) {
      subscribers.delete(clientId);

      // Clean up empty subscriptions
      if (subscribers.size === 0) {
        this.symbolSubscriptions.delete(symbol);
      }
    }
  }

  // Admin methods for broadcasting system messages
  broadcastSystemMessage(
    message: string,
    type: "info" | "warning" | "error" = "info",
  ) {
    this.server.emit("system_message", {
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastMarketStatus(status: {
    isOpen: boolean;
    session: string;
    message?: string;
  }) {
    this.server.emit("market_status", {
      ...status,
      timestamp: new Date().toISOString(),
    });
  }

  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      authenticatedConnections: Array.from(
        this.connectedClients.values(),
      ).filter((c) => c.userId).length,
      totalSymbolSubscriptions: this.symbolSubscriptions.size,
      subscriptionDetails: Array.from(this.symbolSubscriptions.entries()).map(
        ([symbol, clients]) => ({
          symbol,
          subscriberCount: clients.size,
        }),
      ),
    };
  }
}
