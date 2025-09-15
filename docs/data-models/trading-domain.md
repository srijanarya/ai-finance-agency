# Trading Domain Data Models

## Core Entities

### TradingAccount
```typescript
interface TradingAccount {
  id: UUID;
  userId: UUID;
  accountType: AccountType;
  accountNumber: string;
  status: AccountStatus;
  baseCurrency: string;
  balance: Decimal;
  availableBalance: Decimal;
  marginUsed: Decimal;
  leverage: number;
  riskLevel: RiskLevel;
  createdAt: DateTime;
  updatedAt: DateTime;
  closedAt?: DateTime;
}

enum AccountType {
  DEMO = 'demo',
  LIVE = 'live',
  PAPER = 'paper',
  COPY_TRADING = 'copy_trading'
}

enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  RESTRICTED = 'restricted',
  SUSPENDED = 'suspended',
  CLOSED = 'closed'
}

enum RiskLevel {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}
```

### Position
```typescript
interface Position {
  id: UUID;
  accountId: UUID;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: Decimal;
  entryPrice: Decimal;
  currentPrice: Decimal;
  stopLoss?: Decimal;
  takeProfit?: Decimal;
  trailingStop?: TrailingStop;
  unrealizedPnL: Decimal;
  realizedPnL: Decimal;
  commission: Decimal;
  swap: Decimal;
  status: PositionStatus;
  openedAt: DateTime;
  closedAt?: DateTime;
  metadata?: Record<string, any>;
}

interface TrailingStop {
  distance: Decimal;
  step: Decimal;
  currentStopPrice: Decimal;
}

enum PositionStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIALLY_CLOSED = 'partially_closed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}
```

### Order
```typescript
interface Order {
  id: UUID;
  accountId: UUID;
  positionId?: UUID;
  symbol: string;
  orderType: OrderType;
  side: 'buy' | 'sell';
  quantity: Decimal;
  price?: Decimal;
  stopPrice?: Decimal;
  limitPrice?: Decimal;
  timeInForce: TimeInForce;
  status: OrderStatus;
  filledQuantity: Decimal;
  averageFilledPrice?: Decimal;
  commission: Decimal;
  rejectionReason?: string;
  createdAt: DateTime;
  submittedAt?: DateTime;
  filledAt?: DateTime;
  cancelledAt?: DateTime;
  expiresAt?: DateTime;
}

enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
  TRAILING_STOP = 'trailing_stop'
}

enum TimeInForce {
  GTC = 'gtc', // Good Till Cancelled
  IOC = 'ioc', // Immediate or Cancel
  FOK = 'fok', // Fill or Kill
  DAY = 'day',
  GTD = 'gtd'  // Good Till Date
}

enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}
```

### Trade
```typescript
interface Trade {
  id: UUID;
  orderId: UUID;
  accountId: UUID;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: Decimal;
  price: Decimal;
  commission: Decimal;
  executionVenue: string;
  executedAt: DateTime;
  settledAt?: DateTime;
  metadata?: Record<string, any>;
}
```

### MarketData
```typescript
interface MarketData {
  id: UUID;
  symbol: string;
  exchange: string;
  bid: Decimal;
  ask: Decimal;
  last: Decimal;
  open: Decimal;
  high: Decimal;
  low: Decimal;
  close: Decimal;
  volume: Decimal;
  timestamp: DateTime;
  source: string;
}
```

### TradingSignal
```typescript
interface TradingSignal {
  id: UUID;
  signalType: SignalType;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  entryPrice?: Decimal;
  stopLoss?: Decimal;
  takeProfit: TakeProfit[];
  rMultiple: number;
  timeframe: string;
  strategy: string;
  indicators: Record<string, any>;
  backtestResults?: BacktestResult;
  status: SignalStatus;
  generatedAt: DateTime;
  validUntil: DateTime;
  executedAt?: DateTime;
}

interface TakeProfit {
  level: number;
  price: Decimal;
  percentage: number;
}

interface BacktestResult {
  winRate: number;
  avgReturn: Decimal;
  sharpeRatio: number;
  maxDrawdown: Decimal;
  totalTrades: number;
}

enum SignalType {
  MANUAL = 'manual',
  AI_GENERATED = 'ai_generated',
  ALGORITHMIC = 'algorithmic',
  SOCIAL = 'social'
}

enum SignalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXECUTED = 'executed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}
```

### Portfolio
```typescript
interface Portfolio {
  id: UUID;
  accountId: UUID;
  name: string;
  description?: string;
  totalValue: Decimal;
  dailyPnL: Decimal;
  weeklyPnL: Decimal;
  monthlyPnL: Decimal;
  yearlyPnL: Decimal;
  allTimePnL: Decimal;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: Decimal;
  winRate: number;
  avgWin: Decimal;
  avgLoss: Decimal;
  riskScore: number;
  lastCalculatedAt: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### TradingStrategy
```typescript
interface TradingStrategy {
  id: UUID;
  accountId: UUID;
  name: string;
  description: string;
  type: StrategyType;
  parameters: Record<string, any>;
  backtestResults: BacktestResult;
  isActive: boolean;
  maxPositions: number;
  maxRiskPerTrade: Decimal;
  maxDailyLoss: Decimal;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum StrategyType {
  TREND_FOLLOWING = 'trend_following',
  MEAN_REVERSION = 'mean_reversion',
  ARBITRAGE = 'arbitrage',
  MOMENTUM = 'momentum',
  BREAKOUT = 'breakout',
  AI_POWERED = 'ai_powered'
}
```

## Relationships

- TradingAccount (1) → Position (n)
- TradingAccount (1) → Order (n)
- TradingAccount (1) → Portfolio (1)
- TradingAccount (1) → TradingStrategy (n)
- Order (1) → Trade (n)
- Position (1) → Order (n)
- TradingSignal (1) → Order (n)

## Indexes

### Position Table
- INDEX on accountId
- INDEX on symbol
- INDEX on status
- INDEX on openedAt
- COMPOSITE INDEX on (accountId, status)

### Order Table
- INDEX on accountId
- INDEX on symbol
- INDEX on status
- INDEX on createdAt
- COMPOSITE INDEX on (accountId, status)

### Trade Table
- INDEX on orderId
- INDEX on accountId
- INDEX on symbol
- INDEX on executedAt

### MarketData Table
- COMPOSITE INDEX on (symbol, timestamp)
- INDEX on exchange
- INDEX on timestamp

## Performance Optimizations

1. **Partitioning**: Partition Trade and MarketData tables by date
2. **Caching**: Cache frequently accessed market data in Redis
3. **Aggregation**: Pre-calculate portfolio metrics hourly
4. **Archival**: Move closed positions to archive tables after 90 days
5. **Read Replicas**: Use read replicas for analytics queries