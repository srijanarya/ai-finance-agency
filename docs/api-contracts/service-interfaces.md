# Service Contracts and Interfaces

## API Gateway Service

### Authentication Endpoints
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  message: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    username: string;
    roles: string[];
  };
}

// POST /api/auth/refresh
interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

## Trading Service

### Position Management
```typescript
// POST /api/trading/positions
interface OpenPositionRequest {
  accountId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop';
  price?: number;
  stopLoss?: number;
  takeProfit?: number[];
  metadata?: Record<string, any>;
}

interface OpenPositionResponse {
  position: {
    id: string;
    accountId: string;
    symbol: string;
    side: string;
    quantity: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnL: number;
    status: string;
    openedAt: string;
  };
  order: {
    id: string;
    status: string;
    filledQuantity: number;
    averagePrice: number;
  };
}

// GET /api/trading/positions/:accountId
interface GetPositionsResponse {
  positions: Position[];
  summary: {
    totalPositions: number;
    totalUnrealizedPnL: number;
    totalRealizedPnL: number;
    marginUsed: number;
  };
}

// PUT /api/trading/positions/:positionId
interface UpdatePositionRequest {
  stopLoss?: number;
  takeProfit?: number[];
  trailingStop?: {
    distance: number;
    step: number;
  };
}
```

### Order Management
```typescript
// POST /api/trading/orders
interface CreateOrderRequest {
  accountId: string;
  symbol: string;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK' | 'DAY';
  metadata?: Record<string, any>;
}

interface CreateOrderResponse {
  order: {
    id: string;
    accountId: string;
    symbol: string;
    orderType: string;
    side: string;
    quantity: number;
    price?: number;
    status: string;
    createdAt: string;
  };
}

// GET /api/trading/orders/:accountId
interface GetOrdersRequest {
  status?: string[];
  symbol?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

## Signals Service

### AI Signal Generation
```typescript
// GET /api/signals/generate
interface GenerateSignalRequest {
  symbols: string[];
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  strategy?: string;
  includeBacktest?: boolean;
}

interface GenerateSignalResponse {
  signals: MarketSignal[];
  metadata: {
    generatedAt: string;
    modelVersion: string;
    confidence: number;
  };
}

// GET /api/signals/history
interface GetSignalHistoryRequest {
  symbol?: string;
  from?: string;
  to?: string;
  signalType?: string[];
  minConfidence?: number;
  limit?: number;
  offset?: number;
}

interface GetSignalHistoryResponse {
  signals: MarketSignal[];
  performance: {
    totalSignals: number;
    successRate: number;
    avgReturn: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// POST /api/signals/subscribe
interface SubscribeSignalsRequest {
  symbols: string[];
  strategies: string[];
  minConfidence?: number;
  webhookUrl?: string;
}

interface SubscribeSignalsResponse {
  subscriptionId: string;
  status: 'active' | 'pending';
  channels: {
    websocket?: string;
    webhook?: string;
  };
}
```

## Payment Service

### Transaction Processing
```typescript
// POST /api/payments/deposit
interface DepositRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

interface DepositResponse {
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    processedAt?: string;
  };
  balance: {
    available: number;
    pending: number;
    total: number;
  };
}

// POST /api/payments/withdraw
interface WithdrawRequest {
  amount: number;
  currency: string;
  destinationId: string;
  twoFactorCode?: string;
  metadata?: Record<string, any>;
}

interface WithdrawResponse {
  transaction: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    estimatedArrival?: string;
  };
  balance: {
    available: number;
    pending: number;
    total: number;
  };
}

// GET /api/payments/transactions
interface GetTransactionsRequest {
  accountId?: string;
  type?: string[];
  status?: string[];
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

interface GetTransactionsResponse {
  transactions: Transaction[];
  summary: {
    totalDeposits: number;
    totalWithdrawals: number;
    netAmount: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

## Risk Management Service

### Risk Assessment
```typescript
// POST /api/risk/assess
interface RiskAssessmentRequest {
  accountId: string;
  positions?: Position[];
  proposedTrade?: {
    symbol: string;
    side: string;
    quantity: number;
    price: number;
  };
}

interface RiskAssessmentResponse {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  metrics: {
    valueAtRisk: number;
    expectedShortfall: number;
    sharpeRatio: number;
    maxDrawdown: number;
    correlationRisk: number;
  };
  warnings: RiskWarning[];
  recommendations: string[];
}

interface RiskWarning {
  type: 'concentration' | 'leverage' | 'volatility' | 'correlation';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedPositions?: string[];
}

// GET /api/risk/limits
interface GetRiskLimitsResponse {
  account: {
    maxLeverage: number;
    maxPositionSize: number;
    maxDailyLoss: number;
    maxOpenPositions: number;
  };
  position: {
    maxSizePerSymbol: number;
    maxLossPerPosition: number;
    requiredStopLoss: boolean;
  };
  current: {
    leverage: number;
    dailyLoss: number;
    openPositions: number;
  };
}
```

## WebSocket Events

### Real-time Market Data
```typescript
// Market data stream
interface MarketDataEvent {
  type: 'market_data';
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  timestamp: string;
}

// Position updates
interface PositionUpdateEvent {
  type: 'position_update';
  accountId: string;
  position: Position;
  trigger: 'price_change' | 'order_fill' | 'stop_hit';
}

// Signal alerts
interface SignalAlertEvent {
  type: 'signal_alert';
  signal: MarketSignal;
  urgency: 'low' | 'medium' | 'high';
}

// Risk alerts
interface RiskAlertEvent {
  type: 'risk_alert';
  accountId: string;
  alert: RiskWarning;
  requiredAction?: string;
}
```

## Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    traceId: string;
  };
}

// Standard error codes
enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Business logic errors (422)
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  POSITION_NOT_FOUND = 'POSITION_NOT_FOUND',
  MARKET_CLOSED = 'MARKET_CLOSED',
  RISK_LIMIT_EXCEEDED = 'RISK_LIMIT_EXCEEDED',
  
  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT'
}
```

## Rate Limiting Headers

```typescript
interface RateLimitHeaders {
  'X-RateLimit-Limit': string;      // Max requests per window
  'X-RateLimit-Remaining': string;  // Remaining requests
  'X-RateLimit-Reset': string;       // Window reset timestamp
  'X-RateLimit-Retry-After'?: string; // Seconds to wait if limited
}
```