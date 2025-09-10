# Story 004.1: Trading Signals Generation & Distribution Engine

---

## **Story ID**: TREUM-004.1
**Epic**: 004 - AI Trading Signals & Market Intelligence  
**Sprint**: 4  
**Priority**: P0 - CRITICAL  
**Points**: 34  
**Type**: Feature  
**Component**: Signals Service + AI Engine  

---

## User Story
**AS A** premium subscriber of the TREUM platform  
**I WANT** to receive AI-generated trading signals with real-time market analysis  
**SO THAT** I can make informed trading decisions and maximize my investment returns  

---

## Business Context
This story implements the core value proposition of TREUM - AI-powered trading signals that combine:
- Real-time market data analysis
- Multi-model AI predictions (Claude, GPT-4, proprietary models)
- Technical & fundamental analysis fusion
- Risk-adjusted signal scoring
- Personalized recommendations based on user profile

---

## Acceptance Criteria

### Signal Generation Requirements
- [ ] Generate 15-20 high-quality signals daily across equity, crypto, forex
- [ ] Multi-timeframe analysis (1min, 5min, 15min, 1hr, 4hr, daily)
- [ ] Signal confidence scores (1-100) with accuracy tracking
- [ ] Entry, target, and stop-loss recommendations
- [ ] Risk-reward ratios calculated for each signal
- [ ] Backtesting results displayed (30-day, 90-day performance)
- [ ] Real-time signal validation against market movements

### AI Model Integration
- [ ] OpenAI GPT-4 Turbo for market sentiment analysis
- [ ] Anthropic Claude for fundamental analysis
- [ ] Local ML models for technical pattern recognition
- [ ] Ensemble voting system for final signal generation
- [ ] Model performance tracking and A/B testing
- [ ] Fallback mechanisms when external APIs fail

### Market Data Processing
- [ ] Real-time data ingestion from multiple sources
- [ ] Support for 500+ instruments (stocks, crypto, forex)
- [ ] Technical indicators calculation (50+ indicators)
- [ ] News sentiment integration from financial feeds
- [ ] Social media sentiment analysis
- [ ] Economic calendar event impact analysis

### Signal Distribution
- [ ] Real-time push notifications to mobile/web
- [ ] Email alerts with detailed analysis
- [ ] Telegram bot integration for instant delivery
- [ ] WhatsApp integration for premium users
- [ ] Signal archival and performance tracking
- [ ] User preference management (instruments, risk levels)

### Performance & Reliability
- [ ] Signal generation latency <5 seconds
- [ ] 99.9% uptime for signal generation service
- [ ] Handle 10,000+ concurrent users
- [ ] Automatic failover between data providers
- [ ] Circuit breakers for external API failures
- [ ] Real-time monitoring of signal accuracy

---

## Technical Implementation

### Database Schema

