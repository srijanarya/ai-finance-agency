import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as TI from 'technicalindicators';

import { HistoricalDataService } from './historical-data.service';
import { TimeInterval } from '../entities/historical-data.entity';

export interface IndicatorInput {
  symbol: string;
  interval: TimeInterval;
  period?: number;
  days?: number;
}

export interface RSIResult {
  symbol: string;
  interval: TimeInterval;
  values: { timestamp: Date; rsi: number }[];
  currentRSI: number;
  signal: 'overbought' | 'oversold' | 'neutral';
}

export interface MACDResult {
  symbol: string;
  interval: TimeInterval;
  values: { 
    timestamp: Date; 
    macd: number; 
    signal: number; 
    histogram: number; 
  }[];
  currentMACD: {
    macd: number;
    signal: number;
    histogram: number;
  };
  crossover: 'bullish' | 'bearish' | 'none';
}

export interface BollingerBandsResult {
  symbol: string;
  interval: TimeInterval;
  values: {
    timestamp: Date;
    upper: number;
    middle: number;
    lower: number;
    price: number;
  }[];
  currentBands: {
    upper: number;
    middle: number;
    lower: number;
    price: number;
  };
  signal: 'upper_breach' | 'lower_breach' | 'neutral';
}

export interface MovingAverageResult {
  symbol: string;
  interval: TimeInterval;
  type: 'SMA' | 'EMA';
  period: number;
  values: { timestamp: Date; ma: number; price: number }[];
  currentMA: number;
  currentPrice: number;
  signal: 'above' | 'below' | 'neutral';
}

export interface StochasticResult {
  symbol: string;
  interval: TimeInterval;
  values: {
    timestamp: Date;
    k: number;
    d: number;
  }[];
  currentStochastic: {
    k: number;
    d: number;
  };
  signal: 'overbought' | 'oversold' | 'neutral';
}

export interface VolumeIndicatorResult {
  symbol: string;
  interval: TimeInterval;
  obv: { timestamp: Date; obv: number }[];
  volumeSMA: { timestamp: Date; volumeSMA: number; volume: number }[];
  volumeSpike: boolean;
  currentOBV: number;
}

@Injectable()
export class TechnicalIndicatorsService {
  private readonly logger = new Logger(TechnicalIndicatorsService.name);

  constructor(
    private historicalDataService: HistoricalDataService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async calculateRSI(input: IndicatorInput): Promise<RSIResult> {
    try {
      const cacheKey = `rsi_${input.symbol}_${input.interval}_${input.period || 14}_${input.days || 100}`;
      
      // Check cache
      const cached = await this.cacheManager.get<RSIResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const period = input.period || 14;
      const days = input.days || 100;

      // Get historical data
      const historicalData = await this.historicalDataService.getHistoricalData({
        symbol: input.symbol,
        interval: input.interval,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        limit: days * 24, // Ensure we have enough data
      });

      if (historicalData.length < period + 1) {
        throw new Error(`Insufficient data for RSI calculation. Need at least ${period + 1} data points.`);
      }

      // Sort by timestamp ascending
      const sortedData = historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Extract close prices
      const closes = sortedData.map(data => Number(data.close));
      
      // Calculate RSI
      const rsiValues = TI.RSI.calculate({
        values: closes,
        period,
      });

      // Prepare result
      const values = rsiValues.map((rsi, index) => ({
        timestamp: sortedData[index + period].timestamp,
        rsi,
      }));

      const currentRSI = rsiValues[rsiValues.length - 1];
      let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral';
      
      if (currentRSI > 70) {
        signal = 'overbought';
      } else if (currentRSI < 30) {
        signal = 'oversold';
      }

      const result: RSIResult = {
        symbol: input.symbol,
        interval: input.interval,
        values,
        currentRSI,
        signal,
      };

      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, result, 300000);

      return result;
    } catch (error) {
      this.logger.error('Error calculating RSI:', error);
      throw error;
    }
  }

