import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  IsNumber,
  Length,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address for password reset' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiPropertyOptional({ description: 'Client IP address for security logging' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent for security logging' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Captcha token for bot protection' })
  @IsString()
  @IsOptional()
  captchaToken?: string;

  @ApiPropertyOptional({ description: 'Client application identifier' })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Redirect URL after password reset' })
  @IsString()
  @IsOptional()
  redirectUrl?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  @Length(32, 128)
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @Length(8, 128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    },
  )
  newPassword: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsString()
  confirmPassword: string;

  @ApiPropertyOptional({ description: 'Client IP address for security logging' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent for security logging' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Device identifier' })
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Whether to revoke all existing sessions' })
  @IsBoolean()
  @IsOptional()
  revokeAllSessions?: boolean;
}

export class VerifyResetTokenDto {
  @ApiProperty({ description: 'Password reset token to verify' })
  @IsString()
  @Length(32, 128)
  token: string;
}

export class PasswordStrengthDto {
  @ApiProperty({ description: 'Password to check strength' })
  @IsString()
  @Length(1, 128)
  password: string;
}

export class PasswordHistoryDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Number of recent passwords to check' })
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  limit?: number;
}

export class SecurityQuestionDto {
  @ApiProperty({ description: 'Security question' })
  @IsString()
  @Length(10, 255)
  question: string;

  @ApiProperty({ description: 'Answer to security question' })
  @IsString()
  @Length(2, 255)
  answer: string;
}

export class SetSecurityQuestionsDto {
  @ApiProperty({ type: [SecurityQuestionDto], description: 'Array of security questions and answers' })
  @IsArray()
  @Length(3, 5) // Require 3-5 security questions
  questions: SecurityQuestionDto[];
}

export class AnswerSecurityQuestionsDto {
  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({ type: [Object], description: 'Security question answers' })
  @IsArray()
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
}

export class PasswordRecoveryResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiPropertyOptional({ description: 'Token expiration time' })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Number of attempts remaining' })
  attemptsRemaining?: number;

  @ApiPropertyOptional({ description: 'Cooldown time in seconds' })
  cooldownSeconds?: number;

  @ApiPropertyOptional({ description: 'Security questions for additional verification' })
  securityQuestions?: Array<{
    id: string;
    question: string;
  }>;

  @ApiPropertyOptional({ description: 'Whether additional verification is required' })
  requiresAdditionalVerification?: boolean;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiPropertyOptional({ description: 'Number of revoked sessions' })
  revokedSessions?: number;

  @ApiPropertyOptional({ description: 'New login required' })
  requiresLogin?: boolean;

  @ApiPropertyOptional({ description: 'Password strength score' })
  passwordStrength?: number;
}

export class TokenVerificationResponseDto {
  @ApiProperty({ description: 'Token validity status' })
  valid: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiPropertyOptional({ description: 'Token expiration time' })
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Associated email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Time remaining in seconds' })
  timeRemaining?: number;

  @ApiPropertyOptional({ description: 'Whether token requires additional verification' })
  requiresAdditionalVerification?: boolean;
}

export class PasswordStrengthResponseDto {
  @ApiProperty({ description: 'Password strength score (0-100)' })
  score: number;

  @ApiProperty({ description: 'Password strength label' })
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';

  @ApiProperty({ description: 'Whether password meets minimum requirements' })
  meetsRequirements: boolean;

  @ApiProperty({ type: [String], description: 'Missing requirements' })
  missingRequirements: string[];

  @ApiProperty({ type: [String], description: 'Suggestions for improvement' })
  suggestions: string[];

  @ApiProperty({ description: 'Estimated time to crack' })
  estimatedCrackTime: string;

  @ApiProperty({ description: 'Password entropy bits' })
  entropy: number;
}

export class PasswordHistoryResponseDto {
  @ApiProperty({ description: 'Number of passwords in history' })
  totalPasswords: number;

  @ApiProperty({ type: [Object], description: 'Password history entries' })
  history: Array<{
    createdAt: Date;
    isCurrentPassword: boolean;
    strengthScore?: number;
  }>;

  @ApiPropertyOptional({ description: 'Average password strength over time' })
  averageStrength?: number;

  @ApiPropertyOptional({ description: 'Password change frequency in days' })
  changeFrequency?: number;
}

export class RecoveryAttemptsDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Total recovery attempts' })
  totalAttempts: number;

  @ApiProperty({ description: 'Successful attempts' })
  successfulAttempts: number;

  @ApiProperty({ description: 'Failed attempts' })
  failedAttempts: number;

  @ApiProperty({ description: 'Recent attempts (last 24 hours)' })
  recentAttempts: number;

  @ApiProperty({ description: 'Last attempt timestamp' })
  lastAttemptAt?: Date;

  @ApiProperty({ description: 'Whether user is currently locked out' })
  isLockedOut: boolean;

  @ApiPropertyOptional({ description: 'Lockout expiration time' })
  lockoutExpiresAt?: Date;

  @ApiProperty({ type: [Object], description: 'Attempt history' })
  attempts: Array<{
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    method: 'email' | 'security_questions' | 'admin_reset';
    reason?: string;
  }>;
}

