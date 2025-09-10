// TREUM AI Finance Platform - Global Test Setup

// Global test configuration
beforeAll(() => {
  // Set default test timeout
  jest.setTimeout(10000);
});

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-jwt-secret';

// Suppress console.log in tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Only show errors in tests
console.log = () => {};
console.warn = () => {};

// Keep error logging for debugging
console.error = (...args) => {
  if (process.env.DEBUG_TESTS === 'true') {
    originalConsoleError(...args);
  }
};

// Restore console methods after all tests
afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});