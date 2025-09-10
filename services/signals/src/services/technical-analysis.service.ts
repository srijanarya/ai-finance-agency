import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketData } from '../entities/market-data.entity';
import * as TI from 'technicalindicators';

interface TechnicalIndicators {
  sma?: { [period: string]: number };
  ema?: { [period: string]: number };
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger?: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr?: number;
  adx?: number;
  stochastic?: {
    k: number;
    d: number;
  };
  williamsR?: number;
  cci?: number;
  mfi?: number;
}

@Injectable()
export class TechnicalAnalysisService {
  private readonly logger = new Logger(TechnicalAnalysisService.name);

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
  ) {}

  async calculateIndicators(
    symbol: string,
    timestamp: Date,
    timeFrame: string = '5min',
    lookbackPeriods: number = 200,
  ): Promise<TechnicalIndicators> {
    const historicalData = await this.getHistoricalData(
      symbol,
      timeFrame,
      lookbackPeriods,
    );

    if (historicalData.length < 20) {
      this.logger.warn(`Insufficient data for ${symbol} technical analysis`);
      return {};
    }

    const closes = historicalData.map((d) => d.close);
    const highs = historicalData.map((d) => d.high);
    const lows = historicalData.map((d) => d.low);
    const volumes = historicalData.map((d) => d.volume);

    const indicators: TechnicalIndicators = {};

    try {
      // Simple Moving Averages
      indicators.sma = {
        '20': this.calculateSMA(closes, 20),
        '50': this.calculateSMA(closes, 50),
        '100': this.calculateSMA(closes, 100),
        '200': this.calculateSMA(closes, 200),
      };

      // Exponential Moving Averages
      indicators.ema = {
        '12': this.calculateEMA(closes, 12),
        '26': this.calculateEMA(closes, 26),
        '50': this.calculateEMA(closes, 50),
        '200': this.calculateEMA(closes, 200),
      };

      // RSI (Relative Strength Index)
      indicators.rsi = this.calculateRSI(closes, 14);

      // MACD (Moving Average Convergence Divergence)
      indicators.macd = this.calculateMACD(closes);

      // Bollinger Bands
      indicators.bollinger = this.calculateBollingerBands(closes, 20, 2);

      // Average True Range
      indicators.atr = this.calculateATR(highs, lows, closes, 14);

      // ADX (Average Directional Index)
      indicators.adx = this.calculateADX(highs, lows, closes, 14);

      // Stochastic Oscillator
      indicators.stochastic = this.calculateStochastic(
        highs,
        lows,
        closes,
        14,
        3,
      );

      // Williams %R
      indicators.williamsR = this.calculateWilliamsR(highs, lows, closes, 14);

      // Commodity Channel Index
      indicators.cci = this.calculateCCI(highs, lows, closes, 20);

      // Money Flow Index
      if (volumes.length >= 14) {
        indicators.mfi = this.calculateMFI(highs, lows, closes, volumes, 14);
      }
    } catch (error) {
      this.logger.error(`Error calculating indicators for ${symbol}:`, error);
    }

    return indicators;
  }

  private async getHistoricalData(
    symbol: string,
    timeFrame: string,
    periods: number,
  ): Promise<MarketData[]> {
    return this.marketDataRepository
      .find({
        where: { symbol, timeFrame },
        order: { timestamp: 'DESC' },
        take: periods,
      })
      .then((data) => data.reverse()); // Reverse to get chronological order
  }

  private calculateSMA(closes: number[], period: number): number | null {
    if (closes.length < period) return null;

    const recentCloses = closes.slice(-period);
    const sum = recentCloses.reduce((acc, val) => acc + val, 0);
    return sum / period;
  }

  private calculateEMA(closes: number[], period: number): number | null {
    if (closes.length < period) return null;

    const emaData = TI.EMA.calculate({
      values: closes,
      period: period,
    });

    return emaData.length > 0 ? emaData[emaData.length - 1] : null;
  }

  private calculateRSI(closes: number[], period: number = 14): number | null {
    if (closes.length < period + 1) return null;

    const rsiData = TI.RSI.calculate({
      values: closes,
      period: period,
    });

    return rsiData.length > 0 ? rsiData[rsiData.length - 1] : null;
  }

  private calculateMACD(
    closes: number[],
  ): { macd: number; signal: number; histogram: number } | null {
    if (closes.length < 35) return null; // Need at least 35 periods for MACD

    const macdData = TI.MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });

    if (macdData.length === 0) return null;

    const latest = macdData[macdData.length - 1];
    return {
      macd: latest.MACD,
      signal: latest.signal,
      histogram: latest.histogram,
    };
  }

  private calculateBollingerBands(
    closes: number[],
    period: number = 20,
    stdDev: number = 2,
  ): { upper: number; middle: number; lower: number } | null {
    if (closes.length < period) return null;

    const bbData = TI.BollingerBands.calculate({
      values: closes,
      period: period,
      stdDev: stdDev,
    });

    if (bbData.length === 0) return null;

    const latest = bbData[bbData.length - 1];
    return {
      upper: latest.upper,
      middle: latest.middle,
      lower: latest.lower,
    };
  }

  private calculateATR(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14,
  ): number | null {
    if (highs.length < period + 1) return null;

    const atrData = TI.ATR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period,
    });

    return atrData.length > 0 ? atrData[atrData.length - 1] : null;
  }

  private calculateADX(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14,
  ): number | null {
    if (highs.length < period * 2) return null;

    const adxData = TI.ADX.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period,
    });

    return adxData.length > 0 ? (adxData[adxData.length - 1] as any).adx : null;
  }

  private calculateStochastic(
    highs: number[],
    lows: number[],
    closes: number[],
    kPeriod: number = 14,
    dPeriod: number = 3,
  ): { k: number; d: number } | null {
    if (highs.length < kPeriod) return null;

    const stochData = TI.Stochastic.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: kPeriod,
      signalPeriod: dPeriod,
    });

    if (stochData.length === 0) return null;

    const latest = stochData[stochData.length - 1];
    return {
      k: latest.k,
      d: latest.d,
    };
  }

  private calculateWilliamsR(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14,
  ): number | null {
    if (highs.length < period) return null;

    const williamsData = TI.WilliamsR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period,
    });

    return williamsData.length > 0
      ? williamsData[williamsData.length - 1]
      : null;
  }

  private calculateCCI(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 20,
  ): number | null {
    if (highs.length < period) return null;

    const cciData = TI.CCI.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: period,
    });

    return cciData.length > 0 ? cciData[cciData.length - 1] : null;
  }

  private calculateMFI(
    highs: number[],
    lows: number[],
    closes: number[],
    volumes: number[],
    period: number = 14,
  ): number | null {
    if (highs.length < period) return null;

    const mfiData = TI.MFI.calculate({
      high: highs,
      low: lows,
      close: closes,
      volume: volumes,
      period: period,
    });

    return mfiData.length > 0 ? mfiData[mfiData.length - 1] : null;
  }

  // Pattern detection methods that were missing
  async detectPricePatterns(
    symbol: string,
    timeFrame: string = '1d',
    lookbackPeriods: number = 50,
  ): Promise<string[]> {
    const historicalData = await this.getHistoricalData(
      symbol,
      timeFrame,
      lookbackPeriods,
    );

    if (historicalData.length < 20) return [];

    const patterns: string[] = [];
    const closes = historicalData.map((d) => d.close);

    // Simple trend detection
    if (this.isUptrend(closes.slice(-20))) {
      patterns.push('UPTREND');
    }

    if (this.isDowntrend(closes.slice(-20))) {
      patterns.push('DOWNTREND');
    }

    return patterns;
  }

  async calculateVolatilityMetrics(
    symbol: string,
    timeFrame: string = '1d',
    period: number = 30,
  ): Promise<{
    historicalVolatility: number;
    averageTrueRange: number;
    volatilityRank: number;
  }> {
    const historicalData = await this.getHistoricalData(
      symbol,
      timeFrame,
      period,
    );

    if (historicalData.length < period) {
      throw new Error(`Insufficient data for volatility calculation`);
    }

    const closes = historicalData.map((d) => d.close);
    const highs = historicalData.map((d) => d.high);
    const lows = historicalData.map((d) => d.low);

    // Historical Volatility (annualized standard deviation of returns)
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push(Math.log(closes[i] / closes[i - 1]));
    }

    const meanReturn = returns.reduce((a, b) => a + b) / returns.length;
    const variance =
      returns.reduce((acc, ret) => acc + Math.pow(ret - meanReturn, 2), 0) /
      returns.length;
    const historicalVolatility = Math.sqrt(variance * 252) * 100; // Annualized percentage

    // Average True Range
    const atr = this.calculateATR(highs, lows, closes, 14) || 0;
    const averageTrueRange = (atr / closes[closes.length - 1]) * 100; // As percentage of price

    // Simple volatility rank calculation
    const volatilityRank = Math.min(
      100,
      Math.max(0, (historicalVolatility - 15) / 0.35),
    );

    return {
      historicalVolatility,
      averageTrueRange,
      volatilityRank,
    };
  }

  private isUptrend(closes: number[]): boolean {
    if (closes.length < 10) return false;

    const firstHalf = closes.slice(0, Math.floor(closes.length / 2));
    const secondHalf = closes.slice(Math.floor(closes.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;

    return secondAvg > firstAvg * 1.02; // At least 2% higher
  }

  private isDowntrend(closes: number[]): boolean {
    if (closes.length < 10) return false;

    const firstHalf = closes.slice(0, Math.floor(closes.length / 2));
    const secondHalf = closes.slice(Math.floor(closes.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;

    return secondAvg < firstAvg * 0.98; // At least 2% lower
  }
}
