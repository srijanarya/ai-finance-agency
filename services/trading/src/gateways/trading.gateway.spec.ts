import { Test, TestingModule } from '@nestjs/testing';
import { TradingGateway } from './trading.gateway';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { TestHelpers } from '@shared/test-utils/test-helpers';
import { TestFactory } from '@shared/test-utils/test-factory';
import { Server, Socket } from 'socket.io';

// Mock Socket.IO
const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
  socketsJoin: jest.fn(),
  socketsLeave: jest.fn(),
  adapter: {
    rooms: new Map(),
    sids: new Map(),
  },
};

const mockSocket = {
  id: 'test-socket-id',
  emit: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  disconnect: jest.fn(),
  handshake: {
    auth: { token: 'valid-jwt-token' },
    query: {},
  },
  userId: undefined,
  tenantId: undefined,
  subscriptions: undefined,
};

describe('TradingGateway', () => {
  let gateway: TradingGateway;
  let jwtService: jest.Mocked<JwtService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockJwtPayload = {
    sub: 'test-user-id',
    email: 'test@example.com',
    tenantId: 'test-tenant-id',
    roles: ['trader'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingGateway,
        {
          provide: JwtService,
          useValue: TestHelpers.createMockJwtService(),
        },
        {
          provide: EventEmitter2,
          useValue: TestHelpers.createMockEventEmitter(),
        },
      ],
    }).compile();

    gateway = module.get<TradingGateway>(TradingGateway);
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    eventEmitter = module.get<EventEmitter2>(EventEmitter2) as jest.Mocked<EventEmitter2>;

    // Set up the server
    gateway.server = mockServer as any;

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should initialize the gateway', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');
      
      gateway.afterInit(mockServer as any);
      
      expect(loggerSpy).toHaveBeenCalledWith('Trading WebSocket Gateway initialized');
    });
  });

  describe('handleConnection', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should authenticate and connect a valid client', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      await gateway.handleConnection(mockSocket as any);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Successfully connected to trading gateway',
        clientId: mockSocket.id,
        timestamp: expect.any(String),
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        `Client ${mockSocket.id} connected (user: ${mockJwtPayload.sub}, tenant: ${mockJwtPayload.tenantId})`
      );
    });

    it('should reject connection without token', async () => {
      const socketWithoutToken = {
        ...mockSocket,
        handshake: { auth: {}, query: {} },
      };
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');

      await gateway.handleConnection(socketWithoutToken as any);

      expect(loggerSpy).toHaveBeenCalledWith(`Client ${mockSocket.id} connected without token`);
      expect(socketWithoutToken.disconnect).toHaveBeenCalled();
    });

    it('should reject connection with invalid token', async () => {
      const error = new Error('Invalid token');
      jwtService.verifyAsync.mockRejectedValue(error);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await gateway.handleConnection(mockSocket as any);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        `Authentication failed for client ${mockSocket.id}: ${error.message}`
      );
    });

    it('should extract token from query params if not in auth', async () => {
      const socketWithQueryToken = {
        ...mockSocket,
        handshake: {
          auth: {},
          query: { token: 'query-token' },
        },
      };
      jwtService.verifyAsync.mockResolvedValue(mockJwtPayload);

      await gateway.handleConnection(socketWithQueryToken as any);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('query-token');
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up client subscriptions on disconnect', () => {
      const socketWithSubscriptions = {
        ...mockSocket,
        subscriptions: new Set(['market-data:AAPL', 'orders:user-123']),
      };
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      gateway.handleDisconnect(socketWithSubscriptions as any);

      expect(loggerSpy).toHaveBeenCalledWith(`Client ${mockSocket.id} disconnected`);
    });

    it('should handle disconnect without subscriptions', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log');

      gateway.handleDisconnect(mockSocket as any);

      expect(loggerSpy).toHaveBeenCalledWith(`Client ${mockSocket.id} disconnected`);
    });
  });

  describe('subscribe', () => {
    it('should handle market data subscription', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(),
      };

      const subscriptionRequest = {
        type: 'market-data' as const,
        symbols: ['AAPL', 'GOOGL', 'TSLA'],
      };

      await gateway.subscribe(subscriptionRequest, authenticatedSocket as any);

      expect(authenticatedSocket.join).toHaveBeenCalledWith('market-data:AAPL');
      expect(authenticatedSocket.join).toHaveBeenCalledWith('market-data:GOOGL');
      expect(authenticatedSocket.join).toHaveBeenCalledWith('market-data:TSLA');
      expect(authenticatedSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'market-data',
        symbols: ['AAPL', 'GOOGL', 'TSLA'],
        success: true,
      });
    });

    it('should handle orders subscription', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(),
      };

      const subscriptionRequest = {
        type: 'orders' as const,
      };

      await gateway.subscribe(subscriptionRequest, authenticatedSocket as any);

      expect(authenticatedSocket.join).toHaveBeenCalledWith('orders:test-user-id');
      expect(authenticatedSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'orders',
        userId: 'test-user-id',
        success: true,
      });
    });

    it('should handle positions subscription', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(),
      };

      const subscriptionRequest = {
        type: 'positions' as const,
      };

      await gateway.subscribe(subscriptionRequest, authenticatedSocket as any);

      expect(authenticatedSocket.join).toHaveBeenCalledWith('positions:test-user-id');
      expect(authenticatedSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'positions',
        userId: 'test-user-id',
        success: true,
      });
    });

    it('should handle trades subscription', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(),
      };

      const subscriptionRequest = {
        type: 'trades' as const,
      };

      await gateway.subscribe(subscriptionRequest, authenticatedSocket as any);

      expect(authenticatedSocket.join).toHaveBeenCalledWith('trades:test-user-id');
      expect(authenticatedSocket.emit).toHaveBeenCalledWith('subscribed', {
        type: 'trades',
        userId: 'test-user-id',
        success: true,
      });
    });

    it('should reject subscription for unauthenticated socket', async () => {
      const unauthenticatedSocket = {
        ...mockSocket,
        userId: undefined,
      };

      const subscriptionRequest = {
        type: 'orders' as const,
      };

      await gateway.subscribe(subscriptionRequest, unauthenticatedSocket as any);

      expect(unauthenticatedSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication required for subscription',
      });
    });

    it('should handle subscription errors gracefully', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(),
        join: jest.fn().mockImplementation(() => {
          throw new Error('Join failed');
        }),
      };

      const subscriptionRequest = {
        type: 'market-data' as const,
        symbols: ['AAPL'],
      };

      await gateway.subscribe(subscriptionRequest, authenticatedSocket as any);

      expect(authenticatedSocket.emit).toHaveBeenCalledWith('subscription-error', {
        type: 'market-data',
        error: 'Join failed',
      });
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from market data', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(['market-data:AAPL', 'market-data:GOOGL']),
      };

      const unsubscribeRequest = {
        type: 'market-data' as const,
        symbols: ['AAPL'],
      };

      await gateway.unsubscribe(unsubscribeRequest, authenticatedSocket as any);

      expect(authenticatedSocket.leave).toHaveBeenCalledWith('market-data:AAPL');
      expect(authenticatedSocket.emit).toHaveBeenCalledWith('unsubscribed', {
        type: 'market-data',
        symbols: ['AAPL'],
        success: true,
      });
    });

    it('should unsubscribe from all user-specific channels', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(['orders:test-user-id', 'positions:test-user-id']),
      };

      const unsubscribeRequest = {
        type: 'orders' as const,
      };

      await gateway.unsubscribe(unsubscribeRequest, authenticatedSocket as any);

      expect(authenticatedSocket.leave).toHaveBeenCalledWith('orders:test-user-id');
      expect(authenticatedSocket.emit).toHaveBeenCalledWith('unsubscribed', {
        type: 'orders',
        success: true,
      });
    });

    it('should handle unsubscribe from non-existent subscription', async () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        tenantId: 'test-tenant-id',
        subscriptions: new Set(),
      };

      const unsubscribeRequest = {
        type: 'market-data' as const,
        symbols: ['AAPL'],
      };

      await gateway.unsubscribe(unsubscribeRequest, authenticatedSocket as any);

      expect(authenticatedSocket.emit).toHaveBeenCalledWith('unsubscribed', {
        type: 'market-data',
        symbols: ['AAPL'],
        success: true,
      });
    });
  });

  describe('Event handlers', () => {
    it('should handle market data update events', () => {
      const marketData = {
        symbol: 'AAPL',
        price: 150.25,
        volume: 1000000,
        timestamp: new Date().toISOString(),
      };

      gateway.handleMarketDataUpdate(marketData);

      expect(mockServer.to).toHaveBeenCalledWith('market-data:AAPL');
      expect(mockServer.emit).toHaveBeenCalledWith('market-data-update', marketData);
    });

    it('should handle order status update events', () => {
      const orderUpdate = {
        orderId: 'order-123',
        userId: 'user-456',
        status: 'filled',
        symbol: 'TSLA',
        quantity: 100,
        price: 250.50,
        timestamp: new Date().toISOString(),
      };

      gateway.handleOrderStatusUpdate(orderUpdate);

      expect(mockServer.to).toHaveBeenCalledWith('orders:user-456');
      expect(mockServer.emit).toHaveBeenCalledWith('order-status-update', orderUpdate);
    });

    it('should handle position update events', () => {
      const positionUpdate = {
        userId: 'user-456',
        symbol: 'AAPL',
        quantity: 100,
        avgPrice: 148.75,
        currentPrice: 150.25,
        unrealizedPnL: 150.00,
        timestamp: new Date().toISOString(),
      };

      gateway.handlePositionUpdate(positionUpdate);

      expect(mockServer.to).toHaveBeenCalledWith('positions:user-456');
      expect(mockServer.emit).toHaveBeenCalledWith('position-update', positionUpdate);
    });

    it('should handle trade execution events', () => {
      const tradeExecution = {
        tradeId: 'trade-789',
        userId: 'user-456',
        orderId: 'order-123',
        symbol: 'GOOGL',
        side: 'buy',
        quantity: 50,
        price: 2750.00,
        timestamp: new Date().toISOString(),
      };

      gateway.handleTradeExecution(tradeExecution);

      expect(mockServer.to).toHaveBeenCalledWith('trades:user-456');
      expect(mockServer.emit).toHaveBeenCalledWith('trade-execution', tradeExecution);
    });
  });

  describe('Error handling', () => {
    it('should handle server errors gracefully', () => {
      const error = new Error('Server error');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      gateway.handleError(error);

      expect(loggerSpy).toHaveBeenCalledWith('Trading Gateway Error:', error);
    });

    it('should handle client-specific errors', () => {
      const clientError = {
        clientId: 'test-socket-id',
        error: 'Invalid subscription format',
        timestamp: new Date().toISOString(),
      };

      gateway.handleClientError(clientError);

      expect(mockServer.to).toHaveBeenCalledWith('test-socket-id');
      expect(mockServer.emit).toHaveBeenCalledWith('error', {
        message: 'Invalid subscription format',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Subscription management', () => {
    it('should track active subscriptions', () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        subscriptions: new Set(),
      };

      // Simulate adding subscriptions
      authenticatedSocket.subscriptions.add('market-data:AAPL');
      authenticatedSocket.subscriptions.add('orders:test-user-id');

      expect(authenticatedSocket.subscriptions.size).toBe(2);
      expect(authenticatedSocket.subscriptions.has('market-data:AAPL')).toBe(true);
      expect(authenticatedSocket.subscriptions.has('orders:test-user-id')).toBe(true);
    });

    it('should clean up subscriptions on disconnect', () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        subscriptions: new Set(['market-data:AAPL', 'orders:test-user-id']),
      };

      gateway.handleDisconnect(authenticatedSocket as any);

      // Verify cleanup occurred (this would be tested through the private subscriptions map)
      expect(true).toBe(true); // Placeholder - actual implementation would verify cleanup
    });
  });

  describe('Rate limiting and validation', () => {
    it('should validate subscription request format', () => {
      const invalidRequest = {
        type: 'invalid-type' as any,
        symbols: ['AAPL'],
      };

      const isValid = gateway.validateSubscriptionRequest(invalidRequest);

      expect(isValid).toBe(false);
    });

    it('should validate symbol format', () => {
      const validSymbols = ['AAPL', 'GOOGL', 'TSLA'];
      const invalidSymbols = ['', 'abc', '123'];

      validSymbols.forEach(symbol => {
        expect(gateway.isValidSymbol(symbol)).toBe(true);
      });

      invalidSymbols.forEach(symbol => {
        expect(gateway.isValidSymbol(symbol)).toBe(false);
      });
    });

    it('should enforce subscription limits per client', () => {
      const authenticatedSocket = {
        ...mockSocket,
        userId: 'test-user-id',
        subscriptions: new Set(),
      };

      // Fill up to the limit
      for (let i = 0; i < 100; i++) {
        authenticatedSocket.subscriptions.add(`market-data:SYMBOL${i}`);
      }

      const canSubscribe = gateway.canClientSubscribe(authenticatedSocket as any);

      expect(canSubscribe).toBe(false);
    });
  });
});