import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { Notification } from '../entities/notification.entity';
import { PushSubscription } from '../entities/push-subscription.entity';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private isEnabled: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepository: Repository<PushSubscription>,
  ) {
    this.initializeWebPush();
  }

  private initializeWebPush(): void {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:noreply@aifinanceagency.com');

    if (vapidPublicKey && vapidPrivateKey) {
      try {
        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
        this.isEnabled = true;
        this.logger.log('Web Push service initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Web Push service', error.stack);
        this.isEnabled = false;
      }
    } else {
      this.logger.warn('VAPID keys not provided, Push notification service disabled');
      this.isEnabled = false;
    }
  }

  async sendNotification(notification: Notification): Promise<string[]> {
    try {
      if (!this.isEnabled) {
        throw new Error('Push notification service is not enabled');
      }

      // Get all active push subscriptions for the user
      const subscriptions = await this.pushSubscriptionRepository.find({
        where: { 
          userId: notification.userId, 
          active: true,
        },
      });

      if (subscriptions.length === 0) {
        throw new Error('No active push subscriptions found for user');
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        data: {
          notificationId: notification.id,
          category: notification.category,
          priority: notification.priority,
          ...notification.payload,
        },
        actions: [
          {
            action: 'view',
            title: 'View',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ],
      });

      const results: string[] = [];
      const failedSubscriptions: string[] = [];

      for (const subscription of subscriptions) {
        try {
          const result = await webpush.sendNotification(
            subscription.getPushSubscription(),
            payload,
            {
              TTL: 24 * 60 * 60, // 24 hours
              urgency: this.getUrgencyFromPriority(notification.priority),
            },
          );

          subscription.markAsUsed();
          await this.pushSubscriptionRepository.save(subscription);

          results.push(`${subscription.id}:sent`);
          this.logger.log(`Push notification sent to subscription ${subscription.id}`);
        } catch (error) {
          this.logger.error(`Failed to send push to subscription ${subscription.id}`, error.stack);
          
          subscription.recordFailure();
          await this.pushSubscriptionRepository.save(subscription);
          
          failedSubscriptions.push(subscription.id);
          results.push(`${subscription.id}:failed`);

          // If subscription is invalid (410 Gone), it will be deactivated by recordFailure
          if (error.statusCode === 410) {
            this.logger.log(`Subscription ${subscription.id} marked as inactive due to 410 error`);
          }
        }
      }

      if (failedSubscriptions.length === subscriptions.length) {
        throw new Error('Failed to send push notification to all subscriptions');
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${notification.id}`, error.stack);
      throw error;
    }
  }

  async sendCustomPush(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<string[]> {
    try {
      if (!this.isEnabled) {
        throw new Error('Push notification service is not enabled');
      }

      const subscriptions = await this.pushSubscriptionRepository.find({
        where: { 
          userId, 
          active: true,
        },
      });

      if (subscriptions.length === 0) {
        throw new Error('No active push subscriptions found for user');
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: '/icons/notification-icon.png',
        badge: '/icons/notification-badge.png',
        data: data || {},
      });

      const results: string[] = [];

      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(subscription.getPushSubscription(), payload);
          subscription.markAsUsed();
          await this.pushSubscriptionRepository.save(subscription);
          results.push(`${subscription.id}:sent`);
        } catch (error) {
          this.logger.error(`Failed to send custom push to subscription ${subscription.id}`, error.stack);
          subscription.recordFailure();
          await this.pushSubscriptionRepository.save(subscription);
          results.push(`${subscription.id}:failed`);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to send custom push notification to user ${userId}`, error.stack);
      throw error;
    }
  }

  async subscribeUser(
    userId: string,
    endpoint: string,
    p256dhKey: string,
    authKey: string,
    userAgent?: string,
  ): Promise<PushSubscription> {
    try {
      // Check if subscription already exists
      let subscription = await this.pushSubscriptionRepository.findOne({
        where: { userId, endpoint },
      });

      if (subscription) {
        // Update existing subscription
        subscription.p256dhKey = p256dhKey;
        subscription.authKey = authKey;
        subscription.active = true;
        subscription.failureCount = 0;
        subscription.userAgent = userAgent;
        
        if (userAgent) {
          this.parseUserAgent(subscription, userAgent);
        }
      } else {
        // Create new subscription
        subscription = this.pushSubscriptionRepository.create({
          userId,
          endpoint,
          p256dhKey,
          authKey,
          userAgent,
          active: true,
          failureCount: 0,
        });

        if (userAgent) {
          this.parseUserAgent(subscription, userAgent);
        }
      }

      return await this.pushSubscriptionRepository.save(subscription);
    } catch (error) {
      this.logger.error(`Failed to subscribe user ${userId} for push notifications`, error.stack);
      throw error;
    }
  }

  async unsubscribeUser(userId: string, endpoint?: string): Promise<void> {
    try {
      const whereCondition: any = { userId };
      if (endpoint) {
        whereCondition.endpoint = endpoint;
      }

      await this.pushSubscriptionRepository.update(whereCondition, { active: false });
      this.logger.log(`Unsubscribed user ${userId} from push notifications`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe user ${userId}`, error.stack);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    return this.pushSubscriptionRepository.find({
      where: { userId, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async cleanupInvalidSubscriptions(): Promise<number> {
    try {
      const result = await this.pushSubscriptionRepository.delete({
        active: false,
      });

      this.logger.log(`Cleaned up ${result.affected} invalid push subscriptions`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Failed to cleanup invalid push subscriptions', error.stack);
      return 0;
    }
  }

  private getUrgencyFromPriority(priority: string): 'very-low' | 'low' | 'normal' | 'high' {
    switch (priority) {
      case 'urgent':
        return 'high';
      case 'high':
        return 'normal';
      case 'normal':
        return 'normal';
      case 'low':
        return 'low';
      default:
        return 'normal';
    }
  }

  private parseUserAgent(subscription: PushSubscription, userAgent: string): void {
    try {
      // Simple user agent parsing - in production, use a proper library like ua-parser-js
      if (userAgent.includes('Chrome')) {
        subscription.browserName = 'Chrome';
      } else if (userAgent.includes('Firefox')) {
        subscription.browserName = 'Firefox';
      } else if (userAgent.includes('Safari')) {
        subscription.browserName = 'Safari';
      } else if (userAgent.includes('Edge')) {
        subscription.browserName = 'Edge';
      }

      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        subscription.deviceType = 'mobile';
      } else {
        subscription.deviceType = 'desktop';
      }

      if (userAgent.includes('Windows')) {
        subscription.osName = 'Windows';
      } else if (userAgent.includes('Mac')) {
        subscription.osName = 'macOS';
      } else if (userAgent.includes('Linux')) {
        subscription.osName = 'Linux';
      } else if (userAgent.includes('Android')) {
        subscription.osName = 'Android';
      } else if (userAgent.includes('iOS')) {
        subscription.osName = 'iOS';
      }
    } catch (error) {
      this.logger.warn('Failed to parse user agent', error);
    }
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  getVapidPublicKey(): string | null {
    return this.configService.get<string>('VAPID_PUBLIC_KEY');
  }
}