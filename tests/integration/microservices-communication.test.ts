import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { EventBusService, EventPublisher, EventSubscriber } from '../../packages/microservices-common/src';
import { v4 as uuidv4 } from 'uuid';

describe('Microservices Communication Integration Tests', () => {
  let app: TestingModule;
  let eventBusService: EventBusService;
  let eventPublisher: EventPublisher;
  let eventSubscriber: EventSubscriber;
  let client: ClientProxy;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        ClientsModule.register([
          {
            name: 'TEST_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://localhost:5672'],
              queue: 'test_queue',
              queueOptions: {
                durable: false,
                exclusive: true,
                autoDelete: true,
              },
            },
          },
        ]),
      ],
      providers: [
        EventBusService,
        EventPublisher,
        EventSubscriber,
      ],
    }).compile();

    eventBusService = app.get<EventBusService>(EventBusService);
    eventPublisher = app.get<EventPublisher>(EventPublisher);
    eventSubscriber = app.get<EventSubscriber>(EventSubscriber);
    client = app.get('TEST_SERVICE');
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  describe('Event Bus Communication', () => {
    it('should publish and receive signal generated event', async () => {
      const signalData = {
        id: uuidv4(),
        symbol: 'BTCUSD',
        type: 'BUY',
        price: 50000,
        confidence: 85,
        riskLevel: 'MEDIUM',
        timeFrame: '1H',
        analysis: 'Strong bullish momentum detected',
        createdBy: 'test-analyst',
        targetAudience: ['PREMIUM'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      let receivedEvent: any = null;
      const correlationId = uuidv4();

      // Subscribe to the event
      eventSubscriber.subscribeToSignalGenerated({
        handle: async (event) => {
          receivedEvent = event;
        },
      });

      // Publish the event
      await eventPublisher.publishSignalGenerated(signalData, correlationId);

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.payload.id).toBe(signalData.id);
      expect(receivedEvent.payload.symbol).toBe(signalData.symbol);
      expect(receivedEvent.correlationId).toBe(correlationId);
      expect(receivedEvent.eventType).toBe('signal.generated');
    });

    it('should publish and receive trade executed event', async () => {
      const tradeData = {
        id: uuidv4(),
        userId: uuidv4(),
        symbol: 'ETHUSD',
        side: 'SELL',
        quantity: 10,
        price: 3000,
        accountId: uuidv4(),
        executedAt: new Date(),
      };

      let receivedEvent: any = null;
      const correlationId = uuidv4();

      eventSubscriber.subscribeToTradeExecuted({
        handle: async (event) => {
          receivedEvent = event;
        },
      });

      await eventPublisher.publishTradeExecuted(tradeData, correlationId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.payload.id).toBe(tradeData.id);
      expect(receivedEvent.payload.symbol).toBe(tradeData.symbol);
      expect(receivedEvent.correlationId).toBe(correlationId);
    });

    it('should handle user registration flow', async () => {
      const userData = {
        id: uuidv4(),
        email: 'test@treum.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        subscriptionTier: 'BASIC',
        registeredAt: new Date(),
      };

      let receivedEvent: any = null;
      const correlationId = uuidv4();

      eventSubscriber.subscribeToUserRegistered({
        handle: async (event) => {
          receivedEvent = event;
        },
      });

      await eventPublisher.publishUserRegistered(userData, correlationId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.payload.email).toBe(userData.email);
      expect(receivedEvent.payload.subscriptionTier).toBe(userData.subscriptionTier);
    });

    it('should handle payment completion workflow', async () => {
      const paymentData = {
        id: uuidv4(),
        userId: uuidv4(),
        amount: 99.99,
        currency: 'USD',
        method: 'CARD',
        subscriptionId: uuidv4(),
        processedAt: new Date(),
      };

      let receivedEvent: any = null;
      const correlationId = uuidv4();

      eventSubscriber.subscribeToPaymentCompleted({
        handle: async (event) => {
          receivedEvent = event;
        },
      });

      await eventPublisher.publishPaymentCompleted(paymentData, correlationId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.payload.amount).toBe(paymentData.amount);
      expect(receivedEvent.payload.method).toBe(paymentData.method);
    });
  });

  describe('Cross-Service Event Flows', () => {
    it('should handle complete trading signal workflow', async () => {
      const events: any[] = [];
      const correlationId = uuidv4();

      // Subscribe to all relevant events
      eventSubscriber.subscribeToSignalGenerated({
        handle: async (event) => events.push({ type: 'signal.generated', event }),
      });

      eventSubscriber.subscribeToTradeExecuted({
        handle: async (event) => events.push({ type: 'trade.executed', event }),
      });

      eventSubscriber.subscribeToSignalExpired({
        handle: async (event) => events.push({ type: 'signal.expired', event }),
      });

      // 1. Generate a signal
      const signalId = uuidv4();
      await eventPublisher.publishSignalGenerated({
        id: signalId,
        symbol: 'AAPL',
        type: 'BUY',
        price: 150,
        confidence: 90,
        riskLevel: 'LOW',
        timeFrame: '4H',
        analysis: 'Strong technical setup',
        createdBy: 'premium-analyst',
        targetAudience: ['PREMIUM'],
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      }, correlationId);

      // 2. Execute a trade based on the signal
      await eventPublisher.publishTradeExecuted({
        id: uuidv4(),
        userId: uuidv4(),
        symbol: 'AAPL',
        side: 'BUY',
        quantity: 100,
        price: 150.5,
        signalId: signalId,
        accountId: uuidv4(),
        executedAt: new Date(),
      }, correlationId);

      // 3. Signal expires
      await eventPublisher.publishSignalExpired({
        id: signalId,
        symbol: 'AAPL',
        finalPrice: 152,
        performance: 1.0, // 1% gain
      }, correlationId);

      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(events).toHaveLength(3);
      expect(events.find(e => e.type === 'signal.generated')).toBeDefined();
      expect(events.find(e => e.type === 'trade.executed')).toBeDefined();
      expect(events.find(e => e.type === 'signal.expired')).toBeDefined();

      // Verify correlation ID is maintained across all events
      events.forEach(eventWrapper => {
        expect(eventWrapper.event.correlationId).toBe(correlationId);
      });
    });

    it('should handle user subscription upgrade flow', async () => {
      const events: any[] = [];
      const correlationId = uuidv4();
      const userId = uuidv4();

      // Subscribe to relevant events
      eventSubscriber.subscribeToPaymentCompleted({
        handle: async (event) => events.push({ type: 'payment.completed', event }),
      });

      eventSubscriber.subscribeToUserSubscriptionChanged({
        handle: async (event) => events.push({ type: 'user.subscription.changed', event }),
      });

      // 1. Payment is completed
      await eventPublisher.publishPaymentCompleted({
        id: uuidv4(),
        userId: userId,
        amount: 199.99,
        currency: 'USD',
        method: 'STRIPE',
        subscriptionId: uuidv4(),
        processedAt: new Date(),
      }, correlationId);

      // 2. User subscription is upgraded
      await eventPublisher.publishUserSubscriptionChanged({
        userId: userId,
        previousTier: 'BASIC',
        newTier: 'PREMIUM',
        changedAt: new Date(),
      }, correlationId);

      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(events).toHaveLength(2);
      expect(events.find(e => e.type === 'payment.completed')).toBeDefined();
      expect(events.find(e => e.type === 'user.subscription.changed')).toBeDefined();

      // Verify the user ID is consistent across events
      events.forEach(eventWrapper => {
        expect([eventWrapper.event.payload.userId, eventWrapper.event.aggregateId]).toContain(userId);
      });
    });
  });

  describe('Event Correlation and Tracing', () => {
    it('should maintain correlation ID across service boundaries', async () => {
      const correlationId = uuidv4();
      let receivedCorrelationId: string;

      eventSubscriber.subscribeToSignalGenerated({
        handle: async (event) => {
          receivedCorrelationId = event.correlationId;
        },
      });

      await eventPublisher.publishSignalGenerated({
        id: uuidv4(),
        symbol: 'TSLA',
        type: 'SELL',
        price: 800,
        confidence: 75,
        riskLevel: 'HIGH',
        timeFrame: '1D',
        analysis: 'Overbought conditions',
        createdBy: 'quant-model-v2',
        targetAudience: ['PREMIUM', 'ENTERPRISE'],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }, correlationId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedCorrelationId).toBe(correlationId);
    });

    it('should include proper event metadata', async () => {
      let receivedEvent: any;

      eventSubscriber.subscribeToUserActivity({
        handle: async (event) => {
          receivedEvent = event;
        },
      });

      await eventPublisher.publishUserActivity({
        userId: uuidv4(),
        activityType: 'SIGNAL_FOLLOWED',
        resourceId: uuidv4(),
        resourceType: 'trading_signal',
        metadata: {
          signalSymbol: 'GOLD',
          signalType: 'BUY',
          allocationAmount: 5000,
        },
        timestamp: new Date(),
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(receivedEvent).toBeDefined();
      expect(receivedEvent.timestamp).toBeDefined();
      expect(receivedEvent.source).toBeDefined();
      expect(receivedEvent.version).toBe(1);
      expect(receivedEvent.payload.metadata.signalSymbol).toBe('GOLD');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle event publication failures gracefully', async () => {
      // Temporarily close the client to simulate connection failure
      await client.close();

      let errorThrown = false;
      try {
        await eventPublisher.publishSignalGenerated({
          id: uuidv4(),
          symbol: 'TEST',
          type: 'BUY',
          price: 100,
          confidence: 50,
          riskLevel: 'MEDIUM',
          timeFrame: '1H',
          analysis: 'Test signal',
          createdBy: 'test',
          targetAudience: ['FREE'],
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        });
      } catch (error) {
        errorThrown = true;
        expect(error).toBeDefined();
      }

      expect(errorThrown).toBe(true);

      // Reconnect for other tests
      await client.connect();
    });

    it('should handle event processing failures without breaking the flow', async () => {
      const processedEvents: string[] = [];

      // Handler that throws an error
      eventSubscriber.subscribeToSignalGenerated({
        handle: async (event) => {
          processedEvents.push('error-handler');
          throw new Error('Processing failed');
        },
      });

      // Another handler that should still work
      eventSubscriber.subscribeToSignalGenerated({
        handle: async (event) => {
          processedEvents.push('success-handler');
        },
      });

      await eventPublisher.publishSignalGenerated({
        id: uuidv4(),
        symbol: 'ERROR_TEST',
        type: 'BUY',
        price: 100,
        confidence: 50,
        riskLevel: 'LOW',
        timeFrame: '1H',
        analysis: 'Error test signal',
        createdBy: 'test',
        targetAudience: ['FREE'],
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Both handlers should have been called, despite one throwing an error
      expect(processedEvents).toContain('error-handler');
      expect(processedEvents).toContain('success-handler');
    });
  });
});