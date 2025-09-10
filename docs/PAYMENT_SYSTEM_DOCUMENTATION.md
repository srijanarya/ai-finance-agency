# AI Finance Agency - Payment System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security & Compliance](#security--compliance)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Configuration](#configuration)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
10. [Appendices](#appendices)

---

## Overview

The AI Finance Agency Payment System is a comprehensive, secure, and PCI DSS compliant payment processing platform designed for fintech applications. It supports multiple payment gateways, real-time transaction processing, and advanced security features.

### Key Features

- 🔐 **PCI DSS Compliant** - Full compliance with payment card industry security standards
- 🏦 **Multi-Gateway Support** - Razorpay, Stripe, and Mock gateway integrations
- 💳 **Comprehensive Wallet System** - Real-time balance management with transaction history
- 🛡️ **Advanced Security** - Encryption, rate limiting, fraud detection, audit logging
- 📊 **Real-time Processing** - Instant transaction processing with webhook support
- 🔍 **KYC-based Limits** - Dynamic transaction limits based on user verification level
- 📱 **Mobile-ready APIs** - RESTful APIs optimized for web and mobile applications
- 🚨 **Fraud Detection** - ML-powered suspicious activity detection

### Supported Payment Methods

| Payment Method     | Razorpay | Stripe | Mock | Status |
| ------------------ | -------- | ------ | ---- | ------ |
| Credit/Debit Cards | ✅       | ✅     | ✅   | Live   |
| UPI                | ✅       | ❌     | ✅   | Live   |
| Net Banking        | ✅       | ❌     | ✅   | Live   |
| Digital Wallets    | ✅       | ✅     | ✅   | Live   |
| Bank Transfers     | ✅       | ✅     | ✅   | Live   |

---

## Architecture

### System Architecture

```mermaid
graph TB
    Client[Client Application] --> API[Payment API Layer]
    API --> Auth[Authentication Service]
    API --> Security[Security Service]
    API --> Wallet[Wallet Service]
    API --> Transaction[Transaction Service]
    API --> Gateway[Payment Gateway Service]

    Gateway --> Razorpay[Razorpay Gateway]
    Gateway --> Stripe[Stripe Gateway]
    Gateway --> Mock[Mock Gateway]

    Transaction --> DB[(Database)]
    Wallet --> DB
    Security --> Encryption[Encryption Service]
    Security --> Audit[Audit Logger]

    Webhooks[Webhook Handlers] --> Transaction
    Webhooks --> Wallet
```

### Component Overview

#### Core Services

1. **Wallet Service** (`app/services/wallet_service.py`)
   - Balance management (credit, debit, lock, unlock)
   - Transaction history
   - KYC-based limit enforcement

2. **Transaction Service** (`app/services/transaction_service.py`)
   - Deposit/withdrawal processing
   - Refund handling
   - Status management

3. **Payment Gateway Service** (`app/services/payment_gateway_service.py`)
   - Gateway abstraction layer
   - Multi-provider support
   - Failover handling

4. **Payment Security Service** (`app/services/payment_security_service.py`)
   - Data encryption/decryption
   - Rate limiting
   - Fraud detection
   - Audit logging

#### Data Models

```python
# Core payment models
- Wallet: User wallet with balance tracking
- PaymentMethod: Stored payment instruments
- Transaction: Payment transaction records
- PaymentWebhook: Webhook event tracking
- WithdrawalRequest: Withdrawal processing
```

### Database Schema

```sql
-- Core wallet table
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.00,
    locked_balance DECIMAL(12,2) DEFAULT 0.00,
    daily_limit_used DECIMAL(12,2) DEFAULT 0.00,
    monthly_limit_used DECIMAL(12,2) DEFAULT 0.00,
    last_daily_reset DATE,
    last_monthly_reset DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transaction records
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    wallet_id UUID,
    amount DECIMAL(12,2) NOT NULL,
    fee DECIMAL(12,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    type transaction_type NOT NULL,
    category transaction_category NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    description TEXT,
    reference_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

---

## Security & Compliance

### PCI DSS Compliance

The payment system implements comprehensive PCI DSS compliance measures:

#### Data Protection

- **Encryption at Rest**: All sensitive payment data encrypted using AES-256
- **Encryption in Transit**: HTTPS/TLS 1.3 for all API communications
- **Data Masking**: Card numbers masked in logs and responses
- **Secure Storage**: CVV never stored, card tokens used instead

#### Access Control

- **Role-based Access**: User permissions based on roles and KYC levels
- **Rate Limiting**: API rate limiting to prevent abuse
- **IP Whitelisting**: Webhook source validation
- **Session Management**: Secure JWT token handling

#### Monitoring & Logging

- **Audit Trail**: Complete audit log for all payment activities
- **Security Events**: Real-time security event logging
- **Anomaly Detection**: ML-powered fraud detection
- **Data Integrity**: Hash-based data integrity verification

### Security Features

#### Encryption Service

```python
# Encrypt sensitive data
encrypted_card = payment_security_service.encrypt_sensitive_data("4111111111111111")

# Decrypt when needed
decrypted_card = payment_security_service.decrypt_sensitive_data(encrypted_card)

# Mask for display
masked_card = payment_security_service.mask_card_number("4111111111111111")
# Output: "****-****-****-1111"
```

#### Rate Limiting

```python
# Check rate limit
if not payment_security_service.check_rate_limit(user_id, limit=5, window_minutes=15):
    raise HTTPException(status_code=429, detail="Rate limit exceeded")
```

#### Fraud Detection

```python
# Detect suspicious activity
indicators = payment_security_service.detect_suspicious_activity(
    db=db, user_id=user_id, transaction_data={"amount": 1000, "type": "deposit"}
)
# Returns: ["rapid_successive_transactions", "large_amount"]
```

---

## API Reference

### Authentication

All payment APIs require authentication via JWT tokens:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Wallet Operations

#### Get Wallet Balance

```http
GET /api/v1/payments/wallet/balance
```

**Response:**

```json
{
  "balance": "1500.00",
  "locked_balance": "200.00",
  "available_balance": "1300.00",
  "daily_limit": "10000.00",
  "daily_used": "500.00",
  "daily_remaining": "9500.00",
  "monthly_limit": "100000.00",
  "monthly_used": "1500.00",
  "monthly_remaining": "98500.00"
}
```

#### Get Transaction History

```http
GET /api/v1/payments/wallet/transactions?skip=0&limit=20&type=DEPOSIT&status=COMPLETED
```

**Response:**

```json
{
  "transactions": [
    {
      "id": "txn_123",
      "amount": "500.00",
      "type": "DEPOSIT",
      "status": "COMPLETED",
      "description": "Wallet top-up",
      "created_at": "2024-01-15T10:30:00Z",
      "completed_at": "2024-01-15T10:30:15Z"
    }
  ],
  "total": 1,
  "has_more": false
}
```

### Deposit Operations

#### Initiate Deposit

```http
POST /api/v1/payments/deposits/initiate
```

**Request:**

```json
{
  "amount": 1000.0,
  "payment_method_id": "pm_abc123",
  "gateway": "razorpay",
  "description": "Wallet top-up"
}
```

**Response:**

```json
{
  "success": true,
  "transaction_id": "txn_def456",
  "order_id": "order_razorpay_789",
  "amount": "1000.00",
  "currency": "INR",
  "checkout_url": "https://checkout.razorpay.com/v1/checkout.js",
  "key": "rzp_test_key",
  "gateway": "RAZORPAY"
}
```

#### Confirm Deposit

```http
POST /api/v1/payments/deposits/confirm
```

**Request:**

```json
{
  "transaction_id": "txn_def456",
  "gateway_payment_id": "pay_razorpay_123",
  "gateway_data": {
    "razorpay_order_id": "order_razorpay_789",
    "razorpay_signature": "signature_hash"
  }
}
```

### Withdrawal Operations

#### Initiate Withdrawal

```http
POST /api/v1/payments/withdrawals/initiate
```

**Request:**

```json
{
  "amount": 500.0,
  "payment_method_id": "pm_abc123",
  "description": "Cash withdrawal"
}
```

#### Get Withdrawal Status

```http
GET /api/v1/payments/withdrawals/{withdrawal_id}/status
```

### Payment Methods

#### Add Payment Method

```http
POST /api/v1/payments/methods
```

**Request:**

```json
{
  "type": "CARD",
  "gateway": "razorpay",
  "token": "card_token_from_gateway",
  "metadata": {
    "last_four": "1234",
    "brand": "VISA",
    "expiry_month": 12,
    "expiry_year": 2025
  }
}
```

#### List Payment Methods

```http
GET /api/v1/payments/methods
```

### Webhooks

#### Payment Gateway Webhooks

```http
POST /webhooks/razorpay
POST /webhooks/stripe
POST /webhooks/mock
```

Webhook endpoints automatically process payment events and update transaction statuses.

---

## Integration Guide

### Frontend Integration

#### Razorpay Integration

```javascript
// Initialize Razorpay checkout
const options = {
  key: response.key,
  amount: response.amount * 100, // Convert to paise
  order_id: response.order_id,
  handler: function (response) {
    // Confirm payment
    confirmPayment({
      transaction_id: transaction_id,
      gateway_payment_id: response.razorpay_payment_id,
      gateway_data: {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      },
    });
  },
};

const rzp = new Razorpay(options);
rzp.open();
```

#### React Hook Example

```javascript
import { useState, useCallback } from "react";

export const usePayments = () => {
  const [loading, setLoading] = useState(false);

  const initiateDeposit = useCallback(async (amount, paymentMethodId) => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/payments/deposits/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          amount,
          payment_method_id: paymentMethodId,
          gateway: "razorpay",
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { initiateDeposit, loading };
};
```

### Mobile Integration

#### Flutter Example

```dart
class PaymentService {
  static const String baseUrl = 'https://api.your-domain.com';

  Future<PaymentResponse> initiateDeposit({
    required double amount,
    required String paymentMethodId,
    String gateway = 'razorpay',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/payments/deposits/initiate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${await getAuthToken()}',
      },
      body: jsonEncode({
        'amount': amount,
        'payment_method_id': paymentMethodId,
        'gateway': gateway,
      }),
    );

    if (response.statusCode == 200) {
      return PaymentResponse.fromJson(jsonDecode(response.body));
    } else {
      throw PaymentException(response.body);
    }
  }
}
```

### Backend Integration

#### Python SDK Example

```python
import requests
from typing import Dict, Any

class PaymentClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def initiate_deposit(self, user_id: str, amount: float,
                        payment_method_id: str) -> Dict[str, Any]:
        response = self.session.post(
            f'{self.base_url}/api/v1/payments/deposits/initiate',
            json={
                'amount': amount,
                'payment_method_id': payment_method_id,
                'gateway': 'razorpay'
            }
        )
        response.raise_for_status()
        return response.json()

    def get_wallet_balance(self, user_id: str) -> Dict[str, Any]:
        response = self.session.get(
            f'{self.base_url}/api/v1/payments/wallet/balance'
        )
        response.raise_for_status()
        return response.json()
```

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/ai_finance_agency
REDIS_URL=redis://localhost:6379

# Payment Gateways
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=webhook_secret

STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
ENCRYPTION_PASSWORD=your_secure_encryption_password
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MINUTES=15

# Logging
LOG_LEVEL=INFO
AUDIT_LOG_FILE=pci_audit.log
```

### Gateway Configuration

#### Razorpay Setup

```python
# Configure Razorpay
payment_gateway_service.configure_razorpay(
    api_key=os.getenv('RAZORPAY_KEY_ID'),
    api_secret=os.getenv('RAZORPAY_KEY_SECRET'),
    webhook_secret=os.getenv('RAZORPAY_WEBHOOK_SECRET')
)
```

#### Stripe Setup

```python
# Configure Stripe
payment_gateway_service.configure_stripe(
    api_key=os.getenv('STRIPE_SECRET_KEY'),
    webhook_secret=os.getenv('STRIPE_WEBHOOK_SECRET')
)
```

### KYC-based Limits Configuration

```python
# Transaction limits by KYC level
TRANSACTION_LIMITS = {
    'BASIC': {
        'daily_limit': Decimal('10000'),      # ₹10,000
        'monthly_limit': Decimal('100000'),   # ₹1,00,000
        'single_transaction': Decimal('5000') # ₹5,000
    },
    'INTERMEDIATE': {
        'daily_limit': Decimal('50000'),      # ₹50,000
        'monthly_limit': Decimal('1000000'),  # ₹10,00,000
        'single_transaction': Decimal('25000') # ₹25,000
    },
    'ADVANCED': {
        'daily_limit': Decimal('500000'),     # ₹5,00,000
        'monthly_limit': Decimal('5000000'),  # ₹50,00,000
        'single_transaction': Decimal('100000') # ₹1,00,000
    }
}
```

---

## Testing

### Running Tests

```bash
# Run all payment tests
python run_payment_tests.py

# Run specific test categories
python run_payment_tests.py --category security
python run_payment_tests.py --category integration

# Run full test suite with coverage
python run_payment_tests.py --full
```

### Test Categories

1. **Unit Tests** - Core service functionality
2. **Security Tests** - Encryption, validation, compliance
3. **Integration Tests** - End-to-end workflows
4. **Performance Tests** - Load and stress testing
5. **API Tests** - Endpoint validation

### Mock Testing

The system includes comprehensive mock testing capabilities:

```python
# Mock gateway for testing
payment_gateway_service.set_default_gateway(PaymentGateway.MOCK)

# Mock successful payment
mock_payment_success = {
    'success': True,
    'payment_id': 'mock_payment_123',
    'status': 'captured'
}
```

---

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Payment gateway credentials configured
- [ ] Webhook endpoints registered
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup systems tested
- [ ] Security audit completed
- [ ] Load testing performed

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
        - name: payment-service
          image: ai-finance-agency/payment-service:latest
          ports:
            - containerPort: 8000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: payment-secrets
                  key: database-url
```

### Health Checks

```python
# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": await check_database_health(),
        "gateways": await check_gateway_health()
    }
