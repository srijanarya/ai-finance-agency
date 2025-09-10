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
} from 'typeorm';

export enum InstitutionalOrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
  ICEBERG = 'iceberg',
  TWAP = 'twap',
  VWAP = 'vwap',
  POV = 'pov', // Percentage of Volume
  IS = 'implementation_shortfall',
  CUSTOM_ALGO = 'custom_algo',
}

export enum InstitutionalOrderStatus {
  PENDING = 'pending',
  WORKING = 'working',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum TimeInForce {
  DAY = 'day',
  GTC = 'gtc', // Good Till Cancelled
  IOC = 'ioc', // Immediate or Cancel
  FOK = 'fok', // Fill or Kill
  GTD = 'gtd', // Good Till Date
}

export enum ExecutionVenue {
  NYSE = 'nyse',
  NASDAQ = 'nasdaq',
  CBOE = 'cboe',
  DARK_POOL = 'dark_pool',
  ECN = 'ecn',
  SOR = 'sor', // Smart Order Router
  OTC = 'otc',
  INTERNAL = 'internal',
}

@Entity('institutional_orders')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'symbol'])
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'portfolioId'])
@Index(['clientOrderId'], { unique: true, where: 'client_order_id IS NOT NULL' })
@Index(['createdAt'])
@Index(['executedAt'])
@Index(['status'])
export class InstitutionalOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'portfolio_id', nullable: true })
  @Index()
  portfolioId?: string;

  @Column({ name: 'client_order_id', nullable: true, unique: true })
  clientOrderId?: string;

  @Column({ name: 'parent_order_id', nullable: true })
  @Index()
  parentOrderId?: string;

  // Order Details
  @Column()
  @Index()
  symbol: string;

  @Column({
    type: 'enum',
    enum: OrderSide,
  })
  side: OrderSide;

  @Column({
    name: 'order_type',
    type: 'enum',
    enum: InstitutionalOrderType,
  })
  orderType: InstitutionalOrderType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ name: 'executed_quantity', type: 'decimal', precision: 20, scale: 8, default: 0 })
  executedQuantity: number;

  @Column({ name: 'remaining_quantity', type: 'decimal', precision: 20, scale: 8, default: 0 })
  remainingQuantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  price?: number;

  @Column({ name: 'stop_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  stopPrice?: number;

  @Column({ name: 'average_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  averagePrice?: number;

  @Column({ name: 'limit_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  limitPrice?: number;

  @Column({
    type: 'enum',
    enum: InstitutionalOrderStatus,
    default: InstitutionalOrderStatus.PENDING,
  })
  @Index()
  status: InstitutionalOrderStatus;

  @Column({
    name: 'time_in_force',
    type: 'enum',
    enum: TimeInForce,
    default: TimeInForce.DAY,
  })
  timeInForce: TimeInForce;

  @Column({ name: 'good_till_date', type: 'timestamp', nullable: true })
  goodTillDate?: Date;

  // Execution Details
  @Column({ name: 'exchange_order_id', nullable: true })
  exchangeOrderId?: string;

  @Column({
    name: 'execution_venue',
    type: 'enum',
    enum: ExecutionVenue,
    nullable: true,
  })
  executionVenue?: ExecutionVenue;

  @Column({ name: 'preferred_venues', type: 'simple-array', nullable: true })
  preferredVenues?: string[];

  @Column({ name: 'fill_count', default: 0 })
  fillCount: number;

  @Column({ name: 'partial_fill_count', default: 0 })
  partialFillCount: number;

  // Algorithm Parameters
  @Column({ name: 'algorithm_name', nullable: true })
  algorithmName?: string;

  @Column({ name: 'algorithm_params', type: 'simple-json', nullable: true })
  algorithmParams?: {
    participationRate?: number;
    startTime?: string;
    endTime?: string;
    minFillSize?: number;
    maxFillSize?: number;
    priceLimit?: number;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    darkPoolUsage?: boolean;
    icebergSize?: number;
    displayQuantity?: number;
    sliceSize?: number;
    interval?: number;
    benchmark?: string;
    customParams?: Record<string, any>;
  };

  // Financial Metrics
  @Column({ name: 'notional_value', type: 'decimal', precision: 20, scale: 2, nullable: true })
  notionalValue?: number;

  @Column({ name: 'executed_value', type: 'decimal', precision: 20, scale: 2, nullable: true })
  executedValue?: number;

  @Column({ name: 'commission', type: 'decimal', precision: 10, scale: 4, nullable: true })
  commission?: number;

  @Column({ name: 'fees', type: 'decimal', precision: 10, scale: 4, nullable: true })
  fees?: number;

  @Column({ name: 'tax', type: 'decimal', precision: 10, scale: 4, nullable: true })
  tax?: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalCost?: number;

  // Performance Metrics
  @Column({ name: 'slippage', type: 'decimal', precision: 10, scale: 6, nullable: true })
  slippage?: number;

  @Column({ name: 'market_impact', type: 'decimal', precision: 10, scale: 6, nullable: true })
  marketImpact?: number;

  @Column({ name: 'implementation_shortfall', type: 'decimal', precision: 10, scale: 6, nullable: true })
  implementationShortfall?: number;

  @Column({ name: 'benchmark_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  benchmarkPrice?: number;

  @Column({ name: 'arrival_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  arrivalPrice?: number;

  @Column({ name: 'vwap_benchmark', type: 'decimal', precision: 20, scale: 8, nullable: true })
  vwapBenchmark?: number;

  @Column({ name: 'execution_quality_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  executionQualityScore?: number;

  // Risk & Compliance
  @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  riskScore?: number;

  @Column({ name: 'compliance_status', nullable: true })
  complianceStatus?: 'pending' | 'approved' | 'rejected' | 'flagged';

  @Column({ name: 'compliance_checks', type: 'simple-json', nullable: true })
  complianceChecks?: {
    positionLimit?: { passed: boolean; details?: string };
    concentrationLimit?: { passed: boolean; details?: string };
    restrictedList?: { passed: boolean; details?: string };
    washSale?: { passed: boolean; details?: string };
    bestExecution?: { passed: boolean; details?: string };
    customChecks?: Record<string, { passed: boolean; details?: string }>;
  };

  @Column({ name: 'compliance_notes', type: 'text', nullable: true })
  complianceNotes?: string;

  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  // Metadata
  @Column({ nullable: true })
  strategy?: string;

  @Column({ name: 'strategy_id', nullable: true })
  strategyId?: string;

  @Column({ nullable: true })
  broker?: string;

  @Column({ name: 'broker_id', nullable: true })
  brokerId?: string;

  @Column({ name: 'custodian', nullable: true })
  custodian?: string;

  @Column({ name: 'prime_broker', nullable: true })
  primeBroker?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  // Allocation Information
  @Column({ name: 'allocation_method', nullable: true })
  allocationMethod?: 'pro_rata' | 'fifo' | 'lifo' | 'high_low' | 'custom';

  @Column({ name: 'allocation_instructions', type: 'simple-json', nullable: true })
  allocationInstructions?: Array<{
    accountId: string;
    quantity?: number;
    percentage?: number;
    priority?: number;
  }>;

  // Settlement Information
  @Column({ name: 'settlement_date', type: 'date', nullable: true })
  settlementDate?: Date;

  @Column({ name: 'settlement_currency', default: 'USD' })
  settlementCurrency: string;

  @Column({ name: 'settlement_status', nullable: true })
  settlementStatus?: 'pending' | 'partial' | 'complete' | 'failed';

  // Error Handling
  @Column({ name: 'error_code', nullable: true })
  errorCode?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', default: 3 })
  maxRetries: number;

  // Timestamps
  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'acknowledged_at', type: 'timestamp', nullable: true })
  acknowledgedAt?: Date;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  @Index()
  executedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @Column({ name: 'last_fill_at', type: 'timestamp', nullable: true })
  lastFillAt?: Date;

  @Column({ name: 'execution_start_time', type: 'timestamp', nullable: true })
  executionStartTime?: Date;

  @Column({ name: 'execution_end_time', type: 'timestamp', nullable: true })
  executionEndTime?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => InstitutionalOrderFill, (fill) => fill.order)
  fills: InstitutionalOrderFill[];

  @OneToMany(() => InstitutionalOrder, (order) => order.parentOrder)
  childOrders: InstitutionalOrder[];

  @ManyToOne(() => InstitutionalOrder, (order) => order.childOrders)
  @JoinColumn({ name: 'parent_order_id' })
  parentOrder?: InstitutionalOrder;

  // Virtual Properties
  get fillRate(): number {
    return this.quantity > 0 ? (this.executedQuantity / this.quantity) * 100 : 0;
  }

  get isComplete(): boolean {
    return this.status === InstitutionalOrderStatus.FILLED ||
           this.status === InstitutionalOrderStatus.CANCELLED ||
           this.status === InstitutionalOrderStatus.REJECTED ||
           this.status === InstitutionalOrderStatus.EXPIRED;
  }

  get isActive(): boolean {
    return this.status === InstitutionalOrderStatus.PENDING ||
           this.status === InstitutionalOrderStatus.WORKING ||
           this.status === InstitutionalOrderStatus.PARTIALLY_FILLED;
  }

  get executionTimeMs(): number | null {
    if (!this.executionStartTime || !this.executionEndTime) return null;
    return this.executionEndTime.getTime() - this.executionStartTime.getTime();
  }

  get averageFillSize(): number {
    return this.fillCount > 0 ? this.executedQuantity / this.fillCount : 0;
  }

  get hasSlippage(): boolean {
    return this.slippage !== null && this.slippage !== 0;
  }

  get hasMarketImpact(): boolean {
    return this.marketImpact !== null && this.marketImpact !== 0;
  }

  get totalTransactionCost(): number {
    const executedValue = this.executedValue || 0;
    const commission = this.commission || 0;
    const fees = this.fees || 0;
    const tax = this.tax || 0;
    return executedValue + commission + fees + tax;
  }

  get effectivePrice(): number | null {
    if (!this.executedQuantity || this.executedQuantity === 0) return null;
    return this.totalTransactionCost / this.executedQuantity;
  }

  get isBestExecution(): boolean {
    return this.executionQualityScore !== null && this.executionQualityScore >= 85;
  }

  get requiresRiskReview(): boolean {
    return this.riskScore !== null && this.riskScore > 70;
  }

  get compliancePassed(): boolean {
    if (!this.complianceChecks) return true;
    return Object.values(this.complianceChecks).every(check => 
      typeof check === 'object' && check.passed !== false
    );
  }

  // Methods
  @BeforeInsert()
  generateClientOrderId(): void {
    if (!this.clientOrderId) {
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 9);
      this.clientOrderId = `ORD-${timestamp}-${random}`.toUpperCase();
    }
    this.remainingQuantity = this.quantity;
  }

  submit(): void {
    if (this.status !== InstitutionalOrderStatus.PENDING) {
      throw new Error('Order can only be submitted when pending');
    }
    this.status = InstitutionalOrderStatus.WORKING;
    this.submittedAt = new Date();
    this.executionStartTime = new Date();
  }

  acknowledge(exchangeOrderId: string): void {
    this.exchangeOrderId = exchangeOrderId;
    this.acknowledgedAt = new Date();
  }

  fill(quantity: number, price: number, venue?: ExecutionVenue): void {
    if (quantity > this.remainingQuantity) {
      throw new Error('Fill quantity exceeds remaining quantity');
    }

    const previousExecutedValue = this.executedQuantity * (this.averagePrice || 0);
    const newFillValue = quantity * price;
    
    this.executedQuantity += quantity;
    this.remainingQuantity -= quantity;
    this.averagePrice = (previousExecutedValue + newFillValue) / this.executedQuantity;
    this.executedValue = this.executedQuantity * this.averagePrice;
    this.fillCount += 1;
    this.lastFillAt = new Date();

    if (venue) {
      this.executionVenue = venue;
    }

    if (this.remainingQuantity === 0) {
      this.status = InstitutionalOrderStatus.FILLED;
      this.executedAt = new Date();
      this.executionEndTime = new Date();
    } else {
      this.status = InstitutionalOrderStatus.PARTIALLY_FILLED;
      this.partialFillCount += 1;
    }
  }

  cancel(reason?: string): void {
    if (this.isComplete) {
      throw new Error('Cannot cancel completed order');
    }
    this.status = InstitutionalOrderStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.internalNotes = `Cancelled: ${reason}`;
    }
    if (this.executionStartTime && !this.executionEndTime) {
      this.executionEndTime = new Date();
    }
  }

  reject(reason: string, errorCode?: string): void {
    this.status = InstitutionalOrderStatus.REJECTED;
    this.errorMessage = reason;
    this.errorCode = errorCode;
    if (this.executionStartTime && !this.executionEndTime) {
      this.executionEndTime = new Date();
    }
  }

  expire(): void {
    if (this.isComplete) {
      throw new Error('Cannot expire completed order');
    }
    this.status = InstitutionalOrderStatus.EXPIRED;
    this.expiredAt = new Date();
    if (this.executionStartTime && !this.executionEndTime) {
      this.executionEndTime = new Date();
    }
  }

  suspend(reason?: string): void {
    if (this.isComplete) {
      throw new Error('Cannot suspend completed order');
    }
    this.status = InstitutionalOrderStatus.SUSPENDED;
    if (reason) {
      this.internalNotes = `Suspended: ${reason}`;
    }
  }

  resume(): void {
    if (this.status !== InstitutionalOrderStatus.SUSPENDED) {
      throw new Error('Can only resume suspended orders');
    }
    this.status = this.executedQuantity > 0 
      ? InstitutionalOrderStatus.PARTIALLY_FILLED 
      : InstitutionalOrderStatus.WORKING;
  }

  updatePerformanceMetrics(metrics: {
    slippage?: number;
    marketImpact?: number;
    implementationShortfall?: number;
    benchmarkPrice?: number;
    arrivalPrice?: number;
    vwapBenchmark?: number;
  }): void {
    if (metrics.slippage !== undefined) this.slippage = metrics.slippage;
    if (metrics.marketImpact !== undefined) this.marketImpact = metrics.marketImpact;
    if (metrics.implementationShortfall !== undefined) this.implementationShortfall = metrics.implementationShortfall;
    if (metrics.benchmarkPrice !== undefined) this.benchmarkPrice = metrics.benchmarkPrice;
    if (metrics.arrivalPrice !== undefined) this.arrivalPrice = metrics.arrivalPrice;
    if (metrics.vwapBenchmark !== undefined) this.vwapBenchmark = metrics.vwapBenchmark;

    // Calculate execution quality score
    this.calculateExecutionQuality();
  }

  calculateExecutionQuality(): void {
    let score = 100;
    
    // Deduct for slippage
    if (this.slippage) {
      score -= Math.abs(this.slippage) * 10;
    }
    
    // Deduct for market impact
    if (this.marketImpact) {
      score -= Math.abs(this.marketImpact) * 15;
    }
    
    // Deduct for implementation shortfall
    if (this.implementationShortfall) {
      score -= Math.abs(this.implementationShortfall) * 20;
    }
    
    // Bonus for quick execution
    if (this.executionTimeMs && this.executionTimeMs < 60000) { // Less than 1 minute
      score += 5;
    }
    
    this.executionQualityScore = Math.max(0, Math.min(100, score));
  }

  addComplianceCheck(checkType: string, passed: boolean, details?: string): void {
    if (!this.complianceChecks) {
      this.complianceChecks = {};
    }
    this.complianceChecks[checkType] = { passed, details };
    
    // Update compliance status based on checks
    const allPassed = Object.values(this.complianceChecks).every(check => 
      typeof check === 'object' && check.passed
    );
    
    if (allPassed) {
      this.complianceStatus = 'approved';
    } else {
      this.complianceStatus = 'flagged';
    }
  }

  approve(approvedBy: string): void {
    if (!this.requiresApproval) {
      throw new Error('Order does not require approval');
    }
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.complianceStatus = 'approved';
  }

  calculateCosts(commissionRate: number = 0.001, feeRate: number = 0.0001, taxRate: number = 0): void {
    if (this.executedValue) {
      this.commission = this.executedValue * commissionRate;
      this.fees = this.executedValue * feeRate;
      this.tax = this.executedValue * taxRate;
      this.totalCost = this.executedValue + this.commission + this.fees + this.tax;
    }
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  static createMarketOrder(
    tenantId: string,
    userId: string,
    symbol: string,
    side: OrderSide,
    quantity: number,
  ): Partial<InstitutionalOrder> {
    return {
      tenantId,
      userId,
      symbol,
      side,
      quantity,
      orderType: InstitutionalOrderType.MARKET,
      status: InstitutionalOrderStatus.PENDING,
      timeInForce: TimeInForce.DAY,
      remainingQuantity: quantity,
      executedQuantity: 0,
      fillCount: 0,
      partialFillCount: 0,
      retryCount: 0,
    };
  }

  static createLimitOrder(
    tenantId: string,
    userId: string,
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number,
  ): Partial<InstitutionalOrder> {
    return {
      tenantId,
      userId,
      symbol,
      side,
      quantity,
      price,
      limitPrice: price,
      orderType: InstitutionalOrderType.LIMIT,
      status: InstitutionalOrderStatus.PENDING,
      timeInForce: TimeInForce.DAY,
      remainingQuantity: quantity,
      executedQuantity: 0,
      fillCount: 0,
      partialFillCount: 0,
      retryCount: 0,
    };
  }

  static createAlgorithmicOrder(
    tenantId: string,
    userId: string,
    symbol: string,
    side: OrderSide,
    quantity: number,
    algorithmType: InstitutionalOrderType,
    params: any,
  ): Partial<InstitutionalOrder> {
    return {
      tenantId,
      userId,
      symbol,
      side,
      quantity,
      orderType: algorithmType,
      algorithmName: algorithmType,
      algorithmParams: params,
      status: InstitutionalOrderStatus.PENDING,
      timeInForce: TimeInForce.DAY,
      remainingQuantity: quantity,
      executedQuantity: 0,
      fillCount: 0,
      partialFillCount: 0,
      retryCount: 0,
    };
  }
}

@Entity('institutional_order_fills')
@Index(['orderId', 'executionTime'])
@Index(['tenantId', 'executionTime'])
export class InstitutionalOrderFill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'fill_id', nullable: true })
  fillId?: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: ExecutionVenue,
    nullable: true,
  })
  venue?: ExecutionVenue;

  @Column({ name: 'execution_time', type: 'timestamp' })
  @Index()
  executionTime: Date;

  @Column({ name: 'commission', type: 'decimal', precision: 10, scale: 4, nullable: true })
  commission?: number;

  @Column({ name: 'fees', type: 'decimal', precision: 10, scale: 4, nullable: true })
  fees?: number;

  @Column({ name: 'liquidity_indicator', nullable: true })
  liquidityIndicator?: 'added' | 'removed' | 'auction';

  @Column({ name: 'contra_party', nullable: true })
  contraParty?: string;

  @Column({ name: 'execution_id', nullable: true })
  executionId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => InstitutionalOrder, (order) => order.fills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: InstitutionalOrder;
}