export class RecoverySettingsDto {
  @ApiPropertyOptional({ description: 'Whether email recovery is enabled' })
  @IsBoolean()
  @IsOptional()
  emailRecoveryEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether security questions are enabled' })
  @IsBoolean()
  @IsOptional()
  securityQuestionsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Password reset token expiration time in minutes' })
  @IsNumber()
  @Min(5)
  @Max(1440) // Max 24 hours
  @IsOptional()
  tokenExpirationMinutes?: number;

  @ApiPropertyOptional({ description: 'Maximum reset attempts per day' })
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  maxAttemptsPerDay?: number;

  @ApiPropertyOptional({ description: 'Cooldown period between attempts in minutes' })
  @IsNumber()
  @Min(1)
  @Max(360) // Max 6 hours
  @IsOptional()
  cooldownMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether to require admin approval for password resets' })
  @IsBoolean()
  @IsOptional()
  requireAdminApproval?: boolean;

  @ApiPropertyOptional({ description: 'Password history limit' })
  @IsNumber()
  @Min(0)
  @Max(20)
  @IsOptional()
  passwordHistoryLimit?: number;

  @ApiPropertyOptional({ description: 'Minimum password age in days' })
  @IsNumber()
  @Min(0)
  @Max(365)
  @IsOptional()
  minPasswordAge?: number;

  @ApiPropertyOptional({ description: 'Maximum password age in days' })
  @IsNumber()
  @Min(30)
  @Max(730) // Max 2 years
  @IsOptional()
  maxPasswordAge?: number;
}

export class AdminPasswordResetDto {
  @ApiProperty({ description: 'User ID to reset password for' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Reason for admin reset' })
  @IsString()
  @Length(10, 500)
  reason: string;

  @ApiPropertyOptional({ description: 'Temporary password (if not provided, user will be required to set one)' })
  @IsString()
  @Length(8, 128)
  @IsOptional()
  temporaryPassword?: string;

  @ApiPropertyOptional({ description: 'Whether to force password change on next login' })
  @IsBoolean()
  @IsOptional()
  forceChangeOnLogin?: boolean;

  @ApiPropertyOptional({ description: 'Whether to revoke all existing sessions' })
  @IsBoolean()
  @IsOptional()
  revokeAllSessions?: boolean;

  @ApiPropertyOptional({ description: 'Whether to send notification email' })
  @IsBoolean()
  @IsOptional()
  sendNotification?: boolean;
}

export class BulkPasswordResetDto {
  @ApiProperty({ type: [String], description: 'Array of user IDs to reset passwords for' })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ description: 'Reason for bulk reset' })
  @IsString()
  @Length(10, 500)
  reason: string;

  @ApiPropertyOptional({ description: 'Whether to force password change on next login' })
  @IsBoolean()
  @IsOptional()
  forceChangeOnLogin?: boolean;

  @ApiPropertyOptional({ description: 'Whether to revoke all existing sessions' })
  @IsBoolean()
  @IsOptional()
  revokeAllSessions?: boolean;

  @ApiPropertyOptional({ description: 'Whether to send notification emails' })
  @IsBoolean()
  @IsOptional()
  sendNotifications?: boolean;
}

export class PasswordPolicyDto {
  @ApiProperty({ description: 'Minimum password length' })
  @IsNumber()
  @Min(6)
  @Max(128)
  minLength: number;

  @ApiProperty({ description: 'Maximum password length' })
  @IsNumber()
  @Min(8)
  @Max(256)
  maxLength: number;

  @ApiProperty({ description: 'Require uppercase letters' })
  @IsBoolean()
  requireUppercase: boolean;

  @ApiProperty({ description: 'Require lowercase letters' })
  @IsBoolean()
  requireLowercase: boolean;

  @ApiProperty({ description: 'Require digits' })
  @IsBoolean()
  requireDigits: boolean;

  @ApiProperty({ description: 'Require special characters' })
  @IsBoolean()
  requireSpecialChars: boolean;

  @ApiProperty({ description: 'Minimum number of character classes' })
  @IsNumber()
  @Min(1)
  @Max(4)
  minCharacterClasses: number;

  @ApiProperty({ description: 'Disallow common passwords' })
  @IsBoolean()
  disallowCommonPasswords: boolean;

  @ApiProperty({ description: 'Disallow personal information in password' })
  @IsBoolean()
  disallowPersonalInfo: boolean;

  @ApiProperty({ type: [String], description: 'List of forbidden password patterns' })
  @IsArray()
  @IsString({ each: true })
  forbiddenPatterns: string[];

  @ApiProperty({ description: 'Password history length to prevent reuse' })
  @IsNumber()
  @Min(0)
  @Max(20)
  historyLength: number;

  @ApiProperty({ description: 'Minimum password age in days' })
  @IsNumber()
  @Min(0)
  @Max(365)
  minAge: number;

  @ApiProperty({ description: 'Maximum password age in days' })
  @IsNumber()
  @Min(30)
  @Max(730)
  maxAge: number;
}