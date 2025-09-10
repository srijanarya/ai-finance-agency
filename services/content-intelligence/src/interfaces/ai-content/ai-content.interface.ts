export interface ContentGenerationRequest {
  prompt: string;
  contentType: ContentType;
  style: ContentStyle;
  tone: ContentTone;
  targetAudience: TargetAudience;
  maxLength?: number;
  minLength?: number;
  includeSources?: boolean;
  marketData?: MarketDataContext;
  templateId?: string;
  personalizations?: ContentPersonalization[];
}

export interface ContentGenerationResponse {
  id: string;
  content: string;
  title?: string;
  summary?: string;
  metadata: ContentMetadata;
  suggestions?: string[];
  performance?: ContentPerformanceMetrics;
  generatedAt: Date;
  provider: AIProvider;
}

export interface ContentMetadata {
  wordCount: number;
  readingTime: number; // in minutes
  contentType: ContentType;
  style: ContentStyle;
  tone: ContentTone;
  targetAudience: TargetAudience;
  confidence: number; // 0-1
  relevanceScore: number; // 0-1
  seoScore?: number; // 0-100
  complianceFlags?: string[];
  sources?: string[];
  keywords?: string[];
  entities?: NamedEntity[];
}

export interface MarketDataContext {
  symbols?: string[];
  marketEvents?: string[];
  timeframe?: string;
  currentPrices?: { [symbol: string]: number };
  marketTrends?: MarketTrend[];
}

export interface MarketTrend {
  symbol: string;
  direction: 'up' | 'down' | 'neutral';
  magnitude: number; // percentage change
  timeframe: string;
  confidence: number;
}

export interface ContentPersonalization {
  userId?: string;
  preferences?: UserPreferences;
  historicalEngagement?: EngagementData;
  riskProfile?: RiskProfile;
  investmentGoals?: InvestmentGoal[];
}

export interface UserPreferences {
  preferredContentTypes: ContentType[];
  preferredStyles: ContentStyle[];
  preferredTones: ContentTone[];
  excludedTopics?: string[];
  languagePreference: string;
  complexityLevel: ComplexityLevel;
}

export interface EngagementData {
  averageReadTime: number;
  preferredContentLength: number;
  mostEngagedTopics: string[];
  clickThroughRates: { [contentType: string]: number };
  shareRates: { [contentType: string]: number };
}

export interface NamedEntity {
  text: string;
  type: EntityType;
  confidence: number;
  startPos: number;
  endPos: number;
}

export interface ContentPerformanceMetrics {
  readabilityScore: number; // 0-100
  seoScore: number; // 0-100
  complianceScore: number; // 0-100
  engagementPrediction: number; // 0-100
  viralityScore?: number; // 0-100
  conversionPotential?: number; // 0-100
}

export interface AIProvider {
  name: string;
  version: string;
  model: string;
  maxTokens: number;
  temperature: number;
  responseTime: number;
  cost?: number;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  style: ContentStyle;
  structure: TemplateSection[];
  variables: TemplateVariable[];
  constraints: TemplateConstraints;
  examples?: string[];
}

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  order: number;
  minLength?: number;
  maxLength?: number;
  style?: ContentStyle;
  tone?: ContentTone;
}

export interface TemplateVariable {
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: string; // regex pattern
}

export interface TemplateConstraints {
  maxLength: number;
  minLength: number;
  requiredSections: string[];
  forbiddenPhrases?: string[];
  requiredKeywords?: string[];
  complianceRules?: string[];
}

export enum ContentType {
  ARTICLE = 'article',
  BLOG_POST = 'blog_post',
  NEWSLETTER = 'newsletter',
  SOCIAL_MEDIA = 'social_media',
  MARKET_ANALYSIS = 'market_analysis',
  RESEARCH_REPORT = 'research_report',
  PRESS_RELEASE = 'press_release',
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  EDUCATIONAL = 'educational',
  ALERT = 'alert',
  SUMMARY = 'summary'
}

export enum ContentStyle {
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  EDUCATIONAL = 'educational',
  URGENT = 'urgent',
  ANALYTICAL = 'analytical',
  NARRATIVE = 'narrative',
  TECHNICAL = 'technical',
  CONVERSATIONAL = 'conversational',
  FORMAL = 'formal',
  CREATIVE = 'creative'
}

export enum ContentTone {
  NEUTRAL = 'neutral',
  OPTIMISTIC = 'optimistic',
  CAUTIOUS = 'cautious',
  CONFIDENT = 'confident',
  URGENT = 'urgent',
  FRIENDLY = 'friendly',
  AUTHORITATIVE = 'authoritative',
  EMPATHETIC = 'empathetic',
  ANALYTICAL = 'analytical',
  MOTIVATIONAL = 'motivational'
}

export enum TargetAudience {
  RETAIL_INVESTORS = 'retail_investors',
  INSTITUTIONAL_INVESTORS = 'institutional_investors',
  DAY_TRADERS = 'day_traders',
  LONG_TERM_INVESTORS = 'long_term_investors',
  FINANCIAL_ADVISORS = 'financial_advisors',
  BEGINNERS = 'beginners',
  ADVANCED = 'advanced',
  GENERAL_PUBLIC = 'general_public',
  INDUSTRY_PROFESSIONALS = 'industry_professionals',
  MEDIA = 'media'
}

export enum ComplexityLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum RiskProfile {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  VERY_AGGRESSIVE = 'very_aggressive'
}

export enum InvestmentGoal {
  GROWTH = 'growth',
  INCOME = 'income',
  PRESERVATION = 'preservation',
  SPECULATION = 'speculation',
  RETIREMENT = 'retirement',
  EDUCATION = 'education',
  EMERGENCY_FUND = 'emergency_fund'
}

export enum EntityType {
  COMPANY = 'company',
  PERSON = 'person',
  LOCATION = 'location',
  ORGANIZATION = 'organization',
  FINANCIAL_INSTRUMENT = 'financial_instrument',
  CURRENCY = 'currency',
  DATE = 'date',
  MONEY = 'money',
  PERCENTAGE = 'percentage'
}

export enum VariableType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  MARKET_DATA = 'market_data',
  USER_DATA = 'user_data'
}

export interface AIContentProvider {
  generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse>;
  validateContent(content: string): Promise<ValidationResult>;
  suggestImprovements(content: string): Promise<string[]>;
  estimatePerformance(content: string, context: ContentContext): Promise<ContentPerformanceMetrics>;
  getProviderInfo(): AIProvider;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  score: number; // 0-100
}

export interface ValidationError {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    line: number;
    column: number;
    length: number;
  };
  suggestion?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  suggestion?: string;
  location?: {
    line: number;
    column: number;
    length: number;
  };
}

export interface ContentContext {
  targetAudience: TargetAudience;
  platform?: string;
  marketConditions?: string;
  timeConstraints?: {
    publishDeadline?: Date;
    campaignDuration?: number;
  };
  brandGuidelines?: BrandGuidelines;
}

export interface BrandGuidelines {
  voice: string;
  tone: ContentTone[];
  forbiddenWords: string[];
  requiredDisclosures: string[];
  brandKeywords: string[];
  colorScheme?: string[];
  logoUsage?: string;
}