/**
 * Content Velocity Analyzer Service
 * 
 * Advanced content velocity analysis and viral prediction system that tracks:
 * - News flow velocity and acceleration patterns
 * - Content saturation point detection
 * - Viral content prediction models using ML
 * - Information cascade analysis
 * - Peak attention timing prediction
 * - Content lifecycle management
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';

// Interfaces
interface ContentMetrics {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  author?: string;
  category: string;
  wordCount: number;
  readingTime: number; // in minutes
  engagement: {
    views: number;
    shares: number;
    comments: number;
    likes: number;
    reactions: Record<string, number>;
  };
  velocity: {
    initialVelocity: number; // Engagement in first hour
    currentVelocity: number; // Current engagement rate
    acceleration: number; // Change in velocity
    peakVelocity: number; // Highest velocity achieved
    peakTime: Date | null; // When peak was reached
  };
  virality: {
    viralityScore: number; // 0-1 scale
    viralPotential: number; // Predicted viral potential
    cascadeCoefficient: number; // How content spreads
    influencerBoost: number; // Boost from influencers
    networkReach: number; // Estimated unique reach
  };
  sentiment: {
    overall: number;
    trend: 'improving' | 'declining' | 'stable';
    emotionalIntensity: number;
    dominantEmotion: string;
  };
  lifecycle: {
    stage: 'emerging' | 'growing' | 'peak' | 'declining' | 'saturated';
    ageInHours: number;
    estimatedRemainingLife: number; // hours
    saturationPoint: number; // 0-1, how saturated the topic is
  };
}

interface VelocityProfile {
  symbol?: string;
  topic: string;
  timeWindow: {
    start: Date;
    end: Date;
    duration: number; // minutes
  };
  flow: {
    articleCount: number;
    wordsPerMinute: number;
    avgArticleLength: number;
    sourceCount: number;
    uniqueAuthors: number;
  };
  acceleration: {
    currentRate: number; // articles per hour
    previousRate: number;
    acceleration: number; // change in rate
    jerk: number; // rate of acceleration change
    trend: 'accelerating' | 'steady' | 'decelerating';
  };
  saturation: {
    currentLevel: number; // 0-1
    saturationRate: number; // how fast approaching saturation
    uniqueInformationRatio: number; // new vs repeated info
    redundancyScore: number; // content repetition score
  };
  prediction: {
    peakTime: Date | null;
    peakIntensity: number;
    duration: number; // expected total duration in hours
    fadePattern: 'exponential' | 'linear' | 'stepped' | 'plateau';
    confidence: number;
  };
}

interface ViralPrediction {
  contentId: string;
  viralProbability: number; // 0-1
  estimatedPeakTime: Date;
  estimatedPeakEngagement: number;
  viralFactors: {
    contentQuality: number;
    timingScore: number;
    authorInfluence: number;
    topicTrending: number;
    emotionalTrigger: number;
    shareability: number;
    networkEffect: number;
  };
  thresholds: {
    views: number;
    shares: number;
    timeToViral: number; // minutes
  };
  riskFactors: string[];
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

interface InformationCascade {
  id: string;
  originContent: string;
  startTime: Date;
  nodes: CascadeNode[];
  depth: number; // How many levels deep
  breadth: number; // How wide at each level
  velocity: number; // Spread rate
  amplificationFactor: number;
  keyInfluencers: string[];
  bottlenecks: string[];
  clusters: string[];
  totalReach: number;
  effectiveness: number; // 0-1 how effective the cascade is
}

interface CascadeNode {
  id: string;
  source: string;
  timestamp: Date;
  influence: number;
  reach: number;
  children: string[];
  parent: string | null;
  depth: number;
  amplification: number;
}

interface AttentionCycle {
  topic: string;
  phases: {
    emergence: AttentionPhase;
    growth: AttentionPhase;
    peak: AttentionPhase;
    decline: AttentionPhase;
    memory: AttentionPhase;
  };
  currentPhase: keyof AttentionCycle['phases'];
  cycleDuration: number; // total duration in hours
  peakIntensity: number;
  memorabilityScore: number; // how likely to be remembered
  revivalPotential: number; // potential for comeback
}

interface AttentionPhase {
  duration: number; // hours
  intensity: number; // 0-1
  characteristics: string[];
  keyEvents: string[];
  engagement: number;
  sentiment: number;
}

@Injectable()
export class ContentVelocityAnalyzerService implements OnModuleInit {
  private readonly logger = new Logger(ContentVelocityAnalyzerService.name);
  private readonly redis: Redis;

  // In-memory data structures
  private readonly contentMetrics = new Map<string, ContentMetrics>();
  private readonly velocityProfiles = new Map<string, VelocityProfile>();
  private readonly viralPredictions = new Map<string, ViralPrediction>();
  private readonly informationCascades = new Map<string, InformationCascade>();
  private readonly attentionCycles = new Map<string, AttentionCycle>();

  // Machine Learning Models (simplified for this implementation)
  private readonly viralPredictionModel = {
    weights: {
      contentQuality: 0.25,
      timingScore: 0.15,
      authorInfluence: 0.20,
      topicTrending: 0.15,
      emotionalTrigger: 0.10,
      shareability: 0.10,
      networkEffect: 0.05
    },
    threshold: 0.6, // Viral threshold
    confidence: 0.75
  };

  // Configuration
  private readonly config = {
    velocityWindow: 60, // minutes
    saturationThreshold: 0.8,
    viralThreshold: 0.6,
    cascadeDepthLimit: 10,
    attentionCycleLength: 48, // hours
    predictionHorizon: 24, // hours
    minEngagementForPrediction: 10,
    maxContentAge: 72, // hours
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
      keyPrefix: 'content-velocity:'
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeVelocityAnalyzer();
    this.setupEventListeners();
    this.logger.log('Content Velocity Analyzer initialized');
  }

  /**
   * Analyze content velocity for a specific piece of content
   */
  async analyzeContentVelocity(
    contentId: string,
    content: {
      title: string;
      source: string;
      publishedAt: Date;
      author?: string;
      category: string;
      wordCount: number;
      engagement: ContentMetrics['engagement'];
    }
  ): Promise<ContentMetrics> {
    const now = new Date();
    const ageInHours = (now.getTime() - content.publishedAt.getTime()) / (1000 * 60 * 60);

    // Calculate reading time
    const readingTime = Math.ceil(content.wordCount / 200); // 200 words per minute

    // Get previous metrics if exists
    const previousMetrics = this.contentMetrics.get(contentId);

    // Calculate velocity metrics
    const velocity = await this.calculateVelocityMetrics(contentId, content.engagement, previousMetrics);
    
    // Calculate virality score
    const virality = await this.calculateViralityMetrics(contentId, content, velocity);
    
    // Analyze sentiment
    const sentiment = await this.analyzeSentimentTrend(contentId, content.title);
    
    // Determine lifecycle stage
    const lifecycle = this.determineLifecycleStage(ageInHours, velocity, virality);

    const metrics: ContentMetrics = {
      id: contentId,
      title: content.title,
      source: content.source,
      publishedAt: content.publishedAt,
      author: content.author,
      category: content.category,
      wordCount: content.wordCount,
      readingTime,
      engagement: content.engagement,
      velocity,
      virality,
      sentiment,
      lifecycle
    };

    // Store metrics
    this.contentMetrics.set(contentId, metrics);
    
    // Cache in Redis
    await this.cacheContentMetrics(contentId, metrics);

    // Generate viral prediction if content is promising
    if (virality.viralPotential > 0.3) {
      await this.generateViralPrediction(contentId, metrics);
    }

    // Track information cascades
    if (content.engagement.shares > 10) {
      await this.trackInformationCascade(contentId, metrics);
    }

    // Emit events
    this.eventEmitter.emit('content.velocity.analyzed', {
      contentId,
      metrics,
      timestamp: now
    });

    return metrics;
  }

  /**
   * Analyze news flow velocity for a topic or symbol
   */
  async analyzeNewsFlowVelocity(
    topic: string,
    timeWindow: { start: Date; end: Date },
    symbol?: string
  ): Promise<VelocityProfile> {
    const duration = (timeWindow.end.getTime() - timeWindow.start.getTime()) / (1000 * 60); // minutes

    // Get content data for the time window
    const contentData = await this.getContentForTimeWindow(topic, timeWindow, symbol);
    
    // Calculate flow metrics
    const flow = {
      articleCount: contentData.length,
      wordsPerMinute: contentData.reduce((sum, c) => sum + c.wordCount, 0) / duration,
      avgArticleLength: contentData.length > 0 ? 
        contentData.reduce((sum, c) => sum + c.wordCount, 0) / contentData.length : 0,
      sourceCount: new Set(contentData.map(c => c.source)).size,
      uniqueAuthors: new Set(contentData.map(c => c.author).filter(Boolean)).size
    };

    // Calculate acceleration
    const acceleration = await this.calculateAcceleration(topic, timeWindow);

    // Calculate saturation
    const saturation = await this.calculateSaturation(contentData);

    // Generate prediction
    const prediction = await this.predictVelocityTrend(topic, flow, acceleration, saturation);

    const profile: VelocityProfile = {
      symbol,
      topic,
      timeWindow: { ...timeWindow, duration },
      flow,
      acceleration,
      saturation,
      prediction
    };

    // Store profile
    const profileKey = symbol ? `${symbol}_${topic}` : topic;
    this.velocityProfiles.set(profileKey, profile);
    
    // Cache in Redis
    await this.cacheVelocityProfile(profileKey, profile);

    // Emit events for significant changes
    if (acceleration.trend === 'accelerating' && acceleration.acceleration > 2.0) {
      this.eventEmitter.emit('news.velocity.surge', {
        topic,
        symbol,
        profile,
        timestamp: new Date()
      });
    }

    return profile;
  }

  /**
   * Generate viral prediction for content
   */
  private async generateViralPrediction(contentId: string, metrics: ContentMetrics): Promise<ViralPrediction> {
    const factors = await this.calculateViralFactors(contentId, metrics);
    
    // Apply ML model
    const viralProbability = this.applyViralPredictionModel(factors);
    
    // Estimate peak time based on historical patterns
    const estimatedPeakTime = this.estimatePeakTime(metrics);
    
    // Estimate peak engagement
    const estimatedPeakEngagement = this.estimatePeakEngagement(metrics, viralProbability);
    
    // Calculate thresholds
    const thresholds = {
      views: Math.floor(metrics.engagement.views * (1 + viralProbability * 10)),
      shares: Math.floor(metrics.engagement.shares * (1 + viralProbability * 5)),
      timeToViral: Math.floor(120 * (1 - viralProbability)) // 2 hours baseline
    };

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(metrics, factors);

    // Calculate confidence interval
    const baseConfidence = this.viralPredictionModel.confidence;
    const confidenceInterval = {
      lower: Math.max(0, viralProbability - (1 - baseConfidence) * 0.5),
      upper: Math.min(1, viralProbability + (1 - baseConfidence) * 0.5)
    };

    const prediction: ViralPrediction = {
      contentId,
      viralProbability,
      estimatedPeakTime,
      estimatedPeakEngagement,
      viralFactors: factors,
      thresholds,
      riskFactors,
      confidenceInterval
    };

    this.viralPredictions.set(contentId, prediction);
    await this.cacheViralPrediction(contentId, prediction);

    // Emit high probability predictions
    if (viralProbability > this.config.viralThreshold) {
      this.eventEmitter.emit('content.viral.prediction', {
        contentId,
        prediction,
        timestamp: new Date()
      });
    }

    return prediction;
  }

  /**
   * Track information cascade for viral content
   */
  private async trackInformationCascade(contentId: string, metrics: ContentMetrics): Promise<void> {
    const existingCascade = this.informationCascades.get(contentId);
    
    if (!existingCascade) {
      // Create new cascade
      const cascade: InformationCascade = {
        id: contentId,
        originContent: metrics.title,
        startTime: metrics.publishedAt,
        nodes: [{
          id: `${contentId}_origin`,
          source: metrics.source,
          timestamp: metrics.publishedAt,
          influence: this.calculateSourceInfluence(metrics.source),
          reach: metrics.engagement.views,
          children: [],
          parent: null,
          depth: 0,
          amplification: 1.0
        }],
        depth: 1,
        breadth: 1,
        velocity: metrics.velocity.currentVelocity,
        amplificationFactor: 1.0,
        keyInfluencers: [metrics.source],
        bottlenecks: [],
        clusters: [metrics.category],
        totalReach: metrics.engagement.views,
        effectiveness: this.calculateCascadeEffectiveness(metrics)
      };
      
      this.informationCascades.set(contentId, cascade);
    } else {
      // Update existing cascade
      await this.updateInformationCascade(contentId, existingCascade, metrics);
    }
  }

  /**
   * Predict peak attention timing
   */
  async predictPeakAttentionTiming(
    topic: string,
    currentMetrics: ContentMetrics[]
  ): Promise<AttentionCycle> {
    const existingCycle = this.attentionCycles.get(topic);
    const now = new Date();

    // Analyze current phase
    const currentPhase = this.determineAttentionPhase(topic, currentMetrics);
    
    // Create or update attention cycle
    const cycle: AttentionCycle = existingCycle || {
      topic,
      phases: {
        emergence: { duration: 2, intensity: 0.1, characteristics: ['initial_discovery'], keyEvents: [], engagement: 0, sentiment: 0 },
        growth: { duration: 6, intensity: 0.4, characteristics: ['rapid_spread'], keyEvents: [], engagement: 0, sentiment: 0 },
        peak: { duration: 4, intensity: 1.0, characteristics: ['maximum_attention'], keyEvents: [], engagement: 0, sentiment: 0 },
        decline: { duration: 12, intensity: 0.3, characteristics: ['waning_interest'], keyEvents: [], engagement: 0, sentiment: 0 },
        memory: { duration: 24, intensity: 0.05, characteristics: ['residual_memory'], keyEvents: [], engagement: 0, sentiment: 0 }
      },
      currentPhase,
      cycleDuration: 48,
      peakIntensity: 0,
      memorabilityScore: 0,
      revivalPotential: 0
    };

    // Update phase data
    cycle.phases[currentPhase] = this.updatePhaseMetrics(
      cycle.phases[currentPhase],
      currentMetrics
    );

    // Calculate peak intensity
    cycle.peakIntensity = Math.max(
      ...Object.values(cycle.phases).map(p => p.intensity)
    );

    // Calculate memorability
    cycle.memorabilityScore = this.calculateMemorabilityScore(currentMetrics);

    // Calculate revival potential
    cycle.revivalPotential = this.calculateRevivalPotential(topic, cycle);

    this.attentionCycles.set(topic, cycle);
    await this.cacheAttentionCycle(topic, cycle);

    return cycle;
  }

  // Helper methods

  private async calculateVelocityMetrics(
    contentId: string,
    currentEngagement: ContentMetrics['engagement'],
    previousMetrics?: ContentMetrics
  ): Promise<ContentMetrics['velocity']> {
    const now = new Date();
    
    let initialVelocity = 0;
    let currentVelocity = 0;
    let acceleration = 0;
    let peakVelocity = 0;
    let peakTime: Date | null = null;

    if (previousMetrics) {
      const timeDiff = (now.getTime() - new Date(previousMetrics.lifecycle.ageInHours * 60 * 60 * 1000 + previousMetrics.publishedAt.getTime()).getTime()) / (1000 * 60 * 60); // hours
      
      const engagementDiff = this.calculateEngagementDifference(currentEngagement, previousMetrics.engagement);
      currentVelocity = timeDiff > 0 ? engagementDiff / timeDiff : 0;
      
      acceleration = currentVelocity - previousMetrics.velocity.currentVelocity;
      peakVelocity = Math.max(previousMetrics.velocity.peakVelocity, currentVelocity);
      
      if (currentVelocity > previousMetrics.velocity.peakVelocity) {
        peakTime = now;
      } else {
        peakTime = previousMetrics.velocity.peakTime;
      }

      initialVelocity = previousMetrics.velocity.initialVelocity;
    } else {
      // First time analyzing this content
      initialVelocity = this.calculateTotalEngagement(currentEngagement);
      currentVelocity = initialVelocity;
      peakVelocity = currentVelocity;
      peakTime = now;
    }

    return {
      initialVelocity,
      currentVelocity,
      acceleration,
      peakVelocity,
      peakTime
    };
  }

  private async calculateViralityMetrics(
    contentId: string,
    content: { title: string; category: string; engagement: ContentMetrics['engagement'] },
    velocity: ContentMetrics['velocity']
  ): Promise<ContentMetrics['virality']> {
    // Calculate virality score based on engagement patterns
    const totalEngagement = this.calculateTotalEngagement(content.engagement);
    const shareRatio = content.engagement.shares / Math.max(1, content.engagement.views);
    const velocityScore = Math.min(1, velocity.currentVelocity / 100);
    
    const viralityScore = (shareRatio * 0.4 + velocityScore * 0.3 + Math.min(1, totalEngagement / 1000) * 0.3);

    // Predict viral potential
    const viralPotential = await this.predictViralPotential(contentId, content, velocity);

    // Calculate cascade coefficient
    const cascadeCoefficient = this.calculateCascadeCoefficient(content.engagement);

    // Calculate influencer boost
    const influencerBoost = await this.calculateInfluencerBoost(contentId);

    // Estimate network reach
    const networkReach = this.estimateNetworkReach(content.engagement, cascadeCoefficient);

    return {
      viralityScore,
      viralPotential,
      cascadeCoefficient,
      influencerBoost,
      networkReach
    };
  }

  private async analyzeSentimentTrend(contentId: string, title: string): Promise<ContentMetrics['sentiment']> {
    // Get historical sentiment data
    const sentimentHistory = await this.getSentimentHistory(contentId);
    
    let overall = 0;
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    let emotionalIntensity = 0.5;
    let dominantEmotion = 'neutral';

    if (sentimentHistory.length > 0) {
      overall = sentimentHistory[sentimentHistory.length - 1];
      
      if (sentimentHistory.length > 1) {
        const recent = sentimentHistory.slice(-3);
        const earlier = sentimentHistory.slice(-6, -3);
        
        const recentAvg = recent.reduce((sum, s) => sum + s, 0) / recent.length;
        const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, s) => sum + s, 0) / earlier.length : recentAvg;
        
        if (recentAvg > earlierAvg + 0.1) trend = 'improving';
        else if (recentAvg < earlierAvg - 0.1) trend = 'declining';
      }

      // Calculate emotional intensity
      emotionalIntensity = Math.abs(overall);
      
      // Determine dominant emotion (simplified)
      if (overall > 0.3) dominantEmotion = 'positive';
      else if (overall < -0.3) dominantEmotion = 'negative';
      else dominantEmotion = 'neutral';
    }

    return {
      overall,
      trend,
      emotionalIntensity,
      dominantEmotion
    };
  }

  private determineLifecycleStage(
    ageInHours: number,
    velocity: ContentMetrics['velocity'],
    virality: ContentMetrics['virality']
  ): ContentMetrics['lifecycle'] {
    let stage: ContentMetrics['lifecycle']['stage'] = 'emerging';
    let estimatedRemainingLife = 24; // hours
    let saturationPoint = 0;

    if (ageInHours < 1) {
      stage = 'emerging';
      estimatedRemainingLife = 47;
    } else if (velocity.acceleration > 0 && virality.viralPotential > 0.5) {
      stage = 'growing';
      estimatedRemainingLife = Math.max(0, 24 - ageInHours);
    } else if (velocity.currentVelocity > velocity.initialVelocity * 0.8) {
      stage = 'peak';
      estimatedRemainingLife = Math.max(0, 18 - ageInHours);
    } else if (velocity.acceleration < 0) {
      stage = 'declining';
      estimatedRemainingLife = Math.max(0, 12 - ageInHours);
    } else if (ageInHours > 48) {
      stage = 'saturated';
      estimatedRemainingLife = 0;
    }

    // Calculate saturation point
    saturationPoint = Math.min(1, ageInHours / 48);

    return {
      stage,
      ageInHours,
      estimatedRemainingLife,
      saturationPoint
    };
  }

  private async getContentForTimeWindow(
    topic: string,
    timeWindow: { start: Date; end: Date },
    symbol?: string
  ): Promise<Array<{ source: string; wordCount: number; author?: string }>> {
    // In a real implementation, this would query the database
    // For now, return mock data
    const mockData = Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => ({
      source: `source_${i % 10}`,
      wordCount: Math.floor(Math.random() * 1000) + 200,
      author: Math.random() > 0.5 ? `author_${i % 20}` : undefined
    }));
    
    return mockData;
  }

  private async calculateAcceleration(
    topic: string,
    timeWindow: { start: Date; end: Date }
  ): Promise<VelocityProfile['acceleration']> {
    // Get historical data
    const historical = await this.getHistoricalVelocity(topic);
    
    const currentRate = 10 + Math.random() * 20; // Mock current rate
    const previousRate = historical.length > 0 ? historical[historical.length - 1] : currentRate * 0.8;
    const acceleration = currentRate - previousRate;
    
    // Calculate jerk (rate of acceleration change)
    let jerk = 0;
    if (historical.length > 1) {
      const prevAcceleration = historical[historical.length - 1] - historical[historical.length - 2];
      jerk = acceleration - prevAcceleration;
    }

    let trend: 'accelerating' | 'steady' | 'decelerating' = 'steady';
    if (acceleration > 1) trend = 'accelerating';
    else if (acceleration < -1) trend = 'decelerating';

    return {
      currentRate,
      previousRate,
      acceleration,
      jerk,
      trend
    };
  }

  private async calculateSaturation(
    contentData: Array<{ source: string; wordCount: number; author?: string }>
  ): Promise<VelocityProfile['saturation']> {
    const totalContent = contentData.length;
    const uniqueSources = new Set(contentData.map(c => c.source)).size;
    const uniqueAuthors = new Set(contentData.map(c => c.author).filter(Boolean)).size;
    
    // Calculate saturation metrics
    const sourceRatio = uniqueSources / Math.max(1, totalContent);
    const authorRatio = uniqueAuthors / Math.max(1, totalContent);
    
    const currentLevel = 1 - (sourceRatio + authorRatio) / 2;
    const saturationRate = Math.random() * 0.1; // Mock saturation rate
    const uniqueInformationRatio = sourceRatio; // Simplified
    const redundancyScore = 1 - uniqueInformationRatio;

    return {
      currentLevel: Math.max(0, Math.min(1, currentLevel)),
      saturationRate,
      uniqueInformationRatio,
      redundancyScore
    };
  }

  private async predictVelocityTrend(
    topic: string,
    flow: VelocityProfile['flow'],
    acceleration: VelocityProfile['acceleration'],
    saturation: VelocityProfile['saturation']
  ): Promise<VelocityProfile['prediction']> {
    // Predict peak time based on acceleration
    let peakTime: Date | null = null;
    if (acceleration.trend === 'accelerating') {
      const hoursToLeak = Math.max(1, 24 * (1 - saturation.currentLevel));
      peakTime = new Date(Date.now() + hoursToLeak * 60 * 60 * 1000);
    }

    // Estimate peak intensity
    const peakIntensity = flow.articleCount * (1 + acceleration.acceleration / 10);

    // Estimate duration
    const duration = Math.max(6, 48 * (1 - saturation.currentLevel));

    // Determine fade pattern
    let fadePattern: VelocityProfile['prediction']['fadePattern'] = 'linear';
    if (saturation.currentLevel > 0.8) fadePattern = 'exponential';
    else if (acceleration.jerk > 0) fadePattern = 'plateau';
    else if (flow.sourceCount < 5) fadePattern = 'stepped';

    // Calculate confidence
    const confidence = Math.max(0.3, Math.min(0.9, 1 - saturation.currentLevel));

    return {
      peakTime,
      peakIntensity,
      duration,
      fadePattern,
      confidence
    };
  }

  private async calculateViralFactors(
    contentId: string,
    metrics: ContentMetrics
  ): Promise<ViralPrediction['viralFactors']> {
    return {
      contentQuality: Math.min(1, metrics.wordCount / 500) * 0.5 + 
                     Math.min(1, metrics.engagement.shares / Math.max(1, metrics.engagement.views)) * 0.5,
      timingScore: this.calculateTimingScore(metrics.publishedAt),
      authorInfluence: await this.calculateAuthorInfluence(metrics.author),
      topicTrending: await this.calculateTopicTrending(metrics.category),
      emotionalTrigger: metrics.sentiment.emotionalIntensity,
      shareability: Math.min(1, metrics.engagement.shares / Math.max(1, metrics.engagement.views * 0.1)),
      networkEffect: Math.min(1, metrics.virality.networkReach / 10000)
    };
  }

  private applyViralPredictionModel(factors: ViralPrediction['viralFactors']): number {
    const weights = this.viralPredictionModel.weights;
    
    return Math.min(1, 
      factors.contentQuality * weights.contentQuality +
      factors.timingScore * weights.timingScore +
      factors.authorInfluence * weights.authorInfluence +
      factors.topicTrending * weights.topicTrending +
      factors.emotionalTrigger * weights.emotionalTrigger +
      factors.shareability * weights.shareability +
      factors.networkEffect * weights.networkEffect
    );
  }

  private estimatePeakTime(metrics: ContentMetrics): Date {
    const baseTime = 2; // hours
    const velocityFactor = Math.min(2, metrics.velocity.currentVelocity / 10);
    const viralityFactor = metrics.virality.viralPotential;
    
    const hoursToLeak = baseTime * (2 - velocityFactor) * (2 - viralityFactor);
    return new Date(metrics.publishedAt.getTime() + hoursToLeak * 60 * 60 * 1000);
  }

  private estimatePeakEngagement(metrics: ContentMetrics, viralProbability: number): number {
    const currentTotal = this.calculateTotalEngagement(metrics.engagement);
    const multiplier = 1 + (viralProbability * 10);
    return Math.floor(currentTotal * multiplier);
  }

  private identifyRiskFactors(metrics: ContentMetrics, factors: ViralPrediction['viralFactors']): string[] {
    const risks: string[] = [];
    
    if (factors.contentQuality < 0.3) risks.push('low_content_quality');
    if (factors.timingScore < 0.3) risks.push('poor_timing');
    if (factors.authorInfluence < 0.2) risks.push('low_author_influence');
    if (metrics.sentiment.overall < -0.5) risks.push('negative_sentiment');
    if (metrics.lifecycle.saturationPoint > 0.7) risks.push('market_saturation');
    
    return risks;
  }

  // Utility methods

  private calculateEngagementDifference(
    current: ContentMetrics['engagement'],
    previous: ContentMetrics['engagement']
  ): number {
    return (current.views - previous.views) + 
           (current.shares - previous.shares) * 2 +
           (current.comments - previous.comments) * 3 +
           (current.likes - previous.likes);
  }

  private calculateTotalEngagement(engagement: ContentMetrics['engagement']): number {
    return engagement.views + 
           engagement.shares * 2 + 
           engagement.comments * 3 + 
           engagement.likes + 
           Object.values(engagement.reactions).reduce((sum, count) => sum + count, 0);
  }

  private async predictViralPotential(
    contentId: string,
    content: { title: string; category: string; engagement: ContentMetrics['engagement'] },
    velocity: ContentMetrics['velocity']
  ): Promise<number> {
    // Simplified viral potential calculation
    const engagementScore = Math.min(1, this.calculateTotalEngagement(content.engagement) / 1000);
    const velocityScore = Math.min(1, velocity.currentVelocity / 50);
    const accelerationScore = velocity.acceleration > 0 ? Math.min(1, velocity.acceleration / 10) : 0;
    
    return (engagementScore * 0.4 + velocityScore * 0.4 + accelerationScore * 0.2);
  }

  private calculateCascadeCoefficient(engagement: ContentMetrics['engagement']): number {
    const shareRate = engagement.shares / Math.max(1, engagement.views);
    return Math.min(2, shareRate * 10);
  }

  private async calculateInfluencerBoost(contentId: string): Promise<number> {
    // Mock influencer boost calculation
    return Math.random() * 0.5;
  }

  private estimateNetworkReach(
    engagement: ContentMetrics['engagement'],
    cascadeCoefficient: number
  ): number {
    return Math.floor(engagement.views * cascadeCoefficient * (1 + engagement.shares / 10));
  }

  // More utility methods...

  private calculateSourceInfluence(source: string): number {
    // Mock influence calculation - in reality, this would be from a database
    const influenceMap = new Map([
      ['reuters', 0.9],
      ['bloomberg', 0.85],
      ['wsj', 0.8],
      ['ft', 0.75]
    ]);
    
    return influenceMap.get(source.toLowerCase()) || 0.3;
  }

  private calculateCascadeEffectiveness(metrics: ContentMetrics): number {
    const shareEffectiveness = metrics.engagement.shares / Math.max(1, metrics.engagement.views);
    const commentEngagement = metrics.engagement.comments / Math.max(1, metrics.engagement.shares);
    
    return Math.min(1, (shareEffectiveness * 0.7 + commentEngagement * 0.3) * 10);
  }

  private async updateInformationCascade(
    contentId: string,
    cascade: InformationCascade,
    metrics: ContentMetrics
  ): Promise<void> {
    // Update cascade metrics
    cascade.totalReach = metrics.engagement.views;
    cascade.velocity = metrics.velocity.currentVelocity;
    cascade.amplificationFactor = metrics.engagement.shares / Math.max(1, cascade.nodes[0].reach);
    
    // Add new nodes if there are new shares
    if (metrics.engagement.shares > cascade.nodes.length) {
      const newNodeCount = metrics.engagement.shares - cascade.nodes.length;
      for (let i = 0; i < Math.min(newNodeCount, 10); i++) {
        const newNode: CascadeNode = {
          id: `${contentId}_${cascade.nodes.length + i}`,
          source: `share_${cascade.nodes.length + i}`,
          timestamp: new Date(),
          influence: 0.1,
          reach: Math.floor(Math.random() * 100) + 10,
          children: [],
          parent: cascade.nodes[0].id,
          depth: 1,
          amplification: 1.1
        };
        
        cascade.nodes.push(newNode);
        cascade.nodes[0].children.push(newNode.id);
      }
    }
    
    // Update cascade breadth and depth
    cascade.breadth = Math.max(...cascade.nodes.map(n => n.children.length));
    cascade.depth = Math.max(...cascade.nodes.map(n => n.depth)) + 1;
  }

  private determineAttentionPhase(
    topic: string,
    metrics: ContentMetrics[]
  ): keyof AttentionCycle['phases'] {
    if (metrics.length === 0) return 'emergence';
    
    const totalEngagement = metrics.reduce((sum, m) => sum + this.calculateTotalEngagement(m.engagement), 0);
    const avgAge = metrics.reduce((sum, m) => sum + m.lifecycle.ageInHours, 0) / metrics.length;
    
    if (avgAge < 2) return 'emergence';
    if (avgAge < 8 && totalEngagement > 1000) return 'growth';
    if (avgAge < 12 && totalEngagement > 5000) return 'peak';
    if (avgAge < 24) return 'decline';
    return 'memory';
  }

  private updatePhaseMetrics(
    phase: AttentionPhase,
    metrics: ContentMetrics[]
  ): AttentionPhase {
    if (metrics.length === 0) return phase;
    
    const totalEngagement = metrics.reduce((sum, m) => sum + this.calculateTotalEngagement(m.engagement), 0);
    const avgSentiment = metrics.reduce((sum, m) => sum + m.sentiment.overall, 0) / metrics.length;
    
    return {
      ...phase,
      engagement: totalEngagement,
      sentiment: avgSentiment,
      keyEvents: metrics.filter(m => m.virality.viralityScore > 0.5).map(m => m.title).slice(0, 5)
    };
  }

  private calculateMemorabilityScore(metrics: ContentMetrics[]): number {
    if (metrics.length === 0) return 0;
    
    const avgVirality = metrics.reduce((sum, m) => sum + m.virality.viralityScore, 0) / metrics.length;
    const emotionalIntensity = metrics.reduce((sum, m) => sum + m.sentiment.emotionalIntensity, 0) / metrics.length;
    const uniquenessFactor = new Set(metrics.map(m => m.category)).size / metrics.length;
    
    return (avgVirality * 0.4 + emotionalIntensity * 0.4 + uniquenessFactor * 0.2);
  }

  private calculateRevivalPotential(topic: string, cycle: AttentionCycle): number {
    const peakIntensity = cycle.peakIntensity;
    const currentIntensity = cycle.phases[cycle.currentPhase].intensity;
    const memorability = cycle.memorabilityScore;
    
    return Math.min(1, (peakIntensity * 0.3 + memorability * 0.5 + (1 - currentIntensity) * 0.2));
  }

  // Timing and trend analysis

  private calculateTimingScore(publishedAt: Date): number {
    const hour = publishedAt.getHours();
    const dayOfWeek = publishedAt.getDay();
    
    // Peak hours: 9-11 AM, 2-4 PM, 7-9 PM
    let hourScore = 0.3;
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) || (hour >= 19 && hour <= 21)) {
      hourScore = 0.8;
    } else if ((hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19)) {
      hourScore = 0.6;
    }
    
    // Weekdays are generally better
    const dayScore = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 0.8 : 0.5;
    
    return (hourScore + dayScore) / 2;
  }

  private async calculateAuthorInfluence(author?: string): Promise<number> {
    if (!author) return 0.1;
    
    // Mock author influence - in reality, this would come from a database
    const authorInfluence = await this.redis.get(`author:influence:${author}`);
    return authorInfluence ? parseFloat(authorInfluence) : Math.random() * 0.5 + 0.1;
  }

  private async calculateTopicTrending(category: string): Promise<number> {
    const trendingData = await this.redis.get(`trending:${category}`);
    return trendingData ? parseFloat(trendingData) : Math.random() * 0.3 + 0.1;
  }

  private async getSentimentHistory(contentId: string): Promise<number[]> {
    const history = await this.redis.lrange(`sentiment:history:${contentId}`, 0, -1);
    return history.map(h => parseFloat(h));
  }

  private async getHistoricalVelocity(topic: string): Promise<number[]> {
    const history = await this.redis.lrange(`velocity:history:${topic}`, 0, -1);
    return history.map(h => parseFloat(h));
  }

  // Caching methods

  private async cacheContentMetrics(contentId: string, metrics: ContentMetrics): Promise<void> {
    await this.redis.setex(`metrics:${contentId}`, 3600, JSON.stringify(metrics));
  }

  private async cacheVelocityProfile(profileKey: string, profile: VelocityProfile): Promise<void> {
    await this.redis.setex(`profile:${profileKey}`, 1800, JSON.stringify(profile));
  }

  private async cacheViralPrediction(contentId: string, prediction: ViralPrediction): Promise<void> {
    await this.redis.setex(`viral:${contentId}`, 7200, JSON.stringify(prediction));
  }

  private async cacheAttentionCycle(topic: string, cycle: AttentionCycle): Promise<void> {
    await this.redis.setex(`cycle:${topic}`, 3600, JSON.stringify(cycle));
  }

  // Initialization methods

  private async initializeVelocityAnalyzer(): Promise<void> {
    // Load cached data
    try {
      const keys = await this.redis.keys('metrics:*');
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const metrics = JSON.parse(data) as ContentMetrics;
          this.contentMetrics.set(metrics.id, metrics);
        }
      }
      
      this.logger.log(`Loaded ${this.contentMetrics.size} content metrics from cache`);
    } catch (error) {
      this.logger.error('Failed to load cached metrics:', error);
    }
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('content.published', async (data: any) => {
      if (data.contentId && data.content && data.engagement) {
        await this.analyzeContentVelocity(data.contentId, data.content);
      }
    });

    this.eventEmitter.on('content.engagement.updated', async (data: any) => {
      if (data.contentId && data.engagement) {
        const existing = this.contentMetrics.get(data.contentId);
        if (existing) {
          await this.analyzeContentVelocity(data.contentId, {
            ...existing,
            engagement: data.engagement
          });
        }
      }
    });
  }

  // Scheduled tasks

  @Cron('*/5 * * * *') // Every 5 minutes
  private async updateVelocityMetrics(): Promise<void> {
    try {
      const activeContent = Array.from(this.contentMetrics.entries())
        .filter(([_, metrics]) => metrics.lifecycle.ageInHours < this.config.maxContentAge)
        .slice(0, 50); // Process max 50 items per run

      for (const [contentId, metrics] of activeContent) {
        // Simulate engagement updates
        const updatedEngagement = {
          ...metrics.engagement,
          views: Math.floor(metrics.engagement.views * (1 + Math.random() * 0.1)),
          shares: Math.floor(metrics.engagement.shares * (1 + Math.random() * 0.05)),
          comments: Math.floor(metrics.engagement.comments * (1 + Math.random() * 0.03)),
          likes: Math.floor(metrics.engagement.likes * (1 + Math.random() * 0.07))
        };

        await this.analyzeContentVelocity(contentId, {
          ...metrics,
          engagement: updatedEngagement
        });
      }

    } catch (error) {
      this.logger.error('Failed to update velocity metrics:', error);
    }
  }

  @Cron('0 */2 * * *') // Every 2 hours
  private async cleanupExpiredContent(): Promise<void> {
    try {
      const expiredContent = Array.from(this.contentMetrics.entries())
        .filter(([_, metrics]) => metrics.lifecycle.ageInHours > this.config.maxContentAge);

      for (const [contentId] of expiredContent) {
        this.contentMetrics.delete(contentId);
        await this.redis.del(`metrics:${contentId}`);
        await this.redis.del(`viral:${contentId}`);
      }

      this.logger.log(`Cleaned up ${expiredContent.length} expired content entries`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired content:', error);
    }
  }

  // Public API methods

  /**
   * Get content velocity metrics
   */
  async getContentMetrics(contentId: string): Promise<ContentMetrics | null> {
    return this.contentMetrics.get(contentId) || null;
  }

  /**
   * Get velocity profile for topic
   */
  async getVelocityProfile(topic: string, symbol?: string): Promise<VelocityProfile | null> {
    const key = symbol ? `${symbol}_${topic}` : topic;
    return this.velocityProfiles.get(key) || null;
  }

  /**
   * Get viral prediction
   */
  async getViralPrediction(contentId: string): Promise<ViralPrediction | null> {
    return this.viralPredictions.get(contentId) || null;
  }

  /**
   * Get information cascade
   */
  async getInformationCascade(contentId: string): Promise<InformationCascade | null> {
    return this.informationCascades.get(contentId) || null;
  }

  /**
   * Get attention cycle
   */
  async getAttentionCycle(topic: string): Promise<AttentionCycle | null> {
    return this.attentionCycles.get(topic) || null;
  }

  /**
   * Get trending topics based on velocity
   */
  async getTrendingTopics(limit: number = 10): Promise<Array<{ topic: string; velocity: number; trend: string }>> {
    const profiles = Array.from(this.velocityProfiles.entries())
      .map(([key, profile]) => ({
        topic: profile.topic,
        velocity: profile.acceleration.currentRate,
        trend: profile.acceleration.trend
      }))
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, limit);

    return profiles;
  }

  /**
   * Get viral predictions with high probability
   */
  async getHighViralPotentialContent(): Promise<ViralPrediction[]> {
    return Array.from(this.viralPredictions.values())
      .filter(p => p.viralProbability > this.config.viralThreshold)
      .sort((a, b) => b.viralProbability - a.viralProbability);
  }
}