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
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletStatus, WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({ 
    enum: WalletType,
    example: WalletType.TRADING,
    description: 'Type of wallet to create'
  })
  @IsEnum(WalletType)
  type: WalletType;

  @ApiProperty({ 
    example: 'USD',
    description: 'Three-letter ISO currency code',
    minLength: 3,
    maxLength: 3
  })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiPropertyOptional({ 
    example: 1000.00,
    description: 'Daily withdrawal limit',
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  dailyWithdrawalLimit?: number;

  @ApiPropertyOptional({ 
    example: 10.00,
    description: 'Minimum balance that must be maintained',
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minimumBalance?: number = 0;

  @ApiPropertyOptional({ 
    example: 2.5,
    description: 'Interest rate for savings wallets (annual percentage)',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  interestRate?: number = 0;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Whether this should be the default wallet for this currency'
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the wallet'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateWalletDto {
  @ApiPropertyOptional({ 
    enum: WalletStatus,
    description: 'New wallet status'
  })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @ApiPropertyOptional({ 
    example: 2000.00,
    description: 'New daily withdrawal limit',
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  dailyWithdrawalLimit?: number;

  @ApiPropertyOptional({ 
    example: 50.00,
    description: 'New minimum balance requirement',
    minimum: 0
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minimumBalance?: number;

  @ApiPropertyOptional({ 
    example: 3.0,
    description: 'New interest rate for savings wallets',
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  interestRate?: number;

  @ApiPropertyOptional({ 
    description: 'Additional metadata to update'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WalletTransactionDto {
  @ApiProperty({ 
    example: 100.00,
    description: 'Amount to deposit/withdraw',
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiPropertyOptional({ 
    example: 'Trading profit deposit',
    description: 'Description of the transaction'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the transaction'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WalletTransferDto {
  @ApiProperty({ 
    example: 'wallet_456',
    description: 'ID of the destination wallet'
  })
  @IsUUID()
  toWalletId: string;

  @ApiProperty({ 
    example: 50.00,
    description: 'Amount to transfer',
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiPropertyOptional({ 
    example: 'Transfer to savings wallet',
    description: 'Description of the transfer'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the transfer'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WalletBalanceOperationDto {
  @ApiProperty({ 
    example: 25.00,
    description: 'Amount to lock/unlock/reserve/unreserve',
    minimum: 0.01
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiPropertyOptional({ 
    example: 'Locked for pending trade',
    description: 'Reason for the operation'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata for the operation'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class WalletQueryDto {
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
    enum: WalletType,
    description: 'Filter by wallet type'
  })
  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;

  @ApiPropertyOptional({ 
    enum: WalletStatus,
    description: 'Filter by wallet status'
  })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @ApiPropertyOptional({ 
    example: 'USD',
    description: 'Filter by currency'
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ 
    example: true,
    description: 'Filter by default wallets only'
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class WalletResponseDto {
  @ApiProperty({ example: 'wallet_123' })
  id: string;

  @ApiProperty({ enum: WalletType, example: WalletType.TRADING })
  type: WalletType;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ enum: WalletStatus, example: WalletStatus.ACTIVE })
  status: WalletStatus;

  @ApiProperty({ example: 1500.00 })
  balance: number;

  @ApiProperty({ example: 100.00 })
  lockedBalance: number;

  @ApiProperty({ example: 50.00 })
  reservedBalance: number;

  @ApiProperty({ example: 5000.00 })
  lifetimeDeposits: number;

  @ApiProperty({ example: 3500.00 })
  lifetimeWithdrawals: number;

  @ApiPropertyOptional({ example: 1000.00 })
  dailyWithdrawalLimit?: number;

  @ApiProperty({ example: 0 })
  dailyWithdrawnAmount: number;

  @ApiProperty()
  lastWithdrawalReset: Date;

  @ApiProperty({ example: 0 })
  minimumBalance: number;

  @ApiProperty({ example: 2.5 })
  interestRate: number;

  @ApiPropertyOptional()
  lastInterestCalculation?: Date;

  @ApiProperty({ example: true })
  isDefault: boolean;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Computed properties
  @ApiProperty({ example: 1350.00 })
  get availableBalance(): number {
    return this.balance - this.lockedBalance - this.reservedBalance;
  }

  @ApiProperty({ example: 1650.00 })
  get totalBalance(): number {
    return this.balance + this.lockedBalance + this.reservedBalance;
  }

  @ApiProperty({ example: true })
  get isActive(): boolean {
    return this.status === WalletStatus.ACTIVE;
  }

  @ApiProperty({ example: 1000.00 })
  get dailyWithdrawalRemaining(): number {
    if (!this.dailyWithdrawalLimit) return Number.POSITIVE_INFINITY;
    return Math.max(0, this.dailyWithdrawalLimit - this.dailyWithdrawnAmount);
  }

  @ApiProperty({ example: 1500.00 })
  get netFlow(): number {
    return this.lifetimeDeposits - this.lifetimeWithdrawals;
  }
}

export class WalletBalanceSummaryDto {
  @ApiProperty({ example: 1350.00 })
  total: number;

  @ApiProperty({ example: 1350.00 })
  available: number;

  @ApiProperty({ example: 100.00 })
  locked: number;

  @ApiProperty({ example: 50.00 })
  reserved: number;

  @ApiProperty({ example: 'USD' })
  currency: string;
}

export class WalletSummaryDto {
  @ApiProperty({ example: 5 })
  totalWallets: number;

  @ApiProperty({ example: 4 })
  activeWallets: number;

  @ApiProperty({ example: 1 })
  inactiveWallets: number;

  @ApiProperty({
    description: 'Total balance by currency',
    type: 'object',
    example: {
      USD: 15000.00,
      EUR: 8500.00,
      BTC: 0.5
    }
  })
  totalBalancesByCurrency: Record<string, number>;

  @ApiProperty({
    description: 'Available balance by currency',
    type: 'object',
    example: {
      USD: 13500.00,
      EUR: 7800.00,
      BTC: 0.45
    }
  })
  availableBalancesByCurrency: Record<string, number>;

  @ApiProperty({
    description: 'Locked balance by currency',
    type: 'object',
    example: {
      USD: 1000.00,
      EUR: 500.00,
      BTC: 0.03
    }
  })
  lockedBalancesByCurrency: Record<string, number>;

  @ApiProperty({
    description: 'Reserved balance by currency',
    type: 'object',
    example: {
      USD: 500.00,
      EUR: 200.00,
      BTC: 0.02
    }
  })
  reservedBalancesByCurrency: Record<string, number>;

  @ApiProperty({
    description: 'Lifetime deposits by currency',
    type: 'object',
    example: {
      USD: 50000.00,
      EUR: 25000.00,
      BTC: 2.5
    }
  })
  lifetimeDepositsByCurrency: Record<string, number>;

  @ApiProperty({
    description: 'Lifetime withdrawals by currency',
    type: 'object',
    example: {
      USD: 35000.00,
      EUR: 16500.00,
      BTC: 2.0
    }
  })
  lifetimeWithdrawalsByCurrency: Record<string, number>;

  @ApiProperty({
    description: 'Net flow by currency',
    type: 'object',
    example: {
      USD: 15000.00,
      EUR: 8500.00,
      BTC: 0.5
    }
  })
  netFlowByCurrency: Record<string, number>;
}