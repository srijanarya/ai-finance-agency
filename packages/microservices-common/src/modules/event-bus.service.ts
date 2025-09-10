import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

export interface EventMessage<T = any> {
  id: string;
  eventType: string;
  aggregateId: string;
  version: number;
  timestamp: Date;
  source: string;
  correlationId?: string;
  payload: T;
  metadata?: Record<string, any>;
}

export interface EventHandler<T = any> {
  handle(event: EventMessage<T>): Promise<void>;
}

@Injectable()
export class EventBusService implements OnModuleInit {
  private readonly logger = new Logger(EventBusService.name);
  private client: ClientProxy;
  private readonly serviceName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.serviceName = this.configService.get('SERVICE_NAME', 'unknown');
    this.setupRabbitMQClient();
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('EventBus connected to RabbitMQ');
  }

  private setupRabbitMQClient() {
    const rabbitMqUrl = this.configService.get('RABBITMQ_URL', 'amqp://localhost:5672');
    
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitMqUrl],
        queue: `${this.serviceName}_events`,
        queueOptions: {
          durable: true,
          exclusive: false,
          autoDelete: false,
        },
      },
    });
  }

  async publish(eventType: string, payload: any, options?: {
    aggregateId?: string;
    correlationId?: string;
    version?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const eventMessage: EventMessage = {
      id: uuidv4(),
      eventType,
      aggregateId: options?.aggregateId || uuidv4(),
      version: options?.version || 1,
      timestamp: new Date(),
      source: this.serviceName,
      correlationId: options?.correlationId,
      payload,
      metadata: options?.metadata,
    };

    try {
      // Publish to RabbitMQ
      await this.client.emit(eventType, eventMessage).toPromise();
      
      // Also emit locally for same-service handlers
      this.eventEmitter.emit(eventType, eventMessage);

      this.logger.debug(`Published event ${eventType}`, {
        eventId: eventMessage.id,
        aggregateId: eventMessage.aggregateId,
        correlationId: eventMessage.correlationId,
      });
    } catch (error) {
      this.logger.error(`Failed to publish event ${eventType}`, {
        error: error.message,
        eventId: eventMessage.id,
        correlationId: options?.correlationId,
      });
      throw error;
    }
  }

  subscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
    this.eventEmitter.on(eventType, async (eventMessage: EventMessage<T>) => {
      try {
        await handler.handle(eventMessage);
        this.logger.debug(`Handled event ${eventType}`, {
          eventId: eventMessage.id,
          correlationId: eventMessage.correlationId,
        });
      } catch (error) {
        this.logger.error(`Failed to handle event ${eventType}`, {
          error: error.message,
          eventId: eventMessage.id,
          correlationId: eventMessage.correlationId,
        });
        // Optionally implement retry logic or dead letter queue
        throw error;
      }
    });
  }

  async request<T = any>(pattern: string, data: any, options?: {
    timeout?: number;
    correlationId?: string;
  }): Promise<T> {
    const requestMessage = {
      id: uuidv4(),
      timestamp: new Date(),
      correlationId: options?.correlationId || uuidv4(),
      payload: data,
    };

    try {
      const response = await this.client
        .send(pattern, requestMessage)
        .toPromise();
      
      this.logger.debug(`Received response for pattern ${pattern}`, {
        correlationId: requestMessage.correlationId,
      });

      return response;
    } catch (error) {
      this.logger.error(`Request failed for pattern ${pattern}`, {
        error: error.message,
        correlationId: requestMessage.correlationId,
      });
      throw error;
    }
  }

  // Trading Signals specific methods
  async publishSignalGenerated(signalData: any, correlationId?: string): Promise<void> {
    await this.publish('signal.generated', signalData, {
      correlationId,
      aggregateId: signalData.id,
      metadata: { source: 'signals-service' },
    });
  }

  async publishSignalUpdated(signalData: any, correlationId?: string): Promise<void> {
    await this.publish('signal.updated', signalData, {
      correlationId,
      aggregateId: signalData.id,
      metadata: { source: 'signals-service' },
    });
  }

  async publishSignalExpired(signalData: any, correlationId?: string): Promise<void> {
    await this.publish('signal.expired', signalData, {
      correlationId,
      aggregateId: signalData.id,
      metadata: { source: 'signals-service' },
    });
  }

  async publishTradeExecuted(tradeData: any, correlationId?: string): Promise<void> {
    await this.publish('trade.executed', tradeData, {
      correlationId,
      aggregateId: tradeData.id,
      metadata: { source: 'trading-service' },
    });
  }

  async publishPaymentCompleted(paymentData: any, correlationId?: string): Promise<void> {
    await this.publish('payment.completed', paymentData, {
      correlationId,
      aggregateId: paymentData.id,
      metadata: { source: 'payment-service' },
    });
  }

  async publishUserRegistered(userData: any, correlationId?: string): Promise<void> {
    await this.publish('user.registered', userData, {
      correlationId,
      aggregateId: userData.id,
      metadata: { source: 'user-management-service' },
    });
  }

  async publishCourseCompleted(courseData: any, correlationId?: string): Promise<void> {
    await this.publish('course.completed', courseData, {
      correlationId,
      aggregateId: courseData.id,
      metadata: { source: 'education-service' },
    });
  }

  async close(): Promise<void> {
    await this.client.close();
    this.logger.log('EventBus connection closed');
  }
}