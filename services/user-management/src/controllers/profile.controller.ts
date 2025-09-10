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
  UseInterceptors,
  UploadedFile,
  Req,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ProfileService } from '../services/profile.service';
import {
  UpdateBasicProfileDto,
  UpdateProfilePreferencesDto,
  ProfileResponseDto,
  ChangeEmailDto,
  ChangePasswordDto,
  UpdatePhoneDto,
  VerifyPhoneDto,
  DeactivateAccountDto,
  ProfileStatsDto,
  ProfileActivityDto,
  UpdateAvatarDto,
} from '../dto/profile.dto';
import { User } from '../entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Profile Management')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getProfile(@CurrentUser() user: User): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.id);
  }

  @Put('basic')
  @ApiOperation({ summary: 'Update basic profile information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async updateBasicProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateBasicProfileDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.updateBasicProfile(
      user.id,
      updateDto,
      ipAddress,
      userAgent,
    );
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferences updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid preference data',
  })
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  async updatePreferences(
    @CurrentUser() user: User,
    @Body() preferencesDto: UpdateProfilePreferencesDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.updatePreferences(
      user.id,
      preferencesDto,
      ipAddress,
      userAgent,
    );
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        avatarUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or file too large',
  })
  @UseInterceptors(FileInterceptor('avatar', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
      }
    },
  }))
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.updateAvatar(
      user.id,
      file.buffer,
      file.mimetype,
      ipAddress,
      userAgent,
    );
  }

  @Post('avatar/base64')
  @ApiOperation({ summary: 'Upload user avatar via base64' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        avatarUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid base64 data or file too large',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async uploadAvatarBase64(
    @CurrentUser() user: User,
    @Body() updateAvatarDto: UpdateAvatarDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ avatarUrl: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.updateAvatar(
      user.id,
      updateAvatarDto.avatar,
      updateAvatarDto.mimeType || 'image/jpeg',
      ipAddress,
      userAgent,
    );
  }

  @Put('email')
  @ApiOperation({ summary: 'Change user email address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email change initiated, verification required',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        verificationRequired: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid current password',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already in use',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async changeEmail(
    @CurrentUser() user: User,
    @Body() changeEmailDto: ChangeEmailDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.changeEmail(
      user.id,
      changeEmailDto,
      ipAddress,
      userAgent,
    );
  }

  @Put('password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid current password',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid new password or password validation failed',
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.changePassword(
      user.id,
      changePasswordDto,
      ipAddress,
      userAgent,
    );
  }

  @Put('phone')
  @ApiOperation({ summary: 'Update phone number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Phone number updated, verification required',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        verificationRequired: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Phone number already in use',
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 requests per 5 minutes
  async updatePhone(
    @CurrentUser() user: User,
    @Body() updatePhoneDto: UpdatePhoneDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.updatePhone(
      user.id,
      updatePhoneDto,
      ipAddress,
      userAgent,
    );
  }

  @Post('phone/verify')
  @ApiOperation({ summary: 'Verify phone number with SMS code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Phone number verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        verified: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired verification code',
  })
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 10 requests per 5 minutes
  async verifyPhone(
    @CurrentUser() user: User,
    @Body() verifyPhoneDto: VerifyPhoneDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string; verified: boolean }> {
    // This would be implemented in the profile service
    // For now, return a placeholder response
    return {
      message: 'Phone verification endpoint - implementation pending',
      verified: false,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get profile statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile statistics retrieved successfully',
    type: ProfileStatsDto,
  })
  async getProfileStats(@CurrentUser() user: User): Promise<ProfileStatsDto> {
    return this.profileService.getProfileStats(user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get profile activity history' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50, max: 100)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        activities: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProfileActivityDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getProfileActivity(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<{
    activities: ProfileActivityDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Limit maximum items per page
    const maxLimit = Math.min(limit, 100);
    
    return this.profileService.getProfileActivity(user.id, page, maxLimit);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate profile completeness and security' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile validation results',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async validateProfile(@CurrentUser() user: User) {
    return this.profileService.validateProfile(user.id);
  }

  @Delete('deactivate')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid password',
  })
  @Throttle({ default: { limit: 1, ttl: 300000 } }) // 1 request per 5 minutes
  async deactivateAccount(
    @CurrentUser() user: User,
    @Body() deactivateDto: DeactivateAccountDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.profileService.deactivateAccount(
      user.id,
      deactivateDto,
      ipAddress,
      userAgent,
    );
  }

  // Additional endpoints for specific profile sections

  @Get('security')
  @ApiOperation({ summary: 'Get profile security information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Security information retrieved successfully',
  })
  async getSecurityInfo(@CurrentUser() user: User) {
    const profile = await this.profileService.getProfile(user.id);
    const stats = await this.profileService.getProfileStats(user.id);

    return {
      emailVerified: profile.emailVerified,
      phoneVerified: profile.phoneVerified,
      twoFactorEnabled: profile.twoFactorStatus === 'enabled',
      kycCompleted: profile.kycStatus === 'approved',
      securityScore: stats.securityScore,
      activeSessions: stats.activeSessions,
      lastLogin: stats.lastLogin,
      passwordLastChanged: user.passwordChangedAt,
    };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences only' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User preferences retrieved successfully',
  })
  async getPreferences(@CurrentUser() user: User) {
    const profile = await this.profileService.getProfile(user.id);
    return profile.preferences || {};
  }

  @Get('completeness')
  @ApiOperation({ summary: 'Get profile completion status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile completion status retrieved successfully',
  })
  async getProfileCompleteness(@CurrentUser() user: User) {
    const stats = await this.profileService.getProfileStats(user.id);
    const validation = await this.profileService.validateProfile(user.id);

    return {
      completionPercentage: stats.profileCompletion,
      missingFields: validation.errors,
      suggestions: validation.warnings,
      nextSteps: this.getNextSteps(validation),
    };
  }

  private getNextSteps(validation: any): string[] {
    const steps: string[] = [];

    if (validation.errors.includes('Email verification is required')) {
      steps.push('Verify your email address');
    }
    if (validation.warnings.includes('Two-factor authentication is not enabled')) {
      steps.push('Enable two-factor authentication');
    }
    if (validation.warnings.includes('Phone number is not verified')) {
      steps.push('Verify your phone number');
    }
    if (validation.warnings.includes('KYC verification is incomplete')) {
      steps.push('Complete KYC verification');
    }
    if (validation.warnings.includes('Profile picture is not uploaded')) {
      steps.push('Upload a profile picture');
    }

    return steps;
  }
}