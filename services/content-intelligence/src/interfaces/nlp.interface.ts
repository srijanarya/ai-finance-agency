/**
 * Comprehensive NLP Processing Interfaces
 * Defines contracts for all NLP-related operations in the Content Intelligence service
 */

export interface SentimentAnalysisResult {
  score: number; // -1 to 1 (negative to positive)
  magnitude: number; // 0 to 1 (strength of emotion)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
  details?: {
    positive?: number;
    negative?: number;
    neutral?: number;
  };
}

export interface EntityExtractionResult {
  entities: NLPEntity[];
  totalEntities: number;
  entityTypes: string[];
}

export interface NLPEntity {
  text: string;
  type: EntityType;
  confidence: number;
  startOffset: number;
  endOffset: number;
  metadata?: Record<string, any>;
  relatedEntities?: string[];
  sentiment?: SentimentAnalysisResult;
}

export enum EntityType {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
  LOCATION = 'LOCATION',
  MONEY = 'MONEY',
  PERCENT = 'PERCENT',
  DATE = 'DATE',
  TIME = 'TIME',
  STOCK_SYMBOL = 'STOCK_SYMBOL',
  FINANCIAL_INSTRUMENT = 'FINANCIAL_INSTRUMENT',
  CURRENCY = 'CURRENCY',
  COMMODITY = 'COMMODITY',
  MARKET_INDEX = 'MARKET_INDEX',
  COMPANY = 'COMPANY',
  EXCHANGE = 'EXCHANGE',
  SECTOR = 'SECTOR',
  ECONOMIC_INDICATOR = 'ECONOMIC_INDICATOR',
  REGULATORY_BODY = 'REGULATORY_BODY',
  ANALYST = 'ANALYST',
  FUND = 'FUND',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY'
}

export interface KeyPhraseExtractionResult {
  keyPhrases: KeyPhrase[];
  totalPhrases: number;
  categories: string[];
}

export interface KeyPhrase {
  text: string;
  relevanceScore: number;
  frequency: number;
  category?: string;
  startOffset?: number;
  endOffset?: number;
  relatedEntities?: string[];
}

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  alternativeLanguages?: Array<{
    language: string;
    confidence: number;
  }>;
}

export interface TextSummarizationResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  keyPoints: string[];
  confidence: number;
  method: 'extractive' | 'abstractive';
}

export interface TopicModelingResult {
  topics: Topic[];
  dominantTopic: Topic;
  topicDistribution: Record<string, number>;
  coherenceScore: number;
}

export interface Topic {
  id: string;
  label: string;
  keywords: string[];
  probability: number;
  coherence: number;
  relatedTopics?: string[];
}

export interface NLPProcessingOptions {
  enableSentimentAnalysis?: boolean;
  enableEntityExtraction?: boolean;
  enableKeyPhraseExtraction?: boolean;
  enableLanguageDetection?: boolean;
  enableTextSummarization?: boolean;
  enableTopicModeling?: boolean;
  entityTypes?: EntityType[];
  summaryLength?: number;
  maxKeyPhrases?: number;
  confidenceThreshold?: number;
  useAdvancedNLP?: boolean; // Use OpenAI/Claude for complex analysis
}

export interface NLPProcessingResult {
  text: string;
  processedAt: Date;
  processingTimeMs: number;
  sentiment?: SentimentAnalysisResult;
  entities?: EntityExtractionResult;
  keyPhrases?: KeyPhraseExtractionResult;
  language?: LanguageDetectionResult;
  summary?: TextSummarizationResult;
  topics?: TopicModelingResult;
  metadata: {
    textLength: number;
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    complexity?: number;
    readabilityScore?: number;
  };
}

export interface MarketInsightResult {
  tradingSignals: TradingSignal[];
  marketTrends: MarketTrend[];
  priceTargets: PriceTarget[];
  analystRecommendations: AnalystRecommendation[];
  financialMetrics: FinancialMetric[];
  riskFactors: RiskFactor[];
  opportunities: MarketOpportunity[];
  confidence: number;
  extractedAt: Date;
}

