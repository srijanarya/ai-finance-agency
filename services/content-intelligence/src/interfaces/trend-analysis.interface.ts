/**
 * Enhanced Trend Analysis Interfaces
 * 
 * Comprehensive type definitions for the advanced trend detection and analysis system.
 * Includes interfaces for all trend analysis components:
 * - Real-time trend detection
 * - Content velocity analysis
 * - Sentiment trend tracking
 * - Pattern recognition
 * - Trend aggregation
 * - Alert system
 */

// ==================== REAL-TIME TREND DETECTOR INTERFACES ====================

export interface TrendSignal {
  id: string;
  timestamp: Date;
  symbol: string;
  type: 'breakout' | 'reversal' | 'momentum' | 'volume_surge' | 'sentiment_shift';
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  confidence: number; // 0-1
  timeframe: 'realtime' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  metadata: TrendSignalMetadata;
}

export interface TrendSignalMetadata {
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
}

export interface StreamingDataPoint {
  timestamp: Date;
  symbol: string;
  value: number;
  volume: number;
  source: 'price' | 'sentiment' | 'social' | 'news' | 'volume';
  metadata?: Record<string, any>;
}

export interface TrendMomentum {
  symbol: string;
  velocity: number; // Rate of change
  acceleration: number; // Change in velocity
  jerk: number; // Change in acceleration
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  consistency: number; // How consistent the trend is
  lastUpdated: Date;
}

