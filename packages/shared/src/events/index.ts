import { EventType, ServiceType } from '../enums';
import { IsString, IsNotEmpty, IsOptional, IsDate, IsNumber, IsEnum, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// Base Event Class
export abstract class BaseEvent {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  aggregateId: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsNumber()
  version: number;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsEnum(ServiceType)
  source: ServiceType;

  @IsString()
  @IsOptional()
  correlationId?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  constructor(
    aggregateId: string,
    eventType: EventType,
    version: number,
    source: ServiceType,
    correlationId?: string,
    metadata?: Record<string, any>
  ) {
    this.id = crypto.randomUUID();
    this.aggregateId = aggregateId;
    this.eventType = eventType;
    this.version = version;
    this.timestamp = new Date();
    this.source = source;
    this.correlationId = correlationId;
    this.metadata = metadata;
  }
}

// User Events
export class UserCreatedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  subscriptionTier?: string;

  constructor(
    userId: string,
    data: {
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      subscriptionTier?: string;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(userId, EventType.USER_CREATED, version, ServiceType.USER_MANAGEMENT, correlationId);
    this.email = data.email;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.subscriptionTier = data.subscriptionTier;
  }
}

export class UserUpdatedEvent extends BaseEvent {
  @IsOptional()
  changes?: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
  }>;

  constructor(
    userId: string,
    changes: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      status: string;
    }>,
    version: number = 1,
    correlationId?: string
  ) {
    super(userId, EventType.USER_UPDATED, version, ServiceType.USER_MANAGEMENT, correlationId);
    this.changes = changes;
  }
}

export class UserDeletedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  reason: string;

  constructor(userId: string, reason: string, version: number = 1, correlationId?: string) {
    super(userId, EventType.USER_DELETED, version, ServiceType.USER_MANAGEMENT, correlationId);
    this.reason = reason;
  }
}

// Trading Events
export class TradeExecutedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  side: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  commission?: number;

  @IsString()
  @IsOptional()
  signalId?: string;

  constructor(
    tradeId: string,
    data: {
      symbol: string;
      side: string;
      quantity: number;
      price: number;
      commission?: number;
      signalId?: string;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(tradeId, EventType.TRADE_EXECUTED, version, ServiceType.TRADING, correlationId);
    this.symbol = data.symbol;
    this.side = data.side;
    this.quantity = data.quantity;
    this.price = data.price;
    this.commission = data.commission;
    this.signalId = data.signalId;
  }
}

export class TradeCancelledEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  reason: string;

  constructor(tradeId: string, reason: string, version: number = 1, correlationId?: string) {
    super(tradeId, EventType.TRADE_CANCELLED, version, ServiceType.TRADING, correlationId);
    this.reason = reason;
  }
}

// Signal Events
export class SignalGeneratedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  price: number;

  @IsNumber()
  confidence: number;

  @IsString()
  @IsNotEmpty()
  riskLevel: string;

  @IsString()
  @IsNotEmpty()
  timeFrame: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  constructor(
    signalId: string,
    data: {
      symbol: string;
      type: string;
      price: number;
      confidence: number;
      riskLevel: string;
      timeFrame: string;
      createdBy: string;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(signalId, EventType.SIGNAL_GENERATED, version, ServiceType.SIGNALS, correlationId);
    this.symbol = data.symbol;
    this.type = data.type;
    this.price = data.price;
    this.confidence = data.confidence;
    this.riskLevel = data.riskLevel;
    this.timeFrame = data.timeFrame;
    this.createdBy = data.createdBy;
  }
}

export class SignalExpiredEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  @IsOptional()
  finalPrice?: number;

  @IsNumber()
  @IsOptional()
  performance?: number;

  constructor(
    signalId: string,
    data: {
      symbol: string;
      finalPrice?: number;
      performance?: number;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(signalId, EventType.SIGNAL_EXPIRED, version, ServiceType.SIGNALS, correlationId);
    this.symbol = data.symbol;
    this.finalPrice = data.finalPrice;
    this.performance = data.performance;
  }
}

// Payment Events
export class PaymentCreatedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  constructor(
    paymentId: string,
    data: {
      userId: string;
      amount: number;
      currency: string;
      method: string;
      description: string;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(paymentId, EventType.PAYMENT_CREATED, version, ServiceType.PAYMENT, correlationId);
    this.userId = data.userId;
    this.amount = data.amount;
    this.currency = data.currency;
    this.method = data.method;
    this.description = data.description;
  }
}

export class PaymentCompletedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsDate()
  @Type(() => Date)
  processedAt: Date;

  constructor(
    paymentId: string,
    data: {
      userId: string;
      transactionId: string;
      amount: number;
      currency: string;
      processedAt: Date;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(paymentId, EventType.PAYMENT_COMPLETED, version, ServiceType.PAYMENT, correlationId);
    this.userId = data.userId;
    this.transactionId = data.transactionId;
    this.amount = data.amount;
    this.currency = data.currency;
    this.processedAt = data.processedAt;
  }
}

export class PaymentFailedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  errorCode?: string;

  constructor(
    paymentId: string,
    data: {
      userId: string;
      reason: string;
      errorCode?: string;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(paymentId, EventType.PAYMENT_FAILED, version, ServiceType.PAYMENT, correlationId);
    this.userId = data.userId;
    this.reason = data.reason;
    this.errorCode = data.errorCode;
  }
}

// Education Events
export class CourseCompletedEvent extends BaseEvent {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  courseTitle: string;

  @IsNumber()
  completionPercentage: number;

  @IsDate()
  @Type(() => Date)
  completedAt: Date;

  @IsBoolean()
  certificateIssued: boolean;

  constructor(
    progressId: string,
    data: {
      userId: string;
      courseId: string;
      courseTitle: string;
      completionPercentage: number;
      completedAt: Date;
      certificateIssued: boolean;
    },
    version: number = 1,
    correlationId?: string
  ) {
    super(progressId, EventType.COURSE_COMPLETED, version, ServiceType.EDUCATION, correlationId);
    this.userId = data.userId;
    this.courseId = data.courseId;
    this.courseTitle = data.courseTitle;
    this.completionPercentage = data.completionPercentage;
    this.completedAt = data.completedAt;
    this.certificateIssued = data.certificateIssued;
  }
}

// Event Registry for type safety
export const EventRegistry = {
  [EventType.USER_CREATED]: UserCreatedEvent,
  [EventType.USER_UPDATED]: UserUpdatedEvent,
  [EventType.USER_DELETED]: UserDeletedEvent,
  [EventType.TRADE_EXECUTED]: TradeExecutedEvent,
  [EventType.TRADE_CANCELLED]: TradeCancelledEvent,
  [EventType.SIGNAL_GENERATED]: SignalGeneratedEvent,
  [EventType.SIGNAL_EXPIRED]: SignalExpiredEvent,
  [EventType.PAYMENT_CREATED]: PaymentCreatedEvent,
  [EventType.PAYMENT_COMPLETED]: PaymentCompletedEvent,
  [EventType.PAYMENT_FAILED]: PaymentFailedEvent,
  [EventType.COURSE_COMPLETED]: CourseCompletedEvent,
} as const;

// Event Handler Interface
export interface EventHandler<T extends BaseEvent = BaseEvent> {
  handle(event: T): Promise<void>;
}

// Event Bus Interface
export interface EventBus {
  publish(event: BaseEvent): Promise<void>;
  subscribe<T extends BaseEvent>(
    eventType: EventType,
    handler: EventHandler<T>
  ): Promise<void>;
  unsubscribe(eventType: EventType, handler: EventHandler): Promise<void>;
}