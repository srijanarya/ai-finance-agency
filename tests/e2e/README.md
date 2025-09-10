# AI Finance Agency - End-to-End Integration Tests

Comprehensive end-to-end integration test suite for the AI Finance Agency platform, validating complete user journeys and cross-service functionality.

## 🎯 Test Coverage

### Core Test Suites

1. **Infrastructure Health Checks** (`01-infrastructure.test.ts`)
   - Database connectivity (PostgreSQL, MongoDB, Redis, RabbitMQ)
   - Service health endpoints
   - Message queue functionality
   - Cache operations

2. **Complete User Journey** (`02-user-journey-complete.test.ts`)
   - User registration and verification
   - Authentication and profile setup
   - KYC verification process
   - Payment setup and subscription
   - Market data access
   - Trading signal consumption
   - Trading execution
   - Risk management
   - Notifications and alerts
   - Educational content access
   - Data export and account management

3. **WebSocket Integration** (`03-websocket-integration.test.ts`)
   - Real-time market data streaming
   - Trading notifications
   - Signal alerts
   - Multi-connection handling
   - Connection management

4. **Payment Flow Integration** (`04-payment-flow-integration.test.ts`)
   - Payment method management
   - Subscription lifecycle
   - One-time payments
   - Billing and invoicing
   - Webhooks and events
   - Refunds and cancellations

5. **Market Data Streaming** (`05-market-data-streaming.test.ts`)
   - REST API functionality
   - Real-time subscriptions
   - WebSocket streaming
   - Technical indicators
   - Performance and caching
   - Access control

6. **Trading Integration** (`06-trading-integration.test.ts`)
   - Account setup and verification
   - Order management (market, limit, stop, bracket)
   - Position management
   - Trading history and analytics
   - Paper trading mode
   - Risk management integration

7. **Cross-Service Integration** (`07-service-integration.test.ts`)
   - User Management ↔ Payment integration
   - Market Data ↔ Trading integration
   - Signals ↔ Notification integration
   - Education ↔ Content Intelligence integration
   - Risk Management ↔ Trading integration
   - Data consistency validation
   - Error handling and resilience
   - Performance requirements

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- All AI Finance Agency services running

### Setup and Run Tests

```bash
# Navigate to test directory
cd tests/e2e

# Install dependencies
npm install

# Start services (if not already running)
npm run start:services

# Wait for services to be ready
npm run wait:services

# Run all tests
npm test

# Run specific test suites
npm run test:user-journey
npm run test:websocket
npm run test:payment
npm run test:trading
npm run test:market-data
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 🔧 Configuration

### Environment Variables

```bash
# Service URLs (defaults to localhost)
API_GATEWAY_URL=http://localhost:3000
USER_MANAGEMENT_URL=http://localhost:3002
PAYMENT_URL=http://localhost:3003
SIGNALS_URL=http://localhost:3004
EDUCATION_URL=http://localhost:3005
TRADING_URL=http://localhost:3006
NOTIFICATION_URL=http://localhost:3007
MARKET_DATA_URL=http://localhost:3008
CONTENT_INTELLIGENCE_URL=http://localhost:3009
RISK_MANAGEMENT_URL=http://localhost:3010

# Database connections
POSTGRES_URL=postgresql://ai_finance_user:securepassword123@localhost:5432/ai_finance_db
MONGODB_URL=mongodb://admin:securepass123@localhost:27017/ai_finance?authSource=admin
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://ai_finance_admin:securerabbitpass@localhost:5672/ai_finance

# Test configuration
TEST_TIMEOUT=120000
TEST_USER_EMAIL_DOMAIN=test.aifinance.local
PARALLEL_TESTS=false
```

### Test Data Configuration

Tests automatically generate realistic test data including:

- User profiles with various subscription tiers
- Payment methods and transactions
- Trading orders and positions
- Market data subscriptions
- Educational content engagement
- Risk management rules

## 📊 Test Execution Flow

### Execution Order

Tests are executed in a specific order to ensure proper dependencies:

1. Infrastructure checks
2. User registration and authentication
3. Payment and subscription setup
4. Market data access validation
5. Trading functionality
6. Cross-service integration validation

### Data Management

- **Setup**: Comprehensive test data generation
- **Isolation**: Each test suite uses independent data
- **Cleanup**: Automatic cleanup after test completion
- **Consistency**: Cross-service data validation

## 🔍 Test Features

### Custom Matchers

```typescript
// UUID validation
expect(response.data.id).toBeValidUUID();

