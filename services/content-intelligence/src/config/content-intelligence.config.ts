import { registerAs } from '@nestjs/config';

export default registerAs('contentIntelligence', () => ({
  // Market Data Configuration
  marketData: {
    providers: {
      primary: process.env.MARKET_DATA_PRIMARY_PROVIDER || 'mock',
      fallback: process.env.MARKET_DATA_FALLBACK_PROVIDERS?.split(',') || ['mock'],
    },
    alphaVantage: {
      apiKey: process.env.ALPHA_VANTAGE_API_KEY || 'demo',
      baseUrl: process.env.ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co/query',
      rateLimit: parseInt(process.env.ALPHA_VANTAGE_RATE_LIMIT || '5'),
    },
    yahooFinance: {
      baseUrl: process.env.YAHOO_FINANCE_BASE_URL || 'https://query1.finance.yahoo.com/v8/finance',
      rateLimit: parseInt(process.env.YAHOO_FINANCE_RATE_LIMIT || '1000'),
    },
    cache: {
      ttl: parseInt(process.env.MARKET_DATA_CACHE_TTL || '300'), // 5 minutes
      maxSize: parseInt(process.env.MARKET_DATA_CACHE_MAX_SIZE || '1000'),
    },
    marketHours: {
      timezone: process.env.MARKET_TIMEZONE || 'America/New_York',
      regular: {
        start: process.env.MARKET_OPEN_TIME || '09:30',
        end: process.env.MARKET_CLOSE_TIME || '16:00',
      },
    },
  },

  // AI Content Generation Configuration
  aiContent: {
    providers: {
      primary: process.env.AI_PRIMARY_PROVIDER || 'openai',
      fallback: process.env.AI_FALLBACK_PROVIDERS?.split(',') || ['anthropic'],
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
    },
    generation: {
      timeoutMs: parseInt(process.env.AI_GENERATION_TIMEOUT || '30000'),
      maxConcurrency: parseInt(process.env.AI_MAX_CONCURRENCY || '3'),
      retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '2'),
    },
  },

  // Quality Scoring Configuration
  qualityScoring: {
    thresholds: {
      minimumPassingScore: parseFloat(process.env.QUALITY_MIN_PASSING_SCORE || '8.0'),
      excellenceThreshold: parseFloat(process.env.QUALITY_EXCELLENCE_THRESHOLD || '9.0'),
      criticalIssueThreshold: process.env.QUALITY_CRITICAL_THRESHOLD || 'critical',
    },
    weights: {
      readability: parseFloat(process.env.QUALITY_WEIGHT_READABILITY || '0.2'),
      accuracy: parseFloat(process.env.QUALITY_WEIGHT_ACCURACY || '0.25'),
      compliance: parseFloat(process.env.QUALITY_WEIGHT_COMPLIANCE || '0.25'),
      engagement: parseFloat(process.env.QUALITY_WEIGHT_ENGAGEMENT || '0.15'),
      technical: parseFloat(process.env.QUALITY_WEIGHT_TECHNICAL || '0.1'),
      financial: parseFloat(process.env.QUALITY_WEIGHT_FINANCIAL || '0.05'),
    },
    agents: {
      enabled: process.env.QUALITY_ENABLED_AGENTS?.split(',') || [
        'readability',
        'financial_accuracy',
        'compliance',
        'engagement',
        'technical_writing',
      ],
      timeoutMs: parseInt(process.env.QUALITY_AGENT_TIMEOUT || '10000'),
    },
  },

  // Compliance Configuration
  compliance: {
    rules: {
      secRegulations: process.env.COMPLIANCE_SEC_ENABLED !== 'false',
      finraRules: process.env.COMPLIANCE_FINRA_ENABLED !== 'false',
      gdprPrivacy: process.env.COMPLIANCE_GDPR_ENABLED !== 'false',
      ccpaPrivacy: process.env.COMPLIANCE_CCPA_ENABLED !== 'false',
    },
    validation: {
      strictMode: process.env.COMPLIANCE_STRICT_MODE === 'true',
      autoRemediation: process.env.COMPLIANCE_AUTO_REMEDIATION === 'true',
      auditTrail: process.env.COMPLIANCE_AUDIT_TRAIL !== 'false',
    },
    thresholds: {
      minimumScore: parseInt(process.env.COMPLIANCE_MIN_SCORE || '80'),
      criticalViolationFail: process.env.COMPLIANCE_CRITICAL_FAIL !== 'false',
    },
  },

  // Sentiment Analysis Configuration
  sentimentAnalysis: {
    sources: {
      defaultSources: process.env.SENTIMENT_DEFAULT_SOURCES?.split(',') || [
        'reuters',
        'bloomberg',
        'financial_times',
        'wall_street_journal',
      ],
      aggregationInterval: parseInt(process.env.SENTIMENT_AGGREGATION_INTERVAL || '300'), // 5 minutes
      maxSourcesPerAnalysis: parseInt(process.env.SENTIMENT_MAX_SOURCES || '10'),
    },
    analysis: {
      confidenceThreshold: parseFloat(process.env.SENTIMENT_CONFIDENCE_THRESHOLD || '0.7'),
      trendingTopicMinFrequency: parseInt(process.env.SENTIMENT_TRENDING_MIN_FREQ || '2'),
      maxTrendingTopics: parseInt(process.env.SENTIMENT_MAX_TRENDING || '10'),
    },
    processing: {
      timeoutMs: parseInt(process.env.SENTIMENT_PROCESSING_TIMEOUT || '60000'),
      batchSize: parseInt(process.env.SENTIMENT_BATCH_SIZE || '50'),
    },
  },

  // Personalization Configuration
  personalization: {
    profile: {
      updateThreshold: parseFloat(process.env.PERSONALIZATION_UPDATE_THRESHOLD || '0.1'),
      maxHistoryLength: parseInt(process.env.PERSONALIZATION_MAX_HISTORY || '1000'),
      confidenceDecay: parseFloat(process.env.PERSONALIZATION_CONFIDENCE_DECAY || '0.95'),
    },
    recommendations: {
      maxRecommendations: parseInt(process.env.PERSONALIZATION_MAX_RECOMMENDATIONS || '10'),
      minRelevanceScore: parseFloat(process.env.PERSONALIZATION_MIN_RELEVANCE || '0.3'),
      diversityFactor: parseFloat(process.env.PERSONALIZATION_DIVERSITY || '0.2'),
    },
    segmentation: {
      enableBehavioralSegmentation: process.env.PERSONALIZATION_BEHAVIORAL_SEGMENTATION !== 'false',
      enableRiskBasedSegmentation: process.env.PERSONALIZATION_RISK_SEGMENTATION !== 'false',
      enableGoalBasedSegmentation: process.env.PERSONALIZATION_GOAL_SEGMENTATION !== 'false',
    },
  },

  // General Service Configuration
  service: {
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000'), // 1 minute
      limit: parseInt(process.env.RATE_LIMIT_REQUESTS || '100'),
    },
    monitoring: {
      enableMetrics: process.env.MONITORING_ENABLED !== 'false',
      enableTracing: process.env.TRACING_ENABLED !== 'false',
      metricsInterval: parseInt(process.env.METRICS_INTERVAL || '30000'), // 30 seconds
    },
    features: {
      enableMarketData: process.env.FEATURE_MARKET_DATA !== 'false',
      enableAIContent: process.env.FEATURE_AI_CONTENT !== 'false',
      enableQualityScoring: process.env.FEATURE_QUALITY_SCORING !== 'false',
      enableCompliance: process.env.FEATURE_COMPLIANCE !== 'false',
      enableSentimentAnalysis: process.env.FEATURE_SENTIMENT_ANALYSIS !== 'false',
      enablePersonalization: process.env.FEATURE_PERSONALIZATION !== 'false',
    },
    performance: {
      maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '50'),
      requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT || '120000'), // 2 minutes
      cacheEnabled: process.env.CACHE_ENABLED !== 'false',
      cacheTtl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
    },
  },

  // Integration Configuration
  integrations: {
    external: {
      webhookEnabled: process.env.WEBHOOK_ENABLED === 'true',
      webhookEndpoint: process.env.WEBHOOK_ENDPOINT,
      webhookSecret: process.env.WEBHOOK_SECRET,
    },
    notifications: {
      enabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
      channels: process.env.NOTIFICATION_CHANNELS?.split(',') || ['email'],
      alertThresholds: {
        qualityScore: parseFloat(process.env.ALERT_QUALITY_THRESHOLD || '6.0'),
        complianceScore: parseInt(process.env.ALERT_COMPLIANCE_THRESHOLD || '70'),
        errorRate: parseFloat(process.env.ALERT_ERROR_RATE || '0.05'),
      },
    },
  },
}));