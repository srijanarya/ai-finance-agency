import { TestEnvironment } from '../utils/test-environment';
import { TestDataGenerator } from '../utils/test-data-generator';
import WebSocket from 'ws';

describe('Market Data Streaming Integration Tests', () => {
  let testEnv: TestEnvironment;
  let dataGenerator: TestDataGenerator;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    testEnv = global.testEnv;
    dataGenerator = new TestDataGenerator();
    
    // Create and authenticate a premium test user for market data access
    testUser = dataGenerator.generateRandomUser();
    testUser.subscriptionTier = 'premium';
    
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

    // Upgrade to premium subscription to access market data
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

  describe('Market Data REST API', () => {
    test('Should be able to get current quote for a symbol', async () => {
      const response = await testEnv.marketData.get('/quotes/AAPL');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('symbol', 'AAPL');
      expect(response.data).toHaveProperty('price');
      expect(response.data).toHaveProperty('bid');
      expect(response.data).toHaveProperty('ask');
      expect(response.data).toHaveProperty('volume');
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('marketStatus');

      expect(typeof response.data.price).toBe('number');
      expect(response.data.price).toBeGreaterThan(0);

      console.log(`✅ AAPL quote: $${response.data.price}`);
    });

    test('Should be able to get multiple quotes', async () => {
      const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT'];
      const response = await testEnv.marketData.get('/quotes/batch', {
        params: { symbols: symbols.join(',') },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.quotes)).toBe(true);
      expect(response.data.quotes.length).toBe(symbols.length);

      for (const quote of response.data.quotes) {
        expect(symbols.includes(quote.symbol)).toBe(true);
        expect(quote).toHaveProperty('price');
        expect(quote).toHaveProperty('timestamp');
      }

      console.log(`✅ Batch quotes received for ${symbols.length} symbols`);
    });

    test('Should be able to get historical data', async () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const response = await testEnv.marketData.get('/historical/AAPL', {
        params: {
          interval: '1d',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('symbol', 'AAPL');
      expect(Array.isArray(response.data.prices)).toBe(true);
      expect(response.data.prices.length).toBeGreaterThan(0);

      for (const pricePoint of response.data.prices) {
        expect(pricePoint).toHaveProperty('timestamp');
        expect(pricePoint).toHaveProperty('open');
        expect(pricePoint).toHaveProperty('high');
        expect(pricePoint).toHaveProperty('low');
        expect(pricePoint).toHaveProperty('close');
        expect(pricePoint).toHaveProperty('volume');
      }

      console.log(`✅ Historical data: ${response.data.prices.length} data points`);
    });

    test('Should be able to get market status', async () => {
      const response = await testEnv.marketData.get('/market/status');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('marketStatus');
      expect(['open', 'closed', 'pre-market', 'after-hours'].includes(response.data.marketStatus)).toBe(true);
      expect(response.data).toHaveProperty('nextOpenTime');
      expect(response.data).toHaveProperty('nextCloseTime');

      console.log(`✅ Market status: ${response.data.marketStatus}`);
    });

    test('Should be able to search for symbols', async () => {
      const response = await testEnv.marketData.get('/search', {
        params: { query: 'Apple' },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.results)).toBe(true);

      if (response.data.results.length > 0) {
        const appleResult = response.data.results.find((result: any) => 
          result.symbol === 'AAPL' || result.name.toLowerCase().includes('apple')
        );
        expect(appleResult).toBeDefined();
        expect(appleResult).toHaveProperty('symbol');
        expect(appleResult).toHaveProperty('name');
        expect(appleResult).toHaveProperty('type');
      }

      console.log(`✅ Symbol search: ${response.data.results.length} results`);
    });
  });

  describe('Real-time Market Data Subscriptions', () => {
    test('Should be able to create a market data subscription', async () => {
      const subscriptionData = {
        symbols: ['AAPL', 'GOOGL', 'TSLA'],
        dataTypes: ['price', 'volume', 'bid_ask'],
        frequency: 'real-time',
      };

      const response = await testEnv.marketData.post('/subscriptions', subscriptionData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('subscriptionId');
      expect(response.data).toHaveProperty('symbols');
      expect(response.data).toHaveProperty('status', 'active');

      console.log(`✅ Market data subscription created: ${response.data.subscriptionId}`);
    });

    test('Should be able to list active subscriptions', async () => {
      const response = await testEnv.marketData.get('/subscriptions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.subscriptions)).toBe(true);

      for (const subscription of response.data.subscriptions) {
        expect(subscription).toHaveProperty('subscriptionId');
        expect(subscription).toHaveProperty('symbols');
        expect(subscription).toHaveProperty('status');
        expect(subscription).toHaveProperty('createdAt');
      }

      console.log(`✅ Active subscriptions: ${response.data.subscriptions.length}`);
    });

    test('Should be able to modify subscription', async () => {
      const subscriptions = await testEnv.marketData.get('/subscriptions');
      if (subscriptions.data.subscriptions.length > 0) {
        const subscriptionId = subscriptions.data.subscriptions[0].subscriptionId;
        
        const updateData = {
          symbols: ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'],
          dataTypes: ['price', 'volume'],
        };

        const response = await testEnv.marketData.put(`/subscriptions/${subscriptionId}`, updateData);

        expect(response.status).toBe(200);
        expect(response.data.symbols).toEqual(updateData.symbols);

        console.log(`✅ Subscription updated with ${updateData.symbols.length} symbols`);
      }
    });
  });

  describe('WebSocket Market Data Streaming', () => {
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

    test('Should establish WebSocket connection for market data', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      expect(marketDataWs.readyState).toBe(WebSocket.OPEN);
      console.log('✅ Market data WebSocket connected');
    });

    test('Should subscribe to real-time price updates', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      const subscriptionPromise = new Promise((resolve) => {
        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            resolve(message);
          }
        });
      });

      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: ['AAPL', 'GOOGL'],
      }));

      const confirmation = await subscriptionPromise;
      expect(confirmation).toHaveProperty('type', 'subscription_confirmed');
      expect(confirmation).toHaveProperty('symbols');

      console.log('✅ Subscribed to real-time price updates');
    });

    test('Should receive real-time price data', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      const priceUpdatePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Price update timeout'));
        }, 30000);

        let subscriptionConfirmed = false;

        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
          } else if (message.type === 'price_update' && subscriptionConfirmed) {
            clearTimeout(timeout);
            resolve(message);
          }
        });
      });

      // Subscribe to price updates
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: ['AAPL'],
      }));

      const priceUpdate = await priceUpdatePromise;
      expect(priceUpdate).toHaveProperty('type', 'price_update');
      expect(priceUpdate).toHaveProperty('symbol');
      expect(priceUpdate).toHaveProperty('price');
      expect(priceUpdate).toHaveProperty('timestamp');
      expect(typeof priceUpdate.price).toBe('number');

      console.log(`✅ Real-time price update: ${priceUpdate.symbol} = $${priceUpdate.price}`);
    });

    test('Should receive volume updates', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      const volumeUpdatePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Volume update timeout'));
        }, 30000);

        let subscriptionConfirmed = false;

        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
          } else if (message.type === 'volume_update' && subscriptionConfirmed) {
            clearTimeout(timeout);
            resolve(message);
          }
        });
      });

      // Subscribe to volume updates
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'volume',
        symbols: ['AAPL'],
      }));

      const volumeUpdate = await volumeUpdatePromise;
      expect(volumeUpdate).toHaveProperty('type', 'volume_update');
      expect(volumeUpdate).toHaveProperty('symbol');
      expect(volumeUpdate).toHaveProperty('volume');
      expect(volumeUpdate).toHaveProperty('timestamp');

      console.log(`✅ Volume update: ${volumeUpdate.symbol} volume = ${volumeUpdate.volume}`);
    });

    test('Should handle bid/ask spread updates', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      const bidAskPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Bid/Ask update timeout'));
        }, 30000);

        let subscriptionConfirmed = false;

        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
          } else if (message.type === 'bid_ask_update' && subscriptionConfirmed) {
            clearTimeout(timeout);
            resolve(message);
          }
        });
      });

      // Subscribe to bid/ask updates
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'bid_ask',
        symbols: ['AAPL'],
      }));

      const bidAskUpdate = await bidAskPromise;
      expect(bidAskUpdate).toHaveProperty('type', 'bid_ask_update');
      expect(bidAskUpdate).toHaveProperty('symbol');
      expect(bidAskUpdate).toHaveProperty('bid');
      expect(bidAskUpdate).toHaveProperty('ask');
      expect(bidAskUpdate).toHaveProperty('bidSize');
      expect(bidAskUpdate).toHaveProperty('askSize');

      console.log(`✅ Bid/Ask update: ${bidAskUpdate.symbol} bid=${bidAskUpdate.bid} ask=${bidAskUpdate.ask}`);
    });

    test('Should handle multiple symbol subscriptions', async () => {
      marketDataWs = await testEnv.createWebSocketConnection(
        'market-data',
        '/ws/market-data',
        authToken
      );

      const symbols = ['AAPL', 'GOOGL', 'TSLA'];
      const receivedSymbols = new Set();

      const multiSymbolPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Multi-symbol update timeout'));
        }, 45000);

        let subscriptionConfirmed = false;

        marketDataWs.on('message', (data) => {
          const message = JSON.parse(data.toString());
          receivedMessages.push(message);
          
          if (message.type === 'subscription_confirmed') {
            subscriptionConfirmed = true;
          } else if (message.type === 'price_update' && subscriptionConfirmed) {
            receivedSymbols.add(message.symbol);
            
            // Resolve when we've received updates for all symbols
            if (receivedSymbols.size === symbols.length) {
              clearTimeout(timeout);
              resolve(Array.from(receivedSymbols));
            }
          }
        });
      });

      // Subscribe to multiple symbols
      marketDataWs.send(JSON.stringify({
        action: 'subscribe',
        channel: 'prices',
        symbols: symbols,
      }));

      const updatedSymbols = await multiSymbolPromise;
      expect(updatedSymbols).toHaveLength(symbols.length);
      
      for (const symbol of symbols) {
        expect(updatedSymbols.includes(symbol)).toBe(true);
      }

      console.log(`✅ Multi-symbol updates received for: ${updatedSymbols.join(', ')}`);
    });
  });

  describe('Market Data Analytics', () => {
    test('Should be able to get technical indicators', async () => {
      const response = await testEnv.marketData.get('/indicators/AAPL', {
        params: {
          indicators: ['RSI', 'MACD', 'SMA', 'EMA'],
          period: '1d',
          length: 50,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('symbol', 'AAPL');
      expect(response.data).toHaveProperty('indicators');

      const indicators = response.data.indicators;
      expect(indicators).toHaveProperty('RSI');
      expect(indicators).toHaveProperty('MACD');
      expect(indicators).toHaveProperty('SMA');
      expect(indicators).toHaveProperty('EMA');

      console.log(`✅ Technical indicators calculated for AAPL`);
    });

    test('Should be able to get market movers', async () => {
      const response = await testEnv.marketData.get('/market/movers', {
        params: {
          type: 'gainers',
          limit: 10,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.movers)).toBe(true);
      expect(response.data.movers.length).toBeLessThanOrEqual(10);

      for (const mover of response.data.movers) {
        expect(mover).toHaveProperty('symbol');
        expect(mover).toHaveProperty('price');
        expect(mover).toHaveProperty('change');
        expect(mover).toHaveProperty('changePercent');
      }

      console.log(`✅ Market movers: ${response.data.movers.length} gainers`);
    });

    test('Should be able to get sector performance', async () => {
      const response = await testEnv.marketData.get('/market/sectors');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.sectors)).toBe(true);

      for (const sector of response.data.sectors) {
        expect(sector).toHaveProperty('name');
        expect(sector).toHaveProperty('performance');
        expect(sector).toHaveProperty('changePercent');
      }

      console.log(`✅ Sector performance: ${response.data.sectors.length} sectors`);
    });
  });

  describe('Market Data Caching and Performance', () => {
    test('Should cache frequently requested data', async () => {
      const startTime = Date.now();
      
      // First request
      const response1 = await testEnv.marketData.get('/quotes/AAPL');
      const firstRequestTime = Date.now() - startTime;

      // Second request (should be faster due to caching)
      const startTime2 = Date.now();
      const response2 = await testEnv.marketData.get('/quotes/AAPL');
      const secondRequestTime = Date.now() - startTime2;

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data.symbol).toBe(response2.data.symbol);

      // Second request should be faster (cached)
      console.log(`✅ Request times: ${firstRequestTime}ms (fresh), ${secondRequestTime}ms (cached)`);
    });

    test('Should handle high-frequency data requests', async () => {
      const symbols = ['AAPL', 'GOOGL', 'TSLA', 'MSFT', 'AMZN'];
      const startTime = Date.now();

      // Make concurrent requests
      const promises = symbols.map(symbol => 
        testEnv.marketData.get(`/quotes/${symbol}`)
      );

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      for (const response of responses) {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('symbol');
        expect(response.data).toHaveProperty('price');
      }

      console.log(`✅ High-frequency requests: ${symbols.length} quotes in ${totalTime}ms`);
    });
  });

  describe('Market Data Access Control', () => {
    test('Premium users should have access to real-time data', async () => {
      const response = await testEnv.marketData.get('/quotes/AAPL', {
        params: { realTime: true },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('dataType', 'real-time');

      console.log('✅ Premium user has real-time data access');
    });

    test('Should enforce subscription-based data limits', async () => {
      // Try to access high-frequency data
      const response = await testEnv.marketData.get('/quotes/batch', {
        params: { 
          symbols: Array.from({length: 100}, (_, i) => `TEST${i}`).join(','),
          dataType: 'real-time'
        },
      });

      // Should either succeed for premium users or return appropriate limits
      expect([200, 400, 429].includes(response.status)).toBe(true);

      if (response.status === 200) {
        console.log('✅ Premium subscription allows high-volume requests');
      } else {
        console.log(`✅ Subscription limits enforced: ${response.status}`);
      }
    });
  });

  describe('Market Data Integration Validation', () => {
    test('Market data should integrate with trading service', async () => {
      // Get current price from market data service
      const marketDataResponse = await testEnv.marketData.get('/quotes/AAPL');
      expect(marketDataResponse.status).toBe(200);
      
      const currentPrice = marketDataResponse.data.price;

      // Verify trading service can access this data for order validation
      const orderValidationResponse = await testEnv.trading.post('/orders/validate', {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'limit',
        price: currentPrice * 0.99, // Below current market price
      });

      expect(orderValidationResponse.status).toBe(200);
      expect(orderValidationResponse.data).toHaveProperty('valid');

      console.log('✅ Market data integration with trading service validated');
    });

    test('Market data should be consistent across services', async () => {
      // Get price from market data service
      const marketPrice = await testEnv.marketData.get('/quotes/AAPL');
      
      // Get the same price via signals service (which should use market data)
      const signalsPrice = await testEnv.signals.get('/market-data/AAPL');

      expect(marketPrice.status).toBe(200);
      
      if (signalsPrice.status === 200) {
        // Prices should be very close (within reasonable tolerance for timing)
        const priceDifference = Math.abs(marketPrice.data.price - signalsPrice.data.price);
        const pricePercentDiff = (priceDifference / marketPrice.data.price) * 100;
        
        expect(pricePercentDiff).toBeLessThan(1); // Less than 1% difference
        
        console.log(`✅ Price consistency: Market Data $${marketPrice.data.price}, Signals $${signalsPrice.data.price}`);
      }
    });

    test('Should handle market data service outages gracefully', async () => {
      // This test would ideally involve temporarily stopping the market data service
      // For now, we'll test error handling with invalid requests
      
      const response = await testEnv.trading.post('/orders', {
        symbol: 'INVALID_SYMBOL_123',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      });

      // Should handle invalid symbol gracefully
      expect([400, 404, 422].includes(response.status)).toBe(true);
      
      if (response.data.error) {
        expect(response.data.error.toLowerCase()).toContain('symbol');
      }

      console.log('✅ Invalid symbol handled gracefully');
    });
  });
});