  async calculateMACD(input: IndicatorInput): Promise<MACDResult> {
    try {
      const cacheKey = `macd_${input.symbol}_${input.interval}_${input.days || 100}`;
      
      const cached = await this.cacheManager.get<MACDResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const days = input.days || 100;

      const historicalData = await this.historicalDataService.getHistoricalData({
        symbol: input.symbol,
        interval: input.interval,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        limit: days * 24,
      });

      if (historicalData.length < 35) { // Need at least 35 data points for MACD
        throw new Error('Insufficient data for MACD calculation.');
      }

      const sortedData = historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const closes = sortedData.map(data => Number(data.close));

      const macdValues = TI.MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });

      const values = macdValues.map((macd, index) => ({
        timestamp: sortedData[index + 35].timestamp, // MACD needs 35 periods to start
        macd: macd.MACD,
        signal: macd.signal,
        histogram: macd.histogram,
      }));

      const current = macdValues[macdValues.length - 1];
      const previous = macdValues[macdValues.length - 2];
      
      let crossover: 'bullish' | 'bearish' | 'none' = 'none';
      if (current && previous) {
        if (previous.MACD <= previous.signal && current.MACD > current.signal) {
          crossover = 'bullish';
        } else if (previous.MACD >= previous.signal && current.MACD < current.signal) {
          crossover = 'bearish';
        }
      }

