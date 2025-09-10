# Zerodha Kite API Integration Guide

## Overview

The TREUM AI Finance Agency platform integrates with Zerodha Kite Connect API to provide real-time trading capabilities, market data streaming, and portfolio management for Indian equity markets.

## Features

### 🚀 Core Trading Features
- **Real-time Order Management**: Place, modify, and cancel orders
- **Position Tracking**: Real-time P&L monitoring and position management
- **Portfolio Management**: Holdings and investment tracking
- **Market Data**: Live price feeds and historical data
- **Multi-instrument Support**: Equity, F&O, Commodity, Currency

### 🔐 Authentication & Security
- OAuth 2.0 authentication flow
- Secure token management
- Request signing and validation
- Rate limiting and error handling

### 📊 Advanced Features
- **WebSocket Streaming**: Real-time market data and order updates
- **Bulk Operations**: Execute multiple orders across accounts
- **Historical Data**: OHLCV candle data with multiple timeframes
- **Instrument Search**: Smart symbol lookup and filtering
- **Risk Management**: Position limits and margin monitoring

## Architecture

### Service Layer
```
ZerodhaKiteService (Core API Client)
├── Authentication & Token Management
├── Order Management (Place/Modify/Cancel)
├── Market Data Pipeline
├── WebSocket Streaming
└── Error Handling & Retry Logic

ZerodhaKiteServiceManager (Multi-Account Manager)
├── Account Pool Management
├── Bulk Order Execution
├── Consolidated Reporting
└── Connection Load Balancing
```

### API Integration
```
FastAPI Router (/api/v1/trading/)
├── Account Management Endpoints
├── Order Management Endpoints
├── Position & Holdings Endpoints
├── Market Data Endpoints
└── Real-time WebSocket Gateway
```

## Quick Start

### 1. Account Setup

```python
from app.services.zerodha_kite_service import KiteCredentials, kite_manager

# Initialize credentials
credentials = KiteCredentials(
    api_key="your_kite_api_key",
    api_secret="your_kite_api_secret",
    request_token="login_request_token"  # From Kite login flow
)

# Add account to manager
success = await kite_manager.add_account("user_id", credentials)
```

### 2. Place Orders

```python
# Get service for user
service = await kite_manager.get_service("user_id")

# Place a buy order
order_id = await service.place_order(
    symbol="RELIANCE",
    quantity=10,
    price=2500.0,
    order_type=OrderType.LIMIT,
    side="BUY",
    product="CNC"
)
```

### 3. Monitor Positions

```python
# Get current positions
positions = await service.get_positions()

for position in positions:
    print(f"{position.symbol}: {position.pnl} P&L")
```

## API Endpoints

### Account Management

#### Add Kite Account
```http
POST /api/v1/trading/accounts/add
Content-Type: application/json

{
    "api_key": "your_api_key",
    "api_secret": "your_api_secret",
    "request_token": "oauth_request_token"
}
```

#### Get Profile
```http
GET /api/v1/trading/accounts/profile
Authorization: Bearer <jwt_token>
```

#### Get Margins
```http
GET /api/v1/trading/accounts/margins
Authorization: Bearer <jwt_token>
```

### Order Management

#### Place Order
```http
POST /api/v1/trading/orders/place
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
    "symbol": "RELIANCE",
    "quantity": 10,
    "price": 2500.0,
    "order_type": "LIMIT",
    "side": "BUY",
    "product": "CNC",
    "validity": "DAY"
}
```

#### Modify Order
```http
PUT /api/v1/trading/orders/{order_id}/modify
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
    "quantity": 20,
    "price": 2600.0
}
```

#### Cancel Order
```http
DELETE /api/v1/trading/orders/{order_id}/cancel
Authorization: Bearer <jwt_token>
```

#### Get Orders
```http
GET /api/v1/trading/orders
Authorization: Bearer <jwt_token>
```

### Portfolio Management

#### Get Positions
```http
GET /api/v1/trading/positions
Authorization: Bearer <jwt_token>
```

#### Get Holdings
```http
GET /api/v1/trading/holdings
Authorization: Bearer <jwt_token>
```

### Market Data

#### Get Last Traded Price
```http
GET /api/v1/trading/ltp?symbols=RELIANCE,TCS,INFY
Authorization: Bearer <jwt_token>
```

