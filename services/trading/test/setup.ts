import 'reflect-metadata';
import '../../../shared/test-utils/setup';

// Trading Service specific test setup

// Additional environment variables for trading service
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'test_trading';
process.env.DATABASE_USER = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.WEBSOCKET_PORT = '3001';
process.env.CORS_ORIGIN = '*';

// Mock Socket.IO
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    socketsJoin: jest.fn(),
    socketsLeave: jest.fn(),
    adapter: {
      rooms: new Map(),
      sids: new Map(),
    },
  })),
  Socket: jest.fn(),
}));

// Mock WebSocket client
global.WebSocket = jest.fn().mockImplementation(() => ({
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock trading APIs
jest.mock('alpaca-trade-api', () => {
  return jest.fn().mockImplementation(() => ({
    getAccount: jest.fn().mockResolvedValue({
      id: 'test-account-id',
      account_number: '123456789',
      status: 'ACTIVE',
      currency: 'USD',
      buying_power: '10000.00',
      cash: '5000.00',
      portfolio_value: '15000.00',
    }),
    getOrders: jest.fn().mockResolvedValue([
      {
        id: 'order-123',
        symbol: 'AAPL',
        qty: '100',
        side: 'buy',
        type: 'market',
        status: 'filled',
        filled_at: new Date().toISOString(),
      },
    ]),
    submitOrder: jest.fn().mockResolvedValue({
      id: 'new-order-123',
      symbol: 'TSLA',
      qty: '50',
      side: 'buy',
      type: 'market',
      status: 'accepted',
      submitted_at: new Date().toISOString(),
    }),
    cancelOrder: jest.fn().mockResolvedValue({
      id: 'order-123',
      status: 'canceled',
    }),
    getPositions: jest.fn().mockResolvedValue([
      {
        symbol: 'AAPL',
        qty: '100',
        side: 'long',
        market_value: '15000.00',
        cost_basis: '14000.00',
        unrealized_pl: '1000.00',
        unrealized_plpc: '0.0714',
      },
    ]),
    stream: {
      on: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
    },
  }));
});

// Mock market data providers
jest.mock('ws', () => ({
  WebSocketServer: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    clients: new Set(),
    close: jest.fn(),
  })),
  WebSocket: global.WebSocket,
}));

// Mock technical indicators
jest.mock('technicalindicators', () => ({
  SMA: {
    calculate: jest.fn(() => [10.5, 11.2, 10.8]),
  },
  EMA: {
    calculate: jest.fn(() => [10.7, 11.0, 10.9]),
  },
  RSI: {
    calculate: jest.fn(() => [65.2, 58.7, 62.1]),
  },
  MACD: {
    calculate: jest.fn(() => [
      { MACD: 0.5, signal: 0.3, histogram: 0.2 },
      { MACD: 0.7, signal: 0.4, histogram: 0.3 },
    ]),
  },
  BollingerBands: {
    calculate: jest.fn(() => [
      { upper: 12.5, middle: 11.0, lower: 9.5, pb: 0.6, bandwidth: 0.27 },
    ]),
  },
}));

// Mock Redis for real-time data caching
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  hget: jest.fn(),
  hset: jest.fn(),
  hgetall: jest.fn(),
  zadd: jest.fn(),
  zrange: jest.fn(),
  zrem: jest.fn(),
  expire: jest.fn(),
  exists: jest.fn(),
  flushall: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

// Export mock client for tests
export { mockRedisClient };