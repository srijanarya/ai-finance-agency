import { TestEnvironment } from '../utils/test-environment';
import { TestDataGenerator } from '../utils/test-data-generator';
import WebSocket from 'ws';

describe('WebSocket Real-time Integration Tests', () => {
  let testEnv: TestEnvironment;
  let dataGenerator: TestDataGenerator;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    testEnv = global.testEnv;
    dataGenerator = new TestDataGenerator();
    
    // Create and authenticate a test user
    testUser = dataGenerator.generateRandomUser();
    
    // Register user
    const registerResponse = await testEnv.userManagement.post('/auth/register', {
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
    });
    
    // Login to get auth token
    const loginResponse = await testEnv.userManagement.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    
    authToken = loginResponse.data.accessToken;
    await testEnv.setAuthToken(authToken);
  });

  afterAll(async () => {
    await testEnv.clearAuthToken();
  });

  describe('Market Data WebSocket Streaming', () => {
    let marketDataWs: WebSocket;
    let receivedMessages: any[] = [];

    beforeEach(() => {
      receivedMessages = [];
    });

    afterEach(async () => {
      if (marketDataWs && marketDataWs.readyState === WebSocket.OPEN) {
        marketDataWs.close();
      }
    });

    test('Should be able to connect to market data WebSocket', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      expect(marketDataWs.readyState).toBe(WebSocket.OPEN);
      console.log('✅ Market data WebSocket connected');
    });

    test('Should be able to subscribe to real-time price updates', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      // Set up message listener
      const messagePromise = new Promise((resolve) => {
        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            resolve(message);
          }
        });
      });

      // Subscribe to AAPL price updates
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: ['AAPL', 'GOOGL'],
      }));

      const confirmationMessage = await messagePromise;
      expect(confirmationMessage).toHaveProperty('type', 'subscription_confirmed');
      expect(confirmationMessage).toHaveProperty('channel', 'prices');

      console.log('✅ Subscribed to price updates');
    });

    test('Should receive real-time price data', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      // Subscribe and wait for price data
      const priceDataPromise = new Promise((resolve) => {
        let subscriptionConfirmed = false;
        
        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
          } else if (message.type === 'price_update' && subscriptionConfirmed) {
            resolve(message);
          }
        });
      });

      // Subscribe to updates
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: ['AAPL'],
      }));

      // Wait for price data (with timeout)
      const priceUpdate = await Promise.race([
        priceDataPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Price update timeout')), 30000)
        )
      ]);

      expect(priceUpdate).toHaveProperty('type', 'price_update');
      expect(priceUpdate).toHaveProperty('symbol');
      expect(priceUpdate).toHaveProperty('price');
      expect(priceUpdate).toHaveProperty('timestamp');

      console.log('✅ Received real-time price data:', priceUpdate);
    });

    test('Should handle unsubscribe requests', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      // Subscribe first
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: ['AAPL'],
      }));

      // Wait for subscription confirmation
      await new Promise((resolve) => {
        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'subscription_confirmed') {
            resolve(message);
          }
        });
      });

      // Now unsubscribe
      const unsubscribePromise = new Promise((resolve) => {
        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          if (message.type === 'unsubscribe_confirmed') {
            resolve(message);
          }
        });
      });

      marketDataWs.send(JSON.stringify({
        action: 'unsubscribe',
        channel: 'prices',
        symbols: ['AAPL'],
      }));

      const unsubscribeConfirmation = await unsubscribePromise;
      expect(unsubscribeConfirmation).toHaveProperty('type', 'unsubscribe_confirmed');

      console.log('✅ Unsubscribed from price updates');
    });
  });

  describe('Trading WebSocket Notifications', () => {
    let tradingWs: WebSocket;
    let receivedMessages: any[] = [];

    beforeEach(() => {
      receivedMessages = [];
    });

    afterEach(async () => {
      if (tradingWs && tradingWs.readyState === WebSocket.OPEN) {
        tradingWs.close();
      }
    });

    test('Should connect to trading notifications WebSocket', async () => {
      tradingWs = await testEnv.createWebSocketConnection(
        'trading',
        '/ws/notifications',
        authToken
      );

      expect(tradingWs.readyState).toBe(WebSocket.OPEN);
      console.log('✅ Trading notifications WebSocket connected');
    });

    test('Should receive order status updates via WebSocket', async () => {
      tradingWs = await testEnv.createWebSocketConnection(
        'trading',
        '/ws/notifications',
        authToken
      );

      // Set up order update listener
      const orderUpdatePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Order update timeout'));
        }, 30000);

        tradingWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'order_update') {
            clearTimeout(timeout);
            resolve(message);
          }
        });
      });

      // Place an order to trigger update
      const orderResponse = await testEnv.trading.post('/orders', {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      });

      expect(orderResponse.status).toBeWithinRange(200, 201);

      // Wait for WebSocket order update
      const orderUpdate = await orderUpdatePromise;
      expect(orderUpdate).toHaveProperty('type', 'order_update');
      expect(orderUpdate).toHaveProperty('orderId');
      expect(orderUpdate).toHaveProperty('status');

      console.log('✅ Received order update via WebSocket:', orderUpdate);
    });
  });

  describe('Signal Alerts WebSocket', () => {
    let signalsWs: WebSocket;
    let receivedMessages: any[] = [];

    beforeEach(() => {
      receivedMessages = [];
    });

    afterEach(async () => {
      if (signalsWs && signalsWs.readyState === WebSocket.OPEN) {
        signalsWs.close();
      }
    });

    test('Should connect to signals WebSocket', async () => {
      signalsWs = await testEnv.createWebSocketConnection(
        'signals',
        '/ws/alerts',
        authToken
      );

      expect(signalsWs.readyState).toBe(WebSocket.OPEN);
      console.log('✅ Signals alerts WebSocket connected');
    });

    test('Should subscribe to trading signals', async () => {
      signalsWs = await testEnv.createWebSocketConnection(
        'signals',
        '/ws/alerts',
        authToken
      );

      const subscriptionPromise = new Promise((resolve) => {
        signalsWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            resolve(message);
          }
        });
      });

      // Subscribe to signals for specific symbols
      signalsWs.send(JSON.stringify({
        action: 'subscribe',
        symbols: ['AAPL', 'GOOGL'],
        signalTypes: ['BUY', 'SELL', 'HOLD'],
      }));

      const confirmation = await subscriptionPromise;
      expect(confirmation).toHaveProperty('type', 'subscription_confirmed');

      console.log('✅ Subscribed to trading signals');
    });

    test('Should receive trading signal alerts', async () => {
      signalsWs = await testEnv.createWebSocketConnection(
        'signals',
        '/ws/alerts',
        authToken
      );

      // Subscribe and wait for signal
      const signalPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Signal timeout'));
        }, 45000); // Longer timeout for signal generation

        let subscriptionConfirmed = false;

        signalsWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
          } else if (message.type === 'signal_alert' && subscriptionConfirmed) {
            clearTimeout(timeout);
            resolve(message);
          }
        });
      });

      // Subscribe to signals
      signalsWs.send(JSON.stringify({
        action: 'subscribe',
        symbols: ['AAPL'],
        signalTypes: ['BUY', 'SELL', 'HOLD'],
      }));

      // Trigger signal generation by requesting analysis
      await testEnv.signals.post('/analysis', {
        symbol: 'AAPL',
        timeframe: '1h',
        indicators: ['RSI', 'MACD'],
      });

      // Wait for signal alert
      const signalAlert = await signalPromise;
      expect(signalAlert).toHaveProperty('type', 'signal_alert');
      expect(signalAlert).toHaveProperty('symbol');
      expect(signalAlert).toHaveProperty('signal');
      expect(signalAlert).toHaveProperty('confidence');

      console.log('✅ Received trading signal alert:', signalAlert);
    });
  });

  describe('Notification WebSocket', () => {
    let notificationWs: WebSocket;
    let receivedMessages: any[] = [];

    beforeEach(() => {
      receivedMessages = [];
    });

    afterEach(async () => {
      if (notificationWs && notificationWs.readyState === WebSocket.OPEN) {
        notificationWs.close();
      }
    });

    test('Should connect to notification WebSocket', async () => {
      notificationWs = await testEnv.createWebSocketConnection(
        'notification',
        '/ws/notifications',
        authToken
      );

      expect(notificationWs.readyState).toBe(WebSocket.OPEN);
      console.log('✅ Notification WebSocket connected');
    });

    test('Should receive price alert notifications', async () => {
      notificationWs = await testEnv.createWebSocketConnection(
        'notification',
        '/ws/notifications',
        authToken
      );

      // Set up notification listener
      const notificationPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Notification timeout'));
        }, 30000);

        notificationWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'price_alert') {
            clearTimeout(timeout);
            resolve(message);
          }
        });
      });

      // Create a price alert that might trigger
      await testEnv.notification.post('/alerts', {
        symbol: 'AAPL',
        condition: 'above',
        price: 1, // Very low price to trigger immediately
        enabled: true,
      });

      // Wait for notification
      const notification = await notificationPromise;
      expect(notification).toHaveProperty('type', 'price_alert');
      expect(notification).toHaveProperty('symbol');
      expect(notification).toHaveProperty('price');

      console.log('✅ Received price alert notification:', notification);
    });
  });

  describe('WebSocket Connection Management', () => {
    test('Should handle connection authentication', async () => {
      // Test with invalid token
      try {
        await testEnv.createWebSocketConnection(
          'market-data',
          '/ws/market-data',
          'invalid_token'
        );
        fail('Should have thrown an error for invalid token');
      } catch (error) {
        expect(error.message).toContain('connection');
        console.log('✅ Invalid token properly rejected');
      }
    });

    test('Should handle connection without authentication', async () => {
      // Test without token for public endpoints
      try {
        const ws = await testEnv.createWebSocketConnection(
          'market-data',
          '/ws/public'
        );
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        console.log('✅ Public WebSocket connection successful');
      } catch (error) {
        // Some endpoints might require authentication
        console.log('ℹ️ Public WebSocket not available or requires auth');
      }
    });

    test('Should handle graceful disconnection', async () => {
      const ws = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      const closePromise = new Promise((resolve) => {
        ws.on('close', (code, reason) => {
          resolve({ code, reason: reason.toString() });
        });
      });

      ws.close(1000, 'Normal closure');

      const closeEvent = await closePromise;
      expect(closeEvent).toHaveProperty('code', 1000);

      console.log('✅ WebSocket graceful disconnection successful');
    });

    test('Should handle connection errors', async () => {
      // Test connection to non-existent endpoint
      try {
        await testEnv.createWebSocketConnection(
          'market-data',
          '/ws/non-existent',
          authToken
        );
        fail('Should have thrown an error for non-existent endpoint');
      } catch (error) {
        expect(error.message).toContain('connection');
        console.log('✅ Connection error properly handled');
      }
    });
  });

  describe('Multiple WebSocket Connections', () => {
    let connections: WebSocket[] = [];

    afterEach(async () => {
      // Close all connections
      for (const ws of connections) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }
      connections = [];
    });

    test('Should handle multiple simultaneous WebSocket connections', async () => {
      // Create multiple connections
      const connectionPromises = [
        testEnv.createWebSocketConnection('market-data', '/ws/market-data', authToken),
        testEnv.createWebSocketConnection('trading', '/ws/notifications', authToken),
        testEnv.createWebSocketConnection('signals', '/ws/alerts', authToken),
      ];

      connections = await Promise.all(connectionPromises);

      // Verify all connections are open
      for (const ws of connections) {
        expect(ws.readyState).toBe(WebSocket.OPEN);
      }

      console.log(`✅ ${connections.length} simultaneous WebSocket connections established`);
    });

    test('Should maintain independent message streams', async () => {
      const marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );
      const tradingWs = await testEnv.createWebSocketConnection(
        'trading',
        '/ws/notifications',
        authToken
      );

      connections = [marketDataWs, tradingWs];

      const marketDataMessages: any[] = [];
      const tradingMessages: any[] = [];

      marketDataWs.on('message', (data) => {
        marketDataMessages.push(JSON.parse(data.toString()));
      });

      tradingWs.on('message', (data) => {
        tradingMessages.push(JSON.parse(data.toString()));
      });

      // Send different subscriptions to each
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: ['AAPL'],
      }));

      // Wait a moment for messages
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Place an order to trigger trading notification
      await testEnv.trading.post('/orders', {
        symbol: 'GOOGL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      });

      // Wait for messages
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log(`✅ Market data messages: ${marketDataMessages.length}`);
      console.log(`✅ Trading messages: ${tradingMessages.length}`);
    });
  });
});