```sql
-- Trading instruments
CREATE TABLE instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'equity', 'crypto', 'forex', 'commodity'
    exchange VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Instrument metadata
    sector VARCHAR(100),
    market_cap BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Data source mapping
    data_provider VARCHAR(50), -- 'zerodha', 'binance', 'alpha_vantage'
    provider_symbol VARCHAR(50), -- Symbol used by data provider
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market data (time-series)
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID REFERENCES instruments(id),
    
    -- OHLCV data
    timestamp TIMESTAMP NOT NULL,
    timeframe VARCHAR(10) NOT NULL, -- '1m', '5m', '15m', '1h', '4h', '1d'
    open_price DECIMAL(18, 8) NOT NULL,
    high_price DECIMAL(18, 8) NOT NULL,
    low_price DECIMAL(18, 8) NOT NULL,
    close_price DECIMAL(18, 8) NOT NULL,
    volume BIGINT DEFAULT 0,
    
    -- Additional data
    vwap DECIMAL(18, 8),
    turnover DECIMAL(20, 2),
    
    -- Unique constraint to prevent duplicates
    UNIQUE(instrument_id, timestamp, timeframe)
);

-- Technical indicators (computed)
CREATE TABLE technical_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instrument_id UUID REFERENCES instruments(id),
    timestamp TIMESTAMP NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    
    -- Moving Averages
    sma_20 DECIMAL(18, 8),
    sma_50 DECIMAL(18, 8),
    ema_20 DECIMAL(18, 8),
    ema_50 DECIMAL(18, 8),
    
    -- Oscillators
    rsi DECIMAL(5, 2),
    macd_line DECIMAL(18, 8),
    macd_signal DECIMAL(18, 8),
    macd_histogram DECIMAL(18, 8),
    stochastic_k DECIMAL(5, 2),
    stochastic_d DECIMAL(5, 2),
    
    -- Volume indicators
    volume_sma_20 BIGINT,
    on_balance_volume BIGINT,
    
    -- Volatility
    bollinger_upper DECIMAL(18, 8),
    bollinger_lower DECIMAL(18, 8),
    atr DECIMAL(18, 8),
    
    -- Momentum
    adx DECIMAL(5, 2),
    cci DECIMAL(8, 3),
    williams_r DECIMAL(5, 2),
    
    UNIQUE(instrument_id, timestamp, timeframe)
);

-- AI-generated signals
CREATE TABLE trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id VARCHAR(50) UNIQUE NOT NULL,
    instrument_id UUID REFERENCES instruments(id),
    
    -- Signal details
    signal_type VARCHAR(10) NOT NULL, -- 'buy', 'sell', 'hold'
    confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 100),
    timeframe VARCHAR(10) NOT NULL,
    
    -- Price levels
    entry_price DECIMAL(18, 8) NOT NULL,
    target_price DECIMAL(18, 8),
    stop_loss DECIMAL(18, 8),
    current_price DECIMAL(18, 8) NOT NULL,
    
    -- Risk metrics
    risk_reward_ratio DECIMAL(5, 2),
    position_size_suggestion DECIMAL(5, 2), -- percentage of portfolio
    max_risk_percentage DECIMAL(5, 2),
    
    -- AI model attribution
    primary_model VARCHAR(50), -- 'gpt-4', 'claude', 'ensemble'
    model_confidence JSONB, -- {"gpt4": 85, "claude": 78, "technical": 92}
    reasoning TEXT,
    technical_factors JSONB,
    fundamental_factors JSONB,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'triggered', 'expired', 'cancelled'
    triggered_at TIMESTAMP,
    exit_price DECIMAL(18, 8),
    exit_reason VARCHAR(100),
    
    -- Performance tracking
    pnl_percentage DECIMAL(8, 4),
    pnl_amount DECIMAL(18, 8),
    max_favorable_excursion DECIMAL(8, 4),
    max_adverse_excursion DECIMAL(8, 4),
    
    -- Metadata
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signal subscriptions (user preferences)
CREATE TABLE signal_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription details
    subscription_type VARCHAR(20) NOT NULL, -- 'basic', 'premium', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Instrument preferences
    preferred_instruments JSONB, -- ["RELIANCE", "BITCOIN", "EURUSD"]
    preferred_sectors JSONB, -- ["technology", "banking"]
    instrument_types JSONB, -- ["equity", "crypto"]
    
    -- Risk preferences
    max_risk_per_trade DECIMAL(5, 2) DEFAULT 2.00, -- 2%
    risk_tolerance VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    min_confidence_score INTEGER DEFAULT 70,
    preferred_timeframes JSONB, -- ["15m", "1h", "4h"]
    
    -- Notification preferences
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    telegram_notifications BOOLEAN DEFAULT FALSE,
    whatsapp_notifications BOOLEAN DEFAULT FALSE,
    
    -- Timing preferences
    trading_hours_start TIME DEFAULT '09:15:00',
    trading_hours_end TIME DEFAULT '15:30:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signal delivery tracking
CREATE TABLE signal_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES trading_signals(id),
    user_id UUID REFERENCES users(id),
    
    -- Delivery details
    delivery_method VARCHAR(20) NOT NULL, -- 'push', 'email', 'telegram', 'whatsapp'
    delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
    
    -- Delivery metadata
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    clicked_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Engagement tracking
    user_action VARCHAR(50), -- 'ignored', 'bookmarked', 'executed', 'shared'
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signal performance analytics
CREATE TABLE signal_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES trading_signals(id),
    
    -- Performance metrics
    accuracy_score DECIMAL(5, 2), -- 0-100
    hit_rate DECIMAL(5, 2), -- percentage of successful signals
    avg_return DECIMAL(8, 4), -- average return percentage
    max_drawdown DECIMAL(8, 4),
    sharpe_ratio DECIMAL(8, 4),
    
    -- Time-based performance
    performance_1d DECIMAL(8, 4),
    performance_7d DECIMAL(8, 4),
    performance_30d DECIMAL(8, 4),
    
    -- Benchmark comparison
    benchmark_return DECIMAL(8, 4), -- Nifty50 or relevant benchmark
    alpha DECIMAL(8, 4), -- excess return over benchmark
    beta DECIMAL(8, 4), -- correlation with market
    
    -- Model attribution
    model_contribution JSONB, -- performance breakdown by AI model
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News and sentiment data
CREATE TABLE market_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- News metadata
    headline VARCHAR(500) NOT NULL,
    content TEXT,
    source VARCHAR(100),
    author VARCHAR(200),
    published_at TIMESTAMP NOT NULL,
    url TEXT,
    
    -- Sentiment analysis
    sentiment_score DECIMAL(5, 4), -- -1 to +1
    sentiment_label VARCHAR(20), -- 'positive', 'negative', 'neutral'
    confidence DECIMAL(5, 4),
    
    -- Relevance
    relevant_instruments JSONB, -- instruments this news affects
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 100),
    
    -- Processing
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

```typescript
// Signal Management
GET  /api/v1/signals                    // List active signals with filters
GET  /api/v1/signals/{id}               // Get signal details
POST /api/v1/signals/{id}/feedback      // Submit signal feedback
GET  /api/v1/signals/performance        // Get signal performance analytics

