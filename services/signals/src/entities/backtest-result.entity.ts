import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('backtest_results')
@Index(['strategyId', 'createdAt'])
@Index(['symbol', 'createdAt'])
export class BacktestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  strategyId: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp')
  endDate: Date;

  @Column('decimal', { precision: 15, scale: 2 })
  initialCapital: number;

  @Column('decimal', { precision: 15, scale: 2 })
  finalCapital: number;

  @Column('decimal', { precision: 10, scale: 4 })
  totalReturn: number; // Percentage

  @Column('decimal', { precision: 10, scale: 4 })
  annualizedReturn: number; // Percentage

  @Column('decimal', { precision: 8, scale: 4 })
  volatility: number; // Annualized

  @Column('decimal', { precision: 8, scale: 4 })
  sharpeRatio: number;

  @Column('decimal', { precision: 8, scale: 4 })
  sortinoRatio: number;

  @Column('decimal', { precision: 8, scale: 4 })
  calmarRatio: number;

  @Column('decimal', { precision: 8, scale: 4 })
  maxDrawdown: number; // Percentage

  @Column('decimal', { precision: 8, scale: 4 })
  maxDrawdownDuration: number; // Days

  @Column('int')
  totalTrades: number;

  @Column('int')
  winningTrades: number;

  @Column('int')
  losingTrades: number;

  @Column('decimal', { precision: 5, scale: 2 })
  winRate: number; // Percentage

  @Column('decimal', { precision: 10, scale: 4 })
  avgWin: number; // Percentage

  @Column('decimal', { precision: 10, scale: 4 })
  avgLoss: number; // Percentage

  @Column('decimal', { precision: 8, scale: 4 })
  profitFactor: number;

  @Column('decimal', { precision: 8, scale: 4 })
  expectancy: number;

  @Column('jsonb')
  monthlyReturns: { [month: string]: number };

  @Column('jsonb')
  drawdownPeriods: Array<{
    start: Date;
    end: Date;
    duration: number;
    magnitude: number;
  }>;

  @Column('jsonb')
  performanceMetrics: {
    beta?: number;
    alpha?: number;
    informationRatio?: number;
    trackingError?: number;
    upCaptureRatio?: number;
    downCaptureRatio?: number;
    battingAverage?: number;
    upPercentage?: number;
    downPercentage?: number;
  };

  @Column('jsonb')
  riskMetrics: {
    var95?: number; // Value at Risk (95%)
    var99?: number; // Value at Risk (99%)
    cvar95?: number; // Conditional VaR (95%)
    cvar99?: number; // Conditional VaR (99%)
    ulcerIndex?: number;
    painIndex?: number;
  };

  @Column('jsonb', { nullable: true })
  tradeAnalysis?: {
    avgHoldingPeriod?: number; // Hours
    avgTradeSize?: number; // Percentage of capital
    consecutiveWins?: number;
    consecutiveLosses?: number;
    largestWin?: number;
    largestLoss?: number;
  };

  @Column('jsonb', { nullable: true })
  strategyParams?: {
    [key: string]: any; // Strategy-specific parameters
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  get riskAdjustedReturn(): number {
    return this.sharpeRatio;
  }

  get profitLossRatio(): number {
    return Math.abs(this.avgWin / this.avgLoss);
  }

  get recoveryFactor(): number {
    return this.totalReturn / Math.abs(this.maxDrawdown);
  }
}

@Entity('backtest_trades')
@Index(['backtestId', 'entryTime'])
export class BacktestTrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  backtestId: string;

  @Column({ type: 'varchar', length: 20 })
  symbol: string;

  @Column({ type: 'varchar', length: 10 })
  side: string; // LONG, SHORT

  @Column('timestamp')
  entryTime: Date;

  @Column('decimal', { precision: 15, scale: 6 })
  entryPrice: number;

  @Column('timestamp', { nullable: true })
  exitTime?: Date;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  exitPrice?: number;

  @Column('decimal', { precision: 15, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  pnl?: number; // Percentage

  @Column('decimal', { precision: 10, scale: 4, nullable: true })
  pnlAmount?: number; // Absolute amount

  @Column('int', { nullable: true })
  holdingPeriodHours?: number;

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  maxFavorableExcursion?: number; // MFE - best price during trade

  @Column('decimal', { precision: 8, scale: 4, nullable: true })
  maxAdverseExcursion?: number; // MAE - worst price during trade

  @Column({ type: 'varchar', length: 100, nullable: true })
  exitReason?: string; // STOP_LOSS, TAKE_PROFIT, SIGNAL_EXIT, TIMEOUT

  @Column('jsonb', { nullable: true })
  signalData?: {
    confidence?: number;
    indicators?: any;
    entryConditions?: string[];
    exitConditions?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;
}
