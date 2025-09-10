# Risk Management Service

Enterprise-grade risk management service for AI Finance Agency, providing comprehensive risk assessment, compliance monitoring, fraud detection, and real-time alerting capabilities.

## Features

### 🛡️ Risk Assessment
- **Pre-trade Risk Analysis**: Real-time assessment before trade execution
- **Portfolio Risk Calculation**: VaR, Expected Shortfall, Sharpe Ratio, Maximum Drawdown
- **Position Risk Monitoring**: Concentration, leverage, and correlation analysis
- **Stress Testing**: Scenario-based portfolio stress testing
- **Risk Attribution**: Factor-based risk decomposition

### 📋 Compliance Monitoring
- **KYC (Know Your Customer)**: Identity verification and document validation
- **AML (Anti-Money Laundering)**: Transaction pattern analysis and suspicious activity detection
- **Trade Surveillance**: Market manipulation and insider trading detection
- **Regulatory Compliance**: MIFID II, SOX, Dodd-Frank compliance checks
- **Sanctions Screening**: OFAC and international sanctions list monitoring

### 🚨 Real-time Alerting
- **Risk Limit Breaches**: Configurable risk limits with automated breach detection
- **Compliance Violations**: Real-time regulatory compliance monitoring
- **Fraud Detection**: Behavioral analysis and anomaly detection
- **Multi-channel Notifications**: Email, SMS, Slack, dashboard, webhooks
- **Escalation Management**: Automated escalation with time-based rules

### 🕵️ Fraud Detection
- **Device Fingerprinting**: Advanced device identification and tracking
- **Behavioral Analysis**: Login patterns, session duration, transaction behavior
- **Geographic Risk Assessment**: Location-based risk scoring
- **Multi-factor Risk Scoring**: Comprehensive fraud risk evaluation
- **Real-time Decision Engine**: Allow, challenge, block, or review recommendations

### 📊 Risk Metrics & Analytics
- **Real-time Metrics**: Live risk metric calculations
- **Historical Analysis**: Trend analysis and risk evolution tracking
- **Benchmarking**: Performance comparison against market benchmarks
- **Risk Reporting**: Comprehensive risk reports and dashboards
- **Data Quality Monitoring**: Metrics quality and reliability tracking

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis for high-performance data access
- **Message Queue**: RabbitMQ for event-driven architecture
- **API**: RESTful APIs with OpenAPI/Swagger documentation
- **gRPC**: High-performance inter-service communication
- **Authentication**: JWT-based security
- **Monitoring**: Health checks and metrics collection

### Service Components

```
├── src/
│   ├── controllers/          # REST API endpoints
│   │   ├── risk-assessment.controller.ts
│   │   ├── compliance.controller.ts
│   │   ├── risk-alerts.controller.ts
│   │   └── health.controller.ts
│   ├── services/            # Business logic
│   │   ├── trade-risk-assessment.service.ts
│   │   ├── portfolio-risk-calculation.service.ts
│   │   ├── compliance-monitoring.service.ts
│   │   ├── fraud-detection.service.ts
│   │   └── risk-alerting.service.ts
│   ├── entities/            # Database models
│   │   ├── risk-assessment.entity.ts
│   │   ├── compliance-check.entity.ts
│   │   ├── risk-alert.entity.ts
│   │   ├── risk-limit.entity.ts
│   │   └── risk-metrics.entity.ts
│   ├── dto/                 # Data transfer objects
│   └── strategies/          # Authentication strategies
```

## API Endpoints

### Risk Assessment
- `POST /risk-assessment/trade` - Assess trade risk
- `POST /risk-assessment/portfolio` - Calculate portfolio risk metrics
- `GET /risk-assessment/trade/history/:userId` - Get assessment history
- `POST /risk-assessment/stress-test` - Perform stress testing

### Compliance
- `POST /compliance/kyc` - Perform KYC check
- `POST /compliance/aml` - Perform AML check
- `POST /compliance/trade` - Trade compliance check
- `GET /compliance/status/:userId` - Get compliance status
- `GET /compliance/history/:userId` - Get compliance history

### Risk Alerts
- `POST /risk-alerts` - Create risk alert
- `GET /risk-alerts` - Get active alerts
- `PUT /risk-alerts/:id/acknowledge` - Acknowledge alert
- `PUT /risk-alerts/:id/resolve` - Resolve alert
- `GET /risk-alerts/statistics` - Get alert statistics

### Health & Monitoring
- `GET /health` - Service health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Configuration

### Environment Variables