#### Get Historical Data
```http
POST /api/v1/trading/historical
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
    "symbol": "RELIANCE",
    "from_date": "2024-01-01T00:00:00Z",
    "to_date": "2024-01-31T23:59:59Z",
    "interval": "day"
}
```

#### Search Instruments
```http
GET /api/v1/trading/instruments/search?query=RELIANCE&exchange=NSE
Authorization: Bearer <jwt_token>
```

## Data Models

### KiteCredentials
```python
class KiteCredentials(BaseModel):
    api_key: str
    api_secret: str
    access_token: Optional[str] = None
    request_token: Optional[str] = None
    user_id: Optional[str] = None
```

### KiteInstrument
```python
class KiteInstrument(BaseModel):
    instrument_token: int
    exchange_token: int
    tradingsymbol: str
    name: str
    last_price: float
    expiry: Optional[str] = None
    strike: Optional[float] = None
    tick_size: float
    lot_size: int
    instrument_type: str
    segment: str
    exchange: str
```

### KiteOrder
```python
class KiteOrder(BaseModel):
    order_id: str
    tradingsymbol: str
    quantity: int
    price: float
    order_type: str
    transaction_type: str
    product: str
    status: str
    filled_quantity: int
    pending_quantity: int
    average_price: float
    order_timestamp: datetime
```

## WebSocket Streaming

### Real-time Market Data
```python
# Subscribe to instruments for real-time data
await service.start_websocket(
    tokens=[738561, 408065],  # RELIANCE, TCS instrument tokens
    callback_market_data=handle_market_data,
    callback_order_updates=handle_order_updates
)

async def handle_market_data(data):
    print(f"Market update: {data}")

async def handle_order_updates(data):
    print(f"Order update: {data}")
```

### Dynamic Subscription
```python
# Subscribe to additional instruments
await service.subscribe_to_instruments([256265])  # Add INFY

# Unsubscribe from instruments
await service.unsubscribe_from_instruments([738561])  # Remove RELIANCE
```

## Integration with AI Signals

### Signal-to-Order Pipeline
```python
from app.services.ai_trading_signals_engine import AITradingSignalsEngine
from app.services.portfolio_management_engine import PortfolioManager

# Generate AI signals
signals_engine = AITradingSignalsEngine()
signals = await signals_engine.generate_signals(['RELIANCE', 'TCS'])

# Execute signals through portfolio manager
portfolio_manager = PortfolioManager()
for signal in signals:
    await portfolio_manager.execute_signal_via_broker(
        signal, 
        broker_type="zerodha",
        user_id="user_123"
    )
```

## Error Handling

### Common Error Scenarios

#### Authentication Errors
```python
try:
    success = await kite_manager.add_account(user_id, credentials)
except Exception as e:
    if "Invalid credentials" in str(e):
        # Handle invalid API key/secret
        pass
    elif "Token expired" in str(e):
        # Handle expired access token
        pass
```

#### Order Errors
```python
order_id = await service.place_order(...)
if not order_id:
    # Handle order placement failure
    margins = await service.get_margins()
    if margins["equity"]["available"]["cash"] < required_amount:
        # Insufficient funds
        pass
```

#### Network Errors
```python
try:
    positions = await service.get_positions()
except ConnectionError:
    # Handle network connectivity issues
    pass
except TimeoutError:
    # Handle request timeouts
    pass
```

## Performance Optimization

### Connection Pooling
- Reuse HTTP connections across requests
- Implement connection keep-alive
- Use async/await for concurrent operations

### Rate Limiting
- Respect Kite API rate limits (3 requests/second)
- Implement exponential backoff for retries
- Queue requests during high-frequency operations

### Caching Strategy
- Cache instrument master data (24-hour TTL)
- Cache user profile information (1-hour TTL)
- Real-time cache for LTP data (5-second TTL)

## Testing

### Unit Tests
```bash
# Run Kite integration tests
pytest tests/test_zerodha_integration.py -v

# Run with coverage
pytest tests/test_zerodha_integration.py --cov=app.services.zerodha_kite_service
```

