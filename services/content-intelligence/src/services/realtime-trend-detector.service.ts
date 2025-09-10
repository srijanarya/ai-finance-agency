/**
 * Real-time Trend Detector Service
 * 
 * Advanced real-time trend detection using streaming analytics and ML algorithms.
 * Features:
 * - Live trend identification with sub-second latency
 * - Momentum analysis and velocity tracking
 * - Breakout detection and trend reversal signals
 * - Multi-timeframe analysis (minute, hour, day, week)
 * - Social media trend correlation
 * - WebSocket integration for live updates
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Interfaces
interface TrendSignal {
  id: string;
  timestamp: Date;
  symbol: string;
  type: 'breakout' | 'reversal' | 'momentum' | 'volume_surge' | 'sentiment_shift';
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  confidence: number; // 0-1
  timeframe: 'realtime' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  metadata: {
    price?: number;
    volume?: number;
    sentiment?: number;
    socialMentions?: number;
    newsCount?: number;
    technicalIndicators?: Record<string, number>;
    velocity?: number;
    acceleration?: number;
    jerk?: number;
    breakoutLevel?: number;
    currentValue?: number;
    previousTrend?: string;
    confirmationSignals?: string[];
    divergenceIndicators?: string[];
    virality?: number;
    influencerMentions?: number;
    correlation?: number;
    alignment?: number;
    timeframes?: string[];
    probability?: number;
  };
}

interface StreamingDataPoint {
  timestamp: Date;
  symbol: string;
  value: number;
  volume: number;
  source: 'price' | 'sentiment' | 'social' | 'news' | 'volume';
  metadata?: Record<string, any>;
}

interface TrendMomentum {
  symbol: string;
  velocity: number; // Rate of change
  acceleration: number; // Change in velocity
  jerk: number; // Change in acceleration
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  consistency: number; // How consistent the trend is
  lastUpdated: Date;
}

interface BreakoutSignal {
  symbol: string;
  type: 'price' | 'volume' | 'sentiment';
  breakoutLevel: number;
  currentValue: number;
  strength: number;
  duration: number; // seconds
  volumeConfirmation: boolean;
  sentimentConfirmation: boolean;
  probability: number;
}

interface TrendReversalSignal {
  symbol: string;
  previousTrend: 'bullish' | 'bearish';
  newTrend: 'bullish' | 'bearish' | 'neutral';
  reversalStrength: number;
  confirmationSignals: string[];
  divergenceIndicators: string[];
  probability: number;
  estimatedDuration: number; // Expected duration in hours
}

interface SocialTrendCorrelation {
  symbol: string;
  socialMentions: number;
  sentimentScore: number;
  viralityScore: number;
  influencerMentions: number;
  correlationWithPrice: number;
  leadingIndicator: boolean; // Does social trend lead price?
  lagTime: number; // In minutes
}

interface MultiTimeframeAnalysis {
  symbol: string;
  timeframes: {
    '1m': TrendMomentum;
    '5m': TrendMomentum;
    '15m': TrendMomentum;
    '1h': TrendMomentum;
    '4h': TrendMomentum;
    '1d': TrendMomentum;
    '1w': TrendMomentum;
  };
  alignment: number; // How aligned trends are across timeframes
  strength: number; // Overall trend strength
  probability: number; // Probability of trend continuation
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/realtime-trends'
})
@Injectable()
export class RealtimeTrendDetectorService implements OnModuleInit, OnModuleDestroy, OnGatewayConnection {
  private readonly logger = new Logger(RealtimeTrendDetectorService.name);
  private readonly redis: Redis;
  private readonly redisSubscriber: Redis;
  
  @WebSocketServer()
  server: Server;

  // In-memory data structures for real-time processing
  private readonly streamingBuffer = new Map<string, StreamingDataPoint[]>();
  private readonly trendMomentum = new Map<string, TrendMomentum>();
  private readonly activeTrends = new Map<string, TrendSignal[]>();
  private readonly multiTimeframeAnalysis = new Map<string, MultiTimeframeAnalysis>();
  private readonly socialCorrelations = new Map<string, SocialTrendCorrelation>();
  
  // Connected WebSocket clients
  private readonly connectedClients = new Set<Socket>();
  
  // Configuration
  private readonly config = {
    bufferSize: 1000, // Keep last 1000 data points per symbol
    minDataPoints: 10, // Minimum points needed for trend detection
    breakoutThreshold: 0.02, // 2% breakout threshold
    volumeThreshold: 1.5, // Volume surge multiplier
    sentimentThreshold: 0.15, // Sentiment change threshold
    correlationThreshold: 0.7, // Social correlation threshold
    updateInterval: 1000, // Update every second
    cleanupInterval: 300000, // Cleanup every 5 minutes
  };

  // Technical indicators cache
  private readonly indicatorsCache = new Map<string, Record<string, number>>();

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    // Initialize Redis connections
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      keyPrefix: 'realtime-trends:'
    });

    this.redisSubscriber = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      keyPrefix: 'realtime-trends:'
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeRealtimeDetection();
    this.setupRedisSubscriptions();
    this.startRealtimeProcessing();
    this.logger.log('Real-time Trend Detector initialized');
  }

  async onModuleDestroy(): Promise<void> {
    this.redis?.disconnect();
    this.redisSubscriber?.disconnect();
    this.logger.log('Real-time Trend Detector destroyed');
  }

  handleConnection(client: Socket): void {
    this.connectedClients.add(client);
    this.logger.log(`WebSocket client connected. Total: ${this.connectedClients.size}`);

    client.on('disconnect', () => {
      this.connectedClients.delete(client);
      this.logger.log(`WebSocket client disconnected. Total: ${this.connectedClients.size}`);
    });

    client.on('subscribe', (data: { symbols: string[] }) => {
      if (data.symbols && Array.isArray(data.symbols)) {
        data.symbols.forEach(symbol => {
          client.join(`trends-${symbol}`);
        });
      }
    });
  }

  /**
   * Process incoming streaming data and detect trends in real-time
   */
  async processStreamingData(dataPoint: StreamingDataPoint): Promise<void> {
    const { symbol } = dataPoint;
    
    // Add to buffer
    if (!this.streamingBuffer.has(symbol)) {
      this.streamingBuffer.set(symbol, []);
    }
    
    const buffer = this.streamingBuffer.get(symbol)!;
    buffer.push(dataPoint);
    
    // Maintain buffer size
    if (buffer.length > this.config.bufferSize) {
      buffer.shift();
    }
    
    // Process only if we have enough data points
    if (buffer.length >= this.config.minDataPoints) {
      await Promise.all([
        this.updateMomentumAnalysis(symbol, buffer),
        this.detectBreakouts(symbol, buffer),
        this.detectReversals(symbol, buffer),
        this.analyzeSocialCorrelation(symbol, dataPoint),
        this.updateMultiTimeframeAnalysis(symbol, buffer),
      ]);
    }
  }

  /**
   * Update momentum analysis for a symbol
   */
  private async updateMomentumAnalysis(symbol: string, buffer: StreamingDataPoint[]): Promise<void> {
    if (buffer.length < 3) return;

    const recentData = buffer.slice(-20); // Last 20 points
    const values = recentData.map(d => d.value);
    const volumes = recentData.map(d => d.volume);
    
    // Calculate velocity (first derivative)
    const velocity = this.calculateDerivative(values);
    
    // Calculate acceleration (second derivative)  
    const acceleration = this.calculateDerivative(this.calculateMovingAverage(values, 3));
    
    // Calculate jerk (third derivative)
    const jerk = this.calculateDerivative(this.calculateMovingAverage(values, 5));
    
    // Determine direction
    const direction = velocity > 0.01 ? 'up' : velocity < -0.01 ? 'down' : 'sideways';
    
    // Calculate strength based on velocity and volume
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const volumeWeight = Math.min(2, avgVolume / 1000); // Normalize volume weight
    const strength = Math.min(1, Math.abs(velocity) * volumeWeight);
    
    // Calculate consistency (how consistent the direction is)
    const consistency = this.calculateConsistency(values);
    
    const momentum: TrendMomentum = {
      symbol,
      velocity,
      acceleration,
      jerk,
      direction,
      strength,
      consistency,
      lastUpdated: new Date()
    };
    
    this.trendMomentum.set(symbol, momentum);
    
    // Emit trend signal if momentum is significant
    if (strength > 0.5 && consistency > 0.7) {
      await this.emitTrendSignal({
        id: `momentum_${symbol}_${Date.now()}`,
        timestamp: new Date(),
        symbol,
        type: 'momentum',
        direction: direction === 'up' ? 'bullish' : direction === 'down' ? 'bearish' : 'neutral',
        strength,
        confidence: consistency,
        timeframe: 'realtime',
        metadata: {
          velocity,
          acceleration,
          jerk,
          volume: avgVolume
        }
      });
    }
  }

  /**
   * Detect breakout patterns in real-time
   */
  private async detectBreakouts(symbol: string, buffer: StreamingDataPoint[]): Promise<void> {
    if (buffer.length < 20) return;

    const recentData = buffer.slice(-20);
    const historicalData = buffer.slice(-100, -20);
    
    if (historicalData.length < 20) return;
    
    const currentValue = recentData[recentData.length - 1].value;
    const currentVolume = recentData[recentData.length - 1].volume;
    
    // Calculate resistance/support levels from historical data
    const historicalValues = historicalData.map(d => d.value);
    const resistance = Math.max(...historicalValues);
    const support = Math.min(...historicalValues);
    const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length;
    
    // Check for breakout conditions
    const upwardBreakout = currentValue > resistance * (1 + this.config.breakoutThreshold);
    const downwardBreakout = currentValue < support * (1 - this.config.breakoutThreshold);
    const volumeConfirmation = currentVolume > avgVolume * this.config.volumeThreshold;
    
    if ((upwardBreakout || downwardBreakout) && volumeConfirmation) {
      const breakoutSignal: BreakoutSignal = {
        symbol,
        type: 'price',
        breakoutLevel: upwardBreakout ? resistance : support,
        currentValue,
        strength: Math.abs(currentValue - (upwardBreakout ? resistance : support)) / (upwardBreakout ? resistance : support),
        duration: 0, // Just detected
        volumeConfirmation,
        sentimentConfirmation: await this.checkSentimentConfirmation(symbol),
        probability: volumeConfirmation ? 0.8 : 0.6
      };
      
      await this.emitTrendSignal({
        id: `breakout_${symbol}_${Date.now()}`,
        timestamp: new Date(),
        symbol,
        type: 'breakout',
        direction: upwardBreakout ? 'bullish' : 'bearish',
        strength: breakoutSignal.strength,
        confidence: breakoutSignal.probability,
        timeframe: 'realtime',
        metadata: {
          breakoutLevel: breakoutSignal.breakoutLevel,
          currentValue: breakoutSignal.currentValue,
          volume: currentVolume,
          volumeConfirmation
        }
      });
    }
  }

  /**
   * Detect trend reversals using multiple indicators
   */
  private async detectReversals(symbol: string, buffer: StreamingDataPoint[]): Promise<void> {
    if (buffer.length < 50) return;

    const currentMomentum = this.trendMomentum.get(symbol);
    if (!currentMomentum) return;

    const recentData = buffer.slice(-30);
    const values = recentData.map(d => d.value);
    
    // Calculate various reversal indicators
    const rsi = this.calculateRSI(values);
    const macd = this.calculateMACD(values);
    const stochastic = this.calculateStochastic(buffer.slice(-14));
    
    const confirmationSignals: string[] = [];
    const divergenceIndicators: string[] = [];
    
    // Check for overbought/oversold conditions
    if (rsi > 70) {
      confirmationSignals.push('RSI_overbought');
    } else if (rsi < 30) {
      confirmationSignals.push('RSI_oversold');
    }
    
    // Check MACD for reversal signals
    if (macd.histogram < 0 && macd.signal < macd.macd) {
      confirmationSignals.push('MACD_bearish_crossover');
    } else if (macd.histogram > 0 && macd.signal > macd.macd) {
      confirmationSignals.push('MACD_bullish_crossover');
    }
    
    // Check stochastic for reversal
    if (stochastic.k > 80 && stochastic.d > 80) {
      confirmationSignals.push('Stochastic_overbought');
    } else if (stochastic.k < 20 && stochastic.d < 20) {
      confirmationSignals.push('Stochastic_oversold');
    }
    
    // Detect divergences
    if (this.detectPriceMomentumDivergence(values, currentMomentum.velocity)) {
      divergenceIndicators.push('price_momentum_divergence');
    }
    
    // Emit reversal signal if enough confirmations
    if (confirmationSignals.length >= 2) {
      const previousDirection = currentMomentum.direction === 'up' ? 'bullish' : 
                              currentMomentum.direction === 'down' ? 'bearish' : 'neutral';
      const newDirection = confirmationSignals.some(s => s.includes('bearish')) ? 'bearish' : 
                          confirmationSignals.some(s => s.includes('bullish')) ? 'bullish' : 'neutral';
      
      if (previousDirection !== newDirection) {
        const reversalSignal: TrendReversalSignal = {
          symbol,
          previousTrend: previousDirection as 'bullish' | 'bearish',
          newTrend: newDirection as 'bullish' | 'bearish' | 'neutral',
          reversalStrength: confirmationSignals.length / 4, // Max 4 signals
          confirmationSignals,
          divergenceIndicators,
          probability: (confirmationSignals.length + divergenceIndicators.length) / 6,
          estimatedDuration: this.estimateReversalDuration(confirmationSignals)
        };
        
        await this.emitTrendSignal({
          id: `reversal_${symbol}_${Date.now()}`,
          timestamp: new Date(),
          symbol,
          type: 'reversal',
          direction: newDirection as 'bullish' | 'bearish' | 'neutral',
          strength: reversalSignal.reversalStrength,
          confidence: reversalSignal.probability,
          timeframe: 'realtime',
          metadata: {
            previousTrend: previousDirection,
            confirmationSignals,
            divergenceIndicators,
            rsi,
            macd: macd.macd,
            stochastic: stochastic.k
          }
        });
      }
    }
  }

  /**
   * Analyze social media trend correlation with price movements
   */
  private async analyzeSocialCorrelation(symbol: string, dataPoint: StreamingDataPoint): Promise<void> {
    // Get social data from Redis
    const socialData = await this.redis.hgetall(`social:${symbol}`);
    if (!socialData || Object.keys(socialData).length === 0) return;

    const socialMentions = parseInt(socialData.mentions) || 0;
    const sentimentScore = parseFloat(socialData.sentiment) || 0;
    const viralityScore = parseFloat(socialData.virality) || 0;
    const influencerMentions = parseInt(socialData.influencerMentions) || 0;

    // Calculate correlation with price
    const priceBuffer = this.streamingBuffer.get(symbol);
    if (!priceBuffer || priceBuffer.length < 20) return;

    const priceValues = priceBuffer.slice(-20).map(d => d.value);
    const socialValues = priceBuffer.slice(-20).map((_, i) => socialMentions + i); // Simplified
    
    const correlationWithPrice = this.calculateCorrelation(priceValues, socialValues);
    
    // Determine if social trend leads price
    const leadingIndicator = Math.abs(correlationWithPrice) > this.config.correlationThreshold;
    const lagTime = leadingIndicator ? this.calculateLagTime(priceValues, socialValues) : 0;

    const correlation: SocialTrendCorrelation = {
      symbol,
      socialMentions,
      sentimentScore,
      viralityScore,
      influencerMentions,
      correlationWithPrice,
      leadingIndicator,
      lagTime
    };

    this.socialCorrelations.set(symbol, correlation);

    // Emit social trend signal if correlation is strong
    if (leadingIndicator && viralityScore > 0.7) {
      await this.emitTrendSignal({
        id: `social_${symbol}_${Date.now()}`,
        timestamp: new Date(),
        symbol,
        type: 'sentiment_shift',
        direction: sentimentScore > 0.1 ? 'bullish' : sentimentScore < -0.1 ? 'bearish' : 'neutral',
        strength: viralityScore,
        confidence: Math.abs(correlationWithPrice),
        timeframe: 'realtime',
        metadata: {
          socialMentions,
          sentiment: sentimentScore,
          virality: viralityScore,
          influencerMentions,
          correlation: correlationWithPrice,
          lagTime
        }
      });
    }
  }

  /**
   * Update multi-timeframe analysis
   */
  private async updateMultiTimeframeAnalysis(symbol: string, buffer: StreamingDataPoint[]): Promise<void> {
    if (buffer.length < 100) return;

    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as const;
    const analysis: Partial<MultiTimeframeAnalysis['timeframes']> = {};
    
    // Calculate momentum for each timeframe
    for (const timeframe of timeframes) {
      const periodData = this.getDataForTimeframe(buffer, timeframe);
      if (periodData.length > 5) {
        analysis[timeframe] = this.calculateTimeframeMomentum(symbol, periodData);
      }
    }

    if (Object.keys(analysis).length >= 3) {
      // Calculate alignment between timeframes
      const momentums = Object.values(analysis).map(m => m.velocity);
      const alignment = this.calculateAlignment(momentums);
      
      // Calculate overall strength
      const strength = momentums.reduce((sum, m) => sum + Math.abs(m), 0) / momentums.length;
      
      // Calculate continuation probability
      const probability = this.calculateContinuationProbability(analysis);

      const multiTimeframe: MultiTimeframeAnalysis = {
        symbol,
        timeframes: analysis as MultiTimeframeAnalysis['timeframes'],
        alignment,
        strength,
        probability
      };

      this.multiTimeframeAnalysis.set(symbol, multiTimeframe);

      // Emit signal if alignment is strong
      if (alignment > 0.8 && strength > 0.5) {
        const dominantDirection = momentums.reduce((sum, m) => sum + m, 0) > 0 ? 'bullish' : 'bearish';
        
        await this.emitTrendSignal({
          id: `multitimeframe_${symbol}_${Date.now()}`,
          timestamp: new Date(),
          symbol,
          type: 'momentum',
          direction: dominantDirection,
          strength,
          confidence: alignment,
          timeframe: 'realtime',
          metadata: {
            alignment,
            timeframes: Object.keys(analysis),
            probability,
            technicalIndicators: this.indicatorsCache.get(symbol) || {}
          }
        });
      }
    }
  }

  /**
   * Emit trend signal to subscribers
   */
  private async emitTrendSignal(signal: TrendSignal): Promise<void> {
    // Store in Redis for persistence
    await this.redis.lpush(`signals:${signal.symbol}`, JSON.stringify(signal));
    await this.redis.ltrim(`signals:${signal.symbol}`, 0, 999); // Keep last 1000 signals
    
    // Store active trend
    if (!this.activeTrends.has(signal.symbol)) {
      this.activeTrends.set(signal.symbol, []);
    }
    this.activeTrends.get(signal.symbol)!.push(signal);
    
    // Emit via WebSocket
    this.server.to(`trends-${signal.symbol}`).emit('trendSignal', signal);
    
    // Emit via EventEmitter for internal services
    this.eventEmitter.emit('realtime.trend.detected', signal);
    
    this.logger.debug(`Trend signal emitted: ${signal.type} ${signal.direction} for ${signal.symbol}`);
  }

  // Utility methods for technical analysis

  private calculateDerivative(values: number[]): number {
    if (values.length < 2) return 0;
    return (values[values.length - 1] - values[0]) / values.length;
  }

  private calculateMovingAverage(values: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
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

  private calculateRSI(values: number[], period: number = 14): number {
    if (values.length < period + 1) return 50;
    
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }
    
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(values: number[]): { macd: number; signal: number; histogram: number } {
    if (values.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema12 = this.calculateEMA(values, 12);
    const ema26 = this.calculateEMA(values, 26);
    const macd = ema12 - ema26;
    
    // Simplified signal line (usually 9-period EMA of MACD)
    const signal = macd * 0.9; // Simplified
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  }

  private calculateEMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < values.length; i++) {
      ema = (values[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateStochastic(buffer: StreamingDataPoint[]): { k: number; d: number } {
    if (buffer.length < 14) return { k: 50, d: 50 };
    
    const recentData = buffer.slice(-14);
    const values = recentData.map(d => d.value);
    const currentPrice = values[values.length - 1];
    const highestHigh = Math.max(...values);
    const lowestLow = Math.min(...values);
    
    const k = ((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k * 0.9; // Simplified D calculation
    
    return { k, d };
  }

  private detectPriceMomentumDivergence(prices: number[], momentum: number): boolean {
    const priceDirection = prices[prices.length - 1] - prices[0];
    const momentumDirection = momentum;
    
    // Divergence occurs when price and momentum move in opposite directions
    return (priceDirection > 0 && momentumDirection < 0) || (priceDirection < 0 && momentumDirection > 0);
  }

  private estimateReversalDuration(signals: string[]): number {
    // Simplified duration estimation based on signal strength
    const strongSignals = signals.filter(s => s.includes('overbought') || s.includes('oversold')).length;
    return strongSignals * 4; // Hours
  }

  private async checkSentimentConfirmation(symbol: string): Promise<boolean> {
    const socialData = await this.redis.hgetall(`social:${symbol}`);
    if (!socialData) return false;
    
    const sentiment = parseFloat(socialData.sentiment) || 0;
    return Math.abs(sentiment) > this.config.sentimentThreshold;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private calculateLagTime(x: number[], y: number[]): number {
    // Simplified lag calculation - in a real implementation, this would use cross-correlation
    return Math.random() * 30; // 0-30 minutes
  }

  private getDataForTimeframe(buffer: StreamingDataPoint[], timeframe: string): StreamingDataPoint[] {
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
      default: cutoffTime = new Date(now.getTime() - 60 * 1000);
    }
    
    return buffer.filter(d => d.timestamp >= cutoffTime);
  }

  private calculateTimeframeMomentum(symbol: string, data: StreamingDataPoint[]): TrendMomentum {
    const values = data.map(d => d.value);
    const volumes = data.map(d => d.volume);
    
    const velocity = this.calculateDerivative(values);
    const acceleration = this.calculateDerivative(this.calculateMovingAverage(values, 3));
    const direction = velocity > 0.01 ? 'up' : velocity < -0.01 ? 'down' : 'sideways';
    
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
    const strength = Math.min(1, Math.abs(velocity) * (avgVolume / 1000));
    const consistency = this.calculateConsistency(values);
    
    return {
      symbol,
      velocity,
      acceleration,
      jerk: 0, // Simplified
      direction,
      strength,
      consistency,
      lastUpdated: new Date()
    };
  }

  private calculateAlignment(momentums: number[]): number {
    if (momentums.length < 2) return 0;
    
    const positive = momentums.filter(m => m > 0).length;
    const negative = momentums.filter(m => m < 0).length;
    
    return Math.max(positive, negative) / momentums.length;
  }

  private calculateContinuationProbability(analysis: Partial<MultiTimeframeAnalysis['timeframes']>): number {
    const momentums = Object.values(analysis).map(m => m.velocity);
    const alignment = this.calculateAlignment(momentums);
    const strength = momentums.reduce((sum, m) => sum + Math.abs(m), 0) / momentums.length;
    
    return (alignment * 0.6) + (strength * 0.4);
  }

  // Initialization and setup methods

  private async initializeRealtimeDetection(): Promise<void> {
    // Load historical momentum data
    const keys = await this.redis.keys('momentum:*');
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const momentum = JSON.parse(data) as TrendMomentum;
        this.trendMomentum.set(momentum.symbol, momentum);
      }
    }
    
    this.logger.log(`Loaded ${this.trendMomentum.size} momentum trackers`);
  }

  private setupRedisSubscriptions(): void {
    // Subscribe to market data updates
    this.redisSubscriber.subscribe('market:data:*', 'social:data:*', 'news:data:*');
    
    this.redisSubscriber.on('message', async (channel: string, message: string) => {
      try {
        const data = JSON.parse(message) as StreamingDataPoint;
        await this.processStreamingData(data);
      } catch (error) {
        this.logger.error('Error processing Redis message:', error);
      }
    });
  }

  private startRealtimeProcessing(): void {
    // Process buffered data every second
    setInterval(() => {
      this.processBufferedData();
    }, this.config.updateInterval);
    
    // Cleanup old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, this.config.cleanupInterval);
  }

  private async processBufferedData(): Promise<void> {
    const symbols = Array.from(this.streamingBuffer.keys());
    
    for (const symbol of symbols) {
      const buffer = this.streamingBuffer.get(symbol);
      if (buffer && buffer.length >= this.config.minDataPoints) {
        // Process each symbol's buffer
        await this.updateTechnicalIndicators(symbol, buffer);
      }
    }
  }

  private async updateTechnicalIndicators(symbol: string, buffer: StreamingDataPoint[]): Promise<void> {
    const values = buffer.map(d => d.value);
    
    const indicators = {
      rsi: this.calculateRSI(values),
      macd: this.calculateMACD(values).macd,
      sma20: this.calculateMovingAverage(values, 20).slice(-1)[0] || 0,
      ema12: this.calculateEMA(values, 12),
      stochastic: this.calculateStochastic(buffer).k,
      momentum: this.trendMomentum.get(symbol)?.velocity || 0
    };
    
    this.indicatorsCache.set(symbol, indicators);
    
    // Store in Redis
    await this.redis.setex(`indicators:${symbol}`, 300, JSON.stringify(indicators));
  }

  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    // Clean streaming buffers
    for (const [symbol, buffer] of this.streamingBuffer.entries()) {
      const filteredBuffer = buffer.filter(d => d.timestamp >= cutoffTime);
      this.streamingBuffer.set(symbol, filteredBuffer);
    }
    
    // Clean active trends
    for (const [symbol, trends] of this.activeTrends.entries()) {
      const recentTrends = trends.filter(t => t.timestamp >= cutoffTime);
      this.activeTrends.set(symbol, recentTrends);
    }
    
    this.logger.debug('Cleaned up old real-time data');
  }

  // Scheduled tasks

  @Cron('*/30 * * * * *') // Every 30 seconds
  private async updateRealtimeMetrics(): Promise<void> {
    try {
      // Update metrics for active symbols
      const activeSymbols = Array.from(this.streamingBuffer.keys())
        .filter(symbol => {
          const buffer = this.streamingBuffer.get(symbol);
          return buffer && buffer.length > 0 && 
                 buffer[buffer.length - 1].timestamp > new Date(Date.now() - 2 * 60 * 1000);
        });

      // Store real-time metrics
      await this.redis.setex('realtime:metrics', 60, JSON.stringify({
        activeSymbols: activeSymbols.length,
        connectedClients: this.connectedClients.size,
        activeTrends: Array.from(this.activeTrends.values()).reduce((sum, arr) => sum + arr.length, 0),
        bufferSizes: Object.fromEntries(
          activeSymbols.map(symbol => [
            symbol,
            this.streamingBuffer.get(symbol)?.length || 0
          ])
        ),
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      this.logger.error('Failed to update real-time metrics:', error);
    }
  }

  // Public API methods

  /**
   * Get current trend signals for a symbol
   */
  async getCurrentTrendSignals(symbol: string): Promise<TrendSignal[]> {
    return this.activeTrends.get(symbol) || [];
  }

  /**
   * Get momentum analysis for a symbol
   */
  async getMomentumAnalysis(symbol: string): Promise<TrendMomentum | null> {
    return this.trendMomentum.get(symbol) || null;
  }

  /**
   * Get multi-timeframe analysis for a symbol
   */
  async getMultiTimeframeAnalysis(symbol: string): Promise<MultiTimeframeAnalysis | null> {
    return this.multiTimeframeAnalysis.get(symbol) || null;
  }

  /**
   * Get social correlation data for a symbol
   */
  async getSocialCorrelation(symbol: string): Promise<SocialTrendCorrelation | null> {
    return this.socialCorrelations.get(symbol) || null;
  }

  /**
   * Get real-time metrics
   */
  async getRealtimeMetrics(): Promise<Record<string, any>> {
    const metricsData = await this.redis.get('realtime:metrics');
    return metricsData ? JSON.parse(metricsData) : {};
  }
}