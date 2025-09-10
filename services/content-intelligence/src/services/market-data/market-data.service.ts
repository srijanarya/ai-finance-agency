import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { MarketDataProvider, MarketQuote as IMarketQuote, HistoricalDataPoint, MarketStatus, MarketDataCache } from '../../interfaces/market-data/market-data.interface';
import { MarketQuote } from '../../entities/market-data/market-quote.entity';
import { HistoricalMarketData } from '../../entities/market-data/historical-data.entity';
import { AlphaVantageService } from './alpha-vantage.service';
import { YahooFinanceService } from './yahoo-finance.service';
import { MockMarketDataService } from './mock-market-data.service';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly primaryProvider: MarketDataProvider;
  private readonly fallbackProviders: MarketDataProvider[];
  private readonly cacheConfig: { ttl: number; maxSize: number };

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MarketQuote)
    private readonly quoteRepository: Repository<MarketQuote>,
    @InjectRepository(HistoricalMarketData)
    private readonly historicalRepository: Repository<HistoricalMarketData>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly alphaVantageService: AlphaVantageService,
    private readonly yahooFinanceService: YahooFinanceService,
    private readonly mockMarketDataService: MockMarketDataService,
  ) {
    // Initialize providers based on configuration
    const primaryProviderName = this.configService.get<string>('marketData.providers.primary', 'mock');
    const fallbackProviderNames = this.configService.get<string[]>('marketData.providers.fallback', ['mock']);

    this.primaryProvider = this.getProviderInstance(primaryProviderName);
    this.fallbackProviders = fallbackProviderNames.map(name => this.getProviderInstance(name));

    this.cacheConfig = {
      ttl: this.configService.get<number>('marketData.cache.ttl', 300), // 5 minutes default
      maxSize: this.configService.get<number>('marketData.cache.maxSize', 1000),
    };

    this.logger.log(`Initialized with primary provider: ${primaryProviderName}, fallback providers: ${fallbackProviderNames.join(', ')}`);
  }

  /**
   * Get real-time quote for a symbol with caching and fallback providers
   */
  async getQuote(symbol: string): Promise<IMarketQuote> {
    const cacheKey = `quote:${symbol.toUpperCase()}`;
    
    try {
      // Check cache first
      const cachedQuote = await this.cacheManager.get<MarketDataCache>(cacheKey);
      if (cachedQuote && cachedQuote.quote && this.isCacheValid(cachedQuote)) {
        this.logger.debug(`Cache hit for quote: ${symbol}`);
        return cachedQuote.quote;
      }

      // Try primary provider
      let quote: IMarketQuote;
      try {
        quote = await this.primaryProvider.getQuote(symbol);
        this.logger.log(`Quote retrieved from primary provider for ${symbol}: $${quote.price}`);
      } catch (error) {
        this.logger.warn(`Primary provider failed for ${symbol}: ${error.message}`);
        
        // Try fallback providers
        quote = await this.tryFallbackProviders('getQuote', symbol);
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, {
        quote,
        lastUpdated: new Date(),
        ttl: this.cacheConfig.ttl,
      }, this.cacheConfig.ttl * 1000);

      // Store in database for historical analysis
      await this.saveQuoteToDatabase(quote);

      return quote;
    } catch (error) {
      this.logger.error(`Failed to get quote for ${symbol}: ${error.message}`);
      throw new Error(`Unable to retrieve quote for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get historical data for a symbol with caching
   */
  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
    interval: '1d' | '1h' | '5m' | '1m' = '1d'
  ): Promise<HistoricalDataPoint[]> {
    const cacheKey = `historical:${symbol.toUpperCase()}:${startDate.toISOString()}:${endDate.toISOString()}:${interval}`;
    
    try {
      // Check cache first
      const cachedData = await this.cacheManager.get<MarketDataCache>(cacheKey);
      if (cachedData && cachedData.historicalData && this.isCacheValid(cachedData)) {
        this.logger.debug(`Cache hit for historical data: ${symbol}`);
        return cachedData.historicalData;
      }

      // Check database for existing data
      const existingData = await this.getHistoricalDataFromDatabase(symbol, startDate, endDate, interval);
      if (existingData.length > 0) {
        this.logger.debug(`Database hit for historical data: ${symbol} (${existingData.length} points)`);
        
        // Cache the database result
        await this.cacheManager.set(cacheKey, {
          historicalData: existingData,
          lastUpdated: new Date(),
          ttl: this.cacheConfig.ttl,
        }, this.cacheConfig.ttl * 1000);

        return existingData;
      }

      // Fetch from provider
      let historicalData: HistoricalDataPoint[];
      try {
        historicalData = await this.primaryProvider.getHistoricalData(symbol, startDate, endDate, interval);
        this.logger.log(`Historical data retrieved from primary provider for ${symbol}: ${historicalData.length} points`);
      } catch (error) {
        this.logger.warn(`Primary provider failed for historical data ${symbol}: ${error.message}`);
        
        // Try fallback providers
        historicalData = await this.tryFallbackProviders('getHistoricalData', symbol, startDate, endDate, interval);
      }

      // Cache the result
      await this.cacheManager.set(cacheKey, {
        historicalData,
        lastUpdated: new Date(),
        ttl: this.cacheConfig.ttl,
      }, this.cacheConfig.ttl * 1000);

      // Store in database
      await this.saveHistoricalDataToDatabase(symbol, historicalData, interval);

      return historicalData;
    } catch (error) {
      this.logger.error(`Failed to get historical data for ${symbol}: ${error.message}`);
      throw new Error(`Unable to retrieve historical data for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get current market status
   */
  async getMarketStatus(): Promise<MarketStatus> {
    const cacheKey = 'market:status';
    
    try {
      const cachedStatus = await this.cacheManager.get<MarketStatus>(cacheKey);
      if (cachedStatus) {
        return cachedStatus;
      }

      const status = await this.primaryProvider.getMarketStatus();
      
      // Cache for 1 minute
      await this.cacheManager.set(cacheKey, status, 60 * 1000);
      
      return status;
    } catch (error) {
      this.logger.error(`Failed to get market status: ${error.message}`);
      throw new Error(`Unable to retrieve market status: ${error.message}`);
    }
  }

  /**
   * Check if market is currently open
   */
  async isMarketOpen(): Promise<boolean> {
    try {
      const status = await this.getMarketStatus();
      return status.isOpen;
    } catch (error) {
      this.logger.error(`Failed to check market status: ${error.message}`);
      return false; // Conservative approach - assume closed if we can't determine
    }
  }

  /**
   * Validate if a symbol exists
   */
  async validateSymbol(symbol: string): Promise<boolean> {
    const cacheKey = `symbol:validation:${symbol.toUpperCase()}`;
    
    try {
      const cachedResult = await this.cacheManager.get<boolean>(cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const isValid = await this.primaryProvider.validateSymbol(symbol);
      
      // Cache for 1 hour
      await this.cacheManager.set(cacheKey, isValid, 60 * 60 * 1000);
      
      return isValid;
    } catch (error) {
      this.logger.error(`Failed to validate symbol ${symbol}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get multiple quotes efficiently
   */
  async getMultipleQuotes(symbols: string[]): Promise<IMarketQuote[]> {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<IMarketQuote> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * Clear cache for a specific symbol or all market data
   */
  async clearCache(symbol?: string): Promise<void> {
    if (symbol) {
      const keys = [
        `quote:${symbol.toUpperCase()}`,
        `symbol:validation:${symbol.toUpperCase()}`,
      ];
      
      for (const key of keys) {
        await this.cacheManager.del(key);
      }
      
      this.logger.log(`Cache cleared for symbol: ${symbol}`);
    } else {
      await this.cacheManager.reset();
      this.logger.log('All market data cache cleared');
    }
  }

  private getProviderInstance(providerName: string): MarketDataProvider {
    switch (providerName.toLowerCase()) {
      case 'alpha_vantage':
        return this.alphaVantageService;
      case 'yahoo_finance':
        return this.yahooFinanceService;
      case 'mock':
        return this.mockMarketDataService;
      default:
        this.logger.warn(`Unknown provider: ${providerName}, falling back to mock`);
        return this.mockMarketDataService;
    }
  }

  private async tryFallbackProviders(method: string, ...args: any[]): Promise<any> {
    for (const provider of this.fallbackProviders) {
      try {
        const result = await (provider as any)[method](...args);
        this.logger.log(`Fallback provider succeeded for ${method}`);
        return result;
      } catch (error) {
        this.logger.warn(`Fallback provider failed for ${method}: ${error.message}`);
      }
    }
    
    throw new Error(`All providers failed for ${method}`);
  }

  private isCacheValid(cache: MarketDataCache): boolean {
    const age = Date.now() - cache.lastUpdated.getTime();
    return age < (cache.ttl * 1000);
  }

  private async saveQuoteToDatabase(quote: IMarketQuote): Promise<void> {
    try {
      const quoteEntity = this.quoteRepository.create({
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        previousClose: quote.previousClose,
        dayLow: quote.dayLow,
        dayHigh: quote.dayHigh,
        timestamp: quote.timestamp,
        source: 'api',
        isMarketOpen: await this.isMarketOpen(),
      });

      await this.quoteRepository.save(quoteEntity);
    } catch (error) {
      this.logger.warn(`Failed to save quote to database: ${error.message}`);
    }
  }

  private async saveHistoricalDataToDatabase(
    symbol: string,
    data: HistoricalDataPoint[],
    interval: string
  ): Promise<void> {
    try {
      const entities = data.map(point => this.historicalRepository.create({
        symbol,
        date: point.date,
        interval,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        adjustedClose: point.adjustedClose,
        source: 'api',
      }));

      // Use upsert to handle duplicates
      await this.historicalRepository.upsert(entities, {
        conflictPaths: ['symbol', 'date', 'interval'],
        skipUpdateIfNoValuesChanged: true,
      });
    } catch (error) {
      this.logger.warn(`Failed to save historical data to database: ${error.message}`);
    }
  }

  private async getHistoricalDataFromDatabase(
    symbol: string,
    startDate: Date,
    endDate: Date,
    interval: string
  ): Promise<HistoricalDataPoint[]> {
    try {
      const entities = await this.historicalRepository.find({
        where: {
          symbol: symbol.toUpperCase(),
          interval,
          date: {
            $gte: startDate,
            $lte: endDate,
          } as any,
        },
        order: { date: 'ASC' },
      });

      return entities.map(entity => ({
        date: entity.date,
        open: entity.open,
        high: entity.high,
        low: entity.low,
        close: entity.close,
        volume: entity.volume,
        adjustedClose: entity.adjustedClose,
      }));
    } catch (error) {
      this.logger.warn(`Failed to retrieve historical data from database: ${error.message}`);
      return [];
    }
  }
}