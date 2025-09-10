import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User, UserStatus, TwoFactorStatus } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UserSession } from '../entities/user-session.entity';
import { AuditAction } from '../entities/audit-log.entity';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth.dto';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
  expiresIn: number;
  requiresMfa?: boolean;
  mfaToken?: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MFA_TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_SESSIONS_PER_USER = 5;
  private readonly TOKEN_BLACKLIST = new Set<string>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
  ): Promise<{ message: string; userId: string }> {
    const { email, password, firstName, lastName, phone, dateOfBirth } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      emailVerificationToken,
      emailVerificationExpires,
      status: UserStatus.PENDING_VERIFICATION,
    });

    const savedUser = await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      email,
      emailVerificationToken,
    );

    // Log the registration
    await this.auditService.log({
      userId: savedUser.id,
      action: AuditAction.USER_CREATED,
      resource: 'user',
      resourceId: savedUser.id,
      ipAddress,
    });

    return {
      message:
        'User registered successfully. Please check your email for verification.',
      userId: savedUser.id,
    };
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const { email, password, deviceId, deviceName } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new ForbiddenException(
        'Account is temporarily locked due to too many failed login attempts',
      );
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email address before logging in',
      );
    }

    // Check if account is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.userRepository.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null,
      });
    }

    // Check if MFA is enabled
    if (user.isTwoFactorEnabled) {
      // Generate temporary MFA token
      const mfaToken = await this.generateMfaToken(user.id);
      
      await this.auditService.log({
        userId: user.id,
        action: AuditAction.MFA_REQUIRED,
        resource: 'auth',
        details: { deviceId, deviceName },
        ipAddress,
        userAgent,
      });

      return {
        accessToken: '',
        refreshToken: '',
        user: this.sanitizeUser(user),
        expiresIn: 0,
        requiresMfa: true,
        mfaToken,
      };
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });

    // Limit concurrent sessions
    await this.limitConcurrentSessions(user.id);

    // Create session
    const session = await this.createSession(
      user.id,
      deviceId,
      deviceName,
      ipAddress,
      userAgent,
    );

    // Generate tokens with shorter expiry for security
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.flatMap((role) =>
        role.permissions.map((perm) => perm.name),
      ),
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
    const refreshToken = session.refreshToken;

    // Log the login
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      resource: 'auth',
      details: { deviceId, deviceName },
      ipAddress,
      userAgent,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  async refreshToken(refreshDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshDto;

    const session = await this.sessionRepository.findOne({
      where: { refreshToken, isActive: true },
      relations: ['user', 'user.roles', 'user.roles.permissions'],
    });

    if (!session || !session.isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = session.user;

    // Generate new tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: user.roles.flatMap((role) =>
        role.permissions.map((perm) => perm.name),
      ),
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: session.refreshToken,
      user: this.sanitizeUser(user),
      expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 3600),
    };
  }

  async logout(
    userId: string,
    sessionId: string,
  ): Promise<{ message: string }> {
    await this.sessionRepository.update(
      { id: sessionId, userId },
      { isActive: false },
    );

    await this.auditService.log({
      userId,
      action: AuditAction.USER_LOGOUT,
      resource: 'auth',
      sessionId,
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(email, user.firstName, resetToken, resetExpires);

    // Log the request
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      resource: 'user',
      resourceId: user.id,
      ipAddress,
    });

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password and clear reset token
    await this.userRepository.update(user.id, {
      password: newPassword, // Will be hashed by the entity hook
      passwordResetToken: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    // Invalidate all sessions
    await this.sessionRepository.update(
      { userId: user.id },
      { isActive: false },
    );

    // Log the password reset
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      resource: 'user',
      resourceId: user.id,
      ipAddress,
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    await this.userRepository.update(user.id, {
      password: newPassword, // Will be hashed by the entity hook
    });

    // Log the password change
    await this.auditService.log({
      userId,
      action: AuditAction.PASSWORD_CHANGED,
      resource: 'user',
      resourceId: userId,
      ipAddress,
    });

    return { message: 'Password changed successfully' };
  }

  // MFA Methods
  async setupMfa(userId: string): Promise<MfaSetupResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('MFA is already enabled for this user');
    }

    const secret = speakeasy.generateSecret({
      name: `TREUM AI Finance (${user.email})`,
      issuer: 'TREUM AI Finance',
      length: 32,
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    );

    // Store hashed backup codes
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10)),
    );

    await this.userRepository.update(userId, {
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: hashedBackupCodes,
      twoFactorStatus: TwoFactorStatus.PENDING_SETUP,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  async enableMfa(
    userId: string,
    token: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    const isValidToken = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) tolerance
    });

    if (!isValidToken) {
      throw new BadRequestException('Invalid MFA token');
    }

    await this.userRepository.update(userId, {
      twoFactorStatus: TwoFactorStatus.ENABLED,
    });

    await this.auditService.log({
      userId,
      action: AuditAction.MFA_ENABLED,
      resource: 'user',
      resourceId: userId,
      ipAddress,
    });

    return { message: 'MFA enabled successfully' };
  }

  async disableMfa(
    userId: string,
    token: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    const isValid = await this.validateMfaToken(user, token);
    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    await this.userRepository.update(userId, {
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorStatus: TwoFactorStatus.DISABLED,
    });

    // Invalidate all sessions for security
    await this.sessionRepository.update(
      { userId },
      { isActive: false },
    );

    await this.auditService.log({
      userId,
      action: AuditAction.MFA_DISABLED,
      resource: 'user',
      resourceId: userId,
      ipAddress,
    });

    return { message: 'MFA disabled successfully. Please login again.' };
  }

  async validateMfaToken(user: User, token: string): Promise<boolean> {
    if (!user.twoFactorSecret) {
      return false;
    }

    // Check TOTP token
    const isValidTOTP = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (isValidTOTP) {
      return true;
    }

    // Check backup codes if TOTP fails
    if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
      for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
        const isValidBackupCode = await bcrypt.compare(
          token,
          user.twoFactorBackupCodes[i],
        );
        if (isValidBackupCode) {
          // Remove used backup code
          user.twoFactorBackupCodes.splice(i, 1);
          await this.userRepository.save(user);
          return true;
        }
      }
    }

    return false;
  }

  async generateMfaToken(userId: string): Promise<string> {
    const mfaToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.MFA_TOKEN_EXPIRY);
    
    // Store MFA token temporarily (could use Redis in production)
    // For now, we'll store it in the user session
    const payload = {
      userId,
      type: 'mfa',
      exp: Math.floor(expiresAt.getTime() / 1000),
    };
    
    return this.jwtService.sign(payload, { expiresIn: '5m' });
  }

  async completeMfaLogin(
    mfaToken: string,
    totpToken: string,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResponse> {
    try {
      const decoded = this.jwtService.verify(mfaToken);
      if (decoded.type !== 'mfa') {
        throw new UnauthorizedException('Invalid MFA token');
      }

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isValidMfaToken = await this.validateMfaToken(user, totpToken);
      if (!isValidMfaToken) {
        throw new UnauthorizedException('Invalid MFA token');
      }

      // Create session and generate tokens
      const session = await this.createSession(
        user.id,
        deviceInfo.deviceId,
        deviceInfo.deviceName,
        deviceInfo.ipAddress,
        deviceInfo.userAgent,
      );

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.name),
        permissions: user.roles.flatMap((role) =>
          role.permissions.map((perm) => perm.name),
        ),
        sessionId: session.id,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      });

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.MFA_LOGIN_SUCCESS,
        resource: 'auth',
        sessionId: session.id,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
      });

      return {
        accessToken,
        refreshToken: session.refreshToken,
        user: this.sanitizeUser(user),
        expiresIn: 15 * 60, // 15 minutes in seconds
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired MFA token');
    }
  }

  // Session Management
  async limitConcurrentSessions(userId: string): Promise<void> {
    const activeSessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });

    if (activeSessions.length >= this.MAX_SESSIONS_PER_USER) {
      // Deactivate oldest sessions
      const sessionsToDeactivate = activeSessions.slice(
        this.MAX_SESSIONS_PER_USER - 1,
      );
      await this.sessionRepository.update(
        { id: In(sessionsToDeactivate.map(s => s.id)) },
        { isActive: false },
      );

      await this.auditService.log({
        userId,
        action: AuditAction.SESSIONS_LIMITED,
        resource: 'session',
        details: { deactivatedCount: sessionsToDeactivate.length },
      });
    }
  }

  async getAllUserSessions(userId: string): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async terminateSession(
    userId: string,
    sessionId: string,
    currentSessionId?: string,
  ): Promise<{ message: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId, isActive: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found or already terminated');
    }

    if (sessionId === currentSessionId) {
      throw new BadRequestException('Cannot terminate current session. Use logout instead.');
    }

    await this.sessionRepository.update(sessionId, { isActive: false });

    await this.auditService.log({
      userId,
      action: AuditAction.SESSION_TERMINATED,
      resource: 'session',
      resourceId: sessionId,
    });

    return { message: 'Session terminated successfully' };
  }

  async terminateAllOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<{ message: string; terminatedCount: number }> {
    const result = await this.sessionRepository.update(
      { userId, isActive: true, id: Not(currentSessionId) },
      { isActive: false },
    );

    await this.auditService.log({
      userId,
      action: AuditAction.ALL_OTHER_SESSIONS_TERMINATED,
      resource: 'session',
      details: { terminatedCount: result.affected },
    });

    return {
      message: 'All other sessions terminated successfully',
      terminatedCount: result.affected || 0,
    };
  }

  // Token Blacklist Management
  async blacklistToken(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (decoded && decoded.exp) {
        // Only blacklist if token hasn't expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp > now) {
          this.TOKEN_BLACKLIST.add(token);
        }
      }
    } catch (error) {
      // Token is malformed, ignore
    }
  }

  isTokenBlacklisted(token: string): boolean {
    return this.TOKEN_BLACKLIST.has(token);
  }

  // OAuth Integration Methods
  async handleOAuthCallback(
    provider: string,
    profile: any,
    ipAddress?: string,
  ): Promise<AuthResponse> {
    const { id: providerId, emails, displayName, name } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new BadRequestException('Email is required from OAuth provider');
    }

    // Check if user exists
    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      // Create new user from OAuth
      user = await this.createOAuthUser({
        email,
        firstName: name?.givenName || displayName?.split(' ')[0] || 'Unknown',
        lastName: name?.familyName || displayName?.split(' ')[1] || '',
        provider,
        providerId,
      });
    } else {
      // Update OAuth info for existing user
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      });
    }

    // Generate session and tokens
    const session = await this.createSession(
      user.id,
      crypto.randomUUID(),
      `${provider} OAuth`,
      ipAddress,
      `${provider} OAuth Client`,
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((role) => role.name) || [],
      permissions: user.roles?.flatMap((role) =>
        role.permissions?.map((perm) => perm.name) || [],
      ) || [],
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.OAUTH_LOGIN,
      resource: 'auth',
      details: { provider },
      ipAddress,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken: session.refreshToken,
      user: this.sanitizeUser(user),
      expiresIn: 15 * 60,
    };
  }

  private async createOAuthUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    providerId: string;
  }): Promise<User> {
    const { email, firstName, lastName, provider, providerId } = userData;

    // Assign default user role
    // Note: You'll need to ensure a 'basic_user' role exists
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
      emailVerified: true, // OAuth emails are considered verified
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    await this.auditService.log({
      userId: savedUser.id,
      action: AuditAction.OAUTH_USER_CREATED,
      resource: 'user',
      resourceId: savedUser.id,
      details: { provider, providerId },
    });

    return savedUser;
  }

  // Enhanced logout with token blacklisting
  async enhancedLogout(
    userId: string,
    sessionId: string,
    accessToken: string,
  ): Promise<{ message: string }> {
    // Blacklist the current access token
    await this.blacklistToken(accessToken);

    // Deactivate session
    await this.sessionRepository.update(
      { id: sessionId, userId },
      { isActive: false },
    );

    await this.auditService.log({
      userId,
      action: AuditAction.USER_LOGOUT,
      resource: 'auth',
      sessionId,
    });

    return { message: 'Logged out successfully' };
  }

  async verifyEmail(
    token: string,
    ipAddress?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (
      !user ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified
    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      status: UserStatus.ACTIVE,
    });

    // Log the verification
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.EMAIL_VERIFIED,
      resource: 'user',
      resourceId: user.id,
      ipAddress,
    });

    return { message: 'Email verified successfully' };
  }

  private async createSession(
    userId: string,
    deviceId?: string,
    deviceName?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserSession> {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      deviceId: deviceId || crypto.randomUUID(),
      deviceName,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return this.sessionRepository.save(session);
  }

  private async handleFailedLogin(
    user: User,
    ipAddress?: string,
  ): Promise<void> {
    const failedAttempts = user.failedLoginAttempts + 1;
    const updateData: Partial<User> = { failedLoginAttempts: failedAttempts };

    if (failedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + this.LOCKOUT_TIME);

      await this.auditService.log({
        userId: user.id,
        action: AuditAction.ACCOUNT_LOCKED,
        resource: 'user',
        resourceId: user.id,
        ipAddress,
      });
    }

    await this.userRepository.update(user.id, updateData);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.USER_LOGIN_FAILED,
      resource: 'auth',
      details: { failedAttempts },
      ipAddress,
    });
  }

  private sanitizeUser(user: User): Partial<User> {
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      emailVerificationToken,
      emailVerificationExpires,
      twoFactorSecret,
      ...sanitized
    } = user;
    // Ensure sensitive fields are not returned
    void password;
    void passwordResetToken;
    void passwordResetExpires;
    void emailVerificationToken;
    void emailVerificationExpires;
    void twoFactorSecret;
    return sanitized;
  }
}
