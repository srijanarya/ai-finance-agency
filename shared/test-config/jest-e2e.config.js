module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
  testTimeout: 60000,
  verbose: true,
  collectCoverage: false,
  globals: {
    'ts-jest': {
      tsconfig: {
        compilerOptions: {
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
        },
      },
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$))',
  ],
};