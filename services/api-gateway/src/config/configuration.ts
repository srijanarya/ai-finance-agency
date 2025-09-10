export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  grpcPort: parseInt(process.env.GRPC_PORT, 10) || 50051,
  environment: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'api-gateway',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // RabbitMQ configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },

  // Consul configuration
  consul: {
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT, 10) || 8500,
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // API Key configuration
  apiKey: {
    header: process.env.API_KEY_HEADER || 'X-API-Key',
    secret: process.env.API_KEY_SECRET || 'dev-api-key-secret',
  },

  // Encryption configuration
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'dev-encryption-key',
  },

  // CORS configuration
  cors: {
    origins: process.env.CORS_ORIGINS || '*',
  },

  // Rate limiting configuration
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60000, // 1 minute
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    globalTtl: parseInt(process.env.GLOBAL_RATE_LIMIT_TTL, 10) || 60000,
    globalLimit: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX, 10) || 1000,
  },

  // Service discovery configuration
  services: {
    'user-management': {
      name: 'user-management',
      port: 3001,
      grpcPort: 50052,
      healthEndpoint: '/health',
      paths: ['/auth', '/users'],
    },
    trading: {
      name: 'trading',
      port: 3002,
      grpcPort: 50053,
      healthEndpoint: '/health',
      paths: ['/trading'],
      websocket: true,
    },
    signals: {
      name: 'signals',
      port: 3003,
      grpcPort: 50054,
      healthEndpoint: '/health',
      paths: ['/signals'],
    },
    payment: {
      name: 'payment',
      port: 3004,
      grpcPort: 50055,
      healthEndpoint: '/health',
      paths: ['/payments'],
    },
    education: {
      name: 'education',
      port: 3005,
      grpcPort: 50056,
      healthEndpoint: '/health',
      paths: ['/education'],
    },
  },

  // Circuit breaker configuration
  circuitBreaker: {
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT, 10) || 3000,
    errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD, 10) || 50,
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 10) || 30000,
    rollingCountTimeout: parseInt(process.env.CIRCUIT_BREAKER_ROLLING_COUNT_TIMEOUT, 10) || 10000,
    rollingCountBuckets: parseInt(process.env.CIRCUIT_BREAKER_ROLLING_COUNT_BUCKETS, 10) || 10,
  },

  // Monitoring configuration
  monitoring: {
    metricsPath: process.env.METRICS_PATH || '/metrics',
    healthPath: process.env.HEALTH_PATH || '/health',
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },
});