      const result: MACDResult = {
        symbol: input.symbol,
        interval: input.interval,
        values,
        currentMACD: {
          macd: current.MACD,
          signal: current.signal,
          histogram: current.histogram,
        },
        crossover,
      };

      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Error calculating MACD:', error);
      throw error;
    }
  }

  async calculateBollingerBands(input: IndicatorInput): Promise<BollingerBandsResult> {
    try {
      const cacheKey = `bb_${input.symbol}_${input.interval}_${input.period || 20}_${input.days || 100}`;
      
      const cached = await this.cacheManager.get<BollingerBandsResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const period = input.period || 20;
      const days = input.days || 100;

      const historicalData = await this.historicalDataService.getHistoricalData({
        symbol: input.symbol,
        interval: input.interval,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        limit: days * 24,
      });

      if (historicalData.length < period) {
        throw new Error(`Insufficient data for Bollinger Bands calculation. Need at least ${period} data points.`);
      }

      const sortedData = historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const closes = sortedData.map(data => Number(data.close));

      const bbValues = TI.BollingerBands.calculate({
        values: closes,
        period,
        stdDev: 2,
      });

      const values = bbValues.map((bb, index) => ({
        timestamp: sortedData[index + period - 1].timestamp,
        upper: bb.upper,
        middle: bb.middle,
        lower: bb.lower,
        price: closes[index + period - 1],
      }));

      const current = bbValues[bbValues.length - 1];
      const currentPrice = closes[closes.length - 1];
      
      let signal: 'upper_breach' | 'lower_breach' | 'neutral' = 'neutral';
      if (currentPrice > current.upper) {
        signal = 'upper_breach';
      } else if (currentPrice < current.lower) {
        signal = 'lower_breach';
      }

      const result: BollingerBandsResult = {
        symbol: input.symbol,
        interval: input.interval,
        values,
        currentBands: {
          upper: current.upper,
          middle: current.middle,
          lower: current.lower,
          price: currentPrice,
        },
        signal,
      };

      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Error calculating Bollinger Bands:', error);
      throw error;
    }
  }

  async calculateMovingAverage(
    input: IndicatorInput & { type: 'SMA' | 'EMA' }
  ): Promise<MovingAverageResult> {
    try {
      const period = input.period || 20;
      const cacheKey = `ma_${input.type}_${input.symbol}_${input.interval}_${period}_${input.days || 100}`;
      
      const cached = await this.cacheManager.get<MovingAverageResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const days = input.days || 100;

      const historicalData = await this.historicalDataService.getHistoricalData({
        symbol: input.symbol,
        interval: input.interval,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        limit: days * 24,
      });

      if (historicalData.length < period) {
        throw new Error(`Insufficient data for Moving Average calculation. Need at least ${period} data points.`);
      }

      const sortedData = historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const closes = sortedData.map(data => Number(data.close));

      let maValues: number[];
      
      if (input.type === 'SMA') {
        maValues = TI.SMA.calculate({
          values: closes,
          period,
        });
      } else {
        maValues = TI.EMA.calculate({
          values: closes,
          period,
        });
      }

      const values = maValues.map((ma, index) => ({
        timestamp: sortedData[index + period - 1].timestamp,
        ma,
        price: closes[index + period - 1],
      }));

      const currentMA = maValues[maValues.length - 1];
      const currentPrice = closes[closes.length - 1];
      
      let signal: 'above' | 'below' | 'neutral' = 'neutral';
      if (currentPrice > currentMA * 1.02) { // 2% threshold
        signal = 'above';
      } else if (currentPrice < currentMA * 0.98) {
        signal = 'below';
      }

      const result: MovingAverageResult = {
        symbol: input.symbol,
        interval: input.interval,
        type: input.type,
        period,
        values,
        currentMA,
        currentPrice,
        signal,
      };

      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Error calculating Moving Average:', error);
      throw error;
    }
  }

  async calculateStochastic(input: IndicatorInput): Promise<StochasticResult> {
    try {
      const cacheKey = `stoch_${input.symbol}_${input.interval}_${input.period || 14}_${input.days || 100}`;
      
      const cached = await this.cacheManager.get<StochasticResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const period = input.period || 14;
      const days = input.days || 100;

      const historicalData = await this.historicalDataService.getHistoricalData({
        symbol: input.symbol,
        interval: input.interval,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        limit: days * 24,
      });

      if (historicalData.length < period + 3) {
        throw new Error(`Insufficient data for Stochastic calculation. Need at least ${period + 3} data points.`);
      }

      const sortedData = historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      const stochValues = TI.Stochastic.calculate({
        high: sortedData.map(data => Number(data.high)),
        low: sortedData.map(data => Number(data.low)),
        close: sortedData.map(data => Number(data.close)),
        period,
        signalPeriod: 3,
      });

      const values = stochValues.map((stoch, index) => ({
        timestamp: sortedData[index + period + 2].timestamp,
        k: stoch.k,
        d: stoch.d,
      }));

      const current = stochValues[stochValues.length - 1];
      
      let signal: 'overbought' | 'oversold' | 'neutral' = 'neutral';
      if (current.k > 80 && current.d > 80) {
        signal = 'overbought';
      } else if (current.k < 20 && current.d < 20) {
        signal = 'oversold';
      }

      const result: StochasticResult = {
        symbol: input.symbol,
        interval: input.interval,
        values,
        currentStochastic: {
          k: current.k,
          d: current.d,
        },
        signal,
      };

      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Error calculating Stochastic:', error);
      throw error;
    }
  }

  async calculateVolumeIndicators(input: IndicatorInput): Promise<VolumeIndicatorResult> {
    try {
      const cacheKey = `vol_${input.symbol}_${input.interval}_${input.days || 50}`;
      
      const cached = await this.cacheManager.get<VolumeIndicatorResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const days = input.days || 50;

      const historicalData = await this.historicalDataService.getHistoricalData({
        symbol: input.symbol,
        interval: input.interval,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        limit: days * 24,
      });

      if (historicalData.length < 20) {
        throw new Error('Insufficient data for volume indicators calculation.');
      }

      const sortedData = historicalData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      // Calculate OBV (On-Balance Volume)
      let obv = 0;
      const obvValues = sortedData.map((data, index) => {
        if (index === 0) {
          obv = Number(data.volume);
        } else {
          const prevClose = Number(sortedData[index - 1].close);
          const currentClose = Number(data.close);
          
          if (currentClose > prevClose) {
            obv += Number(data.volume);
          } else if (currentClose < prevClose) {
            obv -= Number(data.volume);
          }
        }
        
        return {
          timestamp: data.timestamp,
          obv,
        };
      });

      // Calculate Volume SMA
      const volumes = sortedData.map(data => Number(data.volume));
      const volumeSMAValues = TI.SMA.calculate({
        values: volumes,
        period: 20,
      });

      const volumeSMA = volumeSMAValues.map((sma, index) => ({
        timestamp: sortedData[index + 19].timestamp,
        volumeSMA: sma,
        volume: volumes[index + 19],
      }));

      // Check for volume spike
      const currentVolume = volumes[volumes.length - 1];
      const currentVolumeSMA = volumeSMAValues[volumeSMAValues.length - 1];
      const volumeSpike = currentVolume > currentVolumeSMA * 2; // 200% of average

      const result: VolumeIndicatorResult = {
        symbol: input.symbol,
        interval: input.interval,
        obv: obvValues,
        volumeSMA,
        volumeSpike,
        currentOBV: obv,
      };

      await this.cacheManager.set(cacheKey, result, 300000);
      return result;
    } catch (error) {
      this.logger.error('Error calculating volume indicators:', error);
      throw error;
    }
  }

  async getComprehensiveAnalysis(input: IndicatorInput): Promise<{
    symbol: string;
    interval: TimeInterval;
    timestamp: Date;
    rsi: RSIResult;
    macd: MACDResult;
    bollingerBands: BollingerBandsResult;
    sma20: MovingAverageResult;
    ema20: MovingAverageResult;
    stochastic: StochasticResult;
    volumeIndicators: VolumeIndicatorResult;
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    signals: {
      indicator: string;
      signal: string;
      strength: 'strong' | 'moderate' | 'weak';
    }[];
  }> {
    try {
      const [rsi, macd, bb, sma20, ema20, stochastic, volume] = await Promise.all([
        this.calculateRSI(input),
        this.calculateMACD(input),
        this.calculateBollingerBands(input),
        this.calculateMovingAverage({ ...input, type: 'SMA', period: 20 }),
        this.calculateMovingAverage({ ...input, type: 'EMA', period: 20 }),
        this.calculateStochastic(input),
        this.calculateVolumeIndicators(input),
      ]);

      const signals = [];
      let bullishSignals = 0;
      let bearishSignals = 0;

      // RSI signals
      if (rsi.signal === 'oversold') {
        signals.push({ indicator: 'RSI', signal: 'Oversold - Potential Buy', strength: 'moderate' as const });
        bullishSignals++;
      } else if (rsi.signal === 'overbought') {
        signals.push({ indicator: 'RSI', signal: 'Overbought - Potential Sell', strength: 'moderate' as const });
        bearishSignals++;
      }

      // MACD signals
      if (macd.crossover === 'bullish') {
        signals.push({ indicator: 'MACD', signal: 'Bullish Crossover', strength: 'strong' as const });
        bullishSignals += 2;
      } else if (macd.crossover === 'bearish') {
        signals.push({ indicator: 'MACD', signal: 'Bearish Crossover', strength: 'strong' as const });
        bearishSignals += 2;
      }

      // Bollinger Bands signals
      if (bb.signal === 'lower_breach') {
        signals.push({ indicator: 'Bollinger Bands', signal: 'Lower Band Breach - Oversold', strength: 'moderate' as const });
        bullishSignals++;
      } else if (bb.signal === 'upper_breach') {
        signals.push({ indicator: 'Bollinger Bands', signal: 'Upper Band Breach - Overbought', strength: 'moderate' as const });
        bearishSignals++;
      }

      // Moving Average signals
      if (sma20.signal === 'above') {
        signals.push({ indicator: 'SMA(20)', signal: 'Price Above SMA', strength: 'weak' as const });
        bullishSignals++;
      } else if (sma20.signal === 'below') {
        signals.push({ indicator: 'SMA(20)', signal: 'Price Below SMA', strength: 'weak' as const });
        bearishSignals++;
      }

      // Stochastic signals
      if (stochastic.signal === 'oversold') {
        signals.push({ indicator: 'Stochastic', signal: 'Oversold Condition', strength: 'moderate' as const });
        bullishSignals++;
      } else if (stochastic.signal === 'overbought') {
        signals.push({ indicator: 'Stochastic', signal: 'Overbought Condition', strength: 'moderate' as const });
        bearishSignals++;
      }

      // Volume signals
      if (volume.volumeSpike) {
        signals.push({ indicator: 'Volume', signal: 'Volume Spike Detected', strength: 'moderate' as const });
        // Volume spike is neutral but adds conviction to other signals
      }

      // Determine overall signal
      let overallSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (bullishSignals > bearishSignals + 1) {
        overallSignal = 'bullish';
      } else if (bearishSignals > bullishSignals + 1) {
        overallSignal = 'bearish';
      }

      return {
        symbol: input.symbol,
        interval: input.interval,
        timestamp: new Date(),
        rsi,
        macd,
        bollingerBands: bb,
        sma20,
        ema20,
        stochastic,
        volumeIndicators: volume,
        overallSignal,
        signals,
      };
    } catch (error) {
      this.logger.error('Error getting comprehensive analysis:', error);
      throw error;
    }
  }
}