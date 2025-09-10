import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, JwtPayload, DeviceInfo } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserStatus, TwoFactorStatus } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { TestHelpers } from '@shared/test-utils/test-helpers';
import { TestFactory } from '@shared/test-utils/test-factory';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// Mock external dependencies
jest.mock('bcryptjs');
jest.mock('speakeasy');
jest.mock('qrcode');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<any>;
  let sessionRepository: jest.Mocked<any>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let emailService: jest.Mocked<EmailService>;
  let auditService: jest.Mocked<AuditService>;

  const mockUser = TestFactory.createUser({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-password',
    status: UserStatus.ACTIVE,
    emailVerified: true,
    twoFactorStatus: TwoFactorStatus.DISABLED,
    loginAttempts: 0,
    lastLogin: new Date(),
  });

  const mockSession = {
    id: 'test-session-id',
    user: mockUser,
    refreshToken: 'refresh-token-hash',
    deviceId: 'device-123',
    ipAddress: '127.0.0.1',
    userAgent: 'Test Browser',
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: TestHelpers.createMockRepository(),
        },
        {
          provide: getRepositoryToken(UserSession),
          useValue: TestHelpers.createMockRepository(),
        },
        {
          provide: JwtService,
          useValue: TestHelpers.createMockJwtService(),
        },
        {
          provide: ConfigService,
          useValue: TestHelpers.createMockConfigService({
            JWT_SECRET: 'test-secret',
            JWT_EXPIRATION: '15m',
            FRONTEND_URL: 'http://localhost:3000',
          }),
        },
        {
          provide: EmailService,
          useValue: TestHelpers.createMockEmailService(),
        },
        {
          provide: AuditService,
          useValue: {
            logAction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    sessionRepository = module.get(getRepositoryToken(UserSession));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    emailService = module.get<EmailService>(EmailService);
    auditService = module.get<AuditService>(AuditService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
    };

    it('should register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue({ ...mockUser, ...registerDto });
      userRepository.save.mockResolvedValue({ ...mockUser, ...registerDto });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto, '127.0.0.1');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(userRepository.save).toHaveBeenCalled();
      expect(emailService.sendMail).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalled();
      expect(result).toEqual({
        message: expect.any(String),
        userId: expect.any(String),
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto, '127.0.0.1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        roles: [{ name: 'user', permissions: [] }],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');
      sessionRepository.create.mockReturnValue(mockSession);
      sessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.login(loginDto, '127.0.0.1', 'Test Browser');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        relations: ['roles', 'roles.permissions'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalled();
      expect(sessionRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(loginDto, '127.0.0.1', 'Test Browser'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login(loginDto, '127.0.0.1', 'Test Browser'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return MFA requirement for MFA-enabled users', async () => {
      const mfaUser = {
        ...mockUser,
        twoFactorStatus: TwoFactorStatus.ENABLED,
        roles: [{ name: 'user', permissions: [] }],
      };
      userRepository.findOne.mockResolvedValue(mfaUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mfa-temp-token');

      const result = await service.login(loginDto, '127.0.0.1', 'Test Browser');

      expect(result).toHaveProperty('requiresMfa', true);
      expect(result).toHaveProperty('mfaToken');
    });

    it('should handle account lockout', async () => {
      const lockedUser = {
        ...mockUser,
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
      };
      userRepository.findOne.mockResolvedValue(lockedUser);

      await expect(
        service.login(loginDto, '127.0.0.1', 'Test Browser'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh token successfully', async () => {
      const hashedToken = 'hashed-refresh-token';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      sessionRepository.findOne.mockResolvedValue({
        ...mockSession,
        refreshToken: hashedToken,
        user: { ...mockUser, roles: [{ name: 'user', permissions: [] }] },
      });
      jwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['user', 'user.roles', 'user.roles.permissions'],
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired session', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      };
      sessionRepository.findOne.mockResolvedValue(expiredSession);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      sessionRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.logout('test-user-id', 'test-session-id');

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'test-session-id',
          user: { id: 'test-user-id' },
          isActive: true,
        },
      });
      expect(sessionRepository.save).toHaveBeenCalledWith({
        ...mockSession,
        isActive: false,
        logoutAt: expect.any(Date),
      });
      expect(result).toEqual({
        message: 'Logged out successfully',
      });
    });

    it('should handle logout for non-existent session gracefully', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      const result = await service.logout('test-user-id', 'invalid-session-id');

      expect(result).toEqual({
        message: 'Logged out successfully',
      });
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should send password reset email successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.forgotPassword(
        forgotPasswordDto,
        '127.0.0.1',
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: forgotPasswordDto.email },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(emailService.sendMail).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password reset email sent if account exists',
      });
    });

    it('should return success message even for non-existent email', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword(
        forgotPasswordDto,
        '127.0.0.1',
      );

      expect(result).toEqual({
        message: 'Password reset email sent if account exists',
      });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'valid-reset-token',
      newPassword: 'NewPassword123!',
    };

    it('should reset password successfully', async () => {
      const userWithToken = {
        ...mockUser,
        passwordResetToken: 'hashed-token',
        passwordResetTokenExpires: new Date(Date.now() + 3600000),
      };
      userRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.resetPassword(resetPasswordDto, '127.0.0.1');

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        resetPasswordDto.token,
        userWithToken.passwordResetToken,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(resetPasswordDto.newPassword, 12);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password reset successfully',
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.resetPassword(resetPasswordDto, '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: 'hashed-token',
        passwordResetTokenExpires: new Date(Date.now() - 1000),
      };
      userRepository.findOne.mockResolvedValue(userWithExpiredToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.resetPassword(resetPasswordDto, '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'currentPassword123',
      newPassword: 'NewPassword123!',
    };

    it('should change password successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.changePassword(
        'test-user-id',
        changePasswordDto,
        '127.0.0.1',
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 12);
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password changed successfully',
      });
    });

    it('should throw UnauthorizedException for invalid current password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('test-user-id', changePasswordDto, '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('invalid-user-id', changePasswordDto, '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const userWithToken = {
        ...mockUser,
        emailVerificationToken: 'hashed-token',
        emailVerified: false,
      };
      userRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyEmail('valid-token', '127.0.0.1');

      expect(userRepository.findOne).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith({
        ...userWithToken,
        emailVerified: true,
        emailVerificationToken: null,
        emailVerifiedAt: expect.any(Date),
      });
      expect(result).toEqual({
        message: 'Email verified successfully',
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token', '127.0.0.1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for already verified email', async () => {
      const verifiedUser = {
        ...mockUser,
        emailVerified: true,
        emailVerificationToken: 'hashed-token',
      };
      userRepository.findOne.mockResolvedValue(verifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.verifyEmail('valid-token', '127.0.0.1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('MFA functionality', () => {
    describe('setupMfa', () => {
      it('should setup MFA successfully', async () => {
        userRepository.findOne.mockResolvedValue(mockUser);
        
        const mockSecret = {
          otpauth_url: 'otpauth://totp/test',
          base32: 'TEST_SECRET',
        };
        
        const speakeasy = require('speakeasy');
        speakeasy.generateSecret.mockReturnValue(mockSecret);
        
        const QRCode = require('qrcode');
        QRCode.toDataURL.mockResolvedValue('data:image/png;base64,qrcode');

        const result = await service.setupMfa('test-user-id');

        expect(result).toHaveProperty('secret');
        expect(result).toHaveProperty('qrCode');
        expect(result).toHaveProperty('backupCodes');
        expect(Array.isArray(result.backupCodes)).toBe(true);
      });

      it('should throw NotFoundException for non-existent user', async () => {
        userRepository.findOne.mockResolvedValue(null);

        await expect(service.setupMfa('invalid-user-id')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('enableMfa', () => {
      it('should enable MFA successfully', async () => {
        const userWithSecret = {
          ...mockUser,
          twoFactorSecret: 'encrypted-secret',
          twoFactorStatus: TwoFactorStatus.PENDING,
        };
        userRepository.findOne.mockResolvedValue(userWithSecret);
        
        const speakeasy = require('speakeasy');
        speakeasy.totp.verify.mockReturnValue({ delta: 0 });

        const result = await service.enableMfa('test-user-id', '123456', '127.0.0.1');

        expect(userRepository.save).toHaveBeenCalledWith({
          ...userWithSecret,
          twoFactorStatus: TwoFactorStatus.ENABLED,
        });
        expect(result).toEqual({
          message: 'MFA enabled successfully',
        });
      });

      it('should throw BadRequestException for invalid TOTP token', async () => {
        const userWithSecret = {
          ...mockUser,
          twoFactorSecret: 'encrypted-secret',
          twoFactorStatus: TwoFactorStatus.PENDING,
        };
        userRepository.findOne.mockResolvedValue(userWithSecret);
        
        const speakeasy = require('speakeasy');
        speakeasy.totp.verify.mockReturnValue(false);

        await expect(
          service.enableMfa('test-user-id', 'invalid', '127.0.0.1'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('completeMfaLogin', () => {
      it('should complete MFA login successfully', async () => {
        const jwtPayload: JwtPayload = {
          sub: 'test-user-id',
          email: 'test@example.com',
          roles: ['user'],
          permissions: [],
          sessionId: 'temp-session-id',
        };
        
        jwtService.verify.mockReturnValue(jwtPayload);
        userRepository.findOne.mockResolvedValue({
          ...mockUser,
          twoFactorStatus: TwoFactorStatus.ENABLED,
          roles: [{ name: 'user', permissions: [] }],
        });
        
        const speakeasy = require('speakeasy');
        speakeasy.totp.verify.mockReturnValue({ delta: 0 });
        
        jwtService.sign.mockReturnValue('final-jwt-token');
        sessionRepository.create.mockReturnValue(mockSession);
        sessionRepository.save.mockResolvedValue(mockSession);

        const deviceInfo: DeviceInfo = {
          deviceId: 'device-123',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Browser',
        };

        const result = await service.completeMfaLogin(
          'mfa-temp-token',
          '123456',
          deviceInfo,
        );

        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
        expect(result).toHaveProperty('user');
      });

      it('should throw UnauthorizedException for invalid MFA token', async () => {
        jwtService.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        const deviceInfo: DeviceInfo = {
          deviceId: 'device-123',
        };

        await expect(
          service.completeMfaLogin('invalid-mfa-token', '123456', deviceInfo),
        ).rejects.toThrow(UnauthorizedException);
      });

      it('should throw UnauthorizedException for invalid TOTP token', async () => {
        const jwtPayload: JwtPayload = {
          sub: 'test-user-id',
          email: 'test@example.com',
          roles: ['user'],
          permissions: [],
          sessionId: 'temp-session-id',
        };
        
        jwtService.verify.mockReturnValue(jwtPayload);
        userRepository.findOne.mockResolvedValue({
          ...mockUser,
          twoFactorStatus: TwoFactorStatus.ENABLED,
        });
        
        const speakeasy = require('speakeasy');
        speakeasy.totp.verify.mockReturnValue(false);

        const deviceInfo: DeviceInfo = {
          deviceId: 'device-123',
        };

        await expect(
          service.completeMfaLogin('mfa-temp-token', 'invalid-totp', deviceInfo),
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Session management', () => {
    describe('getAllUserSessions', () => {
      it('should return all user sessions', async () => {
        const mockSessions = [mockSession, { ...mockSession, id: 'session-2' }];
        sessionRepository.find.mockResolvedValue(mockSessions);

        const result = await service.getAllUserSessions('test-user-id');

        expect(sessionRepository.find).toHaveBeenCalledWith({
          where: {
            user: { id: 'test-user-id' },
            isActive: true,
          },
          order: { updatedAt: 'DESC' },
        });
        expect(result).toHaveLength(2);
      });
    });

    describe('terminateSession', () => {
      it('should terminate specific session successfully', async () => {
        sessionRepository.findOne.mockResolvedValue(mockSession);

        const result = await service.terminateSession(
          'test-user-id',
          'session-to-terminate',
          'current-session-id',
        );

        expect(sessionRepository.save).toHaveBeenCalledWith({
          ...mockSession,
          isActive: false,
          logoutAt: expect.any(Date),
        });
        expect(result).toEqual({
          message: 'Session terminated successfully',
        });
      });

      it('should not allow terminating current session', async () => {
        await expect(
          service.terminateSession(
            'test-user-id',
            'current-session-id',
            'current-session-id',
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException for non-existent session', async () => {
        sessionRepository.findOne.mockResolvedValue(null);

        await expect(
          service.terminateSession(
            'test-user-id',
            'non-existent-session',
            'current-session-id',
          ),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('terminateAllOtherSessions', () => {
      it('should terminate all other sessions successfully', async () => {
        const otherSessions = [
          { ...mockSession, id: 'session-1' },
          { ...mockSession, id: 'session-2' },
        ];
        sessionRepository.find.mockResolvedValue(otherSessions);

        const result = await service.terminateAllOtherSessions(
          'test-user-id',
          'current-session-id',
        );

        expect(sessionRepository.save).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
          message: 'All other sessions terminated successfully',
          terminatedCount: 2,
        });
      });
    });
  });
});