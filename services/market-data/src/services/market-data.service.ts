import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import * as WebSocket from 'ws';
import yahooFinance from 'yahoo-finance2';

import { MarketData, DataSource } from '../entities/market-data.entity';
import { MarketSession } from '../entities/market-session.entity';

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
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.initializeWebSocketConnections();
  }

  async getRealtimeData(symbol: string): Promise<MarketData | null> {
    try {
      // Check cache first
      const cached = await this.cacheManager.get<MarketData>(`market_data_${symbol}`);
      if (cached) {
        return cached;
      }

      // Get from database
      const data = await this.marketDataRepository.findOne({
        where: { symbol },
        order: { timestamp: 'DESC' }
      });

      if (data) {
        await this.cacheManager.set(`market_data_${symbol}`, data, 30000); // 30 seconds
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
        symbols.map(symbol => this.getRealtimeData(symbol))
      );
      return results.filter(data => data !== null);
    } catch (error) {
      this.logger.error('Error getting multiple realtime data:', error);
      return [];
    }
  }

  async updateMarketData(symbol: string, data: MarketDataDto, source: DataSource): Promise<MarketData> {
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
        marketSession: await this.getCurrentMarketSession(symbol)
      });

      const savedData = await this.marketDataRepository.save(marketData);

      // Update cache
      await this.cacheManager.set(`market_data_${symbol}`, savedData, 30000);

      // Emit event for real-time streaming
      this.eventEmitter.emit('market.data.updated', {
        symbol,
        data: savedData
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
      this.logger.error('Error in scheduled market data fetch:', error);
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
        await this.updateMarketData(symbol, alphaData, DataSource.ALPHA_VANTAGE);
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

  private async fetchFromYahooFinance(symbol: string): Promise<MarketDataDto | null> {
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
        previousClose: quote.regularMarketPreviousClose
      };
    } catch (error) {
      this.logger.debug(`Yahoo Finance error for ${symbol}:`, error.message);
      return null;
    }
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<MarketDataDto | null> {
    try {
      const apiKey = this.configService.get('ALPHA_VANTAGE_API_KEY');
      if (!apiKey) return null;

      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );

      const quote = response.data['Global Quote'];
      if (!quote) return null;

      return {
        symbol,
        price: parseFloat(quote['05. price']),
        volume: parseInt(quote['06. volume']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        dayHigh: parseFloat(quote['03. high']),
        dayLow: parseFloat(quote['04. low']),
        previousClose: parseFloat(quote['08. previous close'])
      };
    } catch (error) {
      this.logger.debug(`Alpha Vantage error for ${symbol}:`, error.message);
      return null;
    }
  }

  private async fetchFromIEX(symbol: string): Promise<MarketDataDto | null> {
    try {
      const token = this.configService.get('IEX_API_TOKEN');
      if (!token) return null;

      const response = await axios.get(
        `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${token}`
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
        previousClose: quote.previousClose
      };
    } catch (error) {
      this.logger.debug(`IEX error for ${symbol}:`, error.message);
      return null;
    }
  }

  private async initializeWebSocketConnections(): Promise<void> {
    // Initialize WebSocket connections for real-time data
    // This is a placeholder - implement based on your data providers
    this.logger.log('Initializing WebSocket connections...');
  }

  private async getActiveSymbols(): Promise<string[]> {
    // Get list of symbols that need updating
    // This should come from watchlists, active positions, etc.
    return ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']; // Default symbols
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

  private async getCurrentMarketSession(symbol: string): Promise<string | undefined> {
    try {
      const session = await this.getCurrentMarketSessionData(symbol);
      return session?.currentSession;
    } catch (error) {
      this.logger.error(`Error getting market session for ${symbol}:`, error);
      return undefined;
    }
  }

  private async getCurrentMarketSessionData(symbol: string): Promise<MarketSession | null> {
    try {
      // Determine market based on symbol
      let market = 'NYSE';
      if (symbol.includes('-USD') || symbol.includes('BTC') || symbol.includes('ETH')) {
        market = 'CRYPTO';
      }

      return await this.marketSessionRepository.findOne({
        where: {
          market,
          sessionDate: new Date().toISOString().split('T')[0] as any
        }
      });
    } catch (error) {
      this.logger.error('Error getting market session data:', error);
      return null;
    }
  }

  async getMarketDataHistory(
    symbol: string,
    limit: number = 100
  ): Promise<MarketData[]> {
    try {
      return await this.marketDataRepository.find({
        where: { symbol },
        order: { timestamp: 'DESC' },
        take: limit
      });
    } catch (error) {
      this.logger.error(`Error getting market data history for ${symbol}:`, error);
      return [];
    }
  }

  async searchSymbols(query: string): Promise<string[]> {
    try {
      // Implement symbol search logic
      // This is a placeholder - implement based on your data providers
      return [];
    } catch (error) {
      this.logger.error('Error searching symbols:', error);
      return [];
    }
  }
}