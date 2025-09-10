# Story 003.1: Payment Integration & Wallet System

---

## **Story ID**: TREUM-003.1
**Epic**: 003 - Financial Services & Transactions  
**Sprint**: 3  
**Priority**: P0 - CRITICAL  
**Points**: 21  
**Type**: Feature  
**Component**: Payment Service  

---

## User Story
**AS A** verified user of the TREUM platform  
**I WANT** to add funds to my wallet and make secure payments  
**SO THAT** I can subscribe to services, purchase signals, and manage my finances  

---

## Acceptance Criteria

### Functional Requirements
- [ ] User can view wallet balance and transaction history
- [ ] Add money via UPI, Net Banking, Cards, Wallets
- [ ] Support for INR currency with 2 decimal precision
- [ ] Minimum deposit: ₹100, Maximum: ₹10,00,000
- [ ] Instant wallet top-up confirmation
- [ ] Transaction history with filters (date, type, status)
- [ ] Withdrawal to verified bank account
- [ ] Auto-refund for failed transactions
- [ ] Payment receipt generation (PDF)
- [ ] GST invoice generation for business accounts

### Payment Methods
- [ ] UPI (PhonePe, GPay, Paytm)
- [ ] Debit/Credit Cards (Visa, Mastercard, RuPay)
- [ ] Net Banking (Top 20 Indian banks)
- [ ] Wallet integration (Paytm, PhonePe)
- [ ] NEFT/RTGS for large transactions
- [ ] International cards with 3D Secure

### Security Requirements
- [ ] PCI DSS compliance for card data
- [ ] Tokenization of payment methods
- [ ] 3D Secure authentication for cards
- [ ] OTP verification for transactions > ₹5000
- [ ] IP-based fraud detection
- [ ] Rate limiting (10 transactions per hour)
- [ ] Encryption of sensitive payment data
- [ ] Webhook signature verification

### Compliance Requirements
- [ ] RBI payment guidelines compliance
- [ ] KYC-based transaction limits
- [ ] GST calculation and reporting
- [ ] TDS deduction for applicable transactions
- [ ] Payment audit trail for 7 years
- [ ] Suspicious transaction reporting

---

## Technical Implementation

### Database Schema

```sql
-- User wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Balance information
    balance DECIMAL(12, 2) DEFAULT 0.00,
    locked_balance DECIMAL(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Wallet status
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE,
    frozen_reason TEXT,
    frozen_at TIMESTAMP,
    
    -- Limits based on KYC
    daily_limit DECIMAL(12, 2),
    monthly_limit DECIMAL(12, 2),
    daily_spent DECIMAL(12, 2) DEFAULT 0.00,
    monthly_spent DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Method details
    method_type VARCHAR(20) NOT NULL, -- 'card', 'upi', 'netbanking', 'wallet'
    provider VARCHAR(50), -- 'visa', 'mastercard', 'phonepe', 'hdfc'
    
    -- Tokenized data
    token VARCHAR(255) UNIQUE,
    last_four VARCHAR(4),
    display_name VARCHAR(100),
    
    -- Card specific (encrypted)
    card_brand VARCHAR(20),
    card_expiry VARCHAR(7), -- MM/YYYY
    card_holder_name VARCHAR(100),
    
    -- UPI specific
    upi_id VARCHAR(100),
    
    -- Bank specific
    bank_name VARCHAR(100),
    account_number_masked VARCHAR(20),
    
    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),
    
    -- Transaction details
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'refund'
    category VARCHAR(50), -- 'deposit', 'withdrawal', 'subscription', 'purchase'
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Payment details
    payment_method_id UUID REFERENCES payment_methods(id),
    gateway VARCHAR(50), -- 'razorpay', 'stripe', 'paytm'
    gateway_transaction_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'success', 'failed'
    status_message TEXT,
    
    -- Related transaction (for refunds)
    parent_transaction_id UUID REFERENCES transactions(id),
    
    -- Fees and charges
    gateway_fee DECIMAL(10, 2) DEFAULT 0.00,
    gst_amount DECIMAL(10, 2) DEFAULT 0.00,
    tds_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(12, 2),
    
    -- Additional info
    description TEXT,
    metadata JSONB,
    
    -- Timestamps
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment webhooks table
CREATE TABLE payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Webhook details
    gateway VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(255) UNIQUE,
    
    -- Payload
    headers JSONB,
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    
    -- Processing
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Related transaction
    transaction_id UUID REFERENCES transactions(id),
    
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawal requests table
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),
    
    -- Withdrawal details
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Bank details
    bank_account_id UUID REFERENCES payment_methods(id),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(11),
    account_holder_name VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'processing', 'completed', 'rejected'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejected_reason TEXT,
    
    -- Transaction reference
    transaction_id UUID REFERENCES transactions(id),
    utr_number VARCHAR(50), -- Bank reference number
    
    -- Processing
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

```typescript
// Wallet Management
GET  /api/v1/wallet                     // Get wallet details
GET  /api/v1/wallet/transactions        // Transaction history
POST /api/v1/wallet/transactions/export // Export transactions

// Payment Methods
GET  /api/v1/payment-methods           // List payment methods
POST /api/v1/payment-methods           // Add payment method
PUT  /api/v1/payment-methods/{id}      // Update payment method
DELETE /api/v1/payment-methods/{id}    // Remove payment method
POST /api/v1/payment-methods/{id}/verify // Verify payment method

