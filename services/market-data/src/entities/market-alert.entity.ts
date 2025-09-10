import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AlertType {
  PRICE_ABOVE = 'price_above',
  PRICE_BELOW = 'price_below',
  PRICE_CHANGE = 'price_change',
  VOLUME_SPIKE = 'volume_spike',
  TECHNICAL_INDICATOR = 'technical_indicator',
  NEWS_SENTIMENT = 'news_sentiment'
}

export enum AlertStatus {
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  DISABLED = 'disabled',
  EXPIRED = 'expired'
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('market_alerts')
@Index(['userId', 'status'])
@Index(['symbol', 'alertType'])
export class MarketAlert {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID who created the alert' })
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Trading symbol' })
  @Column({ type: 'varchar', length: 20 })
  @Index()
  symbol: string;

  @ApiProperty({ description: 'Alert type', enum: AlertType })
  @Column({
    type: 'enum',
    enum: AlertType
  })
  alertType: AlertType;

  @ApiProperty({ description: 'Alert title' })
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @ApiProperty({ description: 'Alert description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Alert conditions in JSON format' })
  @Column({ type: 'jsonb' })
  conditions: Record<string, any>;

  @ApiProperty({ description: 'Target price (for price alerts)' })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  targetPrice?: number;

  @ApiProperty({ description: 'Percentage change threshold' })
  @Column({ type: 'decimal', precision: 8, scale: 4, nullable: true })
  percentageThreshold?: number;

  @ApiProperty({ description: 'Volume threshold' })
  @Column({ type: 'bigint', nullable: true })
  volumeThreshold?: number;

  @ApiProperty({ description: 'Alert status', enum: AlertStatus })
  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE
  })
  status: AlertStatus;

  @ApiProperty({ description: 'Alert priority', enum: AlertPriority })
  @Column({
    type: 'enum',
    enum: AlertPriority,
    default: AlertPriority.MEDIUM
  })
  priority: AlertPriority;

  @ApiProperty({ description: 'Is recurring alert' })
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @ApiProperty({ description: 'Alert expiration date' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'When alert was triggered' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  triggeredAt?: Date;

  @ApiProperty({ description: 'Price when alert was triggered' })
  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  triggeredPrice?: number;

  @ApiProperty({ description: 'Number of times alert was triggered' })
  @Column({ type: 'integer', default: 0 })
  triggerCount: number;

  @ApiProperty({ description: 'Last notification sent timestamp' })
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastNotificationAt?: Date;

  @ApiProperty({ description: 'Notification methods (email, sms, push)' })
  @Column({ type: 'simple-array', default: [] })
  notificationMethods: string[];

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}