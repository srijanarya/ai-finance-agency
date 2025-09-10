# TREUM AI Finance - Microservices Communication Architecture

This document outlines the comprehensive inter-service communication implementation for the TREUM AI Finance platform, featuring production-ready patterns with proper error handling, monitoring, and resilience.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Communication Patterns](#communication-patterns)
3. [Infrastructure Components](#infrastructure-components)
4. [Shared Libraries](#shared-libraries)
5. [Service Discovery](#service-discovery)
6. [Event-Driven Architecture](#event-driven-architecture)
7. [Monitoring & Observability](#monitoring--observability)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Best Practices](#best-practices)

## Architecture Overview

The TREUM AI Finance platform consists of 6 core microservices:

- **API Gateway** (Port 3000, gRPC 50051) - Entry point and request routing
- **User Management** (Port 3001, gRPC 50052) - User authentication and profiles  
- **Trading** (Port 3002, gRPC 50053) - Trade execution and portfolio management
- **Signals** (Port 3003, gRPC 50054) - Trading signal generation and distribution
- **Payment** (Port 3004, gRPC 50055) - Payment processing and subscriptions
- **Education** (Port 3005, gRPC 50056) - Course management and learning progress

## Communication Patterns

### 1. Synchronous Communication (gRPC)

Used for real-time request/response operations requiring immediate feedback:

```typescript
// Example: User authentication
const userClient = createUserClientFromRegistry();
const user = await userClient.getUser({ id: userId });
```

**Use Cases:**
- User authentication and authorization
- Real-time balance checks
- Immediate data retrieval
- Synchronous validations

### 2. Asynchronous Communication (RabbitMQ Events)

Used for decoupled, eventual consistency operations:

```typescript
// Example: Signal generation notification
await eventPublisher.publishSignalGenerated({
  id: signalId,
  symbol: 'BTCUSD',
  type: 'BUY',
  price: 50000,
  confidence: 85,
  // ... other properties
}, correlationId);
```

**Use Cases:**
- Signal distribution to subscribers
- Payment completion notifications
- User activity tracking
- Cross-service data synchronization

## Infrastructure Components

### RabbitMQ Message Broker

**Configuration:**
- Exchange: `treum_finance`
- Queues: Service-specific with DLX support
- Persistence: Durable queues and messages
- Management UI: Available on port 15672

**Features:**
- Message TTL (5 minutes)
- Dead letter exchanges for failed messages
- Retry mechanism with exponential backoff
- Message deduplication

### Consul Service Discovery

**Features:**
- Automatic service registration/deregistration
- Health check monitoring (HTTP + gRPC)
- Load balancing with random selection
- Key-value store for configuration
- Service mesh readiness

### PostgreSQL Database

**Configuration:**
- Multi-database setup per service
- Connection pooling
- Read replicas support
- Backup and recovery

### Redis Cache

**Usage:**
- Session storage
- Rate limiting
- Caching frequently accessed data
- Pub/sub for real-time notifications

## Shared Libraries

### @treum/shared

Contains common types, DTOs, enums, and interfaces:

```typescript
import { 
  SignalType, 
  CreateSignalDto, 
  UserResponseDto 
} from '@treum/shared';
```

**Contents:**
- Event types and schemas
- API request/response DTOs
- Business enums and constants
- Type definitions

### @treum/grpc-contracts

gRPC protocol buffer definitions and clients:

```typescript
import { 
  GrpcClientFactory, 
  ServiceRegistry 
} from '@treum/grpc-contracts';
```

**Contents:**
- Proto files for all services
- Generated TypeScript clients
- Service registry implementation
- Circuit breaker and retry logic

### @treum/microservices-common

Common utilities and patterns:

```typescript
import { 
  EventBusService, 
  HealthModule, 
  TracingInterceptor 
} from '@treum/microservices-common';
```

**Contents:**
- Event bus implementation
- Health check indicators
- Distributed tracing
- Circuit breakers and retry logic
- Service discovery clients

## Service Discovery

### Registration

Services automatically register with Consul on startup:

```typescript
// Automatic registration in ConsulService
await this.consul.agent.service.register({
  id: this.serviceId,
  name: this.serviceName,
  address: serviceAddress,
  port: servicePort,
  check: {
    http: `http://${serviceAddress}:${servicePort}/health`,
    interval: '30s',
  },
});
```

### Discovery

Services can discover and connect to other services:

```typescript
const endpoint = await consulService.discoverServiceEndpoint('user-management');
const userClient = GrpcClientFactory.createUserClient({
  host: endpoint.address,
  port: endpoint.port
});
```

## Event-Driven Architecture

### Event Publishing

```typescript
// Signal service publishes a new signal
await eventPublisher.publishSignalGenerated({
  id: signal.id,
  symbol: signal.symbol,
  type: signal.type,
  price: signal.price,
  confidence: signal.confidence,
  analysis: signal.analysis,
  // ...
}, correlationId);
```

### Event Subscription

```typescript
// Trading service listens for signals
eventSubscriber.subscribeToSignalGenerated({
  handle: async (event) => {
    // Evaluate signal and potentially execute trade
    await this.evaluateSignal(event.payload);
  }
});
```

### Event Types

**Signal Events:**
- `signal.generated` - New trading signal created
- `signal.updated` - Signal parameters modified
- `signal.expired` - Signal reached expiration

**Trading Events:**
- `trade.executed` - Trade successfully executed
- `trade.cancelled` - Trade cancelled by user or system

**User Events:**
- `user.registered` - New user account created
- `user.subscription.changed` - Subscription tier modified

**Payment Events:**
- `payment.completed` - Payment processed successfully
- `payment.failed` - Payment processing failed

## Monitoring & Observability

### Health Checks

Each service exposes multiple health check endpoints:

```
GET /health          # Basic health (disk, memory)
GET /health/ready    # Readiness (dependencies)
GET /health/live     # Liveness (critical resources)
GET /health/detailed # Comprehensive health report
```

### Distributed Tracing

Request tracing with correlation IDs:

```typescript
// Automatic correlation ID propagation
@Get('/users/:id')
async getUser(
  @Param('id') id: string,
  @CorrelationId() correlationId: string
) {
  // correlationId is automatically propagated
  return this.userService.findOne(id, correlationId);
}
```

### Metrics Collection

- **Prometheus** metrics collection
- **Grafana** dashboards
- **Jaeger** distributed tracing
- Custom business metrics

## Deployment

### Docker Compose

Start the complete microservices stack:

```bash
# Development environment
docker-compose -f docker-compose.microservices.yml up

# With monitoring
docker-compose -f docker-compose.microservices.yml --profile monitoring up

# Production deployment
docker-compose -f docker-compose.microservices.yml --profile production up
```

### Environment Configuration

Required environment variables:

```env
# Database
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://treum_user:password@postgres:5432/treum_finance

# Message Broker
RABBITMQ_USER=treum_admin
RABBITMQ_PASSWORD=secure_rabbit_password
RABBITMQ_URL=amqp://user:password@rabbitmq:5672/treum_finance

# Service Discovery
CONSUL_HOST=consul
CONSUL_PORT=8500

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Service Configuration
SERVICE_NAME=api-gateway
SERVICE_VERSION=1.0.0
PORT=3000
GRPC_PORT=50051
```

### Infrastructure Services

**Required Infrastructure:**
1. PostgreSQL (persistent data)
2. Redis (caching & sessions)
3. RabbitMQ (message broker)
4. Consul (service discovery)

**Optional Monitoring:**
1. Prometheus (metrics)
2. Grafana (dashboards)
3. Jaeger (tracing)
4. Nginx (load balancer)

## Testing

### Integration Tests

Comprehensive test suite covering:

```typescript
describe('Microservices Communication', () => {
  it('should handle complete trading signal workflow', async () => {
    // 1. Generate signal
    await eventPublisher.publishSignalGenerated(signalData);
    
    // 2. Execute trade
    await eventPublisher.publishTradeExecuted(tradeData);
    
    // 3. Verify correlation
    expect(events).toHaveLength(2);
    expect(events.every(e => e.correlationId === correlationId)).toBe(true);
  });
});
```

### Test Categories

**Unit Tests:**
- Individual service logic
- Event handlers
- Circuit breaker functionality

**Integration Tests:**
- Cross-service communication
- Event flow validation
- Database transactions

**End-to-End Tests:**
- Complete user workflows
- System resilience
- Performance under load

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:cov
```

## Best Practices

### Event Design

1. **Idempotent Events:** Ensure events can be safely replayed
2. **Event Versioning:** Include version numbers for backwards compatibility
3. **Correlation IDs:** Always propagate correlation IDs for tracing
4. **Event Schema:** Use strict schemas with validation

### Error Handling

1. **Circuit Breakers:** Prevent cascade failures
2. **Retry Logic:** Exponential backoff with jitter
3. **Dead Letter Queues:** Handle permanently failed messages
4. **Graceful Degradation:** Continue operating with reduced functionality

### Security

1. **Service-to-Service Auth:** mTLS for gRPC communication
2. **API Gateway:** Centralized authentication and rate limiting
3. **Secrets Management:** Environment-based configuration
4. **Network Isolation:** Service mesh or VPC networking

### Performance

1. **Connection Pooling:** Reuse database and message broker connections
2. **Caching Strategy:** Multi-level caching (Redis, in-memory)
3. **Load Balancing:** Distribute load across service instances
4. **Resource Limits:** Configure appropriate CPU and memory limits

### Monitoring

1. **Health Checks:** Comprehensive health monitoring
2. **Metrics:** Business and technical metrics
3. **Alerting:** Proactive alerting on failures
4. **Distributed Tracing:** End-to-end request tracing

## Troubleshooting

### Common Issues

1. **Service Discovery Failures:**
   - Check Consul connectivity
   - Verify service registration
   - Review health check endpoints

2. **Message Delivery Issues:**
   - Check RabbitMQ connectivity
   - Review queue configurations
   - Examine dead letter queues

3. **Performance Issues:**
   - Monitor service metrics
   - Check database query performance
   - Review connection pool settings

### Debugging Tools

- **Consul UI:** http://localhost:8500
- **RabbitMQ Management:** http://localhost:15672
- **Grafana Dashboards:** http://localhost:3100
- **Jaeger Tracing:** http://localhost:16686

## Conclusion

This microservices communication architecture provides:

- **Scalability:** Horizontal scaling with load balancing
- **Resilience:** Circuit breakers, retries, and graceful degradation
- **Observability:** Comprehensive monitoring and tracing
- **Maintainability:** Clear separation of concerns and shared libraries
- **Production-Ready:** Battle-tested patterns and configurations

The implementation follows industry best practices and provides a solid foundation for the TREUM AI Finance platform's growth and evolution.