export interface BreakoutSignal {
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

export interface TrendReversalSignal {
  symbol: string;
  previousTrend: 'bullish' | 'bearish';
  newTrend: 'bullish' | 'bearish' | 'neutral';
  reversalStrength: number;
  confirmationSignals: string[];
  divergenceIndicators: string[];
  probability: number;
  estimatedDuration: number; // Expected duration in hours
}

export interface SocialTrendCorrelation {
  symbol: string;
  socialMentions: number;
  sentimentScore: number;
  viralityScore: number;
  influencerMentions: number;
  correlationWithPrice: number;
  leadingIndicator: boolean; // Does social trend lead price?
  lagTime: number; // In minutes
}

export interface MultiTimeframeAnalysis {
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

// ==================== CONTENT VELOCITY ANALYZER INTERFACES ====================

export interface ContentMetrics {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  author?: string;
  category: string;
  wordCount: number;
  readingTime: number; // in minutes
  engagement: ContentEngagement;
  velocity: ContentVelocity;
  virality: ViralityMetrics;
  sentiment: ContentSentiment;
  lifecycle: ContentLifecycle;
}

export interface ContentEngagement {
  views: number;
  shares: number;
  comments: number;
  likes: number;
  reactions: Record<string, number>;
}

export interface ContentVelocity {
  initialVelocity: number; // Engagement in first hour
  currentVelocity: number; // Current engagement rate
  acceleration: number; // Change in velocity
  peakVelocity: number; // Highest velocity achieved
  peakTime: Date | null; // When peak was reached
}

export interface ViralityMetrics {
  viralityScore: number; // 0-1 scale
  viralPotential: number; // Predicted viral potential
  cascadeCoefficient: number; // How content spreads
  influencerBoost: number; // Boost from influencers
  networkReach: number; // Estimated unique reach
}

export interface ContentSentiment {
  overall: number;
  trend: 'improving' | 'declining' | 'stable';
  emotionalIntensity: number;
  dominantEmotion: string;
}

export interface ContentLifecycle {
  stage: 'emerging' | 'growing' | 'peak' | 'declining' | 'saturated';
  ageInHours: number;
  estimatedRemainingLife: number; // hours
  saturationPoint: number; // 0-1, how saturated the topic is
}

export interface VelocityProfile {
  symbol?: string;
  topic: string;
  timeWindow: TimeWindow;
  flow: ContentFlow;
  acceleration: VelocityAcceleration;
  saturation: ContentSaturation;
  prediction: VelocityPrediction;
}

export interface TimeWindow {
  start: Date;
  end: Date;
  duration: number; // minutes
}

export interface ContentFlow {
  articleCount: number;
  wordsPerMinute: number;
  avgArticleLength: number;
  sourceCount: number;
  uniqueAuthors: number;
}

export interface VelocityAcceleration {
  currentRate: number; // articles per hour
  previousRate: number;
  acceleration: number; // change in rate
  jerk: number; // rate of acceleration change
  trend: 'accelerating' | 'steady' | 'decelerating';
}

export interface ContentSaturation {
  currentLevel: number; // 0-1
  saturationRate: number; // how fast approaching saturation
  uniqueInformationRatio: number; // new vs repeated info
  redundancyScore: number; // content repetition score
}

export interface VelocityPrediction {
  peakTime: Date | null;
  peakIntensity: number;
  duration: number; // expected total duration in hours
  fadePattern: 'exponential' | 'linear' | 'stepped' | 'plateau';
  confidence: number;
}

export interface ViralPrediction {
  contentId: string;
  viralProbability: number; // 0-1
  estimatedPeakTime: Date;
  estimatedPeakEngagement: number;
  viralFactors: ViralFactors;
  thresholds: ViralThresholds;
  riskFactors: string[];
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

export interface ViralFactors {
  contentQuality: number;
  timingScore: number;
  authorInfluence: number;
  topicTrending: number;
  emotionalTrigger: number;
  shareability: number;
  networkEffect: number;
}

export interface ViralThresholds {
  views: number;
  shares: number;
  timeToViral: number; // minutes
}

export interface InformationCascade {
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

export interface CascadeNode {
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

export interface AttentionCycle {
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

export interface AttentionPhase {
  duration: number; // hours
  intensity: number; // 0-1
  characteristics: string[];
  keyEvents: string[];
  engagement: number;
  sentiment: number;
}

// ==================== SENTIMENT TREND TRACKER INTERFACES ====================

export enum EmotionType {
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

export enum SentimentPhase {
  ACCUMULATION = 'accumulation',
  MARKUP = 'markup',
  DISTRIBUTION = 'distribution',
  MARKDOWN = 'markdown'
}

export interface SentimentDataPoint {
  timestamp: Date;
  symbol: string;
  source: string;
  rawSentiment: number; // -1 to 1
  magnitude: number; // 0 to 1 (intensity)
  emotions: Record<EmotionType, number>;
  context: SentimentContext;
  metadata?: Record<string, any>;
}

export interface SentimentContext {
  contentType: 'news' | 'social' | 'forum' | 'blog' | 'analysis';
  wordCount: number;
  authorInfluence: number;
  reach: number;
  engagement: number;
}

export interface SentimentMomentum {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  momentum: SentimentMomentumData;
  trend: SentimentTrend;
  volatility: SentimentVolatility;
  lastUpdated: Date;
}

export interface SentimentMomentumData {
  velocity: number; // Rate of sentiment change
  acceleration: number; // Change in velocity
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1 magnitude of momentum
  consistency: number; // 0-1 how consistent the direction is
}

export interface SentimentTrend {
  shortTerm: number; // Last 5 data points
  mediumTerm: number; // Last 20 data points
  longTerm: number; // Last 100 data points
  alignment: number; // How aligned the timeframes are
}

export interface SentimentVolatility {
  current: number; // Current sentiment volatility
  average: number; // Average volatility
  percentile: number; // Volatility percentile
}

export interface EmotionalTrend {
  symbol: string;
  dominantEmotion: EmotionType;
  emotionIntensity: number; // 0-1
  emotionMix: Record<EmotionType, number>;
  emotionTrend: Record<EmotionType, EmotionTrendData>;
  fearGreedIndex: number; // 0-100 (0 = extreme fear, 100 = extreme greed)
  emotionalCycles: EmotionalCycles;
  contrarian: ContrarianSignal;
}

export interface EmotionTrendData {
  direction: 'increasing' | 'decreasing' | 'stable';
  rate: number; // Rate of change
  momentum: number; // Momentum of change
}

export interface EmotionalCycles {
  currentPhase: SentimentPhase;
  phaseProgress: number; // 0-1 progress through current phase
  expectedDuration: number; // Expected remaining duration in hours
  cycleStrength: number; // Strength of the current cycle
}

export interface ContrarianSignal {
  signal: 'buy' | 'sell' | 'hold';
  strength: number; // 0-1
  confidence: number; // 0-1
  reasoning: string[];
}

export interface SentimentReversal {
  id: string;
  symbol: string;
  detectedAt: Date;
  type: 'sentiment_exhaustion' | 'emotion_shift' | 'contrarian_signal' | 'divergence';
  previousSentiment: SentimentState;
  newSentiment: SentimentState;
  triggers: string[];
  confirmation: SentimentConfirmation;
  probability: number; // 0-1
  expectedDuration: number; // hours
  impactAssessment: ImpactAssessment;
}

export interface SentimentState {
  value: number;
  emotion: EmotionType;
  duration?: number; // hours
  strength?: number;
}

export interface SentimentConfirmation {
  volumeConfirmed: boolean;
  priceConfirmed: boolean;
  crossAssetConfirmed: boolean;
  technicalConfirmed: boolean;
}

export interface ImpactAssessment {
  shortTerm: 'high' | 'medium' | 'low';
  mediumTerm: 'high' | 'medium' | 'low';
  longTerm: 'high' | 'medium' | 'low';
}

export interface CrossAssetSentimentCorrelation {
  primarySymbol: string;
  correlatedAssets: CorrelatedAsset[];
  sectors: SectorCorrelation[];
  market: MarketSentiment;
  divergences: SentimentDivergence[];
}

export interface CorrelatedAsset {
  symbol: string;
  correlation: number; // -1 to 1
  strength: 'strong' | 'moderate' | 'weak';
  lag: number; // Time lag in minutes
  confidence: number; // 0-1
}

export interface SectorCorrelation {
  sector: string;
  correlation: number;
  symbols: string[];
}

export interface MarketSentiment {
  overallCorrelation: number;
  marketSentiment: number;
  riskOn: boolean; // Risk-on vs risk-off sentiment
  flightToQuality: boolean;
}

export interface SentimentDivergence {
  asset: string;
  divergenceStrength: number;
  type: 'positive' | 'negative';
  duration: number; // hours
}

export interface ContrarianIndicator {
  symbol: string;
  indicator: ContrarianIndicatorData;
  conditions: ContrarianConditions;
  timing: ContrarianTiming;
  risk: ContrarianRisk;
  historical: ContrarianHistorical;
}

export interface ContrarianIndicatorData {
  name: string;
  type: 'sentiment_extreme' | 'emotion_exhaustion' | 'crowd_positioning' | 'fear_greed_extreme';
  value: number;
  threshold: number;
  signal: 'contrarian_buy' | 'contrarian_sell' | 'neutral';
  strength: number; // 0-1
}

export interface ContrarianConditions {
  sentimentExtreme: boolean;
  emotionExtreme: boolean;
  volumeAnomaly: boolean;
  technicalDivergence: boolean;
  historicalPattern: boolean;
}

export interface ContrarianTiming {
  optimal: boolean;
  earlySignal: boolean;
  confirmationPending: boolean;
}

export interface ContrarianRisk {
  falsePositiveProb: number;
  maxDrawdown: number;
  timeDecay: number; // How long the signal stays valid
}

export interface ContrarianHistorical {
  accuracy: number; // Historical accuracy of this type of signal
  avgHoldingPeriod: number; // Average holding period in hours
  avgReturn: number; // Average return percentage
}

export interface SentimentSnapshot {
  timestamp: Date;
  market: MarketSentimentSnapshot;
  sectors: Record<string, SectorSentimentSnapshot>;
  topMovers: TopMovers;
  extremes: SentimentExtremes;
  alerts: SentimentAlerts;
}

export interface MarketSentimentSnapshot {
  overallSentiment: number;
  fearGreedIndex: number;
  volatilityIndex: number;
  riskAppetite: number;
}

export interface SectorSentimentSnapshot {
  sentiment: number;
  emotion: EmotionType;
  momentum: number;
  volume: number;
}

export interface TopMovers {
  mostBullish: Array<{ symbol: string; sentiment: number; change: number }>;
  mostBearish: Array<{ symbol: string; sentiment: number; change: number }>;
  largestChanges: Array<{ symbol: string; change: number; direction: 'up' | 'down' }>;
}

export interface SentimentExtremes {
  fearExtremes: string[];
  greedExtremes: string[];
  neutralZone: string[];
}

export interface SentimentAlerts {
  reversals: SentimentReversal[];
  contrarian: ContrarianIndicator[];
  correlationBreaks: string[];
}

// ==================== PATTERN RECOGNITION INTERFACES ====================

export enum PatternType {
  TECHNICAL = 'technical',
  SEASONAL = 'seasonal',
  CYCLICAL = 'cyclical',
  ANOMALY = 'anomaly',
  SENTIMENT = 'sentiment',
  VOLUME = 'volume',
  SOCIAL = 'social',
  NEWS_FLOW = 'news_flow'
}

export enum TechnicalPatternName {
  HEAD_AND_SHOULDERS = 'head_and_shoulders',
  INVERSE_HEAD_AND_SHOULDERS = 'inverse_head_and_shoulders',
  DOUBLE_TOP = 'double_top',
  DOUBLE_BOTTOM = 'double_bottom',
  TRIPLE_TOP = 'triple_top',
  TRIPLE_BOTTOM = 'triple_bottom',
  ASCENDING_TRIANGLE = 'ascending_triangle',
  DESCENDING_TRIANGLE = 'descending_triangle',
  SYMMETRICAL_TRIANGLE = 'symmetrical_triangle',
  WEDGE_RISING = 'wedge_rising',
  WEDGE_FALLING = 'wedge_falling',
  FLAG_BULLISH = 'flag_bullish',
  FLAG_BEARISH = 'flag_bearish',
  PENNANT = 'pennant',
  CUP_AND_HANDLE = 'cup_and_handle',
  ROUNDING_BOTTOM = 'rounding_bottom',
  ROUNDING_TOP = 'rounding_top'
}

export enum AnomalyType {
  SPIKE = 'spike',
  DROP = 'drop',
  VOLUME_ANOMALY = 'volume_anomaly',
  SENTIMENT_ANOMALY = 'sentiment_anomaly',
  CORRELATION_BREAK = 'correlation_break',
  SEASONAL_DEVIATION = 'seasonal_deviation',
  CYCLE_BREAK = 'cycle_break',
  OUTLIER = 'outlier'
}

export interface PatternDataPoint {
  timestamp: Date;
  symbol: string;
  value: number;
  volume: number;
  sentiment?: number;
  socialMentions?: number;
  newsCount?: number;
  metadata?: Record<string, any>;
}

export interface RecognizedPattern {
  id: string;
  type: PatternType;
  name: string;
  symbol: string;
  detectedAt: Date;
  startTime: Date;
  endTime: Date;
  confidence: number; // 0-1
  completion: number; // 0-1 (how complete the pattern is)
  
