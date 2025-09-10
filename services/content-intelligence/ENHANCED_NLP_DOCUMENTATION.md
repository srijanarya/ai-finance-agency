# Enhanced Content Intelligence NLP Pipeline

## Overview

The Content Intelligence service has been enhanced with a comprehensive Natural Language Processing pipeline that provides advanced content analysis, market insight extraction, trend detection, content scoring, and intelligent caching. This documentation covers all the enhanced features and their usage.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                Content Intelligence Architecture                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐ │
│  │  NLP Controller │────│     Orchestrator Service            │ │
│  └─────────────────┘    └──────────────────────────────────────┘ │
│           │                               │                     │
│  ┌─────────────────┐    ┌─────────────────┴─────────────────┐   │
│  │  WebSocket      │    │          Core Services            │   │
│  │  Gateway        │    │                                   │   │
│  └─────────────────┘    │  ┌─────────────────────────────┐  │   │
│           │              │  │  NLP Processing Service   │  │   │
│           │              │  └─────────────────────────────┘  │   │
│  ┌─────────────────┐    │  ┌─────────────────────────────┐  │   │
│  │  Performance    │    │  │  Market Insight Service    │  │   │
│  │  Monitor        │    │  └─────────────────────────────┘  │   │
│  └─────────────────┘    │  ┌─────────────────────────────┐  │   │
│           │              │  │  Trend Detection Service   │  │   │
│           │              │  └─────────────────────────────┘  │   │
│  ┌─────────────────┐    │  ┌─────────────────────────────┐  │   │
│  │  Content Cache  │────│  │  Content Scoring Service    │  │   │
│  │  Service        │    │  └─────────────────────────────┘  │   │
│  └─────────────────┘    └───────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Services

### 1. NLP Processing Service

Comprehensive natural language processing with multiple analysis capabilities.

**Key Features:**
- Sentiment analysis with multiple engines
- Entity extraction with financial domain specialization
- Key phrase extraction and categorization
- Language detection and text summarization
- Topic modeling and content analysis
- AI-powered advanced analysis (OpenAI/Claude integration)

**Usage Example:**

```typescript
import { NlpProcessingService } from './services/nlp-processing.service';

// Basic usage
const nlpResult = await nlpProcessingService.processText(content, {
  enableSentimentAnalysis: true,
  enableEntityExtraction: true,
  enableKeyPhraseExtraction: true,
  confidenceThreshold: 0.6
});

console.log('Sentiment:', nlpResult.sentiment);
console.log('Entities:', nlpResult.entities);
console.log('Key Phrases:', nlpResult.keyPhrases);
```

**Advanced Options:**

```typescript
// Advanced processing with AI integration
const advancedResult = await nlpProcessingService.processText(content, {
  enableSentimentAnalysis: true,
  enableEntityExtraction: true,
  enableKeyPhraseExtraction: true,
  enableTextSummarization: true,
  enableTopicModeling: true,
  useAdvancedNLP: true, // Enable OpenAI/Claude analysis
  entityTypes: [EntityType.STOCK_SYMBOL, EntityType.COMPANY],
  maxKeyPhrases: 15,
  summaryLength: 200
});
```

### 2. Market Insight Extraction Service

Specialized service for extracting actionable financial insights from content.

**Key Features:**
- Trading signal detection
- Price target extraction
- Analyst recommendation parsing
- Financial metric identification
- Risk factor analysis
- Market opportunity detection

**Usage Example:**

```typescript
import { MarketInsightService } from './services/market-insight.service';

// Extract comprehensive market insights
const insights = await marketInsightService.extractInsights(content, {
  useAIAnalysis: true,
  confidenceThreshold: 0.7,
  focusSymbols: ['AAPL', 'TSLA', 'MSFT']
});

console.log('Trading Signals:', insights.tradingSignals);
console.log('Price Targets:', insights.priceTargets);
console.log('Risk Factors:', insights.riskFactors);
console.log('Opportunities:', insights.opportunities);
```

### 3. Trend Detection Service

Real-time trend detection and analysis system.

**Key Features:**
- Market momentum analysis
- Social sentiment trending
- News velocity tracking
- Pattern recognition
- Real-time anomaly detection
- Multi-timeframe analysis

**Usage Example:**

```typescript
import { TrendDetectionService } from './services/trend-detection.service';

// Detect trends for specific symbol
const trends = await trendDetectionService.detectTrends('AAPL', 'real-time');

console.log('Detected Trends:', trends.trends);
console.log('Momentum Analysis:', trends.momentum);
console.log('Social Sentiment:', trends.socialSentiment);
console.log('Alert Level:', trends.alertLevel);

// Process content for trend analysis
await trendDetectionService.processContentForTrends(
  content, 
  'reuters.com', 
  { category: 'earnings', symbols: ['AAPL'] }
);
```

