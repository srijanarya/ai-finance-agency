/**
 * Market Insight Extraction System Interfaces
 * Advanced TypeScript interfaces for comprehensive market analysis and signal detection
 */

import { EntityType } from './nlp.interface';

// ===== COMMON TYPES =====

export interface ConfidenceMetrics {
  overall: number; // 0 to 1
  dataQuality: number;
  sourceReliability: number;
  modelAccuracy: number;
  temporalRelevance: number;
}

export interface MarketContext {
  timestamp: Date;
  marketSession: 'pre-market' | 'regular' | 'after-hours' | 'closed';
  volatilityRegime: 'low' | 'normal' | 'high' | 'extreme';
  marketCondition: 'bull' | 'bear' | 'sideways' | 'volatile';
  economicCycle: 'expansion' | 'peak' | 'contraction' | 'trough';
}

export interface FinancialInstrument {
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'option' | 'future' | 'etf' | 'mutual_fund' | 'crypto' | 'commodity' | 'currency' | 'index';
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  currency: string;
  isin?: string;
  cusip?: string;
  metadata?: Record<string, any>;
}

// ===== MARKET SIGNAL DETECTOR INTERFACES =====

export interface TradingSignalDetectionOptions {
  sourceTypes: ContentSourceType[];
  signalTypes: SignalType[];
  timeframes: string[];
  confidenceThreshold: number;
  enableInsiderDetection: boolean;
  enableEarningsGuidance: boolean;
  enableRatingChanges: boolean;
  lookbackPeriod?: number;
  realTimeProcessing: boolean;
}

export enum ContentSourceType {
  NEWS = 'NEWS',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ANALYST_REPORTS = 'ANALYST_REPORTS',
  SEC_FILINGS = 'SEC_FILINGS',
  EARNINGS_CALLS = 'EARNINGS_CALLS',
  PRESS_RELEASES = 'PRESS_RELEASES',
  RESEARCH_REPORTS = 'RESEARCH_REPORTS',
  INSIDER_TRADING = 'INSIDER_TRADING',
  PATENT_FILINGS = 'PATENT_FILINGS'
}

export enum SignalType {
  PRICE_TARGET = 'PRICE_TARGET',
  RATING_CHANGE = 'RATING_CHANGE',
  EARNINGS_REVISION = 'EARNINGS_REVISION',
  INSIDER_ACTIVITY = 'INSIDER_ACTIVITY',
  MOMENTUM = 'MOMENTUM',
  MEAN_REVERSION = 'MEAN_REVERSION',
  BREAKOUT = 'BREAKOUT',
  VOLUME_SURGE = 'VOLUME_SURGE',
  SENTIMENT_SHIFT = 'SENTIMENT_SHIFT',
  EVENT_DRIVEN = 'EVENT_DRIVEN'
}

export interface MarketSignalDetectionResult {
  signals: TradingSignal[];
  priceTargets: EnhancedPriceTarget[];
  insiderActivity: InsiderTradingPattern[];
  earningsGuidance: EarningsGuidanceSignal[];
  ratingChanges: AnalystRatingChange[];
  unusualActivity: UnusualActivityAlert[];
  forwardLookingStatements: ForwardLookingStatement[];
  confidence: ConfidenceMetrics;
  marketContext: MarketContext;
  processingMetrics: {
    contentProcessed: number;
    signalsGenerated: number;
    processingTimeMs: number;
    sourcesAnalyzed: ContentSourceType[];
  };
  metadata?: Record<string, any>;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  signalType: SignalType;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0 to 1
  timeframe: '1h' | '4h' | '1d' | '1w' | '1m';
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  confidence: ConfidenceMetrics;
  reasoning: string;
  sourceContent: string;
  sourceType: ContentSourceType;
  extractedAt: Date;
  validUntil?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn?: number;
  maxDrawdown?: number;
  backtestResults?: BacktestResults;
  relatedSignals?: string[];
}

