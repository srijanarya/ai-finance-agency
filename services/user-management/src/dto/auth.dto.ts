import {
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  IsUUID,
  IsPhoneNumber,
  IsEnum,
  Length,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    description:
      'User password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'StrongPass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(1, { message: 'First name must be at least 1 character long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s\-'\.]+$/, {
    message:
      'First name can only contain letters, spaces, hyphens, apostrophes, and periods',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1, { message: 'Last name must be at least 1 character long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s\-'\.]+$/, {
    message:
      'Last name can only contain letters, spaces, hyphens, apostrophes, and periods',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber(null, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User date of birth (ISO 8601 format)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Please provide a valid date in ISO 8601 format' },
  )
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Accept terms and conditions',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Terms acceptance must be a boolean value' })
  acceptTerms?: boolean;

  @ApiPropertyOptional({
    description: 'Subscribe to newsletter',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Newsletter subscription must be a boolean value' })
  subscribeNewsletter?: boolean;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPass123!',
    minLength: 1,
    maxLength: 128,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1, { message: 'Password cannot be empty' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;

  @ApiPropertyOptional({
    description: 'Device identifier for session management',
    example: 'device-uuid-123',
  })
  @IsOptional()
  @IsString({ message: 'Device ID must be a string' })
  @MaxLength(255, { message: 'Device ID must not exceed 255 characters' })
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Human-readable device name',
    example: 'iPhone 14 Pro',
  })
  @IsOptional()
  @IsString({ message: 'Device name must be a string' })
  @MaxLength(100, { message: 'Device name must not exceed 100 characters' })
  deviceName?: string;

  @ApiPropertyOptional({
    description: 'Remember login on this device',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Remember me must be a boolean value' })
  rememberMe?: boolean;

  @ApiPropertyOptional({
    description: 'Two-factor authentication code',
    example: '123456',
  })
  @IsOptional()
  @IsString({ message: 'Two-factor code must be a string' })
  @Length(6, 6, { message: 'Two-factor code must be exactly 6 characters' })
  @Matches(/^\d{6}$/, { message: 'Two-factor code must contain only digits' })
  twoFactorCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token for generating new access token',
    example: 'refresh-token-uuid-123',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @MaxLength(500, { message: 'Refresh token must not exceed 500 characters' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'reset-token-123',
  })
  @IsString({ message: 'Reset token must be a string' })
  @IsNotEmpty({ message: 'Reset token is required' })
  @MaxLength(500, { message: 'Reset token must not exceed 500 characters' })
  token: string;

  @ApiProperty({
    description:
      'New password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'NewStrongPass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'NewStrongPass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password confirmation must be a string' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;

  // Custom validation would be added in a custom decorator or service
  // to ensure newPassword === confirmPassword
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPass123!',
    minLength: 1,
    maxLength: 128,
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MinLength(1, { message: 'Current password cannot be empty' })
  @MaxLength(128, {
    message: 'Current password must not exceed 128 characters',
  })
  currentPassword: string;

  @ApiProperty({
    description:
      'New password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'NewStrongPass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'NewStrongPass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Password confirmation must be a string' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  confirmPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'verification-token-123',
  })
  @IsString({ message: 'Verification token must be a string' })
  @IsNotEmpty({ message: 'Verification token is required' })
  @MaxLength(500, {
    message: 'Verification token must not exceed 500 characters',
  })
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({
    description: 'User email address for resending verification',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;
}

export class EnableTwoFactorDto {
  @ApiProperty({
    description: 'Current password for security verification',
    example: 'CurrentPass123!',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  currentPassword: string;
}

export class VerifyTwoFactorDto {
  @ApiProperty({
    description: 'Six-digit verification code from authenticator app',
    example: '123456',
  })
  @IsString({ message: 'Verification code must be a string' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 characters' })
  @Matches(/^\d{6}$/, { message: 'Verification code must contain only digits' })
  code: string;

  @ApiProperty({
    description: 'Two-factor setup token (provided during setup)',
    example: 'setup-token-123',
  })
  @IsString({ message: 'Setup token must be a string' })
  @IsNotEmpty({ message: 'Setup token is required' })
  @MaxLength(500, { message: 'Setup token must not exceed 500 characters' })
  setupToken: string;
}

export class DisableTwoFactorDto {
  @ApiProperty({
    description: 'Current password for security verification',
    example: 'CurrentPass123!',
  })
  @IsString({ message: 'Current password must be a string' })
  @IsNotEmpty({ message: 'Current password is required' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  currentPassword: string;

  @ApiProperty({
    description: 'Six-digit verification code from authenticator app',
    example: '123456',
  })
  @IsString({ message: 'Verification code must be a string' })
  @Length(6, 6, { message: 'Verification code must be exactly 6 characters' })
  @Matches(/^\d{6}$/, { message: 'Verification code must contain only digits' })
  twoFactorCode: string;
}

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Logout from all devices',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Logout all must be a boolean value' })
  logoutAll?: boolean;
}

export class CheckSessionDto {
  @ApiPropertyOptional({
    description: 'Session ID to check (optional)',
    example: 'session-uuid-123',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Session ID must be a valid UUID' })
  sessionId?: string;
}

// Response DTOs
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token for token renewal',
    example: 'refresh-token-uuid-123',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
    default: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    kycStatus: string;
  };
}

export class TwoFactorSetupResponseDto {
  @ApiProperty({
    description: 'QR code data URL for authenticator app',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCodeUrl: string;

  @ApiProperty({
    description: 'Manual entry secret key',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secretKey: string;

  @ApiProperty({
    description: 'Setup token for verification',
    example: 'setup-token-uuid-123',
  })
  setupToken: string;

  @ApiProperty({
    description: 'Backup codes for account recovery',
    example: ['12345678', '87654321', '11223344'],
  })
  backupCodes: string[];
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Additional data',
  })
  data?: any;
}

// Validation decorators for password confirmation
export function PasswordsMatch(property: string) {
  return function (object: any, propertyName: string) {
    const relatedValue = object[property];
    const value = object[propertyName];

    if (relatedValue !== value) {
      return false;
    }
    return true;
  };
}
