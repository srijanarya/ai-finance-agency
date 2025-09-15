import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { UserSession } from '../entities/user-session.entity';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetTokenDto,
  PasswordStrengthDto,
  SetSecurityQuestionsDto,
  AnswerSecurityQuestionsDto,
  AdminPasswordResetDto,
  BulkPasswordResetDto,
  PasswordRecoveryResponseDto,
  ResetPasswordResponseDto,
  TokenVerificationResponseDto,
  PasswordStrengthResponseDto,
  PasswordHistoryResponseDto,
  RecoveryAttemptsDto,
} from '../dto/password-recovery.dto';
import { AuditService } from './audit.service';
import { AuditAction } from '../entities/audit-log.entity';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';

interface PasswordHistoryEntry {
  hash: string;
  createdAt: Date;
  strengthScore?: number;
}

interface RecoveryAttempt {
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  method: 'email' | 'security_questions' | 'admin_reset';
  reason?: string;
}

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigits: boolean;
  requireSpecialChars: boolean;
  minCharacterClasses: number;
  disallowCommonPasswords: boolean;
  disallowPersonalInfo: boolean;
  forbiddenPatterns: string[];
  historyLength: number;
  minAge: number;
  maxAge: number;
}

interface SecurityQuestion {
  id: string;
  question: string;
  answerHash: string;
  createdAt: Date;
}

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);
  
  // Configuration constants
  private readonly defaultTokenExpirationMinutes = 60; // 1 hour
  private readonly maxAttemptsPerDay = 5;
  private readonly cooldownMinutes = 15;
  private readonly passwordHistoryLimit = 10;
  private readonly adminOverrideEnabled = true;

  // Common passwords list (subset for example)
  private readonly commonPasswords = new Set([
    '123456', 'password', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'hello', 'iloveyou', 'sunshine',
  ]);

  private readonly defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireDigits: true,
    requireSpecialChars: true,
    minCharacterClasses: 3,
    disallowCommonPasswords: true,
    disallowPersonalInfo: true,
    forbiddenPatterns: ['12345', 'abcde', 'password', 'qwerty'],
    historyLength: 10,
    minAge: 0,
    maxAge: 90,
  };

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    private readonly auditLogService: AuditService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initiate password reset process
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<PasswordRecoveryResponseDto> {
    const { email, ipAddress, userAgent } = forgotPasswordDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    
    // For security, always return success message even if user doesn't exist
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      
      // Log the attempt for security monitoring
      await this.auditLogService.log({
        userId: null,
        action: AuditAction.PASSWORD_RESET_FAILED,
        resource: 'password_recovery',
        description: 'Password reset requested for non-existent email',
        ipAddress,
        userAgent,
        metadata: { email, success: false, reason: 'user_not_found' },
      });

      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Check rate limiting
    const rateLimitCheck = await this.checkRateLimit(user.id, ipAddress);
    if (!rateLimitCheck.allowed) {
      throw new HttpException(
        `Too many password reset attempts. Try again in ${rateLimitCheck.cooldownSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Generate secure reset token
    const resetToken = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + this.defaultTokenExpirationMinutes * 60 * 1000);

    // Store reset token with user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expiresAt;
    await this.userRepository.save(user);

    // Record recovery attempt
    await this.recordRecoveryAttempt(user.id, {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success: true,
      method: 'email',
    });

    // Send reset email
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken,
      expiresAt
    );

    // Log the attempt
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_REQUESTED,
      resource: 'password_recovery',
      description: 'Password reset token generated and sent',
      ipAddress,
      userAgent,
      metadata: {
        email,
        tokenExpiresAt: expiresAt.toISOString(),
        method: 'email',
      },
    });

    // Emit password reset initiated event
    this.eventEmitter.emit('password.reset.initiated', {
      userId: user.id,
      email: user.email,
      method: 'email',
      ipAddress,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Password reset instructions have been sent to your email address.',
      expiresAt,
      attemptsRemaining: this.maxAttemptsPerDay - rateLimitCheck.attemptsToday,
    };
  }

  /**
   * Verify password reset token
   */
  async verifyResetToken(
    verifyTokenDto: VerifyResetTokenDto,
  ): Promise<TokenVerificationResponseDto> {
    const { token } = verifyTokenDto;

    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return {
        valid: false,
        message: 'Invalid or expired reset token',
      };
    }

    // Check if token is expired
    if (user.isPasswordResetExpired) {
      // Clean up expired token
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.userRepository.save(user);

      return {
        valid: false,
        message: 'Reset token has expired',
      };
    }

    const timeRemaining = user.passwordResetExpires 
      ? Math.max(0, Math.floor((user.passwordResetExpires.getTime() - Date.now()) / 1000))
      : 0;

    return {
      valid: true,
      message: 'Reset token is valid',
      expiresAt: user.passwordResetExpires!,
      email: user.email,
      timeRemaining,
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ResetPasswordResponseDto> {
    const { token, newPassword, confirmPassword, revokeAllSessions } = resetPasswordDto;

    // Verify passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user by reset token
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      await this.recordFailedResetAttempt(null, token, ipAddress, userAgent, 'invalid_token');
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token is expired
    if (user.isPasswordResetExpired) {
      await this.recordFailedResetAttempt(user.id, token, ipAddress, userAgent, 'token_expired');
      
      // Clean up expired token
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.userRepository.save(user);
      
      throw new BadRequestException('Reset token has expired');
    }

    // Validate password strength and policy
    const passwordValidation = await this.validatePasswordPolicy(newPassword, user);
    if (!passwordValidation.valid) {
      throw new BadRequestException(`Password policy violation: ${passwordValidation.reasons.join(', ')}`);
    }

    // Check password history to prevent reuse
    const passwordHistory = await this.getPasswordHistoryInternal(user.id);
    for (const oldPassword of passwordHistory) {
      const isSameAsOld = await bcrypt.compare(newPassword, oldPassword.hash);
      if (isSameAsOld) {
        throw new BadRequestException(
          `Cannot reuse any of the last ${this.passwordHistoryLimit} passwords`
        );
      }
    }

    // Add current password to history before changing
    if (user.password) {
      await this.addToPasswordHistory(user.id, user.password);
    }

    // Update password
    const oldPasswordHash = user.password;
    user.password = newPassword; // Will be hashed by entity hook
    user.passwordChangedAt = new Date();
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    
    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);

    // Revoke all sessions if requested
    let revokedSessionsCount = 0;
    if (revokeAllSessions) {
      const activeSessions = await this.sessionRepository.find({
        where: { userId: user.id, isActive: true },
      });

      for (const session of activeSessions) {
        session.revoke(user.id, 'Password reset - all sessions revoked');
      }

      if (activeSessions.length > 0) {
        await this.sessionRepository.save(activeSessions);
        revokedSessionsCount = activeSessions.length;
      }
    }

    // Record successful reset attempt
    await this.recordRecoveryAttempt(user.id, {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success: true,
      method: 'email',
    });

    // Calculate password strength
    const passwordStrength = this.calculatePasswordStrength(newPassword);

    // Log the password reset
    await this.auditLogService.log({
      userId: user.id,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      resource: 'password_recovery',
      description: 'Password successfully reset using token',
      ipAddress,
      userAgent,
      metadata: {
        email: user.email,
        passwordStrength: passwordStrength.score,
        revokedSessions: revokedSessionsCount,
        method: 'email',
      },
    });

    // Send confirmation email
    await this.emailService.sendPasswordResetConfirmation(
      user.email,
      user.firstName,
      new Date(),
      ipAddress
    );

    // Emit password reset completed event
    this.eventEmitter.emit('password.reset.completed', {
      userId: user.id,
      email: user.email,
      method: 'email',
      revokedSessions: revokedSessionsCount,
      passwordStrength: passwordStrength.score,
      ipAddress,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Password has been reset successfully',
      revokedSessions: revokedSessionsCount,
      requiresLogin: true,
      passwordStrength: passwordStrength.score,
    };
  }

  /**
   * Check password strength
   */
  async checkPasswordStrength(
    passwordStrengthDto: PasswordStrengthDto,
  ): Promise<PasswordStrengthResponseDto> {
    const { password } = passwordStrengthDto;
    return this.calculatePasswordStrength(password);
  }

  /**
   * Set security questions for user
   */
  async setSecurityQuestions(
    userId: string,
    securityQuestionsDto: SetSecurityQuestionsDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate questions and answers
    const questions = securityQuestionsDto.questions;
    if (questions.length < 3) {
      throw new BadRequestException('At least 3 security questions are required');
    }

    // Hash the answers
    const hashedQuestions: SecurityQuestion[] = [];
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (question.answer.length < 2) {
        throw new BadRequestException(`Answer ${i + 1} is too short`);
      }

      const answerHash = await bcrypt.hash(question.answer.toLowerCase().trim(), 12);
      hashedQuestions.push({
        id: crypto.randomUUID(),
        question: question.question,
        answerHash,
        createdAt: new Date(),
      });
    }

    // Store security questions (in a real implementation, this would be in a separate table)
    // For now, we'll store in user metadata or a JSON field
    const securityQuestionsData = {
      questions: hashedQuestions,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    };

    // In a real implementation, you would save this to a separate security_questions table
    // For this example, we'll assume it's stored in user metadata
    
    // Log the action
    await this.auditLogService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      resource: 'password_recovery',
      description: 'Security questions configured',
      ipAddress,
      userAgent,
      metadata: {
        questionCount: questions.length,
      },
    });

    return {
      success: true,
      message: 'Security questions have been set successfully',
    };
  }

  /**
   * Admin password reset
   */
  async adminPasswordReset(
    adminPasswordResetDto: AdminPasswordResetDto,
    adminUserId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ResetPasswordResponseDto> {
    const {
      userId,
      reason,
      temporaryPassword,
      forceChangeOnLogin,
      revokeAllSessions,
      sendNotification,
    } = adminPasswordResetDto;

    // Get target user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get admin user
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId },
      relations: ['roles'],
    });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    // Verify admin permissions
    if (!admin.hasRole('admin') && !admin.hasRole('super_admin')) {
      throw new UnauthorizedException('Insufficient privileges for admin password reset');
    }

    // Generate temporary password if not provided
    let newPassword = temporaryPassword;
    if (!newPassword) {
      newPassword = this.generateTemporaryPassword();
    }

    // Validate password if provided
    if (temporaryPassword) {
      const passwordValidation = await this.validatePasswordPolicy(temporaryPassword, user);
      if (!passwordValidation.valid) {
        throw new BadRequestException(`Password policy violation: ${passwordValidation.reasons.join(', ')}`);
      }
    }

    // Add current password to history
    if (user.password) {
      await this.addToPasswordHistory(user.id, user.password);
    }

    // Update password
    user.password = newPassword; // Will be hashed by entity hook
    user.passwordChangedAt = new Date();
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    // Force password change on next login if requested
    if (forceChangeOnLogin) {
      // Set a flag to force password change (implementation depends on your auth flow)
      // user.mustChangePassword = true;
    }

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);

    // Revoke all sessions if requested
    let revokedSessionsCount = 0;
    if (revokeAllSessions) {
      const activeSessions = await this.sessionRepository.find({
        where: { userId: user.id, isActive: true },
      });

      for (const session of activeSessions) {
        session.revoke(adminUserId, 'Admin password reset - all sessions revoked');
      }

      if (activeSessions.length > 0) {
        await this.sessionRepository.save(activeSessions);
        revokedSessionsCount = activeSessions.length;
      }
    }

    // Record recovery attempt
    await this.recordRecoveryAttempt(user.id, {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success: true,
      method: 'admin_reset',
      reason,
    });

    // Log the admin reset
    await this.auditLogService.log({
      userId: adminUserId,
      action: AuditAction.PASSWORD_RESET_COMPLETED,
      resource: 'password_recovery',
      description: 'Password reset by administrator',
      ipAddress,
      userAgent,
      metadata: {
        targetUserId: userId,
        targetEmail: user.email,
        reason,
        temporaryPasswordProvided: !!temporaryPassword,
        forceChangeOnLogin,
        revokedSessions: revokedSessionsCount,
        sendNotification,
      },
    });

    // Send notification email if requested
    if (sendNotification) {
      await this.emailService.sendAdminPasswordResetNotification(
        user.email,
        user.firstName,
        admin.fullName,
        temporaryPassword ? undefined : newPassword, // Only send password if generated
        forceChangeOnLogin
      );
    }

    // Emit admin password reset event
    this.eventEmitter.emit('password.reset.admin', {
      userId: user.id,
      adminUserId,
      email: user.email,
      reason,
      revokedSessions: revokedSessionsCount,
      temporaryPassword: !temporaryPassword,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: temporaryPassword 
        ? 'Password has been reset by administrator'
        : 'Temporary password has been generated and sent to user',
      revokedSessions: revokedSessionsCount,
      requiresLogin: true,
    };
  }

  /**
   * Get password history for user
   */
  async getPasswordHistory(userId: string): Promise<PasswordHistoryResponseDto> {
    // In a real implementation, this would query a separate password_history table
    // For this example, we'll return a placeholder
    const history = await this.getPasswordHistoryInternal(userId);

    return {
      totalPasswords: history.length,
      history: history.map(entry => ({
        createdAt: entry.createdAt,
        isCurrentPassword: false, // Would need to compare with current password
        strengthScore: entry.strengthScore,
      })),
      averageStrength: history.reduce((sum, entry) => sum + (entry.strengthScore || 0), 0) / history.length || 0,
    };
  }

  /**
   * Get recovery attempts for user
   */
  async getRecoveryAttempts(userId: string): Promise<RecoveryAttemptsDto> {
    // In a real implementation, this would query a recovery_attempts table
    // For this example, we'll return a placeholder
    const attempts = await this.getRecoveryAttemptsInternal(userId);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > oneDayAgo);
    const successfulAttempts = attempts.filter(attempt => attempt.success).length;
    const failedAttempts = attempts.length - successfulAttempts;

    return {
      userId,
      totalAttempts: attempts.length,
      successfulAttempts,
      failedAttempts,
      recentAttempts: recentAttempts.length,
      lastAttemptAt: attempts.length > 0 ? attempts[0].timestamp : undefined,
      isLockedOut: false, // Would check actual lockout status
      attempts: attempts.slice(0, 20), // Return last 20 attempts
    };
  }

  // Private helper methods

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateTemporaryPassword(): string {
    // Generate a secure temporary password
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    
    // Ensure at least one character from each required class
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    const allChars = uppercase + lowercase + digits + symbols;
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private calculatePasswordStrength(password: string): PasswordStrengthResponseDto {
    let score = 0;
    const missingRequirements: string[] = [];
    const suggestions: string[] = [];

    // Length check
    if (password.length < 8) {
      missingRequirements.push('At least 8 characters');
    } else if (password.length >= 8) {
      score += 20;
    }

    if (password.length >= 12) {
      score += 10;
    }

    // Character class checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigits = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUppercase) missingRequirements.push('Uppercase letters');
    else score += 15;

    if (!hasLowercase) missingRequirements.push('Lowercase letters');
    else score += 15;

    if (!hasDigits) missingRequirements.push('Numbers');
    else score += 15;

    if (!hasSpecialChars) missingRequirements.push('Special characters');
    else score += 15;

    // Complexity bonus
    const charClasses = [hasUppercase, hasLowercase, hasDigits, hasSpecialChars].filter(Boolean).length;
    if (charClasses >= 3) score += 10;

    // Common password check
    if (this.commonPasswords.has(password.toLowerCase())) {
      score = Math.max(0, score - 50);
      suggestions.push('Avoid common passwords');
    }

    // Pattern checks
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      suggestions.push('Avoid repeating characters');
    }

    if (/123|abc|qwe/i.test(password)) {
      score -= 15;
      suggestions.push('Avoid sequential characters');
    }

    // Calculate entropy (simplified)
    const uniqueChars = new Set(password).size;
    const entropy = Math.log2(Math.pow(uniqueChars, password.length));

    // Determine label
    let label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
    if (score < 20) label = 'Very Weak';
    else if (score < 40) label = 'Weak';
    else if (score < 60) label = 'Fair';
    else if (score < 80) label = 'Good';
    else if (score < 95) label = 'Strong';
    else label = 'Very Strong';

    // Estimate crack time (simplified)
    let estimatedCrackTime: string;
    if (score < 20) estimatedCrackTime = 'Instantly';
    else if (score < 40) estimatedCrackTime = 'Minutes';
    else if (score < 60) estimatedCrackTime = 'Hours';
    else if (score < 80) estimatedCrackTime = 'Days';
    else if (score < 95) estimatedCrackTime = 'Years';
    else estimatedCrackTime = 'Centuries';

    // Add suggestions based on missing requirements
    if (missingRequirements.length > 0) {
      suggestions.push(`Add ${missingRequirements.join(', ').toLowerCase()}`);
    }

    if (password.length < 12) {
      suggestions.push('Use at least 12 characters for better security');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      label,
      meetsRequirements: missingRequirements.length === 0 && score >= 60,
      missingRequirements,
      suggestions,
      estimatedCrackTime,
      entropy: Math.round(entropy),
    };
  }

  private async validatePasswordPolicy(password: string, user: User): Promise<{
    valid: boolean;
    reasons: string[];
  }> {
    const policy = this.defaultPasswordPolicy;
    const reasons: string[] = [];

    // Length checks
    if (password.length < policy.minLength) {
      reasons.push(`Password must be at least ${policy.minLength} characters long`);
    }
    if (password.length > policy.maxLength) {
      reasons.push(`Password must be no more than ${policy.maxLength} characters long`);
    }

    // Character class requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      reasons.push('Password must contain at least one uppercase letter');
    }
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      reasons.push('Password must contain at least one lowercase letter');
    }
    if (policy.requireDigits && !/\d/.test(password)) {
      reasons.push('Password must contain at least one digit');
    }
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      reasons.push('Password must contain at least one special character');
    }

    // Common password check
    if (policy.disallowCommonPasswords && this.commonPasswords.has(password.toLowerCase())) {
      reasons.push('Password is too common and not allowed');
    }

    // Personal information check
    if (policy.disallowPersonalInfo) {
      const personalInfo = [
        user.firstName?.toLowerCase(),
        user.lastName?.toLowerCase(),
        user.email?.split('@')[0]?.toLowerCase(),
      ].filter(Boolean);

      for (const info of personalInfo) {
        if (info && password.toLowerCase().includes(info)) {
          reasons.push('Password must not contain personal information');
          break;
        }
      }
    }

    // Forbidden patterns check
    for (const pattern of policy.forbiddenPatterns) {
      if (password.toLowerCase().includes(pattern.toLowerCase())) {
        reasons.push(`Password must not contain forbidden pattern: ${pattern}`);
      }
    }

    return {
      valid: reasons.length === 0,
      reasons,
    };
  }

  private async checkRateLimit(userId: string, ipAddress?: string): Promise<{
    allowed: boolean;
    attemptsToday: number;
    cooldownSeconds: number;
  }> {
    // In a real implementation, this would check actual rate limiting
    // For this example, we'll return a placeholder
    return {
      allowed: true,
      attemptsToday: 0,
      cooldownSeconds: 0,
    };
  }

  private async recordRecoveryAttempt(userId: string, attempt: RecoveryAttempt): Promise<void> {
    // In a real implementation, this would store the attempt in a database table
    // For this example, we'll just log it
    this.logger.debug(`Recovery attempt recorded for user ${userId}:`, attempt);
  }

  private async recordFailedResetAttempt(
    userId: string | null,
    token: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.auditLogService.log({
      userId,
      action: AuditAction.PASSWORD_RESET_FAILED,
      resource: 'password_recovery',
      description: 'Failed password reset attempt',
      ipAddress,
      userAgent,
      metadata: {
        token: token.substring(0, 8) + '...', // Partial token for security
        reason,
      },
    });
  }

  private async getPasswordHistoryInternal(userId: string): Promise<PasswordHistoryEntry[]> {
    // In a real implementation, this would query a password_history table
    // For this example, we'll return an empty array
    return [];
  }

  private async addToPasswordHistory(userId: string, passwordHash: string): Promise<void> {
    // In a real implementation, this would add the password to a password_history table
    // and clean up old entries beyond the history limit
    this.logger.debug(`Adding password to history for user ${userId}`);
  }

  private async getRecoveryAttemptsInternal(userId: string): Promise<RecoveryAttempt[]> {
    // In a real implementation, this would query a recovery_attempts table
    // For this example, we'll return an empty array
    return [];
  }
}