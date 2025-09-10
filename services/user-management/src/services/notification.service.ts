import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuditAction } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
}

export enum NotificationType {
  KYC_SUBMITTED = 'kyc_submitted',
  KYC_APPROVED = 'kyc_approved',
  KYC_REJECTED = 'kyc_rejected',
  KYC_EXPIRED = 'kyc_expired',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_VERIFIED = 'document_verified',
  DOCUMENT_REJECTED = 'document_rejected',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  PASSWORD_CHANGED = 'password_changed',
  LOGIN_SUSPICIOUS = 'login_suspicious',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  PROFILE_UPDATED = 'profile_updated',
  GENERAL = 'general',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async sendNotification(
    notificationData: NotificationData,
  ): Promise<NotificationResult[]> {
    const user = await this.userRepository.findOne({
      where: { id: notificationData.userId },
    });

    if (!user) {
      return [
        {
          success: false,
          channel: NotificationChannel.EMAIL,
          error: 'User not found',
        },
      ];
    }

    const channels =
      notificationData.channels ||
      this.getDefaultChannels(notificationData.type);
    const results: NotificationResult[] = [];

    for (const channel of channels) {
      try {
        const result = await this.sendViaChannel(
          channel,
          user,
          notificationData,
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log notification attempt
    await this.auditService.log({
      userId: notificationData.userId,
      action: AuditAction.NOTIFICATION_SENT,
      resource: 'notification',
      details: {
        type: notificationData.type,
        channels: channels,
        success: results.some((r) => r.success),
      },
    });

    return results;
  }

  private async sendViaChannel(
    channel: NotificationChannel,
    user: User,
    notificationData: NotificationData,
  ): Promise<NotificationResult> {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return this.sendEmail(user, notificationData);
      case NotificationChannel.SMS:
        return this.sendSMS(user, notificationData);
      case NotificationChannel.PUSH:
        return this.sendPush(user, notificationData);
      case NotificationChannel.IN_APP:
        return this.sendInApp(user, notificationData);
      default:
        return {
          success: false,
          channel,
          error: 'Unsupported channel',
        };
    }
  }

  private async sendEmail(
    user: User,
    data: NotificationData,
  ): Promise<NotificationResult> {
    // In a real implementation, this would integrate with an email service
    console.log(`Sending email to ${user.email}: ${data.title}`);

    return {
      success: true,
      channel: NotificationChannel.EMAIL,
    };
  }

  private async sendSMS(
    user: User,
    data: NotificationData,
  ): Promise<NotificationResult> {
    if (!user.phone) {
      return {
        success: false,
        channel: NotificationChannel.SMS,
        error: 'User has no phone number',
      };
    }

    // In a real implementation, this would integrate with an SMS service
    console.log(`Sending SMS to ${user.phone}: ${data.message}`);

    return {
      success: true,
      channel: NotificationChannel.SMS,
    };
  }

  private async sendPush(
    user: User,
    data: NotificationData,
  ): Promise<NotificationResult> {
    // In a real implementation, this would integrate with a push notification service
    console.log(`Sending push notification to user ${user.id}: ${data.title}`);

    return {
      success: true,
      channel: NotificationChannel.PUSH,
    };
  }

  private async sendInApp(
    user: User,
    data: NotificationData,
  ): Promise<NotificationResult> {
    // In a real implementation, this would store the notification in the database
    // for the user to see when they log in to the app
    console.log(
      `Creating in-app notification for user ${user.id}: ${data.title}`,
    );

    return {
      success: true,
      channel: NotificationChannel.IN_APP,
    };
  }

  private getDefaultChannels(type: NotificationType): NotificationChannel[] {
    const channelMap: Record<NotificationType, NotificationChannel[]> = {
      [NotificationType.KYC_SUBMITTED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      [NotificationType.KYC_APPROVED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
        NotificationChannel.PUSH,
      ],
      [NotificationType.KYC_REJECTED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
        NotificationChannel.PUSH,
      ],
      [NotificationType.KYC_EXPIRED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      [NotificationType.DOCUMENT_UPLOADED]: [NotificationChannel.IN_APP],
      [NotificationType.DOCUMENT_VERIFIED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      [NotificationType.DOCUMENT_REJECTED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      [NotificationType.ACCOUNT_LOCKED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.PUSH,
      ],
      [NotificationType.ACCOUNT_UNLOCKED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      [NotificationType.PASSWORD_CHANGED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
      ],
      [NotificationType.LOGIN_SUSPICIOUS]: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
        NotificationChannel.PUSH,
      ],
      [NotificationType.TWO_FACTOR_ENABLED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ],
      [NotificationType.TWO_FACTOR_DISABLED]: [
        NotificationChannel.EMAIL,
        NotificationChannel.SMS,
      ],
      [NotificationType.PROFILE_UPDATED]: [NotificationChannel.IN_APP],
      [NotificationType.GENERAL]: [NotificationChannel.IN_APP],
    };

    return channelMap[type] || [NotificationChannel.IN_APP];
  }

  // Helper methods for common notification scenarios
  async notifyKycStatusChange(
    userId: string,
    status: 'submitted' | 'approved' | 'rejected' | 'expired',
    additionalData?: Record<string, any>,
  ): Promise<void> {
    const notifications: Record<typeof status, NotificationData> = {
      submitted: {
        userId,
        type: NotificationType.KYC_SUBMITTED,
        title: 'KYC Application Submitted',
        message: 'Your KYC application has been submitted and is under review.',
        data: additionalData,
        priority: NotificationPriority.NORMAL,
      },
      approved: {
        userId,
        type: NotificationType.KYC_APPROVED,
        title: 'KYC Application Approved',
        message: 'Congratulations! Your KYC application has been approved.',
        data: additionalData,
        priority: NotificationPriority.HIGH,
      },
      rejected: {
        userId,
        type: NotificationType.KYC_REJECTED,
        title: 'KYC Application Rejected',
        message:
          'Your KYC application has been rejected. Please review the feedback and resubmit.',
        data: additionalData,
        priority: NotificationPriority.HIGH,
      },
      expired: {
        userId,
        type: NotificationType.KYC_EXPIRED,
        title: 'KYC Application Expired',
        message:
          'Your KYC verification has expired. Please resubmit your application.',
        data: additionalData,
        priority: NotificationPriority.HIGH,
      },
    };

    await this.sendNotification(notifications[status]);
  }

  async notifySecurityEvent(
    userId: string,
    event:
      | 'login_suspicious'
      | 'account_locked'
      | 'account_unlocked'
      | 'password_changed'
      | 'two_factor_enabled'
      | 'two_factor_disabled',
    additionalData?: Record<string, any>,
  ): Promise<void> {
    const notifications: Record<typeof event, NotificationData> = {
      login_suspicious: {
        userId,
        type: NotificationType.LOGIN_SUSPICIOUS,
        title: 'Suspicious Login Detected',
        message:
          'A suspicious login attempt was detected on your account. If this was not you, please secure your account immediately.',
        data: additionalData,
        priority: NotificationPriority.CRITICAL,
        channels: [
          NotificationChannel.EMAIL,
          NotificationChannel.SMS,
          NotificationChannel.PUSH,
        ],
      },
      account_locked: {
        userId,
        type: NotificationType.ACCOUNT_LOCKED,
        title: 'Account Locked',
        message:
          'Your account has been locked due to security concerns. Please contact support.',
        data: additionalData,
        priority: NotificationPriority.CRITICAL,
      },
      account_unlocked: {
        userId,
        type: NotificationType.ACCOUNT_UNLOCKED,
        title: 'Account Unlocked',
        message:
          'Your account has been unlocked and you can now access your account.',
        data: additionalData,
        priority: NotificationPriority.HIGH,
      },
      password_changed: {
        userId,
        type: NotificationType.PASSWORD_CHANGED,
        title: 'Password Changed',
        message: 'Your account password has been successfully changed.',
        data: additionalData,
        priority: NotificationPriority.HIGH,
      },
      two_factor_enabled: {
        userId,
        type: NotificationType.TWO_FACTOR_ENABLED,
        title: 'Two-Factor Authentication Enabled',
        message:
          'Two-factor authentication has been enabled on your account for enhanced security.',
        data: additionalData,
        priority: NotificationPriority.NORMAL,
      },
      two_factor_disabled: {
        userId,
        type: NotificationType.TWO_FACTOR_DISABLED,
        title: 'Two-Factor Authentication Disabled',
        message: 'Two-factor authentication has been disabled on your account.',
        data: additionalData,
        priority: NotificationPriority.HIGH,
      },
    };

    await this.sendNotification(notifications[event]);
  }

  async notifyDocumentUpdate(
    userId: string,
    event: 'uploaded' | 'verified' | 'rejected',
    documentType: string,
    additionalData?: Record<string, any>,
  ): Promise<void> {
    const notifications: Record<typeof event, NotificationData> = {
      uploaded: {
        userId,
        type: NotificationType.DOCUMENT_UPLOADED,
        title: 'Document Uploaded',
        message: `Your ${documentType} document has been uploaded successfully.`,
        data: { documentType, ...additionalData },
        priority: NotificationPriority.NORMAL,
      },
      verified: {
        userId,
        type: NotificationType.DOCUMENT_VERIFIED,
        title: 'Document Verified',
        message: `Your ${documentType} document has been verified successfully.`,
        data: { documentType, ...additionalData },
        priority: NotificationPriority.HIGH,
      },
      rejected: {
        userId,
        type: NotificationType.DOCUMENT_REJECTED,
        title: 'Document Rejected',
        message: `Your ${documentType} document has been rejected. Please upload a new document.`,
        data: { documentType, ...additionalData },
        priority: NotificationPriority.HIGH,
      },
    };

    await this.sendNotification(notifications[event]);
  }
}