  // Pattern characteristics
  characteristics: PatternCharacteristics;
  
  // Technical details
  technical: TechnicalDetails;
  
  // Predictive analysis
  prediction: PatternPrediction;
  
  // Validation
  validation: PatternValidation;
  
  // Context
  context: PatternContext;
}

export interface PatternCharacteristics {
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-1
  reliability: number; // Historical reliability of this pattern
  timeframe: string;
  dataPoints: number;
}

export interface TechnicalDetails {
  keyLevels: number[]; // Support/resistance levels
  breakoutLevel?: number;
  targetPrice?: number;
  stopLoss?: number;
  volume: VolumePattern;
}

export interface VolumePattern {
  pattern: 'increasing' | 'decreasing' | 'stable';
  anomalies: boolean;
}

export interface PatternPrediction {
  nextMove: 'up' | 'down' | 'sideways';
  probability: number;
  timeHorizon: number; // hours
  expectedMagnitude: number; // percentage move
  riskReward: number;
}

export interface PatternValidation {
  confirmed: boolean;
  confirmationCriteria: string[];
  failurePoint?: number;
  invalidationLevel?: number;
}

export interface PatternContext {
  marketCondition: 'bull' | 'bear' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  volume: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'negative' | 'neutral';
  catalysts: string[];
}

export interface SeasonalPattern {
  id: string;
  symbol: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period: number; // in hours
  amplitude: number; // strength of seasonal effect
  phase: number; // phase shift
  confidence: number;
  