// User Signal Preferences
GET  /api/v1/signals/subscriptions      // Get user signal preferences
PUT  /api/v1/signals/subscriptions      // Update signal preferences
POST /api/v1/signals/subscriptions/test // Send test signal

// Market Data
GET  /api/v1/market-data/{symbol}       // Get current market data
GET  /api/v1/market-data/{symbol}/history // Historical data with indicators
GET  /api/v1/market-data/screener       // Stock screener with filters

// Instruments
GET  /api/v1/instruments                // List supported instruments
GET  /api/v1/instruments/{symbol}/info  // Detailed instrument information
POST /api/v1/instruments/watchlist      // Add to user watchlist

// Analytics & Reports
GET  /api/v1/analytics/portfolio-impact  // How signals affect user portfolio
GET  /api/v1/analytics/signal-history    // User's signal history with P&L
GET  /api/v1/reports/daily-summary       // Daily market summary with top signals
GET  /api/v1/reports/weekly-performance  // Weekly performance report

// Admin Endpoints
POST /api/v1/admin/signals/generate      // Manual signal generation trigger
GET  /api/v1/admin/signals/models/status // AI model health status
POST /api/v1/admin/signals/models/retrain // Trigger model retraining
GET  /api/v1/admin/analytics/system      // System performance analytics
```

### AI Model Architecture

```typescript
// Signal generation pipeline
interface SignalGenerationPipeline {
  // Data ingestion
  dataCollector: MarketDataCollector;
  newsAggregator: NewsAggregator;
  sentimentAnalyzer: SentimentAnalyzer;
  
  // Technical analysis
  technicalAnalyzer: TechnicalAnalyzer;
  patternRecognition: PatternRecognitionModel;
  
  // AI models
  gpt4Analyzer: GPT4MarketAnalyzer;
  claudeAnalyzer: ClaudeMarketAnalyzer;
  proprietaryModel: ProprietaryTradingModel;
  
  // Signal generation
  signalEnsemble: EnsembleModel;
  riskCalculator: RiskCalculator;
  signalValidator: SignalValidator;
  
  // Distribution
  signalDistributor: SignalDistributor;
  performanceTracker: PerformanceTracker;
}

