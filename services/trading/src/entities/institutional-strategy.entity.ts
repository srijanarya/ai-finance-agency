import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum StrategyType {
  MOMENTUM = 'momentum',
  MEAN_REVERSION = 'mean_reversion',
  ARBITRAGE = 'arbitrage',
  MARKET_MAKING = 'market_making',
  TREND_FOLLOWING = 'trend_following',
  PAIRS_TRADING = 'pairs_trading',
  STATISTICAL_ARBITRAGE = 'statistical_arbitrage',
  OPTIONS_STRATEGY = 'options_strategy',
  FACTOR_BASED = 'factor_based',
  QUANTITATIVE = 'quantitative',
  FUNDAMENTAL = 'fundamental',
  TECHNICAL = 'technical',
  HYBRID = 'hybrid',
  HIGH_FREQUENCY = 'high_frequency',
  EVENT_DRIVEN = 'event_driven',
  MACRO = 'macro',
}

export enum StrategyStatus {
  DEVELOPMENT = 'development',
  BACKTESTING = 'backtesting',
  PAPER_TRADING = 'paper_trading',
  LIVE = 'live',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  ARCHIVED = 'archived',
}

export enum ExecutionMode {
  MANUAL = 'manual',
  SEMI_AUTO = 'semi_auto',
  FULL_AUTO = 'full_auto',
}

export enum SignalStrength {
  VERY_WEAK = 'very_weak',
  WEAK = 'weak',
  NEUTRAL = 'neutral',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

export interface StrategyParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  value: any;
  defaultValue: any;
  min?: number;
  max?: number;
  description?: string;
  optimizable: boolean;
}

export interface BacktestResult {
  startDate: Date;
  endDate: Date;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  calmarRatio: number;
  volatility: number;
  beta: number;
  alpha: number;
  executionTime: number; // milliseconds
  dataPoints: number;
}

export interface OptimizationResult {
  runId: string;
  timestamp: Date;
  method: 'grid_search' | 'random_search' | 'bayesian' | 'genetic' | 'walk_forward';
  parameters: Record<string, any>;
  objectiveFunction: string;
  bestParams: Record<string, any>;
  bestScore: number;
  iterations: number;
  convergenceHistory: Array<{ iteration: number; score: number }>;
  outOfSamplePerformance?: number;
}

export interface Signal {
  timestamp: Date;
  symbol: string;
  action: 'buy' | 'sell' | 'hold' | 'close';
  strength: SignalStrength;
  confidence: number; // 0-100
  quantity?: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasons: string[];
  indicators: Record<string, number>;
  executed: boolean;
  executionPrice?: number;
  executionTime?: Date;
  pnl?: number;
}

export interface RiskRule {
  name: string;
  type: 'position_size' | 'stop_loss' | 'exposure' | 'correlation' | 'volatility' | 'drawdown';
  enabled: boolean;
  threshold: number;
  action: 'warn' | 'block' | 'reduce' | 'close';
  currentValue?: number;
  triggered: boolean;
  lastTriggered?: Date;
}

