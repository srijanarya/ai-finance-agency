import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Max,
  Length,
  IsObject,
  ValidateNested,
  IsEmail,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, PaymentStatus } from '../entities/payment.entity';

export class BillingAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  line1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @Length(5, 10)
  postal_code: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @Length(2, 2)
  country: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreatePaymentDto {
  @ApiProperty({ 
    example: 99.99,
    description: 'Payment amount in the specified currency',
    minimum: 0.01,
    maximum: 999999.99
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.01)
  @Max(999999.99)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({ 
    example: 'USD',
    description: 'Three-letter ISO currency code',
    minLength: 3,
    maxLength: 3
  })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiProperty({ 
    enum: PaymentType,
    example: PaymentType.ONE_TIME,
    description: 'Type of payment'
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiPropertyOptional({ 
    example: 'pm_1234567890',
    description: 'ID of the payment method to use'
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({ 
    example: 'Payment for premium subscription',
    description: 'Payment description'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    example: 'inv_1234567890',
    description: 'Invoice ID if this payment is for an invoice'
  })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional({ 
    example: 'sub_1234567890',
    description: 'Subscription ID if this payment is for a subscription'
  })
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the payment'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Billing address for the payment'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether to confirm the payment immediately'
  })
  @IsOptional()
  @IsBoolean()
  confirmImmediately?: boolean;
}

export class ConfirmPaymentDto {
  @ApiProperty({ 
    example: 'pm_1234567890',
    description: 'Payment method ID to use for confirmation'
  })
  @IsUUID()
  paymentMethodId: string;

  @ApiPropertyOptional({ 
    example: 'return_url_success_12345',
    description: 'URL to redirect to after successful payment'
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;
}

export class RefundPaymentDto {
  @ApiPropertyOptional({ 
    example: 50.00,
    description: 'Amount to refund. If not provided, full amount will be refunded',
    minimum: 0.01
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount?: number;

  @ApiPropertyOptional({ 
    example: 'Customer requested refund',
    description: 'Reason for the refund'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the refund'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaymentQueryDto {
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
    enum: PaymentStatus,
    description: 'Filter by payment status'
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ 
    enum: PaymentType,
    description: 'Filter by payment type'
  })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @ApiPropertyOptional({ 
    example: 'USD',
    description: 'Filter by currency'
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ 
    example: '2024-01-01',
    description: 'Filter payments from this date (YYYY-MM-DD)'
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-31',
    description: 'Filter payments to this date (YYYY-MM-DD)'
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({ 
    example: 100.00,
    description: 'Filter payments with minimum amount'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minAmount?: number;

  @ApiPropertyOptional({ 
    example: 1000.00,
    description: 'Filter payments with maximum amount'
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  maxAmount?: number;

  @ApiPropertyOptional({ 
    example: 'subscription',
    description: 'Search payments by description'
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'pay_1234567890' })
  id: string;

  @ApiProperty({ example: 'pi_1234567890' })
  paymentIntentId: string;

  @ApiProperty({ example: 99.99 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COMPLETED })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentType, example: PaymentType.ONE_TIME })
  type: PaymentType;

  @ApiPropertyOptional({ example: 'Payment for premium subscription' })
  description?: string;

  @ApiPropertyOptional({ example: 'pm_1234567890' })
  paymentMethodId?: string;

  @ApiPropertyOptional({ example: 'inv_1234567890' })
  invoiceId?: string;

  @ApiPropertyOptional({ example: 'sub_1234567890' })
  subscriptionId?: string;

  @ApiProperty({ example: 5.99 })
  taxAmount: number;

  @ApiProperty({ example: 2.99 })
  feeAmount: number;

  @ApiProperty({ example: 91.01 })
  netAmount: number;

  @ApiProperty({ example: 0 })
  refundedAmount: number;

  @ApiPropertyOptional()
  failureReason?: string;

  @ApiPropertyOptional()
  failureCode?: string;

  @ApiPropertyOptional()
  processedAt?: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Computed properties
  @ApiProperty({ example: true })
  get isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  @ApiProperty({ example: false })
  get isFailed(): boolean {
    return [PaymentStatus.FAILED, PaymentStatus.CANCELLED].includes(this.status);
  }

  @ApiProperty({ example: true })
  get isRefundable(): boolean {
    return this.status === PaymentStatus.COMPLETED && this.refundedAmount < this.amount;
  }

  @ApiProperty({ example: 99.99 })
  get availableRefundAmount(): number {
    return this.amount - this.refundedAmount;
  }
}

export class PaymentSummaryDto {
  @ApiProperty({ example: 150 })
  totalPayments: number;

  @ApiProperty({ example: 12500.00 })
  totalAmount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 145 })
  completedPayments: number;

  @ApiProperty({ example: 12000.00 })
  completedAmount: number;

  @ApiProperty({ example: 3 })
  failedPayments: number;

  @ApiProperty({ example: 300.00 })
  failedAmount: number;

  @ApiProperty({ example: 2 })
  pendingPayments: number;

  @ApiProperty({ example: 200.00 })
  pendingAmount: number;

  @ApiProperty({ example: 5 })
  refundedPayments: number;

  @ApiProperty({ example: 500.00 })
  totalRefundedAmount: number;

  @ApiProperty({ example: 150.00 })
  totalFeesAmount: number;

  @ApiProperty({ example: 1200.00 })
  totalTaxAmount: number;

  @ApiProperty({ example: 11150.00 })
  totalNetAmount: number;
}