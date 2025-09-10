export default () => ({
  port: parseInt(process.env.PORT, 10) || 3008,
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'market_data',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  apiKeys: {
    alphaVantage: process.env.ALPHA_VANTAGE_API_KEY || '',
    iex: process.env.IEX_API_TOKEN || '',
    // Yahoo Finance doesn't require an API key
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },

  websocket: {
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS, 10) || 1000,
    maxSymbolsPerClient: parseInt(process.env.WS_MAX_SYMBOLS_PER_CLIENT, 10) || 50,
  },

  dataFetch: {
    intervalSeconds: parseInt(process.env.DATA_FETCH_INTERVAL, 10) || 30,
    enableScheduledFetch: process.env.ENABLE_SCHEDULED_FETCH === 'true',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes
    max: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 100,
  },

  grpc: {
    port: parseInt(process.env.GRPC_PORT, 10) || 50008,
    host: process.env.GRPC_HOST || '0.0.0.0',
  },

  consul: {
    host: process.env.CONSUL_HOST || 'localhost',
    port: parseInt(process.env.CONSUL_PORT, 10) || 8500,
    serviceName: 'market-data-service',
    servicePort: parseInt(process.env.PORT, 10) || 3008,
  },

  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableTracing: process.env.ENABLE_TRACING === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9090,
  },
});