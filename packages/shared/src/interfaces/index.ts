import { ServiceType, UserStatus, SubscriptionTier, SignalType, SignalStatus, AssetType, RiskLevel, TimeFrame, PaymentStatus } from '../enums';

// Base interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceInfo {
  name: ServiceType;
  version: string;
  health: 'healthy' | 'unhealthy' | 'degraded';
  lastChecked: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Management Interfaces
export interface User extends BaseEntity {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  subscriptionTier: SubscriptionTier;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  tradingExperience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  riskTolerance: RiskLevel;
  preferredAssets: AssetType[];
  timezone: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    trading: boolean;
    education: boolean;
  };
}

// Trading Interfaces
export interface TradingAccount extends BaseEntity {
  userId: string;
  accountType: 'DEMO' | 'LIVE';
  broker: string;
  balance: number;
  currency: string;
  leverage: number;
  isActive: boolean;
  apiKey?: string; // encrypted
  apiSecret?: string; // encrypted
}

export interface Trade extends BaseEntity {
  userId: string;
  accountId: string;
  symbol: string;
  assetType: AssetType;
  signalId?: string;
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
  fillPrice?: number;
  commission: number;
  pnl?: number;
  executedAt?: Date;
}

// Signal Interfaces
export interface TradingSignal extends BaseEntity {
  symbol: string;
  assetType: AssetType;
  type: SignalType;
  status: SignalStatus;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  riskLevel: RiskLevel;
  timeFrame: TimeFrame;
  confidence: number; // 0-100
  analysis: string;
  expiresAt: Date;
  createdBy: string; // analyst ID
  targetAudience: SubscriptionTier[];
  tags: string[];
  performance?: {
    maxPnl?: number;
    currentPnl?: number;
    hitStopLoss: boolean;
    hitTakeProfit: boolean;
    closedAt?: Date;
  };
}

export interface SignalPerformance {
  signalId: string;
  totalFollowers: number;
  successfulTrades: number;
  totalTrades: number;
  avgPnl: number;
  winRate: number;
  avgHoldingTime: number; // in minutes
  riskAdjustedReturn: number;
}

// Payment Interfaces
export interface Payment extends BaseEntity {
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: 'CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL' | 'STRIPE';
  transactionId: string;
  subscriptionId?: string;
  description: string;
  metadata?: Record<string, any>;
  processedAt?: Date;
}

export interface Subscription extends BaseEntity {
  userId: string;
  tier: SubscriptionTier;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  lastPaymentId?: string;
  nextPaymentDate?: Date;
}

// Education Interfaces
export interface Course extends BaseEntity {
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  duration: number; // in minutes
  price?: number;
  currency?: string;
  isActive: boolean;
  thumbnailUrl?: string;
  tags: string[];
  prerequisiteCourses?: string[];
  learningOutcomes: string[];
  instructorId: string;
}

export interface Lesson extends BaseEntity {
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';
  contentUrl?: string;
  isActive: boolean;
  isFree: boolean;
}

export interface UserProgress extends BaseEntity {
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson?: string;
  completionPercentage: number;
  startedAt: Date;
  completedAt?: Date;
  certificateIssued: boolean;
}

// Communication Interfaces
export interface MessagePattern {
  pattern: string;
  data?: any;
}

export interface ServiceMessage<T = any> {
  id: string;
  correlationId?: string;
  timestamp: Date;
  source: ServiceType;
  destination?: ServiceType;
  type: string;
  payload: T;
  metadata?: Record<string, any>;
}

export interface EventMessage<T = any> extends ServiceMessage<T> {
  eventType: string;
  aggregateId: string;
  version: number;
}

// Health Check Interfaces
export interface HealthCheckResult {
  status: 'up' | 'down' | 'degraded';
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      message?: string;
      responseTime?: number;
    };
  };
  info?: Record<string, any>;
  error?: Record<string, any>;
  details?: Record<string, any>;
}

// Circuit Breaker Interfaces
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedErrors: string[];
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

// Tracing Interfaces
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  flags: number;
  baggage?: Record<string, string>;
}

export interface SpanInfo {
  operationName: string;
  startTime: number;
  endTime?: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: number;
    fields: Record<string, any>;
  }>;
}