import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Transaction } from './transaction.entity';
import { Invoice } from './invoice.entity';
import { Subscription } from './subscription.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded',
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
  WALLET_DEPOSIT = 'wallet_deposit',
  WALLET_WITHDRAWAL = 'wallet_withdrawal',
  SUBSCRIPTION = 'subscription',
}

@Entity('payments')
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['paymentIntentId'], { unique: true })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'payment_intent_id', unique: true })
  paymentIntentId: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index()
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ONE_TIME,
  })
  @Index()
  type: PaymentType;

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, { nullable: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.payments, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'provider_payment_id', nullable: true })
  providerPaymentId: string;

  @Column({ name: 'provider_name', default: 'stripe' })
  providerName: string;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @Column({ name: 'failure_code', nullable: true })
  failureCode: string;

  @Column({
    name: 'refunded_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  refundedAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 20, scale: 8, default: 0 })
  taxAmount: number;

  @Column({ name: 'fee_amount', type: 'decimal', precision: 20, scale: 8, default: 0 })
  feeAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 20, scale: 8 })
  netAmount: number;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.payment)
  transactions: Transaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return [PaymentStatus.FAILED, PaymentStatus.CANCELLED].includes(this.status);
  }

  get isRefundable(): boolean {
    return this.status === PaymentStatus.COMPLETED && this.refundedAmount < this.amount;
  }

  get availableRefundAmount(): number {
    return this.amount - this.refundedAmount;
  }

  // Business logic methods
  canRefund(amount?: number): boolean {
    if (!this.isRefundable) return false;
    if (amount && amount > this.availableRefundAmount) return false;
    return true;
  }

  markAsCompleted(processedAt: Date = new Date()): void {
    this.status = PaymentStatus.COMPLETED;
    this.processedAt = processedAt;
  }

  markAsFailed(reason: string, code?: string): void {
    this.status = PaymentStatus.FAILED;
    this.failureReason = reason;
    this.failureCode = code;
  }

  addRefund(refundAmount: number): void {
    this.refundedAmount += refundAmount;
    if (this.refundedAmount >= this.amount) {
      this.status = PaymentStatus.REFUNDED;
    } else {
      this.status = PaymentStatus.PARTIAL_REFUNDED;
    }
  }
}