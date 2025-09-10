import { Injectable, Logger } from '@nestjs/common';
import { EventBusService, EventMessage, EventHandler } from './event-bus.service';

@Injectable()
export class EventSubscriber {
  private readonly logger = new Logger(EventSubscriber.name);

  constructor(private readonly eventBus: EventBusService) {}

  // Signal Event Handlers
  subscribeToSignalGenerated(handler: EventHandler): void {
    this.eventBus.subscribe('signal.generated', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling signal generated event`, {
          signalId: event.aggregateId,
          symbol: event.payload.symbol,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  subscribeToSignalUpdated(handler: EventHandler): void {
    this.eventBus.subscribe('signal.updated', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling signal updated event`, {
          signalId: event.aggregateId,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  subscribeToSignalExpired(handler: EventHandler): void {
    this.eventBus.subscribe('signal.expired', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling signal expired event`, {
          signalId: event.aggregateId,
          symbol: event.payload.symbol,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // Trading Event Handlers
  subscribeToTradeExecuted(handler: EventHandler): void {
    this.eventBus.subscribe('trade.executed', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling trade executed event`, {
          tradeId: event.aggregateId,
          userId: event.payload.userId,
          symbol: event.payload.symbol,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  subscribeToTradeCancelled(handler: EventHandler): void {
    this.eventBus.subscribe('trade.cancelled', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling trade cancelled event`, {
          tradeId: event.aggregateId,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // User Event Handlers
  subscribeToUserRegistered(handler: EventHandler): void {
    this.eventBus.subscribe('user.registered', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling user registered event`, {
          userId: event.aggregateId,
          email: event.payload.email,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  subscribeToUserSubscriptionChanged(handler: EventHandler): void {
    this.eventBus.subscribe('user.subscription.changed', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling user subscription changed event`, {
          userId: event.aggregateId,
          previousTier: event.payload.previousTier,
          newTier: event.payload.newTier,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // Payment Event Handlers
  subscribeToPaymentCompleted(handler: EventHandler): void {
    this.eventBus.subscribe('payment.completed', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling payment completed event`, {
          paymentId: event.aggregateId,
          userId: event.payload.userId,
          amount: event.payload.amount,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  subscribeToPaymentFailed(handler: EventHandler): void {
    this.eventBus.subscribe('payment.failed', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling payment failed event`, {
          paymentId: event.aggregateId,
          userId: event.payload.userId,
          reason: event.payload.reason,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // Education Event Handlers
  subscribeToCourseCompleted(handler: EventHandler): void {
    this.eventBus.subscribe('course.completed', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling course completed event`, {
          userId: event.payload.userId,
          courseId: event.payload.courseId,
          courseTitle: event.payload.courseTitle,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  subscribeToLessonStarted(handler: EventHandler): void {
    this.eventBus.subscribe('lesson.started', {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling lesson started event`, {
          userId: event.payload.userId,
          lessonId: event.aggregateId,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // Analytics Event Handlers
  subscribeToUserActivity(handler: EventHandler): void {
    this.eventBus.subscribe('user.activity', {
      handle: async (event: EventMessage) => {
        this.logger.debug(`Handling user activity event`, {
          userId: event.aggregateId,
          activityType: event.payload.activityType,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // Generic subscription method for custom events
  subscribeToEvent(eventType: string, handler: EventHandler): void {
    this.eventBus.subscribe(eventType, {
      handle: async (event: EventMessage) => {
        this.logger.log(`Handling custom event ${eventType}`, {
          aggregateId: event.aggregateId,
          correlationId: event.correlationId,
        });
        await handler.handle(event);
      },
    });
  }

  // Batch event subscription for multiple related events
  subscribeToSignalEvents(handlers: {
    onGenerated?: EventHandler;
    onUpdated?: EventHandler;
    onExpired?: EventHandler;
  }): void {
    if (handlers.onGenerated) {
      this.subscribeToSignalGenerated(handlers.onGenerated);
    }
    if (handlers.onUpdated) {
      this.subscribeToSignalUpdated(handlers.onUpdated);
    }
    if (handlers.onExpired) {
      this.subscribeToSignalExpired(handlers.onExpired);
    }
  }

  subscribeToTradingEvents(handlers: {
    onExecuted?: EventHandler;
    onCancelled?: EventHandler;
  }): void {
    if (handlers.onExecuted) {
      this.subscribeToTradeExecuted(handlers.onExecuted);
    }
    if (handlers.onCancelled) {
      this.subscribeToTradeCancelled(handlers.onCancelled);
    }
  }

  subscribeToUserEvents(handlers: {
    onRegistered?: EventHandler;
    onSubscriptionChanged?: EventHandler;
  }): void {
    if (handlers.onRegistered) {
      this.subscribeToUserRegistered(handlers.onRegistered);
    }
    if (handlers.onSubscriptionChanged) {
      this.subscribeToUserSubscriptionChanged(handlers.onSubscriptionChanged);
    }
  }

  subscribeToPaymentEvents(handlers: {
    onCompleted?: EventHandler;
    onFailed?: EventHandler;
  }): void {
    if (handlers.onCompleted) {
      this.subscribeToPaymentCompleted(handlers.onCompleted);
    }
    if (handlers.onFailed) {
      this.subscribeToPaymentFailed(handlers.onFailed);
    }
  }
}