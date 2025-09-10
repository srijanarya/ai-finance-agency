import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { MarketData } from "../entities/market-data.entity";
import { CacheService } from "./cache.service";

export interface AggregatedData {
  symbol: string;
  period: "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  averagePrice: number;
  vwap: number;
  trades: number;
  timestamp: Date;
}

export interface MarketStatistics {
  symbol: string;
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  volatility: number;
  momentum: number;
  rsi: number;
  period: string;
  dataPoints: number;
}

export interface MarketTrend {
  symbol: string;
  trend: "bullish" | "bearish" | "neutral";
  strength: number;
  momentum: number;
  support: number;
  resistance: number;
  movingAverage50: number;
  movingAverage200: number;
  goldenCross: boolean;
  deathCross: boolean;
  timestamp: Date;
}

@Injectable()
export class DataAggregationService {
  private readonly logger = new Logger(DataAggregationService.name);
  private aggregationIntervals = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
  };

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    private cacheService: CacheService,
    private eventEmitter: EventEmitter2,
  ) {}

  async aggregateData(
    symbol: string,
    period: "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d",
    startTime?: Date,
    endTime?: Date,
  ): Promise<AggregatedData> {
    try {
      const cacheKey = `aggregate_${symbol}_${period}_${startTime?.getTime() || "latest"}`;

      const cached = await this.cacheService.get<AggregatedData>(cacheKey);
      if (cached) {
        return cached;
      }

      const intervalMs = this.aggregationIntervals[period];
      const now = new Date();
      const start = startTime || new Date(now.getTime() - intervalMs);
      const end = endTime || now;

      const rawData = await this.marketDataRepository.find({
        where: {
          symbol,
          timestamp: Between(start, end),
        },
        order: { timestamp: "ASC" },
      });

      if (rawData.length === 0) {
        throw new Error(
          `No data available for ${symbol} in the specified period`,
        );
      }

      const prices = rawData.map((d) => Number(d.price));
      const volumes = rawData.map((d) => Number(d.volume));

      const aggregated: AggregatedData = {
        symbol,
        period,
        open: prices[0],
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: prices[prices.length - 1],
        volume: volumes.reduce((sum, v) => sum + v, 0),
        averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        vwap: this.calculateVWAP(rawData),
        trades: rawData.length,
        timestamp: end,
      };

      await this.cacheService.setAggregatedData(cacheKey, aggregated);

      this.eventEmitter.emit("market.data.aggregated", {
        symbol,
        period,
        data: aggregated,
      });

      return aggregated;
    } catch (error) {
      this.logger.error(`Error aggregating data for ${symbol}:`, error);
      throw error;
    }
  }

  async getMultiPeriodAggregation(
    symbol: string,
    periods: Array<"1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d">,
  ): Promise<AggregatedData[]> {
    try {
      const results = await Promise.all(
        periods.map((period) => this.aggregateData(symbol, period)),
      );
      return results;
    } catch (error) {
      this.logger.error(
        `Error getting multi-period aggregation for ${symbol}:`,
        error,
      );
      return [];
    }
  }

  async calculateStatistics(
    symbol: string,
    period: number = 24 * 60 * 60 * 1000,
  ): Promise<MarketStatistics> {
    try {
      const cacheKey = `stats_${symbol}_${period}`;

      const cached = await this.cacheService.get<MarketStatistics>(cacheKey);
      if (cached) {
        return cached;
      }

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - period);

      const data = await this.marketDataRepository.find({
        where: {
          symbol,
          timestamp: Between(startTime, endTime),
        },
        order: { timestamp: "ASC" },
      });

      if (data.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }

      const prices = data.map((d) => Number(d.price));
      const returns = this.calculateReturns(prices);

      const stats: MarketStatistics = {
        symbol,
        mean: this.mean(prices),
        median: this.median(prices),
        stdDev: this.standardDeviation(prices),
        variance: this.variance(prices),
        min: Math.min(...prices),
        max: Math.max(...prices),
        percentile25: this.percentile(prices, 25),
        percentile75: this.percentile(prices, 75),
        volatility: this.calculateVolatility(returns),
        momentum: this.calculateMomentum(prices),
        rsi: this.calculateRSI(prices),
        period: `${period / (60 * 60 * 1000)}h`,
        dataPoints: data.length,
      };

      await this.cacheService.setMarketStatistics(cacheKey, stats);

      return stats;
    } catch (error) {
      this.logger.error(`Error calculating statistics for ${symbol}:`, error);
      throw error;
    }
  }

  async analyzeTrend(symbol: string): Promise<MarketTrend> {
    try {
      const cacheKey = `trend_${symbol}`;

      const cached = await this.cacheService.get<MarketTrend>(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await this.marketDataRepository.find({
        where: { symbol },
        order: { timestamp: "DESC" },
        take: 200,
      });

      if (data.length < 50) {
        throw new Error(`Insufficient data for trend analysis of ${symbol}`);
      }

      const prices = data.map((d) => Number(d.price)).reverse();

      const ma50 = this.movingAverage(prices, 50);
      const ma200 = data.length >= 200 ? this.movingAverage(prices, 200) : ma50;

      const currentPrice = prices[prices.length - 1];
      const priceChange = ((currentPrice - prices[0]) / prices[0]) * 100;
      const momentum = this.calculateMomentum(prices);

      let trend: "bullish" | "bearish" | "neutral";
      let strength: number;

      if (currentPrice > ma50 && ma50 > ma200) {
        trend = "bullish";
        strength = Math.min(100, 50 + Math.abs(priceChange));
      } else if (currentPrice < ma50 && ma50 < ma200) {
        trend = "bearish";
        strength = Math.min(100, 50 + Math.abs(priceChange));
      } else {
        trend = "neutral";
        strength = 25 + Math.abs(momentum * 25);
      }

      const { support, resistance } = this.calculateSupportResistance(prices);

      const goldenCross =
        ma50 > ma200 && this.checkCrossover(prices, 50, 200, "golden");
      const deathCross =
        ma50 < ma200 && this.checkCrossover(prices, 50, 200, "death");

      const trendAnalysis: MarketTrend = {
        symbol,
        trend,
        strength,
        momentum,
        support,
        resistance,
        movingAverage50: ma50,
        movingAverage200: ma200,
        goldenCross,
        deathCross,
        timestamp: new Date(),
      };

      await this.cacheService.setTechnicalIndicators(cacheKey, trendAnalysis);

      this.eventEmitter.emit("market.trend.analyzed", {
        symbol,
        trend: trendAnalysis,
      });

      return trendAnalysis;
    } catch (error) {
      this.logger.error(`Error analyzing trend for ${symbol}:`, error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async performScheduledAggregation(): Promise<void> {
    try {
      this.logger.log("Starting scheduled data aggregation...");

      const symbols = await this.getActiveSymbols();

      const aggregationTasks = [];
      const periods: Array<"1m" | "5m" | "15m" | "30m" | "1h"> = [
        "1m",
        "5m",
        "15m",
        "30m",
        "1h",
      ];

      for (const symbol of symbols) {
        for (const period of periods) {
          aggregationTasks.push(this.aggregateData(symbol, period));
        }
      }

      await Promise.allSettled(aggregationTasks);

      this.logger.log("Scheduled data aggregation completed");
    } catch (error) {
      this.logger.error("Error in scheduled aggregation:", error);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async performTrendAnalysis(): Promise<void> {
    try {
      this.logger.log("Starting scheduled trend analysis...");

      const symbols = await this.getActiveSymbols();

      const analysisTasks = symbols.map((symbol) => this.analyzeTrend(symbol));
      const results = await Promise.allSettled(analysisTasks);

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          this.logger.error(
            `Trend analysis failed for ${symbols[index]}:`,
            result.reason,
          );
        }
      });

      this.logger.log("Scheduled trend analysis completed");
    } catch (error) {
      this.logger.error("Error in scheduled trend analysis:", error);
    }
  }

  private calculateVWAP(data: MarketData[]): number {
    let totalVolume = 0;
    let totalValue = 0;

    for (const item of data) {
      const volume = Number(item.volume);
      const price = Number(item.price);
      totalVolume += volume;
      totalValue += price * volume;
    }

    return totalVolume > 0 ? totalValue / totalVolume : 0;
  }

  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private mean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private variance(values: number[]): number {
    const avg = this.mean(values);
    return (
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
    );
  }

  private standardDeviation(values: number[]): number {
    return Math.sqrt(this.variance(values));
  }

  private percentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    return this.standardDeviation(returns) * Math.sqrt(252);
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 10) return 0;
    const recentPrices = prices.slice(-10);
    const olderPrices = prices.slice(-20, -10);
    const recentAvg = this.mean(recentPrices);
    const olderAvg = this.mean(olderPrices);
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const changes = this.calculateReturns(prices);
    const gains = changes.map((c) => (c > 0 ? c : 0));
    const losses = changes.map((c) => (c < 0 ? Math.abs(c) : 0));

    const avgGain = this.mean(gains.slice(-period));
    const avgLoss = this.mean(losses.slice(-period));

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private movingAverage(prices: number[], period: number): number {
    if (prices.length < period) return this.mean(prices);
    return this.mean(prices.slice(-period));
  }

  private calculateSupportResistance(prices: number[]): {
    support: number;
    resistance: number;
  } {
    const recentPrices = prices.slice(-50);
    const min = Math.min(...recentPrices);
    const max = Math.max(...recentPrices);
    const range = max - min;

    return {
      support: min + range * 0.1,
      resistance: max - range * 0.1,
    };
  }

  private checkCrossover(
    prices: number[],
    shortPeriod: number,
    longPeriod: number,
    type: "golden" | "death",
  ): boolean {
    if (prices.length < longPeriod + 5) return false;

    const currentShortMA = this.movingAverage(prices, shortPeriod);
    const currentLongMA = this.movingAverage(prices, longPeriod);
    const previousShortMA = this.movingAverage(
      prices.slice(0, -5),
      shortPeriod,
    );
    const previousLongMA = this.movingAverage(prices.slice(0, -5), longPeriod);

    if (type === "golden") {
      return (
        previousShortMA <= previousLongMA && currentShortMA > currentLongMA
      );
    } else {
      return (
        previousShortMA >= previousLongMA && currentShortMA < currentLongMA
      );
    }
  }

  private async getActiveSymbols(): Promise<string[]> {
    const recentData = await this.marketDataRepository
      .createQueryBuilder("market_data")
      .select("DISTINCT symbol")
      .where("timestamp > :date", {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })
      .getRawMany();

    return recentData.map((d) => d.symbol);
  }

  async getAggregatedStream(
    symbols: string[],
    period: "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d",
  ): Promise<AggregatedData[]> {
    const results = await Promise.all(
      symbols.map((symbol) => this.aggregateData(symbol, period)),
    );
    return results;
  }

  async getMarketOverview(): Promise<{
    topGainers: MarketData[];
    topLosers: MarketData[];
    mostActive: MarketData[];
    marketSentiment: "bullish" | "bearish" | "neutral";
  }> {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

      const latestData = await this.marketDataRepository
        .createQueryBuilder("md")
        .distinctOn(["md.symbol"])
        .where("md.timestamp BETWEEN :start AND :end", {
          start: startTime,
          end: endTime,
        })
        .orderBy("md.symbol")
        .addOrderBy("md.timestamp", "DESC")
        .getMany();

      const sorted = [...latestData].sort(
        (a, b) => (b.changePercent || 0) - (a.changePercent || 0),
      );

      const topGainers = sorted.slice(0, 5);
      const topLosers = sorted.slice(-5).reverse();

      const mostActive = [...latestData]
        .sort((a, b) => Number(b.volume) - Number(a.volume))
        .slice(0, 5);

      const positiveCount = latestData.filter(
        (d) => (d.changePercent || 0) > 0,
      ).length;
      const negativeCount = latestData.filter(
        (d) => (d.changePercent || 0) < 0,
      ).length;

      let marketSentiment: "bullish" | "bearish" | "neutral";
      if (positiveCount > negativeCount * 1.2) {
        marketSentiment = "bullish";
      } else if (negativeCount > positiveCount * 1.2) {
        marketSentiment = "bearish";
      } else {
        marketSentiment = "neutral";
      }

      return {
        topGainers,
        topLosers,
        mostActive,
        marketSentiment,
      };
    } catch (error) {
      this.logger.error("Error getting market overview:", error);
      throw error;
    }
  }
}
