import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ContentIntelligenceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'healthy');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
      });
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('service', 'Content Intelligence Engine');
        expect(res.body).toHaveProperty('version');
        expect(res.body).toHaveProperty('status', 'active');
      });
  });

  describe('API Security', () => {
    it('/api/v1/content/generate (POST) - should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/content/generate')
        .send({
          contentType: 'post',
          title: 'Test Content',
          prompt: 'Generate test financial content',
        })
        .expect(401);
    });

    it('/api/v1/content (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/content')
        .expect(401);
    });
  });

  describe('API Documentation', () => {
    it('/api (GET) - should serve Swagger documentation', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Content-Type', /html/);
    });
  });
});