export interface TradingSignal {
  symbol: string;
  signal: 'buy' | 'sell' | 'hold';
  strength: number; // 0 to 1
  timeframe: string;
  confidence: number;
  reasoning: string;
  extractedFrom: string;
  metadata?: Record<string, any>;
}

export interface MarketTrend {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  timeframe: string;
  affectedSymbols: string[];
  drivers: string[];
  confidence: number;
  duration?: string;
}

export interface PriceTarget {
  symbol: string;
  targetPrice: number;
  currentPrice?: number;
  upside?: number;
  timeframe: string;
  analyst?: string;
  confidence: number;
  reasoning: string;
}

export interface AnalystRecommendation {
  symbol: string;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  analyst: string;
  firm?: string;
  rating?: string;
  priceTarget?: number;
  reasoning: string;
  date: Date;
  confidence: number;
}

export interface FinancialMetric {
  symbol: string;
  metric: string;
  value: number;
  unit?: string;
  period: string;
  comparison?: {
    previousValue?: number;
    changePercent?: number;
    trend?: 'improving' | 'declining' | 'stable';
  };
  confidence: number;
}

export interface RiskFactor {
  type: 'market' | 'company' | 'sector' | 'regulatory' | 'operational' | 'financial';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  affectedSymbols: string[];
  mitigation?: string;
}

export interface MarketOpportunity {
  type: 'growth' | 'value' | 'momentum' | 'contrarian' | 'event_driven';
  description: string;
  symbols: string[];
  timeframe: string;
  potential: number;
  confidence: number;
  requirements?: string[];
}

export interface TrendDetectionResult {
  trends: DetectedTrend[];
  momentum: MomentumAnalysis;
  socialSentiment: SocialSentimentTrend;
  newsVelocity: NewsVelocityMetrics;
  patterns: PatternRecognition[];
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
}

export interface DetectedTrend {
  id: string;
  type: 'price' | 'volume' | 'sentiment' | 'news' | 'social' | 'technical';
  direction: 'up' | 'down' | 'sideways';
  strength: number;
  duration: number; // in hours
  symbols: string[];
  description: string;
  confidence: number;
  isRealTime: boolean;
  metadata?: Record<string, any>;
}

export interface MomentumAnalysis {
  overall: number; // -1 to 1
  shortTerm: number; // last hour
  mediumTerm: number; // last 4 hours
  longTerm: number; // last 24 hours
  acceleration: number;
  volume: number;
  confidence: number;
}

export interface SocialSentimentTrend {
  currentSentiment: number;
  sentimentChange: number;
  volume: number;
  sources: string[];
  trending: boolean;
  influencers?: string[];
  keywords: string[];
}

export interface NewsVelocityMetrics {
  articlesPerHour: number;
  velocityChange: number;
  averageVelocity: number;
  peakVelocity: number;
  categories: Record<string, number>;
  sources: Record<string, number>;
}

export interface PatternRecognition {
  pattern: string;
  type: 'bullish' | 'bearish' | 'neutral';
  probability: number;
  timeframe: string;
  description: string;
  historicalAccuracy?: number;
}

export interface ContentScoringResult {
  overallScore: number; // 0 to 100
  relevanceScore: number;
  credibilityScore: number;
  timelinessScore: number;
  impactScore: number;
  qualityScore: number;
  breakdown: ScoreBreakdown;
  recommendation: 'publish' | 'review' | 'reject' | 'enhance';
  reasons: string[];
  improvementSuggestions?: string[];
}

export interface ScoreBreakdown {
  content: {
    length: number;
    readability: number;
    structure: number;
    clarity: number;
  };
  sources: {
    authority: number;
    reputation: number;
    expertise: number;
    bias: number;
  };
  market: {
    relevance: number;
    timeliness: number;
    significance: number;
    uniqueness: number;
  };
  engagement: {
    potential: number;
    targetAlignment: number;
    virality: number;
  };
}

export interface ContentStreamEvent {
  id: string;
  type: 'content_processed' | 'insight_extracted' | 'trend_detected' | 'score_updated';
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CacheStrategy {
  ttl: number; // Time to live in seconds
  key: string;
  tags: string[];
  invalidateOn?: string[];
  precompute?: boolean;
  warmup?: boolean;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  avgResponseTime: number;
  totalRequests: number;
}