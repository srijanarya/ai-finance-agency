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
import { Trade } from './trade.entity';

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
  TRAILING_STOP = 'trailing_stop',
  OCO = 'oco', // One-Cancels-Other
  BRACKET = 'bracket',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  WORKING = 'working',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum TimeInForce {
  DAY = 'day',
  GTC = 'gtc', // Good Till Cancelled
  IOC = 'ioc', // Immediate or Cancel
  FOK = 'fok', // Fill or Kill
  GTD = 'gtd', // Good Till Date
}

export enum OrderSource {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
  ALGORITHM = 'algorithm',
  INTERNAL = 'internal',
}

@Entity('orders')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'symbol'])
@Index(['clientOrderId'], { unique: true, where: 'client_order_id IS NOT NULL' })
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

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
    enum: OrderType,
  })
  orderType: OrderType;

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

  @Column({ name: 'limit_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  limitPrice?: number;

  @Column({ name: 'average_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  averagePrice?: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Index()
  status: OrderStatus;

  @Column({
    name: 'time_in_force',
    type: 'enum',
    enum: TimeInForce,
    default: TimeInForce.DAY,
  })
  timeInForce: TimeInForce;

  @Column({ name: 'good_till_date', type: 'timestamp', nullable: true })
  goodTillDate?: Date;

  @Column({
    type: 'enum',
    enum: OrderSource,
    default: OrderSource.WEB,
  })
  source: OrderSource;

  // Execution Details
  @Column({ name: 'exchange_order_id', nullable: true })
  exchangeOrderId?: string;

  @Column({ name: 'fill_count', default: 0 })
  fillCount: number;

  // Financial Details
  @Column({ name: 'notional_value', type: 'decimal', precision: 20, scale: 2, nullable: true })
  notionalValue?: number;

  @Column({ name: 'executed_value', type: 'decimal', precision: 20, scale: 2, nullable: true })
  executedValue?: number;

  @Column({ name: 'commission', type: 'decimal', precision: 10, scale: 4, nullable: true })
  commission?: number;

  @Column({ name: 'fees', type: 'decimal', precision: 10, scale: 4, nullable: true })
  fees?: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 20, scale: 2, nullable: true })
  totalCost?: number;

  // Metadata
  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

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

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Trade, (trade) => trade.order)
  trades: Trade[];

  @OneToMany(() => Order, (order) => order.parentOrder)
  childOrders: Order[];

  @ManyToOne(() => Order, (order) => order.childOrders)
  @JoinColumn({ name: 'parent_order_id' })
  parentOrder?: Order;

  // Virtual Properties
  get fillRate(): number {
    return this.quantity > 0 ? (this.executedQuantity / this.quantity) * 100 : 0;
  }

  get isComplete(): boolean {
    return this.status === OrderStatus.FILLED ||
           this.status === OrderStatus.CANCELLED ||
           this.status === OrderStatus.REJECTED ||
           this.status === OrderStatus.EXPIRED;
  }

  get isActive(): boolean {
    return this.status === OrderStatus.PENDING ||
           this.status === OrderStatus.WORKING ||
           this.status === OrderStatus.PARTIALLY_FILLED;
  }

  get totalTransactionCost(): number {
    const executedValue = this.executedValue || 0;
    const commission = this.commission || 0;
    const fees = this.fees || 0;
    return executedValue + commission + fees;
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
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Order can only be submitted when pending');
    }
    this.status = OrderStatus.WORKING;
    this.submittedAt = new Date();
  }

  fill(quantity: number, price: number): void {
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

    if (this.remainingQuantity === 0) {
      this.status = OrderStatus.FILLED;
      this.executedAt = new Date();
    } else {
      this.status = OrderStatus.PARTIALLY_FILLED;
    }
  }

  cancel(reason?: string): void {
    if (this.isComplete) {
      throw new Error('Cannot cancel completed order');
    }
    this.status = OrderStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.notes = `Cancelled: ${reason}`;
    }
  }

  reject(reason: string, errorCode?: string): void {
    this.status = OrderStatus.REJECTED;
    this.errorMessage = reason;
    this.errorCode = errorCode;
  }

  expire(): void {
    if (this.isComplete) {
      throw new Error('Cannot expire completed order');
    }
    this.status = OrderStatus.EXPIRED;
    this.expiredAt = new Date();
  }

  calculateCosts(commissionRate: number = 0.001, feeRate: number = 0.0001): void {
    if (this.executedValue) {
      this.commission = this.executedValue * commissionRate;
      this.fees = this.executedValue * feeRate;
      this.totalCost = this.executedValue + this.commission + this.fees;
    }
  }

  static createMarketOrder(
    tenantId: string,
    userId: string,
    symbol: string,
    side: OrderSide,
    quantity: number,
  ): Partial<Order> {
    return {
      tenantId,
      userId,
      symbol,
      side,
      quantity,
      orderType: OrderType.MARKET,
      status: OrderStatus.PENDING,
      timeInForce: TimeInForce.DAY,
      remainingQuantity: quantity,
      executedQuantity: 0,
      fillCount: 0,
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
  ): Partial<Order> {
    return {
      tenantId,
      userId,
      symbol,
      side,
      quantity,
      price,
      limitPrice: price,
      orderType: OrderType.LIMIT,
      status: OrderStatus.PENDING,
      timeInForce: TimeInForce.DAY,
      remainingQuantity: quantity,
      executedQuantity: 0,
      fillCount: 0,
      retryCount: 0,
    };
  }

  static createStopOrder(
    tenantId: string,
    userId: string,
    symbol: string,
    side: OrderSide,
    quantity: number,
    stopPrice: number,
  ): Partial<Order> {
    return {
      tenantId,
      userId,
      symbol,
      side,
      quantity,
      stopPrice,
      orderType: OrderType.STOP,
      status: OrderStatus.PENDING,
      timeInForce: TimeInForce.DAY,
      remainingQuantity: quantity,
      executedQuantity: 0,
      fillCount: 0,
      retryCount: 0,
    };
  }
}