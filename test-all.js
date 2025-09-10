#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const services = [
  'api-gateway',
  'user-management',
  'payment',
  'trading',
  'signals',
  'market-data',
  'risk-management',
  'education',
  'notification',
  'content-intelligence'
];

class TestRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.coverageData = {};
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    const separator = '='.repeat(60);
    this.log(`\n${separator}`, 'cyan');
    this.log(`${title}`, 'bright');
    this.log(`${separator}`, 'cyan');
  }

  async checkPrerequisites() {
    this.logSection('Checking Prerequisites');
    
    try {
      // Check if Docker is running
      execSync('docker info', { stdio: 'pipe' });
      this.log('✓ Docker is running', 'green');
    } catch (error) {
      this.log('✗ Docker is not running. Please start Docker first.', 'red');
      process.exit(1);
    }

    // Check if Node.js version is compatible
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      this.log(`✗ Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`, 'red');
      process.exit(1);
    }
    this.log(`✓ Node.js version ${nodeVersion} is compatible`, 'green');

    // Check if all service directories exist
    const missingServices = [];
    for (const service of services) {
      const servicePath = path.join(__dirname, 'services', service);
      if (!fs.existsSync(servicePath)) {
        missingServices.push(service);
      }
    }

    if (missingServices.length > 0) {
      this.log(`✗ Missing service directories: ${missingServices.join(', ')}`, 'red');
      process.exit(1);
    }
    this.log('✓ All service directories exist', 'green');
  }

  async startTestInfrastructure() {
    this.logSection('Starting Test Infrastructure');
    
    try {
      // Start test containers
      this.log('Starting test databases and services...', 'yellow');
      execSync('docker-compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
      
      // Wait for services to be ready
      this.log('Waiting for services to be ready...', 'yellow');
      await this.waitForServices();
      
      this.log('✓ Test infrastructure is ready', 'green');
    } catch (error) {
      this.log(`✗ Failed to start test infrastructure: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async waitForServices() {
    const services = [
      { name: 'postgres-test', port: 5433, timeout: 30000 },
      { name: 'redis-test', port: 6380, timeout: 10000 },
      { name: 'rabbitmq-test', port: 5673, timeout: 30000 },
      { name: 'mongodb-test', port: 27018, timeout: 20000 },
    ];

    for (const service of services) {
      await this.waitForService(service.name, service.port, service.timeout);
    }
  }

  async waitForService(serviceName, port, timeout) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const { execSync } = require('child_process');
        execSync(`docker exec ${serviceName.replace('-test', '-test')} echo "ready"`, { stdio: 'pipe' });
        this.log(`✓ ${serviceName} is ready`, 'green');
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`${serviceName} failed to start within ${timeout}ms`);
  }

  async installDependencies() {
    this.logSection('Installing Dependencies');
    
    // Install shared dependencies first
    this.log('Installing shared dependencies...', 'yellow');
    execSync('cd shared && npm install', { stdio: 'inherit' });
    
    // Install service dependencies in parallel
    const installPromises = services.map(service => {
      return new Promise((resolve, reject) => {
        const servicePath = path.join(__dirname, 'services', service);
        if (!fs.existsSync(path.join(servicePath, 'package.json'))) {
          resolve();
          return;
        }

        this.log(`Installing dependencies for ${service}...`, 'yellow');
        const child = spawn('npm', ['install'], { cwd: servicePath, stdio: 'pipe' });
        
        child.on('close', (code) => {
          if (code === 0) {
            this.log(`✓ ${service} dependencies installed`, 'green');
            resolve();
          } else {
            reject(new Error(`Failed to install dependencies for ${service}`));
          }
        });
      });
    });

    try {
      await Promise.all(installPromises);
      this.log('✓ All dependencies installed successfully', 'green');
    } catch (error) {
      this.log(`✗ Failed to install dependencies: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async runTestsForService(service) {
    const servicePath = path.join(__dirname, 'services', service);
    const packageJsonPath = path.join(servicePath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      this.results[service] = {
        status: 'skipped',
        reason: 'No package.json found',
        duration: 0,
        coverage: null,
      };
      return;
    }

    this.log(`Running tests for ${service}...`, 'yellow');
    const startTime = Date.now();

    try {
      // Run unit tests with coverage
      const result = execSync('npm run test:cov', {
        cwd: servicePath,
        stdio: 'pipe',
        encoding: 'utf8',
      });

      // Parse test results
      const testSummary = this.parseJestOutput(result);
      const duration = Date.now() - startTime;

      this.results[service] = {
        status: 'passed',
        duration,
        ...testSummary,
        output: result,
      };

      this.log(`✓ ${service} tests passed (${Math.round(duration / 1000)}s)`, 'green');
      
      // Update totals
      this.totalTests += testSummary.tests;
      this.passedTests += testSummary.passed;
      this.failedTests += testSummary.failed;
      this.skippedTests += testSummary.skipped;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results[service] = {
        status: 'failed',
        duration,
        error: error.message,
        output: error.stdout || error.stderr || '',
      };

      this.log(`✗ ${service} tests failed (${Math.round(duration / 1000)}s)`, 'red');
      
      // Show some error details
      const errorLines = (error.stdout || error.stderr || '').split('\n').slice(-10);
      errorLines.forEach(line => {
        if (line.trim()) {
          this.log(`  ${line}`, 'red');
        }
      });
    }
  }

  parseJestOutput(output) {
    // Parse Jest output to extract test results
    const lines = output.split('\n');
    let tests = 0, passed = 0, failed = 0, skipped = 0;
    let coverage = null;

    for (const line of lines) {
      // Parse test summary line
      if (line.includes('Tests:')) {
        const matches = line.match(/(\d+) passed|(\d+) failed|(\d+) skipped|(\d+) total/g);
        if (matches) {
          matches.forEach(match => {
            const [count, type] = match.split(' ');
            const num = parseInt(count);
            switch (type) {
              case 'total': tests = num; break;
              case 'passed': passed = num; break;
              case 'failed': failed = num; break;
              case 'skipped': skipped = num; break;
            }
          });
        }
      }

      // Parse coverage summary
      if (line.includes('All files') && line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 5) {
          coverage = {
            statements: parseFloat(parts[1]),
            branches: parseFloat(parts[2]),
            functions: parseFloat(parts[3]),
            lines: parseFloat(parts[4]),
          };
        }
      }
    }

    return { tests, passed, failed, skipped, coverage };
  }

  async runE2ETests() {
    this.logSection('Running End-to-End Tests');
    
    const e2eServices = ['user-management', 'payment', 'trading'];
    
    for (const service of e2eServices) {
      try {
        this.log(`Running E2E tests for ${service}...`, 'yellow');
        const servicePath = path.join(__dirname, 'services', service);
        
        execSync('npm run test:e2e', {
          cwd: servicePath,
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'test',
            DATABASE_URL: 'postgresql://test_user:test_password@localhost:5433/test_' + service.replace('-', '_'),
            REDIS_URL: 'redis://localhost:6380',
          }
        });
        
        this.log(`✓ ${service} E2E tests passed`, 'green');
      } catch (error) {
        this.log(`✗ ${service} E2E tests failed`, 'red');
      }
    }
  }

  async generateCoverageReport() {
    this.logSection('Generating Coverage Report');
    
    try {
      // Merge coverage reports from all services
      const coverageDir = path.join(__dirname, 'coverage');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir);
      }

      // Create merged coverage report
      this.log('Merging coverage reports...', 'yellow');
      
      const totalCoverage = this.calculateTotalCoverage();
      
      // Write coverage summary
      const summaryPath = path.join(coverageDir, 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(totalCoverage, null, 2));
      
      this.log(`✓ Coverage report generated at ${coverageDir}`, 'green');
      this.log(`Overall Coverage: ${totalCoverage.statements}% statements, ${totalCoverage.branches}% branches`, 'cyan');
      
    } catch (error) {
      this.log(`✗ Failed to generate coverage report: ${error.message}`, 'red');
    }
  }

  calculateTotalCoverage() {
    let totalStatements = 0, totalBranches = 0, totalFunctions = 0, totalLines = 0;
    let serviceCount = 0;

    Object.values(this.results).forEach(result => {
      if (result.coverage) {
        totalStatements += result.coverage.statements;
        totalBranches += result.coverage.branches;
        totalFunctions += result.coverage.functions;
        totalLines += result.coverage.lines;
        serviceCount++;
      }
    });

    return serviceCount > 0 ? {
      statements: Math.round(totalStatements / serviceCount * 100) / 100,
      branches: Math.round(totalBranches / serviceCount * 100) / 100,
      functions: Math.round(totalFunctions / serviceCount * 100) / 100,
      lines: Math.round(totalLines / serviceCount * 100) / 100,
    } : { statements: 0, branches: 0, functions: 0, lines: 0 };
  }

  async cleanup() {
    this.logSection('Cleaning Up');
    
    try {
      this.log('Stopping test containers...', 'yellow');
      execSync('docker-compose -f docker-compose.test.yml down', { stdio: 'inherit' });
      this.log('✓ Test infrastructure cleaned up', 'green');
    } catch (error) {
      this.log(`✗ Failed to clean up: ${error.message}`, 'red');
    }
  }

  printSummary() {
    const duration = Date.now() - this.startTime;
    
    this.logSection('Test Summary');
    
    this.log(`Total Duration: ${Math.round(duration / 1000)}s`, 'cyan');
    this.log(`Total Tests: ${this.totalTests}`, 'cyan');
    this.log(`Passed: ${this.passedTests}`, 'green');
    this.log(`Failed: ${this.failedTests}`, this.failedTests > 0 ? 'red' : 'cyan');
    this.log(`Skipped: ${this.skippedTests}`, this.skippedTests > 0 ? 'yellow' : 'cyan');
    
    // Service breakdown
    this.log('\nService Results:', 'bright');
    Object.entries(this.results).forEach(([service, result]) => {
      const statusColor = result.status === 'passed' ? 'green' : 
                         result.status === 'failed' ? 'red' : 'yellow';
      const durationStr = result.duration ? ` (${Math.round(result.duration / 1000)}s)` : '';
      this.log(`  ${service}: ${result.status}${durationStr}`, statusColor);
      
      if (result.coverage) {
        this.log(`    Coverage: ${result.coverage.statements}% statements`, 'cyan');
      }
    });

    // Exit with error code if any tests failed
    if (this.failedTests > 0) {
      this.log('\n❌ Some tests failed', 'red');
      process.exit(1);
    } else {
      this.log('\n✅ All tests passed!', 'green');
      process.exit(0);
    }
  }

  async run() {
    try {
      await this.checkPrerequisites();
      await this.startTestInfrastructure();
      await this.installDependencies();
      
      // Run tests for each service
      for (const service of services) {
        await this.runTestsForService(service);
      }
      
      await this.runE2ETests();
      await this.generateCoverageReport();
      
    } catch (error) {
      this.log(`\n❌ Test run failed: ${error.message}`, 'red');
      process.exit(1);
    } finally {
      await this.cleanup();
      this.printSummary();
    }
  }
}

// Run tests if script is called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(console.error);
}

module.exports = TestRunner;