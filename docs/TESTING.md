# AI Finance Agency - Comprehensive Testing Guide

This document provides a complete guide to the testing infrastructure for the AI Finance Agency microservices platform.

## Table of Contents

- [Overview](#overview)
- [Test Architecture](#test-architecture)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Integration](#cicd-integration)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our testing strategy follows the test pyramid approach with comprehensive coverage across all 10 microservices:

- **10 Microservices**: API Gateway, User Management, Payment, Trading, Signals, Market Data, Risk Management, Education, Notification, Content Intelligence
- **Test Coverage Target**: >90% line coverage, >80% branch coverage
- **Test Types**: Unit, Integration, E2E, Performance, Security
- **Frameworks**: Jest, Supertest, Socket.IO testing
- **Infrastructure**: Docker containers for test databases and services

### Services Overview

| Service | Port | Primary Technology | Test Focus |
|---------|------|-------------------|------------|
| API Gateway | 3000 | NestJS + Express | Routing, Auth, Rate Limiting |
| User Management | 3002 | NestJS + PostgreSQL | Authentication, RBAC, Sessions |
| Payment | 3001 | NestJS + Stripe | Transactions, Webhooks, PCI Compliance |
| Trading | 3004 | NestJS + WebSocket | Order execution, Real-time data |
| Signals | 3003 | NestJS + ML | AI signal generation, Analysis |
| Market Data | 3008 | NestJS + WebSocket | Real-time streaming, Data feeds |
| Risk Management | 3007 | NestJS + gRPC | Risk assessment, Monitoring |
| Education | 3005 | NestJS + File uploads | Content delivery, Progress tracking |
| Notification | 3006 | NestJS + Multi-channel | Email, SMS, Push notifications |
| Content Intelligence | 3009 | NestJS + AI/ML | Content analysis, NLP |

## Test Architecture

### Directory Structure

```
/
├── shared/
│   ├── test-config/           # Shared Jest configurations
│   ├── test-utils/            # Test utilities and factories
│   └── package.json           # Shared test dependencies
├── services/
│   └── [service-name]/
│       ├── src/
│       │   ├── **/*.spec.ts   # Unit tests
│       │   └── **/*.ts        # Source code
│       ├── test/
│       │   ├── setup.ts       # Service-specific test setup
│       │   ├── setup-e2e.ts   # E2E test setup
│       │   └── **/*.e2e-spec.ts # E2E tests
│       └── coverage/          # Coverage reports
├── .github/workflows/         # CI/CD pipelines
├── docker-compose.test.yml    # Test infrastructure
├── test-all.js               # Comprehensive test runner
└── docs/TESTING.md           # This document
```

### Test Infrastructure

- **PostgreSQL**: Primary database for most services
- **Redis**: Caching and session storage
- **RabbitMQ**: Message queue testing
- **MongoDB**: Document storage for content intelligence
- **Docker**: Containerized test environment

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/ai-finance-agency.git
   cd ai-finance-agency
   ```

2. **Install dependencies**:
   ```bash
   # Install shared dependencies
   cd shared && npm install

   # Install service dependencies (run for each service)
   cd ../services/user-management && npm install
   cd ../payment && npm install
   # ... repeat for all services
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.test
   # Edit .env.test with test-specific values
   ```

4. **Start test infrastructure**:
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   ```

## Running Tests

### Quick Start - All Tests

Run the comprehensive test suite:

```bash
node test-all.js
```

This script will:
- Check prerequisites
- Start test infrastructure
- Install dependencies
- Run unit tests for all services
- Run integration tests
- Run E2E tests
- Generate coverage reports
- Clean up resources

### Individual Service Tests

Run tests for a specific service:

```bash
cd services/user-management
npm test                 # Unit tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
npm run test:e2e        # E2E tests
```

### Docker-based Testing

Run tests in isolated containers:

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run tests in container
docker-compose -f docker-compose.test.yml exec test-setup npm run test

# Cleanup
docker-compose -f docker-compose.test.yml down
```

### Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration  

# E2E tests only
npm run test:e2e

# Performance tests
npm run test:performance

# Security tests
npm run test:security
```

## Test Types

### 1. Unit Tests

**Location**: `src/**/*.spec.ts`
**Purpose**: Test individual functions, classes, and components in isolation

**Example**:
```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: TestHelpers.createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should create a user successfully', async () => {
    const userData = TestFactory.createUser();
    userRepository.save.mockResolvedValue(userData);

    const result = await service.createUser(userData);

    expect(userRepository.save).toHaveBeenCalledWith(userData);
    expect(result).toEqual(userData);
  });
});
```

### 2. Integration Tests

**Location**: `test/**/*.integration.spec.ts`
**Purpose**: Test interactions between components, database operations, external services

**Example**:
```typescript
// payment.integration.spec.ts
describe('Payment Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PaymentModule],
    }).compile();

    app = module.createNestApplication();
    dataSource = app.get(DataSource);
    await app.init();
  });

  it('should process payment with Stripe integration', async () => {
    const paymentData = {
      amount: 100,
      currency: 'USD',
      paymentMethodId: 'pm_test_123456',
    };

    const response = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', 'Bearer valid-token')
      .send(paymentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('succeeded');
  });
});
```

### 3. End-to-End Tests

**Location**: `test/**/*.e2e-spec.ts`
**Purpose**: Test complete user workflows across multiple services

**Example**:
```typescript
// auth-flow.e2e-spec.ts
describe('Authentication Flow (E2E)', () => {
  it('should complete full registration and login flow', async () => {
    // 1. Register user
    const registrationData = {
      email: 'test@example.com',
      password: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(registrationData)
      .expect(201);

    // 2. Verify email (simulated)
    // 3. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registrationData.email,
        password: registrationData.password,
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('accessToken');

    // 4. Access protected resource
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
      .expect(200);
  });
});
```

### 4. WebSocket Tests

**Purpose**: Test real-time functionality in Trading and Market Data services

**Example**:
```typescript
// trading.gateway.spec.ts
describe('Trading Gateway', () => {
  it('should handle market data subscriptions', async () => {
    const client = io('http://localhost:3001/trading', {
      auth: { token: 'valid-jwt-token' }
    });

    await new Promise(resolve => {
      client.on('connected', resolve);
    });

    client.emit('subscribe', {
      type: 'market-data',
      symbols: ['AAPL', 'GOOGL']
    });

    await new Promise(resolve => {
      client.on('subscribed', (data) => {
        expect(data.type).toBe('market-data');
        expect(data.symbols).toEqual(['AAPL', 'GOOGL']);
        resolve(data);
      });
    });

    client.close();
  });
});
```

### 5. Performance Tests

**Purpose**: Ensure system performance under load

**Example**:
```typescript
// market-data.performance.spec.ts
describe('Market Data Performance', () => {
  it('should handle 1000 concurrent WebSocket connections', async () => {
    const connections = [];
    const startTime = Date.now();

    // Create 1000 connections
    for (let i = 0; i < 1000; i++) {
      const client = io('http://localhost:3008/market-data', {
        auth: { token: generateTestToken() }
      });
      connections.push(client);
    }

    // Wait for all connections
    await Promise.all(connections.map(client => 
      new Promise(resolve => client.on('connected', resolve))
    ));

    const connectionTime = Date.now() - startTime;
    expect(connectionTime).toBeLessThan(5000); // 5 seconds max

    // Clean up
    connections.forEach(client => client.close());
  });
});
```

## Coverage Requirements

### Global Thresholds

- **Statements**: 90%
- **Branches**: 80% 
- **Functions**: 90%
- **Lines**: 90%

### Service-Specific Requirements

| Service | Statements | Branches | Functions | Lines |
|---------|------------|----------|-----------|--------|
| User Management | 95% | 85% | 95% | 95% |
| Payment | 95% | 90% | 95% | 95% |
| Trading | 90% | 80% | 90% | 90% |
| Market Data | 90% | 80% | 90% | 90% |
| API Gateway | 85% | 75% | 85% | 85% |
| Others | 90% | 80% | 90% | 90% |

### Coverage Configuration

Jest configuration in each service:

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow

Our CI/CD pipeline runs comprehensive tests on:
- **Every push** to main/develop branches
- **Every pull request**
- **Daily scheduled runs** at 2 AM UTC

### Pipeline Stages

1. **Unit Tests**: Run in parallel for all services
2. **Integration Tests**: With real database connections
3. **E2E Tests**: Complete workflow testing
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Vulnerability scanning
6. **Coverage Reporting**: Merged coverage analysis

### Quality Gates

- **Coverage threshold**: Must meet minimum requirements
- **Test success**: All tests must pass
- **Security scan**: No high-severity vulnerabilities
- **Performance**: Response times within limits

### Notifications

- **Slack alerts** on test failures
- **PR comments** with coverage reports
- **Email notifications** for scheduled runs

## Writing Tests

### Test Factory Usage

Use the shared test factory for consistent test data:

```typescript
import { TestFactory } from '@shared/test-utils/test-factory';

// Generate test data
const user = TestFactory.createUser();
const payment = TestFactory.createPayment({ amount: 100 });
const trade = TestFactory.createTrade({ symbol: 'AAPL' });
```

### Mock Patterns

#### Repository Mocking
```typescript
const mockRepository = TestHelpers.createMockRepository();
mockRepository.findOne.mockResolvedValue(testUser);
```

#### External Service Mocking
```typescript
jest.mock('stripe', () => ({
  paymentIntents: {
    create: jest.fn().mockResolvedValue(mockPaymentIntent)
  }
}));
```

#### WebSocket Mocking
```typescript
const mockSocket = TestHelpers.createMockWebSocket();
mockSocket.emit.mockImplementation((event, data) => {
  // Test WebSocket interactions
});
```

### Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
it('should perform specific action', async () => {
  // Arrange
  const inputData = TestFactory.createTestData();
  mockService.method.mockResolvedValue(expectedOutput);

  // Act
  const result = await serviceUnderTest.performAction(inputData);

  // Assert
  expect(mockService.method).toHaveBeenCalledWith(inputData);
  expect(result).toEqual(expectedOutput);
});
```

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test public interfaces and contracts

2. **Write Deterministic Tests**
   - Tests should produce the same result every time
   - Avoid time-dependent or random data

3. **Keep Tests Independent**
   - Each test should be able to run in isolation
   - Use proper setup/teardown

4. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should reject login with invalid password')
   
   // Bad  
   it('should return false')
   ```

### Service-Specific Guidelines

#### Authentication & Authorization
- Test all authentication flows
- Verify permission checks
- Test token expiration and refresh

#### Payment Processing
- Mock external payment providers
- Test webhook handling
- Verify PCI compliance measures

#### Real-time Services
- Test WebSocket connections and subscriptions
- Verify message broadcasting
- Test connection cleanup

#### Data Processing
- Test with various data sizes
- Verify error handling for malformed data
- Test concurrent processing

### Performance Testing

- **Load Testing**: Normal expected load
- **Stress Testing**: Beyond normal capacity
- **Spike Testing**: Sudden load increases
- **Volume Testing**: Large amounts of data

### Security Testing

- **Input Validation**: SQL injection, XSS prevention
- **Authentication**: Token security, session management
- **Authorization**: Role-based access control
- **Data Protection**: Encryption, sensitive data handling

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check if test database is running
docker-compose -f docker-compose.test.yml ps

# Reset database
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
```

#### 2. Port Conflicts
```bash
# Check for port usage
lsof -i :5433 # PostgreSQL test port
lsof -i :6380 # Redis test port

# Kill conflicting processes
kill -9 <PID>
```

#### 3. Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 4. Test Timeouts
```typescript
// Increase timeout for slow tests
describe('Slow tests', () => {
  jest.setTimeout(60000); // 60 seconds
  
  it('should complete within timeout', async () => {
    // Long-running test
  });
});
```

### Debugging Tests

#### Enable Debug Mode
```bash
# Run tests with debugging
npm run test:debug

# VS Code launch configuration
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--detectOpenHandles"],
  "console": "integratedTerminal"
}
```

#### Verbose Output
```bash
# Run with verbose output
npm test -- --verbose

# Show console logs
npm test -- --silent=false
```

### Log Analysis

Check service logs during tests:

```bash
# Docker logs
docker-compose -f docker-compose.test.yml logs -f postgres-test
docker-compose -f docker-compose.test.yml logs -f redis-test

# Application logs
cd services/user-management
npm test 2>&1 | grep -E "(ERROR|WARN|FAIL)"
```

## Monitoring & Metrics

### Test Metrics

Track these metrics for test health:

- **Test Execution Time**: Individual and total runtime
- **Flaky Test Rate**: Tests that fail intermittently
- **Coverage Trends**: Coverage over time
- **Test Success Rate**: Percentage of passing tests

### Performance Baselines

Maintain performance baselines for:

- **API Response Times**: < 200ms for simple queries
- **WebSocket Latency**: < 50ms for real-time updates
- **Database Query Performance**: < 100ms for typical queries
- **Memory Usage**: < 512MB per service during tests

### Continuous Improvement

1. **Regular Review**: Weekly test analysis
2. **Flaky Test Elimination**: Fix or remove unreliable tests
3. **Performance Monitoring**: Track and improve test execution time
4. **Coverage Analysis**: Identify untested code paths

## Contributing

### Adding New Tests

1. **Follow naming conventions**: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for E2E tests
2. **Use shared utilities**: Leverage TestFactory and TestHelpers
3. **Document test purposes**: Clear descriptions and comments
4. **Update coverage requirements**: If adding new code paths

### Test Review Checklist

- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Mock external dependencies appropriately
- [ ] Tests are deterministic and isolated
- [ ] Proper error case testing
- [ ] Performance considerations addressed
- [ ] Security aspects tested where relevant
- [ ] Documentation updated if needed

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Socket.IO Testing](https://socket.io/docs/v4/testing/)

### Tools
- [Test Coverage Visualization](https://codecov.io)
- [Performance Monitoring](https://artillery.io)
- [Security Scanning](https://snyk.io)

### Support
- **Slack**: #dev-testing channel
- **Documentation**: This guide and inline code comments
- **Code Review**: PR reviews for test-related changes

---

**Last Updated**: {current_date}
**Version**: 1.0.0
**Maintained by**: Development Team