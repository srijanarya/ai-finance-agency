import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User, UserStatus } from '../entities/user.entity';
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
}

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

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

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });

    // Create session
    const session = await this.createSession(
      user.id,
      deviceId,
      deviceName,
      ipAddress,
      userAgent,
    );

    // Generate tokens
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
      expiresIn: this.configService.get<number>('JWT_EXPIRES_IN', 3600),
    };
  }

  async refreshToken(
    refreshDto: RefreshTokenDto,
    ipAddress?: string,
  ): Promise<AuthResponse> {
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
    await this.emailService.sendPasswordResetEmail(email, resetToken);

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
      password: _password,
      passwordResetToken: _passwordResetToken,
      passwordResetExpires: _passwordResetExpires,
      emailVerificationToken: _emailVerificationToken,
      emailVerificationExpires: _emailVerificationExpires,
      twoFactorSecret: _twoFactorSecret,
      ...sanitized
    } = user;
    return sanitized;
  }
}
