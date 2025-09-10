# TREUM AI Finance Agency - Comprehensive API Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)
7. [WebSocket APIs](#websocket-apis)
8. [Code Examples](#code-examples)
9. [SDKs](#sdks)
10. [Testing](#testing)
11. [Security](#security)
12. [Best Practices](#best-practices)

## Introduction

The TREUM AI Finance Agency API provides programmatic access to AI-powered trading signals, portfolio management, and market data. Built with REST principles and WebSocket support for real-time data.

### Base URLs

- **Production**: `https://api.treum.ai/api/v1`
- **Staging**: `https://staging-api.treum.ai/api/v1`
- **WebSocket**: `wss://api.treum.ai/ws`

### API Version

Current Version: `v1`

### Request/Response Format

- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Charset**: `UTF-8`

## Getting Started

### Quick Start Guide

1. **Sign Up**: Create an account at [https://treum.ai/signup](https://treum.ai/signup)
2. **Get API Key**: Navigate to Dashboard → API Keys → Generate New Key
3. **Install SDK**: Choose your preferred language SDK
4. **Test Connection**: Make a test call to verify setup

### Test API Call

```bash
curl -X GET https://api.treum.ai/api/v1/health \
  -H "Authorization: Bearer your_api_key"
```

Response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### API Environments

| Environment | Base URL                              | Purpose                |
| ----------- | ------------------------------------- | ---------------------- |
| Sandbox     | `https://sandbox-api.treum.ai/api/v1` | Testing with mock data |
| Staging     | `https://staging-api.treum.ai/api/v1` | Pre-production testing |
| Production  | `https://api.treum.ai/api/v1`         | Live trading           |

### API Key Management

- **Key Rotation**: Rotate keys every 90 days
- **Key Permissions**: Set granular permissions per key
- **IP Whitelisting**: Restrict key usage to specific IPs
- **Multiple Keys**: Create separate keys for different applications

## Authentication

### JWT Bearer Token

All API requests require authentication using JWT Bearer tokens.

#### Obtaining a Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

#### Using the Token

Include the token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Refreshing Tokens

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## API Endpoints

### 1. Authentication & User Management

#### Register User

```http
POST /api/v1/auth/register

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+919876543210"
}
```

#### Get User Profile

```http
GET /api/v1/users/profile

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "kyc_verified": true,
  "subscription_tier": "premium",
  "created_at": "2025-01-15T10:00:00Z"
}
```

#### Update Profile

```http
PUT /api/v1/users/profile

{
  "phone": "+919876543211",
  "trading_experience": "intermediate",
  "risk_profile": "moderate"
}
```

### 2. AI Trading Signals

#### Generate Signals

```http
POST /api/v1/ai-signals/generate

{
  "symbols": ["RELIANCE", "TCS", "INFY"],
  "signal_type": "intraday",
  "risk_level": "moderate",
  "use_ensemble": true
}

Response:
{
  "signals": [
    {
      "signal_id": "sig_123",
      "symbol": "RELIANCE",
      "signal_type": "BUY",
      "entry_price": 2500.50,
      "target_price": 2550.00,
      "stop_loss": 2475.00,
      "confidence": 0.85,
      "ai_models": ["gpt4", "claude3", "lstm"],
      "rationale": "Technical breakout with volume support",
      "generated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Signal History

```http
GET /api/v1/ai-signals/history?limit=20&status=executed

Response:
{
  "signals": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "has_next": true
  }
}
```

#### Get Signal Performance

```http
GET /api/v1/ai-signals/{signal_id}/performance

Response:
{
  "signal_id": "sig_123",
  "symbol": "RELIANCE",
  "entry_price": 2500.50,
  "current_price": 2545.75,
  "pnl": 452.50,
  "pnl_percentage": 1.81,
  "status": "active",
  "execution_time": "2025-01-15T10:31:00Z"
}
```

### 3. Portfolio Management

#### Get Portfolio Summary

```http
GET /api/v1/dashboard/portfolio/summary

Response:
{
  "total_value": 1000000.00,
  "total_invested": 950000.00,
  "current_pnl": 50000.00,
  "pnl_percentage": 5.26,
  "positions_count": 12,
  "cash_balance": 200000.00,
  "margin_available": 500000.00
}
```

#### Get Positions

```http
GET /api/v1/trading/positions

Response:
{
  "positions": [
    {
      "symbol": "RELIANCE",
      "quantity": 100,
      "average_price": 2480.00,
      "current_price": 2545.75,
      "pnl": 6575.00,
      "pnl_percentage": 2.65
    }
  ]
}
```

#### Execute Signal

```http
POST /api/v1/dashboard/signals/{signal_id}/execute

{
  "quantity": 100,
  "broker": "zerodha"
}

Response:
{
  "status": "success",
  "order_id": "ORD123456",
  "execution_price": 2501.25,
  "timestamp": "2025-01-15T10:32:00Z"
}
```

### 4. Trading Operations (Zerodha Kite)

#### Place Order

```http
POST /api/v1/trading/orders/place

{
  "symbol": "RELIANCE",
  "quantity": 100,
  "price": 2500.00,
  "order_type": "LIMIT",
  "side": "BUY",
  "product": "CNC",
  "validity": "DAY"
}

Response:
{
  "order_id": "221115000000123",
  "status": "success",
  "message": "Order placed successfully"
}
```

#### Modify Order

```http
PUT /api/v1/trading/orders/{order_id}/modify

{
  "quantity": 150,
  "price": 2495.00
}
```

#### Cancel Order

```http
DELETE /api/v1/trading/orders/{order_id}/cancel

Response:
{
  "status": "success",
  "message": "Order cancelled successfully"
}
```

#### Get Orders

```http
GET /api/v1/trading/orders

Response:
{
  "orders": [
    {
      "order_id": "221115000000123",
      "symbol": "RELIANCE",
      "quantity": 100,
      "price": 2500.00,
      "status": "COMPLETE",
      "filled_quantity": 100,
      "average_price": 2500.50
    }
  ]
}
```

### 5. Market Data

#### Get Live Quotes

```http
GET /api/v1/market/quotes?symbols=RELIANCE,TCS,INFY

Response:
{
  "quotes": {
    "RELIANCE": {
      "last_price": 2545.75,
      "change": 25.50,
      "change_percent": 1.01,
      "volume": 2500000,
      "bid": 2545.50,
      "ask": 2546.00
    }
  }
}
```

#### Get Historical Data

```http
POST /api/v1/trading/historical

{
  "symbol": "RELIANCE",
  "from_date": "2025-01-01T00:00:00Z",
  "to_date": "2025-01-15T23:59:59Z",
  "interval": "day"
}

Response:
{
  "candles": [
    ["2025-01-01T09:15:00+05:30", 2500.0, 2550.0, 2490.0, 2540.0, 1000000]
  ]
}
```

#### Market Overview

```http
GET /api/v1/dashboard/market/overview

Response:
{
  "nifty_50": {
    "value": 21500.50,
    "change": 125.30,
    "change_percent": 0.59
  },
  "top_gainers": [...],
  "top_losers": [...],
  "market_sentiment": "bullish",
  "vix_level": 14.5
}
```

### 6. Subscription & Billing

#### Get Subscription Plans

```http
GET /api/v1/subscriptions/plans

Response:
{
  "plans": [
    {
      "id": "plan_premium",
      "name": "Premium Plan",
      "price": 2999.00,
      "billing_interval": "monthly",
      "features": {
        "daily_signals_limit": 50,
        "ai_models": ["gpt4", "claude3", "custom_lstm"],
        "backtesting": true,
        "real_time_alerts": true,
        "api_access": true
      }
    }
  ]
}
```

#### Create Subscription

```http
POST /api/v1/subscriptions/create

{
  "plan_id": "plan_premium",
  "payment_method_id": "pm_1234"
}

Response:
{
  "subscription_id": "sub_123",
  "status": "active",
  "current_period_end": "2025-02-15T00:00:00Z"
}
```

#### Get Usage

```http
GET /api/v1/subscriptions/usage

Response:
{
  "signals_consumed_today": 12,
  "signals_remaining": 38,
  "daily_limit": 50,
  "billing_cycle_end": "2025-02-15T00:00:00Z"
}
```

### 7. Compliance & KYC

#### Submit KYC

```http
POST /api/v1/compliance/kyc/submit

{
  "pan_number": "ABCDE1234F",
  "aadhaar_last_four": "1234",
  "bank_account_number": "1234567890",
  "bank_ifsc": "SBIN0001234",
  "income_range": "5-10_lakhs",
  "occupation": "salaried",
  "trading_experience": "2-5_years",
  "risk_profile": "moderate"
}

Response:
{
  "check_id": "chk_123",
  "status": "approved",
  "risk_score": 25,
  "risk_category": "low"
}
```

#### Check Trading Limits

```http
GET /api/v1/compliance/trading-limits

Response:
{
  "limits": {
    "daily_trade_limit": 1000000.00,
    "single_trade_limit": 200000.00,
    "margin_limit": 500000.00
  },
  "usage": {
    "daily_traded": 250000.00,
    "daily_remaining": 750000.00
  }
}
```

### 8. Dashboard & Analytics

#### Get Dashboard Overview

```http
GET /api/v1/dashboard/overview?time_range=month

Response:
{
  "portfolio_summary": {...},
  "recent_signals": [...],
  "analytics": {
    "total_signals": 150,
    "win_rate": 68.5,
    "sharpe_ratio": 1.85,
    "max_drawdown": -8.5
  },
  "risk_metrics": {
    "portfolio_beta": 1.2,
    "risk_score": 45,
    "risk_level": "medium"
  }
}
```

#### Get Performance Chart

```http
GET /api/v1/dashboard/analytics/chart?metric=portfolio_value&time_range=month

Response:
{
  "data": [
    {"date": "2025-01-01", "value": 1000000},
    {"date": "2025-01-02", "value": 1005000}
  ]
}
```

#### Export Data

```http
GET /api/v1/dashboard/export/csv?time_range=month

Response: CSV file download
```

## Rate Limiting

API rate limits are enforced per user:

| Endpoint Type      | Rate Limit  | Window   |
| ------------------ | ----------- | -------- |
| Authentication     | 5 requests  | 1 minute |
| Trading Operations | 20 requests | 1 minute |
| Signal Generation  | 10 requests | 1 minute |
| Market Data        | 60 requests | 1 minute |
| Dashboard          | 30 requests | 1 minute |

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642291200
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds for this trade",
    "details": {
      "required": 50000,
      "available": 30000
    }
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "request_id": "req_abc123"
}
```

### Common Error Codes

| HTTP Status | Error Code          | Description                       |
| ----------- | ------------------- | --------------------------------- |
| 400         | BAD_REQUEST         | Invalid request parameters        |
| 401         | UNAUTHORIZED        | Missing or invalid authentication |
| 403         | FORBIDDEN           | Insufficient permissions          |
| 404         | NOT_FOUND           | Resource not found                |
| 409         | CONFLICT            | Resource conflict (duplicate)     |
| 422         | VALIDATION_ERROR    | Request validation failed         |
| 429         | RATE_LIMITED        | Too many requests                 |
| 500         | INTERNAL_ERROR      | Server error                      |
| 503         | SERVICE_UNAVAILABLE | Service temporarily unavailable   |

## WebSocket APIs

### Connection

```javascript
const ws = new WebSocket("wss://api.treum.ai/ws");

// Authenticate
ws.send(
  JSON.stringify({
    type: "auth",
    token: "your_jwt_token",
  }),
);
```

### Subscribe to Market Data

```javascript
ws.send(
  JSON.stringify({
    type: "subscribe",
    channels: ["market_data"],
    symbols: ["RELIANCE", "TCS"],
  }),
);

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "market_update") {
    console.log("Price update:", data.symbol, data.price);
  }
};
```

### Subscribe to Signals

```javascript
ws.send(
  JSON.stringify({
    type: "subscribe",
    channels: ["signals"],
  }),
);

// Receive new signals
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "new_signal") {
    console.log("New signal:", data.signal);
  }
};
```

### Order Updates

```javascript
ws.send(
  JSON.stringify({
    type: "subscribe",
    channels: ["orders"],
  }),
);

// Receive order updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "order_update") {
    console.log("Order status:", data.order_id, data.status);
  }
};
```

## Code Examples

### Python

```python
import requests
import json

class TreumAPIClient:
    def __init__(self, api_key):
        self.base_url = "https://api.treum.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def generate_signals(self, symbols):
        url = f"{self.base_url}/ai-signals/generate"
        payload = {
            "symbols": symbols,
            "signal_type": "intraday",
            "use_ensemble": True
        }
        response = requests.post(url, headers=self.headers, json=payload)
        return response.json()

    def place_order(self, symbol, quantity, price, order_type="LIMIT"):
        url = f"{self.base_url}/trading/orders/place"
        payload = {
            "symbol": symbol,
            "quantity": quantity,
            "price": price,
            "order_type": order_type,
            "side": "BUY",
            "product": "CNC"
        }
        response = requests.post(url, headers=self.headers, json=payload)
        return response.json()

# Usage
client = TreumAPIClient("your_api_key")
signals = client.generate_signals(["RELIANCE", "TCS"])
print(signals)
```

### JavaScript/Node.js

```javascript
const axios = require("axios");

class TreumAPIClient {
  constructor(apiKey) {
    this.baseURL = "https://api.treum.ai/api/v1";
    this.headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async generateSignals(symbols) {
    try {
      const response = await axios.post(
        `${this.baseURL}/ai-signals/generate`,
        {
          symbols: symbols,
          signal_type: "intraday",
          use_ensemble: true,
        },
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      console.error("Error generating signals:", error);
      throw error;
    }
  }

  async placeOrder(symbol, quantity, price, orderType = "LIMIT") {
    try {
      const response = await axios.post(
        `${this.baseURL}/trading/orders/place`,
        {
          symbol: symbol,
          quantity: quantity,
          price: price,
          order_type: orderType,
          side: "BUY",
          product: "CNC",
        },
        { headers: this.headers },
      );
      return response.data;
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }
}

// Usage
const client = new TreumAPIClient("your_api_key");
client
  .generateSignals(["RELIANCE", "TCS"])
  .then((signals) => console.log(signals))
  .catch((error) => console.error(error));
```

### cURL

```bash
# Generate signals
curl -X POST https://api.treum.ai/api/v1/ai-signals/generate \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["RELIANCE", "TCS"],
    "signal_type": "intraday",
    "use_ensemble": true
  }'

# Place order
curl -X POST https://api.treum.ai/api/v1/trading/orders/place \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "quantity": 100,
    "price": 2500.00,
    "order_type": "LIMIT",
    "side": "BUY",
    "product": "CNC"
  }'

# Get portfolio
curl -X GET https://api.treum.ai/api/v1/dashboard/portfolio/summary \
  -H "Authorization: Bearer your_api_key"
```

## SDKs

Official SDKs are available for:

- **Python**: `pip install treum-api`
- **Node.js**: `npm install @treum/api-client`
- **Java**: Maven dependency available
- **Go**: `go get github.com/treum/go-client`

### Python SDK Example

```python
from treum import Client

# Initialize client
client = Client(api_key="your_api_key")

# Generate signals
signals = client.signals.generate(
    symbols=["RELIANCE", "TCS"],
    signal_type="intraday"
)

# Execute signal
order = client.trading.execute_signal(
    signal_id=signals[0].id,
    quantity=100
)

# Get portfolio
portfolio = client.portfolio.get_summary()
print(f"Total Value: ₹{portfolio.total_value}")
```

## Postman Collection

Download our Postman collection for easy API testing:
[Download Postman Collection](https://api.treum.ai/docs/postman-collection.json)

## API Changelog

### Version 1.0.0 (January 2025)

- Initial API release
- AI signal generation with multi-model ensemble
- Zerodha Kite integration
- Portfolio management
- Subscription billing
- Compliance framework

### Upcoming Features

- Options strategies API
- Algorithmic trading support
- Social trading features
- Advanced backtesting API
- Mobile SDK releases

## Support

### Documentation

- [Full Documentation](https://docs.treum.ai)
- [API Reference](https://api.treum.ai/docs)
- [Integration Guides](https://docs.treum.ai/guides)

### Contact

- **Email**: api-support@treum.ai
- **Discord**: [Join our Discord](https://discord.gg/treum)
- **GitHub**: [github.com/treum/api-examples](https://github.com/treum/api-examples)

### Status Page

Check API status: [status.treum.ai](https://status.treum.ai)

---

## Testing

### Test Mode

Use test mode to validate your integration without affecting real data:

```http
X-Test-Mode: true
```

Test mode features:

- Uses paper trading account
- No real money transactions
- Simulated order execution
- Test webhooks available

### Integration Testing

```python
# Python test example
import pytest
from treum import Client

class TestTreumAPI:
    def test_signal_generation(self):
        client = Client(api_key="test_key", test_mode=True)
        signals = client.signals.generate(
            symbols=["TEST_RELIANCE"],
            signal_type="intraday"
        )
        assert len(signals) > 0
        assert signals[0].confidence > 0.5
```

### Load Testing

Use our load testing endpoint to simulate high traffic:

```bash
curl -X POST https://api.treum.ai/api/v1/test/load \
  -H "Authorization: Bearer your_api_key" \
  -d '{"requests_per_second": 100, "duration": 60}'
```

## Security

### Security Best Practices

1. **API Key Security**
   - Never expose keys in client-side code
   - Store keys in environment variables
   - Use secrets management systems
   - Implement key rotation

2. **Request Signing**

   ```python
   import hmac
   import hashlib
   import time

   def sign_request(secret, method, path, body=""):
       timestamp = str(int(time.time()))
       message = f"{timestamp}{method}{path}{body}"
       signature = hmac.new(
           secret.encode(),
           message.encode(),
           hashlib.sha256
       ).hexdigest()
       return signature, timestamp
   ```

3. **Webhook Verification**

   ```javascript
   const crypto = require("crypto");

   function verifyWebhook(payload, signature, secret) {
     const hash = crypto
       .createHmac("sha256", secret)
       .update(payload)
       .digest("hex");
     return hash === signature;
   }
   ```

4. **Data Encryption**
   - All API traffic uses TLS 1.3
   - Sensitive data encrypted at rest
   - PII data masked in logs

### Compliance & Regulations

- **SEBI Compliance**: Registered investment advisor
- **Data Protection**: GDPR and Indian Data Protection Bill compliant
- **PCI DSS**: Level 1 certified for payment processing
- **ISO 27001**: Information security certified

## Best Practices

### 1. Pagination

Always use pagination for list endpoints:

```python
def get_all_signals(client):
    all_signals = []
    page = 1
    while True:
        response = client.signals.list(page=page, per_page=100)
        all_signals.extend(response.data)
        if not response.has_next:
            break
        page += 1
    return all_signals
```

### 2. Error Handling

Implement robust error handling with exponential backoff:

```javascript
async function apiCallWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        // Rate limited - wait and retry
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else if (error.status >= 500) {
        // Server error - retry
        if (i === maxRetries - 1) throw error;
      } else {
        // Client error - don't retry
        throw error;
      }
    }
  }
}
```

### 3. Webhook Processing

Process webhooks asynchronously:

```python
from queue import Queue
import threading

def webhook_handler(request):
    # Quick validation and queue
    if not verify_signature(request):
        return {"error": "Invalid signature"}, 401

    webhook_queue.put(request.json)
    return {"status": "queued"}, 200

def process_webhooks():
    while True:
        webhook = webhook_queue.get()
        # Process webhook
        handle_webhook(webhook)
        webhook_queue.task_done()
```

### 4. Caching Strategy

Implement intelligent caching:

```javascript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getCachedQuote(symbol) {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const quote = await api.getQuote(symbol);
  cache.set(symbol, {
    data: quote,
    timestamp: Date.now(),
  });
  return quote;
}
```

### 5. Monitoring & Logging

Structured logging for better observability:

```python
import logging
import json

logger = logging.getLogger('treum_api')

def log_api_call(method, endpoint, status, duration):
    logger.info(json.dumps({
        'type': 'api_call',
        'method': method,
        'endpoint': endpoint,
        'status': status,
        'duration_ms': duration,
        'timestamp': datetime.utcnow().isoformat()
    }))
```

### 6. Idempotency

Make requests idempotent using idempotency keys:

```bash
curl -X POST https://api.treum.ai/api/v1/trading/orders/place \
  -H "Authorization: Bearer your_api_key" \
  -H "Idempotency-Key: unique-request-id-123" \
  -d '{"symbol": "RELIANCE", "quantity": 100}'
```

### Performance Tips

1. **Batch Requests**: Use batch endpoints when available
2. **Compression**: Enable gzip compression
3. **Connection Pooling**: Reuse HTTP connections
4. **Async Processing**: Use async/await for non-blocking calls
5. **Field Filtering**: Request only needed fields

```python
# Example: Request specific fields
response = client.portfolio.get_summary(
    fields=['total_value', 'pnl', 'positions']
)
```

---

**Last Updated**: January 2025  
**API Version**: v1.0.0
**Documentation Version**: 2.0.0