export interface EnhancedPriceTarget {
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  upside: number;
  timeframe: string;
  analyst: string;
  firm: string;
  methodology: string;
  assumptions: string[];
  risks: string[];
  catalysts: string[];
  confidence: ConfidenceMetrics;
  historicalAccuracy?: number;
  targetRevisions?: PriceTargetRevision[];
}

export interface InsiderTradingPattern {
  symbol: string;
  insiderType: 'officer' | 'director' | '10_percent_owner' | 'other';
  transactionType: 'buy' | 'sell' | 'option_exercise' | 'gift' | 'inheritance';
  shares: number;
  value: number;
  pricePerShare: number;
  pattern: 'accumulation' | 'distribution' | 'isolated' | 'cluster';
  significance: 'low' | 'medium' | 'high' | 'unusual';
  confidence: number;
  filingDate: Date;
  transactionDate: Date;
  unusualityScore: number;
  contextualFactors: string[];
}

export interface EarningsGuidanceSignal {
  symbol: string;
  guidanceType: 'revenue' | 'eps' | 'margin' | 'segment' | 'full_year' | 'quarterly';
  metric: string;
  currentEstimate: number;
  newGuidance: number;
  change: number;
  changePercent: number;
  direction: 'raise' | 'lower' | 'maintain' | 'withdraw';
  confidence: string;
  reasoning: string[];
  marketReaction?: {
    priceChange: number;
    volumeIncrease: number;
    analystRevisions: number;
  };
  extractedAt: Date;
  sourceType: ContentSourceType;
}

export interface AnalystRatingChange {
  symbol: string;
  analyst: string;
  firm: string;
  previousRating: string;
  newRating: string;
  ratingChange: 'upgrade' | 'downgrade' | 'initiate' | 'reiterate';
  priceTarget?: number;
  previousPriceTarget?: number;
  reasoning: string;
  keyFactors: string[];
  riskFactors: string[];
  timeHorizon: string;
  confidence: ConfidenceMetrics;
  analystReputation?: AnalystReputationMetrics;
  marketImpact?: {
    expectedPriceMove: number;
    volumeExpectation: number;
    sectorImplications: string[];
  };
}

export interface UnusualActivityAlert {
  symbol: string;
  activityType: 'volume' | 'price' | 'options' | 'institutional' | 'insider';
  description: string;
  significance: number;
  comparisonMetrics: {
    current: number;
    average: number;
    percentileRank: number;
    zScore: number;
  };
  potentialCauses: string[];
  marketImplications: string[];
  followUpActions: string[];
  detectedAt: Date;
  confidence: number;
}

export interface ForwardLookingStatement {
  symbol: string;
  statementType: 'guidance' | 'outlook' | 'forecast' | 'target' | 'plan';
  timeframe: string;
  category: string;
  content: string;
  quantitativeTargets: QuantitativeTarget[];
  qualitativeOutlook: string[];
  riskFactors: string[];
  assumptions: string[];
  confidence: string;
  sourceDocument: string;
  extractedAt: Date;
  marketSignificance: 'low' | 'medium' | 'high';
}

export interface QuantitativeTarget {
  metric: string;
  value: number;
  unit: string;
  timeframe: string;
  probability?: number;
  conditions?: string[];
}

// ===== FINANCIAL ENTITY RECOGNIZER INTERFACES =====

export interface FinancialEntityRecognitionOptions {
  entityTypes: FinancialEntityType[];
  enableDisambiguation: boolean;
  enableTickerResolution: boolean;
  enableMetricExtraction: boolean;
  enableCurrencyRecognition: boolean;
  enableCommodityRecognition: boolean;
  confidenceThreshold: number;
  contextWindowSize: number;
  useExternalDataSources: boolean;
}