### Integration Tests
```bash
# Test with mock Kite API
pytest tests/test_zerodha_integration.py::TestIntegrationScenarios -v

# Performance tests
pytest tests/test_zerodha_integration.py::TestPerformanceScenarios -v -m performance
```

### Manual Testing
```python
# Test authentication flow
python -c "
import asyncio
from app.services.zerodha_kite_service import KiteCredentials, ZerodhaKiteService

async def test():
    creds = KiteCredentials(api_key='test', api_secret='test')
    service = ZerodhaKiteService(creds)
    result = await service.initialize()
    print(f'Init result: {result}')

asyncio.run(test())
"
```

## Monitoring & Alerts

### Key Metrics to Monitor
- Order execution latency (target: <2 seconds)
- WebSocket connection uptime (target: >99.9%)
- API error rates (target: <1%)
- Daily order volume and success rate

### Alert Conditions
- Authentication failures
- Order placement failures
- WebSocket disconnections
- Unusual trading activity

### Logging
```python
import logging

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Service logs
logger = logging.getLogger("zerodha_kite_service")
logger.info(f"Order placed: {order_id} for {symbol}")
logger.error(f"Order failed: {error_message}")
```

## Production Deployment

### Environment Variables
```bash
# Kite API Configuration
KITE_API_ENDPOINT=https://api.kite.trade
KITE_WEBSOCKET_ENDPOINT=wss://ws.kite.trade
KITE_REQUEST_TIMEOUT=30
KITE_MAX_RETRIES=3

# Rate Limiting
KITE_RATE_LIMIT_PER_SECOND=3
KITE_BURST_LIMIT=10

# Monitoring
KITE_METRICS_ENABLED=true
KITE_LOG_LEVEL=INFO
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: treum-kite-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: treum-kite-service
  template:
    spec:
      containers:
      - name: kite-service
        image: treum/kite-service:latest
        env:
        - name: KITE_API_ENDPOINT
          value: "https://api.kite.trade"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Health Checks
```python
@router.get("/health/kite")
async def kite_health_check():
    try:
        # Check if any Kite services are active
        active_services = len(kite_manager.services)
        
        # Check API connectivity
        test_service = next(iter(kite_manager.services.values()), None)
        if test_service:
            profile = await test_service.get_profile()
            api_healthy = profile is not None
        else:
            api_healthy = True  # No services configured
        
        return {
            "status": "healthy" if api_healthy else "unhealthy",
            "active_accounts": active_services,
            "api_connectivity": api_healthy,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
```

## Security Considerations

### API Key Protection
- Store API keys encrypted in database
- Use environment variables for secrets
- Rotate keys regularly
- Monitor for unauthorized access

### Request Signing
- All requests signed with API secret
- Timestamp validation to prevent replay attacks
- HTTPS only for all communications

### User Data Protection
- Encrypt sensitive trading data
- Audit trail for all trading operations
- GDPR compliance for EU users
- Data retention policies

## Compliance & Regulatory

### SEBI Compliance
- Maintain audit trail of all trades
- Risk management controls
- Position limits enforcement
- Surveillance and monitoring

### Data Reporting
- Daily trading reports
- P&L statements
- Tax calculation support
- Regulatory filing assistance

## Support & Troubleshooting

### Common Issues

#### 1. Token Expiry
**Symptom**: 401 Unauthorized errors
**Solution**: Re-authenticate through Kite login flow

#### 2. Rate Limiting
**Symptom**: 429 Too Many Requests
**Solution**: Implement request throttling and retry logic

#### 3. WebSocket Disconnections
**Symptom**: Missing real-time updates
**Solution**: Implement auto-reconnection with exponential backoff

#### 4. Order Rejections
**Symptom**: Orders not getting placed
**Solution**: Check margins, instrument validity, and exchange timings

### Debug Mode
```python
# Enable debug logging
import logging
logging.getLogger("zerodha_kite_service").setLevel(logging.DEBUG)

# Test mode with paper trading
service = ZerodhaKiteService(credentials, test_mode=True)
```

### Contact & Support
- **Technical Support**: tech@treum.ai
- **Trading Issues**: trading@treum.ai
- **Kite API Documentation**: https://kite.trade/docs/
- **TREUM Platform Docs**: https://docs.treum.ai

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Compatible with**: Kite Connect API v3