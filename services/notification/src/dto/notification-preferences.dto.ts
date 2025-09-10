import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsObject,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  NotificationType,
  NotificationCategory,
} from '../entities/notification.entity';

export class CreateNotificationPreferencesDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: NotificationCategory, description: 'Notification category' })
  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ description: 'Enable/disable notifications for this category and type' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Quiet hours start time (HH:MM format)' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'quietHoursStart must be in HH:MM format',
  })
  quietHoursStart?: string;

  @ApiPropertyOptional({ description: 'Quiet hours end time (HH:MM format)' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'quietHoursEnd must be in HH:MM format',
  })
  quietHoursEnd?: string;

  @ApiPropertyOptional({ description: 'User timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Additional settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Enable/disable notifications' })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Quiet hours start time (HH:MM format)' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'quietHoursStart must be in HH:MM format',
  })
  quietHoursStart?: string;

  @ApiPropertyOptional({ description: 'Quiet hours end time (HH:MM format)' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'quietHoursEnd must be in HH:MM format',
  })
  quietHoursEnd?: string;

  @ApiPropertyOptional({ description: 'User timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Additional settings' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class NotificationPreferencesResponseDto {
  @ApiProperty({ description: 'Preference ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ enum: NotificationCategory, description: 'Notification category' })
  category: NotificationCategory;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  type: NotificationType;

  @ApiProperty({ description: 'Is enabled' })
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Quiet hours start time' })
  quietHoursStart?: string;

  @ApiPropertyOptional({ description: 'Quiet hours end time' })
  quietHoursEnd?: string;

  @ApiProperty({ description: 'User timezone' })
  timezone: string;

  @ApiPropertyOptional({ description: 'Additional settings' })
  settings?: Record<string, any>;

  @ApiProperty({ description: 'Creation time' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update time' })
  updatedAt: Date;
}

export class BulkUpdatePreferencesDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Preferences to update', type: [UpdateNotificationPreferencesDto] })
  preferences: Array<{
    category: NotificationCategory;
    type: NotificationType;
    enabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    timezone?: string;
    settings?: Record<string, any>;
  }>;
}

export class PushSubscriptionDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Push subscription endpoint' })
  @IsString()
  endpoint: string;

  @ApiProperty({ description: 'P256DH key' })
  @IsString()
  p256dhKey: string;

  @ApiProperty({ description: 'Auth key' })
  @IsString()
  authKey: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Device type' })
  @IsOptional()
  @IsString()
  deviceType?: string;

  @ApiPropertyOptional({ description: 'Browser name' })
  @IsOptional()
  @IsString()
  browserName?: string;

  @ApiPropertyOptional({ description: 'Browser version' })
  @IsOptional()
  @IsString()
  browserVersion?: string;

  @ApiPropertyOptional({ description: 'Operating system name' })
  @IsOptional()
  @IsString()
  osName?: string;

  @ApiPropertyOptional({ description: 'Operating system version' })
  @IsOptional()
  @IsString()
  osVersion?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}