// JWT token validation
expect(response.data.accessToken).toBeValidJWT();

// Numeric range validation
expect(response.data.price).toBeWithinRange(100, 200);
```

### WebSocket Testing

```typescript
// Establish WebSocket connections
const ws = await testEnv.createWebSocketConnection(
  'market-data',
  '/ws/market-data',
  authToken
);

// Subscribe to real-time data
ws.send(JSON.stringify({
  action: 'subscribe',
  channel: 'prices',
  symbols: ['AAPL', 'GOOGL'],
}));
```

### Cross-Service Validation

```typescript
// Validate data consistency across services
const userProfile = await testEnv.userManagement.get('/auth/me');
const tradingAccount = await testEnv.trading.get('/account/status');
expect(tradingAccount.data.userId).toBe(userProfile.data.user.id);
```

## 📈 Performance Benchmarks

### Expected Response Times

- Authentication: < 500ms
- Market data queries: < 1000ms
- Order placement: < 2000ms
- Cross-service operations: < 5000ms
- WebSocket connection: < 1000ms

### Throughput Requirements

- Concurrent users: 100+
- Market data updates: 1000+ per second
- Order processing: 50+ per second
- WebSocket connections: 1000+

## 🛠️ Debugging and Troubleshooting

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test with verbose output
npx jest tests/02-user-journey-complete.test.ts --verbose
```

### Common Issues

1. **Service Not Ready**
   ```bash
   # Check service health
   npm run wait:services
   
   # View service logs
   docker-compose logs service-name
   ```

2. **Database Connection Issues**
   ```bash
   # Reset test databases
   npm run setup
   
   # Check database connectivity
   docker-compose exec postgres psql -U ai_finance_user -d ai_finance_db -c "SELECT 1"
   ```

3. **WebSocket Connection Failures**
   ```bash
   # Check WebSocket endpoints
   wscat -c ws://localhost:3008/ws/market-data
   ```

### Test Logs

Detailed test execution logs are available in:
- Console output (real-time)
- `coverage/html-report/report.html` (test results)
- Service logs via Docker Compose

## 🧪 Test Data

### Generated Test Data

- **Users**: 17 users across different subscription tiers
- **Payments**: Multiple payment methods and transactions
- **Trades**: Various order types and statuses
- **Subscriptions**: Active and cancelled subscriptions
- **Market Data**: Realistic price and volume data

### Data Cleanup

Tests automatically clean up generated data:
- Database records removed
- Cache entries cleared
- File uploads deleted
- Sessions terminated

## 📋 Test Reports

### Coverage Report

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### HTML Report

Comprehensive HTML report includes:
- Test execution summary
- Performance metrics
- Error details
- Service health status
- Cross-service integration results

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Run E2E tests
        run: |
          cd tests/e2e
          npm install
          npm run wait:services
          npm test
```

### Test Results

- **Success Criteria**: All tests pass with >95% success rate
- **Performance**: Response times within benchmarks
- **Coverage**: >80% code coverage across services
- **Integration**: All cross-service communications validated

## 📚 Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Include comprehensive assertions and error handling
3. Use realistic test data
4. Validate cross-service interactions
5. Add proper cleanup procedures
6. Update documentation

### Test Categories

- **Unit**: Service-specific functionality
- **Integration**: Cross-service interactions
- **E2E**: Complete user workflows
- **Performance**: Load and stress testing
- **Security**: Authentication and authorization

## 🔒 Security Testing

Tests validate:
- JWT token validation
- Permission-based access control
- Data encryption in transit
- Input validation and sanitization
- Rate limiting and throttling
- Session management

## 📞 Support

For test-related issues:

1. Check service health status
2. Review test logs and output
3. Validate environment configuration
4. Check database connectivity
5. Verify API endpoint availability

---

**Note**: These tests validate the complete AI Finance Agency platform functionality, ensuring all services work together seamlessly to provide a comprehensive trading and financial management experience.