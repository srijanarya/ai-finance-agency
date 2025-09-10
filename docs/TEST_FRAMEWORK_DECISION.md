# Test Framework Decision Record

## Decision: Jest + Supertest for NestJS Services

**Date**: 2025-09-10  
**Status**: APPROVED  
**Decision Makers**: Tech Lead Team

## Selected Framework Stack

### Primary Testing Framework: **Jest**
- **Version**: ^29.5.0
- **Reason**: NestJS native support, excellent TypeScript integration
- **Coverage Tool**: Built-in with Jest

### API Testing: **Supertest**
- **Version**: ^6.3.3
- **Reason**: Express/NestJS compatibility, simple API testing

### E2E Testing: **Playwright**
- **Version**: ^1.40.0
- **Reason**: Modern, fast, reliable browser automation

## Implementation Plan

### Phase 1: Unit Tests (Week 1)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:unit": "jest --testMatch='**/*.spec.ts'"
  }
}
```

### Phase 2: Integration Tests (Week 2)
```json
{
  "scripts": {
    "test:integration": "jest --testMatch='**/*.integration.spec.ts'",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### Phase 3: E2E Tests (Week 3)
```json
{
  "scripts": {
    "test:e2e:ui": "playwright test",
    "test:e2e:api": "jest --config ./test/jest-e2e.json --runInBand"
  }
}
```

## Jest Configuration

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};
```

## Test Structure Standard

```typescript
// example.service.spec.ts
describe('ExampleService', () => {
  let service: ExampleService;
  let mockRepository: jest.Mocked<Repository<Entity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        {
          provide: getRepositoryToken(Entity),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
  });

  describe('methodName', () => {
    it('should do expected behavior', async () => {
      // Arrange
      const input = { /* test data */ };
      
      // Act
      const result = await service.methodName(input);
      
      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

## Coverage Targets

| Metric | Initial (Week 1) | Target (Month 1) | Goal (Quarter 1) |
|--------|------------------|------------------|------------------|
| Lines | 30% | 60% | 80% |
| Functions | 30% | 60% | 80% |
| Branches | 25% | 50% | 75% |
| Statements | 30% | 60% | 80% |

## Priority Testing Areas

1. **Critical Path** (Week 1)
   - Authentication flows
   - Payment processing
   - Order execution

2. **Business Logic** (Week 2)
   - Signal generation
   - Risk calculations
   - Portfolio management

3. **Integration Points** (Week 3)
   - API Gateway routing
   - Service communication
   - Database transactions

## Team Training

- **Monday**: Jest basics workshop (2 hours)
- **Wednesday**: Mocking strategies session (1 hour)
- **Friday**: Code coverage review meeting (30 min)

## Success Metrics

- [ ] All new code has tests from Day 1
- [ ] 30% coverage achieved by end of Week 1
- [ ] CI/CD pipeline runs tests on every PR
- [ ] Test execution time < 5 minutes for unit tests
- [ ] Zero flaky tests in the suite

## Decision Rationale

**Why Jest?**
- NestJS recommended and integrated
- Excellent TypeScript support
- Fast execution with parallel testing
- Great mocking capabilities
- Built-in coverage reporting

**Why not Mocha/Chai?**
- Requires additional configuration for NestJS
- Separate assertion library needed
- Less integrated tooling

**Why not Vitest?**
- Less mature for backend testing
- Better suited for Vite-based frontend projects

## Action Items

1. ✅ Add Jest to all service package.json files
2. ✅ Create jest.config.js in each service
3. ✅ Write first test for auth endpoint
4. ✅ Set up coverage reporting in CI/CD
5. ✅ Schedule team training sessions

---

**Approved by**: Tech Lead Team  
**Implementation Start**: Immediately