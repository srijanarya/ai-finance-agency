import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from './event-bus.service';

@Injectable()
export class EventPublisher {
  private readonly logger = new Logger(EventPublisher.name);

  constructor(private readonly eventBus: EventBusService) {}

  // Signal Events
  async publishSignalGenerated(signal: {
    id: string;
    symbol: string;
    type: string;
    price: number;
    confidence: number;
    riskLevel: string;
    timeFrame: string;
    analysis: string;
    createdBy: string;
    targetAudience: string[];
    expiresAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing signal generated event for ${signal.symbol}`, {
      signalId: signal.id,
      correlationId,
    });

    await this.eventBus.publishSignalGenerated({
      ...signal,
      eventType: 'signal.generated',
    }, correlationId);
  }

  async publishSignalUpdated(signal: {
    id: string;
    symbol: string;
    changes: Record<string, any>;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing signal updated event for ${signal.symbol}`, {
      signalId: signal.id,
      correlationId,
    });

    await this.eventBus.publishSignalUpdated({
      ...signal,
      eventType: 'signal.updated',
    }, correlationId);
  }

  async publishSignalExpired(signal: {
    id: string;
    symbol: string;
    finalPrice?: number;
    performance?: number;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing signal expired event for ${signal.symbol}`, {
      signalId: signal.id,
      correlationId,
    });

    await this.eventBus.publishSignalExpired({
      ...signal,
      eventType: 'signal.expired',
    }, correlationId);
  }

  // Trading Events
  async publishTradeExecuted(trade: {
    id: string;
    userId: string;
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    signalId?: string;
    accountId: string;
    executedAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing trade executed event for ${trade.symbol}`, {
      tradeId: trade.id,
      userId: trade.userId,
      correlationId,
    });

    await this.eventBus.publishTradeExecuted({
      ...trade,
      eventType: 'trade.executed',
    }, correlationId);
  }

  // User Events
  async publishUserRegistered(user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    subscriptionTier: string;
    registeredAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing user registered event for ${user.email}`, {
      userId: user.id,
      correlationId,
    });

    await this.eventBus.publishUserRegistered({
      ...user,
      eventType: 'user.registered',
    }, correlationId);
  }

  async publishUserSubscriptionChanged(data: {
    userId: string;
    previousTier: string;
    newTier: string;
    changedAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing user subscription changed event`, {
      userId: data.userId,
      previousTier: data.previousTier,
      newTier: data.newTier,
      correlationId,
    });

    await this.eventBus.publish('user.subscription.changed', {
      ...data,
      eventType: 'user.subscription.changed',
    }, {
      correlationId,
      aggregateId: data.userId,
    });
  }

  // Payment Events
  async publishPaymentCompleted(payment: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    subscriptionId?: string;
    processedAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing payment completed event`, {
      paymentId: payment.id,
      userId: payment.userId,
      amount: payment.amount,
      correlationId,
    });

    await this.eventBus.publishPaymentCompleted({
      ...payment,
      eventType: 'payment.completed',
    }, correlationId);
  }

  async publishPaymentFailed(payment: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    reason: string;
    errorCode?: string;
    failedAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing payment failed event`, {
      paymentId: payment.id,
      userId: payment.userId,
      reason: payment.reason,
      correlationId,
    });

    await this.eventBus.publish('payment.failed', {
      ...payment,
      eventType: 'payment.failed',
    }, {
      correlationId,
      aggregateId: payment.id,
    });
  }

  // Education Events
  async publishCourseCompleted(data: {
    userId: string;
    courseId: string;
    courseTitle: string;
    completionPercentage: number;
    completedAt: Date;
    certificateIssued: boolean;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing course completed event`, {
      userId: data.userId,
      courseId: data.courseId,
      courseTitle: data.courseTitle,
      correlationId,
    });

    await this.eventBus.publishCourseCompleted({
      ...data,
      eventType: 'course.completed',
    }, correlationId);
  }

  async publishLessonStarted(data: {
    userId: string;
    courseId: string;
    lessonId: string;
    lessonTitle: string;
    startedAt: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.log(`Publishing lesson started event`, {
      userId: data.userId,
      lessonId: data.lessonId,
      correlationId,
    });

    await this.eventBus.publish('lesson.started', {
      ...data,
      eventType: 'lesson.started',
    }, {
      correlationId,
      aggregateId: data.lessonId,
    });
  }

  // Analytics Events
  async publishUserActivity(data: {
    userId: string;
    activityType: string;
    resourceId?: string;
    resourceType?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
  }, correlationId?: string): Promise<void> {
    this.logger.debug(`Publishing user activity event`, {
      userId: data.userId,
      activityType: data.activityType,
      correlationId,
    });

    await this.eventBus.publish('user.activity', {
      ...data,
      eventType: 'user.activity',
    }, {
      correlationId,
      aggregateId: data.userId,
    });
  }
}