  // Pattern details
  details: SeasonalDetails;
  
  // Statistical analysis
  statistics: SeasonalStatistics;
  
  // Forecast
  forecast: SeasonalForecast;
}

export interface SeasonalDetails {
  peakTimes: Date[];
  troughTimes: Date[];
  averageMove: number;
  consistency: number; // how consistent the pattern is
  lastOccurrence: Date;
  nextExpected: Date;
}

export interface SeasonalStatistics {
  correlation: number;
  significance: number; // p-value
  sampleSize: number;
  variance: number;
  trend: 'strengthening' | 'weakening' | 'stable';
}

export interface SeasonalForecast {
  nextPeak: Date;
  nextTrough: Date;
  expectedMove: number;
  probability: number;
}

export interface CyclicalPattern {
  id: string;
  symbol: string;
  cycleName: string;
  cycleLength: number; // in hours
  currentPhase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  phaseProgress: number; // 0-1
  
  // Cycle characteristics
  characteristics: CyclicalCharacteristics;
  
  // Phase analysis
  phases: CyclicalPhases;
  
  // Prediction
  prediction: CyclicalPrediction;
}

export interface CyclicalCharacteristics {
  amplitude: number;
  volatility: number;
  symmetry: number; // how symmetric the cycle is
  dominantFrequency: number;
  harmonics: number[];
}

export interface CyclicalPhases {
  accumulation: { duration: number; characteristics: string[] };
  markup: { duration: number; characteristics: string[] };
  distribution: { duration: number; characteristics: string[] };
  markdown: { duration: number; characteristics: string[] };
}

export interface CyclicalPrediction {
  nextPhase: string;
  timeToNextPhase: number; // hours
  cycleTop: Date;
  cycleBottom: Date;
  strength: number;
}

export interface AnomalyDetection {
  id: string;
  symbol: string;
  type: AnomalyType;
  detectedAt: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Anomaly details
  details: AnomalyDetails;
  
  // Statistical analysis
  statistics: AnomalyStatistics;
  
  // Impact assessment
  impact: AnomalyImpact;
  
  // Response
  response: AnomalyResponse;
}

export interface AnomalyDetails {
  value: number;
  expectedValue: number;
  deviation: number; // standard deviations from norm
  duration: number; // how long the anomaly lasted
  magnitude: number; // size of the anomaly
}

export interface AnomalyStatistics {
  zScore: number;
  percentile: number;
  probability: number; // probability of this being a true anomaly
  historicalComparison: number; // how it compares to historical anomalies
}

export interface AnomalyImpact {
  immediate: 'none' | 'low' | 'medium' | 'high';
  shortTerm: 'none' | 'low' | 'medium' | 'high';
  longTerm: 'none' | 'low' | 'medium' | 'high';
  sectors: string[];
  correlated: string[]; // correlated symbols that might be affected
}

export interface AnomalyResponse {
  actionRequired: boolean;
  alertLevel: 'info' | 'warning' | 'critical';
  recommendations: string[];
  monitoring: string[];
}

export interface PatternPrediction {
  id: string;
  symbol: string;
  patternType: PatternType;
  patternName: string;
  prediction: PatternPredictionData;
  
  // Supporting evidence
  evidence: PatternEvidence;
  
  // Risk assessment
  risk: PatternRisk;
  
