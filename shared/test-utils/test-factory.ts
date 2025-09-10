import { faker } from '@faker-js/faker';

export class TestFactory {
  static createUser(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createAuthDto(overrides: Partial<any> = {}) {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...overrides,
    };
  }

  static createPayment(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      amount: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }),
      currency: 'USD',
      status: 'completed',
      stripePaymentId: faker.string.alphanumeric(20),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createTrade(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      symbol: faker.finance.currencyCode(),
      type: faker.helpers.arrayElement(['buy', 'sell']),
      quantity: faker.number.int({ min: 1, max: 1000 }),
      price: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
      status: 'executed',
      executedAt: faker.date.recent(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createSignal(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      symbol: faker.finance.currencyCode(),
      type: faker.helpers.arrayElement(['buy', 'sell', 'hold']),
      confidence: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      price: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
      createdAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createMarketData(overrides: Partial<any> = {}) {
    return {
      symbol: faker.finance.currencyCode(),
      price: faker.number.float({ min: 1, max: 500, fractionDigits: 2 }),
      volume: faker.number.int({ min: 1000, max: 1000000 }),
      change: faker.number.float({ min: -10, max: 10, fractionDigits: 2 }),
      changePercent: faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 4 }),
      timestamp: faker.date.recent(),
      ...overrides,
    };
  }

  static createNotification(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      type: faker.helpers.arrayElement(['email', 'sms', 'push']),
      title: faker.lorem.sentence(),
      message: faker.lorem.paragraph(),
      sent: true,
      createdAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createEducationContent(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      type: faker.helpers.arrayElement(['lesson', 'quiz', 'video']),
      difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createRiskAssessment(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      score: faker.number.int({ min: 1, max: 10 }),
      factors: {
        portfolioValue: faker.number.float({ min: 1000, max: 100000 }),
        leverage: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
        volatility: faker.number.float({ min: 0.1, max: 1, fractionDigits: 3 }),
      },
      recommendations: [faker.lorem.sentence()],
      createdAt: faker.date.recent(),
      ...overrides,
    };
  }

  static createContent(overrides: Partial<any> = {}) {
    return {
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(['post', 'article', 'analysis']),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(5),
      sentiment: faker.helpers.arrayElement(['positive', 'negative', 'neutral']),
      topics: faker.lorem.words(3).split(' '),
      publishedAt: faker.date.recent(),
      createdAt: faker.date.past(),
      ...overrides,
    };
  }

  static createJwtPayload(overrides: Partial<any> = {}) {
    return {
      sub: faker.string.uuid(),
      email: faker.internet.email(),
      roles: ['user'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...overrides,
    };
  }

  static generateEmail(): string {
    return faker.internet.email();
  }

  static generatePassword(): string {
    return faker.internet.password();
  }

  static generateUUID(): string {
    return faker.string.uuid();
  }

  static generateAmount(): number {
    return faker.number.float({ min: 1, max: 1000, fractionDigits: 2 });
  }

  static generateSymbol(): string {
    return faker.helpers.arrayElement(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NFLX']);
  }

  static generatePrice(): number {
    return faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
  }
}