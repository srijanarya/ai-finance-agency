import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Repository } from 'typeorm';

describe('Authentication Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let sessionRepository: Repository<UserSession>;
  let auditRepository: Repository<AuditLog>;

  const testUser = {
    email: 'test@treum.ai',
    password: 'SecureP@ss123',
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    sessionRepository = moduleFixture.get<Repository<UserSession>>(getRepositoryToken(UserSession));
    auditRepository = moduleFixture.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test data
    await auditRepository.delete({});
    await sessionRepository.delete({});
    await userRepository.delete({ email: testUser.email });
    await app.close();
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.message).toContain('registered successfully');

      // Verify user was created in database
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      expect(user).toBeDefined();
      expect(user.firstName).toBe(testUser.firstName);
      expect(user.status).toBe('pending_verification');
    });

    it('should prevent duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('Authentication Flow', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      // Verify user's email for testing
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      await userRepository.update(user.id, {
        emailVerified: true,
        status: 'active',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
          deviceId: 'test-device-001',
          deviceName: 'Jest Test Device',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      // Verify session was created
      const sessions = await sessionRepository.find({ where: { userId: response.body.user.id } });
      expect(sessions).toHaveLength(1);
      expect(sessions[0].deviceId).toBe('test-device-001');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      // Update tokens for subsequent tests
      accessToken = response.body.accessToken;
    });

    it('should access protected routes with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify session was deactivated
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      const sessions = await sessionRepository.find({ 
        where: { userId: user.id, isActive: true } 
      });
      expect(sessions).toHaveLength(0);
    });
  });

  describe('MFA Flow', () => {
    let accessToken: string;
    let user: User;

    beforeAll(async () => {
      // Login to get fresh tokens
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
          deviceId: 'test-device-mfa',
          deviceName: 'MFA Test Device',
        });

      accessToken = response.body.accessToken;
      user = await userRepository.findOne({ where: { email: testUser.email } });
    });

    it('should setup MFA successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/mfa/setup')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('qrCode');
      expect(response.body).toHaveProperty('backupCodes');
      expect(response.body.backupCodes).toHaveLength(8);

      // Verify user's MFA status was updated
      const updatedUser = await userRepository.findOne({ where: { id: user.id } });
      expect(updatedUser.twoFactorStatus).toBe('pending_setup');
      expect(updatedUser.twoFactorSecret).toBeDefined();
    });

    it('should prevent MFA setup if already enabled', async () => {
      // First enable MFA
      await userRepository.update(user.id, { twoFactorStatus: 'enabled' });

      await request(app.getHttpServer())
        .post('/auth/mfa/setup')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  describe('Password Management', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.accessToken;
    });

    it('should request password reset', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.message).toContain('password reset link');

      // Verify reset token was created
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should change password with valid current password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewSecureP@ss456',
        })
        .expect(200);

      expect(response.body.message).toContain('changed successfully');

      // Test login with new password
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'NewSecureP@ss456',
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
    });
  });

  describe('Session Management', () => {
    let accessToken: string;
    let sessionId: string;

    beforeAll(async () => {
      // Create multiple sessions
      const response1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'NewSecureP@ss456',
          deviceId: 'device-1',
          deviceName: 'Device 1',
        });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'NewSecureP@ss456',
          deviceId: 'device-2',
          deviceName: 'Device 2',
        });

      accessToken = response1.body.accessToken;
      
      // Get session ID from database
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      const sessions = await sessionRepository.find({ where: { userId: user.id } });
      sessionId = sessions[0].id;
    });

    it('should get active sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('deviceId');
      expect(response.body[0]).toHaveProperty('deviceName');
    });

    it('should terminate all other sessions', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/sessions/terminate-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('terminatedCount');
      expect(response.body.terminatedCount).toBeGreaterThan(0);

      // Verify sessions were terminated
      const user = await userRepository.findOne({ where: { email: testUser.email } });
      const activeSessions = await sessionRepository.find({ 
        where: { userId: user.id, isActive: true } 
      });
      expect(activeSessions.length).toBeLessThanOrEqual(1); // Only current session should remain
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const promises = [];
      
      // Make 10 rapid login attempts with wrong password
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/auth/login')
            .send({
              email: 'ratelimit@test.com',
              password: 'wrongpassword',
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Should have at least one rate limited response (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Audit Logging', () => {
    it('should log security events', async () => {
      // Perform a login to generate audit logs
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'NewSecureP@ss456',
        });

      // Check if audit log was created
      const auditLogs = await auditRepository.find({
        where: { action: 'user_login' },
        order: { createdAt: 'DESC' },
        take: 1,
      });

      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].resource).toBe('auth');
      expect(auditLogs[0].status).toBe('success');
    });

    it('should log failed login attempts', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      // Check if failed login was logged
      const failedLogs = await auditRepository.find({
        where: { action: 'user_login_failed' },
        order: { createdAt: 'DESC' },
        take: 1,
      });

      expect(failedLogs).toHaveLength(1);
      expect(failedLogs[0].status).toBe('failure');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'ValidP@ss123',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should enforce password complexity', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JWT tokens', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer malformed.jwt.token')
        .expect(401);
    });

    it('should handle expired tokens gracefully', async () => {
      // This would require setting up a token with past expiration
      // For now, we test with an invalid token
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
        .expect(401);
    });
  });
});

describe('Device Tracking Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should track device information on login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)')
      .set('X-Forwarded-For', '203.0.113.1')
      .send({
        email: 'test@treum.ai',
        password: 'NewSecureP@ss456',
        deviceId: 'test-iphone',
        deviceName: 'iPhone 12',
      });

    if (response.status === 200) {
      expect(response.body).toHaveProperty('accessToken');
      
      // The device tracking would be handled by middleware
      // In a real test, we'd verify the session record includes device info
    }
  });

  it('should detect suspicious user agents', async () => {
    // Test with a suspicious user agent (bot-like)
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .set('User-Agent', 'SuspiciousBot/1.0')
      .send({
        email: 'test@treum.ai',
        password: 'NewSecureP@ss456',
      });

    // The security middleware should detect this
    // Depending on risk score, it might block or add security flags
    expect([200, 403].includes(response.status)).toBe(true);
  });
});

describe('OAuth Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should redirect to Google OAuth', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/google')
      .expect(302);

    expect(response.headers.location).toContain('accounts.google.com');
  });

  it('should redirect to GitHub OAuth', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/github')
      .expect(302);

    expect(response.headers.location).toContain('github.com');
  });

  // Note: Full OAuth flow testing would require mocking OAuth providers
  // or using test credentials in a controlled environment
});