### 4. Content Scoring Service

Comprehensive content quality and relevance scoring system.

**Key Features:**
- Multi-dimensional scoring (relevance, credibility, timeliness, impact, quality)
- Source credibility assessment
- Target audience optimization
- Content type-specific scoring
- Improvement recommendations

**Usage Example:**

```typescript
import { ContentScoringService } from './services/content-scoring.service';

// Score content with specific criteria
const score = await contentScoringService.scoreContent(
  content, 
  'https://bloomberg.com/article', 
  {
    targetAudience: 'institutional',
    contentType: 'analysis',
    urgency: 'high',
    marketFocus: ['technology', 'earnings'],
    useAIScoring: true
  }
);

console.log('Overall Score:', score.overallScore);
console.log('Recommendation:', score.recommendation);
console.log('Score Breakdown:', score.breakdown);
console.log('Improvement Suggestions:', score.improvementSuggestions);
```

### 5. Content Cache Service

High-performance Redis-based caching layer with intelligent invalidation.

**Key Features:**
- Multi-level caching with different TTL strategies
- Intelligent cache invalidation
- Pre-computation of expensive operations
- Cache warming strategies
- Performance analytics
- Tag-based invalidation

**Usage Example:**

```typescript
import { ContentCacheService } from './services/content-cache.service';

// Cache with custom strategy
await contentCacheService.set('key', data, {
  ttl: 3600,
  tags: ['nlp', 'sentiment', 'symbol:AAPL'],
  precompute: true
});

// Get or compute pattern
const result = await contentCacheService.getOrSet(
  'expensive-computation',
  async () => {
    // Expensive computation here
    return await performExpensiveAnalysis();
  },
  { ttl: 7200, tags: ['analysis'] }
);

// Invalidate by tags
await contentCacheService.invalidateByTags(['symbol:AAPL']);
```

### 6. Content Intelligence Orchestrator Service

High-level orchestration service for complex workflows.

**Key Features:**
- Intelligent workflow orchestration
- Batch processing optimization
- Quality gate enforcement
- Priority-based processing queues
- Resource-aware processing
- Workflow analytics

**Usage Example:**

```typescript
import { ContentIntelligenceOrchestratorService } from './services/content-intelligence-orchestrator.service';

// Orchestrate comprehensive processing
const result = await orchestratorService.orchestrateContentProcessing(
  [
    {
      id: 'content-1',
      content: 'Market analysis content...',
      source: 'bloomberg.com',
      priority: 'high'
    },
    {
      id: 'content-2',
      content: 'Earnings report...',
      source: 'reuters.com',
      priority: 'critical'
    }
  ],
  {
    includeNLP: true,
    includeInsights: true,
    includeScoring: true,
    includeTrends: true,
    enforceQualityGate: true
  }
);

console.log('Processing Summary:', result.summary);
console.log('Results:', result.results);
```

**Intelligent Workflow Analysis:**

```typescript
// Get processing recommendations
const workflow = await orchestratorService.intelligentWorkflow(
  content, 
  source, 
  { urgency: 'high', category: 'earnings' }
);

console.log('Recommendation:', workflow.recommendation);
console.log('Processing Plan:', workflow.processingPlan);
console.log('Estimated Time:', workflow.estimatedTime);
```

**Queue-based Processing:**

```typescript
// Queue content for background processing
await orchestratorService.queueContentForProcessing(
  items,
  { priority: 'medium', batchSize: 10 }
);

// Get workflow analytics
const analytics = await orchestratorService.getWorkflowAnalytics();
console.log('Queue Status:', analytics.queueStatus);
console.log('Performance Metrics:', analytics.metrics);
```

### 7. Performance Monitor Service

Comprehensive performance monitoring and optimization service.

**Key Features:**
- Real-time performance metrics collection
- Bottleneck detection and analysis
- Resource utilization monitoring
- Performance trend analysis
- Optimization recommendations
- Automated performance alerts

**Usage Example:**

```typescript
import { PerformanceMonitorService } from './services/performance-monitor.service';

// Get system health overview
const health = await performanceMonitorService.getSystemHealth();
console.log('Overall Health:', health.overall);
console.log('Bottlenecks:', health.bottlenecks);
console.log('Recommendations:', health.recommendations);

// Get detailed service analytics
const analytics = await performanceMonitorService.getServiceAnalytics(
  'nlp',
  { start: new Date(Date.now() - 24*60*60*1000), end: new Date() }
);

console.log('Service Metrics:', analytics.metrics);
console.log('Time Series:', analytics.timeSeries);
console.log('Performance Distribution:', analytics.distribution);
```

