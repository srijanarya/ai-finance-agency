import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import * as WebSocket from "ws";
import yahooFinance from "yahoo-finance2";

import { MarketData, DataSource } from "../entities/market-data.entity";
import { MarketSession } from "../entities/market-session.entity";
import { Watchlist } from "../entities/watchlist.entity";
import { CacheService } from "./cache.service";

export interface MarketDataDto {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private wsConnections = new Map<string, WebSocket>();

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    @InjectRepository(MarketSession)
    private marketSessionRepository: Repository<MarketSession>,
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.initializeWebSocketConnections();
  }

  async getRealtimeData(symbol: string): Promise<MarketData | null> {
    try {
      // Check cache first using tiered cache service
      const cached = await this.cacheService.get<MarketData>(
        `market_data_${symbol}`,
      );
      if (cached) {
        return cached;
      }

      // Get from database
      const data = await this.marketDataRepository.findOne({
        where: { symbol },
        order: { timestamp: "DESC" },
      });

      if (data) {
        // Use tiered cache for real-time data (5-second TTL)
        await this.cacheService.setRealtimeData(`market_data_${symbol}`, data);
      }

      return data;
    } catch (error) {
      this.logger.error(`Error getting realtime data for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleRealtimeData(symbols: string[]): Promise<MarketData[]> {
    try {
      const results = await Promise.all(
        symbols.map((symbol) => this.getRealtimeData(symbol)),
      );
      return results.filter((data) => data !== null);
    } catch (error) {
      this.logger.error("Error getting multiple realtime data:", error);
      return [];
    }
  }

  async updateMarketData(
    symbol: string,
    data: MarketDataDto,
    source: DataSource,
  ): Promise<MarketData> {
    try {
      const marketData = this.marketDataRepository.create({
        symbol: symbol.toUpperCase(),
        price: data.price,
        bid: data.bid,
        ask: data.ask,
        volume: data.volume || 0,
        change: data.change,
        changePercent: data.changePercent,
        dayHigh: data.dayHigh,
        dayLow: data.dayLow,
        previousClose: data.previousClose,
        source,
        timestamp: new Date(),
        isMarketOpen: await this.isMarketOpen(symbol),
        marketSession: await this.getCurrentMarketSession(symbol),
      });

      const savedData = await this.marketDataRepository.save(marketData);

      // Update cache using tiered cache for real-time data
      await this.cacheService.setRealtimeData(
        `market_data_${symbol}`,
        savedData,
      );

      // Emit event for real-time streaming
      this.eventEmitter.emit("market.data.updated", {
        symbol,
        data: savedData,
      });

      return savedData;
    } catch (error) {
      this.logger.error(`Error updating market data for ${symbol}:`, error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async fetchMarketDataFromSources(): Promise<void> {
    try {
      const symbols = await this.getActiveSymbols();

      for (const symbol of symbols) {
        await this.fetchSymbolData(symbol);
      }
    } catch (error) {
      this.logger.error("Error in scheduled market data fetch:", error);
    }
  }

  private async fetchSymbolData(symbol: string): Promise<void> {
    try {
      // Try Yahoo Finance first (free and reliable)
      const data = await this.fetchFromYahooFinance(symbol);
      if (data) {
        await this.updateMarketData(symbol, data, DataSource.YAHOO_FINANCE);
        return;
      }

      // Fallback to Alpha Vantage
      const alphaData = await this.fetchFromAlphaVantage(symbol);
      if (alphaData) {
        await this.updateMarketData(
          symbol,
          alphaData,
          DataSource.ALPHA_VANTAGE,
        );
        return;
      }

      // Fallback to IEX
      const iexData = await this.fetchFromIEX(symbol);
      if (iexData) {
        await this.updateMarketData(symbol, iexData, DataSource.IEX);
      }
    } catch (error) {
      this.logger.error(`Error fetching data for ${symbol}:`, error);
    }
  }

  private async fetchFromYahooFinance(
    symbol: string,
  ): Promise<MarketDataDto | null> {
    try {
      const quote = await yahooFinance.quote(symbol);

      if (!quote || !quote.regularMarketPrice) {
        return null;
      }

      return {
        symbol,
        price: quote.regularMarketPrice,
        bid: quote.bid,
        ask: quote.ask,
        volume: quote.regularMarketVolume,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        previousClose: quote.regularMarketPreviousClose,
      };
    } catch (error) {
      this.logger.debug(`Yahoo Finance error for ${symbol}:`, error.message);
      return null;
    }
  }

  private async fetchFromAlphaVantage(
    symbol: string,
  ): Promise<MarketDataDto | null> {
    try {
      const apiKey = this.configService.get("ALPHA_VANTAGE_API_KEY");
      if (!apiKey) return null;

      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      );

      const quote = response.data["Global Quote"];
      if (!quote) return null;

      return {
        symbol,
        price: parseFloat(quote["05. price"]),
        volume: parseInt(quote["06. volume"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
        dayHigh: parseFloat(quote["03. high"]),
        dayLow: parseFloat(quote["04. low"]),
        previousClose: parseFloat(quote["08. previous close"]),
      };
    } catch (error) {
      this.logger.debug(`Alpha Vantage error for ${symbol}:`, error.message);
      return null;
    }
  }

  private async fetchFromIEX(symbol: string): Promise<MarketDataDto | null> {
    try {
      const token = this.configService.get("IEX_API_TOKEN");
      if (!token) return null;

      const response = await axios.get(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${token}`,
      );

      const quote = response.data;
      if (!quote) return null;

      return {
        symbol,
        price: quote.latestPrice,
        bid: quote.iexBidPrice,
        ask: quote.iexAskPrice,
        volume: quote.latestVolume,
        change: quote.change,
        changePercent: quote.changePercent * 100,
        dayHigh: quote.high,
        dayLow: quote.low,
        previousClose: quote.previousClose,
      };
    } catch (error) {
      this.logger.debug(`IEX error for ${symbol}:`, error.message);
      return null;
    }
  }

  private async initializeWebSocketConnections(): Promise<void> {
    this.logger.log("Initializing WebSocket connections...");

    // Initialize Finnhub WebSocket for real-time data
    const finnhubWsUrl = this.configService.get(
      "FINNHUB_WS_URL",
      "wss://ws.finnhub.io",
    );
    const finnhubToken = this.configService.get("FINNHUB_API_KEY");

    if (finnhubToken) {
      this.connectToFinnhub(finnhubWsUrl, finnhubToken);
    }

    // Initialize Binance WebSocket for crypto data
    this.connectToBinance();
  }

  private connectToFinnhub(wsUrl: string, token: string): void {
    try {
      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.on("open", () => {
        this.logger.log("Connected to Finnhub WebSocket");
        this.wsConnections.set("finnhub", ws);

        // Subscribe to default symbols
        const defaultSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"];
        defaultSymbols.forEach((symbol) => {
          ws.send(JSON.stringify({ type: "subscribe", symbol: symbol }));
        });
      });

      ws.on("message", async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "trade" && message.data) {
            for (const trade of message.data) {
              await this.processFinnhubTrade(trade);
            }
          }
        } catch (error) {
          this.logger.error("Error processing Finnhub message:", error);
        }
      });

      ws.on("error", (error) => {
        this.logger.error("Finnhub WebSocket error:", error);
      });

      ws.on("close", () => {
        this.logger.warn(
          "Finnhub WebSocket closed, reconnecting in 5 seconds...",
        );
        setTimeout(() => this.connectToFinnhub(wsUrl, token), 5000);
      });
    } catch (error) {
      this.logger.error("Error connecting to Finnhub:", error);
    }
  }

  private connectToBinance(): void {
    try {
      const binanceWsUrl = "wss://stream.binance.com:9443/ws";
      const ws = new WebSocket(binanceWsUrl);

      ws.on("open", () => {
        this.logger.log("Connected to Binance WebSocket");
        this.wsConnections.set("binance", ws);

        // Subscribe to crypto streams
        const cryptoStreams = [
          "btcusdt@miniTicker",
          "ethusdt@miniTicker",
          "bnbusdt@miniTicker",
        ];

        ws.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: cryptoStreams,
            id: 1,
          }),
        );
      });

      ws.on("message", async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.e === "24hrMiniTicker") {
            await this.processBinanceTicker(message);
          }
        } catch (error) {
          this.logger.error("Error processing Binance message:", error);
        }
      });

      ws.on("error", (error) => {
        this.logger.error("Binance WebSocket error:", error);
      });

      ws.on("close", () => {
        this.logger.warn(
          "Binance WebSocket closed, reconnecting in 5 seconds...",
        );
        setTimeout(() => this.connectToBinance(), 5000);
      });
    } catch (error) {
      this.logger.error("Error connecting to Binance:", error);
    }
  }

  private async processFinnhubTrade(trade: any): Promise<void> {
    try {
      const marketData: MarketDataDto = {
        symbol: trade.s,
        price: trade.p,
        volume: trade.v,
        change: undefined,
        changePercent: undefined,
      };

      await this.updateMarketData(trade.s, marketData, DataSource.FINNHUB);
    } catch (error) {
      this.logger.error("Error processing Finnhub trade:", error);
    }
  }

  private async processBinanceTicker(ticker: any): Promise<void> {
    try {
      const symbol = ticker.s.replace("USDT", "-USD");
      const marketData: MarketDataDto = {
        symbol: symbol,
        price: parseFloat(ticker.c),
        volume: parseFloat(ticker.v),
        change: parseFloat(ticker.c) - parseFloat(ticker.o),
        changePercent:
          ((parseFloat(ticker.c) - parseFloat(ticker.o)) /
            parseFloat(ticker.o)) *
          100,
        dayHigh: parseFloat(ticker.h),
        dayLow: parseFloat(ticker.l),
        previousClose: parseFloat(ticker.o),
      };

      await this.updateMarketData(symbol, marketData, DataSource.BINANCE);
    } catch (error) {
      this.logger.error("Error processing Binance ticker:", error);
    }
  }

  async subscribeToSymbol(symbol: string): Promise<void> {
    try {
      // Subscribe to Finnhub
      const finnhubWs = this.wsConnections.get("finnhub");
      if (finnhubWs && finnhubWs.readyState === WebSocket.OPEN) {
        finnhubWs.send(JSON.stringify({ type: "subscribe", symbol }));
        this.logger.log(`Subscribed to ${symbol} on Finnhub`);
      }

      // For crypto symbols, subscribe to Binance
      if (
        symbol.includes("BTC") ||
        symbol.includes("ETH") ||
        symbol.includes("BNB")
      ) {
        const binanceWs = this.wsConnections.get("binance");
        if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
          const stream = `${symbol.toLowerCase().replace("-USD", "usdt")}@miniTicker`;
          binanceWs.send(
            JSON.stringify({
              method: "SUBSCRIBE",
              params: [stream],
              id: Date.now(),
            }),
          );
          this.logger.log(`Subscribed to ${symbol} on Binance`);
        }
      }
    } catch (error) {
      this.logger.error(`Error subscribing to ${symbol}:`, error);
    }
  }

  async unsubscribeFromSymbol(symbol: string): Promise<void> {
    try {
      // Unsubscribe from Finnhub
      const finnhubWs = this.wsConnections.get("finnhub");
      if (finnhubWs && finnhubWs.readyState === WebSocket.OPEN) {
        finnhubWs.send(JSON.stringify({ type: "unsubscribe", symbol }));
        this.logger.log(`Unsubscribed from ${symbol} on Finnhub`);
      }

      // For crypto symbols, unsubscribe from Binance
      if (
        symbol.includes("BTC") ||
        symbol.includes("ETH") ||
        symbol.includes("BNB")
      ) {
        const binanceWs = this.wsConnections.get("binance");
        if (binanceWs && binanceWs.readyState === WebSocket.OPEN) {
          const stream = `${symbol.toLowerCase().replace("-USD", "usdt")}@miniTicker`;
          binanceWs.send(
            JSON.stringify({
              method: "UNSUBSCRIBE",
              params: [stream],
              id: Date.now(),
            }),
          );
          this.logger.log(`Unsubscribed from ${symbol} on Binance`);
        }
      }
    } catch (error) {
      this.logger.error(`Error unsubscribing from ${symbol}:`, error);
    }
  }

  private async getActiveSymbols(): Promise<string[]> {
    try {
      // Get symbols from multiple sources
      const [
        watchlistSymbols,
        tradingSymbols,
        trendingSymbols,
        recentlyUpdatedSymbols,
      ] = await Promise.all([
        this.getWatchlistSymbols(),
        this.getActiveTradingSymbols(),
        this.getTrendingSymbols(),
        this.getRecentlyUpdatedSymbols(),
      ]);

      // Combine and deduplicate symbols
      const allSymbols = new Set([
        ...watchlistSymbols,
        ...tradingSymbols,
        ...trendingSymbols,
        ...recentlyUpdatedSymbols,
      ]);

      // Convert to array and ensure we have at least some default symbols
      const symbolsArray = Array.from(allSymbols);

      if (symbolsArray.length === 0) {
        // Fallback to default symbols if none found
        this.logger.warn("No active symbols found, using defaults");
        return ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "BTC-USD", "ETH-USD"];
      }

      // Limit to reasonable number to avoid overwhelming external APIs
      const limitedSymbols = symbolsArray.slice(0, 100);

      this.logger.log(
        `Active symbols resolved: ${limitedSymbols.length} symbols`,
      );
      return limitedSymbols;
    } catch (error) {
      this.logger.error("Error getting active symbols:", error);
      // Fallback to default symbols on error
      return ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "BTC-USD", "ETH-USD"];
    }
  }

  private async getWatchlistSymbols(): Promise<string[]> {
    try {
      // Get all unique symbols from user watchlists
      const recentWatchlists = await this.watchlistRepository
        .createQueryBuilder("watchlist")
        .select("DISTINCT watchlist.symbol")
        .where("watchlist.updatedAt > :date", {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        })
        .getRawMany();

      return recentWatchlists.map((w) => w.symbol).filter(Boolean);
    } catch (error) {
      this.logger.error("Error getting watchlist symbols:", error);
      return [];
    }
  }

  private async getActiveTradingSymbols(): Promise<string[]> {
    try {
      // Get symbols with recent market data updates (indicates active trading interest)
      const activeSymbols = await this.marketDataRepository
        .createQueryBuilder("market_data")
        .select("DISTINCT market_data.symbol")
        .where("market_data.updatedAt > :date", {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        })
        .andWhere("market_data.volume > :minVolume", { minVolume: 1000 })
        .orderBy("MAX(market_data.volume)", "DESC")
        .limit(50)
        .groupBy("market_data.symbol")
        .getRawMany();

      return activeSymbols.map((s) => s.symbol).filter(Boolean);
    } catch (error) {
      this.logger.error("Error getting active trading symbols:", error);
      return [];
    }
  }

  private async getTrendingSymbols(): Promise<string[]> {
    try {
      // Get symbols with high volatility or significant price changes
      const trendingSymbols = await this.marketDataRepository
        .createQueryBuilder("market_data")
        .select("DISTINCT market_data.symbol")
        .where("market_data.timestamp > :date", {
          date: new Date(Date.now() - 6 * 60 * 60 * 1000), // Last 6 hours
        })
        .andWhere("ABS(market_data.changePercent) > :minChange", {
          minChange: 2.0,
        }) // >2% change
        .orderBy("ABS(MAX(market_data.changePercent))", "DESC")
        .limit(20)
        .groupBy("market_data.symbol")
        .getRawMany();

      return trendingSymbols.map((s) => s.symbol).filter(Boolean);
    } catch (error) {
      this.logger.error("Error getting trending symbols:", error);
      return [];
    }
  }

  private async getRecentlyUpdatedSymbols(): Promise<string[]> {
    try {
      // Get symbols that have been recently updated to ensure continuous data flow
      const recentSymbols = await this.marketDataRepository
        .createQueryBuilder("market_data")
        .select("DISTINCT market_data.symbol")
        .where("market_data.updatedAt > :date", {
          date: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        })
        .limit(30)
        .getRawMany();

      return recentSymbols.map((s) => s.symbol).filter(Boolean);
    } catch (error) {
      this.logger.error("Error getting recently updated symbols:", error);
      return [];
    }
  }

  private async isMarketOpen(symbol: string): Promise<boolean> {
    try {
      const session = await this.getCurrentMarketSessionData(symbol);
      return session?.isOpen || false;
    } catch (error) {
      this.logger.error(`Error checking market status for ${symbol}:`, error);
      return false;
    }
  }

  private async getCurrentMarketSession(
    symbol: string,
  ): Promise<string | undefined> {
    try {
      const session = await this.getCurrentMarketSessionData(symbol);
      return session?.currentSession;
    } catch (error) {
      this.logger.error(`Error getting market session for ${symbol}:`, error);
      return undefined;
    }
  }

  private async getCurrentMarketSessionData(
    symbol: string,
  ): Promise<MarketSession | null> {
    try {
      // Determine market based on symbol
      let market = "NYSE";
      if (
        symbol.includes("-USD") ||
        symbol.includes("BTC") ||
        symbol.includes("ETH")
      ) {
        market = "CRYPTO";
      }

      const cacheKey = `market_session_${market}_${new Date().toISOString().split("T")[0]}`;

      // Check cache first
      const cached = await this.cacheService.get<MarketSession>(cacheKey);
      if (cached) {
        return cached;
      }

      const sessionData = await this.marketSessionRepository.findOne({
        where: {
          market,
          sessionDate: new Date().toISOString().split("T")[0] as any,
        },
      });

      if (sessionData) {
        // Use tiered cache for market session data (30-minute TTL)
        await this.cacheService.setMarketSession(cacheKey, sessionData);
      }

      return sessionData;
    } catch (error) {
      this.logger.error("Error getting market session data:", error);
      return null;
    }
  }

  async getMarketDataHistory(
    symbol: string,
    limit: number = 100,
  ): Promise<MarketData[]> {
    try {
      const cacheKey = `market_history_${symbol}_${limit}`;

      // Check cache first
      const cached = await this.cacheService.get<MarketData[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const historyData = await this.marketDataRepository.find({
        where: { symbol },
        order: { timestamp: "DESC" },
        take: limit,
      });

      if (historyData && historyData.length > 0) {
        // Use tiered cache for historical data (1-hour TTL)
        await this.cacheService.setHistoricalData(cacheKey, historyData);
      }

      return historyData;
    } catch (error) {
      this.logger.error(
        `Error getting market data history for ${symbol}:`,
        error,
      );
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchSymbols(_query: string): Promise<string[]> {
    try {
      // Implement symbol search logic
      // This is a placeholder - implement based on your data providers
      return [];
    } catch (error) {
      this.logger.error("Error searching symbols:", error);
      return [];
    }
  }
}
