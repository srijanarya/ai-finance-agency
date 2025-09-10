// TREUM AI Finance Platform - Critical Path Tests Configuration

module.exports = {
  displayName: 'critical-path',
  testMatch: ['<rootDir>/**/*.test.js'],
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  collectCoverage: false,
  verbose: true,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/../../critical-test-results',
        outputName: 'critical-path-junit.xml',
        classNameTemplate: 'CriticalPath.{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › '
      }
    ]
  ]
};