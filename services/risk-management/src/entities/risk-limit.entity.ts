import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum LimitType {
  POSITION_SIZE = 'POSITION_SIZE',
  PORTFOLIO_VALUE = 'PORTFOLIO_VALUE',
  DAILY_LOSS = 'DAILY_LOSS',
  WEEKLY_LOSS = 'WEEKLY_LOSS',
  MONTHLY_LOSS = 'MONTHLY_LOSS',
  DRAWDOWN = 'DRAWDOWN',
  LEVERAGE = 'LEVERAGE',
  CONCENTRATION = 'CONCENTRATION',
  VAR_LIMIT = 'VAR_LIMIT', // Value at Risk
  SECTOR_EXPOSURE = 'SECTOR_EXPOSURE',
  CURRENCY_EXPOSURE = 'CURRENCY_EXPOSURE',
  COUNTERPARTY_EXPOSURE = 'COUNTERPARTY_EXPOSURE',
  TRADE_COUNT = 'TRADE_COUNT',
  TRADE_SIZE = 'TRADE_SIZE',
  INTRADAY_LOSS = 'INTRADAY_LOSS',
  VOLATILITY_LIMIT = 'VOLATILITY_LIMIT',
  CORRELATION_LIMIT = 'CORRELATION_LIMIT',
}

export enum LimitScope {
  USER = 'USER',
  ACCOUNT = 'ACCOUNT',
  PORTFOLIO = 'PORTFOLIO',
  ASSET_CLASS = 'ASSET_CLASS',
  SECTOR = 'SECTOR',
  SYMBOL = 'SYMBOL',
  STRATEGY = 'STRATEGY',
  GLOBAL = 'GLOBAL',
}

export enum LimitStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BREACHED = 'BREACHED',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED',
}

export enum LimitFrequency {
  REALTIME = 'REALTIME',
  INTRADAY = 'INTRADAY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

@Entity('risk_limits')
@Index(['userId', 'limitType', 'scope'])
@Index(['accountId', 'limitType'])
@Index(['status', 'limitType'])
@Index(['effectiveFrom', 'effectiveTo'])
export class RiskLimit {
  @ApiProperty({ description: 'Unique identifier for the risk limit' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID if user-specific limit' })
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Account ID if account-specific limit' })
  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ApiProperty({ description: 'Portfolio ID if portfolio-specific limit' })
  @Column({ name: 'portfolio_id', nullable: true })
  portfolioId: string;

  @ApiProperty({ enum: LimitType, description: 'Type of risk limit' })
  @Column({
    type: 'enum',
    enum: LimitType,
    name: 'limit_type',
  })
  limitType: LimitType;

  @ApiProperty({ enum: LimitScope, description: 'Scope of the limit' })
  @Column({
    type: 'enum',
    enum: LimitScope,
  })
  scope: LimitScope;

  @ApiProperty({ description: 'Limit name/description' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Detailed description of the limit' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Limit value (monetary, percentage, count)' })
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'limit_value' })
  limitValue: number;

  @ApiProperty({ description: 'Warning threshold (% of limit)' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'warning_threshold',
    default: 80.0,
  })
  warningThreshold: number;

  @ApiProperty({ description: 'Current utilization of the limit' })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'current_utilization',
    default: 0.0,
  })
  currentUtilization: number;

  @ApiProperty({ description: 'Current utilization percentage' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'utilization_percentage',
    default: 0.0,
  })
  utilizationPercentage: number;

  @ApiProperty({ description: 'Peak utilization reached' })
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    name: 'peak_utilization',
    default: 0.0,
  })
  peakUtilization: number;

  @ApiProperty({ description: 'When peak utilization was reached' })
  @Column({ name: 'peak_utilization_at', nullable: true })
  peakUtilizationAt: Date;

  @ApiProperty({ enum: LimitStatus, description: 'Current limit status' })
  @Column({
    type: 'enum',
    enum: LimitStatus,
    default: LimitStatus.ACTIVE,
  })
  status: LimitStatus;

  @ApiProperty({ enum: LimitFrequency, description: 'How often limit is checked' })
  @Column({
    type: 'enum',
    enum: LimitFrequency,
    default: LimitFrequency.REALTIME,
  })
  frequency: LimitFrequency;

  @ApiProperty({ description: 'Limit configuration parameters' })
  @Column({ type: 'jsonb', name: 'limit_config' })
  limitConfig: {
    currency?: string;
    assetClass?: string;
    sector?: string;
    symbol?: string;
    timeWindow?: string;
    resetFrequency?: string;
    rolloverSettings?: Record<string, any>;
    customRules?: Array<{
      condition: string;
      action: string;
      parameters: Record<string, any>;
    }>;
  };

  @ApiProperty({ description: 'Actions to take when limit is breached' })
  @Column({ type: 'jsonb', name: 'breach_actions' })
  breachActions: {
    preventNewTrades?: boolean;
    closePositions?: boolean;
    reduceLeverage?: boolean;
    sendAlert?: boolean;
    notifyUsers?: string[];
    escalateTo?: string[];
    customActions?: Array<{
      action: string;
      parameters: Record<string, any>;
    }>;
  };

  @ApiProperty({ description: 'When the limit becomes effective' })
  @Column({ name: 'effective_from' })
  effectiveFrom: Date;

  @ApiProperty({ description: 'When the limit expires' })
  @Column({ name: 'effective_to', nullable: true })
  effectiveTo: Date;

  @ApiProperty({ description: 'Time zone for limit calculations' })
  @Column({ name: 'time_zone', default: 'UTC' })
  timeZone: string;

  @ApiProperty({ description: 'Business days only flag' })
  @Column({ name: 'business_days_only', default: false })
  businessDaysOnly: boolean;

  @ApiProperty({ description: 'Market hours only flag' })
  @Column({ name: 'market_hours_only', default: false })
  marketHoursOnly: boolean;

  @ApiProperty({ description: 'Override permissions' })
  @Column({ type: 'simple-array', name: 'override_permissions', nullable: true })
  overridePermissions: string[]; // User IDs who can override this limit

  @ApiProperty({ description: 'Current overrides in effect' })
  @Column({ type: 'jsonb', name: 'current_overrides', nullable: true })
  currentOverrides: Array<{
    overrideBy: string;
    overrideAt: Date;
    overrideUntil: Date;
    reason: string;
    newLimit: number;
  }>;

  @ApiProperty({ description: 'Limit history and changes' })
  @Column({ type: 'jsonb', name: 'limit_history', nullable: true })
  limitHistory: Array<{
    changedBy: string;
    changedAt: Date;
    previousValue: number;
    newValue: number;
    reason: string;
  }>;

  @ApiProperty({ description: 'Last limit check timestamp' })
  @Column({ name: 'last_checked_at', nullable: true })
  lastCheckedAt: Date;

  @ApiProperty({ description: 'Next scheduled check timestamp' })
  @Column({ name: 'next_check_at', nullable: true })
  nextCheckAt: Date;

  @ApiProperty({ description: 'Who created the limit' })
  @Column({ name: 'created_by' })
  createdBy: string;

  @ApiProperty({ description: 'Who last modified the limit' })
  @Column({ name: 'modified_by', nullable: true })
  modifiedBy: string;

  @ApiProperty({ description: 'Approval status for limit changes' })
  @Column({ name: 'approval_status', nullable: true })
  approvalStatus: string;

  @ApiProperty({ description: 'Who approved the limit' })
  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @ApiProperty({ description: 'When the limit was approved' })
  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the limit was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'When the limit was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}