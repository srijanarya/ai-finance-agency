import 'reflect-metadata';
import '../../../shared/test-utils/setup';

// User Management Service specific test setup

// Additional environment variables for user management service
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'test_user_management';
process.env.DATABASE_USER = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '1h';
process.env.BCRYPT_ROUNDS = '10';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';

// Mock OAuth strategies
jest.mock('passport-google-oauth20', () => ({
  Strategy: jest.fn().mockImplementation((options, verify) => {
    return {
      name: 'google',
      authenticate: jest.fn(),
    };
  }),
}));

jest.mock('passport-github2', () => ({
  Strategy: jest.fn().mockImplementation((options, verify) => {
    return {
      name: 'github',
      authenticate: jest.fn(),
    };
  }),
}));

// Mock 2FA libraries
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(() => ({
    otpauth_url: 'otpauth://totp/test',
    base32: 'TEST_SECRET',
  })),
  totp: {
    verify: jest.fn(() => ({ delta: 0 })),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn((data) => Promise.resolve(`data:image/png;base64,test-qr-code`)),
}));

// Mock GeoIP
jest.mock('geoip-lite', () => ({
  lookup: jest.fn(() => ({
    country: 'US',
    region: 'CA',
    city: 'San Francisco',
  })),
}));

// Mock UA Parser
jest.mock('ua-parser-js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getResult: () => ({
      browser: { name: 'Chrome', version: '100.0.0' },
      os: { name: 'Windows', version: '10' },
      device: { type: 'desktop' },
    }),
  })),
}));