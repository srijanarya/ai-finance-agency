#!/usr/bin/env node

const { DatabaseCleanup } = require('../utils/database-cleanup');

async function teardown() {
  console.log('🧹 Cleaning up E2E test environment...');
  
  try {
    // 1. Clean up test data
    console.log('🗑️ Cleaning up test data...');
    const dbCleanup = new DatabaseCleanup();
    await dbCleanup.cleanupTestData();
    console.log('✅ Test data cleaned up');

    // 2. Verify cleanup
    console.log('🔍 Verifying cleanup...');
    const cleanupVerified = await dbCleanup.verifyCleanup();
    if (cleanupVerified) {
      console.log('✅ Cleanup verification successful');
    } else {
      console.log('⚠️ Cleanup verification failed - some data may remain');
    }

    // 3. Close connections
    console.log('🔌 Closing database connections...');
    await dbCleanup.closeConnections();
    console.log('✅ Connections closed');

    console.log('✨ E2E test environment cleanup complete!');
    
  } catch (error) {
    console.error('❌ Failed to clean up test environment:', error);
    // Don't exit with error to avoid breaking CI/CD
    console.log('⚠️ Continuing despite cleanup errors...');
  }
}

// Run if called directly
if (require.main === module) {
  teardown().catch(console.error);
}

module.exports = teardown;