export enum FinancialEntityType {
  STOCK = 'STOCK',
  BOND = 'BOND',
  OPTION = 'OPTION',
  FUTURE = 'FUTURE',
  ETF = 'ETF',
  MUTUAL_FUND = 'MUTUAL_FUND',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  COMMODITY = 'COMMODITY',
  CURRENCY_PAIR = 'CURRENCY_PAIR',
  INDEX = 'INDEX',
  FINANCIAL_METRIC = 'FINANCIAL_METRIC',
  COMPANY_NAME = 'COMPANY_NAME',
  EXCHANGE = 'EXCHANGE',
  REGULATORY_FILING = 'REGULATORY_FILING',
  CENTRAL_BANK = 'CENTRAL_BANK',
  RATING_AGENCY = 'RATING_AGENCY'
}

export interface FinancialEntityRecognitionResult {
  entities: RecognizedFinancialEntity[];
  disambiguations: EntityDisambiguation[];
  tickerResolutions: TickerResolution[];
  financialMetrics: ExtractedFinancialMetric[];
  currencyMentions: CurrencyMention[];
  commodityMentions: CommodityMention[];
  processingMetrics: {
    totalEntitiesFound: number;
    entitiesRecognized: number;
    ambiguitiesResolved: number;
    processingTimeMs: number;
  };
  confidence: ConfidenceMetrics;
}

export interface RecognizedFinancialEntity {
  id: string;
  text: string;
  type: FinancialEntityType;
  startOffset: number;
  endOffset: number;
  confidence: number;
  instrument?: FinancialInstrument;
  context: string;
  disambiguationScore?: number;
  alternativeEntities?: RecognizedFinancialEntity[];
  relatedEntities: string[];
  metadata: Record<string, any>;
}

export interface EntityDisambiguation {
  originalText: string;
  candidates: DisambiguationCandidate[];
  selectedCandidate: DisambiguationCandidate;
  disambiguationMethod: string;
  contextFactors: string[];
  confidence: number;
}

export interface DisambiguationCandidate {
  entity: FinancialInstrument;
  score: number;
  reasoning: string;
  contextMatch: number;
  dataQuality: number;
}

export interface TickerResolution {
  inputText: string;
  resolvedSymbol: string;
  exchange: string;
  companyName: string;
  confidence: number;
  alternativeSymbols?: string[];
  resolutionMethod: 'exact_match' | 'fuzzy_match' | 'context_based' | 'ml_model';
  dataSource: string;
}

export interface ExtractedFinancialMetric {
  symbol?: string;
  metricName: string;
  value: number;
  unit?: string;
  period: string;
  metricType: 'profitability' | 'liquidity' | 'efficiency' | 'leverage' | 'valuation' | 'growth';
  context: string;
  confidence: number;
  extractionMethod: string;
  benchmarkComparison?: {
    peerAverage?: number;
    industryAverage?: number;
    percentileRank?: number;
  };
}

export interface CurrencyMention {
  currency: string;
  currencyCode: string;
  amount?: number;
  context: string;
  confidence: number;
  exchangeRate?: number;
  baseCurrency?: string;
}

export interface CommodityMention {
  commodity: string;
  commodityCode?: string;
  amount?: number;
  unit?: string;
  context: string;
  confidence: number;
  currentPrice?: number;
  priceUnit?: string;
}

// ===== RISK ASSESSMENT ENGINE INTERFACES =====

export interface RiskAssessmentOptions {
  riskTypes: RiskType[];
  timeHorizons: string[];
  enableSystematicRisk: boolean;
  enableVolatilityPrediction: boolean;
  enableCreditRisk: boolean;
  enableMarketCrashPrediction: boolean;
  enableRegulatoryRisk: boolean;
  confidenceThreshold: number;
  monteCarloSimulations?: number;
  stressTestScenarios?: string[];
}

