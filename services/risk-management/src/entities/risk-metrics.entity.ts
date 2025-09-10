import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MetricType {
  VALUE_AT_RISK = 'VALUE_AT_RISK', // VaR
  EXPECTED_SHORTFALL = 'EXPECTED_SHORTFALL', // ES/CVaR
  MAXIMUM_DRAWDOWN = 'MAXIMUM_DRAWDOWN',
  SHARPE_RATIO = 'SHARPE_RATIO',
  SORTINO_RATIO = 'SORTINO_RATIO',
  VOLATILITY = 'VOLATILITY',
  BETA = 'BETA',
  ALPHA = 'ALPHA',
  CORRELATION = 'CORRELATION',
  PORTFOLIO_CONCENTRATION = 'PORTFOLIO_CONCENTRATION',
  LEVERAGE_RATIO = 'LEVERAGE_RATIO',
  LIQUIDITY_RATIO = 'LIQUIDITY_RATIO',
  SECTOR_CONCENTRATION = 'SECTOR_CONCENTRATION',
  CURRENCY_EXPOSURE = 'CURRENCY_EXPOSURE',
  MARGIN_UTILIZATION = 'MARGIN_UTILIZATION',
  POSITION_SIZE_RISK = 'POSITION_SIZE_RISK',
  COUNTERPARTY_RISK = 'COUNTERPARTY_RISK',
}

export enum MetricFrequency {
  REALTIME = 'REALTIME',
  MINUTELY = 'MINUTELY',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum MetricScope {
  USER = 'USER',
  ACCOUNT = 'ACCOUNT',
  PORTFOLIO = 'PORTFOLIO',
  POSITION = 'POSITION',
  ASSET_CLASS = 'ASSET_CLASS',
  SECTOR = 'SECTOR',
  GLOBAL = 'GLOBAL',
}

@Entity('risk_metrics')
@Index(['userId', 'metricType', 'scope', 'timestamp'])
@Index(['accountId', 'metricType', 'timestamp'])
@Index(['portfolioId', 'metricType', 'timestamp'])
@Index(['metricType', 'frequency', 'timestamp'])
export class RiskMetrics {
  @ApiProperty({ description: 'Unique identifier for the risk metric' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID if user-specific metric' })
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @ApiProperty({ description: 'Account ID if account-specific metric' })
  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @ApiProperty({ description: 'Portfolio ID if portfolio-specific metric' })
  @Column({ name: 'portfolio_id', nullable: true })
  portfolioId: string;

  @ApiProperty({ description: 'Position ID if position-specific metric' })
  @Column({ name: 'position_id', nullable: true })
  positionId: string;

  @ApiProperty({ enum: MetricType, description: 'Type of risk metric' })
  @Column({
    type: 'enum',
    enum: MetricType,
    name: 'metric_type',
  })
  metricType: MetricType;

  @ApiProperty({ enum: MetricScope, description: 'Scope of the metric' })
  @Column({
    type: 'enum',
    enum: MetricScope,
  })
  scope: MetricScope;

  @ApiProperty({ enum: MetricFrequency, description: 'Calculation frequency' })
  @Column({
    type: 'enum',
    enum: MetricFrequency,
  })
  frequency: MetricFrequency;

  @ApiProperty({ description: 'Primary metric value' })
  @Column({ type: 'decimal', precision: 15, scale: 6, name: 'metric_value' })
  metricValue: number;

  @ApiProperty({ description: 'Metric timestamp' })
  @Column({ type: 'timestamptz' })
  @Index()
  timestamp: Date;

  @ApiProperty({ description: 'Confidence level (for VaR, ES)' })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'confidence_level',
    nullable: true,
  })
  confidenceLevel: number;

  @ApiProperty({ description: 'Time horizon for calculation (days)' })
  @Column({ name: 'time_horizon', nullable: true })
  timeHorizon: number;

