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

export enum PortfolioType {
  EQUITY = 'equity',
  FIXED_INCOME = 'fixed_income',
  MIXED = 'mixed',
  DERIVATIVES = 'derivatives',
  COMMODITIES = 'commodities',
  CRYPTO = 'crypto',
  MULTI_ASSET = 'multi_asset',
  HEDGE_FUND = 'hedge_fund',
  PRIVATE_EQUITY = 'private_equity',
  REAL_ESTATE = 'real_estate',
}

export enum PortfolioStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  LIQUIDATING = 'liquidating',
  CLOSED = 'closed',
}

export enum RebalancingStrategy {
  PERIODIC = 'periodic',
  THRESHOLD = 'threshold',
  TACTICAL = 'tactical',
  STRATEGIC = 'strategic',
  DYNAMIC = 'dynamic',
  CONSTANT_MIX = 'constant_mix',
  CPPI = 'cppi', // Constant Proportion Portfolio Insurance
}

export interface Position {
  symbol: string;
  name: string;
  assetClass: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  weight: number; // Percentage of portfolio
  targetWeight?: number;
  sector?: string;
  country?: string;
  currency: string;
  lastUpdated: Date;
}

export interface AllocationTarget {
  assetClass: string;
  targetWeight: number;
  minWeight: number;
  maxWeight: number;
  rebalanceTolerance: number;
}

export interface RiskMetrics {
  var95: number; // Value at Risk (95% confidence)
  var99: number; // Value at Risk (99% confidence)
  cvar: number; // Conditional Value at Risk
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  beta: number;
  alpha: number;
  treynorRatio: number;
  informationRatio: number;
  trackingError: number;
  downwardDeviation: number;
  volatility: number;
  correlationToBenchmark: number;
}

