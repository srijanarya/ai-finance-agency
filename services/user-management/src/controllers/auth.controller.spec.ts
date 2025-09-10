import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TestHelpers } from '@shared/test-utils/test-helpers';
import { TestFactory } from '@shared/test-utils/test-factory';
import { HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let mockRequest: any;

  const mockUser = TestFactory.createUser({
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: [{ name: 'user' }],
  });

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
    verifyEmail: jest.fn(),
    setupMfa: jest.fn(),
    enableMfa: jest.fn(),
    disableMfa: jest.fn(),
    completeMfaLogin: jest.fn(),
    getAllUserSessions: jest.fn(),
    terminateSession: jest.fn(),
    terminateAllOtherSessions: jest.fn(),
    enhancedLogout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>;

    mockRequest = TestHelpers.createMockRequest({
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      get: jest.fn((header: string) => {
        switch (header) {
          case 'User-Agent':
            return 'Mozilla/5.0 (Test)';
          case 'X-Device-ID':
            return 'test-device-id';
          case 'X-Device-Name':
            return 'Test Device';
          case 'Authorization':
            return 'Bearer test-token';
          default:
            return undefined;
        }
      }),
      sessionId: 'test-session-id',
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const expectedResult = {
        message: 'User registered successfully',
        user: { id: '456', email: registerDto.email },
      };

      authService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto, mockRequest);

      expect(authService.register).toHaveBeenCalledWith(
        registerDto,
        mockRequest.ip,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration errors', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const error = new Error('Email already exists');
      authService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto, mockRequest)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto, mockRequest);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest.ip,
        'Mozilla/5.0 (Test)',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle login with MFA requirement', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        requiresMfa: true,
        mfaToken: 'mfa-temp-token',
      };

      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedResult = {
        accessToken: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(expectedResult);

      const result = await controller.refreshToken(refreshTokenDto, mockRequest);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const expectedResult = {
        message: 'Logged out successfully',
      };

      authService.logout.mockResolvedValue(expectedResult);

      const result = await controller.logout(mockUser, mockRequest);

      expect(authService.logout).toHaveBeenCalledWith(
        mockUser.id,
        mockRequest.sessionId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      const expectedResult = {
        message: 'Password reset email sent',
      };

      authService.forgotPassword.mockResolvedValue(expectedResult);

      const result = await controller.forgotPassword(
        forgotPasswordDto,
        mockRequest,
      );

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
        mockRequest.ip,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto = {
        token: 'valid-reset-token',
        newPassword: 'NewPassword123!',
      };

      const expectedResult = {
        message: 'Password reset successfully',
      };

      authService.resetPassword.mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(resetPasswordDto, mockRequest);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
        mockRequest.ip,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'currentPassword123',
        newPassword: 'NewPassword123!',
      };

      const expectedResult = {
        message: 'Password changed successfully',
      };

      authService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(
        mockUser,
        changePasswordDto,
        mockRequest,
      );

      expect(authService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto,
        mockRequest.ip,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with GET request successfully', async () => {
      const token = 'valid-verification-token';
      const expectedResult = {
        message: 'Email verified successfully',
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmail(token, mockRequest);

      expect(authService.verifyEmail).toHaveBeenCalledWith(
        token,
        mockRequest.ip,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should verify email with POST request successfully', async () => {
      const verifyEmailDto = {
        token: 'valid-verification-token',
      };

      const expectedResult = {
        message: 'Email verified successfully',
      };

      authService.verifyEmail.mockResolvedValue(expectedResult);

      const result = await controller.verifyEmailPost(verifyEmailDto, mockRequest);

      expect(authService.verifyEmail).toHaveBeenCalledWith(
        verifyEmailDto.token,
        mockRequest.ip,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('checkAuth', () => {
    it('should return authentication status', async () => {
      const result = await controller.checkAuth(mockUser);

      expect(result).toEqual({
        authenticated: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: ['user'],
        },
      });
    });
  });

  describe('MFA endpoints', () => {
    describe('setupMfa', () => {
      it('should setup MFA successfully', async () => {
        const expectedResult = {
          qrCode: 'data:image/png;base64,qrcode',
          secret: 'mfa-secret',
        };

        authService.setupMfa.mockResolvedValue(expectedResult);

        const result = await controller.setupMfa(mockUser);

        expect(authService.setupMfa).toHaveBeenCalledWith(mockUser.id);
        expect(result).toEqual(expectedResult);
      });
    });

    describe('enableMfa', () => {
      it('should enable MFA successfully', async () => {
        const token = '123456';
        const expectedResult = {
          message: 'MFA enabled successfully',
        };

        authService.enableMfa.mockResolvedValue(expectedResult);

        const result = await controller.enableMfa(mockUser, token, mockRequest);

        expect(authService.enableMfa).toHaveBeenCalledWith(
          mockUser.id,
          token,
          mockRequest.ip,
        );
        expect(result).toEqual(expectedResult);
      });
    });

    describe('disableMfa', () => {
      it('should disable MFA successfully', async () => {
        const token = '123456';
        const expectedResult = {
          message: 'MFA disabled successfully',
        };

        authService.disableMfa.mockResolvedValue(expectedResult);

        const result = await controller.disableMfa(mockUser, token, mockRequest);

        expect(authService.disableMfa).toHaveBeenCalledWith(
          mockUser.id,
          token,
          mockRequest.ip,
        );
        expect(result).toEqual(expectedResult);
      });
    });

    describe('completeMfaLogin', () => {
      it('should complete MFA login successfully', async () => {
        const mfaToken = 'mfa-temp-token';
        const totpToken = '123456';

        const expectedResult = {
          accessToken: 'jwt-token',
          refreshToken: 'refresh-token',
          user: mockUser,
        };

        authService.completeMfaLogin.mockResolvedValue(expectedResult);

        const result = await controller.completeMfaLogin(
          mfaToken,
          totpToken,
          mockRequest,
        );

        expect(authService.completeMfaLogin).toHaveBeenCalledWith(
          mfaToken,
          totpToken,
          {
            deviceId: 'test-device-id',
            deviceName: 'Test Device',
            ipAddress: mockRequest.ip,
            userAgent: 'Mozilla/5.0 (Test)',
          },
        );
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Session management', () => {
    describe('getUserSessions', () => {
      it('should return user sessions', async () => {
        const expectedSessions = [
          {
            id: 'session-1',
            deviceInfo: 'Chrome on Windows',
            ipAddress: '127.0.0.1',
            lastActivity: new Date(),
          },
        ];

        authService.getAllUserSessions.mockResolvedValue(expectedSessions);

        const result = await controller.getUserSessions(mockUser);

        expect(authService.getAllUserSessions).toHaveBeenCalledWith(mockUser.id);
        expect(result).toEqual(expectedSessions);
      });
    });

    describe('terminateSession', () => {
      it('should terminate specific session', async () => {
        const sessionId = 'session-to-terminate';
        const expectedResult = {
          message: 'Session terminated successfully',
        };

        authService.terminateSession.mockResolvedValue(expectedResult);

        const result = await controller.terminateSession(
          mockUser,
          sessionId,
          mockRequest,
        );

        expect(authService.terminateSession).toHaveBeenCalledWith(
          mockUser.id,
          sessionId,
          mockRequest.sessionId,
        );
        expect(result).toEqual(expectedResult);
      });
    });

    describe('terminateAllOtherSessions', () => {
      it('should terminate all other sessions', async () => {
        const expectedResult = {
          message: 'All other sessions terminated successfully',
          terminatedCount: 3,
        };

        authService.terminateAllOtherSessions.mockResolvedValue(expectedResult);

        const result = await controller.terminateAllOtherSessions(
          mockUser,
          mockRequest,
        );

        expect(authService.terminateAllOtherSessions).toHaveBeenCalledWith(
          mockUser.id,
          mockRequest.sessionId,
        );
        expect(result).toEqual(expectedResult);
      });
    });

    describe('enhancedLogout', () => {
      it('should perform enhanced logout', async () => {
        const expectedResult = {
          message: 'Enhanced logout successful',
        };

        authService.enhancedLogout.mockResolvedValue(expectedResult);

        const result = await controller.enhancedLogout(mockUser, mockRequest);

        expect(authService.enhancedLogout).toHaveBeenCalledWith(
          mockUser.id,
          mockRequest.sessionId,
          'test-token',
        );
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('resendVerification', () => {
    it('should return success message for resend verification', async () => {
      const result = await controller.resendVerification();

      expect(result).toEqual({
        message: 'Verification email sent',
      });
    });
  });
});