## Real-time WebSocket Gateway

The Content Stream Gateway provides real-time streaming of processing results.

**Key Features:**
- Real-time content processing notifications
- Market insight streaming
- Trend detection alerts
- Content scoring updates
- Subscription management with filtering
- Rate limiting and backpressure handling

**Usage Example:**

```javascript
// Client-side WebSocket connection
const socket = io('http://localhost:3000/content-stream', {
  auth: { token: 'your-jwt-token' }
});

// Subscribe to specific content types
socket.emit('subscribe', {
  types: ['content_processed', 'market_insights', 'trend_alerts'],
  filters: {
    symbols: ['AAPL', 'TSLA'],
    minScore: 70,
    minConfidence: 0.8
  }
});

// Listen for real-time updates
socket.on('stream_update', (data) => {
  console.log('Real-time update:', data);
});
```

## REST API Usage

### Process Content

```bash
curl -X POST "http://localhost:3000/nlp/process" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Apple Inc. reported strong Q3 earnings with revenue of $81.4 billion, beating analyst expectations.",
    "source": "bloomberg.com",
    "enableSentimentAnalysis": true,
    "enableEntityExtraction": true,
    "enableKeyPhraseExtraction": true,
    "useAdvancedNLP": true
  }'
```

### Extract Market Insights

```bash
curl -X POST "http://localhost:3000/nlp/insights" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Goldman Sachs upgrades AAPL to Buy with a price target of $200",
    "confidenceThreshold": 0.7,
    "focusSymbols": ["AAPL"],
    "useAIAnalysis": true
  }'
```

### Get Trends

```bash
curl "http://localhost:3000/nlp/trends?symbol=AAPL&timeframe=real-time"
```

### Score Content

```bash
curl -X POST "http://localhost:3000/nlp/score" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Market analysis content...",
    "source": "https://reuters.com/article",
    "targetAudience": "institutional",
    "contentType": "analysis",
    "urgency": "high"
  }'
```

### Batch Processing

```bash
curl -X POST "http://localhost:3000/nlp/process-batch" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "content": "First article content...",
        "source": "bloomberg.com"
      },
      {
        "content": "Second article content...",
        "source": "reuters.com"
      }
    ]
  }'
```

## Performance Optimization

### Caching Strategy

The system implements intelligent caching at multiple levels:

1. **Aggressive Caching**: Cache everything for maximum performance
2. **Balanced Caching**: Cache based on priority and usage patterns
3. **Minimal Caching**: Cache only low-priority, frequently accessed content

```typescript
// Configure caching strategy
const config = {
  WORKFLOW_CACHE_STRATEGY: 'balanced', // aggressive | balanced | minimal
  CACHE_DEFAULT_TTL: 3600,
  CACHE_MAX_MEMORY_MB: 512
};
```

### Concurrency Control

```typescript
// Configure processing concurrency
const config = {
  WORKFLOW_PARALLEL_PROCESSING: true,
  WORKFLOW_MAX_CONCURRENCY: 10,
  WORKFLOW_TIMEOUT_MS: 30000
};
```

### Performance Monitoring

```typescript
// Enable comprehensive monitoring
const config = {
  CACHE_ANALYTICS: true,
  WORKFLOW_QUALITY_THRESHOLD: 70,
  PERFORMANCE_ALERTS: true
};
```

## Error Handling and Resilience

### Circuit Breaker Pattern

The system implements circuit breakers for external API calls:

```typescript
// Automatic fallback to traditional NLP if AI services fail
const result = await nlpService.processText(content, {
  useAdvancedNLP: true, // Will fallback to traditional methods if AI fails
  confidenceThreshold: 0.6
});
```

### Retry Mechanisms

```typescript
// Configurable retry strategies
const config = {
  WORKFLOW_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000,
  CACHE_RETRY_ATTEMPTS: 2
};
```

### Graceful Degradation

The system gracefully degrades functionality when services are unavailable:

- NLP processing falls back to traditional methods if AI services fail
- Cache misses don't block processing
- Trend detection continues with available data sources
- Content scoring provides baseline scores if detailed analysis fails

## Monitoring and Alerts

### Performance Alerts

Configure alert thresholds:

