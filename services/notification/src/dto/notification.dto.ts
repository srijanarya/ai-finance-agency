import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsObject,
  IsDate,
  IsNumber,
  Min,
  Max,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to send notification to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ enum: NotificationCategory, description: 'Category of notification' })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationPriority, description: 'Priority level' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Additional payload data' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template ID to use' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'When to send notification' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Maximum retry attempts', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateNotificationDto {
  @ApiPropertyOptional({ enum: NotificationStatus, description: 'Notification status' })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'External provider ID' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Mark as read' })
  @IsOptional()
  @IsBoolean()
  markAsRead?: boolean;

  @ApiPropertyOptional({ description: 'Mark as clicked' })
  @IsOptional()
  @IsBoolean()
  markAsClicked?: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  type: NotificationType;

  @ApiProperty({ enum: NotificationCategory, description: 'Notification category' })
  category: NotificationCategory;

  @ApiProperty({ enum: NotificationPriority, description: 'Priority level' })
  priority: NotificationPriority;

  @ApiProperty({ enum: NotificationStatus, description: 'Current status' })
  status: NotificationStatus;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiPropertyOptional({ description: 'Additional payload' })
  payload?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template ID used' })
  templateId?: string;

  @ApiPropertyOptional({ description: 'Scheduled time' })
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Sent time' })
  sentAt?: Date;

  @ApiPropertyOptional({ description: 'Delivered time' })
  deliveredAt?: Date;

  @ApiPropertyOptional({ description: 'Failed time' })
  failedAt?: Date;

  @ApiPropertyOptional({ description: 'Error message' })
  errorMessage?: string;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Maximum retries allowed' })
  maxRetries: number;

  @ApiPropertyOptional({ description: 'External provider ID' })
  externalId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Read time' })
  readAt?: Date;

  @ApiPropertyOptional({ description: 'Clicked time' })
  clickedAt?: Date;

  @ApiProperty({ description: 'Creation time' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update time' })
  updatedAt: Date;

  @ApiProperty({ description: 'Is notification read' })
  isRead: boolean;

  @ApiProperty({ description: 'Is notification clicked' })
  isClicked: boolean;

  @ApiProperty({ description: 'Is notification scheduled for future' })
  isScheduled: boolean;

  @ApiProperty({ description: 'Can be retried' })
  canRetry: boolean;
}

export class BulkNotificationDto {
  @ApiProperty({ description: 'List of user IDs', type: [String] })
  @IsUUID(4, { each: true })
  userIds: string[];

  @ApiProperty({ enum: NotificationType, description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ enum: NotificationCategory, description: 'Category of notification' })
  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationPriority, description: 'Priority level' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Additional payload data' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template ID to use' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'When to send notifications' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;
}

export class SendTemplateNotificationDto {
  @ApiProperty({ description: 'User ID or array of user IDs' })
  userIds: string | string[];

  @ApiProperty({ description: 'Template ID to use' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ description: 'Variables for template rendering' })
  @IsObject()
  variables: Record<string, any>;

  @ApiPropertyOptional({ description: 'When to send notification' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}