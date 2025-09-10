# TREUM AI Finance Agency - Developer Onboarding Guide

## Welcome to TREUM AI Finance Agency

This guide will help you get started with the TREUM AI Finance Agency platform, from initial setup to deploying your first trading signal integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
3. [Architecture Overview](#architecture-overview)
4. [Local Development](#local-development)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Process](#deployment-process)
7. [Best Practices](#best-practices)
8. [Common Issues & Solutions](#common-issues--solutions)

## Quick Start

### Prerequisites

- Python 3.9+ or Node.js 16+
- Docker and Docker Compose
- Git
- PostgreSQL 14+
- Redis 6+
- An Indian trading account (Zerodha/Upstox/Angel)

### 1. Clone the Repository

```bash
git clone https://github.com/treum/ai-finance-agency.git
cd ai-finance-agency
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/treum_dev
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# Broker APIs
ZERODHA_API_KEY=your_zerodha_key
ZERODHA_API_SECRET=your_zerodha_secret
UPSTOX_API_KEY=your_upstox_key

# Payment
STRIPE_SECRET_KEY=your_stripe_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Security
JWT_SECRET_KEY=generate_secure_random_string
ENCRYPTION_KEY=generate_32_byte_key
```

### 3. Install Dependencies

#### Python Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

#### Node.js Microservices

```bash
# Install root dependencies
npm install

# Install service dependencies
npm run install:all

# Or install individually
cd services/api-gateway && npm install
cd services/user-management && npm install
cd services/trading && npm install
```

### 4. Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
alembic upgrade head

# Seed initial data
python scripts/seed_database.py

# For Node.js services
npm run migrate:all
npm run seed:all
```

### 5. Start Development Servers

```bash
# Start all services
docker-compose up

# Or start individually:

# Python FastAPI backend
uvicorn app.main:app --reload --port 8000

# Node.js services
npm run dev:api-gateway    # Port 3000
npm run dev:user-mgmt      # Port 3001
npm run dev:trading        # Port 3002
```

### 6. Verify Installation

```bash
# Check health endpoints
curl http://localhost:8000/health
curl http://localhost:3000/health

# Run quick tests
pytest tests/test_health.py
npm test
```

## Development Environment Setup

### IDE Configuration

#### VS Code

Install recommended extensions:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker",
    "redhat.vscode-yaml",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

Settings for `.vscode/settings.json`:

```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm

1. Set Python interpreter to virtual environment
2. Enable Django/FastAPI support
3. Configure code style to use Black
4. Set up database connections

### Git Workflow

#### Branch Strategy

```bash
main          # Production-ready code
├── develop   # Integration branch
├── feature/* # New features
├── bugfix/*  # Bug fixes
├── hotfix/*  # Emergency fixes
└── release/* # Release preparation
```

#### Commit Convention

```bash
# Format: <type>(<scope>): <subject>

feat(signals): add momentum strategy
fix(auth): resolve JWT token expiry issue
docs(api): update trading endpoints
refactor(portfolio): optimize calculations
test(compliance): add KYC validation tests
```

### Development Tools

#### Code Quality

```bash
# Python linting
black app/ tests/
flake8 app/
mypy app/
pylint app/

# JavaScript/TypeScript
npm run lint
npm run format
```

#### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Setup hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

`.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
  - repo: https://github.com/PyCQA/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.36.0
    hooks:
      - id: eslint
```

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
└─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────▼──────┐                          ┌────────▼────────┐
│  API Gateway │                          │  WebSocket Hub  │
│   (Node.js)  │                          │    (Node.js)    │
└───────┬──────┘                          └────────┬────────┘
        │                                           │
        ├───────────────┬───────────────────────────┤
        │               │                           │
┌───────▼──────┐ ┌──────▼──────┐ ┌────────────────▼────────┐
│   AI Signal  │ │   Trading   │ │  User Management        │
│   Service    │ │   Service   │ │     Service             │
│  (Python)    │ │  (Node.js)  │ │    (Node.js)            │
└───────┬──────┘ └──────┬──────┘ └────────────────┬────────┘
        │               │                           │
        └───────────────┴───────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                     │
            ┌───────▼──────┐     ┌───────▼──────┐
            │  PostgreSQL  │     │    Redis     │
            │   Database   │     │    Cache     │
            └──────────────┘     └──────────────┘
```

### Service Responsibilities

#### AI Signal Service (Python)

- Signal generation using ensemble models
- Backtesting and performance analysis
- Market data processing
- Technical indicator calculations

#### Trading Service (Node.js)

- Order execution via broker APIs
- Position management
- Real-time price feeds
- Risk management

#### User Management Service (Node.js)

- Authentication & authorization
- User profiles and preferences
- KYC/AML compliance
- Subscription management

### Database Schema

```sql
-- Core Tables
users               # User accounts and profiles
signals             # AI-generated trading signals
positions           # Current trading positions
orders              # Order history
portfolios          # Portfolio tracking
subscriptions       # User subscriptions

-- Analytics Tables
signal_performance  # Signal success metrics
user_analytics      # User behavior tracking
market_data         # Historical price data

-- Compliance Tables
kyc_documents       # KYC verification
audit_logs          # Compliance audit trail
trading_limits      # User trading restrictions
```

## Local Development

### Running Services Locally

#### Using Docker Compose

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up postgres redis
docker-compose up api-gateway trading-service

# View logs
docker-compose logs -f api-gateway

# Stop services
docker-compose down
```

#### Manual Service Start

```bash
# Terminal 1: Database
docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:14

# Terminal 2: Redis
docker run -p 6379:6379 redis:6-alpine

# Terminal 3: Python API
cd app && uvicorn main:app --reload

# Terminal 4: API Gateway
cd services/api-gateway && npm run dev

# Terminal 5: Trading Service
cd services/trading && npm run dev
```

### Debugging

#### Python Debugging (VS Code)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "jinja": true,
      "justMyCode": false
    }
  ]
}
```

#### Node.js Debugging

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API Gateway",
  "skipFiles": ["<node_internals>/**"],
  "program": "${workspaceFolder}/services/api-gateway/src/main.ts",
  "preLaunchTask": "npm: build",
  "outFiles": ["${workspaceFolder}/services/api-gateway/dist/**/*.js"]
}
```

### Hot Reloading

#### Python

```bash
# FastAPI with auto-reload
uvicorn app.main:app --reload --reload-dir app

# Or use watchfiles
pip install watchfiles
uvicorn app.main:app --reload-include="*.py"
```

#### Node.js

```bash
# Using nodemon
npm install -g nodemon
nodemon src/main.ts

# Or use ts-node-dev
npm install --save-dev ts-node-dev
ts-node-dev --respawn src/main.ts
```

## Testing Strategy

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
├── performance/   # Load testing
└── fixtures/      # Test data
```

### Running Tests

#### Python Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_signals.py

# Run with markers
pytest -m "not slow"

# Parallel execution
pytest -n 4
```

#### JavaScript Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific service
npm run test:api-gateway

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

### Test Examples

#### Unit Test (Python)

```python
import pytest
from app.services.ai_signals import SignalGenerator

@pytest.fixture
def signal_generator():
    return SignalGenerator()

def test_signal_generation(signal_generator):
    signals = signal_generator.generate(
        symbols=["RELIANCE"],
        strategy="momentum"
    )
    assert len(signals) > 0
    assert signals[0].confidence > 0.5
```

#### Integration Test (JavaScript)

```javascript
describe("Trading API", () => {
  it("should place order successfully", async () => {
    const response = await request(app)
      .post("/api/v1/trading/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        symbol: "RELIANCE",
        quantity: 100,
        order_type: "LIMIT",
        price: 2500,
      });

    expect(response.status).toBe(201);
    expect(response.body.order_id).toBeDefined();
  });
});
```

### Performance Testing

```bash
# Using locust
locust -f tests/performance/locustfile.py --host=http://localhost:8000

# Using k6
k6 run tests/performance/load-test.js

# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/v1/signals/generate
```

## Deployment Process

### Build Process

```bash
# Python application
python setup.py sdist bdist_wheel

# Docker build
docker build -t treum/ai-signals:latest .

# Node.js services
npm run build:all
```

### Container Registry

```bash
# Tag images
docker tag treum/ai-signals:latest registry.treum.ai/ai-signals:v1.0.0

# Push to registry
docker push registry.treum.ai/ai-signals:v1.0.0
```

### Deployment Environments

#### Staging Deployment

```bash
# Deploy to staging
kubectl apply -f k8s/staging/ -n staging

# Verify deployment
kubectl get pods -n staging
kubectl logs -f deployment/ai-signals -n staging
```

#### Production Deployment

```bash
# Create release branch
git checkout -b release/v1.0.0

# Run pre-deployment checks
./scripts/pre-deploy-check.sh

# Deploy to production
kubectl apply -f k8s/production/ -n production

# Monitor rollout
kubectl rollout status deployment/ai-signals -n production
```

### CI/CD Pipeline

#### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - "v*"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and Test
        run: |
          docker build -t treum/ai-signals .
          docker run treum/ai-signals pytest

      - name: Push to Registry
        run: |
          echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USERNAME }} --password-stdin
          docker push treum/ai-signals:${{ github.ref_name }}

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/ai-signals ai-signals=treum/ai-signals:${{ github.ref_name }}
```

## Best Practices

### Code Standards

#### Python Best Practices

```python
# Use type hints
from typing import List, Optional

