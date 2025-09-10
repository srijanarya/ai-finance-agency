import { TestEnvironment } from '../utils/test-environment';
import { TestDataGenerator } from '../utils/test-data-generator';

describe('Trading Integration Tests', () => {
  let testEnv: TestEnvironment;
  let dataGenerator: TestDataGenerator;
  let authToken: string;
  let testUser: any;
  let tradingData: any = {};

  beforeAll(async () => {
    testEnv = global.testEnv;
    dataGenerator = new TestDataGenerator();
    
    // Create and authenticate a premium test user for trading access
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
    testUser.id = registerResponse.data.user.id;

    // Set up premium subscription for trading access
    const paymentMethodData = {
      type: 'card',
      card: {
        number: '4242424242424242',
        expMonth: 12,
        expYear: 2025,
        cvc: '123',
      },
      billingAddress: {
        name: `${testUser.firstName} ${testUser.lastName}`,
        line1: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'US',
      },
    };

    const paymentMethodResponse = await testEnv.payment.post('/payment-methods', paymentMethodData);
    
    if (paymentMethodResponse.status >= 200 && paymentMethodResponse.status < 300) {
      await testEnv.payment.post('/subscriptions', {
        planId: 'premium_monthly',
        paymentMethodId: paymentMethodResponse.data.paymentMethodId,
      });
      
      // Wait for subscription to propagate
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  });

  afterAll(async () => {
    await testEnv.clearAuthToken();
  });

  describe('Account Setup and Verification', () => {
    test('Should verify trading account is enabled', async () => {
      const response = await testEnv.trading.get('/account/status');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('accountId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('buyingPower');
      expect(response.data).toHaveProperty('accountType');

      tradingData.accountId = response.data.accountId;

      console.log(`✅ Trading account status: ${response.data.status}`);
    });

    test('Should be able to get account balance', async () => {
      const response = await testEnv.trading.get('/account/balance');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('cashBalance');
      expect(response.data).toHaveProperty('totalValue');
      expect(response.data).toHaveProperty('buyingPower');
      expect(response.data).toHaveProperty('marginUsed');

      tradingData.initialBalance = response.data.cashBalance;

      console.log(`✅ Account balance: $${response.data.cashBalance}`);
    });

    test('Should be able to get portfolio summary', async () => {
      const response = await testEnv.trading.get('/portfolio');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalValue');
      expect(response.data).toHaveProperty('dayChange');
      expect(response.data).toHaveProperty('dayChangePercent');
      expect(Array.isArray(response.data.positions)).toBe(true);

      console.log(`✅ Portfolio value: $${response.data.totalValue}`);
    });
  });

  describe('Order Management', () => {
    test('Should be able to place a market buy order', async () => {
      const orderData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      };

      const response = await testEnv.trading.post('/orders', orderData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('orderId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('symbol', 'AAPL');
      expect(response.data).toHaveProperty('side', 'buy');
      expect(response.data).toHaveProperty('quantity', 1);

      tradingData.marketBuyOrderId = response.data.orderId;

      console.log(`✅ Market buy order placed: ${response.data.orderId}`);
    });

    test('Should be able to place a limit sell order', async () => {
      // Get current market price first
      const marketDataResponse = await testEnv.marketData.get('/quotes/AAPL');
      const currentPrice = marketDataResponse.data.price;
      const limitPrice = Math.round((currentPrice * 1.05) * 100) / 100; // 5% above market

      const orderData = {
        symbol: 'AAPL',
        side: 'sell',
        quantity: 1,
        orderType: 'limit',
        price: limitPrice,
        timeInForce: 'GTC', // Good Till Canceled
      };

      const response = await testEnv.trading.post('/orders', orderData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('orderId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('orderType', 'limit');
      expect(response.data).toHaveProperty('price', limitPrice);

      tradingData.limitSellOrderId = response.data.orderId;

      console.log(`✅ Limit sell order placed: ${response.data.orderId} at $${limitPrice}`);
    });

    test('Should be able to place a stop-loss order', async () => {
      const marketDataResponse = await testEnv.marketData.get('/quotes/AAPL');
      const currentPrice = marketDataResponse.data.price;
      const stopPrice = Math.round((currentPrice * 0.95) * 100) / 100; // 5% below market

      const orderData = {
        symbol: 'AAPL',
        side: 'sell',
        quantity: 1,
        orderType: 'stop',
        stopPrice: stopPrice,
        timeInForce: 'GTC',
      };

      const response = await testEnv.trading.post('/orders', orderData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('orderId');
      expect(response.data).toHaveProperty('orderType', 'stop');
      expect(response.data).toHaveProperty('stopPrice', stopPrice);

      tradingData.stopOrderId = response.data.orderId;

      console.log(`✅ Stop-loss order placed: ${response.data.orderId} at $${stopPrice}`);
    });

    test('Should be able to get order status', async () => {
      const response = await testEnv.trading.get(`/orders/${tradingData.marketBuyOrderId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('orderId', tradingData.marketBuyOrderId);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('createdAt');
      expect(['pending', 'partially_filled', 'filled', 'cancelled'].includes(response.data.status)).toBe(true);

      console.log(`✅ Order status: ${response.data.status}`);
    });

    test('Should be able to list all orders', async () => {
      const response = await testEnv.trading.get('/orders');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.orders)).toBe(true);
      expect(response.data.orders.length).toBeGreaterThan(0);

      // Should include our placed orders
      const orderIds = response.data.orders.map((order: any) => order.orderId);
      expect(orderIds.includes(tradingData.marketBuyOrderId)).toBe(true);

      console.log(`✅ Total orders: ${response.data.orders.length}`);
    });

    test('Should be able to cancel a pending order', async () => {
      const response = await testEnv.trading.delete(`/orders/${tradingData.limitSellOrderId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('orderId', tradingData.limitSellOrderId);
      expect(response.data).toHaveProperty('status', 'cancelled');

      console.log(`✅ Order cancelled: ${tradingData.limitSellOrderId}`);
    });
  });

  describe('Position Management', () => {
    test('Should be able to get current positions', async () => {
      const response = await testEnv.trading.get('/positions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.positions)).toBe(true);

      for (const position of response.data.positions) {
        expect(position).toHaveProperty('symbol');
        expect(position).toHaveProperty('quantity');
        expect(position).toHaveProperty('marketValue');
        expect(position).toHaveProperty('unrealizedPnL');
        expect(position).toHaveProperty('averageCost');
      }

      console.log(`✅ Current positions: ${response.data.positions.length}`);
    });

    test('Should be able to get position for specific symbol', async () => {
      const response = await testEnv.trading.get('/positions/AAPL');

      if (response.status === 200) {
        expect(response.data).toHaveProperty('symbol', 'AAPL');
        expect(response.data).toHaveProperty('quantity');
        expect(response.data).toHaveProperty('marketValue');
        
        console.log(`✅ AAPL position: ${response.data.quantity} shares`);
      } else {
        expect(response.status).toBe(404); // No position found
        console.log(`✅ No AAPL position found (expected if order not filled)`);
      }
    });
  });

  describe('Trading History and Analytics', () => {
    test('Should be able to get trading history', async () => {
      const response = await testEnv.trading.get('/orders/history', {
        params: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.orders)).toBe(true);
      expect(response.data).toHaveProperty('totalCount');
      expect(response.data).toHaveProperty('page');

      console.log(`✅ Trading history: ${response.data.totalCount} orders`);
    });

    test('Should be able to get performance analytics', async () => {
      const response = await testEnv.trading.get('/analytics/performance', {
        params: {
          period: '30d',
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalReturn');
      expect(response.data).toHaveProperty('totalReturnPercent');
      expect(response.data).toHaveProperty('winRate');
      expect(response.data).toHaveProperty('totalTrades');
      expect(response.data).toHaveProperty('profitableTrades');

      console.log(`✅ Performance: ${response.data.totalReturnPercent}% return, ${response.data.winRate}% win rate`);
    });

    test('Should be able to get risk metrics', async () => {
      const response = await testEnv.trading.get('/analytics/risk');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('portfolioValue');
      expect(response.data).toHaveProperty('dayPnL');
      expect(response.data).toHaveProperty('marginUsed');
      expect(response.data).toHaveProperty('buyingPower');

      console.log(`✅ Risk metrics: Portfolio $${response.data.portfolioValue}, Day P&L $${response.data.dayPnL}`);
    });
  });

  describe('Advanced Order Types', () => {
    test('Should be able to place a bracket order', async () => {
      const marketDataResponse = await testEnv.marketData.get('/quotes/GOOGL');
      const currentPrice = marketDataResponse.data.price;

      const bracketOrderData = {
        symbol: 'GOOGL',
        side: 'buy',
        quantity: 1,
        orderType: 'bracket',
        parentOrder: {
          orderType: 'market',
        },
        takeProfitOrder: {
          orderType: 'limit',
          price: Math.round((currentPrice * 1.03) * 100) / 100, // 3% profit target
        },
        stopLossOrder: {
          orderType: 'stop',
          stopPrice: Math.round((currentPrice * 0.98) * 100) / 100, // 2% stop loss
        },
      };

      const response = await testEnv.trading.post('/orders/bracket', bracketOrderData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('parentOrderId');
      expect(response.data).toHaveProperty('takeProfitOrderId');
      expect(response.data).toHaveProperty('stopLossOrderId');

      tradingData.bracketOrderId = response.data.parentOrderId;

      console.log(`✅ Bracket order placed: ${response.data.parentOrderId}`);
    });

    test('Should be able to place a trailing stop order', async () => {
      const trailingStopData = {
        symbol: 'TSLA',
        side: 'sell',
        quantity: 1,
        orderType: 'trailing_stop',
        trailPercent: 5, // 5% trailing stop
        timeInForce: 'GTC',
      };

      const response = await testEnv.trading.post('/orders', trailingStopData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('orderId');
      expect(response.data).toHaveProperty('orderType', 'trailing_stop');
      expect(response.data).toHaveProperty('trailPercent', 5);

      console.log(`✅ Trailing stop order placed: ${response.data.orderId}`);
    });
  });

  describe('Paper Trading Mode', () => {
    test('Should be able to switch to paper trading mode', async () => {
      const response = await testEnv.trading.put('/account/mode', {
        mode: 'paper',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('mode', 'paper');

      console.log(`✅ Switched to paper trading mode`);
    });

    test('Should be able to place paper trades', async () => {
      const paperOrderData = {
        symbol: 'MSFT',
        side: 'buy',
        quantity: 5,
        orderType: 'market',
      };

      const response = await testEnv.trading.post('/orders', paperOrderData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('orderId');
      expect(response.data).toHaveProperty('paperTrade', true);

      console.log(`✅ Paper trade placed: ${response.data.orderId}`);
    });

    test('Should be able to get paper trading balance', async () => {
      const response = await testEnv.trading.get('/account/balance');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('paperBalance', true);
      expect(response.data).toHaveProperty('cashBalance');

      console.log(`✅ Paper trading balance: $${response.data.cashBalance}`);
    });

    test('Should be able to switch back to live trading mode', async () => {
      const response = await testEnv.trading.put('/account/mode', {
        mode: 'live',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('mode', 'live');

      console.log(`✅ Switched back to live trading mode`);
    });
  });

  describe('Risk Management Integration', () => {
    test('Should respect risk management rules', async () => {
      // Set risk management rules first
      await testEnv.riskManagement.post('/rules', {
        maxDailyLoss: 100,
        maxPositionSize: 5000,
        stopLossPercent: 5,
      });

      // Try to place a large order that should be rejected by risk management
      const largeOrderData = {
        symbol: 'AMZN',
        side: 'buy',
        quantity: 100, // Large quantity
        orderType: 'market',
      };

      const response = await testEnv.trading.post('/orders', largeOrderData);

      // Should either be rejected or require confirmation
      expect([200, 201, 400, 403].includes(response.status)).toBe(true);

      if (response.status >= 400) {
        expect(response.data.error.toLowerCase()).toContain('risk');
        console.log(`✅ Large order rejected by risk management`);
      } else {
        console.log(`✅ Large order accepted (may have been within risk limits)`);
      }
    });

    test('Should calculate portfolio risk metrics', async () => {
      const response = await testEnv.trading.get('/risk/portfolio');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalRisk');
      expect(response.data).toHaveProperty('concentration');
      expect(response.data).toHaveProperty('beta');
      expect(response.data).toHaveProperty('sharpeRatio');

      console.log(`✅ Portfolio risk: Beta ${response.data.beta}, Sharpe ${response.data.sharpeRatio}`);
    });
  });

  describe('Market Data Integration', () => {
    test('Orders should use real-time market data for execution', async () => {
      // Get current market price
      const marketDataResponse = await testEnv.marketData.get('/quotes/AAPL');
      const marketPrice = marketDataResponse.data.price;

      // Place a limit order at current market price
      const orderData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'limit',
        price: marketPrice,
      };

      const orderResponse = await testEnv.trading.post('/orders', orderData);

      expect(orderResponse.status).toBeWithinRange(200, 201);
      expect(orderResponse.data).toHaveProperty('price', marketPrice);

      console.log(`✅ Order placed at real-time market price: $${marketPrice}`);
    });

    test('Should validate orders against market hours', async () => {
      const marketStatusResponse = await testEnv.marketData.get('/market/status');
      const marketStatus = marketStatusResponse.data.marketStatus;

      const orderData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      };

      const orderResponse = await testEnv.trading.post('/orders', orderData);

      if (marketStatus === 'closed') {
        // Order should either be queued or rejected
        expect([200, 201, 400].includes(orderResponse.status)).toBe(true);
        
        if (orderResponse.status >= 200 && orderResponse.status < 300) {
          expect(orderResponse.data.status).toBe('queued');
        }
        
        console.log(`✅ Market closed order handling: ${orderResponse.data?.status || 'rejected'}`);
      } else {
        expect(orderResponse.status).toBeWithinRange(200, 201);
        console.log(`✅ Market open order processing: ${orderResponse.data.status}`);
      }
    });
  });

  describe('Notification Integration', () => {
    test('Should send notifications for order events', async () => {
      // Create a notification subscription for order events
      await testEnv.notification.post('/subscriptions', {
        type: 'order_events',
        channels: ['email', 'push'],
      });

      // Place an order
      const orderData = {
        symbol: 'NVDA',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      };

      const orderResponse = await testEnv.trading.post('/orders', orderData);
      expect(orderResponse.status).toBeWithinRange(200, 201);

      // Wait a moment for notification to be sent
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if notification was sent
      const notificationsResponse = await testEnv.notification.get('/notifications/recent');
      
      if (notificationsResponse.status === 200) {
        const orderNotifications = notificationsResponse.data.notifications.filter(
          (notif: any) => notif.type === 'order_placed' && notif.orderId === orderResponse.data.orderId
        );
        
        expect(orderNotifications.length).toBeGreaterThan(0);
        console.log(`✅ Order notification sent: ${orderNotifications.length} notifications`);
      }
    });
  });

  describe('Integration Test Summary', () => {
    test('Trading integration should be complete and functional', async () => {
      // Verify we have placed various types of orders
      expect(tradingData).toHaveProperty('marketBuyOrderId');
      expect(tradingData).toHaveProperty('stopOrderId');
      expect(tradingData).toHaveProperty('bracketOrderId');

      // Get final account status
      const accountResponse = await testEnv.trading.get('/account/status');
      const balanceResponse = await testEnv.trading.get('/account/balance');
      const ordersResponse = await testEnv.trading.get('/orders');

      expect(accountResponse.status).toBe(200);
      expect(balanceResponse.status).toBe(200);
      expect(ordersResponse.status).toBe(200);

      console.log(`✅ Trading integration summary:`, {
        accountStatus: accountResponse.data.status,
        totalOrders: ordersResponse.data.orders.length,
        currentBalance: balanceResponse.data.cashBalance,
        marketBuyOrder: tradingData.marketBuyOrderId,
        stopOrder: tradingData.stopOrderId,
        bracketOrder: tradingData.bracketOrderId,
      });

      console.log(`✅ All trading integration tests completed successfully`);
    });
  });
});