```

---

## Monitoring & Troubleshooting

### Monitoring

#### Key Metrics

- Transaction success rate
- Average processing time
- Gateway response times
- Error rates by endpoint
- Security events
- Wallet balance accuracy

#### Alerting

```python
# Critical alerts
- Payment gateway failures
- Database connection issues
- Security breaches
- High error rates
- Performance degradation
```

### Logging

#### Audit Logs

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event_type": "deposit_initiated",
  "user_id": "user_123",
  "transaction_id": "txn_456",
  "amount": 1000.0,
  "currency": "INR",
  "gateway": "razorpay",
  "ip_address": "192.168.1.100",
  "audit_hash": "sha256_hash"
}
```

#### Security Logs

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event_type": "suspicious_activity",
  "user_id": "user_123",
  "indicators": ["rapid_transactions", "large_amount"],
  "ip_address": "192.168.1.100",
  "action_taken": "additional_verification_required"
}
```

### Common Issues & Solutions

#### 1. Payment Gateway Timeout

**Symptoms:** 504 Gateway Timeout errors
**Solution:**

- Check gateway status
- Implement retry logic
- Use backup gateway

#### 2. Webhook Processing Failures

**Symptoms:** Transactions stuck in pending state
**Solution:**

- Verify webhook signatures
- Check endpoint accessibility
- Review webhook logs

#### 3. Rate Limit Exceeded

**Symptoms:** 429 Too Many Requests
**Solution:**

- Implement exponential backoff
- Review rate limit configuration
- Monitor user behavior

#### 4. Balance Discrepancies

**Symptoms:** Wallet balance doesn't match transaction history
**Solution:**

- Run balance reconciliation
- Check for concurrent transaction issues
- Review audit logs

---

## Appendices

### Appendix A: Error Codes

| Code    | Description                  | Action                                     |
| ------- | ---------------------------- | ------------------------------------------ |
| PAY_001 | Invalid payment amount       | Check amount format and limits             |
| PAY_002 | Insufficient wallet balance  | Top up wallet or reduce amount             |
| PAY_003 | Payment method not found     | Add valid payment method                   |
| PAY_004 | Gateway processing error     | Try again or use different gateway         |
| PAY_005 | Transaction limit exceeded   | Increase KYC level or wait for limit reset |
| PAY_006 | Suspicious activity detected | Complete additional verification           |

### Appendix B: Webhook Event Types

#### Razorpay Events

- `payment.captured` - Successful payment
- `payment.failed` - Failed payment
- `payment.authorized` - Payment authorized
- `refund.processed` - Refund completed

#### Stripe Events

- `payment_intent.succeeded` - Successful payment
- `payment_intent.payment_failed` - Failed payment
- `charge.dispute.created` - Chargeback initiated

### Appendix C: Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

### Appendix D: API Rate Limits

| Endpoint                | Rate Limit | Window     |
| ----------------------- | ---------- | ---------- |
| `/wallet/balance`       | 100/min    | 1 minute   |
| `/deposits/initiate`    | 5/min      | 5 minutes  |
| `/withdrawals/initiate` | 3/min      | 10 minutes |
| `/transactions`         | 50/min     | 1 minute   |

---

## Support & Contact

For technical support and questions:

- **Documentation**: [Internal Wiki]
- **Issue Tracking**: [JIRA/GitHub Issues]
- **Emergency Contact**: [On-call Engineer]
- **Security Issues**: [Security Team Email]

---

_Last Updated: January 2024_  
_Version: 1.0.0_  
_Document Classification: Internal Use_
