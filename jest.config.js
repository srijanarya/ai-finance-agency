// TREUM AI Finance Platform - Root Jest Configuration

module.exports = {
  projects: [
    '<rootDir>/services/*/jest.config.js',
    '<rootDir>/tests/critical-path/jest.config.js'
  ],
  collectCoverageFrom: [
    'services/*/src/**/*.{ts,js}',
    '!services/*/src/**/*.d.ts',
    '!services/*/src/**/*.spec.ts',
    '!services/*/src/**/*.test.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: 10000,
  maxWorkers: '50%',
  verbose: true,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js'
};