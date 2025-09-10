import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

export enum TradeType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum TradeStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SETTLED = 'settled',
  FAILED = 'failed',
}

export enum LiquidityType {
  MAKER = 'maker',
  TAKER = 'taker',
  AUCTION = 'auction',
}

@Entity('trades')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'symbol'])
@Index(['orderId'])
@Index(['executedAt'])
@Index(['tradeDate'])
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'order_id' })
  @Index()
  orderId: string;

  @Column({ name: 'trade_id', nullable: true })
  tradeId?: string;

  @Column({ name: 'execution_id', nullable: true })
  executionId?: string;

  // Trade Details
  @Column()
  @Index()
  symbol: string;

  @Column({
    type: 'enum',
    enum: TradeType,
  })
  type: TradeType;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ name: 'gross_value', type: 'decimal', precision: 20, scale: 2 })
  grossValue: number;

  @Column({ name: 'net_value', type: 'decimal', precision: 20, scale: 2 })
  netValue: number;

  @Column({
    type: 'enum',
    enum: TradeStatus,
    default: TradeStatus.PENDING,
  })
  status: TradeStatus;

  // Execution Details
  @Column({ nullable: true })
  venue?: string;

  @Column({ nullable: true })
  exchange?: string;

  @Column({ name: 'contra_party', nullable: true })
  contraParty?: string;

  @Column({
    name: 'liquidity_type',
    type: 'enum',
    enum: LiquidityType,
    nullable: true,
  })
  liquidityType?: LiquidityType;

  // Costs and Fees
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  commission: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  fees: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  tax: number;

  @Column({ name: 'regulatory_fees', type: 'decimal', precision: 10, scale: 4, default: 0 })
  regulatoryFees: number;

  @Column({ name: 'clearing_fees', type: 'decimal', precision: 10, scale: 4, default: 0 })
  clearingFees: number;

  @Column({ name: 'exchange_fees', type: 'decimal', precision: 10, scale: 4, default: 0 })
  exchangeFees: number;

  @Column({ name: 'total_fees', type: 'decimal', precision: 10, scale: 4, default: 0 })
  totalFees: number;

  // Settlement Information
  @Column({ name: 'settlement_date', type: 'date', nullable: true })
  settlementDate?: Date;

  @Column({ name: 'settlement_currency', default: 'USD' })
  settlementCurrency: string;

  @Column({ name: 'settlement_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  settlementPrice?: number;

  @Column({ name: 'accrued_interest', type: 'decimal', precision: 10, scale: 4, default: 0 })
  accruedInterest: number;

  // Market Data at Execution
  @Column({ name: 'bid_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  bidPrice?: number;

  @Column({ name: 'ask_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  askPrice?: number;

  @Column({ name: 'mid_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  midPrice?: number;

  @Column({ name: 'last_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  lastPrice?: number;

  @Column({ name: 'volume', type: 'decimal', precision: 20, scale: 8, nullable: true })
  volume?: number;

  // Performance Metrics
  @Column({ name: 'slippage', type: 'decimal', precision: 10, scale: 6, nullable: true })
  slippage?: number;

  @Column({ name: 'market_impact', type: 'decimal', precision: 10, scale: 6, nullable: true })
  marketImpact?: number;

  @Column({ name: 'price_improvement', type: 'decimal', precision: 10, scale: 6, nullable: true })
  priceImprovement?: number;

  // Metadata
  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  // Timestamps
  @Column({ name: 'trade_date', type: 'date' })
  @Index()
  tradeDate: Date;

  @Column({ name: 'trade_time', type: 'time' })
  tradeTime: string;

  @Column({ name: 'executed_at', type: 'timestamp' })
  @Index()
  executedAt: Date;

  @Column({ name: 'reported_at', type: 'timestamp', nullable: true })
  reportedAt?: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'settled_at', type: 'timestamp', nullable: true })
  settledAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.trades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Virtual Properties
  get totalCost(): number {
    const side = this.type === TradeType.BUY ? 1 : -1;
    return side * this.grossValue + this.totalFees;
  }

  get effectivePrice(): number {
    if (this.quantity === 0) return 0;
    return Math.abs(this.totalCost / this.quantity);
  }

  get isSettled(): boolean {
    return this.status === TradeStatus.SETTLED;
  }

  get hasPriceImprovement(): boolean {
    return this.priceImprovement !== null && this.priceImprovement > 0;
  }

  get hasSlippage(): boolean {
    return this.slippage !== null && Math.abs(this.slippage) > 0.001; // 0.1% threshold
  }

  get executionQualityScore(): number {
    let score = 100;
    
    // Deduct for slippage
    if (this.slippage && Math.abs(this.slippage) > 0.001) {
      score -= Math.abs(this.slippage) * 1000; // Convert to basis points
    }
    
    // Add for price improvement
    if (this.priceImprovement && this.priceImprovement > 0) {
      score += this.priceImprovement * 1000;
    }
    
    // Deduct for market impact
    if (this.marketImpact && Math.abs(this.marketImpact) > 0.001) {
      score -= Math.abs(this.marketImpact) * 500;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Methods
  confirm(): void {
    this.status = TradeStatus.CONFIRMED;
    this.confirmedAt = new Date();
  }

  settle(): void {
    this.status = TradeStatus.SETTLED;
    this.settledAt = new Date();
  }

  fail(reason?: string): void {
    this.status = TradeStatus.FAILED;
    if (reason) {
      this.notes = `Failed: ${reason}`;
    }
  }

  calculateFees(): void {
    this.totalFees = this.commission + this.fees + this.tax + 
                    this.regulatoryFees + this.clearingFees + this.exchangeFees;
    
    // Calculate net value
    const side = this.type === TradeType.BUY ? -1 : 1;
    this.netValue = side * (this.grossValue - this.totalFees);
  }

  calculateSlippage(expectedPrice: number): void {
    if (expectedPrice && expectedPrice > 0) {
      this.slippage = ((this.price - expectedPrice) / expectedPrice);
      
      // Adjust sign based on trade type
      if (this.type === TradeType.SELL) {
        this.slippage = -this.slippage;
      }
    }
  }

  calculatePriceImprovement(referencePrice: number): void {
    if (referencePrice && referencePrice > 0) {
      const improvement = (this.price - referencePrice) / referencePrice;
      
      // Price improvement is positive when we get better prices
      if (this.type === TradeType.BUY) {
        this.priceImprovement = -improvement; // Negative price change is good for buys
      } else {
        this.priceImprovement = improvement; // Positive price change is good for sells
      }
    }
  }

  static create(
    tenantId: string,
    userId: string,
    orderId: string,
    symbol: string,
    type: TradeType,
    quantity: number,
    price: number,
  ): Partial<Trade> {
    const grossValue = quantity * price;
    const executedAt = new Date();
    
    return {
      tenantId,
      userId,
      orderId,
      symbol,
      type,
      quantity,
      price,
      grossValue,
      netValue: grossValue,
      status: TradeStatus.PENDING,
      executedAt,
      tradeDate: new Date(executedAt.toDateString()),
      tradeTime: executedAt.toTimeString().split(' ')[0],
      commission: 0,
      fees: 0,
      tax: 0,
      regulatoryFees: 0,
      clearingFees: 0,
      exchangeFees: 0,
      totalFees: 0,
      accruedInterest: 0,
    };
  }
}