```bash
# Service Configuration
PORT=3007
GRPC_PORT=5007
NODE_ENV=production
SERVICE_NAME=risk-management

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/risk_management
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://user:password@localhost:5672

# Authentication
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# External Services
TRADING_SERVICE_HOST=localhost
TRADING_SERVICE_GRPC_PORT=50053
USER_SERVICE_HOST=localhost
USER_SERVICE_GRPC_PORT=50052
NOTIFICATION_SERVICE_HOST=localhost
NOTIFICATION_SERVICE_GRPC_PORT=50057

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

## Usage Examples

### Trade Risk Assessment

```typescript
const tradeRisk = await fetch('/risk-assessment/trade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    userId: 'user123',
    accountId: 'account456',
    symbol: 'AAPL',
    assetType: 'STOCK',
    side: 'BUY',
    quantity: 100,
    price: 150.0,
    portfolioValue: 100000,
    availableBalance: 25000,
    existingPositions: [],
    marketData: {
      volatility: 0.25,
      liquidity: 0.8,
      beta: 1.2,
      correlation: 0.7
    }
  })
});

const result = await tradeRisk.json();
console.log('Risk Level:', result.riskLevel);
console.log('Risk Score:', result.riskScore);
console.log('Approved:', result.approved);
```

### KYC Compliance Check

```typescript
const kycCheck = await fetch('/compliance/kyc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify({
    userId: 'user123',
    personalInfo: {
      fullName: 'John Doe',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'US',
        postalCode: '10001'
      },
      phone: '+1234567890',
      email: 'john.doe@example.com'
    },
    documents: [
      {
        type: 'passport',
        url: 'https://example.com/passport.pdf',
        verified: true
      }
    ],
    riskProfile: 'medium',
    investmentExperience: 'intermediate'
  })
});
```

## Risk Models

### Trade Risk Factors
- **Position Size**: Percentage of portfolio value
- **Leverage**: Multiplier effect on risk
- **Concentration**: Exposure to single asset/sector
- **Volatility**: Historical price volatility
- **Liquidity**: Market liquidity assessment
- **Stop Loss**: Risk mitigation effectiveness

### Portfolio Risk Metrics
- **Value at Risk (VaR)**: Potential loss at confidence levels (95%, 99%, 99.9%)
- **Expected Shortfall**: Average loss beyond VaR threshold
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Sharpe Ratio**: Risk-adjusted return measure
- **Beta**: Market sensitivity coefficient
- **Correlation**: Asset correlation analysis

### Fraud Detection Factors
- **Location Risk**: Geographic anomaly detection
- **Device Risk**: Unknown or suspicious devices
- **Behavioral Risk**: Unusual activity patterns
- **Transaction Risk**: Suspicious transaction patterns
- **Temporal Risk**: Time-based anomalies

## Compliance Framework

### Supported Regulations
- **MIFID II**: European financial markets regulation
- **SOX**: Sarbanes-Oxley Act compliance
- **Dodd-Frank**: US financial reform legislation
- **GDPR**: Data protection regulation
- **OFAC**: Sanctions compliance
- **PEP**: Politically Exposed Person screening

### Risk Limits
- Position size limits
- Portfolio value limits
- Daily/weekly/monthly loss limits
- Leverage limits
- Concentration limits
- Sector exposure limits
- Currency exposure limits

## Deployment

### Docker

```bash
# Build the service
docker build -t risk-management .

# Run the service
docker run -p 3007:3007 -p 5007:5007 risk-management
```

### Docker Compose

```bash
# Start the entire stack
docker-compose -f docker-compose.microservices.yml up risk-management

# Start with dependencies
docker-compose -f docker-compose.microservices.yml up postgres redis rabbitmq risk-management
```

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Build for production
npm run build
```

## Security Considerations

- **Authentication**: JWT-based authentication for all endpoints
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **Audit Logging**: Complete audit trail for compliance
- **Secure Communication**: TLS for all external communications

## Monitoring & Observability

- **Health Checks**: Kubernetes-ready health endpoints
- **Metrics**: Prometheus-compatible metrics
- **Distributed Tracing**: Jaeger integration
- **Structured Logging**: JSON-formatted logs
- **Performance Monitoring**: Request/response time tracking
- **Alert Management**: Real-time alert processing and escalation

## Contributing

1. Follow NestJS best practices
2. Maintain comprehensive test coverage
3. Document all API changes
4. Follow semantic versioning
5. Ensure security compliance

## License

Proprietary - AI Finance Agency