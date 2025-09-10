import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  NotificationPreferences,
} from '../entities/notification-preferences.entity';
import {
  CreateNotificationPreferencesDto,
  UpdateNotificationPreferencesDto,
  NotificationPreferencesResponseDto,
  BulkUpdatePreferencesDto,
} from '../dto/notification-preferences.dto';
import {
  NotificationType,
  NotificationCategory,
} from '../entities/notification.entity';

@ApiTags('Notification Preferences')
@Controller('notification-preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationPreferencesController {
  constructor(
    @InjectRepository(NotificationPreferences)
    private preferencesRepository: Repository<NotificationPreferences>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create notification preferences' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification preferences created successfully',
    type: NotificationPreferencesResponseDto,
  })
  async create(@Body() createDto: CreateNotificationPreferencesDto) {
    const preferences = this.preferencesRepository.create({
      ...createDto,
      enabled: createDto.enabled ?? true,
      timezone: createDto.timezone || 'UTC',
    });

    return this.preferencesRepository.save(preferences);
  }

  @Get()
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: NotificationCategory,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    description: 'Filter by type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification preferences retrieved successfully',
    type: [NotificationPreferencesResponseDto],
  })
  async findAll(
    @Query('userId') userId?: string,
    @Query('category') category?: NotificationCategory,
    @Query('type') type?: NotificationType,
  ) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (category) where.category = category;
    if (type) where.type = type;

    return this.preferencesRepository.find({ where });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all preferences for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User notification preferences retrieved successfully',
    type: [NotificationPreferencesResponseDto],
  })
  async getUserPreferences(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.preferencesRepository.find({
      where: { userId },
      order: { category: 'ASC', type: 'ASC' },
    });
  }

  @Get('user/:userId/defaults')
  @ApiOperation({ summary: 'Get or create default preferences for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Default notification preferences retrieved/created successfully',
    type: [NotificationPreferencesResponseDto],
  })
  async getOrCreateDefaults(@Param('userId', ParseUUIDPipe) userId: string) {
    const existingPreferences = await this.preferencesRepository.find({
      where: { userId },
    });

    // If user has no preferences, create defaults
    if (existingPreferences.length === 0) {
      const defaultPreferences = await this.createDefaultPreferences(userId);
      return defaultPreferences;
    }

    return existingPreferences;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification preference by ID' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification preference retrieved successfully',
    type: NotificationPreferencesResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification preference not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const preference = await this.preferencesRepository.findOne({
      where: { id },
    });

    if (!preference) {
      throw new Error('Notification preference not found');
    }

    return preference;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification preference' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification preference updated successfully',
    type: NotificationPreferencesResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ) {
    const preference = await this.findOne(id);
    Object.assign(preference, updateDto);
    return this.preferencesRepository.save(preference);
  }

  @Put('user/:userId/bulk')
  @ApiOperation({ summary: 'Bulk update user notification preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification preferences updated successfully',
    type: [NotificationPreferencesResponseDto],
  })
  async bulkUpdate(@Body() bulkDto: BulkUpdatePreferencesDto) {
    const updatedPreferences: NotificationPreferences[] = [];

    for (const pref of bulkDto.preferences) {
      let preference = await this.preferencesRepository.findOne({
        where: {
          userId: bulkDto.userId,
          category: pref.category,
          type: pref.type,
        },
      });

      if (preference) {
        // Update existing preference
        Object.assign(preference, pref);
      } else {
        // Create new preference
        preference = this.preferencesRepository.create({
          userId: bulkDto.userId,
          ...pref,
          enabled: pref.enabled ?? true,
          timezone: pref.timezone || 'UTC',
        });
      }

      const saved = await this.preferencesRepository.save(preference);
      updatedPreferences.push(saved);
    }

    return updatedPreferences;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification preference' })
  @ApiParam({ name: 'id', description: 'Preference ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification preference deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const preference = await this.findOne(id);
    await this.preferencesRepository.remove(preference);
    return { message: 'Notification preference deleted successfully' };
  }

  @Delete('user/:userId')
  @ApiOperation({ summary: 'Delete all preferences for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All user notification preferences deleted successfully',
  })
  async removeUserPreferences(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.preferencesRepository.delete({ userId });
    return { message: 'All notification preferences deleted successfully' };
  }

  @Post('user/:userId/enable-all')
  @ApiOperation({ summary: 'Enable all notification types for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All notifications enabled for user',
  })
  async enableAllForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.preferencesRepository.update(
      { userId },
      { enabled: true },
    );
    return { message: 'All notifications enabled for user' };
  }

  @Post('user/:userId/disable-all')
  @ApiOperation({ summary: 'Disable all notification types for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All notifications disabled for user',
  })
  async disableAllForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.preferencesRepository.update(
      { userId },
      { enabled: false },
    );
    return { message: 'All notifications disabled for user' };
  }

  @Get('user/:userId/summary')
  @ApiOperation({ summary: 'Get notification preferences summary for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification preferences summary retrieved successfully',
  })
  async getPreferencesSummary(@Param('userId', ParseUUIDPipe) userId: string) {
    const preferences = await this.preferencesRepository.find({
      where: { userId },
    });

    const summary = {
      totalPreferences: preferences.length,
      enabled: preferences.filter(p => p.enabled).length,
      disabled: preferences.filter(p => !p.enabled).length,
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      withQuietHours: preferences.filter(p => p.quietHoursStart && p.quietHoursEnd).length,
    };

    // Group by category
    preferences.forEach(pref => {
      summary.byCategory[pref.category] = (summary.byCategory[pref.category] || 0) + 1;
      summary.byType[pref.type] = (summary.byType[pref.type] || 0) + 1;
    });

    return summary;
  }

  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences[]> {
    const defaultPrefs = [];

    // Create default preferences for all combinations of category and type
    const categories = Object.values(NotificationCategory);
    const types = Object.values(NotificationType);

    for (const category of categories) {
      for (const type of types) {
        // Skip certain combinations that don't make sense
        if (category === NotificationCategory.SIGNAL && type === NotificationType.EMAIL) {
          continue; // Signals are typically push/in-app only
        }

        const preference = this.preferencesRepository.create({
          userId,
          category,
          type,
          enabled: this.getDefaultEnabledState(category, type),
          timezone: 'UTC',
        });

        defaultPrefs.push(preference);
      }
    }

    return this.preferencesRepository.save(defaultPrefs);
  }

  private getDefaultEnabledState(
    category: NotificationCategory,
    type: NotificationType,
  ): boolean {
    // Security and system notifications should be enabled by default
    if (category === NotificationCategory.SECURITY || category === NotificationCategory.SYSTEM) {
      return true;
    }

    // Trading and signal notifications typically enabled for push/in-app
    if (
      (category === NotificationCategory.TRADING || category === NotificationCategory.SIGNAL) &&
      (type === NotificationType.PUSH || type === NotificationType.IN_APP)
    ) {
      return true;
    }

    // Email notifications typically disabled by default except for account/security
    if (type === NotificationType.EMAIL) {
      return category === NotificationCategory.ACCOUNT || category === NotificationCategory.SECURITY;
    }

    // SMS notifications typically disabled by default
    if (type === NotificationType.SMS) {
      return false;
    }

    return true; // Default to enabled for other combinations
  }
}