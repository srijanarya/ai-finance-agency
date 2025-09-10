// TREUM AI Finance Platform - Critical Path Test Setup

// Global test configuration for critical path tests
beforeAll(async () => {
  // Set test timeout for all critical path tests
  jest.setTimeout(30000);
  
  // Ensure test environment variables are set
  if (!process.env.TEST_BASE_URL) {
    process.env.TEST_BASE_URL = 'http://localhost:3000';
  }
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Custom matchers for critical path tests
expect.extend({
  toBeWithinResponseTime(received, expected) {
    const pass = received < expected;
    
    if (pass) {
      return {
        message: () => `expected ${received}ms not to be within ${expected}ms`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received}ms to be within ${expected}ms`,
        pass: false,
      };
    }
  },
  
  toHaveValidApiResponse(received) {
    const hasStatus = received.hasOwnProperty('status');
    const hasData = received.hasOwnProperty('data');
    const validStatus = received.status >= 200 && received.status < 400;
    
    const pass = hasStatus && hasData && validStatus;
    
    if (pass) {
      return {
        message: () => `expected response not to be valid API response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to be valid API response with status and data`,
        pass: false,
      };
    }
  }
});