def generate_signals(
    symbols: List[str],
    strategy: str = "momentum",
    risk_level: Optional[str] = None
) -> List[Signal]:
    """Generate trading signals for given symbols."""
    pass

# Use dataclasses
from dataclasses import dataclass

@dataclass
class Signal:
    symbol: str
    action: str
    price: float
    confidence: float

# Async/await for I/O operations
async def fetch_market_data(symbol: str) -> dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/quotes/{symbol}") as response:
            return await response.json()
```

#### TypeScript Best Practices

```typescript
// Use interfaces
interface TradingOrder {
  symbol: string;
  quantity: number;
  price: number;
  orderType: "MARKET" | "LIMIT";
}

// Use enums for constants
enum OrderStatus {
  PENDING = "PENDING",
  EXECUTED = "EXECUTED",
  CANCELLED = "CANCELLED",
}

// Error handling
class TradingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "TradingError";
  }
}

// Dependency injection
export class TradingService {
  constructor(
    private readonly brokerApi: BrokerAPI,
    private readonly logger: Logger,
  ) {}
}
```

### Security Guidelines

1. **API Security**
   - Always use HTTPS in production
   - Implement rate limiting
   - Use API key rotation
   - Enable CORS properly

2. **Data Protection**
   - Encrypt sensitive data at rest
   - Use parameterized queries
   - Implement input validation
   - Mask PII in logs

3. **Authentication**
   - Use strong JWT secrets
   - Implement token refresh
   - Enable 2FA for production
   - Session timeout policies

### Performance Optimization

1. **Database**
   - Use connection pooling
   - Implement query caching
   - Add appropriate indexes
   - Regular VACUUM and ANALYZE

2. **API**
   - Implement response caching
   - Use pagination for lists
   - Compress responses
   - Async processing for heavy tasks

3. **Monitoring**
   - Set up APM (Application Performance Monitoring)
   - Track key metrics
   - Alert on anomalies
   - Regular performance audits

## Common Issues & Solutions

### Issue: Database Connection Errors

```bash
# Error: could not connect to database
psql: error: could not connect to server

