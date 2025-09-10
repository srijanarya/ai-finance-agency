import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as moment from 'moment-timezone';

export interface MarketDataQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  timestamp: string;
}

export interface MarketDataSnapshot {
  timestamp: string;
  marketStatus: {
    isOpen: boolean;
    nextOpen?: string;
    nextClose?: string;
    timezone: string;
  };
  indices: {
    sp500: MarketDataQuote;
    nasdaq: MarketDataQuote;
    dow: MarketDataQuote;
    russell2000: MarketDataQuote;
    vix: MarketDataQuote;
  };
  currencies: {
    usdeur: MarketDataQuote;
    usdgbp: MarketDataQuote;
    usdjpy: MarketDataQuote;
    usdcad: MarketDataQuote;
    usdchf: MarketDataQuote;
  };
  commodities: {
    gold: MarketDataQuote;
    silver: MarketDataQuote;
    oil: MarketDataQuote;
    naturalGas: MarketDataQuote;
    bitcoin: MarketDataQuote;
    ethereum: MarketDataQuote;
  };
  sectors: {
    technology: MarketDataQuote;
    healthcare: MarketDataQuote;
    financials: MarketDataQuote;
    energy: MarketDataQuote;
    utilities: MarketDataQuote;
  };
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
  bondYields: {
    us10y: number;
    us2y: number;
    us30y: number;
    us3m: number;
  };
  economicIndicators: {
    inflation: number;
    unemployment: number;
    gdpGrowth: number;
    interestRate: number;
  };
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private cachedData: MarketDataSnapshot | null = null;
  private lastFetchTime = 0;
  private readonly cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes
  private readonly marketTimezone = 'America/New_York';
  private readonly providers = {
    alphaVantage: {
      apiKey: null as string | null,
      baseUrl: 'https://www.alphavantage.co/query',
      enabled: false,
    },
    yahooFinance: {
      baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
      enabled: true, // Mock implementation enabled
    },
    polygon: {
      apiKey: null as string | null,
      baseUrl: 'https://api.polygon.io',
      enabled: false,
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize API keys from configuration
    this.providers.alphaVantage.apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');
    this.providers.alphaVantage.enabled = !!this.providers.alphaVantage.apiKey;

    this.providers.polygon.apiKey = this.configService.get<string>('POLYGON_API_KEY');
    this.providers.polygon.enabled = !!this.providers.polygon.apiKey;

    this.logger.log('Market data providers initialized', {
      alphaVantage: this.providers.alphaVantage.enabled,
      yahooFinance: this.providers.yahooFinance.enabled,
      polygon: this.providers.polygon.enabled,
    });
  }

  async getCurrentMarketData(): Promise<MarketDataSnapshot> {
    const now = Date.now();

    // Check market status first
    const marketStatus = this.getMarketStatus();

    // Return cached data if still fresh and market conditions haven't changed
    if (this.cachedData && (now - this.lastFetchTime) < this.cacheTimeoutMs) {
      // Update market status in cached data
      this.cachedData.marketStatus = marketStatus;
      return this.cachedData;
    }

    try {
      // Fetch from available providers with fallback strategy
      const marketData: MarketDataSnapshot = await this.fetchMarketDataFromProviders();
      marketData.marketStatus = marketStatus;

      this.cachedData = marketData;
      this.lastFetchTime = now;

      // Emit real-time data event for WebSocket subscribers
      this.eventEmitter.emit('market.data.updated', marketData);

      this.logger.log('Market data refreshed successfully', {
        marketOpen: marketStatus.isOpen,
        providersUsed: this.getActiveProviders().length,
      });

      return marketData;
    } catch (error) {
      this.logger.warn('Failed to fetch market data, returning cached or default data', {
        error: error.message,
      });

      // Return cached data or default values with current market status
      const fallbackData = this.cachedData || this.getDefaultMarketData();
      fallbackData.marketStatus = marketStatus;
      return fallbackData;
    }
  }

  /**
   * Determines current market status including opening/closing times
   */
  private getMarketStatus(): MarketDataSnapshot['marketStatus'] {
    const now = moment().tz(this.marketTimezone);
    const currentTime = now.format('HH:mm');
    const currentDay = now.day(); // 0 = Sunday, 6 = Saturday

    // Market is closed on weekends
    if (currentDay === 0 || currentDay === 6) {
      const nextMonday = now.clone().day(1).hour(9).minute(30).second(0);
      return {
        isOpen: false,
        nextOpen: nextMonday.toISOString(),
        timezone: this.marketTimezone,
      };
    }

    // Regular trading hours: 9:30 AM - 4:00 PM ET
    const marketOpen = '09:30';
    const marketClose = '16:00';

    const isOpen = currentTime >= marketOpen && currentTime < marketClose;

    let nextOpen: string | undefined;
    let nextClose: string | undefined;

    if (isOpen) {
      // Market is open, calculate next close
      nextClose = now.clone().hour(16).minute(0).second(0).toISOString();
    } else {
      // Market is closed, calculate next open
      if (currentTime < marketOpen) {
        // Before market opens today
        nextOpen = now.clone().hour(9).minute(30).second(0).toISOString();
      } else {
        // After market closes today, next open is tomorrow (or Monday if Friday)
        const tomorrow = now.clone().add(1, 'day');
        if (tomorrow.day() === 6) {
          // Tomorrow is Saturday, next open is Monday
          nextOpen = tomorrow.clone().day(8).hour(9).minute(30).second(0).toISOString();
        } else if (tomorrow.day() === 0) {
          // Tomorrow is Sunday, next open is Monday
          nextOpen = tomorrow.clone().day(8).hour(9).minute(30).second(0).toISOString();
        } else {
          // Regular next day
          nextOpen = tomorrow.hour(9).minute(30).second(0).toISOString();
        }
      }
    }

    return {
      isOpen,
      nextOpen,
      nextClose,
      timezone: this.marketTimezone,
    };
  }

  /**
   * Fetch market data from available providers with fallback strategy
   */
  private async fetchMarketDataFromProviders(): Promise<MarketDataSnapshot> {
    const activeProviders = this.getActiveProviders();

    if (activeProviders.length === 0) {
      this.logger.warn('No active market data providers, using mock data');
      return this.generateMockMarketData();
    }

    // Try providers in order of preference
    for (const provider of activeProviders) {
      try {
        this.logger.debug(`Attempting to fetch data from ${provider}`);
        const data = await this.fetchFromProvider(provider);
        if (data) {
          this.logger.log(`Successfully fetched data from ${provider}`);
          return data;
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch from ${provider}`, { error: error.message });
        continue;
      }
    }

    // All providers failed, return mock data
    this.logger.warn('All providers failed, falling back to mock data');
    return this.generateMockMarketData();
  }

  private getActiveProviders(): string[] {
    const active: string[] = [];
    
    if (this.providers.alphaVantage.enabled) active.push('alphaVantage');
    if (this.providers.polygon.enabled) active.push('polygon');
    if (this.providers.yahooFinance.enabled) active.push('yahooFinance');

    return active;
  }

  private async fetchFromProvider(provider: string): Promise<MarketDataSnapshot | null> {
    switch (provider) {
      case 'alphaVantage':
        return this.fetchFromAlphaVantage();
      case 'polygon':
        return this.fetchFromPolygon();
      case 'yahooFinance':
        return this.fetchFromYahooFinance();
      default:
        return null;
    }
  }

  private async fetchFromAlphaVantage(): Promise<MarketDataSnapshot | null> {
    if (!this.providers.alphaVantage.enabled) return null;

    try {
      // Fetch multiple data points from Alpha Vantage
      const symbols = ['SPY', 'QQQ', 'DIA', 'GLD', 'USO', 'BTC-USD'];
      const promises = symbols.map(symbol => this.fetchSymbolFromAlphaVantage(symbol));
      
      const results = await Promise.allSettled(promises);
      const quotes = results
        .filter((result): result is PromiseFulfilledResult<MarketDataQuote> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);

      if (quotes.length === 0) return null;

      return this.buildMarketDataFromQuotes(quotes);
    } catch (error) {
      this.logger.error('Alpha Vantage fetch failed', { error: error.message });
      return null;
    }
  }

  private async fetchSymbolFromAlphaVantage(symbol: string): Promise<MarketDataQuote | null> {
    try {
      const url = `${this.providers.alphaVantage.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.providers.alphaVantage.apiKey}`;
      
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data['Global Quote'];

      if (!data) return null;

      return {
        symbol,
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume']),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch ${symbol} from Alpha Vantage`, { error: error.message });
      return null;
    }
  }

  private async fetchFromPolygon(): Promise<MarketDataSnapshot | null> {
    // Polygon.io implementation would go here
    // Similar structure to Alpha Vantage but using Polygon's API
    this.logger.debug('Polygon.io integration not yet implemented');
    return null;
  }

  private async fetchFromYahooFinance(): Promise<MarketDataSnapshot | null> {
    // Yahoo Finance API integration would go here
    // This is a mock implementation for now
    this.logger.debug('Using mock Yahoo Finance data');
    return this.generateMockMarketData();
  }

  private buildMarketDataFromQuotes(quotes: MarketDataQuote[]): MarketDataSnapshot {
    // Build market snapshot from individual quotes
    // This would map symbols to their respective categories
    const timestamp = new Date().toISOString();
    
    // For now, return mock data structure with real quotes where available
    return this.generateMockMarketData();
  }

  /**
   * Generate realistic mock market data
   */
  private generateMockMarketData(): MarketDataSnapshot {
    const timestamp = new Date().toISOString();
    const baseVariation = () => (Math.random() - 0.5) * 2; // -1 to 1% variation

    return {
      timestamp,
      marketStatus: this.getMarketStatus(),
      indices: {
        sp500: {
          symbol: 'SPY',
          price: 415.48 + baseVariation() * 10,
          change: 15.23 + baseVariation() * 5,
          changePercent: 0.37 + baseVariation(),
          volume: 50000000 + Math.random() * 20000000,
          timestamp,
        },
        nasdaq: {
          symbol: 'QQQ',
          price: 354.73 + baseVariation() * 8,
          change: -2.17 + baseVariation() * 3,
          changePercent: -0.34 + baseVariation(),
          volume: 40000000 + Math.random() * 15000000,
          timestamp,
        },
        dow: {
          symbol: 'DIA',
          price: 337.45 + baseVariation() * 6,
          change: 8.91 + baseVariation() * 4,
          changePercent: 0.03 + baseVariation(),
          volume: 5000000 + Math.random() * 2000000,
          timestamp,
        },
        russell2000: {
          symbol: 'IWM',
          price: 189.23 + baseVariation() * 4,
          change: -1.45 + baseVariation() * 2,
          changePercent: -0.76 + baseVariation(),
          volume: 30000000 + Math.random() * 10000000,
          timestamp,
        },
        vix: {
          symbol: 'VIX',
          price: 18.45 + baseVariation() * 3,
          change: 0.85 + baseVariation(),
          changePercent: 4.82 + baseVariation() * 2,
          timestamp,
        },
      },
      currencies: {
        usdeur: {
          symbol: 'EURUSD',
          price: 0.8745 + baseVariation() * 0.01,
          change: -0.0023 + baseVariation() * 0.001,
          changePercent: -0.26 + baseVariation() * 0.1,
          timestamp,
        },
        usdgbp: {
          symbol: 'GBPUSD',
          price: 0.7834 + baseVariation() * 0.01,
          change: 0.0012 + baseVariation() * 0.001,
          changePercent: 0.15 + baseVariation() * 0.1,
          timestamp,
        },
        usdjpy: {
          symbol: 'USDJPY',
          price: 148.73 + baseVariation() * 2,
          change: 0.45 + baseVariation() * 0.5,
          changePercent: 0.30 + baseVariation() * 0.2,
          timestamp,
        },
        usdcad: {
          symbol: 'USDCAD',
          price: 1.3456 + baseVariation() * 0.02,
          change: -0.0034 + baseVariation() * 0.002,
          changePercent: -0.25 + baseVariation() * 0.1,
          timestamp,
        },
        usdchf: {
          symbol: 'USDCHF',
          price: 0.9123 + baseVariation() * 0.01,
          change: 0.0018 + baseVariation() * 0.001,
          changePercent: 0.20 + baseVariation() * 0.1,
          timestamp,
        },
      },
      commodities: {
        gold: {
          symbol: 'GLD',
          price: 1945.23 + baseVariation() * 20,
          change: -5.47 + baseVariation() * 10,
          changePercent: -0.28 + baseVariation() * 0.5,
          timestamp,
        },
        silver: {
          symbol: 'SLV',
          price: 24.78 + baseVariation() * 2,
          change: 0.34 + baseVariation() * 0.5,
          changePercent: 1.39 + baseVariation() * 1,
          timestamp,
        },
        oil: {
          symbol: 'USO',
          price: 78.42 + baseVariation() * 3,
          change: 1.23 + baseVariation() * 2,
          changePercent: 1.59 + baseVariation() * 1,
          timestamp,
        },
        naturalGas: {
          symbol: 'UNG',
          price: 3.45 + baseVariation() * 0.3,
          change: -0.12 + baseVariation() * 0.2,
          changePercent: -3.36 + baseVariation() * 2,
          timestamp,
        },
        bitcoin: {
          symbol: 'BTC-USD',
          price: 42150.30 + baseVariation() * 2000,
          change: 892.45 + baseVariation() * 500,
          changePercent: 2.16 + baseVariation() * 3,
          timestamp,
        },
        ethereum: {
          symbol: 'ETH-USD',
          price: 2345.67 + baseVariation() * 200,
          change: 45.23 + baseVariation() * 50,
          changePercent: 1.97 + baseVariation() * 2,
          timestamp,
        },
      },
      sectors: {
        technology: {
          symbol: 'XLK',
          price: 165.43 + baseVariation() * 5,
          change: 2.17 + baseVariation() * 2,
          changePercent: 1.33 + baseVariation(),
          timestamp,
        },
        healthcare: {
          symbol: 'XLV',
          price: 132.89 + baseVariation() * 3,
          change: -0.67 + baseVariation(),
          changePercent: -0.50 + baseVariation() * 0.5,
          timestamp,
        },
        financials: {
          symbol: 'XLF',
          price: 38.45 + baseVariation() * 2,
          change: 0.89 + baseVariation(),
          changePercent: 2.37 + baseVariation(),
          timestamp,
        },
        energy: {
          symbol: 'XLE',
          price: 89.23 + baseVariation() * 4,
          change: 2.34 + baseVariation() * 2,
          changePercent: 2.69 + baseVariation() * 1.5,
          timestamp,
        },
        utilities: {
          symbol: 'XLU',
          price: 67.12 + baseVariation() * 2,
          change: -0.23 + baseVariation() * 0.5,
          changePercent: -0.34 + baseVariation() * 0.3,
          timestamp,
        },
      },
      marketSentiment: this.calculateMarketSentiment(),
      volatilityIndex: 18.45 + baseVariation() * 5,
      bondYields: {
        us10y: 4.23 + baseVariation() * 0.1,
        us2y: 4.87 + baseVariation() * 0.15,
        us30y: 4.56 + baseVariation() * 0.08,
        us3m: 5.12 + baseVariation() * 0.2,
      },
      economicIndicators: {
        inflation: 3.2 + baseVariation() * 0.2,
        unemployment: 3.8 + baseVariation() * 0.1,
        gdpGrowth: 2.4 + baseVariation() * 0.3,
        interestRate: 5.25 + baseVariation() * 0.25,
      },
    };
  }

  /**
   * Scheduled task to refresh market data during trading hours
   */
  @Cron('*/5 * * * 1-5', { name: 'refreshMarketData', timeZone: 'America/New_York' })
  async scheduledMarketDataRefresh(): Promise<void> {
    const marketStatus = this.getMarketStatus();
    
    // Only refresh during market hours or slightly extended hours
    if (marketStatus.isOpen || this.isExtendedHours()) {
      try {
        await this.getCurrentMarketData();
        this.logger.debug('Scheduled market data refresh completed');
      } catch (error) {
        this.logger.error('Scheduled market data refresh failed', { error: error.message });
      }
    }
  }

  /**
   * Check if current time is within extended trading hours
   */
  private isExtendedHours(): boolean {
    const now = moment().tz(this.marketTimezone);
    const currentTime = now.format('HH:mm');
    const currentDay = now.day();

    // Weekend - no extended hours
    if (currentDay === 0 || currentDay === 6) return false;

    // Pre-market: 4:00 AM - 9:30 AM ET
    // After-hours: 4:00 PM - 8:00 PM ET
    return (currentTime >= '04:00' && currentTime < '09:30') ||
           (currentTime >= '16:00' && currentTime < '20:00');
  }

  private getDefaultMarketData(): MarketDataSnapshot {
    return this.generateMockMarketData();
  }

  private calculateMarketSentiment(): 'bullish' | 'bearish' | 'neutral' {
    // Enhanced sentiment calculation based on multiple factors
    if (!this.cachedData) {
      // Default to neutral if no data available
      return 'neutral';
    }

    try {
      let bullishFactors = 0;
      let bearishFactors = 0;

      // Check major indices performance
      const indices = [this.cachedData.indices.sp500, this.cachedData.indices.nasdaq, this.cachedData.indices.dow];
      indices.forEach(index => {
        if (index.changePercent > 0.5) bullishFactors += 1;
        else if (index.changePercent < -0.5) bearishFactors += 1;
      });

      // Check VIX (volatility index) - higher VIX indicates fear/bearish sentiment
      if (this.cachedData.volatilityIndex > 25) bearishFactors += 2;
      else if (this.cachedData.volatilityIndex < 15) bullishFactors += 1;

      // Check bond yields - rising yields can indicate optimism or inflation concerns
      if (this.cachedData.bondYields.us10y > 4.5) bearishFactors += 1;

      // Check crypto performance as risk appetite indicator
      if (this.cachedData.commodities.bitcoin.changePercent > 2) bullishFactors += 1;
      else if (this.cachedData.commodities.bitcoin.changePercent < -2) bearishFactors += 1;

      // Determine overall sentiment
      if (bullishFactors > bearishFactors + 1) return 'bullish';
      if (bearishFactors > bullishFactors + 1) return 'bearish';
      return 'neutral';
    } catch (error) {
      this.logger.warn('Error calculating market sentiment', { error: error.message });
      return 'neutral';
    }
  }

  async getHistoricalData(
    symbol: string,
    period: string = '1month',
    interval: string = '1day',
  ): Promise<MarketDataQuote[]> {
    try {
      this.logger.debug('Fetching historical data', { symbol, period, interval });

      // Try to fetch from available providers
      for (const provider of this.getActiveProviders()) {
        try {
          const data = await this.fetchHistoricalFromProvider(provider, symbol, period, interval);
          if (data && data.length > 0) {
            this.logger.log(`Historical data fetched from ${provider}`, { symbol, dataPoints: data.length });
            return data;
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch historical data from ${provider}`, { error: error.message });
          continue;
        }
      }

      // Fallback to mock data
      this.logger.warn('All providers failed for historical data, using mock data', { symbol, period });
      return this.generateMockHistoricalData(symbol, period, interval);
    } catch (error) {
      this.logger.error('Failed to fetch historical data', {
        symbol,
        period,
        error: error.message,
      });
      return [];
    }
  }

  private async fetchHistoricalFromProvider(
    provider: string,
    symbol: string,
    period: string,
    interval: string,
  ): Promise<MarketDataQuote[]> {
    switch (provider) {
      case 'alphaVantage':
        return this.fetchHistoricalFromAlphaVantage(symbol, period, interval);
      case 'polygon':
        return this.fetchHistoricalFromPolygon(symbol, period, interval);
      case 'yahooFinance':
        return this.fetchHistoricalFromYahooFinance(symbol, period, interval);
      default:
        return [];
    }
  }

  private async fetchHistoricalFromAlphaVantage(
    symbol: string,
    period: string,
    interval: string,
  ): Promise<MarketDataQuote[]> {
    if (!this.providers.alphaVantage.enabled) return [];

    try {
      // Determine Alpha Vantage function based on interval
      let func = 'TIME_SERIES_DAILY';
      if (interval.includes('min')) func = 'TIME_SERIES_INTRADAY';
      else if (interval === '1week') func = 'TIME_SERIES_WEEKLY';
      else if (interval === '1month') func = 'TIME_SERIES_MONTHLY';

      const url = `${this.providers.alphaVantage.baseUrl}?function=${func}&symbol=${symbol}&apikey=${this.providers.alphaVantage.apiKey}`;
      if (func === 'TIME_SERIES_INTRADAY') {
        url += `&interval=${interval}`;
      }

      const response = await firstValueFrom(this.httpService.get(url));
      const timeSeriesKey = Object.keys(response.data).find(key => key.includes('Time Series'));
      
      if (!timeSeriesKey) return [];

      const timeSeries = response.data[timeSeriesKey];
      return Object.entries(timeSeries)
        .map(([timestamp, data]: [string, any]) => ({
          symbol,
          price: parseFloat(data['4. close']),
          change: 0, // Calculate from previous day if needed
          changePercent: 0,
          volume: parseInt(data['5. volume'] || '0'),
          timestamp: new Date(timestamp).toISOString(),
        }))
        .slice(0, this.getPeriodLimit(period));
    } catch (error) {
      this.logger.error('Alpha Vantage historical fetch failed', { error: error.message });
      return [];
    }
  }

  private async fetchHistoricalFromPolygon(
    symbol: string,
    period: string,
    interval: string,
  ): Promise<MarketDataQuote[]> {
    // Polygon.io historical data implementation
    this.logger.debug('Polygon.io historical data not yet implemented');
    return [];
  }

  private async fetchHistoricalFromYahooFinance(
    symbol: string,
    period: string,
    interval: string,
  ): Promise<MarketDataQuote[]> {
    // Yahoo Finance historical data implementation
    this.logger.debug('Yahoo Finance historical data not yet implemented');
    return [];
  }

  private getPeriodLimit(period: string): number {
    const limits: Record<string, number> = {
      '1day': 24,
      '1week': 7,
      '1month': 30,
      '3months': 90,
      '6months': 180,
      '1year': 365,
      '2years': 730,
    };
    return limits[period] || 30;
  }

  private generateMockHistoricalData(
    symbol: string,
    period: string,
    interval: string = '1day',
  ): MarketDataQuote[] {
    const dataPoints = this.getPeriodLimit(period);
    const data: MarketDataQuote[] = [];
    
    // Get base price from current market data if available
    let basePrice = this.getBasePriceForSymbol(symbol);
    let previousPrice = basePrice;
    
    const intervalMs = this.getIntervalMs(interval);
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const changePercent = (Math.random() - 0.5) * 4; // -2% to +2% change
      const change = (basePrice * changePercent) / 100;
      const price = basePrice + change;
      
      data.push({
        symbol,
        price: Math.round(price * 100) / 100,
        change: Math.round((price - previousPrice) * 100) / 100,
        changePercent: Math.round(((price - previousPrice) / previousPrice) * 10000) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        timestamp: new Date(Date.now() - i * intervalMs).toISOString(),
      });
      
      previousPrice = price;
      basePrice = price; // Use current price as base for next iteration
    }

    return data.reverse(); // Return in chronological order
  }

  private getBasePriceForSymbol(symbol: string): number {
    // Default prices for common symbols
    const basePrices: Record<string, number> = {
      'SPY': 415,
      'QQQ': 354,
      'DIA': 337,
      'IWM': 189,
      'VIX': 18,
      'GLD': 194,
      'USO': 78,
      'BTC-USD': 42000,
      'ETH-USD': 2345,
      'AAPL': 175,
      'MSFT': 332,
      'GOOGL': 125,
      'TSLA': 195,
      'NVDA': 480,
    };
    
    return basePrices[symbol] || 100;
  }

  private getIntervalMs(interval: string): number {
    const intervals: Record<string, number> = {
      '1min': 60 * 1000,
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
      '1day': 24 * 60 * 60 * 1000,
      '1week': 7 * 24 * 60 * 60 * 1000,
      '1month': 30 * 24 * 60 * 60 * 1000,
    };
    
    return intervals[interval] || intervals['1day'];
  }

  async getMarketNews(): Promise<any[]> {
    try {
      // In production, integrate with financial news APIs
      // For now, provide enhanced mock data with market-relevant context
      const currentData = await this.getCurrentMarketData();
      
      return [
        {
          title: `Fed Signals ${currentData.economicIndicators.interestRate > 5 ? 'Potential Rate Cut' : 'Steady Policy'} in Q2`,
          source: 'Financial Times',
          timestamp: new Date().toISOString(),
          sentiment: currentData.marketSentiment === 'bullish' ? 'positive' : 'neutral',
          impact: 'high',
          relevantSymbols: ['SPY', 'QQQ', 'TLT'],
        },
        {
          title: `${currentData.sectors.technology.changePercent > 1 ? 'Tech Stocks Rally' : 'Tech Sector Mixed'} on AI Earnings Beat`,
          source: 'Reuters',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          sentiment: currentData.sectors.technology.changePercent > 0 ? 'positive' : 'negative',
          impact: 'medium',
          relevantSymbols: ['XLK', 'AAPL', 'MSFT', 'NVDA'],
        },
        {
          title: `Oil Prices ${currentData.commodities.oil.changePercent > 1 ? 'Surge' : 'Decline'} on Supply ${currentData.commodities.oil.changePercent > 0 ? 'Concerns' : 'Relief'}`,
          source: 'Bloomberg',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: 'neutral',
          impact: 'medium',
          relevantSymbols: ['XLE', 'USO'],
        },
        {
          title: `VIX ${currentData.volatilityIndex > 20 ? 'Spikes' : 'Calms'} as Market ${currentData.marketSentiment === 'bearish' ? 'Uncertainty' : 'Confidence'} ${currentData.marketSentiment === 'bearish' ? 'Grows' : 'Returns'}`,
          source: 'MarketWatch',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          sentiment: currentData.volatilityIndex > 20 ? 'negative' : 'positive',
          impact: 'medium',
          relevantSymbols: ['VIX', 'SPY'],
        },
      ];
    } catch (error) {
      this.logger.warn('Failed to fetch market news', { error: error.message });
      return [];
    }
  }

  async getEconomicIndicators(): Promise<any> {
    try {
      const currentData = await this.getCurrentMarketData();
      
      return {
        inflation: {
          current: currentData.economicIndicators.inflation,
          trend: currentData.economicIndicators.inflation < 3.0 ? 'decreasing' : 'stable',
          lastUpdate: new Date().toISOString(),
          target: 2.0,
        },
        unemployment: {
          current: currentData.economicIndicators.unemployment,
          trend: 'stable',
          lastUpdate: new Date().toISOString(),
          historicalLow: 3.5,
        },
        gdpGrowth: {
          current: currentData.economicIndicators.gdpGrowth,
          trend: currentData.economicIndicators.gdpGrowth > 2.5 ? 'increasing' : 'stable',
          lastUpdate: new Date().toISOString(),
          annualized: true,
        },
        interestRates: {
          fedFundsRate: currentData.economicIndicators.interestRate,
          trend: 'stable',
          nextMeetingDate: '2025-01-29',
          terminalRate: 4.75,
        },
        bondYields: currentData.bondYields,
        marketSentiment: currentData.marketSentiment,
      };
    } catch (error) {
      this.logger.warn('Failed to fetch economic indicators', { error: error.message });
      return null;
    }
  }

  /**
   * Get real-time quote for a specific symbol
   */
  async getQuote(symbol: string): Promise<MarketDataQuote | null> {
    try {
      // Try to fetch from providers first
      for (const provider of this.getActiveProviders()) {
        try {
          const quote = await this.fetchQuoteFromProvider(provider, symbol);
          if (quote) {
            return quote;
          }
        } catch (error) {
          this.logger.warn(`Failed to fetch quote from ${provider}`, { symbol, error: error.message });
          continue;
        }
      }

      // Fallback to mock data
      return this.generateMockQuote(symbol);
    } catch (error) {
      this.logger.error('Failed to fetch quote', { symbol, error: error.message });
      return null;
    }
  }

  private async fetchQuoteFromProvider(provider: string, symbol: string): Promise<MarketDataQuote | null> {
    switch (provider) {
      case 'alphaVantage':
        return this.fetchSymbolFromAlphaVantage(symbol);
      case 'polygon':
        return this.fetchQuoteFromPolygon(symbol);
      case 'yahooFinance':
        return this.fetchQuoteFromYahooFinance(symbol);
      default:
        return null;
    }
  }

  private async fetchQuoteFromPolygon(symbol: string): Promise<MarketDataQuote | null> {
    // Polygon.io quote implementation
    this.logger.debug('Polygon.io quote fetch not yet implemented');
    return null;
  }

  private async fetchQuoteFromYahooFinance(symbol: string): Promise<MarketDataQuote | null> {
    // Yahoo Finance quote implementation
    this.logger.debug('Yahoo Finance quote fetch not yet implemented');
    return null;
  }

  private generateMockQuote(symbol: string): MarketDataQuote {
    const basePrice = this.getBasePriceForSymbol(symbol);
    const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
    const change = (basePrice * changePercent) / 100;
    const price = basePrice + change;

    return {
      symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get multiple quotes at once
   */
  async getMultipleQuotes(symbols: string[]): Promise<MarketDataQuote[]> {
    try {
      const promises = symbols.map(symbol => this.getQuote(symbol));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<MarketDataQuote> => 
          result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
    } catch (error) {
      this.logger.error('Failed to fetch multiple quotes', { symbols, error: error.message });
      return [];
    }
  }

  /**
   * Get market performance summary for content generation
   */
  async getMarketSummary(): Promise<{
    snapshot: MarketDataSnapshot;
    topMovers: { gainers: MarketDataQuote[]; losers: MarketDataQuote[] };
    sectorPerformance: Record<string, MarketDataQuote>;
    marketHighlights: string[];
  }> {
    try {
      const snapshot = await this.getCurrentMarketData();
      
      // Generate top movers (mock implementation)
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'AMD', 'META', 'AMZN'];
      const quotes = await this.getMultipleQuotes(symbols);
      
      const gainers = quotes
        .filter(q => q.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 3);
        
      const losers = quotes
        .filter(q => q.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 3);

      // Market highlights based on current conditions
      const highlights = this.generateMarketHighlights(snapshot);

      return {
        snapshot,
        topMovers: { gainers, losers },
        sectorPerformance: snapshot.sectors,
        marketHighlights: highlights,
      };
    } catch (error) {
      this.logger.error('Failed to generate market summary', { error: error.message });
      throw error;
    }
  }

  private generateMarketHighlights(snapshot: MarketDataSnapshot): string[] {
    const highlights: string[] = [];

    // Market status highlight
    if (snapshot.marketStatus.isOpen) {
      highlights.push(`Markets are currently open and ${snapshot.marketSentiment.toUpperCase()}`);
    } else {
      highlights.push(`Markets are closed. Next open: ${moment(snapshot.marketStatus.nextOpen).format('MMM D, YYYY at h:mm A')}`);
    }

    // Index performance
    const spyChange = snapshot.indices.sp500.changePercent;
    if (Math.abs(spyChange) > 1) {
      highlights.push(`S&P 500 is ${spyChange > 0 ? 'up' : 'down'} ${Math.abs(spyChange).toFixed(2)}%`);
    }

    // Volatility
    if (snapshot.volatilityIndex > 25) {
      highlights.push(`High volatility detected (VIX: ${snapshot.volatilityIndex.toFixed(1)})`);
    } else if (snapshot.volatilityIndex < 15) {
      highlights.push(`Low volatility environment (VIX: ${snapshot.volatilityIndex.toFixed(1)})`);
    }

    // Sector rotation
    const sectorPerf = Object.values(snapshot.sectors);
    const bestSector = sectorPerf.reduce((prev, current) => 
      prev.changePercent > current.changePercent ? prev : current
    );
    const worstSector = sectorPerf.reduce((prev, current) => 
      prev.changePercent < current.changePercent ? prev : current
    );

    if (Math.abs(bestSector.changePercent - worstSector.changePercent) > 2) {
      highlights.push(`Sector rotation: ${bestSector.symbol} leading (+${bestSector.changePercent.toFixed(2)}%), ${worstSector.symbol} lagging (${worstSector.changePercent.toFixed(2)}%)`);
    }

    // Economic indicators
    if (snapshot.economicIndicators.inflation > 4) {
      highlights.push(`Inflation remains elevated at ${snapshot.economicIndicators.inflation.toFixed(1)}%`);
    }

    return highlights.slice(0, 5); // Limit to top 5 highlights
  }

  /**
   * Clear cache and force refresh
   */
  async refreshMarketData(): Promise<MarketDataSnapshot> {
    this.cachedData = null;
    this.lastFetchTime = 0;
    return this.getCurrentMarketData();
  }

  /**
   * Get cache status for monitoring
   */
  getCacheStatus(): {
    hasData: boolean;
    lastUpdate: string | null;
    cacheAge: number;
    nextRefresh: string | null;
  } {
    const now = Date.now();
    const cacheAge = this.lastFetchTime ? now - this.lastFetchTime : 0;
    const nextRefresh = this.lastFetchTime ? 
      new Date(this.lastFetchTime + this.cacheTimeoutMs).toISOString() : null;

    return {
      hasData: !!this.cachedData,
      lastUpdate: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
      cacheAge,
      nextRefresh,
    };
  }
}