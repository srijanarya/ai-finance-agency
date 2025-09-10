import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
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
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { SessionAccess, AdminOnly, ProfileAccess } from '../decorators/rbac.decorator';
import { SessionService } from '../services/session.service';
import {
  UpdateSessionDto,
  RevokeSessionDto,
  RevokeAllSessionsDto,
  ExtendSessionDto,
  SessionFilterDto,
  SessionResponseDto,
  SessionStatsDto,
  DeviceInfoDto,
} from '../dto/session.dto';
import { User } from '../entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
  sessionId?: string;
}

@ApiTags('Session Management')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Get user sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessions: {
          type: 'array',
          items: { $ref: '#/components/schemas/SessionResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @SessionAccess()
  async getUserSessions(
    @CurrentUser() user: User,
    @Query() filter: SessionFilterDto,
  ): Promise<{
    sessions: SessionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.sessionService.getUserSessions(user.id, filter);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current session information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current session retrieved successfully',
    type: SessionResponseDto,
  })
  async getCurrentSession(
    @Req() req: AuthenticatedRequest,
  ): Promise<SessionResponseDto> {
    const sessionId = req.sessionId || req.headers['x-session-id'] as string;
    if (!sessionId) {
      throw new Error('Session ID not found in request');
    }

    return this.sessionService.getSession(sessionId, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session statistics retrieved successfully',
    type: SessionStatsDto,
  })
  async getSessionStats(@CurrentUser() user: User): Promise<SessionStatsDto> {
    return this.sessionService.getSessionStats(user.id);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get user devices information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User devices retrieved successfully',
    type: [DeviceInfoDto],
  })
  async getUserDevices(@CurrentUser() user: User): Promise<DeviceInfoDto[]> {
    return this.sessionService.getUserDevices(user.id);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session retrieved successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @SessionAccess()
  async getSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: User,
  ): Promise<SessionResponseDto> {
    return this.sessionService.getSession(sessionId, user.id);
  }

  @Put(':sessionId')
  @ApiOperation({ summary: 'Update session' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session updated successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot update sessions of other users',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @SessionAccess()
  async updateSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() updateDto: UpdateSessionDto,
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<SessionResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.sessionService.updateSession(
      sessionId,
      updateDto,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Post(':sessionId/extend')
  @ApiOperation({ summary: 'Extend session expiration' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session extended successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot extend invalid session or extension exceeds maximum duration',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async extendSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() extendDto: ExtendSessionDto,
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<SessionResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.sessionService.extendSession(
      sessionId,
      extendDto,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Delete(':sessionId')
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session revoked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Cannot revoke sessions of other users',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @SessionAccess()
  async revokeSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() revokeDto: RevokeSessionDto,
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.sessionService.revokeSession(
      sessionId,
      revokeDto,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Delete('all')
  @ApiOperation({ summary: 'Revoke all user sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All sessions revoked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        revokedCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid password (if password verification required)',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async revokeAllSessions(
    @Body() revokeAllDto: RevokeAllSessionsDto,
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string; revokedCount: number }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const currentSessionId = req.sessionId || req.headers['x-session-id'] as string;

    return this.sessionService.revokeAllSessions(
      user.id,
      revokeAllDto,
      user.id,
      currentSessionId,
      ipAddress,
      userAgent,
    );
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up expired sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired sessions cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        cleanedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async cleanupExpiredSessions(
    @CurrentUser() user: User,
  ): Promise<{ cleanedCount: number; message: string }> {
    const cleanedCount = await this.sessionService.cleanupExpiredSessions(user.id);
    
    return {
      cleanedCount,
      message: `${cleanedCount} expired sessions cleaned up`,
    };
  }

  // Admin-only endpoints

  @Get('admin/users/:userId')
  @ApiOperation({ summary: 'Get sessions for any user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'Target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User sessions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sessions: {
          type: 'array',
          items: { $ref: '#/components/schemas/SessionResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @AdminOnly()
  async getUserSessionsAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() filter: SessionFilterDto,
  ): Promise<{
    sessions: SessionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.sessionService.getUserSessions(userId, filter);
  }

  @Get('admin/users/:userId/stats')
  @ApiOperation({ summary: 'Get session statistics for any user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'Target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session statistics retrieved successfully',
    type: SessionStatsDto,
  })
  @AdminOnly()
  async getSessionStatsAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<SessionStatsDto> {
    return this.sessionService.getSessionStats(userId);
  }

  @Delete('admin/:sessionId')
  @ApiOperation({ summary: 'Revoke any session (Admin only)' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session revoked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @AdminOnly()
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute for admins
  async revokeSessionAdmin(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() revokeDto: RevokeSessionDto,
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.sessionService.revokeSession(
      sessionId,
      revokeDto,
      user.id,
      ipAddress,
      userAgent,
    );
  }

  @Delete('admin/users/:userId/all')
  @ApiOperation({ summary: 'Revoke all sessions for any user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'Target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All user sessions revoked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        revokedCount: { type: 'number' },
      },
    },
  })
  @AdminOnly()
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 requests per 5 minutes for admins
  async revokeAllSessionsAdmin(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() revokeAllDto: RevokeAllSessionsDto,
    @CurrentUser() user: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string; revokedCount: number }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.sessionService.revokeAllSessions(
      userId,
      revokeAllDto,
      user.id,
      undefined, // No current session to preserve
      ipAddress,
      userAgent,
    );
  }

  @Post('admin/cleanup')
  @ApiOperation({ summary: 'Clean up all expired sessions (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All expired sessions cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        cleanedCount: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @AdminOnly()
  async cleanupAllExpiredSessions(): Promise<{ cleanedCount: number; message: string }> {
    const cleanedCount = await this.sessionService.cleanupExpiredSessions();
    
    return {
      cleanedCount,
      message: `${cleanedCount} expired sessions cleaned up system-wide`,
    };
  }

  // Device management endpoints

  @Post('devices/:deviceId/trust')
  @ApiOperation({ summary: 'Mark device as trusted' })
  @ApiParam({ name: 'deviceId', description: 'Device identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device marked as trusted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async trustDevice(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    // This would be implemented to mark all sessions from this device as trusted
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Device trust endpoint - implementation pending',
    };
  }

  @Delete('devices/:deviceId/trust')
  @ApiOperation({ summary: 'Remove device trust' })
  @ApiParam({ name: 'deviceId', description: 'Device identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Device trust removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async untrustDevice(
    @Param('deviceId') deviceId: string,
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string }> {
    // This would be implemented to remove trust from all sessions from this device
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Device untrust endpoint - implementation pending',
    };
  }

  @Delete('devices/:deviceId/sessions')
  @ApiOperation({ summary: 'Revoke all sessions from a specific device' })
  @ApiParam({ name: 'deviceId', description: 'Device identifier' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All device sessions revoked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        revokedCount: { type: 'number' },
      },
    },
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  async revokeDeviceSessions(
    @Param('deviceId') deviceId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: User,
  ): Promise<{ success: boolean; message: string; revokedCount: number }> {
    // This would be implemented to revoke all sessions from a specific device
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Device session revocation endpoint - implementation pending',
      revokedCount: 0,
    };
  }
}