export enum RiskType {
  MARKET_RISK = 'MARKET_RISK',
  CREDIT_RISK = 'CREDIT_RISK',
  LIQUIDITY_RISK = 'LIQUIDITY_RISK',
  OPERATIONAL_RISK = 'OPERATIONAL_RISK',
  REGULATORY_RISK = 'REGULATORY_RISK',
  POLITICAL_RISK = 'POLITICAL_RISK',
  CONCENTRATION_RISK = 'CONCENTRATION_RISK',
  COUNTERPARTY_RISK = 'COUNTERPARTY_RISK',
  CURRENCY_RISK = 'CURRENCY_RISK',
  INTEREST_RATE_RISK = 'INTEREST_RATE_RISK',
  INFLATION_RISK = 'INFLATION_RISK',
  EVENT_RISK = 'EVENT_RISK'
}

export interface RiskAssessmentResult {
  overallRiskScore: number; // 0 to 100
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'extreme';
  systematicRisks: SystematicRisk[];
  idiosyncraticRisks: IdiosyncraticRisk[];
  volatilityPredictions: VolatilityPrediction[];
  creditRiskIndicators: CreditRiskIndicator[];
  marketCrashSignals: MarketCrashSignal[];
  regulatoryRisks: RegulatoryRisk[];
  riskFactors: RiskFactor[];
  mitigationStrategies: RiskMitigationStrategy[];
  stressTestResults?: StressTestResult[];
  confidence: ConfidenceMetrics;
  assessmentDate: Date;
  validityPeriod: string;
}

export interface SystematicRisk {
  riskType: RiskType;
  description: string;
  severity: number; // 0 to 1
  probability: number; // 0 to 1
  timeframe: string;
  affectedMarkets: string[];
  riskFactors: string[];
  historicalPrecedents: string[];
  potentialImpact: {
    marketDrawdown: number;
    volatilityIncrease: number;
    correlationIncrease: number;
    liquidityDecrease: number;
  };
  earlyWarningIndicators: string[];
  confidence: number;
}

export interface IdiosyncraticRisk {
  symbol: string;
  riskType: RiskType;
  description: string;
  severity: number;
  probability: number;
  potentialImpact: {
    priceImpact: number;
    volatilityIncrease: number;
    timeToResolve: string;
  };
  catalysts: string[];
  mitigants: string[];
  confidence: number;
}

export interface VolatilityPrediction {
  symbol?: string;
  market?: string;
  currentVolatility: number;
  predictedVolatility: number;
  predictionHorizon: string;
  volatilityRegime: 'low' | 'normal' | 'elevated' | 'high' | 'extreme';
  regimeTransitionProbability: number;
  drivers: string[];
  confidence: number;
  modelUsed: string;
  backtestAccuracy?: number;
}

export interface CreditRiskIndicator {
  entity: string;
  indicatorType: 'credit_spread' | 'default_probability' | 'rating_change' | 'financial_stress';
  currentValue: number;
  thresholdLevel: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  trend: 'improving' | 'stable' | 'deteriorating';
  timeframe: string;
  contributingFactors: string[];
  confidence: number;
}

export interface MarketCrashSignal {
  signalType: 'valuation' | 'sentiment' | 'technical' | 'macro' | 'flow' | 'volatility';
  description: string;
  currentValue: number;
  historicalThreshold: number;
  severity: number;
  timeframe: string;
  historicalAccuracy: number;
  falsePositiveRate: number;
  contributingFactors: string[];
  confidence: number;
}

export interface RegulatoryRisk {
  regulationType: 'banking' | 'securities' | 'insurance' | 'commodities' | 'crypto' | 'international';
  description: string;
  affectedEntities: string[];
  timeline: string;
  probability: number;
  potentialImpact: {
    complianceCosts: number;
    businessModel: string;
    marketAccess: string;
    competitivePosition: string;
  };
  keyStakeholders: string[];
  monitoringIndicators: string[];
  confidence: number;
}

export interface RiskFactor {
  id: string;
  type: RiskType;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: number;
  timeframe: string;
  affectedAssets: string[];
  mitigationOptions: string[];
  correlatedRisks: string[];
  confidence: number;
  lastUpdated: Date;
}

