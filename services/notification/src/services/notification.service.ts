import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../entities/notification.entity';
import { NotificationHistory, NotificationAction } from '../entities/notification-history.entity';
import { NotificationPreferences } from '../entities/notification-preferences.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  BulkNotificationDto,
  SendTemplateNotificationDto,
} from '../dto/notification.dto';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushNotificationService } from './push-notification.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationHistory)
    private historyRepository: Repository<NotificationHistory>,
    @InjectRepository(NotificationPreferences)
    private preferencesRepository: Repository<NotificationPreferences>,
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
    private eventEmitter: EventEmitter2,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushNotificationService: PushNotificationService,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(
        createDto.userId,
        createDto.category || NotificationCategory.SYSTEM,
        createDto.type,
      );

      if (preferences && !preferences.enabled) {
        this.logger.warn(
          `Notification blocked by user preferences: ${createDto.userId}`,
        );
        throw new BadRequestException('Notifications disabled for this user');
      }

      // Check quiet hours
      if (preferences && preferences.isInQuietHours()) {
        this.logger.log(
          `Notification delayed due to quiet hours: ${createDto.userId}`,
        );
        // Schedule for after quiet hours
        createDto.scheduledAt = this.calculateAfterQuietHours(preferences);
      }

      const notification = this.notificationRepository.create({
        ...createDto,
        category: createDto.category || NotificationCategory.SYSTEM,
        priority: createDto.priority || NotificationPriority.NORMAL,
        status: NotificationStatus.PENDING,
        retryCount: 0,
        maxRetries: createDto.maxRetries || 3,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      // Record in history
      await this.recordHistory(
        savedNotification,
        NotificationAction.CREATED,
        'Notification created',
      );

      // Emit event
      this.eventEmitter.emit('notification.created', savedNotification);

      // Process immediately if not scheduled
      if (!savedNotification.scheduledAt || savedNotification.scheduledAt <= new Date()) {
        this.processNotification(savedNotification.id);
      }

      return savedNotification;
    } catch (error) {
      this.logger.error('Failed to create notification', error.stack);
      throw error;
    }
  }

  async createBulk(bulkDto: BulkNotificationDto): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of bulkDto.userIds) {
      try {
        const notification = await this.create({
          userId,
          type: bulkDto.type,
          category: bulkDto.category,
          priority: bulkDto.priority,
          title: bulkDto.title,
          message: bulkDto.message,
          payload: bulkDto.payload,
          templateId: bulkDto.templateId,
          scheduledAt: bulkDto.scheduledAt,
        });
        notifications.push(notification);
      } catch (error) {
        this.logger.error(`Failed to create notification for user ${userId}`, error.stack);
        // Continue with other users
      }
    }

    return notifications;
  }

  async sendTemplate(templateDto: SendTemplateNotificationDto): Promise<Notification[]> {
    const template = await this.templateRepository.findOne({
      where: { id: templateDto.templateId, active: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found or inactive');
    }

    // Validate template variables
    const errors = template.validateVariables(templateDto.variables);
    if (errors.length > 0) {
      throw new BadRequestException(`Template validation errors: ${errors.join(', ')}`);
    }

    // Render template
    const rendered = template.render(templateDto.variables);

    const userIds = Array.isArray(templateDto.userIds)
      ? templateDto.userIds
      : [templateDto.userIds];

    const notifications: Notification[] = [];

    for (const userId of userIds) {
      try {
        const notification = await this.create({
          userId,
          type: template.type,
          category: template.category,
          title: rendered.subject,
          message: rendered.body,
          payload: {
            ...templateDto.variables,
            htmlBody: rendered.htmlBody,
          },
          templateId: template.id,
          scheduledAt: templateDto.scheduledAt,
          metadata: templateDto.metadata,
        });
        notifications.push(notification);
      } catch (error) {
        this.logger.error(`Failed to send template notification for user ${userId}`, error.stack);
      }
    }

    return notifications;
  }

  async findAll(
    userId?: string,
    type?: NotificationType,
    status?: NotificationStatus,
    limit = 50,
    offset = 0,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (userId) {
      queryBuilder.andWhere('notification.userId = :userId', { userId });
    }
    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }
    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    const [notifications, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return { notifications, total };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, updateDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);

    if (updateDto.status) {
      notification.status = updateDto.status;
      
      if (updateDto.status === NotificationStatus.SENT) {
        notification.sentAt = new Date();
      } else if (updateDto.status === NotificationStatus.DELIVERED) {
        notification.deliveredAt = new Date();
      } else if (updateDto.status === NotificationStatus.FAILED) {
        notification.failedAt = new Date();
      }
    }

    if (updateDto.errorMessage) {
      notification.errorMessage = updateDto.errorMessage;
    }

    if (updateDto.externalId) {
      notification.externalId = updateDto.externalId;
    }

    if (updateDto.metadata) {
      notification.metadata = { ...notification.metadata, ...updateDto.metadata };
    }

    if (updateDto.markAsRead) {
      notification.readAt = new Date();
    }

    if (updateDto.markAsClicked) {
      notification.clickedAt = new Date();
    }

    const updatedNotification = await this.notificationRepository.save(notification);

    // Record in history
    await this.recordHistory(
      updatedNotification,
      this.getActionFromStatus(updatedNotification.status),
      updateDto.errorMessage || 'Notification updated',
    );

    return updatedNotification;
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { markAsRead: true });
  }

  async markAsClicked(id: string): Promise<Notification> {
    return this.update(id, { markAsClicked: true });
  }

  async retry(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (!notification.canRetry) {
      throw new BadRequestException('Notification cannot be retried');
    }

    notification.status = NotificationStatus.PENDING;
    notification.retryCount += 1;
    notification.errorMessage = null;
    notification.failedAt = null;

    const updatedNotification = await this.notificationRepository.save(notification);

    await this.recordHistory(
      updatedNotification,
      NotificationAction.RETRY,
      `Retry attempt ${updatedNotification.retryCount}`,
    );

    // Process the notification
    this.processNotification(updatedNotification.id);

    return updatedNotification;
  }

  async cancel(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    if (notification.status !== NotificationStatus.PENDING) {
      throw new BadRequestException('Only pending notifications can be cancelled');
    }

    return this.update(id, { status: NotificationStatus.CANCELLED });
  }

  async processScheduledNotifications(): Promise<void> {
    const pendingNotifications = await this.notificationRepository.find({
      where: [
        {
          status: NotificationStatus.PENDING,
          scheduledAt: IsNull(),
        },
        {
          status: NotificationStatus.PENDING,
          scheduledAt: LessThanOrEqual(new Date()),
        },
      ],
    });

    for (const notification of pendingNotifications) {
      this.processNotification(notification.id);
    }
  }

  private async processNotification(notificationId: string): Promise<void> {
    try {
      const notification = await this.findOne(notificationId);

      if (notification.status !== NotificationStatus.PENDING) {
        return;
      }

      // Check if scheduled for future
      if (notification.scheduledAt && notification.scheduledAt > new Date()) {
        return;
      }

      let success = false;
      let errorMessage = '';

      try {
        switch (notification.type) {
          case NotificationType.EMAIL:
            await this.emailService.sendNotification(notification);
            success = true;
            break;
          case NotificationType.SMS:
            await this.smsService.sendNotification(notification);
            success = true;
            break;
          case NotificationType.PUSH:
            await this.pushNotificationService.sendNotification(notification);
            success = true;
            break;
          case NotificationType.IN_APP:
            // For in-app notifications, we just mark as sent and emit event
            this.eventEmitter.emit('notification.inapp', notification);
            success = true;
            break;
          default:
            errorMessage = `Unsupported notification type: ${notification.type}`;
        }
      } catch (error) {
        this.logger.error(`Failed to send notification ${notificationId}`, error.stack);
        errorMessage = error.message;
      }

      // Update status
      await this.update(notificationId, {
        status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        errorMessage: success ? undefined : errorMessage,
      });
    } catch (error) {
      this.logger.error(`Error processing notification ${notificationId}`, error.stack);
    }
  }

  private async getUserPreferences(
    userId: string,
    category: NotificationCategory,
    type: NotificationType,
  ): Promise<NotificationPreferences | null> {
    return this.preferencesRepository.findOne({
      where: { userId, category, type },
    });
  }

  private calculateAfterQuietHours(preferences: NotificationPreferences): Date {
    // Simple implementation - schedule for 1 hour after quiet hours end
    const now = new Date();
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
    const scheduledTime = new Date(now);
    scheduledTime.setHours(endHour, endMinute, 0, 0);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime;
  }

  private async recordHistory(
    notification: Notification,
    action: NotificationAction,
    details?: string,
  ): Promise<void> {
    try {
      const history = this.historyRepository.create({
        notificationId: notification.id,
        userId: notification.userId,
        action,
        status: notification.status,
        type: notification.type,
        details,
        errorMessage: notification.errorMessage,
        externalId: notification.externalId,
      });

      await this.historyRepository.save(history);
    } catch (error) {
      this.logger.error('Failed to record notification history', error.stack);
    }
  }

  private getActionFromStatus(status: NotificationStatus): NotificationAction {
    switch (status) {
      case NotificationStatus.SENT:
        return NotificationAction.SENT;
      case NotificationStatus.DELIVERED:
        return NotificationAction.DELIVERED;
      case NotificationStatus.FAILED:
        return NotificationAction.FAILED;
      case NotificationStatus.CANCELLED:
        return NotificationAction.CANCELLED;
      default:
        return NotificationAction.CREATED;
    }
  }
}