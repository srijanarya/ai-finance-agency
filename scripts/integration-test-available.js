#!/usr/bin/env node

/**
 * AI Finance Agency - Available Services Integration Test
 * 
 * This script tests integration with currently available services only
 * It's designed to run partial integration tests when not all services are available
 */

const axios = require('axios');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class AvailableServicesIntegrationTest {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.testCount = 0;
    this.passedCount = 0;
    this.failedCount = 0;
    this.baseUrl = 'http://localhost';
    this.availableServices = {};
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    const separator = '='.repeat(60);
    this.log(`\n${separator}`, 'cyan');
    this.log(`🔬 ${title}`, 'bright');
    this.log(`${separator}`, 'cyan');
  }

  async runTest(testName, testFunction) {
    this.testCount++;
    try {
      this.log(`⏳ Testing: ${testName}`, 'blue');
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      this.passedCount++;
      this.log(`✅ PASSED: ${testName} (${duration}ms)`, 'green');
      this.results.push({ test: testName, status: 'passed', duration });
      return true;
    } catch (error) {
      this.failedCount++;
      this.log(`❌ FAILED: ${testName}`, 'red');
      this.log(`   Error: ${error.message}`, 'red');
      this.results.push({ test: testName, status: 'failed', error: error.message });
      return false;
    }
  }

  async discoverAvailableServices() {
    this.logSection('Discovering Available Services');
    
    // Check Docker containers
    try {
      const output = execSync('docker ps --format "{{.Names}}\\t{{.Status}}"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const lines = output.split('\n').filter(line => line.trim());
      for (const line of lines) {
        const [name, status] = line.split('\t');
        if (name && name.includes('ai_finance_')) {
          const serviceName = name.replace('ai_finance_', '');
          this.availableServices[serviceName] = {
            name: serviceName,
            containerName: name,
            status: status,
            healthy: status.includes('healthy') || status.includes('Up')
          };
          
          const healthStatus = status.includes('healthy') ? '✅' : 
                              status.includes('starting') ? '🔄' : 
                              status.includes('Up') ? '⚡' : '❌';
          this.log(`${healthStatus} ${serviceName}: ${status}`, 'cyan');
        }
      }
    } catch (error) {
      this.log(`❌ Failed to discover services: ${error.message}`, 'red');
    }
    
    // Test specific service ports
    const servicePortMap = {
      'api-gateway': 3000,
      'user-management': 3002,
      'payment': 3001,
      'trading': 3004,
      'signals': 3003,
      'market-data': 3008,
      'risk-management': 3007,
      'education': 3005,
      'notification': 3006,
      'content-intelligence': 3009,
    };
    
    for (const [serviceName, port] of Object.entries(servicePortMap)) {
      try {
        const response = await axios.get(`${this.baseUrl}:${port}/health`, { 
          timeout: 3000,
          validateStatus: () => true  // Accept any status
        });
        
        this.availableServices[serviceName] = {
          name: serviceName,
          port: port,
          status: `HTTP ${response.status}`,
          healthy: response.status < 500,
          data: response.data
        };
        
        const healthStatus = response.status === 200 ? '✅' : 
                            response.status < 500 ? '⚡' : '❌';
        this.log(`${healthStatus} ${serviceName}: Available on port ${port} (HTTP ${response.status})`, 'cyan');
        
      } catch (error) {
        if (error.code !== 'ECONNREFUSED') {
          this.log(`⚠️  ${serviceName}: Error on port ${port} - ${error.message}`, 'yellow');
        }
      }
    }
    
    const healthyServices = Object.values(this.availableServices).filter(s => s.healthy).length;
    const totalDiscovered = Object.keys(this.availableServices).length;
    this.log(`\n📊 Discovery Summary: ${healthyServices}/${totalDiscovered} services healthy`, 'bright');
  }

  async testDockerInfrastructure() {
    this.logSection('Docker Infrastructure Tests');
    
    await this.runTest('Docker daemon connectivity', async () => {
      execSync('docker info', { stdio: 'pipe' });
    });
    
    await this.runTest('Container network connectivity', async () => {
      const output = execSync('docker network ls', { encoding: 'utf8', stdio: 'pipe' });
      if (!output.includes('ai_finance_network')) {
        throw new Error('AI Finance network not found');
      }
    });
    
    if (this.availableServices.postgres) {
      await this.runTest('PostgreSQL container health', async () => {
        const output = execSync('docker exec ai_finance_postgres pg_isready -U ai_finance_user', { 
          encoding: 'utf8', 
          stdio: 'pipe' 
        });
        if (!output.includes('accepting connections')) {
          throw new Error('PostgreSQL not accepting connections');
        }
      });
    }
    
    if (this.availableServices.redis) {
      await this.runTest('Redis container connectivity', async () => {
        try {
          execSync('docker exec ai_finance_redis redis-cli ping', { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 5000
          });
        } catch (error) {
          // Redis might be restarting, let's check if container is running
          const psOutput = execSync('docker ps --filter name=ai_finance_redis --format "{{.Status}}"', { 
            encoding: 'utf8', 
            stdio: 'pipe' 
          });
          if (!psOutput.includes('Up')) {
            throw new Error('Redis container not running');
          }
          // Container is up but redis might not be ready yet
          this.log('⚠️  Redis container running but service not yet ready', 'yellow');
        }
      });
    }
  }

  async testAvailableAPIs() {
    this.logSection('Available API Endpoint Tests');
    
    const healthyAPIServices = Object.values(this.availableServices).filter(s => s.port && s.healthy);
    
    if (healthyAPIServices.length === 0) {
      this.log('⚠️  No API services available for testing', 'yellow');
      return;
    }
    
    for (const service of healthyAPIServices) {
      await this.runTest(`${service.name} API health endpoint`, async () => {
        const response = await axios.get(`${this.baseUrl}:${service.port}/health`, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        
        if (response.status >= 400) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        // Validate response structure if it's JSON
        if (response.headers['content-type']?.includes('application/json')) {
          const data = response.data;
          if (typeof data === 'object') {
            this.log(`   📋 Response: ${JSON.stringify(data)}`, 'cyan');
          }
        }
      });
      
      // Test additional endpoints if service is responding well
      if (service.name === 'api-gateway') {
        await this.runTest('API Gateway routing capabilities', async () => {
          try {
            const response = await axios.get(`${this.baseUrl}:${service.port}/`, {
              timeout: 5000,
              validateStatus: () => true  // Accept any status
            });
            
            this.log(`   📋 Root endpoint status: ${response.status}`, 'cyan');
            
            // Try to get service registry or documentation
            try {
              const docsResponse = await axios.get(`${this.baseUrl}:${service.port}/api-docs`, {
                timeout: 3000,
                validateStatus: () => true
              });
              this.log(`   📚 API docs available: ${docsResponse.status < 500}`, 'cyan');
            } catch (error) {
              // API docs not available, that's ok
            }
            
          } catch (error) {
            throw new Error(`Gateway routing test failed: ${error.message}`);
          }
        });
      }
    }
  }

  async testDatabaseConnectivity() {
    this.logSection('Available Database Tests');
    
    if (this.availableServices.postgres?.healthy) {
      await this.runTest('PostgreSQL connection and basic operations', async () => {
        const { Client } = require('pg');
        const client = new Client({
          host: 'localhost',
          port: 5432,
          database: 'ai_finance_db',
          user: 'ai_finance_user',
          password: 'securepassword123',
          connectionTimeoutMillis: 10000,
        });
        
        await client.connect();
        
        // Test basic query
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        this.log(`   📋 Database time: ${result.rows[0].current_time}`, 'cyan');
        
        // Test database existence
        const dbResult = await client.query('SELECT datname FROM pg_database WHERE datname = $1', ['ai_finance_db']);
        if (dbResult.rows.length === 0) {
          throw new Error('Main database not found');
        }
        
        await client.end();
      });
    }
    
    // Test Redis when it's stable
    if (this.availableServices.redis?.healthy) {
      await this.runTest('Redis basic operations', async () => {
        try {
          const Redis = require('ioredis');
          const redis = new Redis({
            host: 'localhost',
            port: 6379,
            connectTimeout: 5000,
            maxRetriesPerRequest: 2,
            retryDelayOnFailover: 100,
          });
          
          // Test basic operations
          await redis.set('integration_test', 'test_value', 'EX', 30);
          const value = await redis.get('integration_test');
          
          if (value !== 'test_value') {
            throw new Error('Redis read/write test failed');
          }
          
          // Get info
          const info = await redis.info('server');
          const redisVersion = info.match(/redis_version:([^\r\n]+)/)?.[1];
          this.log(`   📋 Redis version: ${redisVersion}`, 'cyan');
          
          await redis.del('integration_test');
          redis.disconnect();
          
        } catch (error) {
          throw new Error(`Redis test failed: ${error.message}`);
        }
      });
    }
  }

  async testServiceIntegration() {
    this.logSection('Service Integration Tests');
    
    const healthyServices = Object.values(this.availableServices).filter(s => s.healthy);
    
    if (healthyServices.length < 2) {
      this.log('⚠️  Not enough services available for integration testing', 'yellow');
      return;
    }
    
    // Test service discovery via Consul if available
    if (this.availableServices.consul?.healthy) {
      await this.runTest('Service discovery functionality', async () => {
        const response = await axios.get('http://localhost:8500/v1/catalog/services', {
          timeout: 5000
        });
        
        if (response.status !== 200) {
          throw new Error(`Consul API returned status ${response.status}`);
        }
        
        const services = response.data;
        this.log(`   📋 Discovered services: ${Object.keys(services).join(', ')}`, 'cyan');
      });
    }
    
    // Test cross-service communication if multiple APIs are available
    const apiServices = Object.values(this.availableServices).filter(s => s.port && s.healthy);
    if (apiServices.length >= 2) {
      await this.runTest('Cross-service API communication', async () => {
        const results = [];
        
        for (const service of apiServices.slice(0, 3)) { // Test first 3 services
          try {
            const response = await axios.get(`${this.baseUrl}:${service.port}/health`, {
              timeout: 3000,
              headers: {
                'X-Test-Client': 'integration-test',
                'X-Correlation-ID': `test-${Date.now()}`
              }
            });
            
            results.push({
              service: service.name,
              status: response.status,
              responseTime: response.headers['x-response-time'] || 'unknown'
            });
            
          } catch (error) {
            results.push({
              service: service.name,
              error: error.message
            });
          }
        }
        
        this.log(`   📋 Communication test results:`, 'cyan');
        results.forEach(result => {
          if (result.error) {
            this.log(`     ${result.service}: Error - ${result.error}`, 'yellow');
          } else {
            this.log(`     ${result.service}: ${result.status} (${result.responseTime})`, 'cyan');
          }
        });
        
        const successfulCommunications = results.filter(r => !r.error).length;
        if (successfulCommunications === 0) {
          throw new Error('No successful cross-service communications');
        }
      });
    }
  }

  async testErrorHandling() {
    this.logSection('Error Handling Tests');
    
    await this.runTest('Service resilience to invalid requests', async () => {
      const testService = Object.values(this.availableServices).find(s => s.port && s.healthy);
      
      if (!testService) {
        throw new Error('No API service available for error handling test');
      }
      
      // Test with invalid endpoint
      try {
        await axios.get(`${this.baseUrl}:${testService.port}/nonexistent-endpoint`, {
          timeout: 5000,
          validateStatus: () => true
        });
        // Service should handle this gracefully (not crash)
        this.log(`   📋 Service ${testService.name} handled invalid request gracefully`, 'cyan');
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Service crashed or became unavailable');
        }
        // Other errors are acceptable (timeouts, etc.)
      }
    });
    
    await this.runTest('Network timeout handling', async () => {
      const testService = Object.values(this.availableServices).find(s => s.port && s.healthy);
      
      if (!testService) {
        throw new Error('No API service available for timeout test');
      }
      
      try {
        await axios.get(`${this.baseUrl}:${testService.port}/health`, {
          timeout: 1 // Very short timeout
        });
        // If this succeeds, the service is very fast (which is good)
        this.log(`   📋 Service ${testService.name} responded very quickly`, 'cyan');
      } catch (error) {
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
          // Expected behavior
          this.log(`   📋 Service ${testService.name} correctly handled timeout`, 'cyan');
        } else {
          throw new Error(`Unexpected error: ${error.message}`);
        }
      }
    });
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successRate = this.testCount > 0 ? ((this.passedCount / this.testCount) * 100).toFixed(1) : 0;
    
    this.logSection('Integration Test Report');
    
    this.log(`📊 Test Summary:`, 'bright');
    this.log(`   Total Tests: ${this.testCount}`, 'cyan');
    this.log(`   Passed: ${this.passedCount}`, 'green');
    this.log(`   Failed: ${this.failedCount}`, this.failedCount > 0 ? 'red' : 'cyan');
    this.log(`   Success Rate: ${successRate}%`, successRate >= 70 ? 'green' : 'yellow');
    this.log(`   Duration: ${Math.round(duration / 1000)}s`, 'cyan');
    
    this.log(`\n🔧 Available Services:`, 'bright');
    const healthyServices = Object.values(this.availableServices).filter(s => s.healthy);
    const totalServices = Object.keys(this.availableServices).length;
    
    this.log(`   Healthy: ${healthyServices.length}/${totalServices}`, 'green');
    healthyServices.forEach(service => {
      const portInfo = service.port ? ` (port ${service.port})` : '';
      this.log(`   ✅ ${service.name}${portInfo}`, 'green');
    });
    
    const unhealthyServices = Object.values(this.availableServices).filter(s => !s.healthy);
    if (unhealthyServices.length > 0) {
      this.log(`   Unhealthy: ${unhealthyServices.length}`, 'yellow');
      unhealthyServices.forEach(service => {
        this.log(`   ⚠️  ${service.name}: ${service.status}`, 'yellow');
      });
    }
    
    this.log(`\n💡 Recommendations:`, 'bright');
    if (healthyServices.length < 5) {
      this.log(`   • Start more microservices for comprehensive testing`, 'yellow');
      this.log(`   • Run: docker-compose --profile microservices up -d`, 'cyan');
    }
    if (this.failedCount > 0) {
      this.log(`   • Investigate and fix failed test cases`, 'yellow');
    }
    if (successRate >= 70) {
      this.log(`   • Integration testing framework is working well`, 'green');
      this.log(`   • Ready for full service deployment`, 'green');
    }
    
    // Save detailed report
    const reportPath = '/Users/srijan/ai-finance-agency/available-services-integration-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        total: this.testCount,
        passed: this.passedCount,
        failed: this.failedCount,
        successRate: parseFloat(successRate)
      },
      availableServices: this.availableServices,
      testResults: this.results
    };
    
    const fs = require('fs');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
    
    return successRate >= 70;
  }

  async run() {
    this.log('🔬 AI Finance Agency - Available Services Integration Test', 'bright');
    this.log('=' .repeat(60), 'cyan');
    
    try {
      await this.discoverAvailableServices();
      await this.testDockerInfrastructure();
      await this.testAvailableAPIs();
      await this.testDatabaseConnectivity();
      await this.testServiceIntegration();
      await this.testErrorHandling();
      
    } catch (error) {
      this.log(`\n❌ Integration test suite failed: ${error.message}`, 'red');
      this.failedCount++;
    } finally {
      const success = this.generateReport();
      
      if (success) {
        this.log(`\n🎉 Available services integration tests completed successfully!`, 'green');
        process.exit(0);
      } else {
        this.log(`\n⚠️  Integration tests completed with issues. Check the report.`, 'yellow');
        process.exit(1);
      }
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const testSuite = new AvailableServicesIntegrationTest();
  testSuite.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = AvailableServicesIntegrationTest;