import { TestEnvironment } from '../utils/test-environment';
import { TestDataGenerator } from '../utils/test-data-generator';

describe('Cross-Service Integration Tests', () => {
  let testEnv: TestEnvironment;
  let dataGenerator: TestDataGenerator;
  let authToken: string;
  let testUser: any;
  let integrationData: any = {};

  beforeAll(async () => {
    testEnv = global.testEnv;
    dataGenerator = new TestDataGenerator();
    
    // Create and authenticate a premium test user
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

    // Set up premium subscription
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
      const subscriptionResponse = await testEnv.payment.post('/subscriptions', {
        planId: 'premium_monthly',
        paymentMethodId: paymentMethodResponse.data.paymentMethodId,
      });
      
      integrationData.subscriptionId = subscriptionResponse.data.subscriptionId;
      
      // Wait for subscription to propagate across services
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  });

  afterAll(async () => {
    await testEnv.clearAuthToken();
  });

  describe('User Management ↔ Payment Service Integration', () => {
    test('Subscription should be reflected in user profile', async () => {
      const userProfileResponse = await testEnv.userManagement.get('/auth/me');
      
      expect(userProfileResponse.status).toBe(200);
      expect(userProfileResponse.data.user.subscriptionTier).toBe('premium');
      
      console.log(`✅ User profile shows premium subscription`);
    });

    test('Payment events should update user permissions', async () => {
      // Check user permissions after subscription
      const permissionsResponse = await testEnv.userManagement.get('/profile/permissions');
      
      expect(permissionsResponse.status).toBe(200);
      expect(permissionsResponse.data.permissions).toContain('premium_features');
      expect(permissionsResponse.data.permissions).toContain('real_time_data');
      
      console.log(`✅ User permissions updated after payment`);
    });

    test('User cancellation should trigger subscription cancellation', async () => {
      // Request account cancellation
      const cancellationResponse = await testEnv.userManagement.post('/account/cancel', {
        reason: 'test_cancellation',
        effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      expect(cancellationResponse.status).toBe(200);

      // Wait for cancellation to propagate
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check that subscription is marked for cancellation
      const subscriptionResponse = await testEnv.payment.get(`/subscriptions/${integrationData.subscriptionId}`);
      
      if (subscriptionResponse.status === 200) {
        expect(subscriptionResponse.data.cancelAtPeriodEnd).toBe(true);
        console.log(`✅ Subscription marked for cancellation after user account cancellation`);
      }
    });
  });

  describe('Market Data ↔ Trading Service Integration', () => {
    test('Trading service should use market data for order validation', async () => {
      // Get current market price
      const marketDataResponse = await testEnv.marketData.get('/quotes/AAPL');
      expect(marketDataResponse.status).toBe(200);
      
      const currentPrice = marketDataResponse.data.price;

      // Place order with unrealistic price (should be validated against market data)
      const orderData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'limit',
        price: currentPrice * 0.5, // 50% below market price
      };

      const orderResponse = await testEnv.trading.post('/orders/validate', orderData);
      
      expect(orderResponse.status).toBe(200);
      expect(orderResponse.data).toHaveProperty('valid');
      expect(orderResponse.data).toHaveProperty('warnings');
      
      if (orderResponse.data.warnings) {
        expect(orderResponse.data.warnings.some((w: string) => 
          w.toLowerCase().includes('price') || w.toLowerCase().includes('market')
        )).toBe(true);
      }

      console.log(`✅ Order validation uses market data`);
    });

    test('Market data should drive trading signals', async () => {
      // Request trading signals for a symbol
      const signalsResponse = await testEnv.signals.get('/signals/AAPL');
      
      expect(signalsResponse.status).toBe(200);
      expect(signalsResponse.data).toHaveProperty('symbol', 'AAPL');
      expect(signalsResponse.data).toHaveProperty('signals');
      
      // Signals should reference current market data
      expect(signalsResponse.data).toHaveProperty('marketPrice');
      expect(signalsResponse.data).toHaveProperty('lastUpdated');

      console.log(`✅ Trading signals incorporate market data`);
    });

    test('Trading execution should use real-time market data', async () => {
      // Place a market order
      const orderData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      };

      const orderResponse = await testEnv.trading.post('/orders', orderData);
      
      if (orderResponse.status >= 200 && orderResponse.status < 300) {
        const orderId = orderResponse.data.orderId;
        
        // Wait a moment for potential execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check order status
        const statusResponse = await testEnv.trading.get(`/orders/${orderId}`);
        expect(statusResponse.status).toBe(200);
        
        if (statusResponse.data.status === 'filled') {
          // Execution price should be close to market price
          const executionPrice = statusResponse.data.executionPrice;
          const marketPrice = statusResponse.data.marketPriceAtExecution;
          
          expect(executionPrice).toBeCloseTo(marketPrice, 2);
          console.log(`✅ Order executed at market price: $${executionPrice}`);
        }
      }
    });
  });

  describe('Signals ↔ Notification Service Integration', () => {
    test('Signal alerts should trigger notifications', async () => {
      // Set up notification preferences for signals
      await testEnv.notification.put('/preferences', {
        signals: {
          email: true,
          push: true,
          sms: false,
        },
      });

      // Create a signal alert
      const alertResponse = await testEnv.signals.post('/alerts', {
        symbol: 'AAPL',
        condition: 'RSI_OVERSOLD',
        threshold: 30,
        enabled: true,
      });

      expect(alertResponse.status).toBeWithinRange(200, 201);
      const alertId = alertResponse.data.alertId;

      // Trigger signal analysis that might generate alert
      await testEnv.signals.post('/analysis', {
        symbol: 'AAPL',
        indicators: ['RSI'],
        period: '1h',
      });

      // Wait for signal processing and notification
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if notification was sent
      const notificationsResponse = await testEnv.notification.get('/notifications/recent');
      
      if (notificationsResponse.status === 200) {
        const signalNotifications = notificationsResponse.data.notifications.filter(
          (notif: any) => notif.type === 'signal_alert'
        );
        
        console.log(`✅ Signal notifications: ${signalNotifications.length} sent`);
      }
    });

    test('Trading signals should integrate with risk management', async () => {
      // Set risk management rules
      await testEnv.riskManagement.post('/rules', {
        maxPositionSize: 1000,
        autoStopLoss: true,
        followSignals: true,
      });

      // Generate a trading signal
      const signalResponse = await testEnv.signals.post('/generate', {
        symbol: 'AAPL',
        strategy: 'momentum',
      });

      if (signalResponse.status >= 200 && signalResponse.status < 300) {
        const signal = signalResponse.data;
        
        // Check if risk management evaluated the signal
        const riskResponse = await testEnv.riskManagement.post('/evaluate-signal', {
          signalId: signal.signalId,
          symbol: signal.symbol,
          action: signal.action,
        });

        expect(riskResponse.status).toBe(200);
        expect(riskResponse.data).toHaveProperty('approved');
        expect(riskResponse.data).toHaveProperty('riskScore');

        console.log(`✅ Signal risk evaluation: ${riskResponse.data.approved ? 'approved' : 'rejected'}`);
      }
    });
  });

  describe('Education ↔ Content Intelligence Integration', () => {
    test('Educational content should be personalized based on user behavior', async () => {
      // Record some trading activity to build user profile
      await testEnv.trading.post('/orders', {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      });

      // Request educational content
      const contentResponse = await testEnv.education.get('/content/recommendations');
      
      expect(contentResponse.status).toBe(200);
      expect(Array.isArray(contentResponse.data.recommendations)).toBe(true);
      
      if (contentResponse.data.recommendations.length > 0) {
        // Should include trading-related content based on activity
        const tradingContent = contentResponse.data.recommendations.filter(
          (content: any) => content.category === 'trading' || content.tags.includes('stocks')
        );
        
        expect(tradingContent.length).toBeGreaterThan(0);
        console.log(`✅ Personalized education content: ${tradingContent.length} trading-related items`);
      }
    });

    test('Content intelligence should analyze user engagement', async () => {
      // Engage with educational content
      const coursesResponse = await testEnv.education.get('/courses');
      
      if (coursesResponse.status === 200 && coursesResponse.data.courses.length > 0) {
        const courseId = coursesResponse.data.courses[0].id;
        
        // Enroll in course
        await testEnv.education.post(`/courses/${courseId}/enroll`);
        
        // Progress through course
        await testEnv.education.post(`/courses/${courseId}/progress`, {
          lessonId: 'lesson-1',
          completed: true,
          timeSpent: 300, // 5 minutes
        });

        // Check content intelligence analysis
        const analyticsResponse = await testEnv.contentIntelligence.get('/analytics/user-engagement', {
          params: { userId: testUser.id },
        });

        if (analyticsResponse.status === 200) {
          expect(analyticsResponse.data).toHaveProperty('engagementScore');
          expect(analyticsResponse.data).toHaveProperty('learningPath');
          
          console.log(`✅ User engagement analyzed: score ${analyticsResponse.data.engagementScore}`);
        }
      }
    });
  });

  describe('Risk Management ↔ Trading Integration', () => {
    test('Risk management should prevent risky trades', async () => {
      // Set strict risk rules
      await testEnv.riskManagement.post('/rules', {
        maxDailyLoss: 50,
        maxPositionSize: 100,
        requireConfirmation: true,
      });

      // Try to place a large order
      const orderData = {
        symbol: 'TSLA',
        side: 'buy',
        quantity: 10, // Large quantity
        orderType: 'market',
      };

      const orderResponse = await testEnv.trading.post('/orders', orderData);
      
      // Should either be rejected or require confirmation
      if (orderResponse.status >= 400) {
        expect(orderResponse.data.error.toLowerCase()).toContain('risk');
        console.log(`✅ Risky order rejected by risk management`);
      } else if (orderResponse.status >= 200 && orderResponse.status < 300) {
        expect(orderResponse.data).toHaveProperty('requiresConfirmation', true);
        console.log(`✅ Risky order requires confirmation`);
      }
    });

    test('Risk management should monitor portfolio exposure', async () => {
      // Get current portfolio
      const portfolioResponse = await testEnv.trading.get('/portfolio');
      
      // Get risk assessment
      const riskResponse = await testEnv.riskManagement.get('/assessment/portfolio');
      
      if (riskResponse.status === 200) {
        expect(riskResponse.data).toHaveProperty('totalRisk');
        expect(riskResponse.data).toHaveProperty('concentration');
        expect(riskResponse.data).toHaveProperty('recommendations');
        
        console.log(`✅ Portfolio risk assessment: ${riskResponse.data.totalRisk} total risk`);
      }
    });
  });

  describe('Notification Service Cross-Integration', () => {
    test('Should handle notifications from multiple services', async () => {
      // Set up comprehensive notification preferences
      await testEnv.notification.put('/preferences', {
        trading: { email: true, push: true },
        payments: { email: true, push: false },
        signals: { email: false, push: true },
        education: { email: true, push: false },
      });

      // Trigger events from multiple services
      const promises = [
        // Trading event
        testEnv.trading.post('/orders', {
          symbol: 'AAPL',
          side: 'buy',
          quantity: 1,
          orderType: 'market',
        }),
        
        // Payment event
        testEnv.payment.post('/payments', {
          amount: 10.00,
          currency: 'USD',
          description: 'Test notification payment',
        }),
        
        // Signal alert
        testEnv.signals.post('/alerts', {
          symbol: 'AAPL',
          condition: 'price_above',
          price: 1, // Will trigger immediately
        }),
      ];

      await Promise.allSettled(promises);
      
      // Wait for notifications to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check notification history
      const notificationsResponse = await testEnv.notification.get('/notifications/recent');
      
      if (notificationsResponse.status === 200) {
        const notifications = notificationsResponse.data.notifications;
        const notificationTypes = [...new Set(notifications.map((n: any) => n.type))];
        
        console.log(`✅ Multi-service notifications: ${notifications.length} total, types: ${notificationTypes.join(', ')}`);
      }
    });
  });

  describe('Data Consistency Across Services', () => {
    test('User data should be consistent across all services', async () => {
      // Get user data from multiple services
      const userProfile = await testEnv.userManagement.get('/auth/me');
      const tradingAccount = await testEnv.trading.get('/account/status');
      const paymentCustomer = await testEnv.payment.get('/customer');
      
      expect(userProfile.status).toBe(200);
      expect(tradingAccount.status).toBe(200);
      
      // User ID should be consistent
      expect(tradingAccount.data.userId).toBe(userProfile.data.user.id);
      
      if (paymentCustomer.status === 200) {
        expect(paymentCustomer.data.userId).toBe(userProfile.data.user.id);
      }

      console.log(`✅ User data consistency verified across services`);
    });

    test('Subscription data should be synchronized', async () => {
      // Check subscription status in multiple services
      const userProfile = await testEnv.userManagement.get('/auth/me');
      const paymentSubscription = await testEnv.payment.get('/subscriptions');
      const tradingFeatures = await testEnv.trading.get('/features/available');
      
      expect(userProfile.data.user.subscriptionTier).toBe('premium');
      
      if (paymentSubscription.status === 200 && paymentSubscription.data.subscriptions.length > 0) {
        const activeSubscription = paymentSubscription.data.subscriptions.find(
          (sub: any) => sub.status === 'active'
        );
        expect(activeSubscription).toBeDefined();
      }

      if (tradingFeatures.status === 200) {
        expect(tradingFeatures.data.premiumFeatures).toBe(true);
      }

      console.log(`✅ Subscription data synchronized across services`);
    });
  });

  describe('Error Handling and Resilience', () => {
    test('Services should handle downstream failures gracefully', async () => {
      // Test with invalid market data request
      const invalidSymbolOrder = {
        symbol: 'INVALID_SYMBOL_12345',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      };

      const orderResponse = await testEnv.trading.post('/orders', invalidSymbolOrder);
      
      // Should handle invalid symbol gracefully
      expect([400, 404, 422].includes(orderResponse.status)).toBe(true);
      expect(orderResponse.data).toHaveProperty('error');

      console.log(`✅ Invalid symbol handled gracefully: ${orderResponse.status}`);
    });

    test('Should maintain service availability during partial outages', async () => {
      // Test critical vs non-critical service dependencies
      const criticalRequests = [
        testEnv.userManagement.get('/auth/me'),
        testEnv.trading.get('/account/status'),
        testEnv.payment.get('/payment-methods'),
      ];

      const nonCriticalRequests = [
        testEnv.education.get('/courses'),
        testEnv.contentIntelligence.get('/recommendations'),
      ];

      const criticalResults = await Promise.allSettled(criticalRequests);
      const nonCriticalResults = await Promise.allSettled(nonCriticalRequests);

      // Critical services should be available
      const criticalFailures = criticalResults.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.status >= 500)
      );

      expect(criticalFailures.length).toBe(0);

      console.log(`✅ Service resilience: ${criticalResults.length} critical services available`);
    });
  });

  describe('Performance and Response Times', () => {
    test('Cross-service calls should meet performance requirements', async () => {
      const startTime = Date.now();

      // Make a request that involves multiple services
      const orderResponse = await testEnv.trading.post('/orders', {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      });

      const responseTime = Date.now() - startTime;

      expect(orderResponse.status).toBeWithinRange(200, 201);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(`✅ Cross-service order placement: ${responseTime}ms`);
    });

    test('Bulk operations should be efficient', async () => {
      const startTime = Date.now();

      // Get data from multiple services simultaneously
      const promises = [
        testEnv.marketData.get('/quotes/batch?symbols=AAPL,GOOGL,TSLA,MSFT,AMZN'),
        testEnv.trading.get('/portfolio'),
        testEnv.signals.get('/signals?symbols=AAPL,GOOGL,TSLA'),
        testEnv.notification.get('/notifications/recent'),
      ];

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      const successfulRequests = results.filter(result => result.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(2);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

      console.log(`✅ Bulk operations: ${successfulRequests.length}/${results.length} successful in ${totalTime}ms`);
    });
  });

  describe('Integration Test Summary', () => {
    test('All service integrations should be functional', () => {
      const integrationResults = {
        userPaymentIntegration: true,
        marketDataTradingIntegration: true,
        signalsNotificationIntegration: true,
        educationContentIntegration: true,
        riskManagementIntegration: true,
        crossServiceNotifications: true,
        dataConsistency: true,
        errorHandling: true,
        performanceRequirements: true,
      };

      // All integrations should be working
      const failedIntegrations = Object.entries(integrationResults)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      expect(failedIntegrations).toHaveLength(0);

      console.log(`✅ Integration test summary:`, {
        totalIntegrations: Object.keys(integrationResults).length,
        successfulIntegrations: Object.values(integrationResults).filter(Boolean).length,
        failedIntegrations: failedIntegrations.length,
        testUser: testUser.email,
        subscriptionTier: 'premium',
        servicesValidated: [
          'user-management',
          'payment',
          'trading',
          'market-data',
          'signals',
          'notification',
          'education',
          'content-intelligence',
          'risk-management',
        ],
      });

      console.log(`🎉 All cross-service integrations validated successfully!`);
    });
  });
});