# Solution:
# 1. Check if PostgreSQL is running
docker ps | grep postgres

# 2. Verify connection string
echo $DATABASE_URL

# 3. Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Redis Connection Timeout

```python
# Error: Redis connection timeout

# Solution:
# 1. Increase timeout
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    socket_connect_timeout=5,
    socket_timeout=5
)

# 2. Use connection pool
pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    max_connections=50
)
redis_client = redis.Redis(connection_pool=pool)
```

### Issue: Broker API Rate Limits

```python
# Implement exponential backoff
import time
from functools import wraps

def retry_with_backoff(max_retries=3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except RateLimitError:
                    if attempt == max_retries - 1:
                        raise
                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
            return None
        return wrapper
    return decorator

@retry_with_backoff()
def place_order(order_data):
    return broker_api.place_order(order_data)
```

### Issue: Memory Leaks in Node.js

```javascript
// Monitor memory usage
const v8 = require("v8");
const heapStats = v8.getHeapStatistics();

console.log("Heap Usage:", {
  total: Math.round(heapStats.total_heap_size / 1048576),
  used: Math.round(heapStats.used_heap_size / 1048576),
  limit: Math.round(heapStats.heap_size_limit / 1048576),
});

// Fix: Clear references
let cache = new Map();

// Bad: Memory leak
setInterval(() => {
  cache.set(Date.now(), getLargeData());
}, 1000);

// Good: Clear old entries
setInterval(() => {
  const now = Date.now();
  cache.set(now, getLargeData());

  // Clear entries older than 1 hour
  for (const [key, value] of cache) {
    if (now - key > 3600000) {
      cache.delete(key);
    }
  }
}, 1000);
```

## Support & Resources

### Documentation

- [API Reference](https://docs.treum.ai/api)
- [Architecture Guide](https://docs.treum.ai/architecture)
- [Deployment Guide](https://docs.treum.ai/deployment)

### Community

- Discord: [discord.gg/treum](https://discord.gg/treum)
- GitHub Discussions: [github.com/treum/discussions](https://github.com/treum/discussions)
- Stack Overflow: Tag `treum-ai`

### Training Resources

- [Video Tutorials](https://youtube.com/treum-ai)
- [Code Examples](https://github.com/treum/examples)
- [Best Practices Blog](https://blog.treum.ai)

### Contact

- Technical Support: tech-support@treum.ai
- Security Issues: security@treum.ai
- General Inquiries: info@treum.ai

---

Welcome to the TREUM AI Finance Agency development team! We're excited to have you on board. Happy coding! 🚀