  // Validation criteria
  validation: PatternValidationCriteria;
}

export interface PatternPredictionData {
  direction: 'up' | 'down' | 'sideways';
  magnitude: number; // expected percentage move
  timeframe: number; // hours
  probability: number; // 0-1
  confidence: number; // 0-1
}

export interface PatternEvidence {
  technicalIndicators: Record<string, number>;
  volumeConfirmation: boolean;
  sentimentAlignment: boolean;
  historicalAccuracy: number;
  marketConditions: string[];
}

export interface PatternRisk {
  riskReward: number;
  maxDrawdown: number;
  successRate: number;
  avgHoldingPeriod: number;
  volatility: number;
}

export interface PatternValidationCriteria {
  entry: string[];
  exit: string[];
  stopLoss: number;
  target: number;
  timeDecay: number; // how long the prediction is valid
}

export interface MLModelResult {
  modelName: string;
  prediction: number;
  confidence: number;
  features: Record<string, number>;
  shap_values?: Record<string, number>; // Feature importance
}

// ==================== TREND AGGREGATION INTERFACES ====================

export enum TrendSourceType {
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

export enum TrendCategory {
  PRICE_MOVEMENT = 'price_movement',
  VOLUME_PATTERN = 'volume_pattern',
  SENTIMENT_SHIFT = 'sentiment_shift',
  TECHNICAL_PATTERN = 'technical_pattern',
  FUNDAMENTAL_CHANGE = 'fundamental_change',
  SOCIAL_BUZZ = 'social_buzz',
  NEWS_CATALYST = 'news_catalyst',
  MARKET_STRUCTURE = 'market_structure'
}

export enum TrendHierarchy {
  MACRO = 'macro',           // Market-wide trends
  SECTOR = 'sector',         // Sector-specific trends
  STOCK = 'stock',           // Individual stock trends
  THEME = 'theme',           // Thematic trends (ESG, Tech, etc.)
  EVENT = 'event'            // Event-driven trends
}

export enum ConflictResolutionStrategy {
  WEIGHTED_AVERAGE = 'weighted_average',
  HIGHEST_CONFIDENCE = 'highest_confidence',
  MOST_RECENT = 'most_recent',
  CONSENSUS_VOTING = 'consensus_voting',
  ML_ARBITRATION = 'ml_arbitration'
}

export interface TrendSource {
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
  metrics: TrendSourceMetrics;
  
  // Source-specific configuration
  config: TrendSourceConfig;
}

export interface TrendSourceMetrics {
  accuracy: number; // Historical accuracy
  precision: number; // Precision in trend detection
  recall: number; // Recall in trend detection
  falsePositiveRate: number;
  averageConfidence: number;
  uptimePercentage: number;
}

export interface TrendSourceConfig {
  minConfidence: number;
  maxAge: number; // Maximum age of trends to consider (seconds)
  supportedTimeframes: string[];
  dataRefreshRate: number; // seconds
}

export interface RawTrend {
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
  details: RawTrendDetails;
  
  // Context and metadata
  context: RawTrendContext;
  
  metadata: Record<string, any>;
}

export interface RawTrendDetails {
  description: string;
  triggers: string[];
  supportingFactors: string[];
  opposingFactors: string[];
  keyLevels: number[];
  expectedDuration: number; // hours
  magnitude: number; // expected percentage move
}

export interface RawTrendContext {
  marketCondition: string;
  volatilityLevel: string;
  volumeProfile: string;
  correlatedSymbols: string[];
  sectorInfluence: string[];
}

export interface AggregatedTrend {
  id: string;
  symbol: string;
  category: TrendCategory;
  hierarchy: TrendHierarchy;
  
  // Aggregated properties
  consensus: TrendConsensus;
  
  // Source breakdown
  sources: Record<string, TrendSourceContribution>;
  
  // Temporal analysis
  temporal: TrendTemporal;
  
  // Validation and quality
  validation: TrendValidation;
  
  // Prediction and forecast
  forecast: TrendForecast;
  
  // Alerts and notifications
  alerts: TrendAlerts;
}

export interface TrendConsensus {
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // Weighted average strength
  confidence: number; // Combined confidence score
  agreement: number; // Level of agreement between sources (0-1)
  participatingSourcesCount: number;
}

export interface TrendSourceContribution {
  weight: number;
  contribution: number; // Percentage contribution to final score
  alignment: number; // How aligned with consensus (-1 to 1)
  trend: RawTrend;
}

export interface TrendTemporal {
  createdAt: Date;
  lastUpdated: Date;
  stability: number; // How stable the trend has been over time
  momentum: number; // Rate of change in strength
  persistence: number; // How long the trend has persisted
  decay: number; // Current decay factor based on age
}

export interface TrendValidation {
  crossValidated: boolean;
  conflictResolution: ConflictResolutionStrategy | null;
  qualityScore: number; // Overall quality assessment
  reliabilityScore: number; // Based on source reliability
  consistencyScore: number; // Internal consistency
  outlierSources: string[]; // Sources that significantly disagree
}

export interface TrendForecast {
  expectedDuration: number; // hours
  probabilityOfContinuation: number;
  expectedMagnitude: number; // percentage move
  peakTime: Date | null;
  decayTime: Date | null;
  riskFactors: string[];
}

export interface TrendAlerts {
  strengthThresholdCrossed: boolean;
  confidenceThresholdCrossed: boolean;
  newSourcesAdded: boolean;
  conflictDetected: boolean;
  qualityDegraded: boolean;
}

export interface TrendRanking {
  ranking: Array<TrendRankingEntry>;
  
  metadata: TrendRankingMetadata;
  
  // Category-specific rankings
  categoryRankings: Record<TrendCategory, Array<CategoryRankingEntry>>;
  
