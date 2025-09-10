#!/usr/bin/env node

/**
 * AI Finance Agency - Integration Test Summary
 * 
 * Provides a comprehensive overview of integration test results and platform status
 */

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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

class IntegrationSummary {
  constructor() {
    this.reportPath = '/Users/srijan/ai-finance-agency/available-services-integration-report.json';
    this.statusPath = '/Users/srijan/ai-finance-agency/service-status-report.json';
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title, icon = '📋') {
    const separator = '='.repeat(80);
    this.log(`\n${separator}`, 'cyan');
    this.log(`${icon} ${title}`, 'bright');
    this.log(`${separator}`, 'cyan');
  }

  getHealthIcon(status, percentage) {
    if (percentage >= 90) return '🟢';
    if (percentage >= 70) return '🟡';
    if (percentage >= 50) return '🟠';
    return '🔴';
  }

  generateSummary() {
    this.logSection('AI Finance Agency - Integration Test Summary', '🚀');
    
    // Load reports
    let integrationReport = null;
    let statusReport = null;
    
    try {
      if (fs.existsSync(this.reportPath)) {
        integrationReport = JSON.parse(fs.readFileSync(this.reportPath, 'utf8'));
      }
      if (fs.existsSync(this.statusPath)) {
        statusReport = JSON.parse(fs.readFileSync(this.statusPath, 'utf8'));
      }
    } catch (error) {
      this.log(`⚠️  Error loading reports: ${error.message}`, 'yellow');
    }

    // Platform Overview
    this.logSection('Platform Status Overview', '🏗️');
    
    if (integrationReport) {
      const { summary, availableServices } = integrationReport;
      const healthyServices = Object.values(availableServices).filter(s => s.healthy).length;
      const totalServices = Object.keys(availableServices).length;
      const healthPercentage = totalServices > 0 ? ((healthyServices / totalServices) * 100).toFixed(1) : 0;
      
      this.log(`${this.getHealthIcon('', healthPercentage)} **System Health**: ${healthPercentage}% (${healthyServices}/${totalServices} services)`, 'bright');
      this.log(`✅ **Integration Tests**: ${summary.successRate}% success rate (${summary.passed}/${summary.total})`, 'green');
      this.log(`⏱️  **Test Duration**: ${Math.round(summary.duration / 1000)}s`, 'cyan');
      this.log(`📅 **Last Test**: ${new Date(integrationReport.timestamp).toLocaleString()}`, 'cyan');
    } else {
      this.log(`⚠️  No integration test results available`, 'yellow');
      this.log(`   Run: npm run test:integration-available`, 'cyan');
    }

    // Service Status Breakdown
    this.logSection('Service Status Breakdown', '🔧');
    
    if (integrationReport && integrationReport.availableServices) {
      const services = integrationReport.availableServices;
      
      // Infrastructure Services
      this.log(`🏗️  **Infrastructure Services**:`, 'bright');
      const infraServices = ['postgres', 'redis', 'rabbitmq', 'mongodb', 'consul'];
      infraServices.forEach(service => {
        if (services[service]) {
          const status = services[service].healthy ? '✅' : '❌';
          const statusText = services[service].status || 'Unknown';
          this.log(`   ${status} ${service}: ${statusText}`, services[service].healthy ? 'green' : 'red');
        } else {
          this.log(`   ❓ ${service}: Not discovered`, 'yellow');
        }
      });
      
      // Microservices
      this.log(`\n🔬 **Microservices**:`, 'bright');
      const microservices = [
        'api-gateway', 'user-management', 'payment', 'trading', 
        'signals', 'market-data', 'risk-management', 'education',
        'notification', 'content-intelligence'
      ];
      
      let runningMicroservices = 0;
      microservices.forEach(service => {
        if (services[service]) {
          const status = services[service].healthy ? '✅' : '❌';
          const port = services[service].port ? ` (port ${services[service].port})` : '';
          const statusText = services[service].status || 'Unknown';
          this.log(`   ${status} ${service}${port}: ${statusText}`, services[service].healthy ? 'green' : 'red');
          if (services[service].healthy) runningMicroservices++;
        } else {
          this.log(`   ⏸️  ${service}: Not running`, 'yellow');
        }
      });
      
      const microserviceHealth = ((runningMicroservices / microservices.length) * 100).toFixed(1);
      this.log(`\n📊 **Microservice Health**: ${microserviceHealth}% (${runningMicroservices}/${microservices.length} running)`, 'bright');
    }

    // Test Results Summary
    if (integrationReport && integrationReport.testResults) {
      this.logSection('Test Results Summary', '🧪');
      
      const { testResults } = integrationReport;
      const passedTests = testResults.filter(t => t.status === 'passed');
      const failedTests = testResults.filter(t => t.status === 'failed');
      
      this.log(`✅ **Passed Tests** (${passedTests.length}):`, 'green');
      passedTests.forEach(test => {
        const duration = test.duration ? ` (${test.duration}ms)` : '';
        this.log(`   • ${test.test}${duration}`, 'green');
      });
      
      if (failedTests.length > 0) {
        this.log(`\n❌ **Failed Tests** (${failedTests.length}):`, 'red');
        failedTests.forEach(test => {
          this.log(`   • ${test.test}: ${test.error}`, 'red');
        });
      }
    }

    // Readiness Assessment
    this.logSection('Production Readiness Assessment', '🎯');
    
    const readinessChecks = [
      { name: 'Infrastructure Services', status: this.checkInfrastructureReadiness(integrationReport), weight: 30 },
      { name: 'API Gateway', status: this.checkAPIGatewayReadiness(integrationReport), weight: 20 },
      { name: 'Database Connectivity', status: this.checkDatabaseReadiness(integrationReport), weight: 20 },
      { name: 'Service Discovery', status: this.checkServiceDiscoveryReadiness(integrationReport), weight: 15 },
      { name: 'Error Handling', status: this.checkErrorHandlingReadiness(integrationReport), weight: 15 }
    ];
    
    let totalScore = 0;
    let maxScore = 0;
    
    readinessChecks.forEach(check => {
      const icon = check.status ? '✅' : '❌';
      const color = check.status ? 'green' : 'red';
      this.log(`   ${icon} ${check.name}`, color);
      
      if (check.status) totalScore += check.weight;
      maxScore += check.weight;
    });
    
    const readinessPercentage = ((totalScore / maxScore) * 100).toFixed(1);
    const readinessIcon = this.getHealthIcon('', readinessPercentage);
    
    this.log(`\n${readinessIcon} **Overall Readiness**: ${readinessPercentage}%`, 'bright');
    
    if (readinessPercentage >= 90) {
      this.log(`🎉 **Status**: Ready for production deployment!`, 'green');
    } else if (readinessPercentage >= 70) {
      this.log(`🚀 **Status**: Ready for staging deployment`, 'yellow');
    } else {
      this.log(`🚧 **Status**: Development environment only`, 'red');
    }

    // Recommendations
    this.logSection('Recommendations', '💡');
    
    const recommendations = this.generateRecommendations(integrationReport);
    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        this.log(`   ${rec.icon} ${rec.message}`, rec.color);
        if (rec.command) {
          this.log(`     Command: ${rec.command}`, 'cyan');
        }
      });
    } else {
      this.log(`   ✨ All systems are functioning optimally!`, 'green');
    }

    // Quick Actions
    this.logSection('Quick Actions', '⚡');
    
    this.log(`🔍 **Status Check**: npm run check:service-status`, 'cyan');
    this.log(`🧪 **Integration Test**: npm run test:integration-available`, 'cyan');
    this.log(`🚀 **Start Services**: docker-compose --profile microservices up -d`, 'cyan');
    this.log(`📊 **View Logs**: docker-compose logs -f`, 'cyan');
    this.log(`📋 **Full Report**: cat INTEGRATION_TEST_REPORT.md`, 'cyan');

    this.logSection('Integration Testing Complete', '🎊');
    this.log(`The AI Finance Agency platform integration testing framework is operational.`, 'green');
    this.log(`Current status: ${readinessPercentage}% ready for deployment.`, 'bright');
    
    return readinessPercentage >= 70;
  }

  checkInfrastructureReadiness(report) {
    if (!report?.availableServices) return false;
    const infraServices = ['postgres', 'consul'];
    return infraServices.every(service => report.availableServices[service]?.healthy);
  }

  checkAPIGatewayReadiness(report) {
    if (!report?.availableServices) return false;
    return report.availableServices['api-gateway']?.healthy || false;
  }

  checkDatabaseReadiness(report) {
    if (!report?.testResults) return false;
    return report.testResults.some(t => 
      t.test.includes('PostgreSQL') && t.status === 'passed'
    );
  }

  checkServiceDiscoveryReadiness(report) {
    if (!report?.testResults) return false;
    return report.testResults.some(t => 
      t.test.includes('Service discovery') && t.status === 'passed'
    );
  }

  checkErrorHandlingReadiness(report) {
    if (!report?.testResults) return false;
    return report.testResults.some(t => 
      t.test.includes('Error') && t.status === 'passed'
    );
  }

  generateRecommendations(report) {
    const recommendations = [];
    
    if (!report) {
      recommendations.push({
        icon: '🔄',
        message: 'Run integration tests to get current status',
        command: 'npm run test:integration-available',
        color: 'yellow'
      });
      return recommendations;
    }

    const { availableServices, testResults } = report;
    
    // Check for missing microservices
    const microservices = [
      'user-management', 'payment', 'trading', 'signals', 'market-data',
      'risk-management', 'education', 'notification', 'content-intelligence'
    ];
    
    const missingServices = microservices.filter(service => !availableServices[service]?.healthy);
    if (missingServices.length > 5) {
      recommendations.push({
        icon: '🚀',
        message: `Start microservices (${missingServices.length} not running)`,
        command: 'docker-compose --profile microservices up -d',
        color: 'yellow'
      });
    }
    
    // Check for infrastructure issues
    const infraIssues = ['redis', 'rabbitmq'].filter(service => 
      availableServices[service] && !availableServices[service].healthy
    );
    
    if (infraIssues.length > 0) {
      recommendations.push({
        icon: '🔧',
        message: `Fix infrastructure services: ${infraIssues.join(', ')}`,
        command: 'docker-compose restart ' + infraIssues.join(' '),
        color: 'red'
      });
    }
    
    // Check for failed tests
    const failedTests = testResults.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      recommendations.push({
        icon: '🐛',
        message: `Investigate ${failedTests.length} failed test(s)`,
        color: 'red'
      });
    }
    
    // Performance recommendations
    const slowTests = testResults.filter(t => t.duration && t.duration > 1000);
    if (slowTests.length > 0) {
      recommendations.push({
        icon: '⚡',
        message: `Optimize performance for ${slowTests.length} slow test(s)`,
        color: 'yellow'
      });
    }
    
    return recommendations;
  }
}

// Execute if run directly
if (require.main === module) {
  const summary = new IntegrationSummary();
  const success = summary.generateSummary();
  process.exit(success ? 0 : 1);
}

module.exports = IntegrationSummary;