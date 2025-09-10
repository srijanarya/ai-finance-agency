import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
  STRONG_BUY = 'STRONG_BUY',
  STRONG_SELL = 'STRONG_SELL',
}

export enum SignalStatus {
  GENERATED = 'GENERATED',
  PUBLISHED = 'PUBLISHED',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum TimeFrame {
  ONE_MIN = '1min',
  FIVE_MIN = '5min',
  FIFTEEN_MIN = '15min',
  THIRTY_MIN = '30min',
  ONE_HOUR = '1h',
  FOUR_HOUR = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
}

@Entity('signals')
@Index(['symbol', 'timeFrame', 'createdAt'])
@Index(['signalType', 'status', 'createdAt'])
@Index(['confidence', 'createdAt'])
export class Signal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  symbol: string;

  @Column({
    type: 'enum',
    enum: SignalType,
  })
  signalType: SignalType;

  @Column({
    type: 'enum',
    enum: SignalStatus,
    default: SignalStatus.GENERATED,
  })
  status: SignalStatus;

  @Column({
    type: 'enum',
    enum: TimeFrame,
  })
  timeFrame: TimeFrame;

  @Column('decimal', { precision: 4, scale: 3 })
  confidence: number; // 0.0 to 1.0

  @Column('decimal', { precision: 15, scale: 6 })
  entryPrice: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  targetPrice?: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  stopLoss?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  riskRewardRatio?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  expectedReturn?: number; // Percentage

  @Column('text', { nullable: true })
  analysis?: string;

  @Column('jsonb', { nullable: true })
  technicalIndicators?: {
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
    bollinger?: { upper: number; middle: number; lower: number };
    ema?: { [key: string]: number }; // EMA values for different periods
    volume?: number;
    volatility?: number;
  };

  @Column('jsonb', { nullable: true })
  fundamentalData?: {
    marketCap?: number;
    pe?: number;
    eps?: number;
    revenue?: number;
    profitMargin?: number;
  };

  @Column('jsonb', { nullable: true })
  sentimentData?: {
    newsScore?: number;
    socialMediaScore?: number;
    analystRating?: string;
    institutionalFlow?: number;
  };

  @Column('jsonb', { nullable: true })
  mlFeatures?: {
    pricePattern?: string;
    volumePattern?: string;
    seasonality?: number;
    marketRegime?: string;
    correlationStrength?: number;
  };

  @Column('timestamp', { nullable: true })
  expiresAt?: Date;

  @Column('timestamp', { nullable: true })
  executedAt?: Date;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  executionPrice?: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  actualReturn?: number; // Actual percentage return

  @Column('varchar', { length: 100, nullable: true })
  @Index()
  strategyId?: string; // Which strategy generated this signal

  @Column('jsonb', { nullable: true })
  backtestMetrics?: {
    winRate?: number;
    avgReturn?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    totalTrades?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get isActive(): boolean {
    return (
      this.status === SignalStatus.GENERATED ||
      this.status === SignalStatus.PUBLISHED
    );
  }

  get isExpired(): boolean {
    return this.expiresAt && new Date() > this.expiresAt;
  }

  get profitLoss(): number | null {
    if (!this.executionPrice || !this.actualReturn) return null;
    return this.actualReturn;
  }
}