  // Time-based analysis
  temporal: TrendRankingTemporal;
}

export interface TrendRankingEntry {
  trend: AggregatedTrend;
  score: number;
  rank: number;
  rankChange: number; // Change since last ranking
  category: TrendCategory;
  timeInRanking: number; // hours
}

export interface CategoryRankingEntry {
  trend: AggregatedTrend;
  categoryScore: number;
  categoryRank: number;
}

export interface TrendRankingMetadata {
  generatedAt: Date;
  totalTrends: number;
  averageQuality: number;
  coverageByCategory: Record<TrendCategory, number>;
  coverageByHierarchy: Record<TrendHierarchy, number>;
  topSources: string[];
}

export interface TrendRankingTemporal {
  emerging: AggregatedTrend[]; // Recently emerged trends
  strengthening: AggregatedTrend[]; // Gaining strength
  weakening: AggregatedTrend[]; // Losing strength
  stable: AggregatedTrend[]; // Stable trends
  expiring: AggregatedTrend[]; // About to expire
}

export interface ConflictAnalysis {
  conflictId: string;
  symbol: string;
  conflictingTrends: RawTrend[];
  conflictType: 'directional' | 'strength' | 'timeframe' | 'magnitude';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Conflict details
  details: ConflictDetails;
  
  // Resolution
  resolution: ConflictResolution;
  
  // Monitoring
  monitoring: ConflictMonitoring;
}

export interface ConflictDetails {
  primaryConflict: string;
  contradictionLevel: number; // 0-1
  affectedSources: string[];
  timeframeOverlap: boolean;
  strengthDisparity: number;
  confidenceDisparity: number;
}

export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolvedDirection: 'bullish' | 'bearish' | 'neutral';
  resolvedStrength: number;
  resolvedConfidence: number;
  reasoning: string[];
  sourcesExcluded: string[];
  qualityImpact: number; // Impact on final quality (-1 to 1)
}

export interface ConflictMonitoring {
  needsReview: boolean;
  escalationLevel: number; // 0-3
  reviewedAt: Date | null;
  resolvedAt: Date;
  followUpRequired: boolean;
}

export interface TrendValidationResult {
  symbol: string;
  trendId: string;
  validationType: 'cross_source' | 'cross_platform' | 'historical' | 'technical' | 'fundamental';
  
  validation: ValidationResult;
  
  crossValidation: CrossValidationResult;
  
  qualityAssessment: QualityAssessment;
}

export interface ValidationResult {
  passed: boolean;
  score: number; // 0-1
  criteria: Array<ValidationCriterion>;
}

export interface ValidationCriterion {
  name: string;
  passed: boolean;
  score: number;
  weight: number;
  description: string;
}

export interface CrossValidationResult {
  independentSources: number;
  agreementLevel: number; // 0-1
  timeConsistency: number; // 0-1
  magnitudeConsistency: number; // 0-1
  directionConsistency: number; // 0-1
}

export interface QualityAssessment {
  dataQuality: number;
  sourceCredibility: number;
  temporalConsistency: number;
  logicalConsistency: number;
  overallQuality: number;
}

// ==================== TREND ALERT SYSTEM INTERFACES ====================

export enum AlertType {
  TREND_EMERGENCE = 'trend_emergence',
  TREND_STRENGTHENING = 'trend_strengthening',
  TREND_WEAKENING = 'trend_weakening',
  TREND_REVERSAL = 'trend_reversal',
  THRESHOLD_BREACH = 'threshold_breach',
  ANOMALY_DETECTED = 'anomaly_detected',
  PATTERN_COMPLETION = 'pattern_completion',
  SENTIMENT_EXTREME = 'sentiment_extreme',
  VOLUME_SPIKE = 'volume_spike',
  CORRELATION_BREAK = 'correlation_break',
  VELOCITY_CHANGE = 'velocity_change',
  CONFLICT_DETECTED = 'conflict_detected'
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent'
}

export enum AlertStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
  EXPIRED = 'expired'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  DISCORD = 'discord',
  TEAMS = 'teams',
  IN_APP = 'in_app'
}

export enum AlertRuleOperator {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  EQUAL = 'eq',
  NOT_EQUAL = 'ne',
  GREATER_EQUAL = 'gte',
  LESS_EQUAL = 'lte',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  NOT_BETWEEN = 'not_between'
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  userId?: string; // For user-specific rules
  
  // Rule conditions
  conditions: AlertCondition[];
  operator: 'AND' | 'OR'; // How to combine multiple conditions
  
  // Alert settings
  alertType: AlertType;
  priority: AlertPriority;
  channels: NotificationChannel[];
  
  // Filtering
  symbols: string[]; // Empty array means all symbols
  categories: string[];
  hierarchies: string[];
  timeframes: string[];
  
  // Throttling and fatigue prevention
  throttling: AlertThrottling;
  
  // Scheduling
  schedule: AlertSchedule;
  
  // Escalation
  escalation: AlertEscalation;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  
  // Performance metrics
  metrics: AlertRuleMetrics;
}

export interface AlertCondition {
  id: string;
  field: string; // trend.strength, trend.confidence, etc.
  operator: AlertRuleOperator;
  value: any; // threshold value or array of values
  weight: number; // 0-1 weight for this condition
  
  // Advanced conditions
  timeWindow?: number; // seconds - condition must be true for this duration
  comparison?: AlertComparison;
  
