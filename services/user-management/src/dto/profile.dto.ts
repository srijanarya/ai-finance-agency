import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  Length,
  Matches,
  ValidateNested,
  IsObject,
  IsArray,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationType {
  TRADING_SIGNALS = 'trading_signals',
  MARKET_UPDATES = 'market_updates',
  PORTFOLIO_ALERTS = 'portfolio_alerts',
  PRICE_ALERTS = 'price_alerts',
  EDUCATIONAL_CONTENT = 'educational_content',
  SECURITY_ALERTS = 'security_alerts',
  SYSTEM_NOTIFICATIONS = 'system_notifications',
  MARKETING = 'marketing',
  NEWSLETTER = 'newsletter',
}

export enum RiskTolerance {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum TradingExperience {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum InvestmentGoal {
  WEALTH_PRESERVATION = 'wealth_preservation',
  INCOME_GENERATION = 'income_generation',
  CAPITAL_APPRECIATION = 'capital_appreciation',
  SPECULATION = 'speculation',
  DIVERSIFICATION = 'diversification',
}

export class NotificationPreferencesDto {
  @ApiProperty({ enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Frequency in minutes (e.g., 60 for hourly)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10080) // Max weekly
  frequency?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 8)
  timeZone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  quietHoursStart?: string; // Format: HH:MM

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  quietHoursEnd?: string; // Format: HH:MM
}

export class TradingPreferencesDto {
  @ApiProperty({ enum: RiskTolerance })
  @IsEnum(RiskTolerance)
  riskTolerance: RiskTolerance;

  @ApiProperty({ enum: TradingExperience })
  @IsEnum(TradingExperience)
  experience: TradingExperience;

  @ApiProperty({ enum: InvestmentGoal, isArray: true })
  @IsArray()
  @IsEnum(InvestmentGoal, { each: true })
  investmentGoals: InvestmentGoal[];

  @ApiPropertyOptional({ description: 'Preferred trading session times' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSessions?: string[];

  @ApiPropertyOptional({ description: 'Maximum position size as percentage of portfolio' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(100)
  maxPositionSize?: number;

  @ApiPropertyOptional({ description: 'Stop loss percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  defaultStopLoss?: number;

  @ApiPropertyOptional({ description: 'Take profit percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1000)
  defaultTakeProfit?: number;

  @ApiPropertyOptional({ description: 'Preferred asset classes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredAssets?: string[];

  @ApiPropertyOptional({ description: 'Blacklisted assets' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidedAssets?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoTrading?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  copyTrading?: boolean;

  @ApiPropertyOptional({ description: 'Daily loss limit in base currency' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyLossLimit?: number;

  @ApiPropertyOptional({ description: 'Monthly loss limit in base currency' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyLossLimit?: number;
}

export class ProfilePreferencesDto {
  @ApiPropertyOptional({ description: 'User timezone' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  timezone?: string;

  @ApiPropertyOptional({ description: 'User language preference' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/)
  language?: string;

  @ApiPropertyOptional({ description: 'Currency preference' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({ description: 'Date format preference' })
  @IsOptional()
  @IsString()
  @IsEnum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string;

  @ApiPropertyOptional({ description: 'Time format preference' })
  @IsOptional()
  @IsString()
  @IsEnum(['12h', '24h'])
  timeFormat?: string;

  @ApiPropertyOptional({ description: 'Number format preference' })
  @IsOptional()
  @IsString()
  @IsEnum(['1,234.56', '1.234,56', '1 234,56'])
  numberFormat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  compactView?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;

  @ApiPropertyOptional({ type: [NotificationPreferencesDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto[];

  @ApiPropertyOptional({ type: TradingPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TradingPreferencesDto)
  tradingPreferences?: TradingPreferencesDto;

  @ApiPropertyOptional({ description: 'Custom user settings as key-value pairs' })
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;
}

export class UpdateBasicProfileDto {
  @ApiPropertyOptional({ description: 'User first name' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiPropertyOptional({ description: 'User last name' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @ApiPropertyOptional({ description: 'User phone number' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ description: 'User date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'User bio/description' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  @Transform(({ value }) => value?.trim())
  bio?: string;

  @ApiPropertyOptional({ description: 'User location' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Transform(({ value }) => value?.trim())
  location?: string;

  @ApiPropertyOptional({ description: 'User website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;
}

export class UpdateProfilePreferencesDto extends ProfilePreferencesDto {}

export class UpdateAvatarDto {
  @ApiProperty({ description: 'Base64 encoded image data or file path' })
  @IsString()
  avatar: string;

  @ApiPropertyOptional({ description: 'Image MIME type' })
  @IsOptional()
  @IsString()
  @Matches(/^image\/(jpeg|jpg|png|gif|webp)$/)
  mimeType?: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  fullName: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  profilePicture?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  socialLinks?: Record<string, string>;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiProperty()
  status: string;

  @ApiProperty()
  kycStatus: string;

  @ApiProperty()
  twoFactorStatus: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  language: string;

  @ApiProperty()
  newsletterSubscribed: boolean;

  @ApiProperty()
  notificationsEnabled: boolean;

  @ApiProperty()
  marketingEmailsEnabled: boolean;

  @ApiPropertyOptional()
  riskScore?: number;

  @ApiPropertyOptional()
  lastActivityAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: ProfilePreferencesDto })
  preferences?: ProfilePreferencesDto;

  @ApiProperty({ isArray: true })
  roles: string[];

  @ApiProperty({ isArray: true })
  permissions: string[];
}

export class ChangeEmailDto {
  @ApiProperty({ description: 'New email address' })
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  newEmail: string;

  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @Length(6, 128)
  currentPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @Length(6, 128)
  currentPassword: string;

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
}

export class VerifyPhoneDto {
  @ApiProperty({ description: 'Phone verification code' })
  @IsString()
  @Length(4, 8)
  @Matches(/^\d+$/)
  verificationCode: string;
}

export class UpdatePhoneDto {
  @ApiProperty({ description: 'New phone number' })
  @IsPhoneNumber()
  phoneNumber: string;
}

export class ProfileActivityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  location?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;
}

export class DeactivateAccountDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @Length(6, 128)
  password: string;

  @ApiProperty({ description: 'Reason for account deactivation' })
  @IsString()
  @Length(10, 500)
  reason: string;

  @ApiPropertyOptional({ description: 'Feedback about the service' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  feedback?: string;
}

export class ProfileStatsDto {
  @ApiProperty({ description: 'Days since account creation' })
  accountAge: number;

  @ApiProperty({ description: 'Total number of logins' })
  totalLogins: number;

  @ApiProperty({ description: 'Last login date' })
  lastLogin?: Date;

  @ApiProperty({ description: 'Profile completion percentage' })
  profileCompletion: number;

  @ApiProperty({ description: 'Number of active sessions' })
  activeSessions: number;

  @ApiProperty({ description: 'Security score out of 100' })
  securityScore: number;

  @ApiProperty({ description: 'KYC completion status' })
  kycCompleted: boolean;

  @ApiProperty({ description: '2FA enabled status' })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: 'Trading activity statistics' })
  tradingStats?: Record<string, any>;
}