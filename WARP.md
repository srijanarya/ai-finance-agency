# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AI Finance Agency is an autonomous financial research and content generation system that combines traditional market analysis with the specialized "Abid Hassan methodology" (options-first institutional analysis). The system generates financial content, automates social media posting, and provides real-time market insights.

## Architecture Overview

### Core Agent Systems

**Research Agent** (`agents/research_agent.py`)
- Fetches data from multiple financial sources (RSS feeds, APIs)
- Analyzes content for relevance and generates content ideas
- Stores data in SQLite database with deduplication
- Runs continuously or on-demand

**Abid Hassan Integration** (`agents/abid_hassan_*.py`)
- Implements options-centric analysis methodology
- Focuses on institutional positioning via options data
- Integrates PCR analysis, max pain theory, and FII/DII flows
- Provides contrarian signals based on options positioning

**Technical Analysis Agent** (`agents/technical_analysis_agent.py`)
- Advanced technical indicators using TA-Lib
- Pattern recognition and signal generation
- Backtesting capabilities
- Risk metrics calculation

**Portfolio Management Agent** (`agents/portfolio_management_agent.py`)
- Intelligent portfolio construction and rebalancing
- Multiple allocation strategies (conservative, aggressive, etc.)
- Performance tracking and risk assessment

### Multi-Platform Automation

**Social Media Posting**
- Telegram: Automated channel posting and group growth
- LinkedIn: Company page and personal posting (OAuth flow)
- Twitter/X: Automated posting with rate limiting

**Content Management**
- Centralized posting queue system
- Content deduplication and quality analysis
- Approval dashboard for manual review

### Data Infrastructure

**Storage Layer**
- Primary: SQLite databases for agents and content
- Caching: Redis for real-time data and rate limiting
- PostgreSQL: N8N workflow data and analytics

**External Integrations**
- **Market Data**: Alpha Vantage, Finnhub, NewsAPI, Yahoo Finance
- **AI/ML**: OpenAI GPT, Google AI Studio, Anthropic Claude
- **Social APIs**: Telegram Bot API, LinkedIn OAuth, Twitter API
- **Trading Data**: Kite Connect integration for options data

## Development Commands

### Basic Operations

```bash
# Start research agent (continuous monitoring)
python run.py agent

# Run single research scan
python run.py scan

# Start web dashboard
python run.py dashboard

# Run Abid Hassan methodology analysis
python run.py abid

# Generate daily market analysis
python run.py daily
```

### Database Management

```bash
# Initialize all databases
python -c "from agents.research_agent import DatabaseManager; DatabaseManager('data/agency.db').initialize_database()"

# View content ideas
python -c "import sqlite3; conn = sqlite3.connect('data/agency.db'); print([row for row in conn.execute('SELECT * FROM content_ideas LIMIT 5')])"

# Clean up old data
python URGENT_DATA_FIX.py
```

### Testing and Validation

```bash
# Test social media posting
python platform_styled_poster.py --auto

# Test Telegram automation
python auto_telegram_poster.py

# Verify LinkedIn integration
python check_linkedin_verification.py

# Test content generation
python coherent_content_generator.py
```

### Deployment and Automation

```bash
# Docker deployment
docker-compose up -d

# Start Celery workers
celery -A celery_app worker --loglevel=info

# Start Celery scheduler
celery -A celery_app beat --loglevel=info

# N8N workflow deployment
./n8n_quick_setup.sh
```

### Monitoring and Health Checks

```bash
# View system dashboard
python agency_dashboard.py

# Monitor automation logs
tail -f logs/automation.log

# Check Redis cache status
redis-cli info memory

# Monitor Celery tasks
celery -A celery_app monitor
```

## Key Architecture Concepts

### Agent Methodology Integration

The system uniquely combines traditional financial research with the **Abid Hassan methodology**, which prioritizes:

1. **Options-First Analysis**: Analyzes institutional positioning through options data rather than price patterns
2. **PCR Contrarian Signals**: Uses Put-Call Ratio for contrarian market timing
3. **Max Pain Theory**: Tracks where options market makers want prices to settle
4. **Institutional Flow Analysis**: Monitors FII/DII activity for market direction

### Multi-Layer Content System

**Content Generation Pipeline**:
1. **Data Collection**: RSS feeds, market APIs, news sources
2. **Analysis Layer**: Research agent + Abid Hassan integration  
3. **Content Creation**: AI-powered content generation with deduplication
4. **Quality Control**: Approval dashboard and automated checks
5. **Distribution**: Multi-platform posting with rate limiting

### Automation Infrastructure

**Task Management**:
- **Celery**: Distributed task queue with Redis broker
- **N8N**: Visual workflow automation for complex pipelines  
- **Cron Jobs**: System-level scheduling for reliability
- **Docker**: Containerized deployment with health checks

**Rate Limiting & Compliance**:
- Redis-based rate limiting for all APIs
- Content deduplication using hash comparison
- Platform-specific posting rules and throttling

## Configuration Management

### Environment Setup

Core configuration in `.env` file:
- Financial APIs: `ALPHA_VANTAGE_API_KEY`, `FINNHUB_API_KEY`, `NEWS_API_KEY`
- Social Media: `TELEGRAM_BOT_TOKEN`, `LINKEDIN_ACCESS_TOKEN`, `TWITTER_*`
- AI Services: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- Infrastructure: `REDIS_URL`, `DATABASE_URL`, `CELERY_BROKER_URL`

### Database Schemas

**Main Agency DB** (`data/agency.db`):
- `research_topics`: Market research and content ideas
- `content_ideas`: Generated content with metadata
- `market_snapshots`: Real-time price and volume data
- `trending_keywords`: Keyword frequency and sentiment

**Task Management** (`config/task_manager_config.json`):
- Worker scaling and resource management
- Task priorities and rate limits
- Health monitoring thresholds

## Production Deployment

### Docker Stack

```yaml
services:
  - postgres: Primary database
  - redis: Caching and task queue
  - app: Main application
  - celery_worker: Background tasks
  - celery_beat: Task scheduler
  - telegram_growth: Automated growth engine
```

### Health Monitoring

The system includes comprehensive monitoring:
- **System Metrics**: CPU, memory, disk usage
- **Task Metrics**: Success rates, queue lengths, processing times
- **API Health**: Rate limit status, error rates
- **Content Quality**: Relevance scores, engagement metrics

### Scaling Considerations

- **Horizontal**: Multiple Celery workers for different task types
- **Caching**: Redis for frequently accessed market data
- **Database**: Connection pooling and query optimization
- **Rate Limits**: Distributed rate limiting across workers

## Special Notes for WARP Users

### Content Quality
The system prioritizes content quality over quantity. The Abid Hassan methodology provides unique insights not available in traditional analysis tools.

### API Management
Multiple financial APIs are used with fallback mechanisms. Always check rate limits before scaling operations.

### Social Media Compliance
Automated posting includes safeguards against spam and duplicate content. Manual approval workflows are available for sensitive content.

### Development Flow
Most development involves extending agents or adding new data sources. The modular architecture allows independent development of each component.

<citations>
<document>
<document_type>WARP_DOCUMENTATION</document_type>
<document_id>getting-started/quickstart-guide/coding-in-warp</document_id>
</document>
</citations>