  // Context conditions
  contextual?: AlertContextualCondition;
}

export interface AlertComparison {
  field: string;
  operator: AlertRuleOperator;
}

export interface AlertContextualCondition {
  marketCondition?: string[];
  volatility?: string[];
  volume?: string[];
  sentiment?: string[];
}

export interface AlertThrottling {
  enabled: boolean;
  interval: number; // seconds
  maxAlerts: number; // max alerts per interval
  cooldownPeriod: number; // seconds
}

export interface AlertSchedule {
  enabled: boolean;
  timezone: string;
  activeHours: { start: string; end: string }; // HH:MM format
  activeDays: number[]; // 0-6 (Sunday-Saturday)
  excludeHolidays: boolean;
}

export interface AlertEscalation {
  enabled: boolean;
  delays: number[]; // seconds for each escalation level
  channels: NotificationChannel[][]; // channels for each escalation level
  acknowledgmentRequired: boolean;
}

export interface AlertRuleMetrics {
  totalTriggers: number;
  falsePositives: number;
  truePositives: number;
  acknowledgmentRate: number;
  averageResponseTime: number;
  effectiveness: number; // 0-1 score
}

export interface TrendAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  
  // Trigger information
  triggeredAt: Date;
  symbol: string;
  category: string;
  hierarchy: string;
  timeframe: string;
  
  // Alert content
  title: string;
  message: string;
  description: string;
  
  // Trend data
  trendData: AlertTrendData;
  
  // Context
  context: AlertContext;
  
  // Supporting data
  supportingData: AlertSupportingData;
  
  // Delivery tracking
  delivery: AlertDelivery;
  
  // User interaction
  interaction: AlertInteraction;
  
  // Escalation tracking
  escalation: AlertEscalationTracking;
  
  // Alert lifecycle
  lifecycle: AlertLifecycle;
  
  metadata: Record<string, any>;
}

export interface AlertTrendData {
  direction: string;
  strength: number;
  confidence: number;
  magnitude: number;
  duration: number;
  keyLevels: number[];
}

export interface AlertContext {
  marketCondition: string;
  volatility: string;
  volume: string;
  sentiment: string;
  correlatedSymbols: string[];
  catalysts: string[];
}

export interface AlertSupportingData {
  charts?: string[]; // URLs to chart images
  data?: Record<string, any>;
  references?: string[];
  recommendations?: string[];
}

export interface AlertDelivery {
  channels: NotificationChannel[];
  attempts: Array<AlertDeliveryAttempt>;
  delivered: boolean;
  deliveredAt?: Date;
}

export interface AlertDeliveryAttempt {
  channel: NotificationChannel;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface AlertInteraction {
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  feedback?: AlertFeedback;
}

export interface AlertFeedback {
  useful: boolean;
  accuracy: number; // 1-5 rating
  comments: string;
}

export interface AlertEscalationTracking {
  level: number;
  escalatedAt?: Date;
  maxLevel: number;
  nextEscalationAt?: Date;
}

export interface AlertLifecycle {
  expiresAt: Date;
  suppressedUntil?: Date;
  retries: number;
  maxRetries: number;
}

export interface AlertThreshold {
  id: string;
  name: string;
  field: string;
  symbol?: string; // null for global thresholds
  
  // Static thresholds
  static: StaticThreshold;
  
  // Dynamic thresholds
  dynamic: DynamicThreshold;
  
  // Adaptive thresholds
  adaptive: AdaptiveThreshold;
  
  // Current threshold value
  current: CurrentThreshold;
  
  // Performance tracking
  performance: ThresholdPerformance;
}

export interface StaticThreshold {
  enabled: boolean;
  value: number;
  operator: AlertRuleOperator;
}

export interface DynamicThreshold {
  enabled: boolean;
  baseValue: number;
  volatilityMultiplier: number;
  trendAdjustment: number;
  marketConditionAdjustment: Record<string, number>;
  timeOfDayAdjustment: Record<string, number>;
}

export interface AdaptiveThreshold {
  enabled: boolean;
  learningRate: number;
  lookbackPeriod: number; // hours
  confidenceInterval: number; // e.g., 0.95 for 95% CI
  minDataPoints: number;
}

export interface CurrentThreshold {
  value: number;
  calculatedAt: Date;
  method: 'static' | 'dynamic' | 'adaptive';
  confidence: number;
}

export interface ThresholdPerformance {
  triggers: number;
  falsePositives: number;
  missedEvents: number;
  accuracy: number;
  lastCalibration: Date;
}

export interface AlertBatch {
  id: string;
  createdAt: Date;
  processedAt?: Date;
  
  alerts: TrendAlert[];
  
  // Batch processing settings
  processing: BatchProcessingSettings;
  
  // Deduplication
  deduplication: BatchDeduplication;
  
  // Delivery results
  results: BatchResults;
}

export interface BatchProcessingSettings {
  maxSize: number;
  maxAge: number; // seconds
  priority: AlertPriority;
  channels: NotificationChannel[];
}

export interface BatchDeduplication {
  enabled: boolean;
  window: number; // seconds
  criteria: string[]; // fields to check for duplicates
  strategy: 'merge' | 'skip' | 'replace';
}

export interface BatchResults {
  total: number;
  delivered: number;
  failed: number;
  suppressed: number;
  deduplicated: number;
}

export interface AlertAnalytics {
  timeframe: string;
  generatedAt: Date;
  
