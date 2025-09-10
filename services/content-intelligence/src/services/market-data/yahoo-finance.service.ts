import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MarketDataProvider, MarketQuote, HistoricalDataPoint, MarketStatus } from '../../interfaces/market-data/market-data.interface';

@Injectable()
export class YahooFinanceService implements MarketDataProvider {
  private readonly logger = new Logger(YahooFinanceService.name);
  private readonly baseUrl: string;
  private readonly rateLimit: number;
  private requestCount = 0;
  private lastResetTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('ai.yahooFinance.baseUrl', 'https://query1.finance.yahoo.com/v8/finance');
    this.rateLimit = this.configService.get<number>('ai.yahooFinance.rateLimit', 1000); // Higher limit for Yahoo Finance
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    await this.checkRateLimit();

    try {
      const url = `${this.baseUrl}/chart/${symbol}?interval=1d&range=1d&includePrePost=true`;
      
      this.logger.log(`Fetching quote for ${symbol} from Yahoo Finance`);
      const response = await firstValueFrom(this.httpService.get(url));
      
      const result = response.data.chart.result[0];
      if (!result) {
        throw new Error(`No quote data found for symbol: ${symbol}`);
      }

      const meta = result.meta;
      const quote = result.indicators.quote[0];
      const timestamp = result.timestamp[result.timestamp.length - 1];
      const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
      const previousClose = meta.previousClose;

      return {
        symbol: meta.symbol,
        price: currentPrice,
        change: currentPrice - previousClose,
        changePercent: ((currentPrice - previousClose) / previousClose) * 100,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap,
        previousClose,
        dayLow: meta.regularMarketDayLow || Math.min(...quote.low.filter(Boolean)),
        dayHigh: meta.regularMarketDayHigh || Math.max(...quote.high.filter(Boolean)),
        timestamp: new Date(timestamp * 1000),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch quote for ${symbol}:`, error.message);
      throw new Error(`Yahoo Finance API error: ${error.message}`);
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
      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);
      
      const url = `${this.baseUrl}/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&includeAdjustedClose=true`;

      this.logger.log(`Fetching historical data for ${symbol} from Yahoo Finance`);
      const response = await firstValueFrom(this.httpService.get(url));
      
      const result = response.data.chart.result[0];
      if (!result) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];
      const adjClose = result.indicators.adjclose?.[0]?.adjclose;

      const historicalData: HistoricalDataPoint[] = [];
      
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] !== null && quote.high[i] !== null && 
            quote.low[i] !== null && quote.close[i] !== null) {
          historicalData.push({
            date: new Date(timestamps[i] * 1000),
            open: quote.open[i],
            high: quote.high[i],
            low: quote.low[i],
            close: quote.close[i],
            volume: quote.volume[i] || 0,
            adjustedClose: adjClose?.[i] || undefined,
          });
        }
      }

      return historicalData;
    } catch (error) {
      this.logger.error(`Failed to fetch historical data for ${symbol}:`, error.message);
      throw new Error(`Yahoo Finance API error: ${error.message}`);
    }
  }

  async isMarketOpen(): Promise<boolean> {
    try {
      // Use SPY as a proxy for market status
      const url = `${this.baseUrl}/chart/SPY?interval=1d&range=1d`;
      const response = await firstValueFrom(this.httpService.get(url));
      
      const result = response.data.chart.result[0];
      const meta = result.meta;
      
      return meta.currentTradingPeriod?.regular?.gmtoffset !== undefined &&
             Date.now() >= meta.currentTradingPeriod.regular.start * 1000 &&
             Date.now() < meta.currentTradingPeriod.regular.end * 1000;
    } catch {
      // Fallback to basic time-based check
      return this.basicMarketHoursCheck();
    }
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const isOpen = await this.isMarketOpen();
    
    // Calculate next open/close times
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    let nextOpenTime: Date | undefined;
    let nextCloseTime: Date | undefined;

    if (isOpen) {
      // Market is open, calculate next close time
      const closeToday = new Date(easternTime);
      closeToday.setHours(16, 0, 0, 0);
      nextCloseTime = new Date(closeToday.toLocaleString("en-US", {timeZone: "UTC"}));
    } else {
      // Market is closed, calculate next open time
      const openNext = new Date(easternTime);
      openNext.setHours(9, 30, 0, 0);
      
      // If it's already past today's open time, move to next weekday
      if (easternTime.getHours() >= 16 || easternTime.getDay() === 0 || easternTime.getDay() === 6) {
        do {
          openNext.setDate(openNext.getDate() + 1);
        } while (openNext.getDay() === 0 || openNext.getDay() === 6);
      }
      
      nextOpenTime = new Date(openNext.toLocaleString("en-US", {timeZone: "UTC"}));
    }
    
    return {
      isOpen,
      nextOpenTime,
      nextCloseTime,
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

  private basicMarketHoursCheck(): boolean {
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