export interface RiskMitigationStrategy {
  riskId: string;
  strategy: string;
  description: string;
  effectiveness: number; // 0 to 1
  cost: 'low' | 'medium' | 'high';
  timeToImplement: string;
  requirements: string[];
  tradeoffs: string[];
  confidence: number;
}

export interface StressTestResult {
  scenarioName: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'extreme';
  portfolioImpact: {
    totalReturn: number;
    maxDrawdown: number;
    volatility: number;
    sharpeRatio: number;
    worstAsset: string;
    bestAsset: string;
  };
  duration: string;
  recoveryTime: string;
  confidence: number;
}

// ===== ALPHA GENERATION SERVICE INTERFACES =====

export interface AlphaGenerationOptions {
  alphaTypes: AlphaType[];
  dataTypes: AlternativeDataType[];
  strategies: AlphaStrategy[];
  timeHorizons: string[];
  riskLevels: string[];
  enablePredictiveModels: boolean;
  enableArbitrageDetection: boolean;
  enableInefficiencyDetection: boolean;
  confidenceThreshold: number;
  backtestPeriod?: string;
}

export enum AlphaType {
  MOMENTUM = 'MOMENTUM',
  MEAN_REVERSION = 'MEAN_REVERSION',
  CROSS_SECTIONAL = 'CROSS_SECTIONAL',
  TIME_SERIES = 'TIME_SERIES',
  FUNDAMENTAL = 'FUNDAMENTAL',
  TECHNICAL = 'TECHNICAL',
  SENTIMENT = 'SENTIMENT',
  EVENT_DRIVEN = 'EVENT_DRIVEN',
  STATISTICAL_ARBITRAGE = 'STATISTICAL_ARBITRAGE',
  MARKET_NEUTRAL = 'MARKET_NEUTRAL'
}

export enum AlternativeDataType {
  SATELLITE_IMAGERY = 'SATELLITE_IMAGERY',
  SOCIAL_SENTIMENT = 'SOCIAL_SENTIMENT',
  NEWS_FLOW = 'NEWS_FLOW',
  PATENT_FILINGS = 'PATENT_FILINGS',
  INSIDER_TRADING = 'INSIDER_TRADING',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  FOOT_TRAFFIC = 'FOOT_TRAFFIC',
  CREDIT_CARD_DATA = 'CREDIT_CARD_DATA',
  JOB_POSTINGS = 'JOB_POSTINGS',
  APP_USAGE = 'APP_USAGE',
  WEATHER_DATA = 'WEATHER_DATA',
  COMMODITY_FLOWS = 'COMMODITY_FLOWS'
}

export enum AlphaStrategy {
  LONG_SHORT_EQUITY = 'LONG_SHORT_EQUITY',
  PAIRS_TRADING = 'PAIRS_TRADING',
  MERGER_ARBITRAGE = 'MERGER_ARBITRAGE',
  CONVERTIBLE_ARBITRAGE = 'CONVERTIBLE_ARBITRAGE',
  VOLATILITY_ARBITRAGE = 'VOLATILITY_ARBITRAGE',
  FIXED_INCOME_RELATIVE_VALUE = 'FIXED_INCOME_RELATIVE_VALUE',
  EVENT_DRIVEN = 'EVENT_DRIVEN',
  GLOBAL_MACRO = 'GLOBAL_MACRO',
  CTA_TREND_FOLLOWING = 'CTA_TREND_FOLLOWING',
  QUANTITATIVE_EQUITY = 'QUANTITATIVE_EQUITY'
}

