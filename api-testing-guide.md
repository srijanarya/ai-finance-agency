# AI Finance Agency API Testing Guide

## Available Services and Endpoints

### 1. API Gateway (Port 3000)
- **Health Check**: `GET http://localhost:3000/health`
- **Routes**: All service requests are proxied through the gateway

### 2. Authentication & User Management
Base URL: `http://localhost:3000/auth/*`

**Public Endpoints (No Auth Required):**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

**Protected Endpoints:**
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update profile
- `GET /users/subscription` - Get subscription status
- `POST /users/subscription/upgrade` - Upgrade subscription

### 3. Trading Service
Base URL: `http://localhost:3000/trading/*`

**Endpoints (Requires READ_TRADING permission):**
- `GET /trading/portfolio` - Get portfolio overview
- `GET /trading/positions` - Get current positions
- `GET /trading/history` - Get trading history
- `POST /trading/orders` - Place new order (Requires EXECUTE_TRADES)
- `PUT /trading/orders/:id` - Modify order
- `DELETE /trading/orders/:id` - Cancel order

### 4. Signals Service
Base URL: `http://localhost:3000/signals/*`

**Endpoints (Requires READ_SIGNALS permission):**
- `GET /signals/latest` - Get latest signals
- `GET /signals/history` - Get signal history
- `GET /signals/performance` - Get signal performance
- `GET /signals/premium/*` - Premium signals (Requires READ_PREMIUM_SIGNALS)
- `GET /signals/vip/*` - VIP signals (Requires READ_VIP_SIGNALS)

### 5. Payment Service
Base URL: `http://localhost:3000/payments/*`

**Endpoints (Requires MAKE_PAYMENTS permission):**
- `POST /payments/create-session` - Create payment session
- `GET /payments/history` - Get payment history
- `POST /payments/subscription` - Manage subscription
- `POST /payments/webhook` - Stripe webhook endpoint

### 6. Education Service
Base URL: `http://localhost:3000/education/*`

**Endpoints (Requires READ_EDUCATION permission):**
- `GET /education/courses` - List available courses
- `GET /education/courses/:id` - Get course details
- `GET /education/progress` - Get learning progress
- `GET /education/premium/*` - Premium content (Requires READ_PREMIUM_EDUCATION)

## Testing Commands

### 1. Register a New User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Trader"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Get Trading Signals (with JWT)
```bash
TOKEN="your-jwt-token-here"
curl -X GET http://localhost:3000/signals/latest \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Place a Trade Order
```bash
TOKEN="your-jwt-token-here"
curl -X POST http://localhost:3000/trading/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "quantity": 10,
    "orderType": "market",
    "side": "buy"
  }'
```

### 5. Create Payment Session
```bash
TOKEN="your-jwt-token-here"
curl -X POST http://localhost:3000/payments/create-session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_premium_monthly",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

## Service Status Check Script

```bash
#!/bin/bash
# Check all service health endpoints

echo "Checking AI Finance Agency Services..."
echo "======================================="

# Direct service checks
services=(
  "3000:API Gateway"
  "3002:User Management"
  "3001:Payment"
  "3004:Trading"
  "3003:Signals"
  "3007:Risk Management"
  "3006:Education"
  "3005:Notification"
  "3008:Market Data"
)

for service in "${services[@]}"; do
  IFS=':' read -r port name <<< "$service"
  echo -n "$name (port $port): "
  if curl -s http://localhost:$port/health > /dev/null 2>&1; then
    echo "✅ Running"
  else
    echo "❌ Not responding"
  fi
done
```

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**: Ensure PostgreSQL is running and users are created
2. **Redis Connection Refused**: Check if Redis container is running
3. **JWT Authentication Failed**: Ensure JWT_SECRET is set in environment
4. **Rate Limit Exceeded**: Wait or adjust rate limit settings

### Check Service Logs:
```bash
tail -f logs/api-gateway.log
tail -f logs/user-management.log
tail -f logs/trading.log
tail -f logs/payment.log
tail -f logs/signals.log
```

## Next Steps

1. Register a test user account
2. Login to get JWT token
3. Use token to access protected endpoints
4. Monitor services in Consul UI: http://localhost:8500
5. Check message queues in RabbitMQ: http://localhost:15672
6. Build custom trading strategies using the Trading API
7. Generate AI signals using the Signals Service