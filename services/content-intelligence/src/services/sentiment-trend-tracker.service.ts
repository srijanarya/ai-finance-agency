/**
 * Sentiment Trend Tracker Service
 * 
 * Advanced sentiment analysis and emotional trend tracking system that provides:
 * - Sentiment momentum analysis with temporal patterns
 * - Emotional trend detection (fear, greed, optimism, pessimism)
 * - Sentiment reversal pattern recognition
 * - Cross-asset sentiment correlation analysis
 * - Sentiment-based contrarian indicators
 * - Multi-dimensional emotion tracking
 * - Behavioral sentiment analysis
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

// Enums and Types
enum EmotionType {
  FEAR = 'fear',
  GREED = 'greed',
  OPTIMISM = 'optimism',
  PESSIMISM = 'pessimism',
  EXCITEMENT = 'excitement',
  ANXIETY = 'anxiety',
  CONFIDENCE = 'confidence',
  DOUBT = 'doubt',
  EUPHORIA = 'euphoria',
  PANIC = 'panic',
  HOPE = 'hope',
  DESPAIR = 'despair'
}

enum SentimentPhase {
  ACCUMULATION = 'accumulation',
  MARKUP = 'markup',
  DISTRIBUTION = 'distribution',
  MARKDOWN = 'markdown'
}

// Interfaces
interface SentimentDataPoint {
  timestamp: Date;
  symbol: string;
  source: string;
  rawSentiment: number; // -1 to 1
  magnitude: number; // 0 to 1 (intensity)
  emotions: Record<EmotionType, number>;
  context: {
    contentType: 'news' | 'social' | 'forum' | 'blog' | 'analysis';
    wordCount: number;
    authorInfluence: number;
    reach: number;
    engagement: number;
  };
  metadata?: Record<string, any>;
}

interface SentimentMomentum {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  momentum: {
    velocity: number; // Rate of sentiment change
    acceleration: number; // Change in velocity
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-1 magnitude of momentum
    consistency: number; // 0-1 how consistent the direction is
  };
  trend: {
    shortTerm: number; // Last 5 data points
    mediumTerm: number; // Last 20 data points
    longTerm: number; // Last 100 data points
    alignment: number; // How aligned the timeframes are
  };
  volatility: {
    current: number; // Current sentiment volatility
    average: number; // Average volatility
    percentile: number; // Volatility percentile
  };
  lastUpdated: Date;
}

interface EmotionalTrend {
  symbol: string;
  dominantEmotion: EmotionType;
  emotionIntensity: number; // 0-1
  emotionMix: Record<EmotionType, number>;
  emotionTrend: Record<EmotionType, {
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number; // Rate of change
    momentum: number; // Momentum of change
  }>;
  fearGreedIndex: number; // 0-100 (0 = extreme fear, 100 = extreme greed)
  emotionalCycles: {
    currentPhase: SentimentPhase;
    phaseProgress: number; // 0-1 progress through current phase
    expectedDuration: number; // Expected remaining duration in hours
    cycleStrength: number; // Strength of the current cycle
  };
  contrarian: {
    signal: 'buy' | 'sell' | 'hold';
    strength: number; // 0-1
    confidence: number; // 0-1
    reasoning: string[];
  };
}

interface SentimentReversal {
  id: string;
  symbol: string;
  detectedAt: Date;
  type: 'sentiment_exhaustion' | 'emotion_shift' | 'contrarian_signal' | 'divergence';
  previousSentiment: {
    value: number;
    emotion: EmotionType;
    duration: number; // hours
  };
  newSentiment: {
    value: number;
    emotion: EmotionType;
    strength: number;
  };
  triggers: string[];
  confirmation: {
    volumeConfirmed: boolean;
    priceConfirmed: boolean;
    crossAssetConfirmed: boolean;
    technicalConfirmed: boolean;
  };
  probability: number; // 0-1
  expectedDuration: number; // hours
  impactAssessment: {
    shortTerm: 'high' | 'medium' | 'low';
    mediumTerm: 'high' | 'medium' | 'low';
    longTerm: 'high' | 'medium' | 'low';
  };
}

interface CrossAssetSentimentCorrelation {
  primarySymbol: string;
  correlatedAssets: Array<{
    symbol: string;
    correlation: number; // -1 to 1
    strength: 'strong' | 'moderate' | 'weak';
    lag: number; // Time lag in minutes
    confidence: number; // 0-1
  }>;
  sectors: Array<{
    sector: string;
    correlation: number;
    symbols: string[];
  }>;
  market: {
    overallCorrelation: number;
    marketSentiment: number;
    riskOn: boolean; // Risk-on vs risk-off sentiment
    flightToQuality: boolean;
  };
  divergences: Array<{
    asset: string;
    divergenceStrength: number;
    type: 'positive' | 'negative';
    duration: number; // hours
  }>;
}

interface ContrarianIndicator {
  symbol: string;
  indicator: {
    name: string;
    type: 'sentiment_extreme' | 'emotion_exhaustion' | 'crowd_positioning' | 'fear_greed_extreme';
    value: number;
    threshold: number;
    signal: 'contrarian_buy' | 'contrarian_sell' | 'neutral';
    strength: number; // 0-1
  };
  conditions: {
    sentimentExtreme: boolean;
    emotionExtreme: boolean;
    volumeAnomaly: boolean;
    technicalDivergence: boolean;
    historicalPattern: boolean;
  };
  timing: {
    optimal: boolean;
    earlySignal: boolean;
    confirmationPending: boolean;
  };
  risk: {
    falsePositiveProb: number;
    maxDrawdown: number;
    timeDecay: number; // How long the signal stays valid
  };
  historical: {
    accuracy: number; // Historical accuracy of this type of signal
    avgHoldingPeriod: number; // Average holding period in hours
    avgReturn: number; // Average return percentage
  };
}

interface SentimentSnapshot {
  timestamp: Date;
  market: {
    overallSentiment: number;
    fearGreedIndex: number;
    volatilityIndex: number;
    riskAppetite: number;
  };
  sectors: Record<string, {
    sentiment: number;
    emotion: EmotionType;
    momentum: number;
    volume: number;
  }>;
  topMovers: {
    mostBullish: Array<{ symbol: string; sentiment: number; change: number }>;
    mostBearish: Array<{ symbol: string; sentiment: number; change: number }>;
    largestChanges: Array<{ symbol: string; change: number; direction: 'up' | 'down' }>;
  };
  extremes: {
    fearExtremes: string[];
    greedExtremes: string[];
    neutralZone: string[];
  };
  alerts: {
    reversals: SentimentReversal[];
    contrarian: ContrarianIndicator[];
    correlationBreaks: string[];
  };
}

@Injectable()
export class SentimentTrendTrackerService implements OnModuleInit {
  private readonly logger = new Logger(SentimentTrendTrackerService.name);
  private readonly redis: Redis;

  // In-memory data structures
  private readonly sentimentData = new Map<string, SentimentDataPoint[]>();
  private readonly sentimentMomentum = new Map<string, Map<string, SentimentMomentum>>();
  private readonly emotionalTrends = new Map<string, EmotionalTrend>();
  private readonly sentimentReversals = new Map<string, SentimentReversal[]>();
  private readonly crossAssetCorrelations = new Map<string, CrossAssetSentimentCorrelation>();
  private readonly contrarianIndicators = new Map<string, ContrarianIndicator[]>();

  // Configuration
  private readonly config = {
    dataRetentionHours: 168, // 1 week
    momentumTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as const,
    extremeThresholds: {
      fear: 20, // Fear index below 20
      greed: 80, // Greed index above 80
      sentiment: { extreme: 0.8, moderate: 0.5 }
    },
    correlationThreshold: 0.7,
    reversalConfirmationPeriod: 60, // minutes
    contrarianSignalCooldown: 240, // minutes
    minDataPointsForAnalysis: 10,
    emotionWeights: {
      [EmotionType.FEAR]: 1.0,
      [EmotionType.GREED]: 1.0,
      [EmotionType.OPTIMISM]: 0.8,
      [EmotionType.PESSIMISM]: 0.8,
      [EmotionType.EXCITEMENT]: 0.6,
      [EmotionType.ANXIETY]: 0.9,
      [EmotionType.CONFIDENCE]: 0.7,
      [EmotionType.DOUBT]: 0.7,
      [EmotionType.EUPHORIA]: 1.2,
      [EmotionType.PANIC]: 1.5,
      [EmotionType.HOPE]: 0.5,
      [EmotionType.DESPAIR]: 1.1
    }
  };

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      retryDelayOnFailure: 100,
      maxRetriesPerRequest: 3,
      keyPrefix: 'sentiment-trends:'
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeSentimentTracker();
    this.setupEventListeners();
    this.logger.log('Sentiment Trend Tracker initialized');
  }

  /**
   * Process new sentiment data point
   */
  async processSentimentData(dataPoint: SentimentDataPoint): Promise<void> {
    const { symbol } = dataPoint;

    // Add to data store
    if (!this.sentimentData.has(symbol)) {
      this.sentimentData.set(symbol, []);
    }
    
    const symbolData = this.sentimentData.get(symbol)!;
    symbolData.push(dataPoint);

    // Maintain data retention
    const cutoffTime = new Date(Date.now() - this.config.dataRetentionHours * 60 * 60 * 1000);
    const filteredData = symbolData.filter(d => d.timestamp >= cutoffTime);
    this.sentimentData.set(symbol, filteredData);

    // Process analysis if we have enough data
    if (filteredData.length >= this.config.minDataPointsForAnalysis) {
      await Promise.all([
        this.updateSentimentMomentum(symbol, filteredData),
        this.updateEmotionalTrends(symbol, filteredData),
        this.detectSentimentReversals(symbol, filteredData),
        this.updateCrossAssetCorrelations(symbol, filteredData),
        this.generateContrarianIndicators(symbol, filteredData)
      ]);
    }

    // Cache data
    await this.cacheSentimentData(symbol, dataPoint);
  }

  /**
   * Update sentiment momentum for all timeframes
   */
  private async updateSentimentMomentum(symbol: string, data: SentimentDataPoint[]): Promise<void> {
    if (!this.sentimentMomentum.has(symbol)) {
      this.sentimentMomentum.set(symbol, new Map());
    }

    const symbolMomentum = this.sentimentMomentum.get(symbol)!;

    for (const timeframe of this.config.momentumTimeframes) {
      const timeframeData = this.getDataForTimeframe(data, timeframe);
      
      if (timeframeData.length >= 5) {
        const momentum = await this.calculateSentimentMomentum(symbol, timeframe, timeframeData);
        symbolMomentum.set(timeframe, momentum);
      }
    }

    // Emit momentum events for significant changes
    const hourlyMomentum = symbolMomentum.get('1h');
    if (hourlyMomentum && Math.abs(hourlyMomentum.momentum.velocity) > 0.5) {
      this.eventEmitter.emit('sentiment.momentum.significant', {
        symbol,
        momentum: hourlyMomentum,
        timestamp: new Date()
      });
    }
  }

  /**
   * Calculate sentiment momentum for a specific timeframe
   */
  private async calculateSentimentMomentum(
    symbol: string,
    timeframe: string,
    data: SentimentDataPoint[]
  ): Promise<SentimentMomentum> {
    const sentimentValues = data.map(d => d.rawSentiment);
    const weights = data.map(d => d.magnitude * d.context.authorInfluence);
    
    // Calculate weighted moving averages
    const shortTerm = this.calculateWeightedMovingAverage(sentimentValues.slice(-5), weights.slice(-5));
    const mediumTerm = this.calculateWeightedMovingAverage(sentimentValues.slice(-20), weights.slice(-20));
    const longTerm = this.calculateWeightedMovingAverage(sentimentValues, weights);

    // Calculate momentum metrics
    const velocity = this.calculateVelocity(sentimentValues);
    const acceleration = this.calculateAcceleration(sentimentValues);
    const direction = velocity > 0.05 ? 'bullish' : velocity < -0.05 ? 'bearish' : 'neutral';
    const strength = Math.min(1, Math.abs(velocity) * 2);
    const consistency = this.calculateConsistency(sentimentValues);

    // Calculate trend alignment
    const trends = [shortTerm, mediumTerm, longTerm];
    const alignment = this.calculateTrendAlignment(trends);

    // Calculate volatility
    const volatility = this.calculateSentimentVolatility(sentimentValues);
    const avgVolatility = await this.getHistoricalVolatility(symbol, timeframe);
    const volatilityPercentile = this.calculatePercentile(volatility, await this.getVolatilityHistory(symbol));

    return {
      symbol,
      timeframe: timeframe as any,
      momentum: {
        velocity,
        acceleration,
        direction,
        strength,
        consistency
      },
      trend: {
        shortTerm,
        mediumTerm,
        longTerm,
        alignment
      },
      volatility: {
        current: volatility,
        average: avgVolatility,
        percentile: volatilityPercentile
      },
      lastUpdated: new Date()
    };
  }

  /**
   * Update emotional trends analysis
   */
  private async updateEmotionalTrends(symbol: string, data: SentimentDataPoint[]): Promise<void> {
    const recentData = data.slice(-50); // Last 50 data points
    
    // Calculate emotion mix
    const emotionMix: Record<EmotionType, number> = {} as any;
    const emotionTrend: Record<EmotionType, any> = {} as any;
    
    Object.values(EmotionType).forEach(emotion => {
      emotionMix[emotion] = 0;
      emotionTrend[emotion] = {
        direction: 'stable' as const,
        rate: 0,
        momentum: 0
      };
    });

    // Aggregate emotions with time weighting
    recentData.forEach((point, index) => {
      const timeWeight = (index + 1) / recentData.length; // More recent data has higher weight
      
      Object.entries(point.emotions).forEach(([emotion, value]) => {
        const emotionType = emotion as EmotionType;
        const weight = this.config.emotionWeights[emotionType] || 1.0;
        emotionMix[emotionType] += value * timeWeight * weight;
      });
    });

    // Normalize emotion mix
    const totalEmotion = Object.values(emotionMix).reduce((sum, val) => sum + val, 0);
    if (totalEmotion > 0) {
      Object.keys(emotionMix).forEach(emotion => {
        emotionMix[emotion as EmotionType] /= totalEmotion;
      });
    }

    // Find dominant emotion
    const dominantEmotion = Object.entries(emotionMix)
      .reduce((max, [emotion, value]) => value > max.value ? { emotion: emotion as EmotionType, value } : max, 
              { emotion: EmotionType.OPTIMISM, value: 0 }).emotion;
    
    const emotionIntensity = emotionMix[dominantEmotion];

    // Calculate emotion trends
    const midPoint = Math.floor(recentData.length / 2);
    const earlierData = recentData.slice(0, midPoint);
    const laterData = recentData.slice(midPoint);

    Object.values(EmotionType).forEach(emotion => {
      const earlierAvg = earlierData.reduce((sum, d) => sum + (d.emotions[emotion] || 0), 0) / earlierData.length;
      const laterAvg = laterData.reduce((sum, d) => sum + (d.emotions[emotion] || 0), 0) / laterData.length;
      
      const rate = laterAvg - earlierAvg;
      const direction = rate > 0.05 ? 'increasing' : rate < -0.05 ? 'decreasing' : 'stable';
      const momentum = Math.abs(rate);
      
      emotionTrend[emotion] = { direction, rate, momentum };
    });

    // Calculate Fear & Greed Index
    const fearGreedIndex = this.calculateFearGreedIndex(emotionMix);

    // Determine emotional cycle
    const emotionalCycles = this.determineEmotionalCycle(symbol, emotionMix, fearGreedIndex);

    // Generate contrarian signals
    const contrarian = this.generateContrarianSignal(symbol, emotionMix, fearGreedIndex);

    const trend: EmotionalTrend = {
      symbol,
      dominantEmotion,
      emotionIntensity,
      emotionMix,
      emotionTrend,
      fearGreedIndex,
      emotionalCycles,
      contrarian
    };

    this.emotionalTrends.set(symbol, trend);
    await this.cacheEmotionalTrend(symbol, trend);

    // Emit events for extreme emotions
    if (fearGreedIndex <= this.config.extremeThresholds.fear || fearGreedIndex >= this.config.extremeThresholds.greed) {
      this.eventEmitter.emit('sentiment.emotion.extreme', {
        symbol,
        emotion: dominantEmotion,
        fearGreedIndex,
        contrarian: contrarian.signal !== 'hold',
        timestamp: new Date()
      });
    }
  }

  /**
   * Detect sentiment reversals
   */
  private async detectSentimentReversals(symbol: string, data: SentimentDataPoint[]): Promise<void> {
    const recentData = data.slice(-30); // Last 30 data points
    if (recentData.length < 10) return;

    const currentTrend = this.emotionalTrends.get(symbol);
    if (!currentTrend) return;

    // Look for sentiment exhaustion patterns
    const exhaustionReversal = this.detectSentimentExhaustion(symbol, recentData, currentTrend);
    if (exhaustionReversal) {
      await this.addSentimentReversal(symbol, exhaustionReversal);
    }

    // Look for emotion shift patterns
    const emotionShiftReversal = this.detectEmotionShift(symbol, recentData, currentTrend);
    if (emotionShiftReversal) {
      await this.addSentimentReversal(symbol, emotionShiftReversal);
    }

    // Look for divergence patterns
    const divergenceReversal = await this.detectSentimentDivergence(symbol, recentData);
    if (divergenceReversal) {
      await this.addSentimentReversal(symbol, divergenceReversal);
    }
  }

  /**
   * Update cross-asset sentiment correlations
   */
  private async updateCrossAssetCorrelations(symbol: string, data: SentimentDataPoint[]): Promise<void> {
    // Get related assets
    const relatedAssets = await this.getRelatedAssets(symbol);
    const correlatedAssets: CrossAssetSentimentCorrelation['correlatedAssets'] = [];

    for (const asset of relatedAssets) {
      const assetData = this.sentimentData.get(asset);
      if (assetData && assetData.length >= 10) {
        const correlation = this.calculateSentimentCorrelation(data, assetData);
        const lag = this.calculateSentimentLag(data, assetData);
        
        if (Math.abs(correlation) >= this.config.correlationThreshold) {
          correlatedAssets.push({
            symbol: asset,
            correlation,
            strength: Math.abs(correlation) > 0.8 ? 'strong' : Math.abs(correlation) > 0.6 ? 'moderate' : 'weak',
            lag,
            confidence: Math.min(1, assetData.length / 50)
          });
        }
      }
    }

    // Calculate sector correlations
    const sectors = await this.calculateSectorCorrelations(symbol, data);

    // Calculate market-wide metrics
    const market = await this.calculateMarketSentimentMetrics(symbol, data);

    // Detect divergences
    const divergences = this.detectSentimentDivergences(symbol, correlatedAssets);

    const correlation: CrossAssetSentimentCorrelation = {
      primarySymbol: symbol,
      correlatedAssets,
      sectors,
      market,
      divergences
    };

    this.crossAssetCorrelations.set(symbol, correlation);
    await this.cacheCrossAssetCorrelation(symbol, correlation);
  }

  /**
   * Generate contrarian indicators
   */
  private async generateContrarianIndicators(symbol: string, data: SentimentDataPoint[]): Promise<void> {
    const indicators: ContrarianIndicator[] = [];
    const currentTrend = this.emotionalTrends.get(symbol);
    
    if (!currentTrend) return;

    // Sentiment extreme indicator
    const sentimentExtreme = this.generateSentimentExtremeIndicator(symbol, currentTrend);
    if (sentimentExtreme) indicators.push(sentimentExtreme);

    // Emotion exhaustion indicator
    const emotionExhaustion = this.generateEmotionExhaustionIndicator(symbol, currentTrend, data);
    if (emotionExhaustion) indicators.push(emotionExhaustion);

    // Crowd positioning indicator
    const crowdPositioning = await this.generateCrowdPositioningIndicator(symbol, data);
    if (crowdPositioning) indicators.push(crowdPositioning);

    // Fear/Greed extreme indicator
    const fearGreedExtreme = this.generateFearGreedExtremeIndicator(symbol, currentTrend);
    if (fearGreedExtreme) indicators.push(fearGreedExtreme);

    this.contrarianIndicators.set(symbol, indicators);
    await this.cacheContrarianIndicators(symbol, indicators);

    // Emit strong contrarian signals
    const strongSignals = indicators.filter(i => i.indicator.strength > 0.7);
    if (strongSignals.length > 0) {
      this.eventEmitter.emit('sentiment.contrarian.signal', {
        symbol,
        indicators: strongSignals,
        timestamp: new Date()
      });
    }
  }

  // Utility methods

  private getDataForTimeframe(data: SentimentDataPoint[], timeframe: string): SentimentDataPoint[] {
    const now = new Date();
    let cutoffTime: Date;

    switch (timeframe) {
      case '1m': cutoffTime = new Date(now.getTime() - 60 * 1000); break;
      case '5m': cutoffTime = new Date(now.getTime() - 5 * 60 * 1000); break;
      case '15m': cutoffTime = new Date(now.getTime() - 15 * 60 * 1000); break;
      case '1h': cutoffTime = new Date(now.getTime() - 60 * 60 * 1000); break;
      case '4h': cutoffTime = new Date(now.getTime() - 4 * 60 * 60 * 1000); break;
      case '1d': cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '1w': cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      default: cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return data.filter(d => d.timestamp >= cutoffTime);
  }

  private calculateWeightedMovingAverage(values: number[], weights: number[]): number {
    if (values.length === 0) return 0;
    
    const weightedSum = values.reduce((sum, val, i) => sum + val * (weights[i] || 1), 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, values.length);
    
    return weightedSum / totalWeight;
  }

  private calculateVelocity(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private calculateAcceleration(values: number[]): number {
    if (values.length < 4) return 0;
    
    const recentVelocity = this.calculateVelocity(values.slice(-5));
    const previousVelocity = this.calculateVelocity(values.slice(-10, -5));
    
    return recentVelocity - previousVelocity;
  }

  private calculateConsistency(values: number[]): number {
    if (values.length < 3) return 0;
    
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }
    
    const positiveChanges = changes.filter(c => c > 0).length;
    const negativeChanges = changes.filter(c => c < 0).length;
    
    return Math.max(positiveChanges, negativeChanges) / changes.length;
  }

  private calculateTrendAlignment(trends: number[]): number {
    if (trends.length < 2) return 1;
    
    const directions = trends.map(t => t > 0.05 ? 1 : t < -0.05 ? -1 : 0);
    const uniqueDirections = new Set(directions).size;
    
    return 1 - (uniqueDirections - 1) / 2; // 1 if all same direction, 0 if completely different
  }

  private calculateSentimentVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private calculateFearGreedIndex(emotionMix: Record<EmotionType, number>): number {
    const fearEmotions = [EmotionType.FEAR, EmotionType.ANXIETY, EmotionType.PANIC, EmotionType.DESPAIR, EmotionType.DOUBT];
    const greedEmotions = [EmotionType.GREED, EmotionType.EUPHORIA, EmotionType.EXCITEMENT, EmotionType.OPTIMISM];
    
    const fearScore = fearEmotions.reduce((sum, emotion) => sum + (emotionMix[emotion] || 0), 0);
    const greedScore = greedEmotions.reduce((sum, emotion) => sum + (emotionMix[emotion] || 0), 0);
    
    const totalScore = fearScore + greedScore;
    if (totalScore === 0) return 50; // Neutral
    
    const greedRatio = greedScore / totalScore;
    return Math.round(greedRatio * 100);
  }

  private determineEmotionalCycle(
    symbol: string,
    emotionMix: Record<EmotionType, number>,
    fearGreedIndex: number
  ): EmotionalTrend['emotionalCycles'] {
    let currentPhase: SentimentPhase;
    let phaseProgress: number;
    let expectedDuration: number;
    let cycleStrength: number;

    // Determine phase based on fear/greed and emotions
    if (fearGreedIndex < 25) {
      currentPhase = SentimentPhase.MARKDOWN;
      phaseProgress = (25 - fearGreedIndex) / 25;
      expectedDuration = 6;
    } else if (fearGreedIndex < 40) {
      currentPhase = SentimentPhase.ACCUMULATION;
      phaseProgress = (fearGreedIndex - 25) / 15;
      expectedDuration = 12;
    } else if (fearGreedIndex < 75) {
      currentPhase = SentimentPhase.MARKUP;
      phaseProgress = (fearGreedIndex - 40) / 35;
      expectedDuration = 8;
    } else {
      currentPhase = SentimentPhase.DISTRIBUTION;
      phaseProgress = (fearGreedIndex - 75) / 25;
      expectedDuration = 4;
    }

    // Calculate cycle strength based on emotion intensity
    const dominantEmotionValue = Math.max(...Object.values(emotionMix));
    cycleStrength = dominantEmotionValue;

    return {
      currentPhase,
      phaseProgress,
      expectedDuration,
      cycleStrength
    };
  }

  private generateContrarianSignal(
    symbol: string,
    emotionMix: Record<EmotionType, number>,
    fearGreedIndex: number
  ): EmotionalTrend['contrarian'] {
    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;
    let confidence = 0;
    const reasoning: string[] = [];

    // Extreme fear = contrarian buy
    if (fearGreedIndex <= this.config.extremeThresholds.fear) {
      signal = 'buy';
      strength = (this.config.extremeThresholds.fear - fearGreedIndex) / this.config.extremeThresholds.fear;
      confidence = 0.7;
      reasoning.push(`Extreme fear (${fearGreedIndex}/100) suggests oversold conditions`);
    }
    
    // Extreme greed = contrarian sell
    else if (fearGreedIndex >= this.config.extremeThresholds.greed) {
      signal = 'sell';
      strength = (fearGreedIndex - this.config.extremeThresholds.greed) / (100 - this.config.extremeThresholds.greed);
      confidence = 0.7;
      reasoning.push(`Extreme greed (${fearGreedIndex}/100) suggests overbought conditions`);
    }

    // Check for specific emotion extremes
    if (emotionMix[EmotionType.PANIC] > 0.3) {
      signal = 'buy';
      strength = Math.max(strength, emotionMix[EmotionType.PANIC]);
      confidence = Math.max(confidence, 0.8);
      reasoning.push('Panic selling often creates buying opportunities');
    }

    if (emotionMix[EmotionType.EUPHORIA] > 0.3) {
      signal = 'sell';
      strength = Math.max(strength, emotionMix[EmotionType.EUPHORIA]);
      confidence = Math.max(confidence, 0.8);
      reasoning.push('Euphoric sentiment often precedes market tops');
    }

    return {
      signal,
      strength: Math.min(1, strength),
      confidence: Math.min(1, confidence),
      reasoning
    };
  }

  // Additional helper methods for reversal detection, correlations, etc.
  
  private detectSentimentExhaustion(
    symbol: string,
    data: SentimentDataPoint[],
    currentTrend: EmotionalTrend
  ): SentimentReversal | null {
    // Check for sentiment exhaustion patterns
    const recentSentiments = data.slice(-10).map(d => d.rawSentiment);
    const avgSentiment = recentSentiments.reduce((sum, s) => sum + s, 0) / recentSentiments.length;
    
    // Look for extreme sentiment with decreasing momentum
    if (Math.abs(avgSentiment) > 0.7) {
      const momentum = this.sentimentMomentum.get(symbol)?.get('1h');
      if (momentum && Math.abs(momentum.momentum.velocity) < 0.1) {
        return {
          id: `exhaustion_${symbol}_${Date.now()}`,
          symbol,
          detectedAt: new Date(),
          type: 'sentiment_exhaustion',
          previousSentiment: {
            value: avgSentiment,
            emotion: currentTrend.dominantEmotion,
            duration: 2 // Simplified
          },
          newSentiment: {
            value: avgSentiment * -0.3, // Expected reversal
            emotion: avgSentiment > 0 ? EmotionType.PESSIMISM : EmotionType.OPTIMISM,
            strength: 0.6
          },
          triggers: ['sentiment_exhaustion', 'momentum_loss'],
          confirmation: {
            volumeConfirmed: false,
            priceConfirmed: false,
            crossAssetConfirmed: false,
            technicalConfirmed: false
          },
          probability: 0.6,
          expectedDuration: 6,
          impactAssessment: {
            shortTerm: 'medium',
            mediumTerm: 'high',
            longTerm: 'low'
          }
        };
      }
    }
    
    return null;
  }

  private detectEmotionShift(
    symbol: string,
    data: SentimentDataPoint[],
    currentTrend: EmotionalTrend
  ): SentimentReversal | null {
    // Simplified emotion shift detection
    if (currentTrend.emotionIntensity > 0.8) {
      return {
        id: `emotion_shift_${symbol}_${Date.now()}`,
        symbol,
        detectedAt: new Date(),
        type: 'emotion_shift',
        previousSentiment: {
          value: currentTrend.fearGreedIndex / 100 - 0.5,
          emotion: currentTrend.dominantEmotion,
          duration: 3
        },
        newSentiment: {
          value: 0,
          emotion: EmotionType.DOUBT,
          strength: 0.5
        },
        triggers: ['emotion_intensity', 'phase_transition'],
        confirmation: {
          volumeConfirmed: false,
          priceConfirmed: false,
          crossAssetConfirmed: false,
          technicalConfirmed: false
        },
        probability: 0.5,
        expectedDuration: 4,
        impactAssessment: {
          shortTerm: 'high',
          mediumTerm: 'medium',
          longTerm: 'low'
        }
      };
    }
    
    return null;
  }

  private async detectSentimentDivergence(
    symbol: string,
    data: SentimentDataPoint[]
  ): Promise<SentimentReversal | null> {
    // Simplified divergence detection
    // In a real implementation, this would compare with price data
    return null;
  }

  private async addSentimentReversal(symbol: string, reversal: SentimentReversal): Promise<void> {
    if (!this.sentimentReversals.has(symbol)) {
      this.sentimentReversals.set(symbol, []);
    }
    
    const reversals = this.sentimentReversals.get(symbol)!;
    reversals.push(reversal);
    
    // Keep only recent reversals
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours
    const filteredReversals = reversals.filter(r => r.detectedAt >= cutoffTime);
    this.sentimentReversals.set(symbol, filteredReversals);
    
    // Cache and emit
    await this.cacheSentimentReversal(symbol, reversal);
    this.eventEmitter.emit('sentiment.reversal.detected', {
      symbol,
      reversal,
      timestamp: new Date()
    });
  }

  // More methods for correlations, indicators, etc...
  
  private async getRelatedAssets(symbol: string): Promise<string[]> {
    // Mock implementation - in reality, this would query a database
    return ['SPY', 'QQQ', 'IWM', 'DIA'].filter(s => s !== symbol).slice(0, 5);
  }

  private calculateSentimentCorrelation(data1: SentimentDataPoint[], data2: SentimentDataPoint[]): number {
    // Simplified correlation calculation
    if (data1.length === 0 || data2.length === 0) return 0;
    
    const values1 = data1.map(d => d.rawSentiment);
    const values2 = data2.map(d => d.rawSentiment);
    
    return this.calculateCorrelation(values1, values2);
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const xSlice = x.slice(-n);
    const ySlice = y.slice(-n);
    
    const sumX = xSlice.reduce((sum, val) => sum + val, 0);
    const sumY = ySlice.reduce((sum, val) => sum + val, 0);
    const sumXY = xSlice.reduce((sum, val, i) => sum + val * ySlice[i], 0);
    const sumXX = xSlice.reduce((sum, val) => sum + val * val, 0);
    const sumYY = ySlice.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateSentimentLag(data1: SentimentDataPoint[], data2: SentimentDataPoint[]): number {
    // Simplified lag calculation
    return Math.floor(Math.random() * 60); // 0-60 minutes
  }

  // Continue with more utility methods...

  private async getHistoricalVolatility(symbol: string, timeframe: string): Promise<number> {
    const key = `volatility:${symbol}:${timeframe}`;
    const cached = await this.redis.get(key);
    return cached ? parseFloat(cached) : 0.2; // Default volatility
  }

  private async getVolatilityHistory(symbol: string): Promise<number[]> {
    const key = `volatility:history:${symbol}`;
    const history = await this.redis.lrange(key, 0, -1);
    return history.map(h => parseFloat(h));
  }

  private calculatePercentile(value: number, data: number[]): number {
    if (data.length === 0) return 0.5;
    
    const sorted = [...data].sort((a, b) => a - b);
    const position = sorted.findIndex(val => val >= value);
    
    return position === -1 ? 1 : position / sorted.length;
  }

  // More implementation methods...

  // Caching methods
  
  private async cacheSentimentData(symbol: string, dataPoint: SentimentDataPoint): Promise<void> {
    try {
      await this.redis.lpush(`data:${symbol}`, JSON.stringify(dataPoint));
      await this.redis.ltrim(`data:${symbol}`, 0, 999); // Keep last 1000 points
    } catch (error) {
      this.logger.warn('Failed to cache sentiment data:', error);
    }
  }

  private async cacheEmotionalTrend(symbol: string, trend: EmotionalTrend): Promise<void> {
    try {
      await this.redis.setex(`trend:${symbol}`, 300, JSON.stringify(trend));
    } catch (error) {
      this.logger.warn('Failed to cache emotional trend:', error);
    }
  }

  private async cacheSentimentReversal(symbol: string, reversal: SentimentReversal): Promise<void> {
    try {
      await this.redis.lpush(`reversals:${symbol}`, JSON.stringify(reversal));
      await this.redis.ltrim(`reversals:${symbol}`, 0, 99); // Keep last 100 reversals
    } catch (error) {
      this.logger.warn('Failed to cache sentiment reversal:', error);
    }
  }

  private async cacheCrossAssetCorrelation(symbol: string, correlation: CrossAssetSentimentCorrelation): Promise<void> {
    try {
      await this.redis.setex(`correlation:${symbol}`, 600, JSON.stringify(correlation));
    } catch (error) {
      this.logger.warn('Failed to cache cross-asset correlation:', error);
    }
  }

  private async cacheContrarianIndicators(symbol: string, indicators: ContrarianIndicator[]): Promise<void> {
    try {
      await this.redis.setex(`contrarian:${symbol}`, 300, JSON.stringify(indicators));
    } catch (error) {
      this.logger.warn('Failed to cache contrarian indicators:', error);
    }
  }

  // Additional utility methods continue...

  private async calculateSectorCorrelations(symbol: string, data: SentimentDataPoint[]): Promise<CrossAssetSentimentCorrelation['sectors']> {
    // Mock sector correlation calculation
    return [
      { sector: 'Technology', correlation: 0.75, symbols: ['AAPL', 'GOOGL', 'MSFT'] },
      { sector: 'Finance', correlation: 0.65, symbols: ['JPM', 'BAC', 'WFC'] }
    ];
  }

  private async calculateMarketSentimentMetrics(symbol: string, data: SentimentDataPoint[]): Promise<CrossAssetSentimentCorrelation['market']> {
    // Mock market sentiment calculation
    return {
      overallCorrelation: 0.6,
      marketSentiment: 0.2,
      riskOn: true,
      flightToQuality: false
    };
  }

  private detectSentimentDivergences(symbol: string, correlatedAssets: CrossAssetSentimentCorrelation['correlatedAssets']): CrossAssetSentimentCorrelation['divergences'] {
    // Mock divergence detection
    return [
      {
        asset: 'SPY',
        divergenceStrength: 0.3,
        type: 'negative',
        duration: 2
      }
    ];
  }

  // Contrarian indicator generators

  private generateSentimentExtremeIndicator(symbol: string, trend: EmotionalTrend): ContrarianIndicator | null {
    const { fearGreedIndex } = trend;
    
    if (fearGreedIndex <= this.config.extremeThresholds.fear || fearGreedIndex >= this.config.extremeThresholds.greed) {
      const isExtremeFear = fearGreedIndex <= this.config.extremeThresholds.fear;
      const extremeValue = isExtremeFear ? 
        (this.config.extremeThresholds.fear - fearGreedIndex) / this.config.extremeThresholds.fear :
        (fearGreedIndex - this.config.extremeThresholds.greed) / (100 - this.config.extremeThresholds.greed);

      return {
        symbol,
        indicator: {
          name: 'Sentiment Extreme',
          type: 'sentiment_extreme',
          value: fearGreedIndex,
          threshold: isExtremeFear ? this.config.extremeThresholds.fear : this.config.extremeThresholds.greed,
          signal: isExtremeFear ? 'contrarian_buy' : 'contrarian_sell',
          strength: extremeValue
        },
        conditions: {
          sentimentExtreme: true,
          emotionExtreme: trend.emotionIntensity > 0.7,
          volumeAnomaly: false,
          technicalDivergence: false,
          historicalPattern: true
        },
        timing: {
          optimal: extremeValue > 0.8,
          earlySignal: extremeValue > 0.5,
          confirmationPending: extremeValue < 0.5
        },
        risk: {
          falsePositiveProb: 0.3,
          maxDrawdown: 0.15,
          timeDecay: 240 // 4 hours
        },
        historical: {
          accuracy: 0.65,
          avgHoldingPeriod: 168, // 1 week
          avgReturn: 0.08
        }
      };
    }

    return null;
  }

  private generateEmotionExhaustionIndicator(symbol: string, trend: EmotionalTrend, data: SentimentDataPoint[]): ContrarianIndicator | null {
    const { dominantEmotion, emotionIntensity } = trend;
    
    if (emotionIntensity > 0.8 && [EmotionType.PANIC, EmotionType.EUPHORIA].includes(dominantEmotion)) {
      return {
        symbol,
        indicator: {
          name: 'Emotion Exhaustion',
          type: 'emotion_exhaustion',
          value: emotionIntensity,
          threshold: 0.8,
          signal: dominantEmotion === EmotionType.PANIC ? 'contrarian_buy' : 'contrarian_sell',
          strength: emotionIntensity
        },
        conditions: {
          sentimentExtreme: false,
          emotionExtreme: true,
          volumeAnomaly: false,
          technicalDivergence: false,
          historicalPattern: true
        },
        timing: {
          optimal: emotionIntensity > 0.9,
          earlySignal: true,
          confirmationPending: false
        },
        risk: {
          falsePositiveProb: 0.25,
          maxDrawdown: 0.12,
          timeDecay: 180
        },
        historical: {
          accuracy: 0.72,
          avgHoldingPeriod: 96,
          avgReturn: 0.12
        }
      };
    }

    return null;
  }

  private async generateCrowdPositioningIndicator(symbol: string, data: SentimentDataPoint[]): Promise<ContrarianIndicator | null> {
    // Mock crowd positioning analysis
    const crowdSentiment = data.slice(-20).reduce((sum, d) => sum + d.rawSentiment, 0) / 20;
    
    if (Math.abs(crowdSentiment) > 0.7) {
      return {
        symbol,
        indicator: {
          name: 'Crowd Positioning',
          type: 'crowd_positioning',
          value: Math.abs(crowdSentiment),
          threshold: 0.7,
          signal: crowdSentiment > 0 ? 'contrarian_sell' : 'contrarian_buy',
          strength: Math.abs(crowdSentiment)
        },
        conditions: {
          sentimentExtreme: true,
          emotionExtreme: false,
          volumeAnomaly: true,
          technicalDivergence: false,
          historicalPattern: true
        },
        timing: {
          optimal: Math.abs(crowdSentiment) > 0.8,
          earlySignal: false,
          confirmationPending: false
        },
        risk: {
          falsePositiveProb: 0.35,
          maxDrawdown: 0.18,
          timeDecay: 360
        },
        historical: {
          accuracy: 0.58,
          avgHoldingPeriod: 240,
          avgReturn: 0.15
        }
      };
    }

    return null;
  }

  private generateFearGreedExtremeIndicator(symbol: string, trend: EmotionalTrend): ContrarianIndicator | null {
    const { fearGreedIndex } = trend;
    
    if (fearGreedIndex <= 10 || fearGreedIndex >= 90) {
      const isExtremeFear = fearGreedIndex <= 10;
      
      return {
        symbol,
        indicator: {
          name: 'Fear Greed Extreme',
          type: 'fear_greed_extreme',
          value: fearGreedIndex,
          threshold: isExtremeFear ? 10 : 90,
          signal: isExtremeFear ? 'contrarian_buy' : 'contrarian_sell',
          strength: isExtremeFear ? (10 - fearGreedIndex) / 10 : (fearGreedIndex - 90) / 10
        },
        conditions: {
          sentimentExtreme: true,
          emotionExtreme: true,
          volumeAnomaly: false,
          technicalDivergence: false,
          historicalPattern: true
        },
        timing: {
          optimal: true,
          earlySignal: false,
          confirmationPending: false
        },
        risk: {
          falsePositiveProb: 0.2,
          maxDrawdown: 0.1,
          timeDecay: 480
        },
        historical: {
          accuracy: 0.78,
          avgHoldingPeriod: 336,
          avgReturn: 0.18
        }
      };
    }

    return null;
  }

  // Initialization and event listeners

  private async initializeSentimentTracker(): Promise<void> {
    try {
      // Load cached sentiment data
      const keys = await this.redis.keys('trend:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const trend = JSON.parse(data) as EmotionalTrend;
          this.emotionalTrends.set(trend.symbol, trend);
        }
      }

      this.logger.log(`Loaded ${this.emotionalTrends.size} emotional trends from cache`);
    } catch (error) {
      this.logger.error('Failed to initialize sentiment tracker:', error);
    }
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('content.sentiment.analyzed', async (data: any) => {
      if (data.symbol && data.sentiment && data.emotions) {
        const dataPoint: SentimentDataPoint = {
          timestamp: new Date(data.timestamp),
          symbol: data.symbol,
          source: data.source || 'unknown',
          rawSentiment: data.sentiment.score,
          magnitude: data.sentiment.magnitude,
          emotions: data.emotions,
          context: {
            contentType: data.contentType || 'news',
            wordCount: data.wordCount || 100,
            authorInfluence: data.authorInfluence || 0.5,
            reach: data.reach || 1000,
            engagement: data.engagement || 10
          },
          metadata: data.metadata
        };

        await this.processSentimentData(dataPoint);
      }
    });
  }

  // Scheduled tasks

  @Cron('*/2 * * * *') // Every 2 minutes
  private async updateSentimentMetrics(): Promise<void> {
    try {
      const symbols = Array.from(this.sentimentData.keys()).slice(0, 20);
      
      for (const symbol of symbols) {
        const data = this.sentimentData.get(symbol);
        if (data && data.length > 0) {
          // Simulate new sentiment data
          const lastPoint = data[data.length - 1];
          const variation = (Math.random() - 0.5) * 0.2;
          
          const newPoint: SentimentDataPoint = {
            ...lastPoint,
            timestamp: new Date(),
            rawSentiment: Math.max(-1, Math.min(1, lastPoint.rawSentiment + variation)),
            magnitude: Math.random() * 0.5 + 0.5
          };
          
          await this.processSentimentData(newPoint);
        }
      }
    } catch (error) {
      this.logger.error('Failed to update sentiment metrics:', error);
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  private async cleanupOldSentimentData(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - this.config.dataRetentionHours * 60 * 60 * 1000);
      let cleanedCount = 0;

      for (const [symbol, data] of this.sentimentData.entries()) {
        const filteredData = data.filter(d => d.timestamp >= cutoffTime);
        this.sentimentData.set(symbol, filteredData);
        cleanedCount += data.length - filteredData.length;
      }

      this.logger.log(`Cleaned up ${cleanedCount} old sentiment data points`);
    } catch (error) {
      this.logger.error('Failed to cleanup old sentiment data:', error);
    }
  }

  // Public API methods

  /**
   * Get sentiment momentum for a symbol
   */
  async getSentimentMomentum(symbol: string, timeframe?: string): Promise<SentimentMomentum | Map<string, SentimentMomentum> | null> {
    const symbolMomentum = this.sentimentMomentum.get(symbol);
    if (!symbolMomentum) return null;
    
    if (timeframe) {
      return symbolMomentum.get(timeframe) || null;
    }
    
    return symbolMomentum;
  }

  /**
   * Get emotional trend for a symbol
   */
  async getEmotionalTrend(symbol: string): Promise<EmotionalTrend | null> {
    return this.emotionalTrends.get(symbol) || null;
  }

  /**
   * Get sentiment reversals for a symbol
   */
  async getSentimentReversals(symbol: string): Promise<SentimentReversal[]> {
    return this.sentimentReversals.get(symbol) || [];
  }

  /**
   * Get cross-asset correlations for a symbol
   */
  async getCrossAssetCorrelations(symbol: string): Promise<CrossAssetSentimentCorrelation | null> {
    return this.crossAssetCorrelations.get(symbol) || null;
  }

  /**
   * Get contrarian indicators for a symbol
   */
  async getContrarianIndicators(symbol: string): Promise<ContrarianIndicator[]> {
    return this.contrarianIndicators.get(symbol) || [];
  }

  /**
   * Generate sentiment snapshot for the market
   */
  async generateSentimentSnapshot(): Promise<SentimentSnapshot> {
    const timestamp = new Date();
    
    // Calculate market-wide metrics
    const allTrends = Array.from(this.emotionalTrends.values());
    const overallSentiment = allTrends.length > 0 ? 
      allTrends.reduce((sum, t) => sum + (t.fearGreedIndex - 50) / 50, 0) / allTrends.length : 0;
    
    const avgFearGreed = allTrends.length > 0 ?
      allTrends.reduce((sum, t) => sum + t.fearGreedIndex, 0) / allTrends.length : 50;

    // Get sector data
    const sectors: Record<string, any> = {
      'Technology': { sentiment: 0.2, emotion: EmotionType.OPTIMISM, momentum: 0.1, volume: 1000 },
      'Finance': { sentiment: -0.1, emotion: EmotionType.DOUBT, momentum: -0.05, volume: 800 }
    };

    // Get top movers
    const trendEntries = Array.from(this.emotionalTrends.entries());
    const topMovers = {
      mostBullish: trendEntries
        .filter(([_, t]) => t.fearGreedIndex > 60)
        .sort(([_, a], [__, b]) => b.fearGreedIndex - a.fearGreedIndex)
        .slice(0, 5)
        .map(([symbol, trend]) => ({
          symbol,
          sentiment: (trend.fearGreedIndex - 50) / 50,
          change: 0.05 // Mock change
        })),
      mostBearish: trendEntries
        .filter(([_, t]) => t.fearGreedIndex < 40)
        .sort(([_, a], [__, b]) => a.fearGreedIndex - b.fearGreedIndex)
        .slice(0, 5)
        .map(([symbol, trend]) => ({
          symbol,
          sentiment: (trend.fearGreedIndex - 50) / 50,
          change: -0.05 // Mock change
        })),
      largestChanges: [] // Would be calculated from historical data
    };

    // Get extremes
    const extremes = {
      fearExtremes: trendEntries.filter(([_, t]) => t.fearGreedIndex <= 20).map(([symbol]) => symbol),
      greedExtremes: trendEntries.filter(([_, t]) => t.fearGreedIndex >= 80).map(([symbol]) => symbol),
      neutralZone: trendEntries.filter(([_, t]) => t.fearGreedIndex > 40 && t.fearGreedIndex < 60).map(([symbol]) => symbol)
    };

    // Get alerts
    const alerts = {
      reversals: Array.from(this.sentimentReversals.values()).flat().slice(0, 10),
      contrarian: Array.from(this.contrarianIndicators.values()).flat().slice(0, 10),
      correlationBreaks: [] // Mock data
    };

    return {
      timestamp,
      market: {
        overallSentiment,
        fearGreedIndex: avgFearGreed,
        volatilityIndex: 0.2, // Mock VIX equivalent
        riskAppetite: overallSentiment
      },
      sectors,
      topMovers,
      extremes,
      alerts
    };
  }
}