import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';

export interface TestContext {
  app: INestApplication;
  module: TestingModule;
  dataSource?: DataSource;
  request?: request.SuperTest<request.Test>;
}

export class TestHelpers {
  /**
   * Create a test application with common setup
   */
  static async createTestApp(moduleClass: any, providers: any[] = []): Promise<TestContext> {
    const moduleBuilder = Test.createTestingModule({
      imports: [moduleClass],
      providers: [...providers],
    });

    const module = await moduleBuilder.compile();
    const app = module.createNestApplication();
    
    await app.init();

    return {
      app,
      module,
      request: request(app.getHttpServer()),
    };
  }

  /**
   * Clean up database after tests
   */
  static async cleanupDatabase(dataSource: DataSource): Promise<void> {
    const entities = dataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  }

  /**
   * Create a mock repository
   */
  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      query: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
        execute: jest.fn(),
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
      })),
    };
  }

  /**
   * Create a mock Redis client
   */
  static createMockRedis() {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      ttl: jest.fn(),
      keys: jest.fn(),
      flushall: jest.fn(),
      hget: jest.fn(),
      hset: jest.fn(),
      hdel: jest.fn(),
      hgetall: jest.fn(),
      lpush: jest.fn(),
      rpush: jest.fn(),
      lpop: jest.fn(),
      rpop: jest.fn(),
      lrange: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
    };
  }

  /**
   * Create a mock WebSocket client
   */
  static createMockWebSocket() {
    return {
      emit: jest.fn(),
      on: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      to: jest.fn().mockReturnThis(),
      broadcast: jest.fn().mockReturnThis(),
      disconnect: jest.fn(),
    };
  }

  /**
   * Create a mock HTTP service
   */
  static createMockHttpService() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };
  }

  /**
   * Create a mock JWT service
   */
  static createMockJwtService() {
    return {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
      decode: jest.fn(),
    };
  }

  /**
   * Create a mock ConfigService
   */
  static createMockConfigService(config: Record<string, any> = {}) {
    return {
      get: jest.fn((key: string) => config[key]),
      getOrThrow: jest.fn((key: string) => {
        if (config[key] === undefined) {
          throw new Error(`Configuration key "${key}" not found`);
        }
        return config[key];
      }),
    };
  }

  /**
   * Create a mock logger
   */
  static createMockLogger() {
    return {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
  }

  /**
   * Create a mock event emitter
   */
  static createMockEventEmitter() {
    return {
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    };
  }

  /**
   * Create a mock Stripe service
   */
  static createMockStripeService() {
    return {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    };
  }

  /**
   * Create a mock email service
   */
  static createMockEmailService() {
    return {
      sendMail: jest.fn(),
      sendTemplate: jest.fn(),
      createTransporter: jest.fn(),
    };
  }

  /**
   * Create a mock file upload
   */
  static createMockFile(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
    return {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test content'),
      size: 1024,
      stream: null as any,
      destination: '',
      filename: 'test.pdf',
      path: '',
      ...overrides,
    };
  }

  /**
   * Wait for a specified amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a mock JWT token
   */
  static generateMockJWT(payload: any = {}): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify({
      sub: '1234567890',
      name: 'Test User',
      iat: 1516239022,
      ...payload,
    })).toString('base64');
    const signature = 'mock-signature';
    
    return `${header}.${body}.${signature}`;
  }

  /**
   * Create mock request object
   */
  static createMockRequest(overrides: any = {}) {
    return {
      user: null,
      headers: {},
      params: {},
      query: {},
      body: {},
      cookies: {},
      ip: '127.0.0.1',
      method: 'GET',
      url: '/',
      ...overrides,
    };
  }

  /**
   * Create mock response object
   */
  static createMockResponse(overrides: any = {}) {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      ...overrides,
    };
    return res;
  }

  /**
   * Assert that a function throws an error
   */
  static async expectToThrow(fn: () => Promise<any>, errorClass?: any): Promise<void> {
    try {
      await fn();
      throw new Error('Expected function to throw, but it did not');
    } catch (error) {
      if (errorClass && !(error instanceof errorClass)) {
        throw new Error(`Expected error to be instance of ${errorClass.name}, but got ${error.constructor.name}`);
      }
    }
  }

  /**
   * Create test database connection
   */
  static createTestDatabase() {
    return {
      type: 'sqlite',
      database: ':memory:',
      entities: [],
      synchronize: true,
      dropSchema: true,
    };
  }
}