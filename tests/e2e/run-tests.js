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

class E2ETestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
    };
    this.testSuites = [
      {
        name: 'Infrastructure Health Checks',
        file: 'tests/01-infrastructure.test.ts',
        critical: true,
      },
      {
        name: 'Complete User Journey',
        file: 'tests/02-user-journey-complete.test.ts',
        critical: true,
      },
      {
        name: 'WebSocket Integration',
        file: 'tests/03-websocket-integration.test.ts',
        critical: false,
      },
      {
        name: 'Payment Flow Integration',
        file: 'tests/04-payment-flow-integration.test.ts',
        critical: true,
      },
      {
        name: 'Market Data Streaming',
        file: 'tests/05-market-data-streaming.test.ts',
        critical: false,
      },
      {
        name: 'Trading Integration',
        file: 'tests/06-trading-integration.test.ts',
        critical: true,
      },
      {
        name: 'Cross-Service Integration',
        file: 'tests/07-service-integration.test.ts',
        critical: true,
      },
    ];
    this.options = this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);
    const options = {
      suite: null,
      coverage: false,
      verbose: false,
      parallel: false,
      skipSetup: false,
      onlyCritical: false,
      bail: false,
      timeout: 120000,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--suite':
        case '-s':
          options.suite = args[++i];
          break;
        case '--coverage':
        case '-c':
          options.coverage = true;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--parallel':
        case '-p':
          options.parallel = true;
          break;
        case '--skip-setup':
          options.skipSetup = true;
          break;
        case '--critical-only':
          options.onlyCritical = true;
          break;
        case '--bail':
        case '-b':
          options.bail = true;
          break;
        case '--timeout':
        case '-t':
          options.timeout = parseInt(args[++i]);
          break;
        case '--help':
        case '-h':
          this.showHelp();
          process.exit(0);
          break;
      }
    }

    return options;
  }

  showHelp() {
    console.log(`
${colors.bright}AI Finance Agency E2E Test Runner${colors.reset}

Usage: node run-tests.js [options]

Options:
  -s, --suite <name>     Run specific test suite
  -c, --coverage         Generate coverage report
  -v, --verbose          Verbose output
  -p, --parallel         Run tests in parallel
  --skip-setup           Skip environment setup
  --critical-only        Run only critical tests
  -b, --bail             Stop on first failure
  -t, --timeout <ms>     Test timeout in milliseconds
  -h, --help             Show this help

Test Suites:
  infrastructure         Infrastructure health checks
  user-journey           Complete user journey
  websocket              WebSocket integration
  payment                Payment flow integration
  market-data            Market data streaming
  trading                Trading integration
  service-integration    Cross-service integration

Examples:
  node run-tests.js                           # Run all tests
  node run-tests.js --suite user-journey      # Run specific suite
  node run-tests.js --coverage --verbose      # Run with coverage
  node run-tests.js --critical-only --bail    # Run critical tests only
    `);
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

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      this.log(`✗ Node.js version ${nodeVersion} is not supported. Please use Node.js 18+.`, 'red');
      process.exit(1);
    }
    this.log(`✓ Node.js version ${nodeVersion} is compatible`, 'green');

    // Check if services are running
    try {
      const { waitForAllServices } = require('./utils/wait-for-services');
      await waitForAllServices();
      this.log('✓ All services are running', 'green');
    } catch (error) {
      this.log('✗ Some services are not running. Please start services first.', 'red');
      process.exit(1);
    }
  }

  async setupEnvironment() {
    if (this.options.skipSetup) {
      this.log('⏩ Skipping environment setup', 'yellow');
      return;
    }

    this.logSection('Setting Up Test Environment');

    try {
      // Install dependencies if needed
      if (!fs.existsSync('./node_modules')) {
        this.log('📦 Installing dependencies...', 'yellow');
        execSync('npm install', { stdio: 'inherit' });
      }

      // Run global setup
      this.log('🔧 Running global setup...', 'yellow');
      execSync('node setup/setup.js', { stdio: 'inherit' });

      this.log('✓ Test environment ready', 'green');
    } catch (error) {
      this.log(`✗ Failed to setup test environment: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async runTestSuite(testSuite) {
    this.log(`\n🧪 Running: ${testSuite.name}`, 'cyan');
    
    const startTime = Date.now();
    
    try {
      const jestArgs = [
        testSuite.file,
        '--testTimeout', this.options.timeout.toString(),
        '--detectOpenHandles',
        '--forceExit',
      ];

      if (this.options.coverage) {
        jestArgs.push('--coverage');
      }

      if (this.options.verbose) {
        jestArgs.push('--verbose');
      }

      const result = execSync(`npx jest ${jestArgs.join(' ')}`, {
        stdio: 'pipe',
        encoding: 'utf8',
      });

      const duration = Date.now() - startTime;
      const testResult = this.parseJestOutput(result);

      this.log(`✅ ${testSuite.name} completed (${Math.round(duration / 1000)}s)`, 'green');
      this.log(`   Tests: ${testResult.total}, Passed: ${testResult.passed}, Failed: ${testResult.failed}`, 'cyan');

      this.results.total += testResult.total;
      this.results.passed += testResult.passed;
      this.results.failed += testResult.failed;
      this.results.skipped += testResult.skipped;

      return { success: true, ...testResult, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      const output = error.stdout || error.stderr || '';
      const testResult = this.parseJestOutput(output);

      this.log(`❌ ${testSuite.name} failed (${Math.round(duration / 1000)}s)`, 'red');

      if (this.options.verbose) {
        const errorLines = output.split('\n').slice(-10);
        errorLines.forEach(line => {
          if (line.trim()) {
            this.log(`  ${line}`, 'red');
          }
        });
      }

      this.results.total += testResult.total;
      this.results.passed += testResult.passed;
      this.results.failed += testResult.failed;
      this.results.skipped += testResult.skipped;

      return { success: false, ...testResult, duration, error: error.message };
    }
  }

  parseJestOutput(output) {
    const lines = output.split('\n');
    let total = 0, passed = 0, failed = 0, skipped = 0;

    for (const line of lines) {
      if (line.includes('Tests:')) {
        const matches = line.match(/(\d+) passed|(\d+) failed|(\d+) skipped|(\d+) total/g);
        if (matches) {
          matches.forEach(match => {
            const [count, type] = match.split(' ');
            const num = parseInt(count);
            switch (type) {
              case 'total': total = num; break;
              case 'passed': passed = num; break;
              case 'failed': failed = num; break;
              case 'skipped': skipped = num; break;
            }
          });
        }
      }
    }

    return { total, passed, failed, skipped };
  }

  async runTests() {
    const startTime = Date.now();
    let testSuites = this.testSuites;

    // Filter test suites based on options
    if (this.options.suite) {
      testSuites = testSuites.filter(suite => 
        suite.file.includes(this.options.suite) ||
        suite.name.toLowerCase().includes(this.options.suite.toLowerCase())
      );
    }

    if (this.options.onlyCritical) {
      testSuites = testSuites.filter(suite => suite.critical);
    }

    if (testSuites.length === 0) {
      this.log('❌ No test suites found matching criteria', 'red');
      process.exit(1);
    }

    this.log(`🚀 Running ${testSuites.length} test suite(s)`, 'bright');

    const results = [];

    if (this.options.parallel) {
      // Run tests in parallel
      const promises = testSuites.map(suite => this.runTestSuite(suite));
      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason,
            testSuite: testSuites[index].name,
          });
        }
      });
    } else {
      // Run tests sequentially
      for (const testSuite of testSuites) {
        const result = await this.runTestSuite(testSuite);
        results.push(result);

        if (!result.success && this.options.bail) {
          this.log('🛑 Stopping execution due to failure (--bail option)', 'yellow');
          break;
        }
      }
    }

    this.results.duration = Date.now() - startTime;
    this.printSummary(results);

    return this.results.failed === 0;
  }

  printSummary(results) {
    this.logSection('Test Results Summary');

    this.log(`Total Duration: ${Math.round(this.results.duration / 1000)}s`, 'cyan');
    this.log(`Total Tests: ${this.results.total}`, 'cyan');
    this.log(`Passed: ${this.results.passed}`, 'green');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'cyan');
    this.log(`Skipped: ${this.results.skipped}`, this.results.skipped > 0 ? 'yellow' : 'cyan');

    // Test suite breakdown
    this.log('\nTest Suite Results:', 'bright');
    results.forEach((result, index) => {
      const suite = this.testSuites[index];
      if (suite) {
        const statusColor = result.success ? 'green' : 'red';
        const durationStr = result.duration ? ` (${Math.round(result.duration / 1000)}s)` : '';
        this.log(`  ${suite.name}: ${result.success ? 'PASSED' : 'FAILED'}${durationStr}`, statusColor);
      }
    });

    // Coverage information
    if (this.options.coverage) {
      this.log('\n📊 Coverage report generated:', 'cyan');
      this.log('  HTML: coverage/lcov-report/index.html', 'cyan');
      this.log('  JSON: coverage/coverage-final.json', 'cyan');
    }

    // Final status
    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed!', 'green');
    } else {
      this.log(`\n❌ ${this.results.failed} test(s) failed`, 'red');
    }
  }

  async cleanup() {
    try {
      this.log('🧹 Cleaning up test environment...', 'yellow');
      execSync('node setup/teardown.js', { stdio: 'inherit' });
      this.log('✓ Cleanup completed', 'green');
    } catch (error) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, 'yellow');
    }
  }

  async run() {
    try {
      await this.checkPrerequisites();
      await this.setupEnvironment();
      
      const success = await this.runTests();
      
      await this.cleanup();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.log(`\n💥 Test run failed: ${error.message}`, 'red');
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.run().catch(console.error);
}

module.exports = E2ETestRunner;