export interface AlphaGenerationResult {
  alphaSignals: AlphaSignal[];
  strategicRecommendations: StrategyRecommendation[];
  marketInefficiencies: MarketInefficiency[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  predictiveInsights: PredictiveInsight[];
  alternativeDataInsights: AlternativeDataInsight[];
  performanceMetrics: AlphaPerformanceMetrics;
  riskMetrics: AlphaRiskMetrics;
  confidence: ConfidenceMetrics;
  generatedAt: Date;
  validityPeriod: string;
}

export interface AlphaSignal {
  id: string;
  alphaType: AlphaType;
  symbol: string;
  direction: 'long' | 'short';
  strength: number; // 0 to 1
  expectedReturn: number;
  riskAdjustedReturn: number;
  timeframe: string;
  confidence: number;
  dataSource: AlternativeDataType[];
  methodology: string;
  keyFactors: string[];
  riskFactors: string[];
  backtestResults: BacktestResults;
  correlatedSignals?: string[];
  implementationComplexity: 'low' | 'medium' | 'high';
  capitalRequirements: number;
  liquidityRequirements: string;
}

export interface StrategyRecommendation {
  strategy: AlphaStrategy;
  description: string;
  targetAssets: string[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  implementation: {
    steps: string[];
    timeline: string;
    resources: string[];
    risks: string[];
  };
  marketConditions: string[];
  exitCriteria: string[];
  confidence: number;
}

export interface MarketInefficiency {
  type: 'pricing' | 'information' | 'liquidity' | 'behavioral' | 'regulatory';
  description: string;
  affectedAssets: string[];
  severity: number;
  duration: string;
  exploitability: number;
  competitionLevel: 'low' | 'medium' | 'high';
  barriers: string[];
  opportunities: string[];
  historicalPersistence: number;
  confidence: number;
}

export interface ArbitrageOpportunity {
  type: 'pure' | 'statistical' | 'risk' | 'merger' | 'convertible' | 'volatility';
  description: string;
  instruments: FinancialInstrument[];
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeToExpiration: string;
  capitalRequired: number;
  executionComplexity: 'low' | 'medium' | 'high';
  marketImpact: number;
  liquidityRequirements: string;
  risks: string[];
  confidence: number;
}

export interface PredictiveInsight {
  type: 'price' | 'volatility' | 'correlation' | 'trend' | 'event';
  symbol?: string;
  market?: string;
  prediction: string;
  probability: number;
  timeframe: string;
  expectedMagnitude: number;
  catalysts: string[];
  risks: string[];
  modelType: string;
  dataInputs: string[];
  backtestAccuracy: number;
  confidence: number;
}

export interface AlternativeDataInsight {
  dataType: AlternativeDataType;
  insight: string;
  relevantSymbols: string[];
  signalStrength: number;
  timeliness: string;
  uniqueness: number;
  actionability: 'immediate' | 'short_term' | 'long_term';
  dataSource: string;
  dataQuality: number;
  confidence: number;
}

export interface AlphaPerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  informationRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  correlation: Record<string, number>;
}

export interface AlphaRiskMetrics {
  var95: number; // Value at Risk at 95% confidence
  expectedShortfall: number;
  beta: Record<string, number>;
  trackingError: number;
  downside: number;
  upsideCapture: number;
  downsideCapture: number;
  concentrationRisk: number;
  liquidityRisk: number;
}

export interface BacktestResults {
  startDate: Date;
  endDate: Date;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  avgHoldingPeriod: string;
  turnover: number;
  transactionCosts: number;
  benchmarkOutperformance: number;
  statisticalSignificance: number;
}

// ===== MARKET EVENT DETECTOR INTERFACES =====

export interface MarketEventDetectionOptions {
  eventTypes: MarketEventType[];
  sources: EventSource[];
  realTimeMonitoring: boolean;
  historicalAnalysis: boolean;
  predictiveAnalysis: boolean;
  impactAssessment: boolean;
  confidenceThreshold: number;
  geographicScope: string[];
  timeHorizon: string;
}

export enum MarketEventType {
  // Corporate Events
  EARNINGS_ANNOUNCEMENT = 'EARNINGS_ANNOUNCEMENT',
  MERGER_ACQUISITION = 'MERGER_ACQUISITION',
  STOCK_SPLIT = 'STOCK_SPLIT',
  DIVIDEND_ANNOUNCEMENT = 'DIVIDEND_ANNOUNCEMENT',
  SHARE_BUYBACK = 'SHARE_BUYBACK',
  SPINOFF = 'SPINOFF',
  BANKRUPTCY = 'BANKRUPTCY',
  IPO = 'IPO',
  DELISTING = 'DELISTING',
  