  @ApiProperty({ description: 'Lookback period for calculation (days)' })
  @Column({ name: 'lookback_period', nullable: true })
  lookbackPeriod: number;

  @ApiProperty({ description: 'Detailed metric breakdown' })
  @Column({ type: 'jsonb', name: 'metric_details' })
  metricDetails: {
    components?: Array<{
      name: string;
      value: number;
      weight?: number;
      contribution?: number;
    }>;
    statistics?: {
      mean?: number;
      median?: number;
      stdDev?: number;
      skewness?: number;
      kurtosis?: number;
      min?: number;
      max?: number;
      percentiles?: Record<string, number>;
    };
    correlations?: Record<string, number>;
    sensitivities?: Record<string, number>;
    scenarios?: Array<{
      scenario: string;
      probability: number;
      impact: number;
    }>;
  };

  @ApiProperty({ description: 'Historical trend data' })
  @Column({ type: 'jsonb', name: 'trend_data', nullable: true })
  trendData: {
    previous1d?: number;
    previous1w?: number;
    previous1m?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
    changePercent?: number;
    volatility?: number;
  };

  @ApiProperty({ description: 'Risk attribution analysis' })
  @Column({ type: 'jsonb', name: 'risk_attribution', nullable: true })
  riskAttribution: Array<{
    factor: string;
    contribution: number;
    percentage: number;
    description?: string;
  }>;

  @ApiProperty({ description: 'Stress test results' })
  @Column({ type: 'jsonb', name: 'stress_test_results', nullable: true })
  stressTestResults: Array<{
    scenario: string;
    shockSize: number;
    impact: number;
    impactPercentage: number;
    recoveryTime?: number;
  }>;

  @ApiProperty({ description: 'Model parameters used' })
  @Column({ type: 'jsonb', name: 'model_parameters' })
  modelParameters: {
    model: string;
    version: string;
    parameters: Record<string, any>;
    dataSource: string;
    calculationMethod: string;
    adjustments?: Array<{
      type: string;
      value: number;
      reason: string;
    }>;
  };

  @ApiProperty({ description: 'Data quality metrics' })
  @Column({ type: 'jsonb', name: 'data_quality' })
  dataQuality: {
    completeness: number; // percentage
    accuracy: number; // percentage
    timeliness: number; // seconds delay
    consistency: number; // percentage
    issues?: string[];
  };

  @ApiProperty({ description: 'Benchmark comparisons' })
  @Column({ type: 'jsonb', name: 'benchmarks', nullable: true })
  benchmarks: Array<{
    name: string;
    value: number;
    comparison: 'better' | 'worse' | 'similar';
    difference: number;
    percentile?: number;
  }>;

  @ApiProperty({ description: 'Risk limits associated with this metric' })
  @Column({ type: 'simple-array', name: 'associated_limits', nullable: true })
  associatedLimits: string[]; // Risk limit IDs

  @ApiProperty({ description: 'Warning indicators' })
  @Column({ type: 'jsonb', name: 'warnings', nullable: true })
  warnings: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    threshold?: number;
    currentValue?: number;
  }>;

  @ApiProperty({ description: 'Calculation performance metrics' })
  @Column({ type: 'jsonb', name: 'performance_metrics', nullable: true })
  performanceMetrics: {
    calculationTimeMs: number;
    dataRetrievalTimeMs: number;
    memoryUsageMb: number;
    cpuUsagePercent: number;
  };

  @ApiProperty({ description: 'Next calculation timestamp' })
  @Column({ name: 'next_calculation_at', nullable: true })
  nextCalculationAt: Date;

  @ApiProperty({ description: 'Whether metric is stale/outdated' })
  @Column({ name: 'is_stale', default: false })
  isStale: boolean;

  @ApiProperty({ description: 'Stale threshold in minutes' })
  @Column({ name: 'stale_threshold_minutes', default: 60 })
  staleThresholdMinutes: number;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'When the metric was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'When the metric was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}