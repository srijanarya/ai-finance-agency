import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthModule } from '../src/modules/auth.module';
import { User, UserStatus } from '../src/entities/user.entity';
import { Role } from '../src/entities/role.entity';
import { UserSession } from '../src/entities/user-session.entity';
import { AuditLog } from '../src/entities/audit-log.entity';
import { Permission } from '../src/entities/permission.entity';
import { TestFactory } from '@shared/test-utils/test-factory';
import { testDataSource } from './setup-e2e';
import * as bcrypt from 'bcryptjs';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: any;
  let roleRepository: any;
  
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [User, Role, UserSession, AuditLog, Permission],
            synchronize: true,
            logging: false,
          }),
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    userRepository = dataSource.getRepository(User);
    roleRepository = dataSource.getRepository(Role);

    // Create default role
    const userRole = roleRepository.create({
      name: 'user',
      description: 'Default user role',
    });
    await roleRepository.save(userRole);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      if (entity.name !== 'Role') { // Keep roles
        const repository = dataSource.getRepository(entity.name);
        await repository.clear();
      }
    }
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('userId');
          expect(res.body.message).toContain('registered');
        });
    });

    it('should return 409 for duplicate email', async () => {
      // Create existing user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const existingUser = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: false,
      });
      await userRepository.save(existingUser);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 for weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          // Missing password
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    let registeredUser: User;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const userRole = await roleRepository.findOne({ where: { name: 'user' } });
      
      registeredUser = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        roles: [userRole],
      });
      await userRepository.save(registeredUser);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should return 401 for invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should return 401 for unverified email', async () => {
      // Create unverified user
      const hashedPassword = await bcrypt.hash('testpass', 12);
      const unverifiedUser = userRepository.create({
        email: 'unverified@example.com',
        password: hashedPassword,
        firstName: 'Unverified',
        lastName: 'User',
        status: UserStatus.ACTIVE,
        emailVerified: false,
      });
      await userRepository.save(unverifiedUser);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'testpass',
        })
        .expect(401);
    });

    it('should return 400 for missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          // Missing password
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Create and login user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const userRole = await roleRepository.findOne({ where: { name: 'user' } });
      
      const user = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        roles: [userRole],
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.accessToken).not.toBe(accessToken);
        });
    });

    it('should return 401 for invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);
    });

    it('should return 400 for missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const userRole = await roleRepository.findOne({ where: { name: 'user' } });
      
      const user = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        roles: [userRole],
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const userRole = await roleRepository.findOne({ where: { name: 'user' } });
      
      const user = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        roles: [userRole],
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
    });

    it('should logout with valid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Logged out successfully');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const user = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
      });
      await userRepository.save(user);
    });

    it('should send forgot password email for existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: testUser.email,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Password reset email sent');
        });
    });

    it('should return success message even for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Password reset email sent');
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/change-password (POST)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login user
      const hashedPassword = await bcrypt.hash(testUser.password, 12);
      const userRole = await roleRepository.findOne({ where: { name: 'user' } });
      
      const user = userRepository.create({
        ...testUser,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        roles: [userRole],
      });
      await userRepository.save(user);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      accessToken = loginResponse.body.accessToken;
    });

    it('should change password with valid current password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Password changed successfully');
        });
    });

    it('should return 401 for invalid current password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });

    it('should return 400 for weak new password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'weak',
        })
        .expect(400);
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!',
        })
        .expect(401);
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit login attempts', async () => {
      // Make multiple failed login attempts
      const promises = Array.from({ length: 6 }, () =>
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          })
      );

      const results = await Promise.allSettled(promises);
      
      // Check that some requests are rate limited
      const rateLimitedRequests = results.filter(
        (result) => 
          result.status === 'fulfilled' && 
          result.value.status === 429
      );
      
      expect(rateLimitedRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Input validation', () => {
    it('should sanitize SQL injection attempts in email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: "test'; DROP TABLE users; --",
          password: testUser.password,
        })
        .expect(400);
    });

    it('should reject XSS attempts in registration', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          firstName: '<script>alert("xss")</script>',
          lastName: testUser.lastName,
        })
        .expect(400);
    });
  });
});