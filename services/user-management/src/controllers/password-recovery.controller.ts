import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PublicAccess, AdminOnly, SuperAdminOnly } from '../decorators/rbac.decorator';
import { PasswordRecoveryService } from '../services/password-recovery.service';
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
import { User } from '../entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Password Recovery')
@Controller('password-recovery')
export class PasswordRecoveryController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  // Public endpoints (no authentication required)

  @Post('forgot-password')
  @ApiOperation({ summary: 'Initiate password reset process' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset initiated successfully',
    type: PasswordRecoveryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many password reset attempts',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @PublicAccess()
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<PasswordRecoveryResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.passwordRecoveryService.forgotPassword({
      ...forgotPasswordDto,
      ipAddress,
      userAgent,
    });
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify password reset token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token verification result',
    type: TokenVerificationResponseDto,
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @PublicAccess()
  async verifyResetToken(
    @Body() verifyTokenDto: VerifyResetTokenDto,
  ): Promise<TokenVerificationResponseDto> {
    return this.passwordRecoveryService.verifyResetToken(verifyTokenDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token, expired token, or password policy violation',
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  @PublicAccess()
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<ResetPasswordResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.passwordRecoveryService.resetPassword(
      resetPasswordDto,
      ipAddress,
      userAgent,
    );
  }

  @Post('check-strength')
  @ApiOperation({ summary: 'Check password strength' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password strength analysis',
    type: PasswordStrengthResponseDto,
  })
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @PublicAccess()
  async checkPasswordStrength(
    @Body() passwordStrengthDto: PasswordStrengthDto,
  ): Promise<PasswordStrengthResponseDto> {
    return this.passwordRecoveryService.checkPasswordStrength(passwordStrengthDto);
  }

  // Authenticated endpoints

  @Post('security-questions')
  @ApiOperation({ summary: 'Set security questions for account recovery' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security questions set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid security questions or answers',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async setSecurityQuestions(
    @CurrentUser() user: User,
    @Body() securityQuestionsDto: SetSecurityQuestionsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean; message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.passwordRecoveryService.setSecurityQuestions(
      user.id,
      securityQuestionsDto,
      ipAddress,
      userAgent,
    );
  }

  @Post('security-questions/verify')
  @ApiOperation({ summary: 'Verify security questions for password recovery' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security questions verified successfully',
    type: PasswordRecoveryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Incorrect answers to security questions',
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  @PublicAccess()
  async verifySecurityQuestions(
    @Body() answerQuestionsDto: AnswerSecurityQuestionsDto,
    @Req() req: Request,
  ): Promise<PasswordRecoveryResponseDto> {
    // This would be implemented to verify security questions
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Security questions verification endpoint - implementation pending',
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get password change history' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password history retrieved successfully',
    type: PasswordHistoryResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPasswordHistory(
    @CurrentUser() user: User,
  ): Promise<PasswordHistoryResponseDto> {
    return this.passwordRecoveryService.getPasswordHistory(user.id);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Get password recovery attempts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recovery attempts retrieved successfully',
    type: RecoveryAttemptsDto,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRecoveryAttempts(
    @CurrentUser() user: User,
  ): Promise<RecoveryAttemptsDto> {
    return this.passwordRecoveryService.getRecoveryAttempts(user.id);
  }

  // Admin endpoints

  @Post('admin/reset-password')
  @ApiOperation({ summary: 'Admin password reset for any user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset by admin successfully',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Insufficient privileges',
  })
  @AdminOnly()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for admins
  async adminPasswordReset(
    @Body() adminResetDto: AdminPasswordResetDto,
    @CurrentUser() admin: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResetPasswordResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.passwordRecoveryService.adminPasswordReset(
      adminResetDto,
      admin.id,
      ipAddress,
      userAgent,
    );
  }

  @Post('admin/bulk-reset')
  @ApiOperation({ summary: 'Bulk password reset for multiple users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk password reset completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        totalUsers: { type: 'number' },
        successfulResets: { type: 'number' },
        failedResets: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              email: { type: 'string' },
              success: { type: 'boolean' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @SuperAdminOnly()
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes for super admins
  async bulkPasswordReset(
    @Body() bulkResetDto: BulkPasswordResetDto,
    @CurrentUser() admin: User,
    @Req() req: AuthenticatedRequest,
  ): Promise<{
    success: boolean;
    message: string;
    totalUsers: number;
    successfulResets: number;
    failedResets: number;
    results: Array<{
      userId: string;
      email: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    // This would be implemented to perform bulk password resets
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Bulk password reset endpoint - implementation pending',
      totalUsers: bulkResetDto.userIds.length,
      successfulResets: 0,
      failedResets: 0,
      results: [],
    };
  }

  @Get('admin/users/:userId/history')
  @ApiOperation({ summary: 'Get password history for any user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'Target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password history retrieved successfully',
    type: PasswordHistoryResponseDto,
  })
  @AdminOnly()
  async getUserPasswordHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<PasswordHistoryResponseDto> {
    return this.passwordRecoveryService.getPasswordHistory(userId);
  }

  @Get('admin/users/:userId/attempts')
  @ApiOperation({ summary: 'Get recovery attempts for any user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'Target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recovery attempts retrieved successfully',
    type: RecoveryAttemptsDto,
  })
  @AdminOnly()
  async getUserRecoveryAttempts(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<RecoveryAttemptsDto> {
    return this.passwordRecoveryService.getRecoveryAttempts(userId);
  }

  // System administration endpoints

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get password recovery system statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recovery statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalRecoveryAttempts: { type: 'number' },
        successfulRecoveries: { type: 'number' },
        failedRecoveries: { type: 'number' },
        averageRecoveryTime: { type: 'number' },
        commonFailureReasons: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        recoveryMethodUsage: {
          type: 'object',
          properties: {
            email: { type: 'number' },
            securityQuestions: { type: 'number' },
            adminReset: { type: 'number' },
          },
        },
        passwordStrengthDistribution: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        dailyRecoveryAttempts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              attempts: { type: 'number' },
              successes: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @AdminOnly()
  async getRecoveryStats(): Promise<{
    totalRecoveryAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    averageRecoveryTime: number;
    commonFailureReasons: Record<string, number>;
    recoveryMethodUsage: {
      email: number;
      securityQuestions: number;
      adminReset: number;
    };
    passwordStrengthDistribution: Record<string, number>;
    dailyRecoveryAttempts: Array<{
      date: string;
      attempts: number;
      successes: number;
    }>;
  }> {
    // This would be implemented to return actual statistics
    // For now, return placeholder data
    return {
      totalRecoveryAttempts: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      averageRecoveryTime: 0,
      commonFailureReasons: {},
      recoveryMethodUsage: {
        email: 0,
        securityQuestions: 0,
        adminReset: 0,
      },
      passwordStrengthDistribution: {},
      dailyRecoveryAttempts: [],
    };
  }

  @Post('admin/cleanup-expired-tokens')
  @ApiOperation({ summary: 'Clean up expired password reset tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired tokens cleaned up successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        cleanedTokens: { type: 'number' },
      },
    },
  })
  @AdminOnly()
  async cleanupExpiredTokens(): Promise<{
    success: boolean;
    message: string;
    cleanedTokens: number;
  }> {
    // This would be implemented to clean up expired tokens
    // For now, return a placeholder response
    return {
      success: true,
      message: 'Token cleanup endpoint - implementation pending',
      cleanedTokens: 0,
    };
  }

  // Security monitoring endpoints

  @Get('admin/security/suspicious-attempts')
  @ApiOperation({ summary: 'Get suspicious password recovery attempts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suspicious attempts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        suspiciousAttempts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              reason: { type: 'string' },
              riskScore: { type: 'number' },
              blocked: { type: 'boolean' },
            },
          },
        },
        totalSuspicious: { type: 'number' },
        blockedIps: { type: 'array', items: { type: 'string' } },
        recentAttackPatterns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              frequency: { type: 'number' },
              lastSeen: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @AdminOnly()
  async getSuspiciousAttempts(): Promise<{
    suspiciousAttempts: Array<{
      id: string;
      email: string;
      ipAddress: string;
      userAgent: string;
      timestamp: string;
      reason: string;
      riskScore: number;
      blocked: boolean;
    }>;
    totalSuspicious: number;
    blockedIps: string[];
    recentAttackPatterns: Array<{
      pattern: string;
      frequency: number;
      lastSeen: string;
    }>;
  }> {
    // This would be implemented to return actual security data
    // For now, return placeholder data
    return {
      suspiciousAttempts: [],
      totalSuspicious: 0,
      blockedIps: [],
      recentAttackPatterns: [],
    };
  }

  @Post('admin/security/block-ip')
  @ApiOperation({ summary: 'Block IP address from password recovery attempts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'IP address blocked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        blockedIp: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @AdminOnly()
  async blockIpAddress(
    @Body() body: { ipAddress: string; reason: string; durationHours?: number },
  ): Promise<{
    success: boolean;
    message: string;
    blockedIp: string;
    expiresAt: string;
  }> {
    // This would be implemented to actually block IP addresses
    // For now, return a placeholder response
    const expiresAt = new Date(Date.now() + (body.durationHours || 24) * 60 * 60 * 1000);
    
    return {
      success: true,
      message: 'IP blocking endpoint - implementation pending',
      blockedIp: body.ipAddress,
      expiresAt: expiresAt.toISOString(),
    };
  }
}