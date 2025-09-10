/**
 * Trend Detection Service
 * 
 * Advanced real-time trend detection and analysis system that identifies:
 * - Market momentum and direction changes
 * - Social sentiment trends and viral content
 * - News velocity and breaking story patterns
 * - Technical pattern recognition
 * - Anomaly detection in market behavior
 * 
 * Uses statistical analysis, time-series processing, and machine learning
 * to provide actionable trend insights with confidence scoring
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import {
  TrendDetectionResult,
  DetectedTrend,
  MomentumAnalysis,
  SocialSentimentTrend,
  NewsVelocityMetrics,
  PatternRecognition,
  NLPProcessingResult
} from '../interfaces/nlp.interface';
import { NlpProcessingService } from './nlp-processing.service';

interface TrendDataPoint {
  timestamp: Date;
  value: number;
  source: string;
  metadata?: Record<string, any>;
}

interface TrendWindow {
  shortTerm: TrendDataPoint[];   // Last hour
  mediumTerm: TrendDataPoint[];  // Last 4 hours
  longTerm: TrendDataPoint[];    // Last 24 hours
}

interface SentimentTracker {
  symbol: string;
  currentSentiment: number;
  previousSentiment: number;
  volume: number;
  sources: Set<string>;
  keywords: string[];
  lastUpdated: Date;
}

interface NewsTracker {
  hourlyCount: number[];
  totalArticles: number;
  averageVelocity: number;
  peakVelocity: number;
  categories: Map<string, number>;
  sources: Map<string, number>;
  lastUpdate: Date;
}

@Injectable()
export class TrendDetectionService {
  private readonly logger = new Logger(TrendDetectionService.name);
  private readonly redis: Redis;
  private readonly eventEmitter: EventEmitter2;

  // In-memory trend tracking
  private readonly sentimentTrackers = new Map<string, SentimentTracker>();
  private readonly newsTracker: NewsTracker = {
    hourlyCount: new Array(24).fill(0),
    totalArticles: 0,
    averageVelocity: 0,
    peakVelocity: 0,
    categories: new Map(),
    sources: new Map(),
    lastUpdate: new Date()
  };

  // Trend detection parameters
  private readonly trendThresholds = {
    sentimentChange: 0.15,      // Minimum sentiment change to trigger trend
    momentumThreshold: 0.25,    // Minimum momentum for trend detection
    velocityMultiplier: 2.0,    // News velocity multiplier for trend detection
    volumeThreshold: 10,        // Minimum volume for valid trend
    confidenceThreshold: 0.6    // Minimum confidence for trend alerts
  };

  // Moving averages for trend smoothing
  private readonly movingAverages = {
    short: 5,    // 5-minute moving average
    medium: 15,  // 15-minute moving average
    long: 60     // 60-minute moving average
  };

  constructor(
    private configService: ConfigService,
    private nlpService: NlpProcessingService,
    eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter = eventEmitter;
    
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      maxRetriesPerRequest: 3,
      keyPrefix: 'trend-detection:'
    });

    this.initializeTrendDetection();
  }

  /**
   * Initialize trend detection system
   */
  private async initializeTrendDetection(): Promise<void> {
    try {
      // Load historical trend data from Redis
      await this.loadHistoricalTrendData();
      
      // Initialize event listeners
      this.setupEventListeners();
      
      this.logger.log('Trend detection system initialized');
    } catch (error) {
      this.logger.error('Failed to initialize trend detection system:', error);
    }
  }

  /**
   * Main trend detection method - analyzes current market state
   */
  async detectTrends(
    symbol?: string,
    timeframe?: 'real-time' | 'hourly' | 'daily'
  ): Promise<TrendDetectionResult> {
    const startTime = Date.now();

    try {
      // Collect current trend data
      const [
        detectedTrends,
        momentumAnalysis,
        socialSentimentTrend,
        newsVelocityMetrics,
        patterns
      ] = await Promise.all([
        this.detectMarketTrends(symbol),
        this.analyzeMomentum(symbol),
        this.analyzeSocialSentimentTrends(symbol),
        this.analyzeNewsVelocity(),
        this.recognizePatterns(symbol)
      ]);

      // Calculate overall alert level
      const alertLevel = this.calculateAlertLevel(
        detectedTrends,
        momentumAnalysis,
        socialSentimentTrend,
        newsVelocityMetrics
      );

      const result: TrendDetectionResult = {
        trends: detectedTrends,
        momentum: momentumAnalysis,
        socialSentiment: socialSentimentTrend,
        newsVelocity: newsVelocityMetrics,
        patterns,
        alertLevel,
        detectedAt: new Date()
      };

      // Cache results for performance
      await this.cacheDetectionResult(result, symbol);

      // Emit trend events for real-time subscribers
      if (alertLevel !== 'low') {
        this.eventEmitter.emit('trend.detected', {
          symbol,
          alertLevel,
          trends: detectedTrends.filter(t => t.confidence > this.trendThresholds.confidenceThreshold)
        });
      }

      this.logger.debug(`Trend detection completed in ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      this.logger.error('Trend detection failed:', error);
      throw new Error(`Trend detection failed: ${error.message}`);
    }
  }

  /**
   * Process new content for trend analysis
   */
  async processContentForTrends(
    content: string,
    source: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Perform NLP analysis on content
      const nlpResult = await this.nlpService.processText(content, {
        enableSentimentAnalysis: true,
        enableEntityExtraction: true,
        enableKeyPhraseExtraction: true
      });

      // Extract symbols and update sentiment tracking
      const symbols = this.extractSymbolsFromNLP(nlpResult);
      await this.updateSentimentTracking(symbols, nlpResult, source);

      // Update news velocity tracking
      await this.updateNewsVelocityTracking(source, metadata);

      // Check for immediate trend changes
      const immediateResults = await this.checkImmediateTrends(symbols, nlpResult);
      
      // Emit real-time updates if significant changes detected
      if (immediateResults.length > 0) {
        this.eventEmitter.emit('trend.real-time-update', {
          trends: immediateResults,
          timestamp: new Date()
        });
      }

    } catch (error) {
      this.logger.error('Failed to process content for trends:', error);
    }
  }

  /**
   * Detect market trends based on historical and current data
   */
  private async detectMarketTrends(symbol?: string): Promise<DetectedTrend[]> {
    const trends: DetectedTrend[] = [];

    try {
      const symbolsToAnalyze = symbol ? [symbol] : Array.from(this.sentimentTrackers.keys());

      for (const sym of symbolsToAnalyze.slice(0, 20)) { // Limit for performance
        const tracker = this.sentimentTrackers.get(sym);
        if (!tracker) continue;

        // Get historical data for trend analysis
        const trendWindow = await this.getTrendWindow(sym);
        
        // Analyze price trend
        const priceTrend = this.analyzePriceTrend(trendWindow);
        if (priceTrend) trends.push(priceTrend);

        // Analyze sentiment trend
        const sentimentTrend = this.analyzeSentimentTrend(tracker, trendWindow);
        if (sentimentTrend) trends.push(sentimentTrend);

        // Analyze volume trend
        const volumeTrend = this.analyzeVolumeTrend(tracker, trendWindow);
        if (volumeTrend) trends.push(volumeTrend);
      }

      // Sort by confidence and return top trends
      return trends
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);

    } catch (error) {
      this.logger.error('Failed to detect market trends:', error);
      return [];
    }
  }

  /**
   * Analyze market momentum across different timeframes
   */
  private async analyzeMomentum(symbol?: string): Promise<MomentumAnalysis> {
    try {
      const symbolsToAnalyze = symbol ? [symbol] : Array.from(this.sentimentTrackers.keys());
      
      let totalShortTerm = 0;
      let totalMediumTerm = 0;
      let totalLongTerm = 0;
      let totalVolume = 0;
      let count = 0;

      for (const sym of symbolsToAnalyze.slice(0, 10)) {
        const trendWindow = await this.getTrendWindow(sym);
        
        const shortMomentum = this.calculateMomentum(trendWindow.shortTerm);
        const mediumMomentum = this.calculateMomentum(trendWindow.mediumTerm);
        const longMomentum = this.calculateMomentum(trendWindow.longTerm);

        const tracker = this.sentimentTrackers.get(sym);
        const volume = tracker ? tracker.volume : 0;

        totalShortTerm += shortMomentum;
        totalMediumTerm += mediumMomentum;
        totalLongTerm += longMomentum;
        totalVolume += volume;
        count++;
      }

      if (count === 0) {
        return {
          overall: 0,
          shortTerm: 0,
          mediumTerm: 0,
          longTerm: 0,
          acceleration: 0,
          volume: 0,
          confidence: 0
        };
      }

      const shortTerm = totalShortTerm / count;
      const mediumTerm = totalMediumTerm / count;
      const longTerm = totalLongTerm / count;
      const volume = totalVolume / count;

      // Calculate acceleration (momentum of momentum)
      const acceleration = (shortTerm - mediumTerm) - (mediumTerm - longTerm);
      
      // Overall momentum weighted by timeframes
      const overall = (shortTerm * 0.5) + (mediumTerm * 0.3) + (longTerm * 0.2);
      
      // Confidence based on consistency and volume
      const consistency = 1 - Math.abs(shortTerm - longTerm) / 2;
      const volumeConfidence = Math.min(1, volume / 100);
      const confidence = (consistency + volumeConfidence) / 2;

      return {
        overall,
        shortTerm,
        mediumTerm,
        longTerm,
        acceleration,
        volume,
        confidence
      };

    } catch (error) {
      this.logger.error('Failed to analyze momentum:', error);
      return {
        overall: 0,
        shortTerm: 0,
        mediumTerm: 0,
        longTerm: 0,
        acceleration: 0,
        volume: 0,
        confidence: 0
      };
    }
  }

  /**
   * Analyze social sentiment trends
   */
  private async analyzeSocialSentimentTrends(symbol?: string): Promise<SocialSentimentTrend> {
    try {
      const symbolsToAnalyze = symbol ? [symbol] : Array.from(this.sentimentTrackers.keys());
      
      let totalCurrentSentiment = 0;
      let totalSentimentChange = 0;
      let totalVolume = 0;
      let allSources = new Set<string>();
      let allKeywords: string[] = [];
      let count = 0;

      for (const sym of symbolsToAnalyze.slice(0, 15)) {
        const tracker = this.sentimentTrackers.get(sym);
        if (!tracker) continue;

        totalCurrentSentiment += tracker.currentSentiment;
        totalSentimentChange += tracker.currentSentiment - tracker.previousSentiment;
        totalVolume += tracker.volume;
        
        tracker.sources.forEach(source => allSources.add(source));
        allKeywords.push(...tracker.keywords);
        count++;
      }

      if (count === 0) {
        return {
          currentSentiment: 0,
          sentimentChange: 0,
          volume: 0,
          sources: [],
          trending: false,
          keywords: []
        };
      }

      const currentSentiment = totalCurrentSentiment / count;
      const sentimentChange = totalSentimentChange / count;
      const volume = totalVolume / count;
      
      // Determine if trending based on change magnitude and volume
      const trending = Math.abs(sentimentChange) > this.trendThresholds.sentimentChange && 
                      volume > this.trendThresholds.volumeThreshold;

      // Get top keywords by frequency
      const keywordFreq = this.getKeywordFrequency(allKeywords);
      const topKeywords = Array.from(keywordFreq.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([keyword]) => keyword);

      return {
        currentSentiment,
        sentimentChange,
        volume,
        sources: Array.from(allSources),
        trending,
        keywords: topKeywords
      };

    } catch (error) {
      this.logger.error('Failed to analyze social sentiment trends:', error);
      return {
        currentSentiment: 0,
        sentimentChange: 0,
        volume: 0,
        sources: [],
        trending: false,
        keywords: []
      };
    }
  }

  /**
   * Analyze news velocity metrics
   */
  private async analyzeNewsVelocity(): Promise<NewsVelocityMetrics> {
    try {
      const currentHour = new Date().getHours();
      const articlesThisHour = this.newsTracker.hourlyCount[currentHour];
      
      // Calculate average velocity over last 24 hours
      const totalArticles = this.newsTracker.hourlyCount.reduce((sum, count) => sum + count, 0);
      const averageVelocity = totalArticles / 24;
      
      // Calculate velocity change
      const velocityChange = articlesThisHour / Math.max(averageVelocity, 1);

      return {
        articlesPerHour: articlesThisHour,
        velocityChange: velocityChange - 1, // Convert to percentage change
        averageVelocity,
        peakVelocity: Math.max(...this.newsTracker.hourlyCount),
        categories: Object.fromEntries(this.newsTracker.categories),
        sources: Object.fromEntries(this.newsTracker.sources)
      };

    } catch (error) {
      this.logger.error('Failed to analyze news velocity:', error);
      return {
        articlesPerHour: 0,
        velocityChange: 0,
        averageVelocity: 0,
        peakVelocity: 0,
        categories: {},
        sources: {}
      };
    }
  }

  /**
   * Recognize market patterns in trend data
   */
  private async recognizePatterns(symbol?: string): Promise<PatternRecognition[]> {
    const patterns: PatternRecognition[] = [];

    try {
      const symbolsToAnalyze = symbol ? [symbol] : Array.from(this.sentimentTrackers.keys());

      for (const sym of symbolsToAnalyze.slice(0, 10)) {
        const trendWindow = await this.getTrendWindow(sym);
        
        // Recognize common technical patterns
        const breakoutPattern = this.detectBreakoutPattern(trendWindow);
        if (breakoutPattern) patterns.push(breakoutPattern);

        const reversalPattern = this.detectReversalPattern(trendWindow);
        if (reversalPattern) patterns.push(reversalPattern);

        const momentumPattern = this.detectMomentumPattern(trendWindow);
        if (momentumPattern) patterns.push(momentumPattern);
      }

      return patterns.sort((a, b) => b.probability - a.probability);

    } catch (error) {
      this.logger.error('Failed to recognize patterns:', error);
      return [];
    }
  }

  // Helper methods for trend analysis

  private extractSymbolsFromNLP(nlpResult: NLPProcessingResult): string[] {
    return nlpResult.entities?.entities
      .filter(e => e.type === 'STOCK_SYMBOL')
      .map(e => e.text) || [];
  }

  private async updateSentimentTracking(
    symbols: string[],
    nlpResult: NLPProcessingResult,
    source: string
  ): Promise<void> {
    const sentiment = nlpResult.sentiment;
    if (!sentiment || symbols.length === 0) return;

    const keywords = nlpResult.keyPhrases?.keyPhrases
      .slice(0, 5)
      .map(p => p.text) || [];

    for (const symbol of symbols) {
      let tracker = this.sentimentTrackers.get(symbol);
      
      if (!tracker) {
        tracker = {
          symbol,
          currentSentiment: sentiment.score,
          previousSentiment: 0,
          volume: 1,
          sources: new Set([source]),
          keywords: [...keywords],
          lastUpdated: new Date()
        };
      } else {
        tracker.previousSentiment = tracker.currentSentiment;
        tracker.currentSentiment = (tracker.currentSentiment * 0.8) + (sentiment.score * 0.2);
        tracker.volume += 1;
        tracker.sources.add(source);
        tracker.keywords.push(...keywords);
        tracker.keywords = tracker.keywords.slice(-20); // Keep recent keywords
        tracker.lastUpdated = new Date();
      }
      
      this.sentimentTrackers.set(symbol, tracker);
      
      // Cache in Redis for persistence
      await this.cacheSentimentTracker(tracker);
    }
  }

  private async updateNewsVelocityTracking(source: string, metadata: Record<string, any>): Promise<void> {
    const currentHour = new Date().getHours();
    
    // Update hourly count
    this.newsTracker.hourlyCount[currentHour]++;
    this.newsTracker.totalArticles++;
    
    // Update source tracking
    const currentCount = this.newsTracker.sources.get(source) || 0;
    this.newsTracker.sources.set(source, currentCount + 1);
    
    // Update category tracking if provided
    if (metadata.category) {
      const categoryCount = this.newsTracker.categories.get(metadata.category) || 0;
      this.newsTracker.categories.set(metadata.category, categoryCount + 1);
    }
    
    // Update peak velocity
    this.newsTracker.peakVelocity = Math.max(
      this.newsTracker.peakVelocity,
      this.newsTracker.hourlyCount[currentHour]
    );
    
    this.newsTracker.lastUpdate = new Date();
  }

  private async checkImmediateTrends(
    symbols: string[],
    nlpResult: NLPProcessingResult
  ): Promise<DetectedTrend[]> {
    const trends: DetectedTrend[] = [];
    
    if (!nlpResult.sentiment) return trends;

    for (const symbol of symbols) {
      const tracker = this.sentimentTrackers.get(symbol);
      if (!tracker) continue;

      const sentimentChange = Math.abs(tracker.currentSentiment - tracker.previousSentiment);
      
      if (sentimentChange > this.trendThresholds.sentimentChange) {
        trends.push({
          id: `immediate_${symbol}_${Date.now()}`,
          type: 'sentiment',
          direction: tracker.currentSentiment > tracker.previousSentiment ? 'up' : 'down',
          strength: sentimentChange,
          duration: 0, // Immediate
          symbols: [symbol],
          description: `Immediate sentiment ${tracker.currentSentiment > tracker.previousSentiment ? 'increase' : 'decrease'} detected`,
          confidence: Math.min(1, sentimentChange * 2),
          isRealTime: true
        });
      }
    }

    return trends;
  }

  private async getTrendWindow(symbol: string): Promise<TrendWindow> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // In a real implementation, this would fetch from time-series database
    // For now, we'll simulate with cached data
    try {
      const [shortTerm, mediumTerm, longTerm] = await Promise.all([
        this.getDataPointsFromRedis(symbol, oneHourAgo, now),
        this.getDataPointsFromRedis(symbol, fourHoursAgo, now),
        this.getDataPointsFromRedis(symbol, oneDayAgo, now)
      ]);

      return {
        shortTerm: shortTerm || [],
        mediumTerm: mediumTerm || [],
        longTerm: longTerm || []
      };
    } catch (error) {
      this.logger.warn(`Failed to get trend window for ${symbol}:`, error);
      return { shortTerm: [], mediumTerm: [], longTerm: [] };
    }
  }

  private analyzePriceTrend(trendWindow: TrendWindow): DetectedTrend | null {
    // Simplified price trend analysis
    if (trendWindow.longTerm.length < 2) return null;

    const values = trendWindow.longTerm.map(dp => dp.value);
    const slope = this.calculateSlope(values);
    
    if (Math.abs(slope) < 0.01) return null; // Not significant

    return {
      id: `price_trend_${Date.now()}`,
      type: 'price',
      direction: slope > 0 ? 'up' : 'down',
      strength: Math.abs(slope),
      duration: trendWindow.longTerm.length,
      symbols: [], // Would be filled by caller
      description: `Price trending ${slope > 0 ? 'upward' : 'downward'}`,
      confidence: Math.min(1, Math.abs(slope) * 10),
      isRealTime: false
    };
  }

  private analyzeSentimentTrend(tracker: SentimentTracker, trendWindow: TrendWindow): DetectedTrend | null {
    const sentimentChange = tracker.currentSentiment - tracker.previousSentiment;
    
    if (Math.abs(sentimentChange) < this.trendThresholds.sentimentChange) return null;

    return {
      id: `sentiment_trend_${tracker.symbol}_${Date.now()}`,
      type: 'sentiment',
      direction: sentimentChange > 0 ? 'up' : 'down',
      strength: Math.abs(sentimentChange),
      duration: Math.floor((Date.now() - tracker.lastUpdated.getTime()) / (60 * 1000)),
      symbols: [tracker.symbol],
      description: `Sentiment trending ${sentimentChange > 0 ? 'positive' : 'negative'}`,
      confidence: Math.min(1, Math.abs(sentimentChange) * 2),
      isRealTime: true
    };
  }

  private analyzeVolumeTrend(tracker: SentimentTracker, trendWindow: TrendWindow): DetectedTrend | null {
    if (tracker.volume < this.trendThresholds.volumeThreshold * 2) return null;

    return {
      id: `volume_trend_${tracker.symbol}_${Date.now()}`,
      type: 'volume',
      direction: 'up',
      strength: Math.min(1, tracker.volume / 100),
      duration: Math.floor((Date.now() - tracker.lastUpdated.getTime()) / (60 * 1000)),
      symbols: [tracker.symbol],
      description: 'High discussion volume detected',
      confidence: Math.min(1, tracker.volume / 50),
      isRealTime: true
    };
  }

  private calculateMomentum(dataPoints: TrendDataPoint[]): number {
    if (dataPoints.length < 2) return 0;

    const values = dataPoints.map(dp => dp.value);
    const slope = this.calculateSlope(values);
    
    // Normalize momentum to -1 to 1 range
    return Math.max(-1, Math.min(1, slope * 100));
  }

  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squared indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  private getKeywordFrequency(keywords: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    
    keywords.forEach(keyword => {
      const count = freq.get(keyword) || 0;
      freq.set(keyword, count + 1);
    });

    return freq;
  }

  private detectBreakoutPattern(trendWindow: TrendWindow): PatternRecognition | null {
    // Simplified breakout pattern detection
    if (trendWindow.longTerm.length < 10) return null;

    const values = trendWindow.longTerm.map(dp => dp.value);
    const recentAvg = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const historicalAvg = values.slice(0, -3).reduce((sum, val) => sum + val, 0) / (values.length - 3);
    
    const breakoutStrength = Math.abs(recentAvg - historicalAvg) / Math.abs(historicalAvg);
    
    if (breakoutStrength < 0.1) return null;

    return {
      pattern: 'Breakout',
      type: recentAvg > historicalAvg ? 'bullish' : 'bearish',
      probability: Math.min(1, breakoutStrength * 5),
      timeframe: 'short-term',
      description: `${recentAvg > historicalAvg ? 'Bullish' : 'Bearish'} breakout pattern detected`,
      historicalAccuracy: 0.7 // Would be calculated from historical data
    };
  }

  private detectReversalPattern(trendWindow: TrendWindow): PatternRecognition | null {
    // Simplified reversal pattern detection
    if (trendWindow.mediumTerm.length < 6) return null;

    const values = trendWindow.mediumTerm.map(dp => dp.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstSlope = this.calculateSlope(firstHalf);
    const secondSlope = this.calculateSlope(secondHalf);
    
    // Check for slope reversal
    if (firstSlope * secondSlope < 0 && Math.abs(firstSlope) > 0.01 && Math.abs(secondSlope) > 0.01) {
      return {
        pattern: 'Reversal',
        type: secondSlope > 0 ? 'bullish' : 'bearish',
        probability: Math.min(1, Math.abs(firstSlope - secondSlope) * 10),
        timeframe: 'medium-term',
        description: `Trend reversal pattern detected`,
        historicalAccuracy: 0.6
      };
    }

    return null;
  }

  private detectMomentumPattern(trendWindow: TrendWindow): PatternRecognition | null {
    // Simplified momentum pattern detection
    const shortMomentum = this.calculateMomentum(trendWindow.shortTerm);
    const mediumMomentum = this.calculateMomentum(trendWindow.mediumTerm);
    
    if (Math.abs(shortMomentum) < 0.3) return null;

    const accelerating = Math.abs(shortMomentum) > Math.abs(mediumMomentum);
    
    return {
      pattern: accelerating ? 'Accelerating Momentum' : 'Steady Momentum',
      type: shortMomentum > 0 ? 'bullish' : 'bearish',
      probability: Math.min(1, Math.abs(shortMomentum)),
      timeframe: 'short-term',
      description: `${accelerating ? 'Accelerating' : 'Steady'} ${shortMomentum > 0 ? 'bullish' : 'bearish'} momentum`,
      historicalAccuracy: 0.65
    };
  }

  private calculateAlertLevel(
    trends: DetectedTrend[],
    momentum: MomentumAnalysis,
    sentiment: SocialSentimentTrend,
    newsVelocity: NewsVelocityMetrics
  ): 'low' | 'medium' | 'high' | 'critical' {
    let alertScore = 0;

    // Score based on trend strength and confidence
    const strongTrends = trends.filter(t => t.confidence > 0.7 && t.strength > 0.5);
    alertScore += strongTrends.length * 0.25;

    // Score based on momentum
    alertScore += Math.abs(momentum.overall) * 0.3;
    alertScore += Math.abs(momentum.acceleration) * 0.2;

    // Score based on sentiment change
    if (sentiment.trending) {
      alertScore += Math.abs(sentiment.sentimentChange) * 0.4;
    }

    // Score based on news velocity
    if (newsVelocity.velocityChange > 1.5) {
      alertScore += 0.3;
    }

    // Classify alert level
    if (alertScore > 1.5) return 'critical';
    if (alertScore > 1.0) return 'high';
    if (alertScore > 0.5) return 'medium';
    return 'low';
  }

  // Caching and persistence methods

  private async cacheDetectionResult(result: TrendDetectionResult, symbol?: string): Promise<void> {
    try {
      const key = `detection-result:${symbol || 'all'}:${Date.now()}`;
      await this.redis.setex(key, 300, JSON.stringify(result)); // Cache for 5 minutes
    } catch (error) {
      this.logger.warn('Failed to cache detection result:', error);
    }
  }

  private async cacheSentimentTracker(tracker: SentimentTracker): Promise<void> {
    try {
      const key = `sentiment-tracker:${tracker.symbol}`;
      await this.redis.setex(key, 3600, JSON.stringify(tracker)); // Cache for 1 hour
    } catch (error) {
      this.logger.warn('Failed to cache sentiment tracker:', error);
    }
  }

  private async getDataPointsFromRedis(
    symbol: string,
    startTime: Date,
    endTime: Date
  ): Promise<TrendDataPoint[]> {
    try {
      // This would typically use Redis time series or sorted sets
      // For now, return empty array
      return [];
    } catch (error) {
      this.logger.warn('Failed to get data points from Redis:', error);
      return [];
    }
  }

  private async loadHistoricalTrendData(): Promise<void> {
    try {
      // Load sentiment trackers from Redis
      const keys = await this.redis.keys('sentiment-tracker:*');
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const tracker = JSON.parse(data) as SentimentTracker;
          tracker.sources = new Set(tracker.sources); // Restore Set type
          this.sentimentTrackers.set(tracker.symbol, tracker);
        }
      }

      this.logger.log(`Loaded ${this.sentimentTrackers.size} sentiment trackers from cache`);
    } catch (error) {
      this.logger.warn('Failed to load historical trend data:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for content processing events
    this.eventEmitter.on('content.processed', async (data) => {
      if (data.content && data.source) {
        await this.processContentForTrends(data.content, data.source, data.metadata || {});
      }
    });
  }

  // Scheduled tasks

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async performPeriodicTrendAnalysis(): Promise<void> {
    try {
      // Run trend detection for top symbols
      const topSymbols = Array.from(this.sentimentTrackers.entries())
        .sort(([,a], [,b]) => b.volume - a.volume)
        .slice(0, 10)
        .map(([symbol]) => symbol);

      for (const symbol of topSymbols) {
        await this.detectTrends(symbol);
      }

    } catch (error) {
      this.logger.error('Periodic trend analysis failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  private async cleanupOldData(): Promise<void> {
    try {
      // Remove old sentiment trackers
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [symbol, tracker] of this.sentimentTrackers.entries()) {
        if (tracker.lastUpdated < cutoffTime) {
          this.sentimentTrackers.delete(symbol);
          await this.redis.del(`sentiment-tracker:${symbol}`);
        }
      }

      // Reset hourly news count (circular buffer)
      const currentHour = new Date().getHours();
      this.newsTracker.hourlyCount[currentHour] = 0;

      this.logger.log('Completed data cleanup');
    } catch (error) {
      this.logger.error('Data cleanup failed:', error);
    }
  }
}