// Deposits
POST /api/v1/payments/deposit/initiate  // Initiate deposit
POST /api/v1/payments/deposit/confirm   // Confirm deposit
GET  /api/v1/payments/deposit/{id}      // Get deposit status

// Withdrawals
POST /api/v1/payments/withdraw/request  // Request withdrawal
GET  /api/v1/payments/withdraw/{id}     // Get withdrawal status
POST /api/v1/payments/withdraw/{id}/cancel // Cancel withdrawal

// Webhooks
POST /api/v1/webhooks/razorpay         // Razorpay webhook
POST /api/v1/webhooks/stripe           // Stripe webhook

// Receipts
GET  /api/v1/receipts/{transaction_id}  // Get receipt PDF
GET  /api/v1/invoices/{transaction_id}  // Get GST invoice
```

### Request/Response Examples

#### Initiate Deposit
```json
POST /api/v1/payments/deposit/initiate
{
  "amount": 5000.00,
  "payment_method_id": "pm_123",
  "description": "Wallet top-up"
}

Response:
{
  "success": true,
  "data": {
    "transaction_id": "txn_abc123",
    "order_id": "order_xyz789",
    "amount": 5000.00,
    "gateway": "razorpay",
    "payment_url": "https://api.razorpay.com/v1/checkout/...",
    "expires_at": "2025-09-10T12:00:00Z"
  }
}
```

#### Wallet Details
```json
GET /api/v1/wallet

Response:
{
  "success": true,
  "data": {
    "wallet_id": "550e8400-e29b-41d4-a716",
    "balance": 25000.50,
    "locked_balance": 1000.00,
    "currency": "INR",
    "daily_limit": 100000.00,
    "monthly_limit": 1000000.00,
    "daily_spent": 5000.00,
    "monthly_spent": 50000.00,
    "is_active": true,
    "last_transaction": {
      "id": "txn_123",
      "type": "credit",
      "amount": 5000.00,
      "status": "success",
      "created_at": "2025-09-10T10:00:00Z"
    }
  }
}
```

---

## Implementation Tasks

### Backend Tasks
1. **Create payment models** (4 hours)
   - Wallet, PaymentMethod, Transaction models
   - Database migrations
   - Model relationships and constraints

2. **Payment gateway integration** (8 hours)
   - Razorpay SDK integration
   - Stripe SDK integration (backup)
   - Mock gateway for testing
   - Gateway abstraction layer

3. **Wallet service** (6 hours)
   - Balance management
   - Transaction processing
   - Lock/unlock mechanisms
   - Limit enforcement

4. **Payment processing service** (8 hours)
   - Payment initiation
   - Status tracking
   - Refund processing
   - Receipt generation

5. **Webhook handlers** (4 hours)
   - Signature verification
   - Event processing
   - Idempotency handling
   - Retry logic

6. **API endpoints** (6 hours)
   - CRUD operations
   - Payment flows
   - Transaction queries
   - Export functionality

### Security Tasks
1. **PCI compliance** (4 hours)
   - Card data tokenization
   - Encryption implementation
   - Security headers
   - Audit logging

2. **Fraud detection** (3 hours)
   - Velocity checks
   - IP validation
   - Unusual pattern detection
   - Blacklist management

### Testing Tasks
1. **Unit tests** (4 hours)
   - Service tests
   - Model tests
   - Utility tests

2. **Integration tests** (4 hours)
   - Payment flow tests
   - Webhook tests
   - Gateway mock tests

3. **Security tests** (2 hours)
   - PCI compliance validation
   - Penetration testing
   - Data encryption verification

---

## Definition of Done

### Functional Completeness
- [ ] All payment methods working
- [ ] Deposit and withdrawal flows complete
- [ ] Transaction history with filters
- [ ] Receipt/invoice generation working
- [ ] Webhook processing reliable

### Security & Compliance
- [ ] PCI DSS compliance verified
- [ ] Payment data encrypted
- [ ] Fraud detection active
- [ ] Audit trails complete
- [ ] RBI guidelines followed

### Performance
- [ ] Payment initiation <2 seconds
- [ ] Webhook processing <500ms
- [ ] Transaction history load <1 second
- [ ] 99.9% uptime for payment service

### Integration
- [ ] Razorpay integration tested
- [ ] Webhook reliability confirmed
- [ ] Refund mechanism working
- [ ] Receipt generation automated

---

## Dependencies
- **Requires**: KYC verification (TREUM-002.1)
- **Blocks**: Subscription management, Trading signals purchase
- **External**: Razorpay API access, GST API

---

## Risk Mitigation
1. **Payment gateway downtime**: Implement fallback gateway
2. **Transaction failures**: Automatic retry with exponential backoff
3. **Fraud attempts**: Real-time monitoring and alerts
4. **Regulatory changes**: Flexible compliance framework

---

## Notes
- Implement idempotency keys for all payment operations
- Use database transactions for atomic operations
- Consider implementing payment queue for high volume
- Plan for international payments in future sprint

---

## Estimation Breakdown
- Backend Development: 32 hours
- Security Implementation: 7 hours
- Testing: 10 hours
- Documentation: 3 hours
- Code Review: 3 hours
- **Total: 55 hours (21 story points)**