@Entity('institutional_strategies')
@Index(['tenantId', 'status'])
@Index(['type', 'status'])
@Index(['portfolioId'])
export class InstitutionalStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: StrategyType,
  })
  type: StrategyType;

  @Column({
    type: 'enum',
    enum: StrategyStatus,
    default: StrategyStatus.DEVELOPMENT,
  })
  status: StrategyStatus;

  @Column({
    type: 'enum',
    enum: ExecutionMode,
    default: ExecutionMode.MANUAL,
  })
  executionMode: ExecutionMode;

  @Column({ nullable: true })
  portfolioId?: string;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ nullable: true })
  approvalDate?: Date;

  // Strategy Configuration
  @Column({ type: 'jsonb', default: [] })
  parameters: StrategyParameter[];

  @Column({ type: 'simple-array', nullable: true })
  symbols?: string[];

  @Column({ type: 'simple-array', nullable: true })
  markets?: string[];

  @Column({ type: 'simple-array', nullable: true })
  assetClasses?: string[];

  @Column({ default: '1m' })
  timeframe: string; // 1m, 5m, 15m, 1h, 4h, 1d, etc.

  @Column({ type: 'jsonb', nullable: true })
  tradingHours?: {
    timezone: string;
    sessions: Array<{
      name: string;
      start: string; // HH:mm
      end: string; // HH:mm
      days: number[]; // 0-6 (Sunday-Saturday)
    }>;
  };

  // Algorithm & Logic
  @Column({ type: 'text', nullable: true })
  algorithmCode?: string; // Stored algorithm code (Python/JavaScript)

  @Column({ nullable: true })
  algorithmVersion?: string;

  @Column({ type: 'jsonb', nullable: true })
  entryRules?: Array<{
    condition: string;
    indicator: string;
    operator: string;
    value: any;
    weight: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  exitRules?: Array<{
    condition: string;
    indicator: string;
    operator: string;
    value: any;
    priority: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  indicators?: Array<{
    name: string;
    type: string;
    params: Record<string, any>;
    weight: number;
  }>;

  // Risk Management
  @Column({ type: 'jsonb', nullable: true })
  riskRules?: RiskRule[];

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxPositionSize?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxLeverage?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxDrawdown?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  stopLossPercent?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  takeProfitPercent?: number;

  @Column({ type: 'jsonb', nullable: true })
  positionSizing?: {
    method: 'fixed' | 'kelly' | 'volatility_based' | 'risk_parity' | 'optimal_f';
    params: Record<string, any>;
  };

  // Performance Metrics
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  totalReturn: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  annualizedReturn: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  sharpeRatio: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  sortinoRatio: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  calmarRatio: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  winRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  profitFactor: number;

  @Column({ default: 0 })
  totalTrades: number;

  @Column({ default: 0 })
  winningTrades: number;

  @Column({ default: 0 })
  losingTrades: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPnl: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realizedPnl: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unrealizedPnl: number;

  // Backtesting
  @Column({ type: 'jsonb', default: [] })
  backtestResults: BacktestResult[];

  @Column({ nullable: true })
  lastBacktestDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  backtestConfig?: {
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    commissionRate: number;
    slippageModel: 'fixed' | 'percentage' | 'market_impact';
    slippageValue: number;
    dataSource: string;
    includeDividends: boolean;
    rebalanceFrequency?: string;
  };

  // Optimization
  @Column({ type: 'jsonb', default: [] })
  optimizationResults: OptimizationResult[];

  @Column({ nullable: true })
  lastOptimizationDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  optimizationConfig?: {
    method: string;
    objectiveFunction: string;
    constraints: Array<{ parameter: string; min: number; max: number }>;
    trainTestSplit: number;
    walkForwardWindows?: number;
    crossValidationFolds?: number;
  };

  // Signal Management
  @Column({ type: 'jsonb', default: [] })
  recentSignals: Signal[];

  @Column({ nullable: true })
  lastSignalTime?: Date;

  @Column({ default: 0 })
  totalSignalsGenerated: number;

  @Column({ default: 0 })
  totalSignalsExecuted: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  signalAccuracy: number;

  // Machine Learning
  @Column({ type: 'jsonb', nullable: true })
  mlConfig?: {
    modelType: string;
    features: string[];
    targetVariable: string;
    trainingDataSize: number;
    validationScore: number;
    modelPath?: string;
    lastTrainedDate?: Date;
    hyperparameters?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  featureImportance?: Record<string, number>;

  // Monitoring & Alerts
  @Column({ type: 'jsonb', nullable: true })
  alerts?: Array<{
    type: string;
    condition: string;
    threshold: number;
    enabled: boolean;
    channels: string[]; // email, sms, webhook
    lastTriggered?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  monitoring?: {
    performanceTracking: boolean;
    slippageAnalysis: boolean;
    executionQuality: boolean;
    riskMetrics: boolean;
    updateFrequency: string; // real-time, 1m, 5m, etc.
  };

  // Deployment & Infrastructure
  @Column({ nullable: true })
  deploymentId?: string;

  @Column({ type: 'jsonb', nullable: true })
  infrastructure?: {
    serverType: 'dedicated' | 'shared' | 'cloud';
    region: string;
    cores: number;
    memory: number; // GB
    latency: number; // microseconds
    uptime: number; // percentage
  };

  @Column({ type: 'jsonb', nullable: true })
  dependencies?: Array<{
    name: string;
    version: string;
    type: 'library' | 'service' | 'data_feed';
  }>;

  // Audit & Compliance
  @Column({ type: 'jsonb', default: [] })
  auditLog: Array<{
    timestamp: Date;
    action: string;
    userId: string;
    details: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  complianceChecks?: {
    regulatoryApproval: boolean;
    riskApproval: boolean;
    backtestValidation: boolean;
    documentationComplete: boolean;
    approvalDate?: Date;
    approver?: string;
    notes?: string;
  };

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ nullable: true })
  publishedDate?: Date;

  @Column({ default: 0 })
  subscriberCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subscriptionFee?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastExecutedAt?: Date;

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  updateMetrics() {
    // Calculate win rate
    if (this.totalTrades > 0) {
      this.winRate = (this.winningTrades / this.totalTrades) * 100;
    }

    // Calculate signal accuracy
    if (this.totalSignalsGenerated > 0) {
      this.signalAccuracy = (this.totalSignalsExecuted / this.totalSignalsGenerated) * 100;
    }
  }

  generateSignal(marketData: any): Signal | null {
    // Placeholder for signal generation logic
    const signal: Signal = {
      timestamp: new Date(),
      symbol: '',
      action: 'hold',
      strength: SignalStrength.NEUTRAL,
      confidence: 0,
      reasons: [],
      indicators: {},
      executed: false,
    };

    // Implement signal generation based on strategy rules
    // This would involve evaluating entry/exit rules, indicators, etc.

    return signal;
  }

  validateRiskRules(position: any): boolean {
    if (!this.riskRules) return true;

    for (const rule of this.riskRules) {
      if (!rule.enabled) continue;

      // Check each risk rule
      switch (rule.type) {
        case 'position_size':
          if (position.size > rule.threshold) {
            if (rule.action === 'block') return false;
          }
          break;
        case 'drawdown':
          if (this.maxDrawdown && this.maxDrawdown > rule.threshold) {
            if (rule.action === 'block') return false;
          }
          break;
        // Add more risk rule validations
      }
    }

    return true;
  }

  optimizeParameters(data: any[], method: string): OptimizationResult {
    // Placeholder for parameter optimization
    const result: OptimizationResult = {
      runId: `opt_${Date.now()}`,
      timestamp: new Date(),
      method: method as any,
      parameters: this.parameters.reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {}),
      objectiveFunction: 'sharpe_ratio',
      bestParams: {},
      bestScore: 0,
      iterations: 0,
      convergenceHistory: [],
    };

    // Implement optimization logic based on method
    // Grid search, random search, bayesian optimization, etc.

    return result;
  }

  runBacktest(data: any[], config: any): BacktestResult {
    // Placeholder for backtesting logic
    const result: BacktestResult = {
      startDate: config.startDate,
      endDate: config.endDate,
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      avgWin: 0,
      avgLoss: 0,
      calmarRatio: 0,
      volatility: 0,
      beta: 0,
      alpha: 0,
      executionTime: 0,
      dataPoints: data.length,
    };

    // Implement backtesting engine
    // Process historical data, generate signals, calculate returns

    return result;
  }

  shouldExecuteTrade(signal: Signal): boolean {
    // Check execution mode
    if (this.executionMode === ExecutionMode.MANUAL) {
      return false;
    }

    // Check signal strength and confidence
    if (signal.confidence < 70) {
      return false;
    }

    // Check risk rules
    if (!this.validateRiskRules({ size: signal.quantity })) {
      return false;
    }

    // Check trading hours
    if (this.tradingHours) {
      const now = new Date();
      // Implement trading hours check
    }

    return true;
  }
}