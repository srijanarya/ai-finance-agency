// Service Types
export enum ServiceType {
  API_GATEWAY = 'api-gateway',
  USER_MANAGEMENT = 'user-management',
  TRADING = 'trading',
  SIGNALS = 'signals',
  PAYMENT = 'payment',
  EDUCATION = 'education'
}

// Event Types
export enum EventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  TRADE_EXECUTED = 'trade.executed',
  TRADE_CANCELLED = 'trade.cancelled',
  TRADE_UPDATED = 'trade.updated',
  
  SIGNAL_GENERATED = 'signal.generated',
  SIGNAL_UPDATED = 'signal.updated',
  SIGNAL_EXPIRED = 'signal.expired',
  
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  
  COURSE_COMPLETED = 'education.course.completed',
  LESSON_STARTED = 'education.lesson.started',
  ASSESSMENT_COMPLETED = 'education.assessment.completed'
}

// Trading Signal Types
export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD'
}

export enum SignalStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED'
}

// User Status
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

// Subscription Tiers
export enum SubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

// Asset Types
export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  COMMODITY = 'COMMODITY',
  INDEX = 'INDEX',
  BOND = 'BOND'
}

// Risk Levels
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH'
}

// Time Frames
export enum TimeFrame {
  MINUTE_1 = '1m',
  MINUTE_5 = '5m',
  MINUTE_15 = '15m',
  MINUTE_30 = '30m',
  HOUR_1 = '1h',
  HOUR_4 = '4h',
  DAY_1 = '1d',
  WEEK_1 = '1w',
  MONTH_1 = '1M'
}