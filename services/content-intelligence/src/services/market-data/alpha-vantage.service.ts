import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, MarketQuote, HistoricalDataPoint, MarketStatus } from '../../interfaces/market-data/market-data.interface';

@Injectable()
export class AlphaVantageService implements MarketDataProvider {
  private readonly logger = new Logger(AlphaVantageService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly rateLimit: number;
  private requestCount = 0;
  private lastResetTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('ai.alphaVantage.apiKey', 'demo');
    this.baseUrl = this.configService.get<string>('ai.alphaVantage.baseUrl', 'https://www.alphavantage.co/query');
    this.rateLimit = this.configService.get<number>('ai.alphaVantage.rateLimit', 5); // 5 requests per minute for free tier
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    await this.checkRateLimit();

    try {
      const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;
      
      this.logger.log(`Fetching quote for ${symbol} from Alpha Vantage`);
      const response = await firstValueFrom(this.httpService.get(url));
      
      const data = response.data['Global Quote'];
      if (!data) {
        throw new Error(`No quote data found for symbol: ${symbol}`);
      }

      return {
        symbol: data['01. symbol'],
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume']),
        previousClose: parseFloat(data['08. previous close']),
        dayLow: parseFloat(data['04. low']),
        dayHigh: parseFloat(data['03. high']),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch quote for ${symbol}:`, error.message);
      throw new Error(`Alpha Vantage API error: ${error.message}`);
    }
  }

  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
    interval: '1d' | '1h' | '5m' | '1m' = '1d'
  ): Promise<HistoricalDataPoint[]> {
    await this.checkRateLimit();

    try {
      let functionName: string;
      switch (interval) {
        case '1d':
          functionName = 'TIME_SERIES_DAILY_ADJUSTED';
          break;
        case '1h':
          functionName = 'TIME_SERIES_INTRADAY';
          break;
        case '5m':
        case '1m':
          functionName = 'TIME_SERIES_INTRADAY';
          break;
        default:
          functionName = 'TIME_SERIES_DAILY_ADJUSTED';
      }

      let url = `${this.baseUrl}?function=${functionName}&symbol=${symbol}&apikey=${this.apiKey}`;
      
      if (functionName === 'TIME_SERIES_INTRADAY') {
        url += `&interval=${interval}&outputsize=full`;
      } else {
        url += '&outputsize=full';
      }

      this.logger.log(`Fetching historical data for ${symbol} from Alpha Vantage`);
      const response = await firstValueFrom(this.httpService.get(url));
      
      let timeSeriesData: any;
      if (functionName === 'TIME_SERIES_DAILY_ADJUSTED') {
        timeSeriesData = response.data['Time Series (Daily)'];
      } else {
        timeSeriesData = response.data[`Time Series (${interval})`];
      }

      if (!timeSeriesData) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const historicalData: HistoricalDataPoint[] = [];
      
      for (const [dateStr, data] of Object.entries(timeSeriesData)) {
        const date = new Date(dateStr);
        if (date >= startDate && date <= endDate) {
          historicalData.push({
            date,
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume']),
            adjustedClose: data['5. adjusted close'] ? parseFloat(data['5. adjusted close']) : undefined,
          });
        }
      }

      return historicalData.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      this.logger.error(`Failed to fetch historical data for ${symbol}:`, error.message);
      throw new Error(`Alpha Vantage API error: ${error.message}`);
    }
  }

  async isMarketOpen(): Promise<boolean> {
    // Alpha Vantage doesn't provide real-time market status
    // Implement basic US market hours check (9:30 AM - 4:00 PM ET)
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const day = easternTime.getDay();
    const hour = easternTime.getHours();
    const minute = easternTime.getMinutes();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Market hours: 9:30 AM - 4:00 PM ET
    const openTime = 9 * 60 + 30; // 9:30 AM in minutes
    const closeTime = 16 * 60; // 4:00 PM in minutes
    const currentTime = hour * 60 + minute;

    return currentTime >= openTime && currentTime < closeTime;
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
    try {
      await this.getQuote(symbol);
      return true;
    } catch {
      return false;
    }
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeWindow = 60 * 1000; // 1 minute

    // Reset counter if time window has passed
    if (now - this.lastResetTime > timeWindow) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if we've exceeded rate limit
    if (this.requestCount >= this.rateLimit) {
      const waitTime = timeWindow - (now - this.lastResetTime);
      this.logger.warn(`Rate limit reached. Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }

    this.requestCount++;
  }
}