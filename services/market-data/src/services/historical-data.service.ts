import { Injectable, Logger, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import yahooFinance from "yahoo-finance2";

import {
  HistoricalData,
  TimeInterval,
} from "../entities/historical-data.entity";
import { DataSource } from "../entities/market-data.entity";

export interface HistoricalDataQuery {
  symbol: string;
  interval: TimeInterval;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface CandleData {
  symbol: string;
  interval: TimeInterval;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
  adjustedClose?: number;
}

@Injectable()
export class HistoricalDataService {
  private readonly logger = new Logger(HistoricalDataService.name);

  constructor(
    @InjectRepository(HistoricalData)
    private historicalDataRepository: Repository<HistoricalData>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async getHistoricalData(
    query: HistoricalDataQuery,
  ): Promise<HistoricalData[]> {
    try {
      const cacheKey = `historical_${query.symbol}_${query.interval}_${query.startDate}_${query.endDate}_${query.limit}`;

      // Check cache first
      const cached = await this.cacheManager.get<HistoricalData[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const whereConditions: any = {
        symbol: query.symbol.toUpperCase(),
        interval: query.interval,
      };

      if (query.startDate || query.endDate) {
        whereConditions.timestamp = Between(
          query.startDate || new Date("1900-01-01"),
          query.endDate || new Date(),
        );
      }

      const data = await this.historicalDataRepository.find({
        where: whereConditions,
        order: { timestamp: "DESC" },
        take: query.limit || 1000,
      });

      // Cache for 5 minutes for recent data, longer for older data
      const isRecent =
        !query.endDate ||
        query.endDate > new Date(Date.now() - 24 * 60 * 60 * 1000);
      const ttl = isRecent ? 300000 : 3600000; // 5 min or 1 hour

      await this.cacheManager.set(cacheKey, data, ttl);

      return data;
    } catch (error) {
      this.logger.error("Error getting historical data:", error);
      throw error;
    }
  }

  async saveHistoricalData(
    candles: CandleData[],
    source: DataSource,
  ): Promise<HistoricalData[]> {
    try {
      const entities = candles.map((candle) =>
        this.historicalDataRepository.create({
          symbol: candle.symbol.toUpperCase(),
          interval: candle.interval,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          adjustedClose: candle.adjustedClose,
          volume: candle.volume,
          timestamp: candle.timestamp,
          source,
        }),
      );

      // Use upsert to handle duplicates
      const savedData = await this.historicalDataRepository.save(entities);

      // Clear relevant caches
      await this.clearHistoricalDataCache(
        candles[0]?.symbol,
        candles[0]?.interval,
      );

      return savedData;
    } catch (error) {
      this.logger.error("Error saving historical data:", error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async fetchDailyHistoricalData(): Promise<void> {
    try {
      const symbols = await this.getActiveSymbols();

      for (const symbol of symbols) {
        await this.fetchAndSaveHistoricalData(symbol, TimeInterval.ONE_DAY);
      }
    } catch (error) {
      this.logger.error(
        "Error in scheduled daily historical data fetch:",
        error,
      );
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchMinuteHistoricalData(): Promise<void> {
    try {
      const symbols = await this.getActiveSymbols();

      for (const symbol of symbols) {
        await this.fetchAndSaveHistoricalData(symbol, TimeInterval.ONE_MINUTE);
      }
    } catch (error) {
      this.logger.error(
        "Error in scheduled minute historical data fetch:",
        error,
      );
    }
  }

  private async fetchAndSaveHistoricalData(
    symbol: string,
    interval: TimeInterval,
    days: number = 1,
  ): Promise<void> {
    try {
      // Try Yahoo Finance first
      let data = await this.fetchHistoricalFromYahoo(symbol, interval, days);
      let source = DataSource.YAHOO_FINANCE;

      if (!data || data.length === 0) {
        // Fallback to Alpha Vantage
        data = await this.fetchHistoricalFromAlphaVantage(
          symbol,
          interval,
          days,
        );
        source = DataSource.ALPHA_VANTAGE;
      }

      if (data && data.length > 0) {
        await this.saveHistoricalData(data, source);
        this.logger.debug(
          `Fetched ${data.length} historical data points for ${symbol} (${interval})`,
        );
      }
    } catch (error) {
      this.logger.error(`Error fetching historical data for ${symbol}:`, error);
    }
  }

  private async fetchHistoricalFromYahoo(
    symbol: string,
    interval: TimeInterval,
    days: number,
  ): Promise<CandleData[]> {
    try {
      const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const period2 = new Date();

      // Map our interval to Yahoo Finance interval
      const yahooInterval = this.mapToYahooInterval(interval);

      const result = await yahooFinance.historical(symbol, {
        period1,
        period2,
        interval: yahooInterval as any,
      });

      return result.map((item) => ({
        symbol,
        interval,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume || 0,
        timestamp: item.date,
        adjustedClose: item.adjClose,
      }));
    } catch (error) {
      this.logger.debug(
        `Yahoo Finance historical error for ${symbol}:`,
        error.message,
      );
      return [];
    }
  }

  private async fetchHistoricalFromAlphaVantage(
    symbol: string,
    interval: TimeInterval,
    days: number,
  ): Promise<CandleData[]> {
    try {
      const apiKey = this.configService.get("ALPHA_VANTAGE_API_KEY");
      if (!apiKey) return [];

      let functionName = "TIME_SERIES_DAILY";
      let intervalParam = "";

      if (interval === TimeInterval.ONE_MINUTE) {
        functionName = "TIME_SERIES_INTRADAY";
        intervalParam = "&interval=1min";
      } else if (interval === TimeInterval.FIVE_MINUTES) {
        functionName = "TIME_SERIES_INTRADAY";
        intervalParam = "&interval=5min";
      } else if (interval === TimeInterval.FIFTEEN_MINUTES) {
        functionName = "TIME_SERIES_INTRADAY";
        intervalParam = "&interval=15min";
      } else if (interval === TimeInterval.THIRTY_MINUTES) {
        functionName = "TIME_SERIES_INTRADAY";
        intervalParam = "&interval=30min";
      } else if (interval === TimeInterval.ONE_HOUR) {
        functionName = "TIME_SERIES_INTRADAY";
        intervalParam = "&interval=60min";
      }

      const response = await axios.get(
        `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}${intervalParam}&apikey=${apiKey}`,
      );

      const timeSeries =
        response.data["Time Series (Daily)"] ||
        response.data["Time Series (1min)"] ||
        response.data["Time Series (5min)"] ||
        response.data["Time Series (15min)"] ||
        response.data["Time Series (30min)"] ||
        response.data["Time Series (60min)"];

      if (!timeSeries) return [];

      const candles: CandleData[] = [];

      for (const [timestamp, data] of Object.entries(timeSeries)) {
        candles.push({
          symbol,
          interval,
          open: parseFloat(data["1. open"]),
          high: parseFloat(data["2. high"]),
          low: parseFloat(data["3. low"]),
          close: parseFloat(data["4. close"]),
          volume: parseInt(data["5. volume"]),
          timestamp: new Date(timestamp),
          adjustedClose: data["5. adjusted close"]
            ? parseFloat(data["5. adjusted close"])
            : undefined,
        });
      }

      return candles.slice(0, days * 24 * 60); // Limit based on days requested
    } catch (error) {
      this.logger.debug(
        `Alpha Vantage historical error for ${symbol}:`,
        error.message,
      );
      return [];
    }
  }

  private mapToYahooInterval(interval: TimeInterval): string {
    const mapping = {
      [TimeInterval.ONE_MINUTE]: "1m",
      [TimeInterval.FIVE_MINUTES]: "5m",
      [TimeInterval.FIFTEEN_MINUTES]: "15m",
      [TimeInterval.THIRTY_MINUTES]: "30m",
      [TimeInterval.ONE_HOUR]: "1h",
      [TimeInterval.ONE_DAY]: "1d",
      [TimeInterval.ONE_WEEK]: "1wk",
      [TimeInterval.ONE_MONTH]: "1mo",
    };

    return mapping[interval] || "1d";
  }

  private async getActiveSymbols(): Promise<string[]> {
    // Get list of symbols that need historical data updates
    return ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]; // Default symbols
  }

  private async clearHistoricalDataCache(
    symbol: string,
    interval: TimeInterval,
  ): Promise<void> {
    try {
      // Clear all cached historical data for this symbol and interval
      const pattern = `historical_${symbol}_${interval}_*`;
      // Note: This is a simplified cache clearing - implement based on your cache manager capabilities
      this.logger.debug(`Clearing cache for pattern: ${pattern}`);
    } catch (error) {
      this.logger.error("Error clearing historical data cache:", error);
    }
  }

  async getOHLCData(
    symbol: string,
    interval: TimeInterval,
    startDate?: Date,
    endDate?: Date,
    limit?: number,
  ): Promise<HistoricalData[]> {
    return this.getHistoricalData({
      symbol,
      interval,
      startDate,
      endDate,
      limit,
    });
  }

  async getVolumeProfile(
    symbol: string,
    interval: TimeInterval,
    days: number = 30,
  ): Promise<{ price: number; volume: number }[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const data = await this.getHistoricalData({
        symbol,
        interval,
        startDate,
      });

      // Group by price ranges and sum volumes
      const volumeProfile = new Map<number, number>();

      data.forEach((candle) => {
        // Round price to nearest cent for grouping
        const roundedPrice = Math.round(candle.close * 100) / 100;
        const currentVolume = volumeProfile.get(roundedPrice) || 0;
        volumeProfile.set(roundedPrice, currentVolume + Number(candle.volume));
      });

      return Array.from(volumeProfile.entries())
        .map(([price, volume]) => ({ price, volume }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 100); // Top 100 price levels
    } catch (error) {
      this.logger.error("Error getting volume profile:", error);
      return [];
    }
  }
}
