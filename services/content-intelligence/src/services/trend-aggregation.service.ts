/**
 * Trend Aggregation Service
 * 
 * Advanced multi-source trend consolidation and analysis system.
 * Features:
 * - Multi-source trend consolidation with intelligent weighting
 * - Weighted trend scoring using machine learning
 * - Cross-platform trend validation and verification
 * - Trend hierarchy and categorization system
 * - Real-time trend ranking with dynamic scoring
 * - Conflict resolution for contradictory trends
 * - Trend confidence assessment and uncertainty quantification
 * - Time-weighted trend analysis and decay modeling
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

// Import trend services
import { RealtimeTrendDetectorService } from './realtime-trend-detector.service';
import { ContentVelocityAnalyzerService } from './content-velocity-analyzer.service';
import { SentimentTrendTrackerService } from './sentiment-trend-tracker.service';
import { PatternRecognitionService } from './pattern-recognition.service';

// Enums and Types
enum TrendSourceType {
  REALTIME_DETECTOR = 'realtime_detector',
  VELOCITY_ANALYZER = 'velocity_analyzer',
  SENTIMENT_TRACKER = 'sentiment_tracker',
  PATTERN_RECOGNITION = 'pattern_recognition',
  MARKET_DATA = 'market_data',
  SOCIAL_MEDIA = 'social_media',
  NEWS_FLOW = 'news_flow',
  TECHNICAL_ANALYSIS = 'technical_analysis',
  FUNDAMENTAL_ANALYSIS = 'fundamental_analysis'
}

enum TrendCategory {
  PRICE_MOVEMENT = 'price_movement',
  VOLUME_PATTERN = 'volume_pattern',
  SENTIMENT_SHIFT = 'sentiment_shift',
  TECHNICAL_PATTERN = 'technical_pattern',
  FUNDAMENTAL_CHANGE = 'fundamental_change',
  SOCIAL_BUZZ = 'social_buzz',
  NEWS_CATALYST = 'news_catalyst',
  MARKET_STRUCTURE = 'market_structure'
}

enum TrendHierarchy {
  MACRO = 'macro',           // Market-wide trends
  SECTOR = 'sector',         // Sector-specific trends
  STOCK = 'stock',           // Individual stock trends
  THEME = 'theme',           // Thematic trends (ESG, Tech, etc.)
  EVENT = 'event'            // Event-driven trends
}

enum ConflictResolutionStrategy {
  WEIGHTED_AVERAGE = 'weighted_average',
  HIGHEST_CONFIDENCE = 'highest_confidence',
  MOST_RECENT = 'most_recent',
  CONSENSUS_VOTING = 'consensus_voting',
  ML_ARBITRATION = 'ml_arbitration'
}

// Interfaces
interface TrendSource {
  id: string;
  type: TrendSourceType;
  name: string;
  weight: number; // 0-1 base weight
  reliability: number; // Historical reliability score
  latency: number; // Average latency in seconds
  coverage: string[]; // Asset types/symbols covered
  lastUpdate: Date;
  active: boolean;
  
  // Performance metrics
  metrics: {
    accuracy: number; // Historical accuracy
    precision: number; // Precision in trend detection
    recall: number; // Recall in trend detection
    falsePositiveRate: number;
    averageConfidence: number;
    uptimePercentage: number;
  };
  
  // Source-specific configuration
  config: {
    minConfidence: number;
    maxAge: number; // Maximum age of trends to consider (seconds)
    supportedTimeframes: string[];
    dataRefreshRate: number; // seconds
  };
}

interface RawTrend {
  id: string;
  sourceId: string;
  sourceType: TrendSourceType;
  symbol: string;
  category: TrendCategory;
  hierarchy: TrendHierarchy;
  
  // Core trend data
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  confidence: number; // 0-1
  timeframe: string;
  detectedAt: Date;
  expiresAt: Date;
  
  // Trend specifics
  details: {
    description: string;
    triggers: string[];
    supportingFactors: string[];
    opposingFactors: string[];
    keyLevels: number[];
    expectedDuration: number; // hours
    magnitude: number; // expected percentage move
  };
  
  // Context and metadata
  context: {
    marketCondition: string;
    volatilityLevel: string;
    volumeProfile: string;
    correlatedSymbols: string[];
    sectorInfluence: string[];
  };
  
  metadata: Record<string, any>;
}

interface AggregatedTrend {
  id: string;
  symbol: string;
  category: TrendCategory;
  hierarchy: TrendHierarchy;
  
  // Aggregated properties
  consensus: {
    direction: 'bullish' | 'bearish' | 'neutral';
    strength: number; // Weighted average strength
    confidence: number; // Combined confidence score
    agreement: number; // Level of agreement between sources (0-1)
    participatingSourcesCount: number;
  };
  
  // Source breakdown
  sources: {
    [sourceId: string]: {
      weight: number;
      contribution: number; // Percentage contribution to final score
      alignment: number; // How aligned with consensus (-1 to 1)
      trend: RawTrend;
    };
  };
  
  // Temporal analysis
  temporal: {
    createdAt: Date;
    lastUpdated: Date;
    stability: number; // How stable the trend has been over time
    momentum: number; // Rate of change in strength
    persistence: number; // How long the trend has persisted
    decay: number; // Current decay factor based on age
  };
  
  // Validation and quality
  validation: {
    crossValidated: boolean;
    conflictResolution: ConflictResolutionStrategy | null;
    qualityScore: number; // Overall quality assessment
    reliabilityScore: number; // Based on source reliability
    consistencyScore: number; // Internal consistency
    outlierSources: string[]; // Sources that significantly disagree
  };
  
  // Prediction and forecast
  forecast: {
    expectedDuration: number; // hours
    probabilityOfContinuation: number;
    expectedMagnitude: number; // percentage move
    peakTime: Date | null;
    decayTime: Date | null;
    riskFactors: string[];
  };
  
  // Alerts and notifications
  alerts: {
    strengthThresholdCrossed: boolean;
    confidenceThresholdCrossed: boolean;
    newSourcesAdded: boolean;
    conflictDetected: boolean;
    qualityDegraded: boolean;
  };
}

interface TrendRanking {
  ranking: Array<{
    trend: AggregatedTrend;
    score: number;
    rank: number;
    rankChange: number; // Change since last ranking
    category: TrendCategory;
    timeInRanking: number; // hours
  }>;
  
  metadata: {
    generatedAt: Date;
    totalTrends: number;
    averageQuality: number;
    coverageByCategory: Record<TrendCategory, number>;
    coverageByHierarchy: Record<TrendHierarchy, number>;
    topSources: string[];
  };
  
  // Category-specific rankings
  categoryRankings: {
    [category in TrendCategory]: Array<{
      trend: AggregatedTrend;
      categoryScore: number;
      categoryRank: number;
    }>;
  };
  
  // Time-based analysis
  temporal: {
    emerging: AggregatedTrend[]; // Recently emerged trends
    strengthening: AggregatedTrend[]; // Gaining strength
    weakening: AggregatedTrend[]; // Losing strength
    stable: AggregatedTrend[]; // Stable trends
    expiring: AggregatedTrend[]; // About to expire
  };
}

interface ConflictAnalysis {
  conflictId: string;
  symbol: string;
  conflictingTrends: RawTrend[];
  conflictType: 'directional' | 'strength' | 'timeframe' | 'magnitude';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Conflict details
  details: {
    primaryConflict: string;
    contradictionLevel: number; // 0-1
    affectedSources: string[];
    timeframeOverlap: boolean;
    strengthDisparity: number;
    confidenceDisparity: number;
  };
  
  // Resolution
  resolution: {
    strategy: ConflictResolutionStrategy;
    resolvedDirection: 'bullish' | 'bearish' | 'neutral';
    resolvedStrength: number;
    resolvedConfidence: number;
    reasoning: string[];
    sourcesExcluded: string[];
    qualityImpact: number; // Impact on final quality (-1 to 1)
  };
  
  // Monitoring
  monitoring: {
    needsReview: boolean;
    escalationLevel: number; // 0-3
    reviewedAt: Date | null;
    resolvedAt: Date;
    followUpRequired: boolean;
  };
}

interface TrendValidation {
  symbol: string;
  trendId: string;
  validationType: 'cross_source' | 'cross_platform' | 'historical' | 'technical' | 'fundamental';
  
  validation: {
    passed: boolean;
    score: number; // 0-1
    criteria: Array<{
      name: string;
      passed: boolean;
      score: number;
      weight: number;
      description: string;
    }>;
  };
  
  crossValidation: {
    independentSources: number;
    agreementLevel: number; // 0-1
    timeConsistency: number; // 0-1
    magnitudeConsistency: number; // 0-1
    directionConsistency: number; // 0-1
  };
  
  qualityAssessment: {
    dataQuality: number;
    sourceCredibility: number;
    temporalConsistency: number;
    logicalConsistency: number;
    overallQuality: number;
  };
}

@Injectable()
export class TrendAggregationService implements OnModuleInit {
  private readonly logger = new Logger(TrendAggregationService.name);
  private readonly redis: Redis;

  // Service dependencies
  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private realtimeTrendDetector: RealtimeTrendDetectorService,
    private contentVelocityAnalyzer: ContentVelocityAnalyzerService,
    private sentimentTrendTracker: SentimentTrendTrackerService,
    private patternRecognition: PatternRecognitionService
  ) {
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      maxRetriesPerRequest: 3,
      keyPrefix: 'trend-aggregation:'
    });
  }

  // In-memory data structures
  private readonly trendSources = new Map<string, TrendSource>();
  private readonly rawTrends = new Map<string, Map<string, RawTrend>>(); // symbol -> trends
  private readonly aggregatedTrends = new Map<string, AggregatedTrend>();
  private readonly conflictAnalyses = new Map<string, ConflictAnalysis>();
  private readonly trendValidations = new Map<string, TrendValidation>();
  private readonly trendRankings = new Map<string, TrendRanking>(); // timeframe -> ranking

  // Configuration
  private readonly config = {
    // Aggregation settings
    minSourcesForAggregation: 2,
    maxTrendAge: 86400, // 24 hours in seconds
    decayHalfLife: 3600, // 1 hour in seconds
    confidenceThreshold: 0.6,
    strengthThreshold: 0.5,
    
    // Conflict resolution
    conflictThreshold: 0.3, // Threshold for detecting conflicts
    maxConflictSeverity: 'high' as const,
    
    // Validation settings
    minValidationScore: 0.7,
    crossValidationThreshold: 0.8,
    
    // Ranking settings
    rankingUpdateInterval: 300, // 5 minutes
    maxRankingSize: 100,
    
    // Performance settings
    batchSize: 50,
    aggregationInterval: 60, // 1 minute
    cleanupInterval: 3600, // 1 hour
    
    // Weighting factors
    sourceWeights: {
      [TrendSourceType.REALTIME_DETECTOR]: 0.25,
      [TrendSourceType.VELOCITY_ANALYZER]: 0.20,
      [TrendSourceType.SENTIMENT_TRACKER]: 0.20,
      [TrendSourceType.PATTERN_RECOGNITION]: 0.15,
      [TrendSourceType.MARKET_DATA]: 0.10,
      [TrendSourceType.SOCIAL_MEDIA]: 0.05,
      [TrendSourceType.NEWS_FLOW]: 0.03,
      [TrendSourceType.TECHNICAL_ANALYSIS]: 0.02,
    },
    
    categoryWeights: {
      [TrendCategory.PRICE_MOVEMENT]: 1.0,
      [TrendCategory.VOLUME_PATTERN]: 0.8,
      [TrendCategory.SENTIMENT_SHIFT]: 0.7,
      [TrendCategory.TECHNICAL_PATTERN]: 0.9,
      [TrendCategory.FUNDAMENTAL_CHANGE]: 0.6,
      [TrendCategory.SOCIAL_BUZZ]: 0.4,
      [TrendCategory.NEWS_CATALYST]: 0.5,
      [TrendCategory.MARKET_STRUCTURE]: 0.3
    }
  };

  async onModuleInit(): Promise<void> {
    await this.initializeTrendAggregation();
    this.setupEventListeners();
    await this.initializeTrendSources();
    this.startAggregationEngine();
    this.logger.log('Trend Aggregation Service initialized');
  }

  /**
   * Add a raw trend from a source
   */
  async addRawTrend(rawTrend: RawTrend): Promise<void> {
    const { symbol, sourceId } = rawTrend;

    // Validate the raw trend
    if (!this.validateRawTrend(rawTrend)) {
      this.logger.warn(`Invalid raw trend from source ${sourceId} for ${symbol}`);
      return;
    }

    // Store the raw trend
    if (!this.rawTrends.has(symbol)) {
      this.rawTrends.set(symbol, new Map());
    }
    
    const symbolTrends = this.rawTrends.get(symbol)!;
    symbolTrends.set(rawTrend.id, rawTrend);

    // Update source metrics
    await this.updateSourceMetrics(sourceId, rawTrend);

    // Cache the raw trend
    await this.cacheRawTrend(rawTrend);

    // Trigger aggregation for this symbol
    await this.aggregateTrendsForSymbol(symbol);

    // Emit event
    this.eventEmitter.emit('trend.raw.added', {
      symbol,
      trend: rawTrend,
      timestamp: new Date()
    });
  }

  /**
   * Aggregate trends for a specific symbol
   */
  private async aggregateTrendsForSymbol(symbol: string): Promise<AggregatedTrend | null> {
    const symbolTrends = this.rawTrends.get(symbol);
    if (!symbolTrends || symbolTrends.size < this.config.minSourcesForAggregation) {
      return null;
    }

    // Filter active and valid trends
    const activeTrends = Array.from(symbolTrends.values())
      .filter(trend => this.isTrendActive(trend))
      .filter(trend => trend.confidence >= this.config.confidenceThreshold);

    if (activeTrends.length < this.config.minSourcesForAggregation) {
      return null;
    }

    // Group trends by category and hierarchy
    const trendGroups = this.groupTrends(activeTrends);

    // Process each group
    const aggregatedTrends: AggregatedTrend[] = [];
    
    for (const [categoryHierarchy, trends] of trendGroups.entries()) {
      const [category, hierarchy] = categoryHierarchy.split('_') as [TrendCategory, TrendHierarchy];
      
      if (trends.length >= this.config.minSourcesForAggregation) {
        const aggregated = await this.aggregateTrendGroup(symbol, category, hierarchy, trends);
        if (aggregated) {
          aggregatedTrends.push(aggregated);
        }
      }
    }

    // Select the best aggregated trend for the symbol
    if (aggregatedTrends.length === 0) return null;

    const bestTrend = aggregatedTrends.reduce((best, current) => 
      current.validation.qualityScore > best.validation.qualityScore ? current : best
    );

    // Store the aggregated trend
    this.aggregatedTrends.set(symbol, bestTrend);
    await this.cacheAggregatedTrend(bestTrend);

    // Emit event
    this.eventEmitter.emit('trend.aggregated', {
      symbol,
      trend: bestTrend,
      timestamp: new Date()
    });

    return bestTrend;
  }

  /**
   * Aggregate a group of trends into a single trend
   */
  private async aggregateTrendGroup(
    symbol: string,
    category: TrendCategory,
    hierarchy: TrendHierarchy,
    trends: RawTrend[]
  ): Promise<AggregatedTrend | null> {
    // Detect and resolve conflicts
    const conflicts = this.detectConflicts(trends);
    let resolvedTrends = trends;
    
    if (conflicts.length > 0) {
      const resolutionResult = await this.resolveConflicts(symbol, conflicts);
      resolvedTrends = resolutionResult.resolvedTrends;
      
      // Store conflict analyses
      for (const analysis of resolutionResult.analyses) {
        this.conflictAnalyses.set(analysis.conflictId, analysis);
      }
    }

    // Calculate weighted consensus
    const consensus = this.calculateConsensus(resolvedTrends);
    
    // Build source breakdown
    const sources: AggregatedTrend['sources'] = {};
    for (const trend of resolvedTrends) {
      const source = this.trendSources.get(trend.sourceId);
      if (source) {
        const weight = this.calculateSourceWeight(source, trend);
        const contribution = weight / resolvedTrends.reduce((sum, t) => {
          const s = this.trendSources.get(t.sourceId);
          return sum + (s ? this.calculateSourceWeight(s, t) : 0);
        }, 0);
        
        sources[trend.sourceId] = {
          weight,
          contribution,
          alignment: this.calculateAlignment(trend, consensus),
          trend
        };
      }
    }

    // Calculate temporal properties
    const temporal = this.calculateTemporalProperties(resolvedTrends);
    
    // Perform validation
    const validation = await this.validateAggregatedTrend(symbol, category, hierarchy, resolvedTrends, consensus);
    
    // Generate forecast
    const forecast = this.generateForecast(resolvedTrends, consensus, temporal);
    
    // Check for alerts
    const alerts = this.checkAlerts(consensus, validation, conflicts);

    const aggregatedTrend: AggregatedTrend = {
      id: `agg_${symbol}_${category}_${hierarchy}_${Date.now()}`,
      symbol,
      category,
      hierarchy,
      consensus,
      sources,
      temporal,
      validation,
      forecast,
      alerts
    };

    return aggregatedTrend;
  }

  /**
   * Calculate weighted consensus from trends
   */
  private calculateConsensus(trends: RawTrend[]): AggregatedTrend['consensus'] {
    const weights = trends.map(trend => {
      const source = this.trendSources.get(trend.sourceId);
      return source ? this.calculateSourceWeight(source, trend) : 0;
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Calculate direction consensus using weighted voting
    const directionVotes = { bullish: 0, bearish: 0, neutral: 0 };
    trends.forEach((trend, index) => {
      directionVotes[trend.direction] += weights[index];
    });

    const consensusDirection = Object.entries(directionVotes)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as 'bullish' | 'bearish' | 'neutral';

    // Calculate weighted averages
    const weightedStrength = trends.reduce((sum, trend, index) => 
      sum + trend.strength * weights[index], 0) / totalWeight;
    
    const weightedConfidence = trends.reduce((sum, trend, index) => 
      sum + trend.confidence * weights[index], 0) / totalWeight;

    // Calculate agreement level
    const agreement = this.calculateAgreementLevel(trends, consensusDirection);

    return {
      direction: consensusDirection,
      strength: weightedStrength,
      confidence: weightedConfidence,
      agreement,
      participatingSourcesCount: trends.length
    };
  }

  /**
   * Detect conflicts between trends
   */
  private detectConflicts(trends: RawTrend[]): Array<{ trends: RawTrend[]; type: ConflictAnalysis['conflictType'] }> {
    const conflicts: Array<{ trends: RawTrend[]; type: ConflictAnalysis['conflictType'] }> = [];

    // Check for directional conflicts
    const directions = new Set(trends.map(t => t.direction));
    if (directions.size > 1 && directions.has('bullish') && directions.has('bearish')) {
      const conflictingTrends = trends.filter(t => t.direction === 'bullish' || t.direction === 'bearish');
      if (conflictingTrends.length >= 2) {
        conflicts.push({ trends: conflictingTrends, type: 'directional' });
      }
    }

    // Check for strength conflicts
    const strengths = trends.map(t => t.strength);
    const strengthRange = Math.max(...strengths) - Math.min(...strengths);
    if (strengthRange > this.config.conflictThreshold) {
      conflicts.push({ trends, type: 'strength' });
    }

    // Check for magnitude conflicts
    const magnitudes = trends.map(t => t.details.magnitude);
    const magnitudeRange = Math.max(...magnitudes) - Math.min(...magnitudes);
    if (magnitudeRange > this.config.conflictThreshold) {
      conflicts.push({ trends, type: 'magnitude' });
    }

    return conflicts;
  }

  /**
   * Resolve conflicts using various strategies
   */
  private async resolveConflicts(
    symbol: string,
    conflicts: Array<{ trends: RawTrend[]; type: ConflictAnalysis['conflictType'] }>
  ): Promise<{ resolvedTrends: RawTrend[]; analyses: ConflictAnalysis[] }> {
    const analyses: ConflictAnalysis[] = [];
    let resolvedTrends: RawTrend[] = [];

    for (const conflict of conflicts) {
      const analysis = await this.analyzeConflict(symbol, conflict.trends, conflict.type);
      analyses.push(analysis);

      // Apply resolution strategy
      const resolved = this.applyConflictResolution(conflict.trends, analysis.resolution.strategy);
      resolvedTrends = resolvedTrends.concat(resolved);
    }

    // Remove duplicates
    const uniqueResolved = resolvedTrends.filter((trend, index, self) => 
      self.findIndex(t => t.id === trend.id) === index
    );

    return { resolvedTrends: uniqueResolved, analyses };
  }

  /**
   * Analyze a specific conflict
   */
  private async analyzeConflict(
    symbol: string,
    conflictingTrends: RawTrend[],
    conflictType: ConflictAnalysis['conflictType']
  ): Promise<ConflictAnalysis> {
    const conflictId = `conflict_${symbol}_${conflictType}_${Date.now()}`;
    
    // Calculate conflict severity
    const severity = this.calculateConflictSeverity(conflictingTrends, conflictType);
    
    // Determine resolution strategy
    const strategy = this.selectResolutionStrategy(conflictingTrends, conflictType, severity);
    
    // Calculate conflict details
    const details = this.calculateConflictDetails(conflictingTrends, conflictType);
    
    // Resolve the conflict
    const resolution = this.resolveConflictWithStrategy(conflictingTrends, strategy);

    const analysis: ConflictAnalysis = {
      conflictId,
      symbol,
      conflictingTrends,
      conflictType,
      severity,
      details,
      resolution,
      monitoring: {
        needsReview: severity === 'high' || severity === 'critical',
        escalationLevel: severity === 'critical' ? 3 : severity === 'high' ? 2 : 1,
        reviewedAt: null,
        resolvedAt: new Date(),
        followUpRequired: severity === 'critical'
      }
    };

    return analysis;
  }

  /**
   * Apply conflict resolution strategy
   */
  private applyConflictResolution(trends: RawTrend[], strategy: ConflictResolutionStrategy): RawTrend[] {
    switch (strategy) {
      case ConflictResolutionStrategy.HIGHEST_CONFIDENCE:
        return [trends.reduce((highest, current) => 
          current.confidence > highest.confidence ? current : highest
        )];
        
      case ConflictResolutionStrategy.MOST_RECENT:
        return [trends.reduce((latest, current) => 
          current.detectedAt > latest.detectedAt ? current : latest
        )];
        
      case ConflictResolutionStrategy.WEIGHTED_AVERAGE:
        // For weighted average, we keep all trends and let the consensus calculation handle it
        return trends;
        
      case ConflictResolutionStrategy.CONSENSUS_VOTING:
        // Group by direction and keep the majority
        const directionGroups = this.groupBy(trends, 'direction');
        const majorityDirection = Object.entries(directionGroups)
          .reduce((a, b) => a[1].length > b[1].length ? a : b)[0];
        return directionGroups[majorityDirection] || [];
        
      case ConflictResolutionStrategy.ML_ARBITRATION:
        // Use ML model to arbitrate (simplified implementation)
        return this.mlArbitration(trends);
        
      default:
        return trends;
    }
  }

  /**
   * Calculate source weight based on reliability and trend quality
   */
  private calculateSourceWeight(source: TrendSource, trend: RawTrend): number {
    const baseWeight = this.config.sourceWeights[source.type] || 0.1;
    const reliabilityWeight = source.reliability;
    const confidenceWeight = trend.confidence;
    const categoryWeight = this.config.categoryWeights[trend.category] || 0.5;
    
    // Time decay factor
    const age = (Date.now() - trend.detectedAt.getTime()) / 1000; // seconds
    const decayFactor = Math.exp(-age / this.config.decayHalfLife);
    
    return baseWeight * reliabilityWeight * confidenceWeight * categoryWeight * decayFactor;
  }

  /**
   * Calculate agreement level between trends
   */
  private calculateAgreementLevel(trends: RawTrend[], consensusDirection: string): number {
    const agreeing = trends.filter(t => t.direction === consensusDirection).length;
    return agreeing / trends.length;
  }

  /**
   * Calculate alignment of a trend with consensus
   */
  private calculateAlignment(trend: RawTrend, consensus: AggregatedTrend['consensus']): number {
    // Direction alignment
    const directionAlignment = trend.direction === consensus.direction ? 1 : 
                              trend.direction === 'neutral' ? 0 : -1;
    
    // Strength alignment
    const strengthAlignment = 1 - Math.abs(trend.strength - consensus.strength);
    
    // Combined alignment
    return (directionAlignment + strengthAlignment) / 2;
  }

  /**
   * Calculate temporal properties of aggregated trend
   */
  private calculateTemporalProperties(trends: RawTrend[]): AggregatedTrend['temporal'] {
    const now = new Date();
    const createdAt = new Date(Math.min(...trends.map(t => t.detectedAt.getTime())));
    const lastUpdated = new Date(Math.max(...trends.map(t => t.detectedAt.getTime())));
    
    // Calculate stability (how consistent the trend has been)
    const stability = this.calculateTrendStability(trends);
    
    // Calculate momentum (rate of strength change)
    const momentum = this.calculateTrendMomentum(trends);
    
    // Calculate persistence (duration)
    const persistence = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // hours
    
    // Calculate decay factor
    const avgAge = trends.reduce((sum, t) => sum + (now.getTime() - t.detectedAt.getTime()), 0) / trends.length / 1000;
    const decay = Math.exp(-avgAge / this.config.decayHalfLife);

    return {
      createdAt,
      lastUpdated,
      stability,
      momentum,
      persistence,
      decay
    };
  }

  /**
   * Validate aggregated trend
   */
  private async validateAggregatedTrend(
    symbol: string,
    category: TrendCategory,
    hierarchy: TrendHierarchy,
    trends: RawTrend[],
    consensus: AggregatedTrend['consensus']
  ): Promise<AggregatedTrend['validation']> {
    // Cross-validation
    const crossValidated = await this.performCrossValidation(symbol, trends);
    
    // Quality scoring
    const qualityScore = this.calculateQualityScore(trends, consensus);
    
    // Reliability scoring
    const reliabilityScore = this.calculateReliabilityScore(trends);
    
    // Consistency scoring
    const consistencyScore = this.calculateConsistencyScore(trends);
    
    // Identify outlier sources
    const outlierSources = this.identifyOutlierSources(trends, consensus);
    
    // Determine conflict resolution strategy if any
    const conflictResolution = outlierSources.length > 0 ? 
      ConflictResolutionStrategy.WEIGHTED_AVERAGE : null;

    return {
      crossValidated,
      conflictResolution,
      qualityScore,
      reliabilityScore,
      consistencyScore,
      outlierSources
    };
  }

  /**
   * Generate forecast for aggregated trend
   */
  private generateForecast(
    trends: RawTrend[],
    consensus: AggregatedTrend['consensus'],
    temporal: AggregatedTrend['temporal']
  ): AggregatedTrend['forecast'] {
    // Calculate expected duration
    const avgExpectedDuration = trends.reduce((sum, t) => sum + t.details.expectedDuration, 0) / trends.length;
    const expectedDuration = avgExpectedDuration * consensus.agreement; // Adjust by agreement
    
    // Calculate probability of continuation
    const probabilityOfContinuation = consensus.confidence * consensus.agreement * temporal.decay;
    
    // Calculate expected magnitude
    const avgMagnitude = trends.reduce((sum, t) => sum + t.details.magnitude, 0) / trends.length;
    const expectedMagnitude = avgMagnitude * consensus.strength;
    
    // Estimate peak and decay times
    const now = new Date();
    const peakTime = new Date(now.getTime() + expectedDuration * 0.3 * 60 * 60 * 1000); // 30% into duration
    const decayTime = new Date(now.getTime() + expectedDuration * 60 * 60 * 1000);
    
    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(trends, consensus);

    return {
      expectedDuration,
      probabilityOfContinuation,
      expectedMagnitude,
      peakTime,
      decayTime,
      riskFactors
    };
  }

  /**
   * Check for alerts based on trend properties
   */
  private checkAlerts(
    consensus: AggregatedTrend['consensus'],
    validation: AggregatedTrend['validation'],
    conflicts: Array<{ trends: RawTrend[]; type: ConflictAnalysis['conflictType'] }>
  ): AggregatedTrend['alerts'] {
    return {
      strengthThresholdCrossed: consensus.strength > this.config.strengthThreshold,
      confidenceThresholdCrossed: consensus.confidence > this.config.confidenceThreshold,
      newSourcesAdded: consensus.participatingSourcesCount > 3,
      conflictDetected: conflicts.length > 0,
      qualityDegraded: validation.qualityScore < this.config.minValidationScore
    };
  }

  /**
   * Generate real-time trend ranking
   */
  async generateTrendRanking(timeframe: string = '1h'): Promise<TrendRanking> {
    const trends = Array.from(this.aggregatedTrends.values())
      .filter(trend => this.isTrendRelevantForTimeframe(trend, timeframe));

    // Calculate scores for each trend
    const scoredTrends = trends.map(trend => ({
      trend,
      score: this.calculateTrendScore(trend, timeframe),
      timeInRanking: this.calculateTimeInRanking(trend)
    }));

    // Sort by score
    scoredTrends.sort((a, b) => b.score - a.score);

    // Add rank and rank changes
    const ranking = scoredTrends.slice(0, this.config.maxRankingSize).map((item, index) => {
      const previousRank = this.getPreviousRank(item.trend.symbol, timeframe);
      return {
        ...item,
        rank: index + 1,
        rankChange: previousRank ? previousRank - (index + 1) : 0,
        category: item.trend.category
      };
    });

    // Generate category-specific rankings
    const categoryRankings = this.generateCategoryRankings(ranking);

    // Generate temporal analysis
    const temporal = this.generateTemporalAnalysis(trends);

    // Calculate metadata
    const metadata = {
      generatedAt: new Date(),
      totalTrends: trends.length,
      averageQuality: trends.reduce((sum, t) => sum + t.validation.qualityScore, 0) / trends.length,
      coverageByCategory: this.calculateCoverageByCategory(trends),
      coverageByHierarchy: this.calculateCoverageByHierarchy(trends),
      topSources: this.getTopSources(trends)
    };

    const trendRanking: TrendRanking = {
      ranking,
      metadata,
      categoryRankings,
      temporal
    };

    // Store ranking
    this.trendRankings.set(timeframe, trendRanking);
    await this.cacheTrendRanking(timeframe, trendRanking);

    // Emit event
    this.eventEmitter.emit('trend.ranking.updated', {
      timeframe,
      ranking: trendRanking,
      timestamp: new Date()
    });

    return trendRanking;
  }

  // Helper methods for ranking and analysis

  private calculateTrendScore(trend: AggregatedTrend, timeframe: string): number {
    const baseScore = trend.consensus.strength * trend.consensus.confidence * trend.consensus.agreement;
    const qualityMultiplier = trend.validation.qualityScore;
    const timeDecayMultiplier = trend.temporal.decay;
    const momentumBonus = Math.max(0, trend.temporal.momentum) * 0.1;
    
    return (baseScore * qualityMultiplier * timeDecayMultiplier) + momentumBonus;
  }

  private calculateTimeInRanking(trend: AggregatedTrend): number {
    const now = new Date();
    return (now.getTime() - trend.temporal.createdAt.getTime()) / (1000 * 60 * 60); // hours
  }

  private getPreviousRank(symbol: string, timeframe: string): number | null {
    const previousRanking = this.trendRankings.get(timeframe);
    if (!previousRanking) return null;
    
    const previousEntry = previousRanking.ranking.find(r => r.trend.symbol === symbol);
    return previousEntry ? previousEntry.rank : null;
  }

  private generateCategoryRankings(ranking: TrendRanking['ranking']): TrendRanking['categoryRankings'] {
    const categoryRankings = {} as TrendRanking['categoryRankings'];
    
    for (const category of Object.values(TrendCategory)) {
      const categoryTrends = ranking.filter(r => r.trend.category === category);
      categoryRankings[category] = categoryTrends.map((item, index) => ({
        trend: item.trend,
        categoryScore: item.score,
        categoryRank: index + 1
      }));
    }
    
    return categoryRankings;
  }

  private generateTemporalAnalysis(trends: AggregatedTrend[]): TrendRanking['temporal'] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    return {
      emerging: trends.filter(t => t.temporal.createdAt > oneHourAgo),
      strengthening: trends.filter(t => t.temporal.momentum > 0.1),
      weakening: trends.filter(t => t.temporal.momentum < -0.1),
      stable: trends.filter(t => Math.abs(t.temporal.momentum) <= 0.1),
      expiring: trends.filter(t => t.forecast.decayTime && t.forecast.decayTime < new Date(now.getTime() + 60 * 60 * 1000))
    };
  }

  // Utility methods

  private validateRawTrend(trend: RawTrend): boolean {
    return !!(
      trend.id &&
      trend.sourceId &&
      trend.symbol &&
      trend.direction &&
      trend.strength >= 0 && trend.strength <= 1 &&
      trend.confidence >= 0 && trend.confidence <= 1 &&
      trend.detectedAt &&
      trend.expiresAt &&
      trend.detectedAt <= trend.expiresAt
    );
  }

  private isTrendActive(trend: RawTrend): boolean {
    const now = new Date();
    return trend.expiresAt > now && 
           (now.getTime() - trend.detectedAt.getTime()) / 1000 <= this.config.maxTrendAge;
  }

  private groupTrends(trends: RawTrend[]): Map<string, RawTrend[]> {
    const groups = new Map<string, RawTrend[]>();
    
    for (const trend of trends) {
      const key = `${trend.category}_${trend.hierarchy}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(trend);
    }
    
    return groups;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  // Additional helper methods would be implemented here...
  // (calculateTrendStability, calculateTrendMomentum, etc.)

  private calculateTrendStability(trends: RawTrend[]): number {
    // Simplified stability calculation
    const directions = trends.map(t => t.direction);
    const uniqueDirections = new Set(directions).size;
    return 1 - (uniqueDirections - 1) / 2; // 1 if all same direction, 0 if completely mixed
  }

  private calculateTrendMomentum(trends: RawTrend[]): number {
    if (trends.length < 2) return 0;
    
    // Sort by detection time
    const sortedTrends = [...trends].sort((a, b) => a.detectedAt.getTime() - b.detectedAt.getTime());
    
    // Calculate momentum as change in strength over time
    const early = sortedTrends.slice(0, Math.floor(sortedTrends.length / 2));
    const late = sortedTrends.slice(Math.floor(sortedTrends.length / 2));
    
    const earlyStrength = early.reduce((sum, t) => sum + t.strength, 0) / early.length;
    const lateStrength = late.reduce((sum, t) => sum + t.strength, 0) / late.length;
    
    return lateStrength - earlyStrength;
  }

  // Caching methods

  private async cacheRawTrend(trend: RawTrend): Promise<void> {
    try {
      await this.redis.setex(`raw:${trend.id}`, 3600, JSON.stringify(trend));
    } catch (error) {
      this.logger.warn('Failed to cache raw trend:', error);
    }
  }

  private async cacheAggregatedTrend(trend: AggregatedTrend): Promise<void> {
    try {
      await this.redis.setex(`aggregated:${trend.symbol}`, 1800, JSON.stringify(trend));
    } catch (error) {
      this.logger.warn('Failed to cache aggregated trend:', error);
    }
  }

  private async cacheTrendRanking(timeframe: string, ranking: TrendRanking): Promise<void> {
    try {
      await this.redis.setex(`ranking:${timeframe}`, 600, JSON.stringify(ranking));
    } catch (error) {
      this.logger.warn('Failed to cache trend ranking:', error);
    }
  }

  // Initialization and setup methods

  private async initializeTrendAggregation(): Promise<void> {
    this.logger.log('Initializing Trend Aggregation Service...');
    
    try {
      // Load cached data
      await this.loadCachedTrends();
      await this.loadCachedRankings();
      
      this.logger.log('Trend aggregation data loaded from cache');
    } catch (error) {
      this.logger.error('Failed to load cached trend data:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for trends from various sources
    this.eventEmitter.on('realtime.trend.detected', (data: any) => {
      this.handleRealtimeTrend(data);
    });
    
    this.eventEmitter.on('sentiment.trend.detected', (data: any) => {
      this.handleRealtimeTrend(data);
    });
    
    this.eventEmitter.on('pattern.detected', (data: any) => {
      this.handleRealtimeTrend(data);
    });
    
    this.eventEmitter.on('velocity.trend.detected', (data: any) => {
      this.handleRealtimeTrend(data);
    });
  }

  private async initializeTrendSources(): Promise<void> {
    // Initialize built-in trend sources
    const sources: TrendSource[] = [
      {
        id: 'realtime-detector',
        type: TrendSourceType.REALTIME_DETECTOR,
        name: 'Real-time Trend Detector',
        weight: this.config.sourceWeights[TrendSourceType.REALTIME_DETECTOR],
        reliability: 0.85,
        latency: 1,
        coverage: ['*'],
        lastUpdate: new Date(),
        active: true,
        metrics: {
          accuracy: 0.78,
          precision: 0.82,
          recall: 0.75,
          falsePositiveRate: 0.12,
          averageConfidence: 0.73,
          uptimePercentage: 0.98
        },
        config: {
          minConfidence: 0.6,
          maxAge: 3600,
          supportedTimeframes: ['realtime', '1m', '5m', '15m', '1h'],
          dataRefreshRate: 1
        }
      },
      // Add other sources...
    ];

    for (const source of sources) {
      this.trendSources.set(source.id, source);
    }
  }

  private startAggregationEngine(): void {
    // Start periodic aggregation
    setInterval(() => {
      this.performPeriodicAggregation();
    }, this.config.aggregationInterval * 1000);

    // Start ranking updates
    setInterval(() => {
      this.updateRankings();
    }, this.config.rankingUpdateInterval * 1000);

    // Start cleanup
    setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval * 1000);
  }

  private async loadCachedTrends(): Promise<void> {
    // Implementation for loading cached trends
  }

  private async loadCachedRankings(): Promise<void> {
    // Implementation for loading cached rankings
  }

  // Event handlers for different trend sources

  private async handleRealtimeTrend(data: any): Promise<void> {
    const rawTrend: RawTrend = {
      id: `rt_${data.symbol}_${Date.now()}`,
      sourceId: 'realtime-detector',
      sourceType: TrendSourceType.REALTIME_DETECTOR,
      symbol: data.symbol,
      category: TrendCategory.PRICE_MOVEMENT,
      hierarchy: TrendHierarchy.STOCK,
      direction: data.direction,
      strength: data.strength,
      confidence: data.confidence,
      timeframe: data.timeframe || '5m',
      detectedAt: new Date(data.timestamp),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      details: {
        description: data.description || 'Real-time trend detected',
        triggers: data.triggers || [],
        supportingFactors: data.supportingFactors || [],
        opposingFactors: data.opposingFactors || [],
        keyLevels: data.keyLevels || [],
        expectedDuration: 1, // 1 hour
        magnitude: data.magnitude || 0.02
      },
      context: {
        marketCondition: data.marketCondition || 'unknown',
        volatilityLevel: data.volatilityLevel || 'medium',
        volumeProfile: data.volumeProfile || 'normal',
        correlatedSymbols: data.correlatedSymbols || [],
        sectorInfluence: data.sectorInfluence || []
      },
      metadata: data.metadata || {}
    };

    await this.addRawTrend(rawTrend);
  }

  // Additional event handlers would be implemented similarly...

  // Scheduled tasks

  @Cron('*/1 * * * *') // Every minute
  private async performPeriodicAggregation(): Promise<void> {
    try {
      const symbols = Array.from(this.rawTrends.keys()).slice(0, this.config.batchSize);
      
      for (const symbol of symbols) {
        await this.aggregateTrendsForSymbol(symbol);
      }
    } catch (error) {
      this.logger.error('Periodic aggregation failed:', error);
    }
  }

  @Cron('*/5 * * * *') // Every 5 minutes
  private async updateRankings(): Promise<void> {
    try {
      const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
      
      for (const timeframe of timeframes) {
        await this.generateTrendRanking(timeframe);
      }
    } catch (error) {
      this.logger.error('Ranking update failed:', error);
    }
  }

  @Cron('0 * * * *') // Every hour
  private async performCleanup(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      // Clean expired raw trends
      for (const [symbol, trends] of this.rawTrends.entries()) {
        const activeTrends = new Map();
        for (const [id, trend] of trends.entries()) {
          if (trend.expiresAt > now) {
            activeTrends.set(id, trend);
          } else {
            cleanedCount++;
          }
        }
        this.rawTrends.set(symbol, activeTrends);
      }

      // Clean old aggregated trends
      for (const [symbol, trend] of this.aggregatedTrends.entries()) {
        if (trend.forecast.decayTime && trend.forecast.decayTime < now) {
          this.aggregatedTrends.delete(symbol);
          cleanedCount++;
        }
      }

      this.logger.log(`Cleaned up ${cleanedCount} expired trends`);
    } catch (error) {
      this.logger.error('Cleanup failed:', error);
    }
  }

  // Public API methods

  /**
   * Get aggregated trend for a symbol
   */
  async getAggregatedTrend(symbol: string): Promise<AggregatedTrend | null> {
    return this.aggregatedTrends.get(symbol) || null;
  }

  /**
   * Get trend ranking for a timeframe
   */
  async getTrendRanking(timeframe: string = '1h'): Promise<TrendRanking | null> {
    return this.trendRankings.get(timeframe) || null;
  }

  /**
   * Get raw trends for a symbol
   */
  async getRawTrends(symbol: string): Promise<RawTrend[]> {
    const trends = this.rawTrends.get(symbol);
    return trends ? Array.from(trends.values()) : [];
  }

  /**
   * Get conflict analyses for a symbol
   */
  async getConflictAnalyses(symbol: string): Promise<ConflictAnalysis[]> {
    return Array.from(this.conflictAnalyses.values())
      .filter(analysis => analysis.symbol === symbol);
  }

  /**
   * Get all active symbols with trends
   */
  async getActiveSymbols(): Promise<string[]> {
    return Array.from(this.aggregatedTrends.keys());
  }

  /**
   * Get trend statistics
   */
  async getTrendStatistics(): Promise<Record<string, any>> {
    const totalRawTrends = Array.from(this.rawTrends.values())
      .reduce((sum, trends) => sum + trends.size, 0);
    
    const totalAggregatedTrends = this.aggregatedTrends.size;
    const totalConflicts = this.conflictAnalyses.size;
    
    const avgQuality = Array.from(this.aggregatedTrends.values())
      .reduce((sum, trend) => sum + trend.validation.qualityScore, 0) / totalAggregatedTrends;

    return {
      totalRawTrends,
      totalAggregatedTrends,
      totalConflicts,
      averageQuality: avgQuality || 0,
      activeSources: Array.from(this.trendSources.values()).filter(s => s.active).length,
      lastUpdated: new Date()
    };
  }

  // Simplified implementations of remaining helper methods

  private async updateSourceMetrics(sourceId: string, trend: RawTrend): Promise<void> {
    // Update source performance metrics based on trend outcomes
    const source = this.trendSources.get(sourceId);
    if (source) {
      source.lastUpdate = new Date();
      // Would update accuracy, precision, recall etc. based on actual outcomes
    }
  }

  private isTrendRelevantForTimeframe(trend: AggregatedTrend, timeframe: string): boolean {
    // Check if trend is relevant for the given timeframe
    const now = new Date();
    const trendAge = (now.getTime() - trend.temporal.createdAt.getTime()) / (1000 * 60 * 60); // hours
    
    const timeframeHours = this.getTimeframeHours(timeframe);
    return trendAge <= timeframeHours;
  }

  private getTimeframeHours(timeframe: string): number {
    const timeframeMap: Record<string, number> = {
      '1m': 0.0167,
      '5m': 0.083,
      '15m': 0.25,
      '1h': 1,
      '4h': 4,
      '1d': 24,
      '1w': 168
    };
    
    return timeframeMap[timeframe] || 1;
  }

  private calculateConflictSeverity(trends: RawTrend[], conflictType: ConflictAnalysis['conflictType']): ConflictAnalysis['severity'] {
    // Simplified severity calculation
    const maxDifference = this.calculateMaxDifference(trends, conflictType);
    
    if (maxDifference > 0.7) return 'critical';
    if (maxDifference > 0.5) return 'high';
    if (maxDifference > 0.3) return 'medium';
    return 'low';
  }

  private calculateMaxDifference(trends: RawTrend[], conflictType: ConflictAnalysis['conflictType']): number {
    switch (conflictType) {
      case 'strength':
        const strengths = trends.map(t => t.strength);
        return Math.max(...strengths) - Math.min(...strengths);
      case 'magnitude':
        const magnitudes = trends.map(t => t.details.magnitude);
        return Math.max(...magnitudes) - Math.min(...magnitudes);
      default:
        return 0.5; // Default moderate conflict
    }
  }

  private selectResolutionStrategy(
    trends: RawTrend[],
    conflictType: ConflictAnalysis['conflictType'],
    severity: ConflictAnalysis['severity']
  ): ConflictResolutionStrategy {
    // Select strategy based on conflict characteristics
    if (severity === 'critical') {
      return ConflictResolutionStrategy.ML_ARBITRATION;
    } else if (conflictType === 'directional') {
      return ConflictResolutionStrategy.CONSENSUS_VOTING;
    } else {
      return ConflictResolutionStrategy.WEIGHTED_AVERAGE;
    }
  }

  private calculateConflictDetails(
    trends: RawTrend[],
    conflictType: ConflictAnalysis['conflictType']
  ): ConflictAnalysis['details'] {
    // Calculate conflict-specific details
    return {
      primaryConflict: `${conflictType} conflict detected`,
      contradictionLevel: this.calculateMaxDifference(trends, conflictType),
      affectedSources: trends.map(t => t.sourceId),
      timeframeOverlap: this.checkTimeframeOverlap(trends),
      strengthDisparity: this.calculateMaxDifference(trends, 'strength'),
      confidenceDisparity: Math.max(...trends.map(t => t.confidence)) - Math.min(...trends.map(t => t.confidence))
    };
  }

  private resolveConflictWithStrategy(
    trends: RawTrend[],
    strategy: ConflictResolutionStrategy
  ): ConflictAnalysis['resolution'] {
    // Resolve conflict using specified strategy
    const resolvedTrends = this.applyConflictResolution(trends, strategy);
    
    // Calculate resolved properties from the resolution result
    const resolvedDirection = this.getMajorityDirection(resolvedTrends);
    const resolvedStrength = resolvedTrends.reduce((sum, t) => sum + t.strength, 0) / resolvedTrends.length;
    const resolvedConfidence = resolvedTrends.reduce((sum, t) => sum + t.confidence, 0) / resolvedTrends.length;
    
    return {
      strategy,
      resolvedDirection,
      resolvedStrength,
      resolvedConfidence,
      reasoning: [`Applied ${strategy} strategy`, `Included ${resolvedTrends.length} sources`],
      sourcesExcluded: trends.filter(t => !resolvedTrends.includes(t)).map(t => t.sourceId),
      qualityImpact: resolvedTrends.length / trends.length - 0.5 // Simple quality impact calculation
    };
  }

  private getMajorityDirection(trends: RawTrend[]): 'bullish' | 'bearish' | 'neutral' {
    const directions = trends.map(t => t.direction);
    const counts = {
      bullish: directions.filter(d => d === 'bullish').length,
      bearish: directions.filter(d => d === 'bearish').length,
      neutral: directions.filter(d => d === 'neutral').length
    };
    
    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as any;
  }

  private checkTimeframeOverlap(trends: RawTrend[]): boolean {
    // Check if trends have overlapping timeframes
    return trends.some(t1 => 
      trends.some(t2 => 
        t1.id !== t2.id && 
        t1.timeframe === t2.timeframe
      )
    );
  }

  private mlArbitration(trends: RawTrend[]): RawTrend[] {
    // Simplified ML arbitration - in production, this would use a real ML model
    // For now, just return the trend with highest confidence
    return [trends.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    )];
  }

  // Additional helper methods for validation, quality scoring, etc.

  private async performCrossValidation(symbol: string, trends: RawTrend[]): Promise<boolean> {
    // Simplified cross-validation
    const independentSources = new Set(trends.map(t => t.sourceType)).size;
    const directionAgreement = this.calculateAgreementLevel(trends, this.getMajorityDirection(trends));
    
    return independentSources >= 2 && directionAgreement >= this.config.crossValidationThreshold;
  }

  private calculateQualityScore(trends: RawTrend[], consensus: AggregatedTrend['consensus']): number {
    // Quality score based on multiple factors
    const sourceQuality = trends.reduce((sum, t) => {
      const source = this.trendSources.get(t.sourceId);
      return sum + (source ? source.reliability : 0.5);
    }, 0) / trends.length;
    
    const consensusQuality = consensus.confidence * consensus.agreement;
    const diversityBonus = Math.min(1, trends.length / 5) * 0.1; // Bonus for having multiple sources
    
    return Math.min(1, sourceQuality * 0.4 + consensusQuality * 0.5 + diversityBonus);
  }

  private calculateReliabilityScore(trends: RawTrend[]): number {
    // Average reliability of participating sources
    return trends.reduce((sum, t) => {
      const source = this.trendSources.get(t.sourceId);
      return sum + (source ? source.reliability : 0.5);
    }, 0) / trends.length;
  }

  private calculateConsistencyScore(trends: RawTrend[]): number {
    // Measure how consistent the trends are with each other
    const directions = trends.map(t => t.direction);
    const strengths = trends.map(t => t.strength);
    const confidences = trends.map(t => t.confidence);
    
    const directionConsistency = this.calculateVariance(directions.map(d => d === 'bullish' ? 1 : d === 'bearish' ? -1 : 0));
    const strengthConsistency = 1 - this.calculateVariance(strengths);
    const confidenceConsistency = 1 - this.calculateVariance(confidences);
    
    return (directionConsistency + strengthConsistency + confidenceConsistency) / 3;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private identifyOutlierSources(trends: RawTrend[], consensus: AggregatedTrend['consensus']): string[] {
    return trends
      .filter(trend => Math.abs(this.calculateAlignment(trend, consensus)) < -0.5)
      .map(trend => trend.sourceId);
  }

  private identifyRiskFactors(trends: RawTrend[], consensus: AggregatedTrend['consensus']): string[] {
    const riskFactors: string[] = [];
    
    if (consensus.agreement < 0.7) {
      riskFactors.push('low_source_agreement');
    }
    
    if (consensus.confidence < 0.6) {
      riskFactors.push('low_confidence');
    }
    
    if (trends.length < 3) {
      riskFactors.push('limited_sources');
    }
    
    return riskFactors;
  }

  private calculateCoverageByCategory(trends: AggregatedTrend[]): Record<TrendCategory, number> {
    const coverage = {} as Record<TrendCategory, number>;
    
    for (const category of Object.values(TrendCategory)) {
      coverage[category] = trends.filter(t => t.category === category).length;
    }
    
    return coverage;
  }

  private calculateCoverageByHierarchy(trends: AggregatedTrend[]): Record<TrendHierarchy, number> {
    const coverage = {} as Record<TrendHierarchy, number>;
    
    for (const hierarchy of Object.values(TrendHierarchy)) {
      coverage[hierarchy] = trends.filter(t => t.hierarchy === hierarchy).length;
    }
    
    return coverage;
  }

  private getTopSources(trends: AggregatedTrend[]): string[] {
    const sourceCounts = new Map<string, number>();
    
    for (const trend of trends) {
      for (const sourceId of Object.keys(trend.sources)) {
        sourceCounts.set(sourceId, (sourceCounts.get(sourceId) || 0) + 1);
      }
    }
    
    return Array.from(sourceCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([sourceId]) => sourceId);
  }
}