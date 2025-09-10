# Payment API Quick Reference

## Base URL

```
Production: https://api.ai-finance-agency.com
Staging: https://staging-api.ai-finance-agency.com
Local: http://localhost:8000
```

## Authentication

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Quick API Endpoints

### 🏦 Wallet Operations

#### Get Balance

```http
GET /api/v1/payments/wallet/balance
```

```json
{
  "balance": "1500.00",
  "available_balance": "1300.00",
  "locked_balance": "200.00"
}
```

#### Transaction History

```http
GET /api/v1/payments/wallet/transactions?limit=10&skip=0
```

### 💳 Payment Methods

#### List Methods

```http
GET /api/v1/payments/methods
```

#### Add Method

```http
POST /api/v1/payments/methods
{
  "type": "CARD",
  "gateway": "razorpay",
  "token": "card_token_123"
}
```

### 💰 Deposits

#### Initiate Deposit

```http
POST /api/v1/payments/deposits/initiate
{
  "amount": 1000.0,
  "gateway": "razorpay",
  "description": "Wallet top-up"
}
```

#### Confirm Deposit

```http
POST /api/v1/payments/deposits/confirm
{
  "transaction_id": "txn_123",
  "gateway_payment_id": "pay_abc456"
}
```

### 💸 Withdrawals

#### Initiate Withdrawal

```http
POST /api/v1/payments/withdrawals/initiate
{
  "amount": 500.0,
  "payment_method_id": "pm_123",
  "description": "Cash withdrawal"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error description",
  "error_code": "PAY_001",
  "details": { ... }
}
```

## Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | Success      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 429  | Rate Limited |
| 500  | Server Error |

## Rate Limits

| Endpoint    | Limit   |
| ----------- | ------- |
| Balance     | 100/min |
| Deposits    | 5/5min  |
| Withdrawals | 3/10min |

## Testing

### Mock Gateway

```json
{
  "gateway": "mock",
  "success_rate": 0.9
}
```

### Test Cards

```
Visa: 4111111111111111
Mastercard: 5555555555554444
Amex: 378282246310005
```

## SDK Examples

### JavaScript

```javascript
const payment = await fetch("/api/v1/payments/deposits/initiate", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ amount: 1000, gateway: "razorpay" }),
});
```

### Python

```python
response = requests.post(
  'https://api.ai-finance-agency.com/api/v1/payments/deposits/initiate',
  headers={'Authorization': f'Bearer {token}'},
  json={'amount': 1000, 'gateway': 'razorpay'}
)
```

### cURL

```bash
curl -X POST https://api.ai-finance-agency.com/api/v1/payments/deposits/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "gateway": "razorpay"}'
```
