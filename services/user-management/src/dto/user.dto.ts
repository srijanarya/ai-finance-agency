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
  IsArray,
  IsNumber,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  UserStatus,
  KycStatus,
  TwoFactorStatus,
} from '../entities/user.entity';
// import { SystemRole } from '../entities/role.entity';

export class CreateUserDto {
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
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    default: UserStatus.PENDING_VERIFICATION,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be a valid user status' })
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Email verification status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Email verified must be a boolean value' })
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Phone verification status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Phone verified must be a boolean value' })
  phoneVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Array of role IDs to assign to user',
    example: ['role-uuid-1', 'role-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Role IDs must be an array' })
  @IsUUID(4, { each: true, message: 'Each role ID must be a valid UUID' })
  roleIds?: string[];

  @ApiPropertyOptional({
    description: 'User timezone',
    example: 'UTC',
    default: 'UTC',
  })
  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(50, { message: 'Timezone must not exceed 50 characters' })
  timezone?: string;

  @ApiPropertyOptional({
    description: 'User language',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  @MaxLength(10, { message: 'Language must not exceed 10 characters' })
  language?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User ID (cannot be updated)',
  })
  @IsOptional()
  readonly id?: string;

  // Override email to make it optional for updates
  @ApiPropertyOptional({
    description: 'User email address (optional for updates)',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email?: string;

  // Override password to make it optional and remove requirements for updates
  @ApiPropertyOptional({
    description: 'New password (optional)',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  @MaxLength(500, {
    message: 'Profile picture URL must not exceed 500 characters',
  })
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'KYC status',
    enum: KycStatus,
    example: KycStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(KycStatus, { message: 'KYC status must be a valid status' })
  kycStatus?: KycStatus;

  @ApiPropertyOptional({
    description: 'Risk score (0-100)',
    example: 25.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Risk score must be a number with maximum 2 decimal places' },
  )
  @Min(0, { message: 'Risk score must be at least 0' })
  @Max(100, { message: 'Risk score must not exceed 100' })
  riskScore?: number;

  @ApiPropertyOptional({
    description: 'Compliance flags',
    example: ['aml_check', 'sanctions_check'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Compliance flags must be an array' })
  @IsString({ each: true, message: 'Each compliance flag must be a string' })
  complianceFlags?: string[];
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name must be at least 1 character long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s\-'\.]+$/, {
    message:
      'First name can only contain letters, spaces, hyphens, apostrophes, and periods',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(1, { message: 'Last name must be at least 1 character long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  @Matches(/^[a-zA-Z\s\-'\.]+$/, {
    message:
      'Last name can only contain letters, spaces, hyphens, apostrophes, and periods',
  })
  lastName?: string;

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
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Profile picture must be a string' })
  @MaxLength(500, {
    message: 'Profile picture URL must not exceed 500 characters',
  })
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'User timezone',
    example: 'UTC',
  })
  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(50, { message: 'Timezone must not exceed 50 characters' })
  timezone?: string;

  @ApiPropertyOptional({
    description: 'User language',
    example: 'en',
  })
  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  @MaxLength(10, { message: 'Language must not exceed 10 characters' })
  language?: string;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({
    description: 'Newsletter subscription status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Newsletter subscription must be a boolean value' })
  newsletterSubscribed?: boolean;

  @ApiPropertyOptional({
    description: 'Notifications enabled status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notifications enabled must be a boolean value' })
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Marketing emails enabled status',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Marketing emails enabled must be a boolean value' })
  marketingEmailsEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'User timezone',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString({ message: 'Timezone must be a string' })
  @MaxLength(50, { message: 'Timezone must not exceed 50 characters' })
  timezone?: string;

  @ApiPropertyOptional({
    description: 'User language preference',
    example: 'en-US',
  })
  @IsOptional()
  @IsString({ message: 'Language must be a string' })
  @MaxLength(10, { message: 'Language must not exceed 10 characters' })
  language?: string;
}

export class AssignRoleDto {
  @ApiProperty({
    description: 'Array of role IDs to assign',
    example: ['role-uuid-1', 'role-uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Role IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @IsUUID(4, { each: true, message: 'Each role ID must be a valid UUID' })
  roleIds: string[];

  @ApiPropertyOptional({
    description: 'Reason for role assignment',
    example: 'User promoted to premium tier',
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

export class UserSearchDto {
  @ApiPropertyOptional({
    description: 'Search query (searches name, email)',
    example: 'john doe',
  })
  @IsOptional()
  @IsString({ message: 'Query must be a string' })
  @MaxLength(100, { message: 'Query must not exceed 100 characters' })
  query?: string;

  @ApiPropertyOptional({
    description: 'Filter by user status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be a valid user status' })
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by KYC status',
    enum: KycStatus,
    example: KycStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(KycStatus, { message: 'KYC status must be a valid status' })
  kycStatus?: KycStatus;

  @ApiPropertyOptional({
    description: 'Filter by role name',
    example: 'premium_user',
  })
  @IsOptional()
  @IsString({ message: 'Role must be a string' })
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by email verification status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Email verified must be a boolean value' })
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by two-factor authentication status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Two-factor enabled must be a boolean value' })
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Created after date (ISO 8601 format)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Created after must be a valid date' })
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Created before date (ISO 8601 format)',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Created before must be a valid date' })
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Minimum risk score',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum risk score must be a number' })
  @Min(0, { message: 'Minimum risk score must be at least 0' })
  @Max(100, { message: 'Minimum risk score must not exceed 100' })
  minRiskScore?: number;

  @ApiPropertyOptional({
    description: 'Maximum risk score',
    example: 100,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Maximum risk score must be a number' })
  @Min(0, { message: 'Maximum risk score must be at least 0' })
  @Max(100, { message: 'Maximum risk score must not exceed 100' })
  maxRiskScore?: number;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: [
      'createdAt',
      'updatedAt',
      'firstName',
      'lastName',
      'email',
      'riskScore',
    ],
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'riskScore';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc';
}

export class UserStatsDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 1000,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 850,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Number of pending verification users',
    example: 100,
  })
  pendingVerificationUsers: number;

  @ApiProperty({
    description: 'Number of suspended users',
    example: 30,
  })
  suspendedUsers: number;

  @ApiProperty({
    description: 'Number of users with KYC approved',
    example: 750,
  })
  kycApprovedUsers: number;

  @ApiProperty({
    description: 'Number of users with two-factor authentication enabled',
    example: 600,
  })
  twoFactorEnabledUsers: number;

  @ApiProperty({
    description: 'New users this month',
    example: 120,
  })
  newUsersThisMonth: number;

  @ApiProperty({
    description: 'Growth rate percentage',
    example: 12.5,
  })
  growthRate: number;
}

// Response DTOs
export class UserResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '+1234567890', required: false })
  phone?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  dateOfBirth?: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profilePicture?: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: false })
  phoneVerified: boolean;

  @ApiProperty({ enum: KycStatus, example: KycStatus.APPROVED })
  kycStatus: KycStatus;

  @ApiProperty({ enum: TwoFactorStatus, example: TwoFactorStatus.ENABLED })
  twoFactorStatus: TwoFactorStatus;

  @ApiProperty({ example: 'UTC' })
  timezone: string;

  @ApiProperty({ example: 'en' })
  language: string;

  @ApiProperty({ example: true })
  newsletterSubscribed: boolean;

  @ApiProperty({ example: true })
  notificationsEnabled: boolean;

  @ApiProperty({ example: false })
  marketingEmailsEnabled: boolean;

  @ApiProperty({ example: 25.5, required: false })
  riskScore?: number;

  @ApiProperty({ example: ['premium_user', 'trader'], type: [String] })
  roles: string[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: string;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z', required: false })
  lastLoginAt?: string;
}

export class UserListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty({ example: 1000 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 50 })
  totalPages: number;
}