```typescript
const alertThresholds = [
  { metric: 'response_time', service: 'nlp', warning: 2000, critical: 5000, unit: 'ms' },
  { metric: 'error_rate', warning: 0.05, critical: 0.1, unit: '%' },
  { metric: 'memory_usage', warning: 0.8, critical: 0.9, unit: '%' },
  { metric: 'cache_hit_rate', warning: 0.7, critical: 0.5, unit: '%' }
];
```

### Health Monitoring

```bash
# Get system health
curl "http://localhost:3000/nlp/cache/stats"

# Get gateway statistics
curl "http://localhost:3000/nlp/gateway/stats"
```

## Deployment Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# AI Service Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Cache Configuration
CACHE_DEFAULT_TTL=3600
CACHE_MAX_MEMORY_MB=512
CACHE_COMPRESSION=true
CACHE_ANALYTICS=true

# Workflow Configuration
WORKFLOW_PARALLEL_PROCESSING=true
WORKFLOW_MAX_CONCURRENCY=10
WORKFLOW_TIMEOUT_MS=30000
WORKFLOW_RETRY_ATTEMPTS=3
WORKFLOW_QUALITY_THRESHOLD=70
WORKFLOW_CACHE_STRATEGY=balanced

# Performance Monitoring
PERFORMANCE_ALERTS=true
ALERT_WEBHOOK_URL=your_webhook_url
```

### Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  content-intelligence:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - NODE_ENV=production
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
volumes:
  redis_data:
```

## Testing

### Unit Tests

```typescript
// Example test
describe('NlpProcessingService', () => {
  it('should process content with sentiment analysis', async () => {
    const result = await service.processText('Great earnings report!', {
      enableSentimentAnalysis: true
    });
    
    expect(result.sentiment.label).toBe('positive');
    expect(result.sentiment.score).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run specific test suite
npm run test -- --testPathPattern=nlp.e2e-spec.ts
```

### Performance Tests

```bash
# Load testing with artillery
artillery run performance-tests/load-test.yml
```

## Best Practices

### 1. Content Processing

- Use batch processing for multiple items
- Enable caching for repeated content
- Set appropriate confidence thresholds
- Use priority queues for time-sensitive content

### 2. Performance Optimization

- Monitor cache hit rates and adjust TTL values
- Use appropriate concurrency limits based on resources
- Enable compression for large cached objects
- Implement proper error handling and fallbacks

### 3. Monitoring and Maintenance

- Set up comprehensive alerting
- Monitor performance trends
- Regular cache cleanup and optimization
- Performance testing and capacity planning

### 4. Security Considerations

- Validate all input content
- Implement proper authentication for WebSocket connections
- Rate limiting to prevent abuse
- Secure storage of API keys and sensitive configuration

## Troubleshooting

### Common Issues

1. **High Response Times**
   - Check cache hit rates
   - Monitor resource utilization
   - Review concurrency settings
   - Check for bottlenecks in external API calls

2. **Memory Issues**
   - Monitor cache size and eviction rates
   - Check for memory leaks in processing
   - Optimize batch sizes
   - Review garbage collection settings

3. **Cache Issues**
   - Verify Redis connectivity
   - Check TTL values and invalidation strategies
   - Monitor cache fragmentation
   - Review cache key patterns

4. **WebSocket Issues**
   - Check connection limits
   - Verify authentication tokens
   - Monitor subscription patterns
   - Review rate limiting settings

### Performance Tuning

1. **Cache Optimization**
   ```typescript
   // Adjust cache strategies based on usage patterns
   const cacheConfig = {
     nlp: { ttl: 3600, warmup: false },
     insights: { ttl: 1800, warmup: true },
     trends: { ttl: 300, warmup: true }
   };
   ```

2. **Concurrency Tuning**
   ```typescript
   // Optimize based on CPU cores and memory
   const concurrency = Math.min(os.cpus().length * 2, 16);
   ```

3. **Batch Processing**
   ```typescript
   // Optimize batch sizes based on content characteristics
   const batchSize = content.length > 2000 ? 3 : 5;
   ```

## Support and Maintenance

### Monitoring Dashboard

Access comprehensive monitoring through:
- Performance metrics: `/nlp/cache/stats`
- Gateway statistics: `/nlp/gateway/stats`
- System health: Custom health endpoint

### Log Analysis

Key log patterns to monitor:
- Processing times above thresholds
- Cache miss patterns
- Error rates by service
- WebSocket connection patterns

### Maintenance Tasks

Regular maintenance includes:
- Cache cleanup and optimization
- Performance baseline updates
- Configuration tuning based on usage patterns
- Capacity planning and scaling decisions

This enhanced NLP pipeline provides a comprehensive, production-ready solution for content intelligence with advanced features for performance, scalability, and maintainability.