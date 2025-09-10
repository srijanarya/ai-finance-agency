import 'reflect-metadata';
import '../../../shared/test-utils/setup';

// Payment Service specific test setup

// Additional environment variables for payment service
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'test_payment';
process.env.DATABASE_USER = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.STRIPE_API_KEY = 'sk_test_123456789';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123456';
process.env.PAYPAL_CLIENT_ID = 'test_paypal_client_id';
process.env.PAYPAL_CLIENT_SECRET = 'test_paypal_client_secret';
process.env.ENCRYPTION_KEY = 'test_encryption_key_32_chars_long';

// Mock Stripe
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        client_secret: 'pi_test_123456_secret',
        status: 'requires_payment_method',
        amount: 2000,
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        status: 'succeeded',
        amount: 2000,
        currency: 'usd',
        charges: {
          data: [{
            id: 'ch_test_123456',
            payment_method: 'pm_test_123456',
          }],
        },
      }),
      update: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        status: 'succeeded',
      }),
      confirm: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        status: 'succeeded',
      }),
      cancel: jest.fn().mockResolvedValue({
        id: 'pi_test_123456',
        status: 'canceled',
      }),
    },
    paymentMethods: {
      create: jest.fn().mockResolvedValue({
        id: 'pm_test_123456',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pm_test_123456',
        type: 'card',
      }),
      attach: jest.fn().mockResolvedValue({
        id: 'pm_test_123456',
        customer: 'cus_test_123456',
      }),
      detach: jest.fn().mockResolvedValue({
        id: 'pm_test_123456',
      }),
    },
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test_123456',
        email: 'test@example.com',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'cus_test_123456',
        email: 'test@example.com',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'cus_test_123456',
        email: 'updated@example.com',
      }),
      delete: jest.fn().mockResolvedValue({
        id: 'cus_test_123456',
        deleted: true,
      }),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_test_123456',
        amount: 2000,
        charge: 'ch_test_123456',
        status: 'succeeded',
      }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        id: 'evt_test_123456',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123456',
            status: 'succeeded',
          },
        },
      }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({
        id: 'sub_test_123456',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_test_123456',
        status: 'active',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'sub_test_123456',
        status: 'active',
      }),
      cancel: jest.fn().mockResolvedValue({
        id: 'sub_test_123456',
        status: 'canceled',
      }),
    },
    invoices: {
      create: jest.fn().mockResolvedValue({
        id: 'in_test_123456',
        status: 'open',
        amount_due: 2000,
        currency: 'usd',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'in_test_123456',
        status: 'paid',
      }),
      pay: jest.fn().mockResolvedValue({
        id: 'in_test_123456',
        status: 'paid',
      }),
    },
  })),
}));

// Mock PDF generation
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    pipe: jest.fn(),
    end: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'end') {
        setTimeout(callback, 0);
      }
    }),
  }));
});

// Mock QR code generation
jest.mock('qrcode', () => ({
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('qr-code-data')),
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,qr-code'),
}));

// Mock Bull Queue
jest.mock('bull', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({
      id: 'job-123',
      data: {},
    }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn(),
    getJobs: jest.fn().mockResolvedValue([]),
    getJob: jest.fn().mockResolvedValue({
      id: 'job-123',
      progress: 100,
      finishedOn: Date.now(),
    }),
  })),
}));

// Mock decimal.js
jest.mock('decimal.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((value) => ({
    toNumber: () => parseFloat(value),
    toString: () => value.toString(),
    plus: jest.fn().mockReturnThis(),
    minus: jest.fn().mockReturnThis(),
    mul: jest.fn().mockReturnThis(),
    div: jest.fn().mockReturnThis(),
    equals: jest.fn((other) => value === other),
    lessThan: jest.fn((other) => value < other),
    greaterThan: jest.fn((other) => value > other),
  })),
}));