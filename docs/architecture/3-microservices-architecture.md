# 3. Microservices Architecture

## 3.1 User Management Service

**Responsibilities**:
- Authentication & Authorization (JWT + OAuth2)
- KYC verification and compliance
- User profiles and preferences
- Role-based access control (RBAC)

**API Endpoints**:
```
POST /auth/login
POST /auth/register
POST /auth/verify-kyc
GET  /users/{id}/profile
PUT  /users/{id}/preferences
```

**Database Schema**:
```sql
-- Primary: PostgreSQL
users: id, email, phone, kyc_status, created_at
user_profiles: user_id, first_name, last_name, pan, address
user_sessions: session_id, user_id, expires_at, device_info
user_roles: user_id, role_id, assigned_at
```

**Scaling Strategy**:
- Read replicas for profile queries
- Redis session store for horizontal scaling
- JWT for stateless authentication

## 3.2 Education Platform Service

**Responsibilities**:
- Course catalog management
- Video streaming and content delivery
- Progress tracking and analytics
- Certification and assessments

**API Endpoints**:
```
GET  /courses
GET  /courses/{id}/modules
POST /courses/{id}/enroll
GET  /users/{id}/progress
POST /assessments/{id}/submit
```

**Database Schema**:
```sql
-- Primary: MongoDB
courses: {id, title, price, modules[], instructor_id, created_at}
enrollments: {user_id, course_id, progress, completed_at}
videos: {id, course_id, url, duration, transcripts}
assessments: {id, course_id, questions[], passing_score}
```

**Scaling Strategy**:
- CDN for video content delivery
- MongoDB sharding by course_id
- Elasticsearch for course search

## 3.3 Signal Generation Service

**Responsibilities**:
- AI/ML signal generation
- Real-time signal distribution
- Signal performance tracking
- Subscription management

**API Endpoints**:
```
GET  /signals/live
POST /signals/subscribe
GET  /signals/history
GET  /signals/performance
WebSocket: /ws/signals/stream
```

**Database Schema**:
```sql
-- Primary: InfluxDB + Redis
signals: timestamp, symbol, action, confidence, price_target
subscriptions: user_id, plan_id, active, expires_at
signal_performance: signal_id, actual_return, accuracy
```

**Scaling Strategy**:
- WebSocket clusters for real-time delivery
- Redis pub/sub for signal distribution
- Edge nodes for regional latency optimization

## 3.4 Trading Integration Service

**Responsibilities**:
- Exchange API integrations
- Order execution and management
- Portfolio tracking
- Risk management

**API Endpoints**:
```
POST /trading/orders
GET  /trading/portfolio
GET  /trading/positions
POST /trading/exchanges/connect
```

**Database Schema**:
```sql
-- Primary: PostgreSQL with Event Sourcing
orders: id, user_id, symbol, quantity, price, status, created_at
positions: user_id, symbol, quantity, avg_price, unrealized_pnl
exchange_accounts: user_id, exchange_id, api_key_hash, status
trade_events: event_id, order_id, event_type, data, timestamp
```

**Scaling Strategy**:
- Event sourcing for audit trails
- CQRS for read/write separation
- Circuit breakers for exchange API reliability

## 3.5 Payment Processing Service

**Responsibilities**:
- Course payments (₹24K-₹8L transactions)
- Subscription billing
- Refund processing
- Financial reconciliation

**API Endpoints**:
```
POST /payments/create
GET  /payments/{id}/status
POST /payments/refund
GET  /billing/invoices
```

**Database Schema**:
```sql
-- Primary: PostgreSQL with encryption
payments: id, user_id, amount, currency, status, gateway, created_at
subscriptions: id, user_id, plan_id, billing_cycle, next_billing
transactions: id, payment_id, gateway_txn_id, amount, fees
financial_records: id, type, amount, description, reconciled_at
```

**Scaling Strategy**:
- PCI DSS compliant infrastructure
- Encrypted sensitive data at rest
- Multiple payment gateway integration

---
