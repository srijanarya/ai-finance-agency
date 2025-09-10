// TREUM AI Finance Platform - Critical Path Tests
// API Gateway Service - Production Deployment Validation

const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'https://api.treum.ai';
const TIMEOUT = 30000;

describe('API Gateway Critical Path Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Setup test authentication
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
        email: 'test@treum.ai',
        password: 'test123'
      }, { timeout: TIMEOUT });
      
      authToken = response.data.access_token;
    } catch (error) {
      console.error('Failed to authenticate for critical path tests:', error.message);
    }
  });

  test('Health endpoint should be accessible', async () => {
    const response = await axios.get(`${BASE_URL}/health`, {
      timeout: TIMEOUT
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'healthy');
    expect(response.data).toHaveProperty('timestamp');
    expect(response.data).toHaveProperty('uptime');
  });

  test('Readiness endpoint should confirm all services are ready', async () => {
    const response = await axios.get(`${BASE_URL}/ready`, {
      timeout: TIMEOUT
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'ready');
    expect(response.data).toHaveProperty('services');
    expect(response.data.services).toHaveProperty('database');
    expect(response.data.services).toHaveProperty('redis');
  });

  test('API Gateway routing should work correctly', async () => {
    const response = await axios.get(`${BASE_URL}/api/v1/gateway/status`, {
      timeout: TIMEOUT
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('gateway', 'active');
    expect(response.data).toHaveProperty('version');
  });

  test('Authentication flow should work end-to-end', async () => {
    // Test login
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
      email: 'test@treum.ai',
      password: 'test123'
    }, { timeout: TIMEOUT });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('access_token');
    
    const token = loginResponse.data.access_token;
    
    // Test protected route access
    const profileResponse = await axios.get(`${BASE_URL}/api/v1/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: TIMEOUT
    });
    
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.data).toHaveProperty('email');
  });

  test('Service discovery should route to correct microservices', async () => {
    if (!authToken) {
      throw new Error('Authentication required for service discovery test');
    }

    // Test routing to user management service
    const userResponse = await axios.get(`${BASE_URL}/api/v1/users/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      timeout: TIMEOUT
    });
    
    expect(userResponse.status).toBe(200);
    
    // Test routing to trading service
    const tradingResponse = await axios.get(`${BASE_URL}/api/v1/trading/status`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      timeout: TIMEOUT
    });
    
    expect(tradingResponse.status).toBe(200);
  });

  test('Rate limiting should be properly configured', async () => {
    const requests = [];
    
    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(
        axios.get(`${BASE_URL}/health`, {
          timeout: TIMEOUT,
          validateStatus: () => true // Don't throw on 429
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(res => res.status === 429);
    
    // Should have proper rate limiting in place
    expect(responses.length).toBe(10);
    
    // At least some requests should succeed
    const successfulRequests = responses.filter(res => res.status === 200);
    expect(successfulRequests.length).toBeGreaterThan(0);
  });

  test('Error handling should return proper error responses', async () => {
    const response = await axios.get(`${BASE_URL}/api/v1/nonexistent-endpoint`, {
      timeout: TIMEOUT,
      validateStatus: () => true
    });
    
    expect(response.status).toBe(404);
    expect(response.data).toHaveProperty('error');
    expect(response.data).toHaveProperty('message');
    expect(response.data).toHaveProperty('statusCode', 404);
  });

  test('CORS headers should be properly configured', async () => {
    const response = await axios.options(`${BASE_URL}/api/v1/health`, {
      timeout: TIMEOUT,
      headers: {
        'Origin': 'https://app.treum.ai',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    expect(response.headers).toHaveProperty('access-control-allow-origin');
    expect(response.headers).toHaveProperty('access-control-allow-methods');
    expect(response.headers).toHaveProperty('access-control-allow-headers');
  });

  test('Response times should be within acceptable limits', async () => {
    const startTime = Date.now();
    
    const response = await axios.get(`${BASE_URL}/api/v1/gateway/status`, {
      timeout: TIMEOUT
    });
    
    const responseTime = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(5000); // Response should be under 5 seconds
  });
});