# Market Data Service

High-performance real-time market data service for the AI Finance Agency platform. Provides real-time stock quotes, historical data, technical indicators, price alerts, and watchlist management with WebSocket streaming capabilities.

## Features

### Real-Time Market Data
- Live stock quotes and market data
- WebSocket streaming for real-time updates
- Multiple data source support (Alpha Vantage, IEX, Yahoo Finance)
- High-frequency data updates with caching and rate limiting

### Historical Data Management
- OHLC (Open, High, Low, Close) data storage
- Multiple timeframes (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1m)
- Volume profile analysis
- Data backfilling and synchronization

### Technical Indicators
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Moving Averages (SMA, EMA)
- Stochastic Oscillator
- Volume indicators (OBV, Volume SMA)
- Comprehensive technical analysis

### Price Alerts System
- Price-based alerts (above/below thresholds)
- Percentage change alerts
- Volume spike detection
- Technical indicator signals
- Multi-channel notifications (email, SMS, push)
- Recurring and expiring alerts

### Watchlist Management
- Personal symbol watchlists
- Real-time price tracking
- Performance analytics
- Tag-based organization
- CSV import/export
- Bulk operations

### WebSocket Streaming
- Real-time market data streaming
- Symbol subscription management
- Connection management and scaling
- Automatic reconnection handling

## API Endpoints

### Market Data
```
GET /market-data/realtime/:symbol          - Get real-time data for symbol
POST /market-data/realtime/batch           - Get batch real-time data
GET /market-data/historical/:symbol        - Get historical data
GET /market-data/ohlc/:symbol              - Get OHLC data
GET /market-data/volume-profile/:symbol    - Get volume profile
```

### Technical Analysis
```
GET /market-data/technical-analysis/:symbol/rsi               - RSI analysis
GET /market-data/technical-analysis/:symbol/macd              - MACD analysis
GET /market-data/technical-analysis/:symbol/bollinger-bands   - Bollinger Bands
GET /market-data/technical-analysis/:symbol/moving-average    - Moving averages
GET /market-data/technical-analysis/:symbol/stochastic       - Stochastic oscillator
GET /market-data/technical-analysis/:symbol/volume-indicators - Volume indicators
GET /market-data/technical-analysis/:symbol/comprehensive    - Full analysis
```

### Alerts
```
POST /alerts                    - Create alert
GET /alerts                     - Get user alerts
PUT /alerts/:id                 - Update alert
DELETE /alerts/:id              - Delete alert
GET /alerts/statistics          - Get alert statistics
POST /alerts/batch              - Create multiple alerts
```

### Watchlist
```
GET /watchlist                  - Get user watchlist
POST /watchlist                 - Add symbol to watchlist
PUT /watchlist/:id              - Update watchlist item
DELETE /watchlist/:id           - Remove from watchlist
GET /watchlist/statistics       - Get watchlist statistics
POST /watchlist/bulk-add        - Add multiple symbols
```

## WebSocket Events

### Client to Server
- `subscribe` - Subscribe to symbol updates
- `unsubscribe` - Unsubscribe from symbols
- `subscribe_watchlist` - Subscribe to user's watchlist
- `get_market_data` - Request specific symbol data

### Server to Client
- `market_data_update` - Real-time price updates
- `alert_triggered` - Price alert notifications
- `system_message` - System announcements
- `market_status` - Market open/close status

## Configuration

### Environment Variables
```bash
# Server
PORT=3008
GRPC_PORT=50059

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=market_data

# External APIs
ALPHA_VANTAGE_API_KEY=your-key
IEX_API_TOKEN=your-token

# Features
ENABLE_SCHEDULED_FETCH=true
DATA_FETCH_INTERVAL=30
```

### Data Sources

1. **Yahoo Finance** (Primary) - Free, reliable
2. **Alpha Vantage** - Requires API key
3. **IEX Cloud** - Requires API token

## Performance Features

### Caching Strategy
- Redis caching for frequently accessed data
- TTL-based cache invalidation
- Multi-level caching (memory + Redis)

### Rate Limiting
- Per-client rate limiting
- API endpoint throttling
- WebSocket connection limits

### Database Optimization
- Indexed queries for fast retrieval
- Partitioned historical data tables
- Efficient data compression

## Monitoring & Health

### Health Checks
```
GET /health          - Basic health check
GET /health/detailed - Detailed system status
GET /health/ready    - Readiness probe
GET /health/live     - Liveness probe
```

### Metrics
- Real-time connection counts
- API response times
- Data freshness indicators
- Error rates and alerts

## Development

### Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start in development mode
npm run start:dev

# Run tests
npm run test
```

### Docker
```bash
# Build image
docker build -t market-data-service .

# Run with docker-compose
docker-compose up market-data
```

## Architecture

### Service Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   REST API       │    │   gRPC Server   │
│   Gateway       │    │   Controllers    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────────┐
         │                Service Layer                            │
         ├─────────────────┬─────────────────┬─────────────────────┤
         │  Market Data    │  Technical      │  Alert & Watchlist  │
         │  Service        │  Indicators     │  Services           │
         └─────────────────┴─────────────────┴─────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────────────┐
         │              Data Access Layer                          │
         ├─────────────────┬─────────────────┬─────────────────────┤
         │   PostgreSQL    │     Redis       │   External APIs     │
         │   Database      │     Cache       │   (Yahoo, Alpha,    │
         │                 │                 │    IEX)             │
         └─────────────────┴─────────────────┴─────────────────────┘
```

### Data Flow
1. **Real-time Updates**: External APIs → Cache → WebSocket Broadcast
2. **Historical Data**: Scheduled Jobs → Database Storage → API Responses
3. **Alerts**: Market Data Updates → Alert Engine → Notifications
4. **Technical Analysis**: Historical Data → Calculations → Cache → Response

## Security

### Authentication
- JWT-based authentication
- Service-to-service authentication via gRPC
- Rate limiting per authenticated user

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- API key encryption in storage

## Scaling Considerations

### Horizontal Scaling
- Stateless service design
- Shared cache and database
- Load balancing support

### Performance Optimization
- Connection pooling
- Batch data processing
- Efficient WebSocket management
- Database query optimization

## Dependencies

### Core Dependencies
- **@nestjs/core** - NestJS framework
- **typeorm** - Database ORM
- **socket.io** - WebSocket implementation
- **technicalindicators** - Technical analysis calculations
- **yahoo-finance2** - Market data provider
- **redis** - Caching layer

### External Services
- PostgreSQL database
- Redis cache
- RabbitMQ (for inter-service communication)
- Consul (service discovery)

## License

Private - AI Finance Agency Platform