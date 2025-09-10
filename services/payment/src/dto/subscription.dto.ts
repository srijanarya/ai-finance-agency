import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus, BillingCycle } from '../entities/subscription.entity';
import { PlanTier } from '../entities/plan.entity';
import { BillingAddressDto } from './payment.dto';

export class CreateSubscriptionDto {
  @ApiProperty({ 
    example: 'plan_premium_monthly',
    description: 'ID of the plan to subscribe to'
  })
  @IsUUID()
  planId: string;

  @ApiProperty({ 
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
    description: 'Billing cycle for the subscription'
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiPropertyOptional({ 
    example: 'pm_1234567890',
    description: 'Payment method ID to use for recurring payments'
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({ 
    example: 1,
    description: 'Quantity of the subscription',
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  quantity?: number = 1;

  @ApiPropertyOptional({ 
    example: 'SAVE20',
    description: 'Coupon code to apply'
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-31',
    description: 'Trial end date (ISO string)'
  })
  @IsOptional()
  @IsDateString()
  trialEnd?: string;

  @ApiPropertyOptional({ 
    description: 'Billing address for the subscription'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the subscription'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether to start the subscription immediately'
  })
  @IsOptional()
  @IsBoolean()
  startImmediately?: boolean = true;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ 
    example: 'plan_premium_yearly',
    description: 'New plan ID to upgrade/downgrade to'
  })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ 
    enum: BillingCycle,
    example: BillingCycle.YEARLY,
    description: 'New billing cycle'
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ 
    example: 'pm_new_payment_method',
    description: 'New payment method ID'
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({ 
    example: 2,
    description: 'New quantity',
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  quantity?: number;

  @ApiPropertyOptional({ 
    example: 'UPGRADE10',
    description: 'Coupon code to apply'
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ 
    description: 'Updated billing address'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @ApiPropertyOptional({ 
    description: 'Additional metadata to update'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
    example: false,
    description: 'Whether to prorate the change immediately'
  })
  @IsOptional()
  @IsBoolean()
  prorate?: boolean = true;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ 
    example: '2024-12-31',
    description: 'Date to cancel the subscription (ISO string). If not provided, cancels immediately'
  })
  @IsOptional()
  @IsDateString()
  cancelAt?: string;

  @ApiPropertyOptional({ 
    example: 'User requested cancellation',
    description: 'Reason for cancellation'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether to cancel at the end of the current period'
  })
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean = true;
}

export class PauseSubscriptionDto {
  @ApiPropertyOptional({ 
    example: '2024-06-01',
    description: 'Date to resume the subscription (ISO string)'
  })
  @IsOptional()
  @IsDateString()
  resumeAt?: string;

  @ApiPropertyOptional({ 
    example: 'Temporary pause for vacation',
    description: 'Reason for pausing'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SubscriptionQueryDto {
  @ApiPropertyOptional({ 
    example: 1,
    description: 'Page number for pagination',
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 20,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({ 
    enum: SubscriptionStatus,
    description: 'Filter by subscription status'
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ 
    enum: BillingCycle,
    description: 'Filter by billing cycle'
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ 
    enum: PlanTier,
    description: 'Filter by plan tier'
  })
  @IsOptional()
  @IsEnum(PlanTier)
  planTier?: PlanTier;

  @ApiPropertyOptional({ 
    example: '2024-01-01',
    description: 'Filter subscriptions created from this date'
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-31',
    description: 'Filter subscriptions created to this date'
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class SubscriptionResponseDto {
  @ApiProperty({ example: 'sub_1234567890' })
  id: string;

  @ApiProperty({ example: 'plan_premium_monthly' })
  planId: string;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @ApiProperty({ example: 29.99 })
  currentPrice: number;

  @ApiProperty({ example: 'USD' })
  currentCurrency: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiPropertyOptional()
  trialStart?: Date;

  @ApiPropertyOptional()
  trialEnd?: Date;

  @ApiProperty()
  currentPeriodStart: Date;

  @ApiProperty()
  currentPeriodEnd: Date;

  @ApiProperty()
  nextBillingDate: Date;

  @ApiPropertyOptional()
  cancelAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  pausedAt?: Date;

  @ApiPropertyOptional()
  resumeAt?: Date;

  @ApiProperty({ example: 0 })
  discountAmount: number;

  @ApiProperty({ example: 0 })
  discountPercent: number;

  @ApiProperty({ example: 8.25 })
  taxPercent: number;

  @ApiPropertyOptional()
  billingAddress?: BillingAddressDto;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Plan information
  @ApiProperty({
    description: 'Associated plan details',
    type: 'object'
  })
  plan?: {
    id: string;
    name: string;
    tier: PlanTier;
    features: Record<string, any>;
  };

  // Computed properties
  @ApiProperty({ example: true })
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  @ApiProperty({ example: false })
  get isTrialing(): boolean {
    return this.status === SubscriptionStatus.TRIALING;
  }

  @ApiProperty({ example: false })
  get isCancelled(): boolean {
    return [SubscriptionStatus.CANCELLED, SubscriptionStatus.INCOMPLETE_EXPIRED].includes(this.status);
  }

  @ApiProperty({ example: 32.45 })
  get effectivePrice(): number {
    let price = this.currentPrice * this.quantity;
    
    if (this.discountAmount > 0) {
      price -= this.discountAmount;
    } else if (this.discountPercent > 0) {
      price -= (price * this.discountPercent / 100);
    }
    
    return Math.max(0, price);
  }

  @ApiProperty({ example: 35.13 })
  get totalWithTax(): number {
    const effectivePrice = this.effectivePrice;
    return effectivePrice + (effectivePrice * this.taxPercent / 100);
  }

  @ApiProperty({ example: 15 })
  get daysUntilNextBilling(): number {
    const now = new Date();
    const timeDiff = this.nextBillingDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}

export class SubscriptionSummaryDto {
  @ApiProperty({ example: 25 })
  totalSubscriptions: number;

  @ApiProperty({ example: 20 })
  activeSubscriptions: number;

  @ApiProperty({ example: 2 })
  trialingSubscriptions: number;

  @ApiProperty({ example: 1 })
  pastDueSubscriptions: number;

  @ApiProperty({ example: 2 })
  cancelledSubscriptions: number;

  @ApiProperty({ example: 1250.00 })
  totalMonthlyRecurringRevenue: number;

  @ApiProperty({ example: 15000.00 })
  totalAnnualRecurringRevenue: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 62.50 })
  averageRevenuePerUser: number;

  @ApiProperty({ example: 0.08 })
  churnRate: number;

  @ApiProperty({
    description: 'Subscription distribution by plan tier',
    type: 'object',
    example: {
      free: 5,
      basic: 10,
      premium: 8,
      enterprise: 2
    }
  })
  subscriptionsByTier: Record<string, number>;

  @ApiProperty({
    description: 'Revenue distribution by plan tier',
    type: 'object',
    example: {
      basic: 200.00,
      premium: 800.00,
      enterprise: 250.00
    }
  })
  revenueByTier: Record<string, number>;
}