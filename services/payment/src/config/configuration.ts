import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  // Database Configuration
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'payment_user',
    password: process.env.DATABASE_PASSWORD || 'payment_password',
    database: process.env.DATABASE_NAME || 'payment_db',
    ssl: process.env.DATABASE_SSL === 'true',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.DATABASE_LOGGING === 'true',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'payment:',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: '2024-06-20',
  },

  // PayPal Configuration
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@tradingplatform.com',
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    rateLimiting: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100, // 100 requests per window
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
  },

  // Payment Processing Configuration
  payments: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
    supportedCurrencies: process.env.SUPPORTED_CURRENCIES?.split(',') || ['USD', 'EUR', 'GBP'],
    minimumPaymentAmount: parseFloat(process.env.MINIMUM_PAYMENT_AMOUNT) || 1.00,
    maximumPaymentAmount: parseFloat(process.env.MAXIMUM_PAYMENT_AMOUNT) || 100000.00,
    feeCalculation: {
      stripePercentage: parseFloat(process.env.STRIPE_FEE_PERCENTAGE) || 2.9,
      stripeFixedFeeUSD: parseFloat(process.env.STRIPE_FIXED_FEE_USD) || 0.30,
      stripeFixedFeeEUR: parseFloat(process.env.STRIPE_FIXED_FEE_EUR) || 0.25,
    },
    refundPolicy: {
      allowPartialRefunds: process.env.ALLOW_PARTIAL_REFUNDS !== 'false',
      refundWindowDays: parseInt(process.env.REFUND_WINDOW_DAYS, 10) || 30,
      autoRefundThreshold: parseFloat(process.env.AUTO_REFUND_THRESHOLD) || 10.00,
    },
  },

  // Subscription Configuration
  subscriptions: {
    gracePeriodDays: parseInt(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS, 10) || 3,
    retryAttempts: parseInt(process.env.SUBSCRIPTION_RETRY_ATTEMPTS, 10) || 3,
    retryIntervalHours: parseInt(process.env.SUBSCRIPTION_RETRY_INTERVAL_HOURS, 10) || 24,
    cancelationPeriodDays: parseInt(process.env.SUBSCRIPTION_CANCELATION_PERIOD_DAYS, 10) || 1,
  },

  // Wallet Configuration
  wallets: {
    defaultDailyWithdrawalLimit: parseFloat(process.env.DEFAULT_DAILY_WITHDRAWAL_LIMIT) || 10000.00,
    minimumWalletBalance: parseFloat(process.env.MINIMUM_WALLET_BALANCE) || 0.00,
    maximumWalletBalance: parseFloat(process.env.MAXIMUM_WALLET_BALANCE) || 1000000.00,
    interestCalculationFrequency: process.env.INTEREST_CALCULATION_FREQUENCY || 'daily', // 'daily', 'weekly', 'monthly'
    supportedWalletTypes: process.env.SUPPORTED_WALLET_TYPES?.split(',') || ['trading', 'savings', 'escrow'],
    autoCreateTradingWallet: process.env.AUTO_CREATE_TRADING_WALLET !== 'false',
  },

  // Tax Configuration
  tax: {
    enableTaxCalculation: process.env.ENABLE_TAX_CALCULATION !== 'false',
    defaultTaxRate: parseFloat(process.env.DEFAULT_TAX_RATE) || 0.0,
    taxRateService: process.env.TAX_RATE_SERVICE || 'internal', // 'internal', 'taxjar', 'avalara'
    businessLocations: process.env.BUSINESS_LOCATIONS?.split(',') || ['US:CA', 'US:NY'],
  },

  // Fraud Detection Configuration
  fraudDetection: {
    enabled: process.env.FRAUD_DETECTION_ENABLED !== 'false',
    velocityLimits: {
      maxTransactionsPerMinute: parseInt(process.env.MAX_TRANSACTIONS_PER_MINUTE, 10) || 10,
      maxAmountPerHour: parseFloat(process.env.MAX_AMOUNT_PER_HOUR) || 5000.00,
      maxFailedAttemptsPerDay: parseInt(process.env.MAX_FAILED_ATTEMPTS_PER_DAY, 10) || 5,
    },
    riskScoring: {
      newUserRiskMultiplier: parseFloat(process.env.NEW_USER_RISK_MULTIPLIER) || 1.5,
      highAmountThreshold: parseFloat(process.env.HIGH_AMOUNT_THRESHOLD) || 1000.00,
      suspiciousCountries: process.env.SUSPICIOUS_COUNTRIES?.split(',') || [],
    },
  },

  // Compliance Configuration
  compliance: {
    kycRequired: process.env.KYC_REQUIRED !== 'false',
    amlScreening: process.env.AML_SCREENING !== 'false',
    sanctionsListChecking: process.env.SANCTIONS_LIST_CHECKING !== 'false',
    reportingThresholds: {
      ctRThreshold: parseFloat(process.env.CTR_THRESHOLD) || 10000.00, // Currency Transaction Report
      sarThreshold: parseFloat(process.env.SAR_THRESHOLD) || 5000.00, // Suspicious Activity Report
    },
    dataRetention: {
      auditLogRetentionDays: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS, 10) || 2555, // 7 years
      transactionDataRetentionDays: parseInt(process.env.TRANSACTION_DATA_RETENTION_DAYS, 10) || 2190, // 6 years
      userDataRetentionDays: parseInt(process.env.USER_DATA_RETENTION_DAYS, 10) || 365, // 1 year after deletion
    },
  },

  // Monitoring and Alerting
  monitoring: {
    enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    alerting: {
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',
      emailAlerts: process.env.EMAIL_ALERTS !== 'false',
      alertThresholds: {
        failureRatePercent: parseFloat(process.env.FAILURE_RATE_ALERT_THRESHOLD) || 5.0,
        responseTimeMs: parseInt(process.env.RESPONSE_TIME_ALERT_THRESHOLD_MS, 10) || 5000,
        queueDepth: parseInt(process.env.QUEUE_DEPTH_ALERT_THRESHOLD, 10) || 100,
      },
    },
  },

  // API Configuration
  api: {
    port: parseInt(process.env.PORT, 10) || 3003,
    host: process.env.HOST || '0.0.0.0',
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || 'api',
    swaggerEnabled: process.env.SWAGGER_ENABLED !== 'false',
    swaggerPath: process.env.SWAGGER_PATH || 'docs',
  },

  // Microservices Communication
  microservices: {
    userService: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.USER_SERVICE_TIMEOUT, 10) || 5000,
    },
    tradingService: {
      url: process.env.TRADING_SERVICE_URL || 'http://localhost:3002',
      timeout: parseInt(process.env.TRADING_SERVICE_TIMEOUT, 10) || 5000,
    },
    notificationService: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
      timeout: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT, 10) || 5000,
    },
  },

  // Queue Configuration
  queues: {
    paymentProcessing: {
      name: 'payment-processing',
      concurrency: parseInt(process.env.PAYMENT_QUEUE_CONCURRENCY, 10) || 5,
      attempts: parseInt(process.env.PAYMENT_QUEUE_ATTEMPTS, 10) || 3,
      delay: parseInt(process.env.PAYMENT_QUEUE_DELAY, 10) || 5000,
    },
    webhookProcessing: {
      name: 'webhook-processing',
      concurrency: parseInt(process.env.WEBHOOK_QUEUE_CONCURRENCY, 10) || 10,
      attempts: parseInt(process.env.WEBHOOK_QUEUE_ATTEMPTS, 10) || 5,
      delay: parseInt(process.env.WEBHOOK_QUEUE_DELAY, 10) || 1000,
    },
    notifications: {
      name: 'notifications',
      concurrency: parseInt(process.env.NOTIFICATION_QUEUE_CONCURRENCY, 10) || 20,
      attempts: parseInt(process.env.NOTIFICATION_QUEUE_ATTEMPTS, 10) || 3,
      delay: parseInt(process.env.NOTIFICATION_QUEUE_DELAY, 10) || 2000,
    },
  },

  // Feature Flags
  features: {
    enableSubscriptions: process.env.ENABLE_SUBSCRIPTIONS !== 'false',
    enableWallets: process.env.ENABLE_WALLETS !== 'false',
    enableCryptoPayments: process.env.ENABLE_CRYPTO_PAYMENTS === 'true',
    enableMultiCurrency: process.env.ENABLE_MULTI_CURRENCY !== 'false',
    enableInvoicing: process.env.ENABLE_INVOICING !== 'false',
    enableRecurringPayments: process.env.ENABLE_RECURRING_PAYMENTS !== 'false',
  },

  // Development Configuration
  development: {
    seedData: process.env.SEED_DATA === 'true',
    mockPayments: process.env.MOCK_PAYMENTS === 'true',
    debugLogging: process.env.DEBUG_LOGGING === 'true',
    allowTestCards: process.env.ALLOW_TEST_CARDS !== 'false',
  },
}));