// Example AI model prompt templates
const MARKET_ANALYSIS_PROMPT = `
Analyze the following market data for {symbol}:

Current Price: {currentPrice}
24h Change: {priceChange}%
Volume: {volume}
Technical Indicators:
- RSI: {rsi}
- MACD: {macd}
- Bollinger Bands: {bollingerBands}

Recent News:
{relevantNews}

Market Sentiment: {sentiment}

Provide:
1. Trading signal (BUY/SELL/HOLD)
2. Confidence score (1-100)
3. Entry price
4. Target and stop loss
5. Risk-reward ratio
6. Reasoning (2-3 sentences)
7. Key risk factors

Format as JSON.
`;
```

---

## Implementation Tasks

### Data Infrastructure (8 hours)
1. **Market data pipeline setup**
   - Real-time data streams from Zerodha/Binance APIs
   - WebSocket connections for live price feeds
   - Data validation and cleaning pipelines
   - Historical data backfill (2 years)

2. **Technical indicators computation**
   - Implement 50+ technical indicators using TA-Lib
   - Real-time indicator calculation engine
   - Indicator caching and optimization
   - Custom indicator development framework

### AI Model Integration (12 hours)
1. **External AI model integration**
   - OpenAI GPT-4 Turbo API wrapper
   - Anthropic Claude API wrapper
   - Rate limiting and quota management
   - Response caching and optimization

2. **Local ML models**
   - Pattern recognition using TensorFlow/PyTorch
   - Sentiment analysis model training
   - Ensemble voting system implementation
   - Model versioning and A/B testing framework

### Signal Generation Engine (10 hours)
1. **Core signal generation logic**
   - Multi-model signal fusion
   - Confidence scoring algorithms
   - Risk-reward calculation
   - Signal validation and filtering

2. **Performance tracking system**
   - Real-time P&L calculation
   - Signal accuracy tracking
   - Benchmark comparison
   - Performance analytics dashboard

### Distribution System (8 hours)
1. **Real-time notification system**
   - WebSocket push notifications
   - Email template system
   - Telegram bot integration
   - WhatsApp Business API integration

2. **User preference management**
   - Subscription management
   - Personalization engine
   - Delivery optimization
   - Notification scheduling

### Monitoring & Analytics (4 hours)
1. **System monitoring**
   - Signal generation latency tracking
   - Model performance monitoring
   - Data quality monitoring
   - Alert system for anomalies

2. **Business analytics**
   - User engagement metrics
   - Signal effectiveness reports
   - Revenue impact analysis
   - Churn prediction

---

## Definition of Done

### Functional Completeness
- [ ] Generating 15-20 quality signals daily
- [ ] Multi-timeframe analysis working
- [ ] AI models integrated and responding
- [ ] Real-time notifications delivered
- [ ] Performance tracking accurate
- [ ] User preferences respected

### Performance Standards
- [ ] Signal generation <5 seconds
- [ ] Notification delivery <2 seconds
- [ ] 99.9% uptime achieved
- [ ] Support 10,000+ concurrent users
- [ ] Data latency <1 second

### Quality Metrics
- [ ] Signal accuracy >65% over 30 days
- [ ] User satisfaction >4.0/5.0
- [ ] Zero critical security vulnerabilities
- [ ] Code coverage >85%
- [ ] API response time <500ms

### Integration & Scalability
- [ ] Horizontal scaling tested
- [ ] Circuit breakers functional
- [ ] Fallback mechanisms working
- [ ] Database performance optimized
- [ ] Monitoring alerts configured

---

## Dependencies
- **Requires**: User authentication (TREUM-001.x), Payment integration (TREUM-003.1)
- **Blocks**: Portfolio management, Advanced analytics
- **External**: OpenAI API access, Zerodha/Binance APIs, Telegram Bot API

---

## Risk Mitigation
1. **AI model failures**: Implement fallback to technical analysis only
2. **Data provider outages**: Multiple data sources with automatic failover
3. **High user load**: Auto-scaling infrastructure with load balancing
4. **Signal accuracy drops**: Real-time model performance monitoring with alerts
5. **Regulatory issues**: Clear disclaimers and risk warnings

---

## Success Metrics
- **User Engagement**: >80% of premium users act on at least 1 signal/week
- **Signal Accuracy**: >65% accuracy over 30-day rolling window
- **Performance**: Signals outperform Nifty50 by >3% annually
- **Retention**: <10% monthly churn for signal subscribers
- **Revenue**: 30% of total revenue from signal subscriptions

---

## Future Enhancements (Next Sprints)
- International markets (US, UK equities)
- Options and derivatives signals
- Custom signal creation tools
- Social trading features
- Portfolio optimization integration

---

## Estimation Breakdown
- Data Infrastructure: 8 hours
- AI Model Integration: 12 hours  
- Signal Generation Engine: 10 hours
- Distribution System: 8 hours
- Monitoring & Analytics: 4 hours
- Testing & QA: 8 hours
- Documentation: 4 hours
- Code Review & Refinement: 6 hours
- **Total: 60 hours (34 story points)**