  // Macro Events
  CENTRAL_BANK_MEETING = 'CENTRAL_BANK_MEETING',
  ECONOMIC_DATA_RELEASE = 'ECONOMIC_DATA_RELEASE',
  POLICY_ANNOUNCEMENT = 'POLICY_ANNOUNCEMENT',
  TRADE_WAR_DEVELOPMENT = 'TRADE_WAR_DEVELOPMENT',
  GEOPOLITICAL_EVENT = 'GEOPOLITICAL_EVENT',
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  PANDEMIC = 'PANDEMIC',
  CURRENCY_CRISIS = 'CURRENCY_CRISIS',
  
  // Industry Events
  REGULATORY_CHANGE = 'REGULATORY_CHANGE',
  TECHNOLOGY_BREAKTHROUGH = 'TECHNOLOGY_BREAKTHROUGH',
  SUPPLY_CHAIN_DISRUPTION = 'SUPPLY_CHAIN_DISRUPTION',
  COMMODITY_SHOCK = 'COMMODITY_SHOCK',
  CYBER_ATTACK = 'CYBER_ATTACK',
  PATENT_APPROVAL = 'PATENT_APPROVAL',
  CLINICAL_TRIAL_RESULT = 'CLINICAL_TRIAL_RESULT'
}

export enum EventSource {
  SEC_FILINGS = 'SEC_FILINGS',
  PRESS_RELEASES = 'PRESS_RELEASES',
  NEWS_WIRES = 'NEWS_WIRES',
  CENTRAL_BANK_COMMUNICATIONS = 'CENTRAL_BANK_COMMUNICATIONS',
  GOVERNMENT_ANNOUNCEMENTS = 'GOVERNMENT_ANNOUNCEMENTS',
  EXCHANGE_NOTICES = 'EXCHANGE_NOTICES',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ANALYST_REPORTS = 'ANALYST_REPORTS',
  ECONOMIC_CALENDARS = 'ECONOMIC_CALENDARS',
  PATENT_DATABASES = 'PATENT_DATABASES'
}

export interface MarketEventDetectionResult {
  detectedEvents: DetectedMarketEvent[];
  upcomingEvents: UpcomingMarketEvent[];
  eventClusters: EventCluster[];
  impactAssessments: EventImpactAssessment[];
  correlationAnalysis: EventCorrelationAnalysis[];
  detectionMetrics: {
    eventsDetected: number;
    averageDetectionTime: number;
    confidenceDistribution: Record<string, number>;
    sourceDistribution: Record<string, number>;
  };
  confidence: ConfidenceMetrics;
  detectedAt: Date;
}

export interface DetectedMarketEvent {
  id: string;
  eventType: MarketEventType;
  title: string;
  description: string;
  affectedEntities: string[];
  eventDate: Date;
  detectedAt: Date;
  source: EventSource;
  sourceDocument: string;
  significance: 'low' | 'medium' | 'high' | 'critical';
  marketImpact: EventMarketImpact;
  relatedEvents?: string[];
  tags: string[];
  confidence: number;
  verification: EventVerification;
}

export interface UpcomingMarketEvent {
  eventType: MarketEventType;
  scheduledDate: Date;
  estimatedTime?: string;
  affectedEntities: string[];
  expectedImpact: EventMarketImpact;
  keyMetrics: string[];
  consensus?: Record<string, number>;
  historicalPatterns: HistoricalEventPattern[];
  tradingStrategies: EventTradingStrategy[];
  confidence: number;
}

export interface EventCluster {
  id: string;
  theme: string;
  events: string[];
  timeframe: {
    start: Date;
    end: Date;
  };
  significance: number;
  cumulativeImpact: EventMarketImpact;
  narrative: string;
  keyDrivers: string[];
}

export interface EventImpactAssessment {
  eventId: string;
  immediateImpact: {
    priceReaction: number;
    volumeChange: number;
    volatilityIncrease: number;
    sectorSpillover: Record<string, number>;
  };
  shortTermImpact: {
    priceTarget: number;
    timeframe: string;
    probability: number;
    keyFactors: string[];
  };
  longTermImpact: {
    fundamentalChange: string;
    valutionImpact: number;
    competitivePosition: string;
    industryImplications: string[];
  };
  confidence: number;
}

export interface EventCorrelationAnalysis {
  eventPair: [string, string];
  correlationType: 'causal' | 'temporal' | 'thematic' | 'coincidental';
  strength: number;
  lagTime?: number;
  frequency: number;
  confidence: number;
  examples: string[];
}

export interface EventMarketImpact {
  primaryAssets: AssetImpact[];
  secondaryAssets?: AssetImpact[];
  sectorImpact: SectorImpact[];
  marketIndices: IndexImpact[];
  crossAssetEffects: CrossAssetEffect[];
  volatilityImpact: VolatilityImpact;
  liquidityImpact: LiquidityImpact;
}

export interface AssetImpact {
  symbol: string;
  expectedReturn: number;
  volatilityChange: number;
  volumeChange: number;
  timeframe: string;
  confidence: number;
}

export interface SectorImpact {
  sector: string;
  impact: number;
  timeframe: string;
  affectedCompanies: string[];
  reasoning: string[];
}

export interface IndexImpact {
  index: string;
  expectedMove: number;
  contribution: Record<string, number>;
  timeframe: string;
}

export interface CrossAssetEffect {
  fromAsset: string;
  toAsset: string;
  effect: number;
  mechanism: string;
  timeframe: string;
}

export interface VolatilityImpact {
  impliedVolatilityChange: number;
  realizedVolatilityChange: number;
  duration: string;
  affectedInstruments: string[];
}

export interface LiquidityImpact {
  bidAskSpreadChange: number;
  marketDepthChange: number;
  tradingVolumeChange: number;
  affectedMarkets: string[];
}

export interface EventVerification {
  verified: boolean;
  verificationMethod: string;
  sources: number;
  crossReferences: string[];
  reliability: number;
}

export interface HistoricalEventPattern {
  pattern: string;
  frequency: string;
  averageImpact: number;
  duration: string;
  examples: string[];
  accuracy: number;
}

export interface EventTradingStrategy {
  strategy: string;
  timeframe: string;
  instruments: string[];
  expectedReturn: number;
  riskLevel: string;
  implementation: string[];
  risks: string[];
}

// ===== SHARED UTILITY INTERFACES =====

export interface AnalystReputationMetrics {
  trackRecord: number; // 0 to 1
  accuracy: number;
  timeliness: number;
  coverage: string[];
  experience: number;
  firmReputation: number;
}

export interface PriceTargetRevision {
  previousTarget: number;
  newTarget: number;
  revisionDate: Date;
  reasoning: string;
}

export interface ProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  message?: string;
  startTime: Date;
  endTime?: Date;
  errors?: string[];
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  relevance: number;
  overallScore: number;
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  backtestPeriod: string;
  lastUpdated: Date;
}

// ===== SERVICE RESPONSE INTERFACES =====

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    processingTime: number;
    timestamp: Date;
    version: string;
  };
}

export interface BatchProcessingResult<T> {
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  results: T[];
  errors: Array<{
    item: any;
    error: string;
  }>;
  processingTime: number;
  status: ProcessingStatus;
}