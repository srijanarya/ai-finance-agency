import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { PushNotificationService } from '../services/push-notification.service';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  NotificationResponseDto,
  BulkNotificationDto,
  SendTemplateNotificationDto,
} from '../dto/notification.dto';
import {
  PushSubscriptionDto,
} from '../dto/notification-preferences.dto';
import {
  NotificationType,
  NotificationStatus,
} from '../entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  async create(@Body() createDto: CreateNotificationDto) {
    return this.notificationService.create(createDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple notifications' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bulk notifications created successfully',
    type: [NotificationResponseDto],
  })
  async createBulk(@Body() bulkDto: BulkNotificationDto) {
    return this.notificationService.createBulk(bulkDto);
  }

  @Post('template')
  @ApiOperation({ summary: 'Send notification using template' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Template notifications sent successfully',
    type: [NotificationResponseDto],
  })
  async sendTemplate(@Body() templateDto: SendTemplateNotificationDto) {
    return this.notificationService.sendTemplate(templateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications with optional filters' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    description: 'Filter by notification type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: NotificationStatus,
    description: 'Filter by notification status',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notifications retrieved successfully',
  })
  async findAll(
    @Query('userId') userId?: string,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.notificationService.findAll(userId, type, status, limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification retrieved successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification updated successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch(':id/clicked')
  @ApiOperation({ summary: 'Mark notification as clicked' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as clicked',
    type: NotificationResponseDto,
  })
  async markAsClicked(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.markAsClicked(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification retry initiated',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Notification cannot be retried',
  })
  async retry(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.retry(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel pending notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification cancelled successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only pending notifications can be cancelled',
  })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.cancel(id);
  }

  // Push Notification Subscription Endpoints
  @Post('push/subscribe')
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Push subscription created successfully',
  })
  async subscribePush(@Body() subscriptionDto: PushSubscriptionDto) {
    return this.pushNotificationService.subscribeUser(
      subscriptionDto.userId,
      subscriptionDto.endpoint,
      subscriptionDto.p256dhKey,
      subscriptionDto.authKey,
      subscriptionDto.userAgent,
    );
  }

  @Delete('push/unsubscribe/:userId')
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'endpoint', required: false, description: 'Specific endpoint to unsubscribe' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Push subscription removed successfully',
  })
  async unsubscribePush(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('endpoint') endpoint?: string,
  ) {
    await this.pushNotificationService.unsubscribeUser(userId, endpoint);
    return { message: 'Unsubscribed successfully' };
  }

  @Get('push/subscriptions/:userId')
  @ApiOperation({ summary: 'Get user push subscriptions' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Push subscriptions retrieved successfully',
  })
  async getUserPushSubscriptions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.pushNotificationService.getUserSubscriptions(userId);
  }

  @Get('push/vapid-key')
  @ApiOperation({ summary: 'Get VAPID public key for push notifications' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'VAPID public key retrieved successfully',
  })
  async getVapidPublicKey() {
    const publicKey = this.pushNotificationService.getVapidPublicKey();
    return { publicKey };
  }

  @Post('push/send')
  @ApiOperation({ summary: 'Send custom push notification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Push notification sent successfully',
  })
  async sendCustomPush(@Body() pushDto: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }) {
    const results = await this.pushNotificationService.sendCustomPush(
      pushDto.userId,
      pushDto.title,
      pushDto.body,
      pushDto.data,
    );
    return { results };
  }

  @Delete('push/cleanup')
  @ApiOperation({ summary: 'Clean up invalid push subscriptions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invalid push subscriptions cleaned up',
  })
  async cleanupPushSubscriptions() {
    const count = await this.pushNotificationService.cleanupInvalidSubscriptions();
    return { message: `Cleaned up ${count} invalid subscriptions` };
  }
}