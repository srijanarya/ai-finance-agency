import { Injectable, Logger } from '@nestjs/common';
import { MarketDataProvider, MarketQuote, HistoricalDataPoint, MarketStatus } from '../../interfaces/market-data/market-data.interface';

@Injectable()
export class MockMarketDataService implements MarketDataProvider {
  private readonly logger = new Logger(MockMarketDataService.name);
  
  // Mock data for popular symbols
  private readonly mockSymbols = new Map([
    ['AAPL', { name: 'Apple Inc.', sector: 'Technology', basePrice: 175.00 }],
    ['GOOGL', { name: 'Alphabet Inc.', sector: 'Technology', basePrice: 135.00 }],
    ['MSFT', { name: 'Microsoft Corporation', sector: 'Technology', basePrice: 340.00 }],
    ['TSLA', { name: 'Tesla, Inc.', sector: 'Consumer Cyclical', basePrice: 210.00 }],
    ['AMZN', { name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', basePrice: 145.00 }],
    ['NVDA', { name: 'NVIDIA Corporation', sector: 'Technology', basePrice: 450.00 }],
    ['META', { name: 'Meta Platforms, Inc.', sector: 'Communication Services', basePrice: 320.00 }],
    ['NFLX', { name: 'Netflix, Inc.', sector: 'Communication Services', basePrice: 420.00 }],
    ['JPM', { name: 'JPMorgan Chase & Co.', sector: 'Financial Services', basePrice: 155.00 }],
    ['V', { name: 'Visa Inc.', sector: 'Financial Services', basePrice: 260.00 }],
  ]);

  async getQuote(symbol: string): Promise<MarketQuote> {
    this.logger.log(`Generating mock quote for ${symbol}`);
    
    const symbolData = this.mockSymbols.get(symbol.toUpperCase());
    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found in mock data`);
    }

    const basePrice = symbolData.basePrice;
    
    // Generate realistic price movements
    const volatility = this.getVolatilityForSymbol(symbol);
    const priceChange = (Math.random() - 0.5) * 2 * volatility * basePrice;
    const currentPrice = basePrice + priceChange;
    const previousClose = basePrice + (Math.random() - 0.5) * 0.5 * volatility * basePrice;
    
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    // Generate realistic volume (in millions)
    const baseVolume = this.getBaseVolumeForSymbol(symbol);
    const volumeMultiplier = 0.5 + Math.random() * 1.5; // 0.5x to 2x base volume
    const volume = Math.floor(baseVolume * volumeMultiplier);
    
    // Generate day high/low
    const dayRange = volatility * basePrice * 0.5;
    const dayHigh = currentPrice + Math.random() * dayRange;
    const dayLow = currentPrice - Math.random() * dayRange;

    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(currentPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume,
      marketCap: this.calculateMockMarketCap(symbol, currentPrice),
      previousClose: Math.round(previousClose * 100) / 100,
      dayLow: Math.round(dayLow * 100) / 100,
      dayHigh: Math.round(dayHigh * 100) / 100,
      timestamp: new Date(),
    };
  }

  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
    interval: '1d' | '1h' | '5m' | '1m' = '1d'
  ): Promise<HistoricalDataPoint[]> {
    this.logger.log(`Generating mock historical data for ${symbol} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const symbolData = this.mockSymbols.get(symbol.toUpperCase());
    if (!symbolData) {
      throw new Error(`Symbol ${symbol} not found in mock data`);
    }

    const historicalData: HistoricalDataPoint[] = [];
    const basePrice = symbolData.basePrice;
    const volatility = this.getVolatilityForSymbol(symbol);
    
    // Calculate interval in milliseconds
    const intervalMs = this.getIntervalMs(interval);
    const currentTime = new Date(startDate.getTime());
    
    let lastClose = basePrice;
    
    while (currentTime <= endDate) {
      // Skip weekends for daily data
      if (interval === '1d' && (currentTime.getDay() === 0 || currentTime.getDay() === 6)) {
        currentTime.setTime(currentTime.getTime() + intervalMs);
        continue;
      }

      // Generate OHLC data
      const openPrice = lastClose + (Math.random() - 0.5) * 0.1 * volatility * basePrice;
      const range = volatility * basePrice * 0.02; // 2% daily range
      const high = openPrice + Math.random() * range;
      const low = openPrice - Math.random() * range;
      const close = low + Math.random() * (high - low);
      
      // Ensure OHLC relationships are valid
      const validHigh = Math.max(openPrice, close, high);
      const validLow = Math.min(openPrice, close, low);
      
      const baseVolume = this.getBaseVolumeForSymbol(symbol);
      const volumeMultiplier = 0.3 + Math.random() * 1.4; // 0.3x to 1.7x base volume
      const volume = Math.floor(baseVolume * volumeMultiplier);

      historicalData.push({
        date: new Date(currentTime),
        open: Math.round(openPrice * 100) / 100,
        high: Math.round(validHigh * 100) / 100,
        low: Math.round(validLow * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
        adjustedClose: Math.round(close * 100) / 100, // For simplicity, same as close
      });

      lastClose = close;
      currentTime.setTime(currentTime.getTime() + intervalMs);
    }

    return historicalData;
  }

  async isMarketOpen(): Promise<boolean> {
    // Mock market hours: always open for testing
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const day = easternTime.getDay();
    const hour = easternTime.getHours();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Market hours: 9:30 AM - 4:00 PM ET (simplified to 9-16 for mock)
    return hour >= 9 && hour < 16;
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const isOpen = await this.isMarketOpen();
    
    return {
      isOpen,
      timezone: 'America/New_York',
      marketHours: {
        regular: {
          start: '09:30',
          end: '16:00',
        },
        extended: {
          premarket: {
            start: '04:00',
            end: '09:30',
          },
          afterhours: {
            start: '16:00',
            end: '20:00',
          },
        },
      },
    };
  }

  async validateSymbol(symbol: string): Promise<boolean> {
    return this.mockSymbols.has(symbol.toUpperCase());
  }

  private getVolatilityForSymbol(symbol: string): number {
    // Different volatility for different symbols
    const volatilityMap = new Map([
      ['AAPL', 0.02],   // 2% daily volatility
      ['GOOGL', 0.025], // 2.5%
      ['MSFT', 0.018],  // 1.8%
      ['TSLA', 0.08],   // 8% (high volatility)
      ['AMZN', 0.03],   // 3%
      ['NVDA', 0.06],   // 6% (high volatility)
      ['META', 0.04],   // 4%
      ['NFLX', 0.05],   // 5%
      ['JPM', 0.025],   // 2.5%
      ['V', 0.02],      // 2%
    ]);
    
    return volatilityMap.get(symbol.toUpperCase()) || 0.03; // Default 3%
  }

  private getBaseVolumeForSymbol(symbol: string): number {
    // Base volume in number of shares (millions)
    const volumeMap = new Map([
      ['AAPL', 50_000_000],   // 50M shares
      ['GOOGL', 25_000_000],  // 25M shares
      ['MSFT', 35_000_000],   // 35M shares
      ['TSLA', 80_000_000],   // 80M shares (high volume)
      ['AMZN', 30_000_000],   // 30M shares
      ['NVDA', 40_000_000],   // 40M shares
      ['META', 20_000_000],   // 20M shares
      ['NFLX', 10_000_000],   // 10M shares
      ['JPM', 15_000_000],    // 15M shares
      ['V', 12_000_000],      // 12M shares
    ]);
    
    return volumeMap.get(symbol.toUpperCase()) || 20_000_000; // Default 20M
  }

  private calculateMockMarketCap(symbol: string, price: number): number {
    // Approximate shares outstanding for market cap calculation
    const sharesOutstandingMap = new Map([
      ['AAPL', 15_500_000_000],   // 15.5B shares
      ['GOOGL', 12_800_000_000],  // 12.8B shares  
      ['MSFT', 7_400_000_000],    // 7.4B shares
      ['TSLA', 3_200_000_000],    // 3.2B shares
      ['AMZN', 10_700_000_000],   // 10.7B shares
      ['NVDA', 24_600_000_000],   // 24.6B shares
      ['META', 2_600_000_000],    // 2.6B shares
      ['NFLX', 440_000_000],      // 440M shares
      ['JPM', 2_900_000_000],     // 2.9B shares
      ['V', 2_000_000_000],       // 2B shares
    ]);
    
    const sharesOutstanding = sharesOutstandingMap.get(symbol.toUpperCase()) || 1_000_000_000;
    return Math.floor(price * sharesOutstanding);
  }

  private getIntervalMs(interval: string): number {
    switch (interval) {
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }
}