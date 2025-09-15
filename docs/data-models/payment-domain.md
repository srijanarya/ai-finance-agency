# Payment Domain Data Models

## Core Entities

### PaymentAccount
```typescript
interface PaymentAccount {
  id: UUID;
  userId: UUID;
  accountType: PaymentAccountType;
  currency: string;
  balance: Decimal;
  availableBalance: Decimal;
  pendingBalance: Decimal;
  status: PaymentAccountStatus;
  stripeCustomerId?: string;
  paypalAccountId?: string;
  metadata?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum PaymentAccountType {
  WALLET = 'wallet',
  ESCROW = 'escrow',
  TRADING = 'trading',
  REWARDS = 'rewards'
}

enum PaymentAccountStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}
```

### Transaction
```typescript
interface Transaction {
  id: UUID;
  referenceId: string;
  accountId: UUID;
  type: TransactionType;
  direction: 'debit' | 'credit';
  amount: Decimal;
  currency: string;
  convertedAmount?: Decimal;
  convertedCurrency?: string;
  exchangeRate?: Decimal;
  status: TransactionStatus;
  description: string;
  metadata?: TransactionMetadata;
  processedAt?: DateTime;
  failedAt?: DateTime;
  failureReason?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund',
  FEE = 'fee',
  COMMISSION = 'commission',
  ADJUSTMENT = 'adjustment'
}

enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed'
}

interface TransactionMetadata {
  paymentMethodId?: string;
  orderId?: string;
  invoiceId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  ipAddress?: string;
  deviceFingerprint?: string;
}
```

### PaymentMethod
```typescript
interface PaymentMethod {
  id: UUID;
  userId: UUID;
  type: PaymentMethodType;
  provider: PaymentProvider;
  isDefault: boolean;
  isVerified: boolean;
  details: PaymentMethodDetails;
  billingAddress?: BillingAddress;
  status: PaymentMethodStatus;
  lastUsedAt?: DateTime;
  expiresAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum PaymentMethodType {
  CARD = 'card',
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal',
  CRYPTO = 'crypto',
  WIRE_TRANSFER = 'wire_transfer'
}

enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square',
  COINBASE = 'coinbase'
}

enum PaymentMethodStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled'
}

interface PaymentMethodDetails {
  // Card details
  cardLast4?: string;
  cardBrand?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  cardFingerprint?: string;
  
  // Bank account details
  bankName?: string;
  accountLast4?: string;
  routingNumber?: string;
  accountType?: 'checking' | 'savings';
  
  // PayPal details
  paypalEmail?: string;
  
  // Crypto details
  walletAddress?: string;
  network?: string;
}

interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}
```

### Invoice
```typescript
interface Invoice {
  id: UUID;
  invoiceNumber: string;
  userId: UUID;
  subscriptionId?: UUID;
  status: InvoiceStatus;
  dueDate: Date;
  amount: Decimal;
  tax: Decimal;
  total: Decimal;
  currency: string;
  items: InvoiceItem[];
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  paidAt?: DateTime;
  voidedAt?: DateTime;
  metadata?: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface InvoiceItem {
  id: UUID;
  description: string;
  quantity: number;
  unitPrice: Decimal;
  amount: Decimal;
  taxRate: Decimal;
  taxAmount: Decimal;
  metadata?: Record<string, any>;
}

enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  VOIDED = 'voided'
}
```

### Subscription
```typescript
interface Subscription {
  id: UUID;
  userId: UUID;
  planId: UUID;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelledAt?: DateTime;
  cancellationReason?: string;
  pausedAt?: DateTime;
  resumedAt?: DateTime;
  metadata?: Record<string, any>;
  stripeSubscriptionId?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}
```

### SubscriptionPlan
```typescript
interface SubscriptionPlan {
  id: UUID;
  name: string;
  description: string;
  productType: ProductType;
  billingInterval: BillingInterval;
  price: Decimal;
  currency: string;
  trialDays: number;
  features: PlanFeature[];
  limits: PlanLimits;
  isActive: boolean;
  stripePriceId?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum ProductType {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

enum BillingInterval {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime'
}

interface PlanFeature {
  name: string;
  description: string;
  enabled: boolean;
  value?: any;
}

interface PlanLimits {
  maxTrades?: number;
  maxSignals?: number;
  maxPortfolios?: number;
  maxApiCalls?: number;
  dataRetentionDays?: number;
}
```

### PaymentGatewayLog
```typescript
interface PaymentGatewayLog {
  id: UUID;
  transactionId: UUID;
  gateway: PaymentProvider;
  event: string;
  request: Record<string, any>;
  response: Record<string, any>;
  statusCode: number;
  errorMessage?: string;
  latencyMs: number;
  createdAt: DateTime;
}
```

### Refund
```typescript
interface Refund {
  id: UUID;
  transactionId: UUID;
  amount: Decimal;
  currency: string;
  reason: RefundReason;
  status: RefundStatus;
  gatewayRefundId?: string;
  metadata?: Record<string, any>;
  processedAt?: DateTime;
  failedAt?: DateTime;
  failureReason?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum RefundReason {
  DUPLICATE = 'duplicate',
  FRAUDULENT = 'fraudulent',
  REQUESTED_BY_CUSTOMER = 'requested_by_customer',
  SERVICE_ISSUE = 'service_issue'
}

enum RefundStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
```

## Relationships

- User (1) → PaymentAccount (n)
- User (1) → PaymentMethod (n)
- User (1) → Subscription (n)
- PaymentAccount (1) → Transaction (n)
- Transaction (1) → Refund (n)
- Transaction (1) → PaymentGatewayLog (n)
- Subscription (1) → Invoice (n)
- SubscriptionPlan (1) → Subscription (n)

## Indexes

### Transaction Table
- INDEX on accountId
- INDEX on status
- INDEX on type
- INDEX on createdAt
- COMPOSITE INDEX on (accountId, status)
- UNIQUE INDEX on referenceId

### PaymentMethod Table
- INDEX on userId
- INDEX on type
- INDEX on status
- INDEX on isDefault

### Invoice Table
- INDEX on userId
- INDEX on status
- INDEX on dueDate
- UNIQUE INDEX on invoiceNumber

### Subscription Table
- INDEX on userId
- INDEX on planId
- INDEX on status
- INDEX on currentPeriodEnd

## Security & Compliance

1. **PCI DSS Compliance**
   - Never store full card numbers
   - Tokenize sensitive payment data
   - Implement secure key management
   - Regular security audits

2. **Encryption**
   - Encrypt sensitive fields at rest
   - Use TLS for all payment communications
   - Implement field-level encryption for PII

3. **Audit Trail**
   - Log all payment operations
   - Maintain immutable transaction history
   - Track all refunds and adjustments

4. **Fraud Prevention**
   - Implement velocity checks
   - Monitor for suspicious patterns
   - Device fingerprinting
   - IP geolocation verification

5. **Regulatory Compliance**
   - GDPR data handling
   - Strong Customer Authentication (SCA)
   - Anti-Money Laundering (AML) checks
   - Know Your Customer (KYC) verification