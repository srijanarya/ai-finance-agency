import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum PositionType {
  LONG = 'long',
  SHORT = 'short',
}

export enum PositionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  SUSPENDED = 'suspended',
}

export interface TaxLot {
  id: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  openDate: Date;
  isWashSale?: boolean;
  holdingPeriod?: number; // days
  taxBasisMethod?: 'fifo' | 'lifo' | 'hifo' | 'specific';
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnl: number;
  costBasis: number;
  marketValue: number;
  averageCost: number;
  averageCostPerShare: number;
  breakEvenPrice: number;
  holdingPeriodDays: number;
}

@Entity('positions')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'symbol'])
@Index(['tenantId', 'userId', 'symbol'], { unique: true })
@Index(['status'])
@Index(['lastUpdated'])
export class Position {
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

  @Column({ name: 'account_id', nullable: true })
  @Index()
  accountId?: string;

  // Security Details
  @Column()
  @Index()
  symbol: string;

  @Column({ name: 'instrument_type', default: 'stock' })
  instrumentType: string; // stock, bond, option, futures, forex, crypto

  @Column({ nullable: true })
  cusip?: string;

  @Column({ nullable: true })
  isin?: string;

  @Column({ name: 'security_name', nullable: true })
  securityName?: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  sector?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ name: 'asset_class', nullable: true })
  assetClass?: string;

  // Position Details
  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({
    name: 'position_type',
    type: 'enum',
    enum: PositionType,
  })
  positionType: PositionType;

  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.OPEN,
  })
  status: PositionStatus;

  // Cost and Valuation
  @Column({ name: 'average_cost', type: 'decimal', precision: 20, scale: 8 })
  averageCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 20, scale: 2 })
  totalCost: number;

  @Column({ name: 'current_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  currentPrice?: number;

  @Column({ name: 'market_value', type: 'decimal', precision: 20, scale: 2, nullable: true })
  marketValue?: number;

  @Column({ name: 'previous_close', type: 'decimal', precision: 20, scale: 8, nullable: true })
  previousClose?: number;

  // P&L Calculations
  @Column({ name: 'unrealized_pnl', type: 'decimal', precision: 20, scale: 2, default: 0 })
  unrealizedPnl: number;

  @Column({ name: 'realized_pnl', type: 'decimal', precision: 20, scale: 2, default: 0 })
  realizedPnl: number;

  @Column({ name: 'total_pnl', type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalPnl: number;

  @Column({ name: 'day_pnl', type: 'decimal', precision: 20, scale: 2, default: 0 })
  dayPnl: number;

  @Column({ name: 'unrealized_pnl_percent', type: 'decimal', precision: 10, scale: 4, default: 0 })
  unrealizedPnlPercent: number;

  @Column({ name: 'day_change_percent', type: 'decimal', precision: 10, scale: 4, default: 0 })
  dayChangePercent: number;

  // Trading Activity
  @Column({ name: 'buy_quantity', type: 'decimal', precision: 20, scale: 8, default: 0 })
  buyQuantity: number;

  @Column({ name: 'sell_quantity', type: 'decimal', precision: 20, scale: 8, default: 0 })
  sellQuantity: number;

  @Column({ name: 'buy_value', type: 'decimal', precision: 20, scale: 2, default: 0 })
  buyValue: number;

  @Column({ name: 'sell_value', type: 'decimal', precision: 20, scale: 2, default: 0 })
  sellValue: number;

  @Column({ name: 'trade_count', default: 0 })
  tradeCount: number;

  @Column({ name: 'last_trade_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  lastTradePrice?: number;

  @Column({ name: 'last_trade_quantity', type: 'decimal', precision: 20, scale: 8, nullable: true })
  lastTradeQuantity?: number;

  @Column({ name: 'last_trade_date', type: 'timestamp', nullable: true })
  lastTradeDate?: Date;

  // Tax Management
  @Column({ name: 'tax_lots', type: 'jsonb', default: [] })
  taxLots: TaxLot[];

  @Column({ name: 'wash_sale_loss_deferred', type: 'decimal', precision: 20, scale: 2, default: 0 })
  washSaleLossDeferred: number;

  @Column({ name: 'short_term_gain_loss', type: 'decimal', precision: 20, scale: 2, default: 0 })
  shortTermGainLoss: number;

  @Column({ name: 'long_term_gain_loss', type: 'decimal', precision: 20, scale: 2, default: 0 })
  longTermGainLoss: number;

  // Income and Dividends
  @Column({ name: 'dividend_income', type: 'decimal', precision: 20, scale: 2, default: 0 })
  dividendIncome: number;

  @Column({ name: 'interest_income', type: 'decimal', precision: 20, scale: 2, default: 0 })
  interestIncome: number;

  @Column({ name: 'other_income', type: 'decimal', precision: 20, scale: 2, default: 0 })
  otherIncome: number;

  @Column({ name: 'total_income', type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalIncome: number;

  // Risk Metrics
  @Column({ name: 'beta', type: 'decimal', precision: 10, scale: 4, nullable: true })
  beta?: number;

  @Column({ name: 'volatility', type: 'decimal', precision: 10, scale: 4, nullable: true })
  volatility?: number;

  @Column({ name: 'var_1day', type: 'decimal', precision: 20, scale: 2, nullable: true })
  var1Day?: number;

  @Column({ name: 'var_5day', type: 'decimal', precision: 20, scale: 2, nullable: true })
  var5Day?: number;

  @Column({ name: 'delta', type: 'decimal', precision: 10, scale: 6, nullable: true })
  delta?: number;

  @Column({ name: 'gamma', type: 'decimal', precision: 15, scale: 10, nullable: true })
  gamma?: number;

  @Column({ name: 'theta', type: 'decimal', precision: 10, scale: 6, nullable: true })
  theta?: number;

  @Column({ name: 'vega', type: 'decimal', precision: 10, scale: 6, nullable: true })
  vega?: number;

  // Portfolio Allocation
  @Column({ name: 'weight', type: 'decimal', precision: 10, scale: 4, default: 0 })
  weight: number;

  @Column({ name: 'target_weight', type: 'decimal', precision: 10, scale: 4, nullable: true })
  targetWeight?: number;

  @Column({ name: 'weight_deviation', type: 'decimal', precision: 10, scale: 4, default: 0 })
  weightDeviation: number;

  // Performance Analytics
  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics?: PerformanceMetrics;

  // Metadata
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  // Timestamps
  @Column({ name: 'opened_at', type: 'timestamp' })
  openedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date;

  @Column({ name: 'last_updated', type: 'timestamp' })
  @Index()
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual Properties
  get isLong(): boolean {
    return this.positionType === PositionType.LONG;
  }

  get isShort(): boolean {
    return this.positionType === PositionType.SHORT;
  }

  get isOpen(): boolean {
    return this.status === PositionStatus.OPEN && this.quantity !== 0;
  }

  get isClosed(): boolean {
    return this.status === PositionStatus.CLOSED || this.quantity === 0;
  }

  get notionalValue(): number {
    return Math.abs(this.quantity * this.averageCost);
  }

  get effectiveMarketValue(): number {
    if (this.currentPrice) {
      return this.quantity * this.currentPrice;
    }
    return this.marketValue || 0;
  }

  get breakEvenPrice(): number {
    if (this.quantity === 0) return 0;
    return this.totalCost / Math.abs(this.quantity);
  }

  get holdingPeriodDays(): number {
    const endDate = this.closedAt || new Date();
    return Math.floor((endDate.getTime() - this.openedAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  get averageCostPerShare(): number {
    return this.averageCost;
  }

  get totalReturnPercent(): number {
    if (this.totalCost === 0) return 0;
    return (this.totalPnl / Math.abs(this.totalCost)) * 100;
  }

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  calculateMetrics(): void {
    this.updatePnL();
    this.calculatePerformanceMetrics();
    this.lastUpdated = new Date();
  }

  updatePrice(newPrice: number, previousClose?: number): void {
    const oldPrice = this.currentPrice;
    this.currentPrice = newPrice;
    
    if (previousClose !== undefined) {
      this.previousClose = previousClose;
    }
    
    this.marketValue = this.quantity * newPrice;
    this.updatePnL();
    
    // Calculate day change
    if (this.previousClose && this.previousClose > 0) {
      this.dayPnl = this.quantity * (newPrice - this.previousClose);
      this.dayChangePercent = ((newPrice - this.previousClose) / this.previousClose) * 100;
    }
    
    this.lastUpdated = new Date();
  }

  private updatePnL(): void {
    if (this.currentPrice && this.quantity !== 0) {
      this.marketValue = this.quantity * this.currentPrice;
      this.unrealizedPnl = this.marketValue - this.totalCost;
      this.totalPnl = this.unrealizedPnl + this.realizedPnl;
      
      if (this.totalCost !== 0) {
        this.unrealizedPnlPercent = (this.unrealizedPnl / Math.abs(this.totalCost)) * 100;
      }
    }
  }

  addTrade(quantity: number, price: number, isBuy: boolean, tradeDate: Date = new Date()): void {
    const tradeValue = quantity * price;
    
    if (isBuy) {
      // Adding to position
      const oldValue = this.quantity * this.averageCost;
      const newQuantity = this.quantity + quantity;
      
      if (newQuantity !== 0) {
        this.averageCost = (oldValue + tradeValue) / newQuantity;
      }
      
      this.quantity = newQuantity;
      this.buyQuantity += quantity;
      this.buyValue += tradeValue;
      this.totalCost += tradeValue;
      
      // Add tax lot
      this.addTaxLot(quantity, price, tradeDate);
    } else {
      // Reducing position
      const sellQuantity = Math.min(quantity, Math.abs(this.quantity));
      const sellValue = sellQuantity * price;
      
      this.quantity -= sellQuantity;
      this.sellQuantity += sellQuantity;
      this.sellValue += sellValue;
      
      // Calculate realized P&L
      const costBasisSold = sellQuantity * this.averageCost;
      const realizedGain = sellValue - costBasisSold;
      this.realizedPnl += realizedGain;
      this.totalCost -= costBasisSold;
      
      // Remove from tax lots (FIFO by default)
      this.removeTaxLots(sellQuantity, price, tradeDate);
    }
    
    this.tradeCount += 1;
    this.lastTradePrice = price;
    this.lastTradeQuantity = quantity;
    this.lastTradeDate = tradeDate;
    
    // Determine position type
    if (this.quantity > 0) {
      this.positionType = PositionType.LONG;
    } else if (this.quantity < 0) {
      this.positionType = PositionType.SHORT;
    }
    
    // Update status
    if (this.quantity === 0) {
      this.status = PositionStatus.CLOSED;
      this.closedAt = tradeDate;
    } else {
      this.status = PositionStatus.OPEN;
    }
    
    this.updatePnL();
  }

  private addTaxLot(quantity: number, price: number, openDate: Date): void {
    const totalCost = quantity * price;
    const taxLot: TaxLot = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      quantity,
      averageCost: price,
      totalCost,
      openDate,
    };
    
    this.taxLots.push(taxLot);
  }

  private removeTaxLots(quantity: number, sellPrice: number, sellDate: Date): void {
    let remainingQuantity = quantity;
    const updatedTaxLots: TaxLot[] = [];
    
    // FIFO method by default
    this.taxLots.sort((a, b) => a.openDate.getTime() - b.openDate.getTime());
    
    for (const taxLot of this.taxLots) {
      if (remainingQuantity <= 0) {
        updatedTaxLots.push(taxLot);
        continue;
      }
      
      if (taxLot.quantity <= remainingQuantity) {
        // Fully consume this tax lot
        remainingQuantity -= taxLot.quantity;
        
        // Calculate gain/loss
        const holdingPeriod = Math.floor((sellDate.getTime() - taxLot.openDate.getTime()) / (1000 * 60 * 60 * 24));
        const gainLoss = (sellPrice - taxLot.averageCost) * taxLot.quantity;
        
        if (holdingPeriod > 365) {
          this.longTermGainLoss += gainLoss;
        } else {
          this.shortTermGainLoss += gainLoss;
        }
      } else {
        // Partially consume this tax lot
        const soldQuantity = remainingQuantity;
        const remainingQty = taxLot.quantity - soldQuantity;
        
        // Calculate gain/loss for sold portion
        const holdingPeriod = Math.floor((sellDate.getTime() - taxLot.openDate.getTime()) / (1000 * 60 * 60 * 24));
        const gainLoss = (sellPrice - taxLot.averageCost) * soldQuantity;
        
        if (holdingPeriod > 365) {
          this.longTermGainLoss += gainLoss;
        } else {
          this.shortTermGainLoss += gainLoss;
        }
        
        // Update tax lot with remaining quantity
        taxLot.quantity = remainingQty;
        taxLot.totalCost = remainingQty * taxLot.averageCost;
        updatedTaxLots.push(taxLot);
        
        remainingQuantity = 0;
      }
    }
    
    this.taxLots = updatedTaxLots;
  }

  private calculatePerformanceMetrics(): void {
    this.performanceMetrics = {
      totalReturn: this.totalPnl,
      totalReturnPercent: this.totalReturnPercent,
      dayChange: this.dayPnl,
      dayChangePercent: this.dayChangePercent,
      unrealizedPnl: this.unrealizedPnl,
      realizedPnl: this.realizedPnl,
      totalPnl: this.totalPnl,
      costBasis: this.totalCost,
      marketValue: this.effectiveMarketValue,
      averageCost: this.averageCost,
      averageCostPerShare: this.averageCostPerShare,
      breakEvenPrice: this.breakEvenPrice,
      holdingPeriodDays: this.holdingPeriodDays,
    };
  }

  addDividend(amount: number, paymentDate: Date = new Date()): void {
    this.dividendIncome += amount;
    this.totalIncome += amount;
    this.realizedPnl += amount;
    this.totalPnl += amount;
  }

  addInterest(amount: number, paymentDate: Date = new Date()): void {
    this.interestIncome += amount;
    this.totalIncome += amount;
    this.realizedPnl += amount;
    this.totalPnl += amount;
  }

  calculateWeight(portfolioValue: number): void {
    if (portfolioValue > 0 && this.marketValue) {
      this.weight = (Math.abs(this.marketValue) / portfolioValue) * 100;
      
      if (this.targetWeight !== undefined) {
        this.weightDeviation = this.weight - this.targetWeight;
      }
    }
  }

  needsRebalancing(threshold: number = 5): boolean {
    return this.targetWeight !== undefined && 
           Math.abs(this.weightDeviation) > threshold;
  }

  close(reason?: string): void {
    this.status = PositionStatus.CLOSED;
    this.closedAt = new Date();
    if (reason) {
      this.notes = reason;
    }
  }

  suspend(reason?: string): void {
    this.status = PositionStatus.SUSPENDED;
    if (reason) {
      this.notes = reason;
    }
  }

  resume(): void {
    if (this.quantity !== 0) {
      this.status = PositionStatus.OPEN;
    }
  }

  static create(
    tenantId: string,
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ): Partial<Position> {
    const totalCost = Math.abs(quantity * price);
    const positionType = quantity >= 0 ? PositionType.LONG : PositionType.SHORT;
    const now = new Date();
    
    return {
      tenantId,
      userId,
      symbol,
      quantity: Math.abs(quantity),
      positionType,
      status: PositionStatus.OPEN,
      averageCost: price,
      totalCost,
      marketValue: totalCost,
      unrealizedPnl: 0,
      realizedPnl: 0,
      totalPnl: 0,
      dayPnl: 0,
      unrealizedPnlPercent: 0,
      dayChangePercent: 0,
      buyQuantity: quantity >= 0 ? Math.abs(quantity) : 0,
      sellQuantity: quantity < 0 ? Math.abs(quantity) : 0,
      buyValue: quantity >= 0 ? totalCost : 0,
      sellValue: quantity < 0 ? totalCost : 0,
      tradeCount: 1,
      lastTradePrice: price,
      lastTradeQuantity: Math.abs(quantity),
      lastTradeDate: now,
      taxLots: [{
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        quantity: Math.abs(quantity),
        averageCost: price,
        totalCost,
        openDate: now,
      }],
      washSaleLossDeferred: 0,
      shortTermGainLoss: 0,
      longTermGainLoss: 0,
      dividendIncome: 0,
      interestIncome: 0,
      otherIncome: 0,
      totalIncome: 0,
      weight: 0,
      weightDeviation: 0,
      openedAt: now,
      lastUpdated: now,
    };
  }
}