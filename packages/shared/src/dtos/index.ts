import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsDate, IsArray, ValidateNested, Min, Max, IsUUID, IsNotEmpty, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserStatus, SubscriptionTier, SignalType, AssetType, RiskLevel, TimeFrame, PaymentStatus } from '../enums';

// Base DTOs
export class BaseDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;
}

export class PaginationDto {
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// User Management DTOs
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(SubscriptionTier)
  @IsOptional()
  subscriptionTier?: SubscriptionTier = SubscriptionTier.FREE;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;
}

export class UserResponseDto extends BaseDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsEnum(SubscriptionTier)
  subscriptionTier: SubscriptionTier;

  @IsBoolean()
  emailVerified: boolean;

  @IsBoolean()
  phoneVerified: boolean;

  @IsBoolean()
  twoFactorEnabled: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLoginAt?: Date;
}

// Trading DTOs
export class CreateTradeDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsEnum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'])
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';

  @IsEnum(['BUY', 'SELL'])
  side: 'BUY' | 'SELL';

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  stopLoss?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  takeProfit?: number;

  @IsString()
  @IsOptional()
  signalId?: string;
}

export class TradeResponseDto extends BaseDto {
  @IsString()
  userId: string;

  @IsString()
  accountId: string;

  @IsString()
  symbol: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsString()
  @IsOptional()
  signalId?: string;

  @IsEnum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'])
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';

  @IsEnum(['BUY', 'SELL'])
  side: 'BUY' | 'SELL';

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stopLoss?: number;

  @IsNumber()
  @IsOptional()
  takeProfit?: number;

  @IsEnum(['PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED'])
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';

  @IsNumber()
  @IsOptional()
  fillPrice?: number;

  @IsNumber()
  commission: number;

  @IsNumber()
  @IsOptional()
  pnl?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  executedAt?: Date;
}

// Signal DTOs
export class CreateSignalDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsEnum(SignalType)
  type: SignalType;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  stopLoss?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  takeProfit?: number;

  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @IsEnum(TimeFrame)
  timeFrame: TimeFrame;

  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @IsString()
  @IsNotEmpty()
  analysis: string;

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @IsArray()
  @IsEnum(SubscriptionTier, { each: true })
  targetAudience: SubscriptionTier[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class SignalResponseDto extends BaseDto {
  @IsString()
  symbol: string;

  @IsEnum(AssetType)
  assetType: AssetType;

  @IsEnum(SignalType)
  type: SignalType;

  @IsEnum(['ACTIVE', 'EXPIRED', 'EXECUTED', 'CANCELLED'])
  status: 'ACTIVE' | 'EXPIRED' | 'EXECUTED' | 'CANCELLED';

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  stopLoss?: number;

  @IsNumber()
  @IsOptional()
  takeProfit?: number;

  @IsEnum(RiskLevel)
  riskLevel: RiskLevel;

  @IsEnum(TimeFrame)
  timeFrame: TimeFrame;

  @IsNumber()
  confidence: number;

  @IsString()
  analysis: string;

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @IsString()
  createdBy: string;

  @IsArray()
  @IsEnum(SubscriptionTier, { each: true })
  targetAudience: SubscriptionTier[];

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

// Payment DTOs
export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'PAYPAL', 'STRIPE'])
  method: 'CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL' | 'STRIPE';

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class PaymentResponseDto extends BaseDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsEnum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'PAYPAL', 'STRIPE'])
  method: 'CARD' | 'BANK_TRANSFER' | 'CRYPTO' | 'PAYPAL' | 'STRIPE';

  @IsString()
  transactionId: string;

  @IsString()
  @IsOptional()
  subscriptionId?: string;

  @IsString()
  description: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  processedAt?: Date;
}

// Education DTOs
export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsPositive()
  duration: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisiteCourses?: string[];

  @IsArray()
  @IsString({ each: true })
  learningOutcomes: string[];
}

export class CourseResponseDto extends BaseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  @IsString()
  category: string;

  @IsNumber()
  duration: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisiteCourses?: string[];

  @IsArray()
  @IsString({ each: true })
  learningOutcomes: string[];

  @IsString()
  instructorId: string;
}

// Service Communication DTOs
export class ServiceMessageDto<T = any> {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  correlationId?: string;

  @IsDate()
  @Type(() => Date)
  timestamp: Date;

  @IsEnum(['api-gateway', 'user-management', 'trading', 'signals', 'payment', 'education'])
  source: string;

  @IsEnum(['api-gateway', 'user-management', 'trading', 'signals', 'payment', 'education'])
  @IsOptional()
  destination?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  payload: T;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class HealthCheckDto {
  @IsEnum(['up', 'down', 'degraded'])
  status: 'up' | 'down' | 'degraded';

  @IsOptional()
  checks?: Record<string, {
    status: 'up' | 'down';
    message?: string;
    responseTime?: number;
  }>;

  @IsOptional()
  info?: Record<string, any>;

  @IsOptional()
  error?: Record<string, any>;

  @IsOptional()
  details?: Record<string, any>;
}