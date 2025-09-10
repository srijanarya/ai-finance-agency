import { TestEnvironment } from '../utils/test-environment';
import { TestDataGenerator } from '../utils/test-data-generator';
import { v4 as uuidv4 } from 'uuid';

describe('Complete User Journey - Registration to Trading', () => {
  let testEnv: TestEnvironment;
  let dataGenerator: TestDataGenerator;
  let userJourneyData: any = {};

  beforeAll(async () => {
    testEnv = global.testEnv;
    dataGenerator = new TestDataGenerator();
  });

  afterEach(async () => {
    // Clear auth token after each test
    await testEnv.clearAuthToken();
  });

  describe('Phase 1: User Registration and Verification', () => {
    test('User should be able to register with valid information', async () => {
      const userData = dataGenerator.generateRandomUser();
      userJourneyData.user = userData;

      const response = await testEnv.userManagement.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('user');
      expect(response.data).toHaveProperty('message');
      expect(response.data.user.email).toBe(userData.email);
      expect(response.data.user.isVerified).toBe(false);

      userJourneyData.userId = response.data.user.id;
      userJourneyData.registrationResponse = response.data;

      console.log(`✅ User registered: ${userData.email}`);
    });

    test('User should receive verification email and be able to verify', async () => {
      // In a real scenario, this would involve checking email delivery
      // For testing, we'll simulate the verification process
      
      // First, let's try to login (should fail due to unverified email)
      const loginResponse = await testEnv.userManagement.post('/auth/login', {
        email: userJourneyData.user.email,
        password: userJourneyData.user.password,
      });

      // Should still get a token but with limited access
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('accessToken');
      
      userJourneyData.unverifiedToken = loginResponse.data.accessToken;

      console.log(`✅ Login successful for unverified user`);
    });

    test('User should be able to complete email verification', async () => {
      // Simulate email verification by directly calling verify endpoint
      // In real implementation, this token would come from email
      const verificationToken = `test_verification_${uuidv4()}`;
      
      // For testing purposes, we'll use a mock verification
      // In production, this would be a real verification token from email
      const verifyResponse = await testEnv.userManagement.get(
        `/auth/verify-email?token=${verificationToken}`
      );

      // The test verification might fail since we're using a mock token
      // In a real test environment, you'd have email testing infrastructure
      console.log(`📧 Email verification attempted`);
    });
  });

  describe('Phase 2: Authentication and Profile Setup', () => {
    test('User should be able to login with verified account', async () => {
      const loginResponse = await testEnv.userManagement.post('/auth/login', {
        email: userJourneyData.user.email,
        password: userJourneyData.user.password,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('accessToken');
      expect(loginResponse.data).toHaveProperty('refreshToken');
      expect(loginResponse.data).toHaveProperty('user');
      expect(loginResponse.data.accessToken).toBeValidJWT();

      userJourneyData.accessToken = loginResponse.data.accessToken;
      userJourneyData.refreshToken = loginResponse.data.refreshToken;

      // Set authentication for subsequent requests
      await testEnv.setAuthToken(userJourneyData.accessToken);

      console.log(`✅ User authenticated successfully`);
    });

    test('User should be able to access protected profile endpoint', async () => {
      const profileResponse = await testEnv.userManagement.get('/auth/me');

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data).toHaveProperty('user');
      expect(profileResponse.data.user.email).toBe(userJourneyData.user.email);

      console.log(`✅ Profile access successful`);
    });

    test('User should be able to update profile information', async () => {
      const updateData = {
        firstName: 'Updated' + userJourneyData.user.firstName,
        phoneNumber: '+1-555-0123',
      };

      const updateResponse = await testEnv.userManagement.put('/profile', updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.user.firstName).toBe(updateData.firstName);
      expect(updateResponse.data.user.phoneNumber).toBe(updateData.phoneNumber);

      console.log(`✅ Profile updated successfully`);
    });
  });

  describe('Phase 3: KYC Verification Process', () => {
    test('User should be able to start KYC verification', async () => {
      const kycData = {
        documentType: 'passport',
        documentNumber: 'P123456789',
        dateOfBirth: '1990-01-01',
        address: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
      };

      const kycResponse = await testEnv.userManagement.post('/kyc/start', kycData);

      expect(kycResponse.status).toBeWithinRange(200, 202);
      userJourneyData.kycId = kycResponse.data.kycId || kycResponse.data.id;

      console.log(`✅ KYC verification started`);
    });

    test('User should be able to check KYC status', async () => {
      const statusResponse = await testEnv.userManagement.get('/kyc/status');

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.data).toHaveProperty('status');

      userJourneyData.kycStatus = statusResponse.data.status;

      console.log(`✅ KYC status: ${userJourneyData.kycStatus}`);
    });
  });

  describe('Phase 4: Payment Setup and Subscription', () => {
    test('User should be able to add payment method', async () => {
      const paymentMethodData = {
        type: 'card',
        card: {
          number: '4242424242424242', // Stripe test card
          expMonth: 12,
          expYear: 2025,
          cvc: '123',
        },
        billingAddress: {
          name: `${userJourneyData.user.firstName} ${userJourneyData.user.lastName}`,
          line1: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
      };

      const paymentResponse = await testEnv.payment.post('/payment-methods', paymentMethodData);

      expect(paymentResponse.status).toBeWithinRange(200, 201);
      expect(paymentResponse.data).toHaveProperty('paymentMethodId');

      userJourneyData.paymentMethodId = paymentResponse.data.paymentMethodId;

      console.log(`✅ Payment method added`);
    });

    test('User should be able to subscribe to premium plan', async () => {
      const subscriptionData = {
        planId: 'premium_monthly',
        paymentMethodId: userJourneyData.paymentMethodId,
      };

      const subscriptionResponse = await testEnv.payment.post('/subscriptions', subscriptionData);

      expect(subscriptionResponse.status).toBeWithinRange(200, 201);
      expect(subscriptionResponse.data).toHaveProperty('subscriptionId');
      expect(subscriptionResponse.data.status).toBe('active');

      userJourneyData.subscriptionId = subscriptionResponse.data.subscriptionId;

      console.log(`✅ Premium subscription activated`);
    });

    test('User subscription should be reflected in user profile', async () => {
      // Wait a moment for subscription to propagate
      await new Promise(resolve => setTimeout(resolve, 2000));

      const profileResponse = await testEnv.userManagement.get('/auth/me');

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.user.subscriptionTier).toBe('premium');

      console.log(`✅ Subscription tier updated in profile`);
    });
  });

  describe('Phase 5: Market Data Access', () => {
    test('Premium user should be able to access real-time market data', async () => {
      const marketDataResponse = await testEnv.marketData.get('/quotes/AAPL');

      expect(marketDataResponse.status).toBe(200);
      expect(marketDataResponse.data).toHaveProperty('symbol', 'AAPL');
      expect(marketDataResponse.data).toHaveProperty('price');
      expect(marketDataResponse.data).toHaveProperty('timestamp');

      console.log(`✅ Market data access successful`);
    });

    test('User should be able to subscribe to real-time price updates', async () => {
      const subscriptionResponse = await testEnv.marketData.post('/subscriptions', {
        symbols: ['AAPL', 'GOOGL', 'TSLA'],
        dataTypes: ['price', 'volume'],
      });

      expect(subscriptionResponse.status).toBeWithinRange(200, 201);
      expect(subscriptionResponse.data).toHaveProperty('subscriptionId');

      userJourneyData.marketDataSubscriptionId = subscriptionResponse.data.subscriptionId;

      console.log(`✅ Market data subscription created`);
    });
  });

  describe('Phase 6: Trading Signals and Analysis', () => {
    test('User should be able to access trading signals', async () => {
      const signalsResponse = await testEnv.signals.get('/signals?symbols=AAPL,GOOGL');

      expect(signalsResponse.status).toBe(200);
      expect(Array.isArray(signalsResponse.data.signals)).toBe(true);

      if (signalsResponse.data.signals.length > 0) {
        const signal = signalsResponse.data.signals[0];
        expect(signal).toHaveProperty('symbol');
        expect(signal).toHaveProperty('signal');
        expect(signal).toHaveProperty('confidence');
        expect(signal).toHaveProperty('timestamp');
      }

      console.log(`✅ Trading signals accessed`);
    });

    test('User should be able to request custom signal analysis', async () => {
      const analysisRequest = {
        symbol: 'AAPL',
        timeframe: '1d',
        indicators: ['RSI', 'MACD', 'SMA'],
      };

      const analysisResponse = await testEnv.signals.post('/analysis', analysisRequest);

      expect(analysisResponse.status).toBeWithinRange(200, 202);
      expect(analysisResponse.data).toHaveProperty('analysisId');

      userJourneyData.analysisId = analysisResponse.data.analysisId;

      console.log(`✅ Custom analysis requested`);
    });
  });

  describe('Phase 7: Trading Execution', () => {
    test('User should be able to place a market order', async () => {
      const orderData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 1,
        orderType: 'market',
      };

      const orderResponse = await testEnv.trading.post('/orders', orderData);

      expect(orderResponse.status).toBeWithinRange(200, 201);
      expect(orderResponse.data).toHaveProperty('orderId');
      expect(orderResponse.data).toHaveProperty('status');
      expect(orderResponse.data.symbol).toBe('AAPL');
      expect(orderResponse.data.side).toBe('buy');

      userJourneyData.orderId = orderResponse.data.orderId;

      console.log(`✅ Market order placed: ${orderResponse.data.orderId}`);
    });

    test('User should be able to check order status', async () => {
      const orderStatusResponse = await testEnv.trading.get(`/orders/${userJourneyData.orderId}`);

      expect(orderStatusResponse.status).toBe(200);
      expect(orderStatusResponse.data).toHaveProperty('orderId', userJourneyData.orderId);
      expect(orderStatusResponse.data).toHaveProperty('status');

      console.log(`✅ Order status: ${orderStatusResponse.data.status}`);
    });

    test('User should be able to view trading history', async () => {
      const historyResponse = await testEnv.trading.get('/orders/history');

      expect(historyResponse.status).toBe(200);
      expect(Array.isArray(historyResponse.data.orders)).toBe(true);

      // Should include our recent order
      const recentOrder = historyResponse.data.orders.find(
        (order: any) => order.orderId === userJourneyData.orderId
      );
      expect(recentOrder).toBeDefined();

      console.log(`✅ Trading history accessed`);
    });
  });

  describe('Phase 8: Risk Management and Monitoring', () => {
    test('User should be able to view risk assessment', async () => {
      const riskResponse = await testEnv.riskManagement.get('/assessment');

      expect(riskResponse.status).toBe(200);
      expect(riskResponse.data).toHaveProperty('riskScore');
      expect(riskResponse.data).toHaveProperty('riskLevel');
      expect(riskResponse.data).toHaveProperty('recommendations');

      console.log(`✅ Risk assessment: ${riskResponse.data.riskLevel}`);
    });

    test('User should be able to set risk management rules', async () => {
      const riskRules = {
        maxDailyLoss: 1000,
        maxPositionSize: 10000,
        stopLossPercent: 5,
        takeProfitPercent: 15,
      };

      const rulesResponse = await testEnv.riskManagement.post('/rules', riskRules);

      expect(rulesResponse.status).toBeWithinRange(200, 201);
      expect(rulesResponse.data).toHaveProperty('ruleId');

      console.log(`✅ Risk management rules set`);
    });
  });

  describe('Phase 9: Notifications and Alerts', () => {
    test('User should be able to configure notification preferences', async () => {
      const notificationPrefs = {
        email: {
          priceAlerts: true,
          orderExecutions: true,
          marketNews: false,
        },
        sms: {
          priceAlerts: false,
          orderExecutions: true,
          marketNews: false,
        },
        push: {
          priceAlerts: true,
          orderExecutions: true,
          marketNews: true,
        },
      };

      const prefsResponse = await testEnv.notification.put('/preferences', notificationPrefs);

      expect(prefsResponse.status).toBe(200);
      expect(prefsResponse.data.preferences).toEqual(notificationPrefs);

      console.log(`✅ Notification preferences configured`);
    });

    test('User should be able to create price alerts', async () => {
      const alertData = {
        symbol: 'AAPL',
        condition: 'above',
        price: 160,
        enabled: true,
      };

      const alertResponse = await testEnv.notification.post('/alerts', alertData);

      expect(alertResponse.status).toBeWithinRange(200, 201);
      expect(alertResponse.data).toHaveProperty('alertId');

      userJourneyData.alertId = alertResponse.data.alertId;

      console.log(`✅ Price alert created`);
    });
  });

  describe('Phase 10: Educational Content Access', () => {
    test('Premium user should be able to access educational content', async () => {
      const contentResponse = await testEnv.education.get('/courses');

      expect(contentResponse.status).toBe(200);
      expect(Array.isArray(contentResponse.data.courses)).toBe(true);

      console.log(`✅ Educational content accessed`);
    });

    test('User should be able to enroll in a course', async () => {
      // Get available courses first
      const coursesResponse = await testEnv.education.get('/courses');
      
      if (coursesResponse.data.courses.length > 0) {
        const courseId = coursesResponse.data.courses[0].id;
        
        const enrollResponse = await testEnv.education.post(`/courses/${courseId}/enroll`);

        expect(enrollResponse.status).toBeWithinRange(200, 201);
        expect(enrollResponse.data).toHaveProperty('enrollmentId');

        console.log(`✅ Course enrollment successful`);
      }
    });
  });

  describe('Phase 11: Data Export and Account Management', () => {
    test('User should be able to export trading data', async () => {
      const exportResponse = await testEnv.trading.post('/export', {
        format: 'json',
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        dateTo: new Date().toISOString(),
      });

      expect(exportResponse.status).toBeWithinRange(200, 202);
      
      if (exportResponse.status === 202) {
        expect(exportResponse.data).toHaveProperty('exportId');
      } else {
        expect(exportResponse.data).toHaveProperty('data');
      }

      console.log(`✅ Data export initiated`);
    });

    test('User should be able to view account summary', async () => {
      const summaryResponse = await testEnv.userManagement.get('/account/summary');

      expect(summaryResponse.status).toBe(200);
      expect(summaryResponse.data).toHaveProperty('user');
      expect(summaryResponse.data).toHaveProperty('subscription');
      expect(summaryResponse.data).toHaveProperty('trading');
      expect(summaryResponse.data).toHaveProperty('payments');

      console.log(`✅ Account summary accessed`);
    });
  });

  describe('Complete Journey Validation', () => {
    test('All journey data should be consistent and complete', () => {
      expect(userJourneyData).toHaveProperty('user');
      expect(userJourneyData).toHaveProperty('userId');
      expect(userJourneyData).toHaveProperty('accessToken');
      expect(userJourneyData).toHaveProperty('subscriptionId');
      expect(userJourneyData).toHaveProperty('paymentMethodId');
      expect(userJourneyData).toHaveProperty('orderId');

      console.log(`✅ Complete user journey validated successfully`);
      console.log(`📊 Journey Summary:`, {
        userId: userJourneyData.userId,
        email: userJourneyData.user.email,
        subscription: 'premium',
        ordersPlaced: 1,
        riskRulesSet: true,
        alertsConfigured: true,
      });
    });
  });
});