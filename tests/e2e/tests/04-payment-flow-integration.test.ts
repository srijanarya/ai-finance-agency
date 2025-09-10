import { TestEnvironment } from '../utils/test-environment';
import { TestDataGenerator } from '../utils/test-data-generator';

describe('Payment Flow Integration Tests', () => {
  let testEnv: TestEnvironment;
  let dataGenerator: TestDataGenerator;
  let authToken: string;
  let testUser: any;
  let paymentData: any = {};

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
    testUser.id = registerResponse.data.user.id;
  });

  afterAll(async () => {
    await testEnv.clearAuthToken();
  });

  describe('Payment Method Management', () => {
    test('Should be able to add a payment method', async () => {
      const paymentMethodData = {
        type: 'card',
        card: {
          number: '4242424242424242', // Stripe test card
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

      const response = await testEnv.payment.post('/payment-methods', paymentMethodData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('paymentMethodId');
      expect(response.data).toHaveProperty('type', 'card');
      expect(response.data).toHaveProperty('card');
      expect(response.data.card).toHaveProperty('last4', '4242');

      paymentData.paymentMethodId = response.data.paymentMethodId;

      console.log(`✅ Payment method added: ${response.data.paymentMethodId}`);
    });

    test('Should be able to list payment methods', async () => {
      const response = await testEnv.payment.get('/payment-methods');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.paymentMethods)).toBe(true);
      expect(response.data.paymentMethods.length).toBeGreaterThan(0);

      const addedMethod = response.data.paymentMethods.find(
        (pm: any) => pm.id === paymentData.paymentMethodId
      );
      expect(addedMethod).toBeDefined();

      console.log(`✅ Payment methods listed: ${response.data.paymentMethods.length} methods`);
    });

    test('Should be able to set default payment method', async () => {
      const response = await testEnv.payment.put(
        `/payment-methods/${paymentData.paymentMethodId}/default`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isDefault', true);

      console.log(`✅ Default payment method set`);
    });
  });

  describe('Subscription Management', () => {
    test('Should be able to create a subscription', async () => {
      const subscriptionData = {
        planId: 'premium_monthly',
        paymentMethodId: paymentData.paymentMethodId,
      };

      const response = await testEnv.payment.post('/subscriptions', subscriptionData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('subscriptionId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('planId', 'premium_monthly');
      expect(response.data).toHaveProperty('amount');

      paymentData.subscriptionId = response.data.subscriptionId;

      console.log(`✅ Subscription created: ${response.data.subscriptionId}`);
    });

    test('Should be able to get subscription details', async () => {
      const response = await testEnv.payment.get(`/subscriptions/${paymentData.subscriptionId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('subscriptionId', paymentData.subscriptionId);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('currentPeriodStart');
      expect(response.data).toHaveProperty('currentPeriodEnd');

      console.log(`✅ Subscription details retrieved`);
    });

    test('Should reflect subscription in user profile', async () => {
      // Wait a moment for subscription to propagate across services
      await new Promise(resolve => setTimeout(resolve, 3000));

      const profileResponse = await testEnv.userManagement.get('/auth/me');

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.data.user.subscriptionTier).toBe('premium');

      console.log(`✅ Subscription tier updated in user profile`);
    });

    test('Should be able to list user subscriptions', async () => {
      const response = await testEnv.payment.get('/subscriptions');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.subscriptions)).toBe(true);
      expect(response.data.subscriptions.length).toBeGreaterThan(0);

      const currentSubscription = response.data.subscriptions.find(
        (sub: any) => sub.subscriptionId === paymentData.subscriptionId
      );
      expect(currentSubscription).toBeDefined();

      console.log(`✅ User subscriptions listed: ${response.data.subscriptions.length} subscriptions`);
    });
  });

  describe('One-time Payments', () => {
    test('Should be able to process a one-time payment', async () => {
      const paymentRequest = {
        amount: 99.99,
        currency: 'USD',
        description: 'Test payment for premium content',
        paymentMethodId: paymentData.paymentMethodId,
        metadata: {
          userId: testUser.id,
          type: 'content_purchase',
        },
      };

      const response = await testEnv.payment.post('/payments', paymentRequest);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('paymentId');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('amount', 99.99);
      expect(response.data).toHaveProperty('currency', 'USD');

      paymentData.oneTimePaymentId = response.data.paymentId;

      console.log(`✅ One-time payment processed: ${response.data.paymentId}`);
    });

    test('Should be able to check payment status', async () => {
      const response = await testEnv.payment.get(`/payments/${paymentData.oneTimePaymentId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('paymentId', paymentData.oneTimePaymentId);
      expect(response.data).toHaveProperty('status');
      expect(['succeeded', 'processing', 'pending'].includes(response.data.status)).toBe(true);

      console.log(`✅ Payment status: ${response.data.status}`);
    });

    test('Should be able to list payment history', async () => {
      const response = await testEnv.payment.get('/payments/history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.payments)).toBe(true);
      expect(response.data.payments.length).toBeGreaterThan(0);

      const testPayment = response.data.payments.find(
        (payment: any) => payment.paymentId === paymentData.oneTimePaymentId
      );
      expect(testPayment).toBeDefined();

      console.log(`✅ Payment history retrieved: ${response.data.payments.length} payments`);
    });
  });

  describe('Billing and Invoicing', () => {
    test('Should be able to get billing information', async () => {
      const response = await testEnv.payment.get('/billing');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('customerId');
      expect(response.data).toHaveProperty('billingAddress');
      expect(response.data).toHaveProperty('paymentMethods');

      console.log(`✅ Billing information retrieved`);
    });

    test('Should be able to get upcoming invoice', async () => {
      const response = await testEnv.payment.get('/billing/upcoming-invoice');

      expect(response.status).toBeWithinRange(200, 404); // 404 if no upcoming invoice

      if (response.status === 200) {
        expect(response.data).toHaveProperty('amount');
        expect(response.data).toHaveProperty('dueDate');
        console.log(`✅ Upcoming invoice: $${response.data.amount}`);
      } else {
        console.log(`✅ No upcoming invoice`);
      }
    });

    test('Should be able to list invoices', async () => {
      const response = await testEnv.payment.get('/billing/invoices');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.invoices)).toBe(true);

      console.log(`✅ Invoices listed: ${response.data.invoices.length} invoices`);
    });
  });

  describe('Payment Webhooks and Events', () => {
    test('Should handle payment success webhook', async () => {
      // Simulate webhook payload
      const webhookPayload = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentData.oneTimePaymentId,
            amount: 9999, // $99.99 in cents
            currency: 'usd',
            status: 'succeeded',
            metadata: {
              userId: testUser.id,
            },
          },
        },
      };

      const response = await testEnv.payment.post('/webhooks/stripe', webhookPayload, {
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      expect(response.status).toBeWithinRange(200, 202);

      console.log(`✅ Payment success webhook processed`);
    });

    test('Should handle subscription update webhook', async () => {
      const webhookPayload = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: paymentData.subscriptionId,
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            metadata: {
              userId: testUser.id,
            },
          },
        },
      };

      const response = await testEnv.payment.post('/webhooks/stripe', webhookPayload, {
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      expect(response.status).toBeWithinRange(200, 202);

      console.log(`✅ Subscription update webhook processed`);
    });
  });

  describe('Payment Method Updates', () => {
    test('Should be able to update payment method', async () => {
      const updateData = {
        billingAddress: {
          name: `${testUser.firstName} ${testUser.lastName}`,
          line1: '456 Updated Street',
          city: 'New Test City',
          state: 'NT',
          postalCode: '54321',
          country: 'US',
        },
      };

      const response = await testEnv.payment.put(
        `/payment-methods/${paymentData.paymentMethodId}`,
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.data.billingAddress.line1).toBe('456 Updated Street');

      console.log(`✅ Payment method updated`);
    });

    test('Should be able to add additional payment method', async () => {
      const additionalPaymentMethod = {
        type: 'card',
        card: {
          number: '4000056655665556', // Another Stripe test card
          expMonth: 8,
          expYear: 2026,
          cvc: '456',
        },
        billingAddress: {
          name: `${testUser.firstName} ${testUser.lastName}`,
          line1: '789 Secondary Street',
          city: 'Test City',
          state: 'TS',
          postalCode: '98765',
          country: 'US',
        },
      };

      const response = await testEnv.payment.post('/payment-methods', additionalPaymentMethod);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data.card.last4).toBe('5556');

      paymentData.secondaryPaymentMethodId = response.data.paymentMethodId;

      console.log(`✅ Additional payment method added`);
    });
  });

  describe('Subscription Modifications', () => {
    test('Should be able to upgrade subscription', async () => {
      const upgradeData = {
        newPlanId: 'premium_yearly',
        prorationBehavior: 'always_invoice',
      };

      const response = await testEnv.payment.put(
        `/subscriptions/${paymentData.subscriptionId}/upgrade`,
        upgradeData
      );

      expect(response.status).toBe(200);
      expect(response.data.planId).toBe('premium_yearly');

      console.log(`✅ Subscription upgraded to yearly plan`);
    });

    test('Should be able to update subscription payment method', async () => {
      const updateData = {
        paymentMethodId: paymentData.secondaryPaymentMethodId,
      };

      const response = await testEnv.payment.put(
        `/subscriptions/${paymentData.subscriptionId}/payment-method`,
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.data.paymentMethodId).toBe(paymentData.secondaryPaymentMethodId);

      console.log(`✅ Subscription payment method updated`);
    });
  });

  describe('Failed Payment Handling', () => {
    test('Should handle failed payment gracefully', async () => {
      // Use a test card that will fail
      const failingPaymentMethod = {
        type: 'card',
        card: {
          number: '4000000000000002', // Stripe test card that will be declined
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

      const paymentMethodResponse = await testEnv.payment.post('/payment-methods', failingPaymentMethod);
      
      if (paymentMethodResponse.status >= 200 && paymentMethodResponse.status < 300) {
        const failingPaymentMethodId = paymentMethodResponse.data.paymentMethodId;

        const paymentRequest = {
          amount: 50.00,
          currency: 'USD',
          description: 'Test failed payment',
          paymentMethodId: failingPaymentMethodId,
        };

        const response = await testEnv.payment.post('/payments', paymentRequest);

        // Should either reject the payment or return with failed status
        expect([400, 402, 200, 201].includes(response.status)).toBe(true);

        if (response.status >= 200 && response.status < 300) {
          expect(['failed', 'requires_action'].includes(response.data.status)).toBe(true);
        }

        console.log(`✅ Failed payment handled gracefully`);
      }
    });
  });

  describe('Refunds and Cancellations', () => {
    test('Should be able to process a refund', async () => {
      const refundData = {
        paymentId: paymentData.oneTimePaymentId,
        amount: 50.00, // Partial refund
        reason: 'requested_by_customer',
      };

      const response = await testEnv.payment.post('/refunds', refundData);

      expect(response.status).toBeWithinRange(200, 201);
      expect(response.data).toHaveProperty('refundId');
      expect(response.data).toHaveProperty('amount', 50.00);
      expect(response.data).toHaveProperty('status');

      paymentData.refundId = response.data.refundId;

      console.log(`✅ Refund processed: ${response.data.refundId}`);
    });

    test('Should be able to cancel subscription', async () => {
      const cancelData = {
        cancelAtPeriodEnd: true,
        reason: 'user_requested',
      };

      const response = await testEnv.payment.put(
        `/subscriptions/${paymentData.subscriptionId}/cancel`,
        cancelData
      );

      expect(response.status).toBe(200);
      expect(response.data.cancelAtPeriodEnd).toBe(true);
      expect(response.data).toHaveProperty('canceledAt');

      console.log(`✅ Subscription scheduled for cancellation`);
    });
  });

  describe('Payment Analytics and Reporting', () => {
    test('Should be able to get payment analytics', async () => {
      const response = await testEnv.payment.get('/analytics/payments', {
        params: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalAmount');
      expect(response.data).toHaveProperty('totalTransactions');
      expect(response.data).toHaveProperty('successfulPayments');
      expect(response.data).toHaveProperty('failedPayments');

      console.log(`✅ Payment analytics retrieved`);
    });

    test('Should be able to export payment data', async () => {
      const exportRequest = {
        format: 'csv',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        includeRefunds: true,
      };

      const response = await testEnv.payment.post('/export/payments', exportRequest);

      expect(response.status).toBeWithinRange(200, 202);

      if (response.status === 202) {
        expect(response.data).toHaveProperty('exportId');
        console.log(`✅ Payment export initiated: ${response.data.exportId}`);
      } else {
        expect(response.data).toHaveProperty('data');
        console.log(`✅ Payment data exported immediately`);
      }
    });
  });

  describe('Integration Validation', () => {
    test('Payment data should be consistent across services', async () => {
      // Check that payment information is consistent in user service
      const userProfile = await testEnv.userManagement.get('/auth/me');
      expect(userProfile.data.user.subscriptionTier).toBe('premium');

      // Check that payment method exists in payment service
      const paymentMethods = await testEnv.payment.get('/payment-methods');
      const userPaymentMethods = paymentMethods.data.paymentMethods.filter(
        (pm: any) => pm.customerId === userProfile.data.user.customerId
      );
      expect(userPaymentMethods.length).toBeGreaterThan(0);

      console.log(`✅ Payment data consistency validated across services`);
    });

    test('Should have complete payment journey audit trail', () => {
      expect(paymentData).toHaveProperty('paymentMethodId');
      expect(paymentData).toHaveProperty('subscriptionId');
      expect(paymentData).toHaveProperty('oneTimePaymentId');
      expect(paymentData).toHaveProperty('refundId');

      console.log(`✅ Complete payment journey audit trail:`, {
        paymentMethods: [paymentData.paymentMethodId, paymentData.secondaryPaymentMethodId],
        subscription: paymentData.subscriptionId,
        payments: [paymentData.oneTimePaymentId],
        refunds: [paymentData.refundId],
      });
    });
  });
});