import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { User, UserStatus } from '../entities/user.entity';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import {
  UpdateBasicProfileDto,
  UpdateProfilePreferencesDto,
  ProfileResponseDto,
  ChangeEmailDto,
  ChangePasswordDto,
  UpdatePhoneDto,
  DeactivateAccountDto,
  ProfileStatsDto,
  ProfileActivityDto,
  NotificationPreferencesDto,
  TradingPreferencesDto,
} from '../dto/profile.dto';
import { AuditService } from './audit.service';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';

interface AvatarUploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface PasswordHistoryEntry {
  hash: string;
  createdAt: Date;
}

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads/avatars';
  private readonly maxAvatarSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly passwordHistoryLimit = 10; // Remember last 10 passwords

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
    private readonly auditLogService: AuditService,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.ensureUploadDirectory();
  }

  /**
   * Get user profile with complete information
   */
  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Extract permissions from roles
    const permissions = user.roles.reduce((acc, role) => {
      const rolePermissions = role.permissions?.map(p => p.name) || [];
      return [...acc, ...rolePermissions];
    }, []);

    const response: ProfileResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth?.toISOString().split('T')[0],
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      status: user.status,
      kycStatus: user.kycStatus,
      twoFactorStatus: user.twoFactorStatus,
      timezone: user.timezone,
      language: user.language,
      newsletterSubscribed: user.newsletterSubscribed,
      notificationsEnabled: user.notificationsEnabled,
      marketingEmailsEnabled: user.marketingEmailsEnabled,
      riskScore: user.riskScore,
      lastActivityAt: user.lastActivityAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.roles.map(role => role.name),
      permissions: [...new Set(permissions)], // Remove duplicates
    };

    // Add extended profile data if available
    const extendedProfile = await this.getExtendedProfileData(userId);
    if (extendedProfile) {
      response.preferences = extendedProfile;
    }

    return response;
  }

  /**
   * Update basic profile information
   */
  async updateBasicProfile(
    userId: string,
    updateData: UpdateBasicProfileDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate date of birth if provided
    if (updateData.dateOfBirth) {
      const dob = new Date(updateData.dateOfBirth);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      
      if (age < 13 || age > 120) {
        throw new BadRequestException('Invalid date of birth');
      }
    }

    // Update user fields
    Object.assign(user, {
      ...updateData,
      dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : user.dateOfBirth,
    });

    await this.userRepository.save(user);

    // Log the update
    await this.auditLogService.log({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      resource: 'user_profile',
      description: 'Basic profile information updated',
      ipAddress,
      userAgent,
      metadata: {
        updatedFields: Object.keys(updateData),
      },
    });

    // Emit profile updated event
    this.eventEmitter.emit('profile.updated', {
      userId,
      changes: updateData,
      timestamp: new Date(),
    });

    return this.getProfile(userId);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: UpdateProfilePreferencesDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update basic preferences on user entity
    if (preferences.timezone) user.timezone = preferences.timezone;
    if (preferences.language) user.language = preferences.language;
    if (preferences.emailNotifications !== undefined) {
      user.notificationsEnabled = preferences.emailNotifications;
    }
    if (preferences.marketingEmails !== undefined) {
      user.marketingEmailsEnabled = preferences.marketingEmails;
    }
    if (preferences.newsletter !== undefined) {
      user.newsletterSubscribed = preferences.newsletter;
    }

    await this.userRepository.save(user);

    // Store extended preferences in metadata
    await this.storeExtendedProfileData(userId, preferences);

    // Log the update
    await this.auditLogService.log({
      userId,
      action: AuditAction.PREFERENCES_UPDATED,
      resource: 'user_preferences',
      description: 'User preferences updated',
      ipAddress,
      userAgent,
      metadata: {
        updatedPreferences: Object.keys(preferences),
      },
    });

    // Emit preferences updated event
    this.eventEmitter.emit('preferences.updated', {
      userId,
      preferences,
      timestamp: new Date(),
    });

    return this.getProfile(userId);
  }

  /**
   * Upload and update user avatar
   */
  async updateAvatar(
    userId: string,
    avatarData: string | Buffer,
    mimeType: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ avatarUrl: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate image type
    if (!this.allowedImageTypes.includes(mimeType)) {
      throw new BadRequestException('Invalid image type. Allowed types: ' + 
        this.allowedImageTypes.join(', '));
    }

    let imageBuffer: Buffer;

    // Handle base64 encoded data
    if (typeof avatarData === 'string') {
      if (avatarData.startsWith('data:')) {
        const base64Data = avatarData.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        imageBuffer = Buffer.from(avatarData, 'base64');
      }
    } else {
      imageBuffer = avatarData;
    }

    // Validate file size
    if (imageBuffer.length > this.maxAvatarSize) {
      throw new BadRequestException(`File too large. Maximum size: ${this.maxAvatarSize / 1024 / 1024}MB`);
    }

    // Generate unique filename
    const fileExtension = this.getFileExtension(mimeType);
    const fileName = `${userId}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      // Delete old avatar if exists
      if (user.profilePicture) {
        await this.deleteOldAvatar(user.profilePicture);
      }

      // Save new avatar
      await fs.writeFile(filePath, imageBuffer);

      // Update user profile picture path
      const avatarUrl = `/uploads/avatars/${fileName}`;
      user.profilePicture = avatarUrl;
      await this.userRepository.save(user);

      // Log the update
      await this.auditLogService.log({
        userId,
        action: AuditAction.PROFILE_PICTURE_UPDATED,
        resource: 'user_avatar',
        description: 'Profile picture updated',
        ipAddress,
        userAgent,
        metadata: {
          fileName,
          fileSize: imageBuffer.length,
          mimeType,
        },
      });

      // Emit avatar updated event
      this.eventEmitter.emit('avatar.updated', {
        userId,
        avatarUrl,
        timestamp: new Date(),
      });

      return { avatarUrl };
    } catch (error) {
      this.logger.error(`Failed to upload avatar for user ${userId}: ${error.message}`);
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  /**
   * Change user email address
   */
  async changeEmail(
    userId: string,
    changeEmailDto: ChangeEmailDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(changeEmailDto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Check if new email is already in use
    const existingUser = await this.userRepository.findOne({
      where: { email: changeEmailDto.newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Email address is already in use');
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store new email and verification token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    
    // Don't change email immediately - require verification first
    await this.userRepository.save(user);

    // Send verification email to new address
    await this.emailService.sendEmailChangeVerification(
      changeEmailDto.newEmail,
      user.firstName,
      verificationToken
    );

    // Log the email change request
    await this.auditLogService.log({
      userId,
      action: AuditAction.EMAIL_VERIFICATION_SENT,
      resource: 'user_email',
      description: 'Email change requested',
      ipAddress,
      userAgent,
      metadata: {
        oldEmail: user.email,
        newEmail: changeEmailDto.newEmail,
      },
    });

    // Emit email change requested event
    this.eventEmitter.emit('email.change.requested', {
      userId,
      oldEmail: user.email,
      newEmail: changeEmailDto.newEmail,
      timestamp: new Date(),
    });

    return {
      message: 'Verification email sent to new address',
      verificationRequired: true,
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Check if passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Check if new password is different from current
    const isSamePassword = await user.validatePassword(changePasswordDto.newPassword);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Check password history to prevent reuse
    const passwordHistory = await this.getPasswordHistory(userId);
    for (const oldPassword of passwordHistory) {
      const isSameAsOld = await user.validatePassword(changePasswordDto.newPassword);
      if (isSameAsOld) {
        throw new BadRequestException('Cannot reuse a recent password');
      }
    }

    // Add current password to history before changing
    await this.addToPasswordHistory(userId, user.password);

    // Update password
    user.password = changePasswordDto.newPassword; // Will be hashed by entity hook
    user.passwordChangedAt = new Date();
    
    // Reset failed login attempts and unlock account if locked
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);

    // Revoke all existing sessions except current one (force re-login)
    // This could be implemented based on current session context

    // Log the password change
    await this.auditLogService.log({
      userId,
      action: AuditAction.PASSWORD_CHANGED,
      resource: 'user_password',
      description: 'Password changed successfully',
      ipAddress,
      userAgent,
    });

    // Send notification email
    await this.emailService.sendPasswordChangeNotification(user.email, user.firstName);

    // Emit password changed event
    this.eventEmitter.emit('password.changed', {
      userId,
      timestamp: new Date(),
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Update phone number
   */
  async updatePhone(
    userId: string,
    updatePhoneDto: UpdatePhoneDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if phone number is already in use
    const existingUser = await this.userRepository.findOne({
      where: { phone: updatePhoneDto.phoneNumber },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Phone number is already in use');
    }

    // Generate verification code
    const verificationCode = this.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new phone and verification details
    user.phone = updatePhoneDto.phoneNumber;
    user.phoneVerified = false;
    user.phoneVerificationToken = verificationCode;
    user.phoneVerificationExpires = verificationExpires;

    await this.userRepository.save(user);

    // Send SMS verification code
    await this.notificationService.sendSmsVerification(
      updatePhoneDto.phoneNumber,
      verificationCode
    );

    // Log the phone update
    await this.auditLogService.log({
      userId,
      action: AuditAction.PHONE_VERIFIED,
      resource: 'user_phone',
      description: 'Phone number updated, verification required',
      ipAddress,
      userAgent,
      metadata: {
        phoneNumber: updatePhoneDto.phoneNumber,
      },
    });

    return {
      message: 'Verification code sent to new phone number',
      verificationRequired: true,
    };
  }

  /**
   * Get user profile statistics
   */
  async getProfileStats(userId: string): Promise<ProfileStatsDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['sessions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Count total logins from audit logs
    const totalLogins = await this.auditLogRepository.count({
      where: {
        userId,
        action: AuditAction.USER_LOGIN,
      },
    });

    // Count active sessions
    const activeSessions = await this.sessionRepository.count({
      where: {
        userId,
        isActive: true,
        status: SessionStatus.ACTIVE,
      },
    });

    // Calculate profile completion
    const profileCompletion = this.calculateProfileCompletion(user);

    // Calculate security score
    const securityScore = this.calculateSecurityScore(user);

    return {
      accountAge,
      totalLogins,
      lastLogin: user.lastLoginAt,
      profileCompletion,
      activeSessions,
      securityScore,
      kycCompleted: user.isKycCompleted,
      twoFactorEnabled: user.isTwoFactorEnabled,
    };
  }

  /**
   * Get user activity history
   */
  async getProfileActivity(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ activities: ProfileActivityDto[]; total: number; page: number; limit: number }> {
    const [activities, total] = await this.auditLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const activityDtos: ProfileActivityDto[] = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      description: activity.description,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      location: activity.country && activity.city ? `${activity.city}, ${activity.country}` : activity.country || 'Unknown',
      createdAt: activity.createdAt,
      metadata: activity.metadata,
    }));

    return {
      activities: activityDtos,
      total,
      page,
      limit,
    };
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(
    userId: string,
    deactivateDto: DeactivateAccountDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(deactivateDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Deactivate user
    user.deactivate(deactivateDto.reason);
    await this.userRepository.save(user);

    // Revoke all sessions
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false, status: SessionStatus.REVOKED, revokedAt: new Date(), revokedBy: userId }
    );

    // Log the deactivation
    await this.auditLogService.log({
      userId,
      action: AuditAction.USER_DEACTIVATED,
      resource: 'user_account',
      description: 'Account deactivated by user',
      ipAddress,
      userAgent,
      metadata: {
        reason: deactivateDto.reason,
        feedback: deactivateDto.feedback,
      },
    });

    // Send confirmation email
    await this.emailService.sendAccountDeactivationConfirmation(user.email, user.firstName);

    // Emit account deactivated event
    this.eventEmitter.emit('account.deactivated', {
      userId,
      reason: deactivateDto.reason,
      feedback: deactivateDto.feedback,
      timestamp: new Date(),
    });

    return { message: 'Account deactivated successfully' };
  }

  /**
   * Validate profile data
   */
  async validateProfile(userId: string): Promise<ProfileValidationResult> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validations
    if (!user.firstName) errors.push('First name is required');
    if (!user.lastName) errors.push('Last name is required');
    if (!user.emailVerified) errors.push('Email verification is required');

    // Security validations
    if (!user.isTwoFactorEnabled) warnings.push('Two-factor authentication is not enabled');
    if (!user.phoneVerified && user.phone) warnings.push('Phone number is not verified');

    // KYC validations for trading
    if (!user.isKycCompleted) warnings.push('KYC verification is incomplete');

    // Profile completeness warnings
    if (!user.phone) warnings.push('Phone number is not provided');
    if (!user.dateOfBirth) warnings.push('Date of birth is not provided');
    if (!user.profilePicture) warnings.push('Profile picture is not uploaded');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Private helper methods

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  private getFileExtension(mimeType: string): string {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    return extensions[mimeType] || 'jpg';
  }

  private async deleteOldAvatar(avatarPath: string): Promise<void> {
    try {
      const fileName = path.basename(avatarPath);
      const fullPath = path.join(this.uploadPath, fileName);
      await fs.unlink(fullPath);
    } catch (error) {
      this.logger.warn(`Failed to delete old avatar: ${error.message}`);
    }
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private calculateProfileCompletion(user: User): number {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'profilePicture',
    ];

    const completedFields = fields.filter(field => user[field]).length;
    const additionalScores = {
      emailVerified: user.emailVerified ? 10 : 0,
      phoneVerified: user.phoneVerified ? 10 : 0,
      kycCompleted: user.isKycCompleted ? 15 : 0,
      twoFactorEnabled: user.isTwoFactorEnabled ? 15 : 0,
    };

    const baseScore = (completedFields / fields.length) * 50;
    const bonusScore = Object.values(additionalScores).reduce((sum, score) => sum + score, 0);

    return Math.min(100, Math.round(baseScore + bonusScore));
  }

  private calculateSecurityScore(user: User): number {
    let score = 0;

    // Email verification (20 points)
    if (user.emailVerified) score += 20;

    // Phone verification (15 points)
    if (user.phoneVerified) score += 15;

    // Two-factor authentication (25 points)
    if (user.isTwoFactorEnabled) score += 25;

    // KYC completion (20 points)
    if (user.isKycCompleted) score += 20;

    // Password age (10 points if changed recently)
    if (user.passwordChangedAt) {
      const daysSinceChange = (Date.now() - user.passwordChangedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceChange < 90) score += 10;
    }

    // Account not locked (10 points)
    if (!user.isLocked) score += 10;

    return Math.min(100, score);
  }

  private async getExtendedProfileData(userId: string): Promise<any> {
    // This would typically be stored in a separate table or document store
    // For now, we'll return null - implement based on your extended data storage strategy
    return null;
  }

  private async storeExtendedProfileData(userId: string, data: any): Promise<void> {
    // Store extended profile data in a separate table or document store
    // Implementation depends on your data storage strategy
  }

  private async getPasswordHistory(userId: string): Promise<PasswordHistoryEntry[]> {
    // This would be stored in a separate password history table
    // For now, return empty array - implement based on your security requirements
    return [];
  }

  private async addToPasswordHistory(userId: string, passwordHash: string): Promise<void> {
    // Add password to history and clean up old entries
    // Implementation depends on your password history storage strategy
  }
}