export interface PerformanceMetrics {
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
  quarterlyReturn: number;
  yearlyReturn: number;
  totalReturn: number;
  annualizedReturn: number;
  benchmarkReturn: number;
  excessReturn: number;
  cumulativeReturn: number;
  bestDay: { date: Date; return: number };
  worstDay: { date: Date; return: number };
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

export interface ComplianceConstraints {
  maxConcentration: number; // Max % in single position
  maxSectorExposure: number;
  maxCountryExposure: number;
  maxLeverage: number;
  minLiquidity: number;
  restrictedSymbols: string[];
  allowedAssetClasses: string[];
  esgMinScore?: number;
  excludedSectors?: string[];
}

@Entity('portfolios')
@Index(['tenantId', 'status'])
@Index(['managerId'])
@Index(['benchmarkId'])
export class Portfolio {
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
    enum: PortfolioType,
    default: PortfolioType.MULTI_ASSET,
  })
  type: PortfolioType;

  @Column({
    type: 'enum',
    enum: PortfolioStatus,
    default: PortfolioStatus.ACTIVE,
  })
  status: PortfolioStatus;

  @Column()
  managerId: string;

  @Column({ nullable: true })
  benchmarkId?: string;

  @Column({ nullable: true })
  benchmarkSymbol?: string;

  @Column({ default: 'USD' })
  baseCurrency: string;

  // Financial Metrics
  @Column({ type: 'decimal', precision: 20, scale: 2 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  cashBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  investedAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalDeposits: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalWithdrawals: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  unrealizedPnl: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  realizedPnl: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalFees: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalTaxes: number;

  // Positions
  @Column({ type: 'jsonb', default: [] })
  positions: Position[];

  @Column({ default: 0 })
  positionCount: number;

  // Allocation & Rebalancing
  @Column({ type: 'jsonb', nullable: true })
  allocationTargets?: AllocationTarget[];

  @Column({
    type: 'enum',
    enum: RebalancingStrategy,
    nullable: true,
  })
  rebalancingStrategy?: RebalancingStrategy;

  @Column({ type: 'jsonb', nullable: true })
  rebalancingConfig?: {
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    threshold?: number; // Deviation threshold to trigger rebalancing
    minTradeSize?: number;
    maxTurnover?: number; // Max portfolio turnover per rebalancing
    blackoutDates?: string[];
    lastRebalanceDate?: Date;
    nextRebalanceDate?: Date;
  };

  // Risk Management
  @Column({ type: 'jsonb', nullable: true })
  riskMetrics?: RiskMetrics;

  @Column({ type: 'jsonb', nullable: true })
  riskLimits?: {
    maxVar95?: number;
    maxDrawdown?: number;
    maxVolatility?: number;
    minSharpeRatio?: number;
    maxBeta?: number;
    stopLossLevel?: number;
    takeProfitLevel?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  complianceConstraints?: ComplianceConstraints;

  // Performance
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics?: PerformanceMetrics;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  inceptionReturn: number;

  @Column({ nullable: true })
  inceptionDate?: Date;

  // Strategy & Objectives
  @Column({ nullable: true })
  strategyId?: string;

  @Column({ type: 'jsonb', nullable: true })
  investmentObjectives?: {
    returnTarget: number; // Annual return target %
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    timeHorizon: string; // e.g., "5 years"
    liquidityNeeds: 'low' | 'medium' | 'high';
    incomeFocus: boolean;
    capitalAppreciation: boolean;
    capitalPreservation: boolean;
  };

  // Fees & Expenses
  @Column({ type: 'jsonb', nullable: true })
  feeStructure?: {
    managementFee: number; // Annual %
    performanceFee: number; // % of profits
    highWaterMark?: number;
    hurdle?: number;
    adminFee?: number;
    custodyFee?: number;
    transactionFeeRate?: number;
  };

  // Tax Management
  @Column({ type: 'jsonb', nullable: true })
  taxConfig?: {
    taxLotMethod: 'fifo' | 'lifo' | 'hifo' | 'specific';
    taxHarvestingEnabled: boolean;
    washSaleCheckEnabled: boolean;
    capitalGainsRate: number;
    dividendTaxRate: number;
  };

  // Analytics & Reporting
  @Column({ type: 'jsonb', nullable: true })
  analytics?: {
    sectorAllocation: Record<string, number>;
    geographicAllocation: Record<string, number>;
    assetClassAllocation: Record<string, number>;
    currencyExposure: Record<string, number>;
    topHoldings: Array<{ symbol: string; weight: number }>;
    concentrationRisk: number;
    liquidityProfile: {
      immediate: number; // % liquidatable in 1 day
      shortTerm: number; // % liquidatable in 7 days
      mediumTerm: number; // % liquidatable in 30 days
    };
  };

  // Historical Data
  @Column({ type: 'jsonb', default: [] })
  historicalNav: Array<{
    date: Date;
    nav: number;
    totalValue: number;
    return: number;
  }>;

  @Column({ type: 'jsonb', default: [] })
  transactions: Array<{
    date: Date;
    type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'dividend' | 'fee';
    symbol?: string;
    quantity?: number;
    price?: number;
    amount: number;
    description?: string;
  }>;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemManaged: boolean;

  @Column({ default: false })
  isModelPortfolio: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastCalculatedAt?: Date;

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  calculateMetrics() {
    // Calculate total value
    if (this.positions && this.positions.length > 0) {
      const positionsValue = this.positions.reduce((sum, pos) => sum + pos.marketValue, 0);
      this.totalValue = positionsValue + this.cashBalance;
      
      // Calculate unrealized P&L
      this.unrealizedPnl = this.positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
      
      // Update position count
      this.positionCount = this.positions.length;
      
      // Calculate weights
      this.positions = this.positions.map(pos => ({
        ...pos,
        weight: (pos.marketValue / this.totalValue) * 100,
      }));
    }
  }

  calculateRiskMetrics(): RiskMetrics {
    // Placeholder for risk calculation logic
    return {
      var95: 0,
      var99: 0,
      cvar: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      maxDrawdown: 0,
      currentDrawdown: 0,
      beta: 0,
      alpha: 0,
      treynorRatio: 0,
      informationRatio: 0,
      trackingError: 0,
      downwardDeviation: 0,
      volatility: 0,
      correlationToBenchmark: 0,
    };
  }

  calculatePerformance(period: string): number {
    // Placeholder for performance calculation
    return 0;
  }

  needsRebalancing(): boolean {
    if (!this.allocationTargets || !this.rebalancingConfig) {
      return false;
    }

    // Check if any position deviates from target by more than threshold
    for (const target of this.allocationTargets) {
      const actualWeight = this.analytics?.assetClassAllocation[target.assetClass] || 0;
      const deviation = Math.abs(actualWeight - target.targetWeight);
      
      if (deviation > (this.rebalancingConfig.threshold || 5)) {
        return true;
      }
    }

    return false;
  }

  checkComplianceViolations(): string[] {
    const violations: string[] = [];

    if (!this.complianceConstraints) {
      return violations;
    }

    // Check concentration limits
    if (this.positions) {
      for (const position of this.positions) {
        if (position.weight > this.complianceConstraints.maxConcentration) {
          violations.push(`Position ${position.symbol} exceeds max concentration limit`);
        }
      }
    }

    // Check restricted symbols
    if (this.complianceConstraints.restrictedSymbols && this.positions) {
      for (const position of this.positions) {
        if (this.complianceConstraints.restrictedSymbols.includes(position.symbol)) {
          violations.push(`Holding restricted symbol: ${position.symbol}`);
        }
      }
    }

    // Check sector exposure
    if (this.analytics?.sectorAllocation) {
      for (const [sector, weight] of Object.entries(this.analytics.sectorAllocation)) {
        if (weight > this.complianceConstraints.maxSectorExposure) {
          violations.push(`Sector ${sector} exceeds max exposure limit`);
        }
      }
    }

    return violations;
  }

  calculateTaxLiability(): number {
    if (!this.taxConfig) {
      return 0;
    }

    const capitalGains = this.realizedPnl > 0 ? this.realizedPnl * this.taxConfig.capitalGainsRate : 0;
    // Add dividend tax calculation if needed
    
    return capitalGains;
  }
}