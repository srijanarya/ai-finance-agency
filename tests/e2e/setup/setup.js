#!/usr/bin/env node

const { ServiceHealthChecker } = require('../utils/service-health-checker');
const { DatabaseSetup } = require('../utils/database-setup');
const { TestDataGenerator } = require('../utils/test-data-generator');

async function setup() {
  console.log('🚀 Setting up E2E test environment...');
  
  try {
    // 1. Check service health
    console.log('🔍 Checking service health...');
    const healthChecker = new ServiceHealthChecker();
    await healthChecker.waitForAllServices();
    console.log('✅ All services are healthy');

    // 2. Setup test databases
    console.log('🗄️ Setting up test databases...');
    const dbSetup = new DatabaseSetup();
    await dbSetup.setupTestDatabases();
    console.log('✅ Test databases ready');

    // 3. Generate initial test data
    console.log('📊 Generating test data...');
    const dataGenerator = new TestDataGenerator();
    await dataGenerator.generateTestData();
    console.log('✅ Test data generated');

    console.log('🎉 E2E test environment setup complete!');
    
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = setup;