#!/usr/bin/env node

/**
 * AI Finance Agency - Service Status Checker
 * 
 * Quick health check for all microservices and infrastructure
 * This script runs before integration tests to verify service availability
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

// Service configuration
const services = {
  'api-gateway': { port: 3000, healthPath: '/health' },
  'user-management': { port: 3002, healthPath: '/health' },
  'payment': { port: 3001, healthPath: '/health' },
  'trading': { port: 3004, healthPath: '/health' },
  'signals': { port: 3003, healthPath: '/health' },
  'market-data': { port: 3008, healthPath: '/health' },
  'risk-management': { port: 3007, healthPath: '/health' },
  'education': { port: 3005, healthPath: '/health' },
  'notification': { port: 3006, healthPath: '/health' },
  'content-intelligence': { port: 3009, healthPath: '/health' },
};

// Infrastructure services
const infrastructure = {
  postgres: { port: 5432, name: 'PostgreSQL' },
  redis: { port: 6379, name: 'Redis' },
  rabbitmq: { port: 5672, name: 'RabbitMQ', managementPort: 15672 },
  mongodb: { port: 27017, name: 'MongoDB' },
};

class ServiceStatusChecker {
  constructor() {
    this.baseUrl = 'http://localhost';
    this.results = {
      infrastructure: {},
      microservices: {},
      summary: {
        total: 0,
        running: 0,
        stopped: 0,
        error: 0
      }
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    const separator = '='.repeat(60);
    this.log(`\n${separator}`, 'cyan');
    this.log(`🔍 ${title}`, 'bright');
    this.log(`${separator}`, 'cyan');
  }

  async checkDockerContainers() {
    this.logSection('Docker Container Status');
    
    try {
      const output = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const lines = output.split('\n').filter(line => line.trim());
      if (lines.length > 1) {
        this.log('Running containers:', 'green');
        lines.forEach(line => {
          if (line.includes('NAMES')) {
            this.log(line, 'cyan');
          } else if (line.trim()) {
            this.log(`  ${line}`, 'green');
          }
        });
      } else {
        this.log('❌ No containers are running', 'red');
      }
    } catch (error) {
      this.log(`❌ Failed to check Docker containers: ${error.message}`, 'red');
    }
  }

  async checkInfrastructure() {
    this.logSection('Infrastructure Services Status');
    
    for (const [service, config] of Object.entries(infrastructure)) {
      try {
        const containerName = `ai_finance_${service}`;
        const output = execSync(`docker ps --filter "name=${containerName}" --format "{{.Status}}"`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        if (output.trim()) {
          this.log(`✅ ${config.name}: Running (${output.trim()})`, 'green');
          this.results.infrastructure[service] = { status: 'running', details: output.trim() };
          this.results.summary.running++;
        } else {
          this.log(`❌ ${config.name}: Not running`, 'red');
          this.results.infrastructure[service] = { status: 'stopped' };
          this.results.summary.stopped++;
        }
        this.results.summary.total++;
      } catch (error) {
        this.log(`⚠️  ${config.name}: Error checking status`, 'yellow');
        this.results.infrastructure[service] = { status: 'error', error: error.message };
        this.results.summary.error++;
        this.results.summary.total++;
      }
    }
  }

  async checkMicroservices() {
    this.logSection('Microservices Status');
    
    for (const [serviceName, config] of Object.entries(services)) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${this.baseUrl}:${config.port}${config.healthPath}`, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200) {
          this.log(`✅ ${serviceName}: Healthy (${responseTime}ms)`, 'green');
          this.results.microservices[serviceName] = { 
            status: 'healthy', 
            responseTime,
            port: config.port,
            data: response.data 
          };
          this.results.summary.running++;
        } else {
          this.log(`⚠️  ${serviceName}: Responding but unhealthy (${response.status})`, 'yellow');
          this.results.microservices[serviceName] = { 
            status: 'unhealthy', 
            responseTime,
            port: config.port,
            httpStatus: response.status 
          };
          this.results.summary.error++;
        }
        this.results.summary.total++;
        
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          this.log(`❌ ${serviceName}: Not running (port ${config.port})`, 'red');
          this.results.microservices[serviceName] = { status: 'stopped', port: config.port };
          this.results.summary.stopped++;
        } else {
          this.log(`⚠️  ${serviceName}: Error (${error.message})`, 'yellow');
          this.results.microservices[serviceName] = { status: 'error', port: config.port, error: error.message };
          this.results.summary.error++;
        }
        this.results.summary.total++;
      }
    }
  }

  async checkDatabaseConnections() {
    this.logSection('Database Connection Tests');
    
    // Test PostgreSQL
    try {
      const { Client } = require('pg');
      const client = new Client({
        host: 'localhost',
        port: 5432,
        database: 'ai_finance_db',
        user: 'ai_finance_user',
        password: 'securepassword123',
        connectionTimeoutMillis: 5000,
      });
      
      await client.connect();
      await client.query('SELECT NOW()');
      await client.end();
      
      this.log('✅ PostgreSQL: Connection successful', 'green');
    } catch (error) {
      this.log(`❌ PostgreSQL: Connection failed (${error.message})`, 'red');
    }
    
    // Test Redis
    try {
      const Redis = require('ioredis');
      const redis = new Redis({
        host: 'localhost',
        port: 6379,
        connectTimeout: 5000,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 1,
      });
      
      await redis.ping();
      redis.disconnect();
      
      this.log('✅ Redis: Connection successful', 'green');
    } catch (error) {
      this.log(`❌ Redis: Connection failed (${error.message})`, 'red');
    }
    
    // Test MongoDB
    try {
      const { MongoClient } = require('mongodb');
      const client = new MongoClient('mongodb://admin:securepass123@localhost:27017/ai_finance?authSource=admin', {
        serverSelectionTimeoutMS: 5000,
      });
      
      await client.connect();
      await client.db().admin().ping();
      await client.close();
      
      this.log('✅ MongoDB: Connection successful', 'green');
    } catch (error) {
      this.log(`❌ MongoDB: Connection failed (${error.message})`, 'red');
    }
    
    // Test RabbitMQ
    try {
      const amqp = require('amqplib');
      const connection = await amqp.connect('amqp://ai_finance_admin:securerabbitpass@localhost:5672/ai_finance');
      await connection.close();
      
      this.log('✅ RabbitMQ: Connection successful', 'green');
    } catch (error) {
      this.log(`❌ RabbitMQ: Connection failed (${error.message})`, 'red');
    }
  }

  generateSummary() {
    this.logSection('Status Summary');
    
    const { total, running, stopped, error } = this.results.summary;
    const healthyPercentage = ((running / total) * 100).toFixed(1);
    
    this.log(`📊 Overall Status:`, 'bright');
    this.log(`   Total Services: ${total}`, 'cyan');
    this.log(`   Running: ${running}`, running > 0 ? 'green' : 'red');
    this.log(`   Stopped: ${stopped}`, stopped > 0 ? 'red' : 'cyan');
    this.log(`   Errors: ${error}`, error > 0 ? 'yellow' : 'cyan');
    this.log(`   Health: ${healthyPercentage}%`, healthyPercentage >= 80 ? 'green' : 'yellow');
    
    // Service readiness for integration testing
    this.log(`\n🔬 Integration Test Readiness:`, 'bright');
    if (running >= total * 0.8) {
      this.log(`✅ Ready for integration testing (${running}/${total} services healthy)`, 'green');
    } else {
      this.log(`❌ Not ready for integration testing (${running}/${total} services healthy)`, 'red');
      this.log(`   Minimum required: ${Math.ceil(total * 0.8)} services`, 'yellow');
    }
    
    // Quick start commands
    if (stopped > 0) {
      this.log(`\n🚀 Quick Start Commands:`, 'bright');
      this.log(`   Start infrastructure: docker-compose --profile infrastructure up -d`, 'cyan');
      this.log(`   Start microservices: docker-compose --profile microservices up -d`, 'cyan');
      this.log(`   Start everything: docker-compose --profile development --profile microservices --profile infrastructure up -d`, 'cyan');
    }
    
    return running >= total * 0.8;
  }

  async run() {
    this.log('🔍 AI Finance Agency - Service Status Check', 'bright');
    this.log('=' .repeat(60), 'cyan');
    
    try {
      await this.checkDockerContainers();
      await this.checkInfrastructure();
      await this.checkMicroservices();
      await this.checkDatabaseConnections();
      
      const isReady = this.generateSummary();
      
      // Save detailed report
      const reportPath = '/Users/srijan/ai-finance-agency/service-status-report.json';
      const report = {
        timestamp: new Date().toISOString(),
        results: this.results,
        integrationTestReady: isReady
      };
      
      const fs = require('fs');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
      
      return isReady;
      
    } catch (error) {
      this.log(`\n❌ Status check failed: ${error.message}`, 'red');
      return false;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const checker = new ServiceStatusChecker();
  checker.run().then(isReady => {
    process.exit(isReady ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ServiceStatusChecker;