  // Volume metrics
  volume: AlertVolumeMetrics;
  
  // Performance metrics
  performance: AlertPerformanceMetrics;
  
  // Trend analysis
  trends: AlertTrendAnalysis;
  
  // User engagement
  engagement: AlertEngagementMetrics;
  
  // Recommendations
  recommendations: AlertRecommendations;
}

export interface AlertVolumeMetrics {
  total: number;
  byType: Record<AlertType, number>;
  byPriority: Record<AlertPriority, number>;
  byStatus: Record<AlertStatus, number>;
  byChannel: Record<NotificationChannel, number>;
}

export interface AlertPerformanceMetrics {
  averageResponseTime: number;
  acknowledgmentRate: number;
  resolutionRate: number;
  falsePositiveRate: number;
  effectivenessScore: number;
}

export interface AlertTrendAnalysis {
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
  performanceTrend: 'improving' | 'declining' | 'stable';
  topTriggers: Array<{ rule: string; count: number }>;
  topSymbols: Array<{ symbol: string; count: number }>;
  peakHours: number[];
}

export interface AlertEngagementMetrics {
  activeUsers: number;
  topUsers: Array<{ userId: string; interactions: number }>;
  feedbackScore: number;
  customRulesCreated: number;
}

export interface AlertRecommendations {
  thresholdAdjustments: Array<{ threshold: string; suggestion: string }>;
  ruleOptimizations: Array<{ rule: string; suggestion: string }>;
  channelOptimizations: Array<{ channel: string; suggestion: string }>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: AlertType;
  channel: NotificationChannel;
  
  // Template content
  subject: string;
  body: string;
  htmlBody?: string;
  
  // Template variables
  variables: Array<TemplateVariable>;
  
  // Formatting options
  formatting: TemplateFormatting;
  
  // Localization
  localization: TemplateLocalization;
}

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface TemplateFormatting {
  includeCharts: boolean;
  includeData: boolean;
  includeRecommendations: boolean;
  includeContext: boolean;
  maxLength?: number;
}

export interface TemplateLocalization {
  enabled: boolean;
  languages: string[];
  defaultLanguage: string;
}

// ==================== SHARED UTILITY INTERFACES ====================

export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  volume?: number;
  metadata?: Record<string, any>;
}

export interface CorrelationMatrix {
  symbols: string[];
  correlations: number[][];
  timestamp: Date;
  timeframe: string;
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  percentiles: Record<number, number>; // e.g., {25: 0.5, 50: 0.7, 75: 0.9}
}

export interface TrendAnalysisConfig {
  // Data retention settings
  dataRetentionDays: number;
  maxDataPointsPerSymbol: number;
  
  // Processing settings
  batchSize: number;
  processingInterval: number; // milliseconds
  
  // Confidence thresholds
  minConfidenceThreshold: number;
  highConfidenceThreshold: number;
  
  // Time window settings
  shortTermWindow: number; // hours
  mediumTermWindow: number; // hours
  longTermWindow: number; // hours
  
  // Alert settings
  alertThresholds: Record<string, number>;
  escalationDelays: number[]; // seconds
  
  // Performance settings
  maxConcurrentAnalyses: number;
  cacheExpirationTime: number; // seconds
  
  // ML model settings
  modelUpdateInterval: number; // hours
  minTrainingDataSize: number;
  
  // Validation settings
  crossValidationFolds: number;
  validationThreshold: number;
}

export interface TrendAnalysisResult {
  symbol: string;
  timestamp: Date;
  timeframe: string;
  
  // Results from different components
  realtimeTrends: TrendSignal[];
  velocityAnalysis: VelocityProfile | null;
  sentimentTrends: EmotionalTrend | null;
  recognizedPatterns: RecognizedPattern[];
  aggregatedTrend: AggregatedTrend | null;
  activeAlerts: TrendAlert[];
  
  // Overall assessment
  overallConfidence: number;
  majorTrends: string[];
  keyInsights: string[];
  riskFactors: string[];
  recommendations: string[];
  
  // Performance metrics
  processingTime: number; // milliseconds
  dataQuality: number; // 0-1
  sourceCoverage: number; // 0-1
}

export interface TrendEngineStatus {
  lastUpdate: Date;
  activeSymbols: number;
  totalTrends: number;
  alertsGenerated24h: number;
  averageProcessingTime: number; // milliseconds
  systemHealth: 'healthy' | 'warning' | 'critical';
  
  componentStatus: {
    realtimeDetector: 'active' | 'inactive' | 'error';
    velocityAnalyzer: 'active' | 'inactive' | 'error';
    sentimentTracker: 'active' | 'inactive' | 'error';
    patternRecognition: 'active' | 'inactive' | 'error';
    trendAggregation: 'active' | 'inactive' | 'error';
    alertSystem: 'active' | 'inactive' | 'error';
  };
  
  performance: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    diskUsage: number; // percentage
    networkLatency: number; // milliseconds
  };
  
  errors: Array<{
    component: string;
    error: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}