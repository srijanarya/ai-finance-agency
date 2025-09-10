import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('RiskManagementController (e2e)', () => {
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
      .expect(200);
  });

  it('/health/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect((res) => {
        expect(res.body.service).toBe('risk-management');
        expect(res.body.ready).toBe(true);
      });
  });

  it('/health/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect((res) => {
        expect(res.body.service).toBe('risk-management');
        expect(typeof res.body.uptime).toBe('number');
      });
  });

  describe('Risk Assessment Endpoints', () => {
    it('should require authentication for protected endpoints', () => {
      return request(app.getHttpServer())
        .post('/risk-assessment/trade')
        .send({
          userId: 'test-user',
          accountId: 'test-account',
          symbol: 'AAPL',
          assetType: 'STOCK',
          side: 'BUY',
          quantity: 100,
          price: 150.0,
          portfolioValue: 100000,
          availableBalance: 25000,
        })
        .expect(401);
    });
  });

  describe('Compliance Endpoints', () => {
    it('should require authentication for KYC checks', () => {
      return request(app.getHttpServer())
        .post('/compliance/kyc')
        .send({
          userId: 'test-user',
          personalInfo: {
            fullName: 'Test User',
            dateOfBirth: '1990-01-01',
            nationality: 'US',
            address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              country: 'US',
              postalCode: '10001',
            },
            phone: '+1234567890',
            email: 'test@example.com',
          },
          documents: [],
          riskProfile: 'medium',
          investmentExperience: 'intermediate',
        })
        .expect(401);
    });
  });

  describe('Risk Alerts Endpoints', () => {
    it('should require authentication for creating alerts', () => {
      return request(app.getHttpServer())
        .post('/risk-alerts')
        .send({
          userId: 'test-user',
          alertType: 'RISK_LIMIT_BREACH',
          severity: 'HIGH',
          priority: 'P2',
          title: 'Test Alert',
          description: 'Test alert description',
          triggerConditions: {
            rule: 'test-rule',
            threshold: 100,
            actualValue: 150,
            operator: 'gt',
            timeWindow: '1h',
          },
          contextData: {},
          recommendedActions: ['Test action'],
          automaticActions: [],
          impactAssessment: {
            financialImpact: 1000,
            riskExposure: 50,
            affectedPositions: 1,
            potentialLoss: 500,
            timeToResolution: '30 minutes',
          },
          relatedEntities: {
            trades: [],
            positions: [],
            accounts: ['test-account'],
            alerts: [],
          },
          notificationChannels: ['dashboard'],
        })
        .expect(401);
    });
  });
});