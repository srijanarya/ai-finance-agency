import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MarketDataSnapshot {
  timestamp: string;
  indices: {
    sp500: { price: number; change: number; changePercent: number };
    nasdaq: { price: number; change: number; changePercent: number };
    dow: { price: number; change: number; changePercent: number };
  };
  currencies: {
    usdeur: { rate: number; change: number; changePercent: number };
    usdgbp: { rate: number; change: number; changePercent: number };
    usdjpy: { rate: number; change: number; changePercent: number };
  };
  commodities: {
    gold: { price: number; change: number; changePercent: number };
    oil: { price: number; change: number; changePercent: number };
    bitcoin: { price: number; change: number; changePercent: number };
  };
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  volatilityIndex: number;
  bondYields: {
    us10y: number;
    us2y: number;
  };
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private cachedData: MarketDataSnapshot | null = null;
  private lastFetchTime = 0;
  private readonly cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getCurrentMarketData(): Promise<MarketDataSnapshot> {
    const now = Date.now();

    // Return cached data if still fresh
    if (this.cachedData && (now - this.lastFetchTime) < this.cacheTimeoutMs) {
      return this.cachedData;
    }

    try {
      // In a real implementation, you would fetch from multiple data providers
      // For now, we'll provide a mock implementation with realistic data structure
      const marketData: MarketDataSnapshot = await this.fetchMarketData();

      this.cachedData = marketData;
      this.lastFetchTime = now;

      this.logger.log('Market data refreshed successfully');
      return marketData;
    } catch (error) {
      this.logger.warn('Failed to fetch market data, returning cached or default data', {
        error: error.message,
      });

      // Return cached data or default values
      return this.cachedData || this.getDefaultMarketData();
    }
  }

  private async fetchMarketData(): Promise<MarketDataSnapshot> {
    // This is a mock implementation
    // In production, you would integrate with real market data providers like:
    // - Alpha Vantage
    // - Yahoo Finance API
    // - IEX Cloud
    // - Polygon.io
    // - Bloomberg API
    // - Quandl

    return {
      timestamp: new Date().toISOString(),
      indices: {
        sp500: { price: 4150.48, change: 15.23, changePercent: 0.37 },
        nasdaq: { price: 12485.73, change: -42.17, changePercent: -0.34 },
        dow: { price: 33745.69, change: 8.91, changePercent: 0.03 },
      },
      currencies: {
        usdeur: { rate: 0.8745, change: -0.0023, changePercent: -0.26 },
        usdgbp: { rate: 0.7834, change: 0.0012, changePercent: 0.15 },
        usdjpy: { rate: 148.73, change: 0.45, changePercent: 0.30 },
      },
      commodities: {
        gold: { price: 1945.23, change: -5.47, changePercent: -0.28 },
        oil: { price: 78.42, change: 1.23, changePercent: 1.59 },
        bitcoin: { price: 42150.30, change: 892.45, changePercent: 2.16 },
      },
      marketSentiment: this.calculateMarketSentiment(),
      volatilityIndex: 18.45,
      bondYields: {
        us10y: 4.23,
        us2y: 4.87,
      },
    };
  }

  private getDefaultMarketData(): MarketDataSnapshot {
    return {
      timestamp: new Date().toISOString(),
      indices: {
        sp500: { price: 4100.00, change: 0, changePercent: 0 },
        nasdaq: { price: 12400.00, change: 0, changePercent: 0 },
        dow: { price: 33700.00, change: 0, changePercent: 0 },
      },
      currencies: {
        usdeur: { rate: 0.87, change: 0, changePercent: 0 },
        usdgbp: { rate: 0.78, change: 0, changePercent: 0 },
        usdjpy: { rate: 148.50, change: 0, changePercent: 0 },
      },
      commodities: {
        gold: { price: 1950.00, change: 0, changePercent: 0 },
        oil: { price: 78.00, change: 0, changePercent: 0 },
        bitcoin: { price: 42000.00, change: 0, changePercent: 0 },
      },
      marketSentiment: 'neutral',
      volatilityIndex: 20.0,
      bondYields: {
        us10y: 4.25,
        us2y: 4.90,
      },
    };
  }

  private calculateMarketSentiment(): 'bullish' | 'bearish' | 'neutral' {
    // Simple sentiment calculation based on major indices performance
    // In production, this would be more sophisticated
    const random = Math.random();
    if (random < 0.3) return 'bearish';
    if (random < 0.7) return 'neutral';
    return 'bullish';
  }

  async getHistoricalData(
    symbol: string,
    period: string = '1month',
  ): Promise<any[]> {
    try {
      // Mock historical data
      // In production, fetch from market data provider
      return this.generateMockHistoricalData(symbol, period);
    } catch (error) {
      this.logger.warn('Failed to fetch historical data', {
        symbol,
        period,
        error: error.message,
      });
      return [];
    }
  }

  private generateMockHistoricalData(symbol: string, period: string): any[] {
    // Generate mock historical data for content context
    const dataPoints = period === '1day' ? 24 : period === '1week' ? 7 : 30;
    const data: any[] = [];
    
    let basePrice = 100;
    for (let i = 0; i < dataPoints; i++) {
      const change = (Math.random() - 0.5) * 5; // Random change up to 2.5%
      basePrice += change;
      
      data.push({
        timestamp: new Date(Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000).toISOString(),
        price: Math.round(basePrice * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });
    }

    return data;
  }

  async getMarketNews(): Promise<any[]> {
    try {
      // In production, integrate with financial news APIs
      return [
        {
          title: 'Fed Signals Potential Rate Cut in Q2',
          source: 'Financial Times',
          timestamp: new Date().toISOString(),
          sentiment: 'positive',
          impact: 'high',
        },
        {
          title: 'Tech Stocks Rally on AI Earnings Beat',
          source: 'Reuters',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          sentiment: 'positive',
          impact: 'medium',
        },
        {
          title: 'Oil Prices Surge on Supply Concerns',
          source: 'Bloomberg',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sentiment: 'neutral',
          impact: 'medium',
        },
      ];
    } catch (error) {
      this.logger.warn('Failed to fetch market news', { error: error.message });
      return [];
    }
  }

  async getEconomicIndicators(): Promise<any> {
    try {
      return {
        inflation: {
          current: 3.2,
          trend: 'decreasing',
          lastUpdate: new Date().toISOString(),
        },
        unemployment: {
          current: 3.8,
          trend: 'stable',
          lastUpdate: new Date().toISOString(),
        },
        gdpGrowth: {
          current: 2.4,
          trend: 'increasing',
          lastUpdate: new Date().toISOString(),
        },
        interestRates: {
          fedFundsRate: 5.25,
          trend: 'stable',
          nextMeetingDate: '2024-12-18',
        },
      };
    } catch (error) {
      this.logger.warn('Failed to fetch economic indicators', { error: error.message });
      return null;
    }
  }
}