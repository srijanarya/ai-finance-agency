import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Payment } from './payment.entity';
import { Wallet } from './wallet.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
  FEE = 'fee',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  INVOICE_PAYMENT = 'invoice_payment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

@Entity('transactions')
@Index(['userId', 'createdAt'])
@Index(['type', 'status'])
@Index(['paymentId', 'type'])
@Index(['transactionReference'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_reference', unique: true })
  transactionReference: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'payment_id', nullable: true })
  paymentId: string;

  @ManyToOne(() => Payment, (payment) => payment.transactions, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ name: 'wallet_id', nullable: true })
  walletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: true })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  @Index()
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  status: TransactionStatus;

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

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'balance_before', type: 'decimal', precision: 20, scale: 8, nullable: true })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 20, scale: 8, nullable: true })
  balanceAfter: number;

  @Column({ name: 'counterpart_user_id', nullable: true })
  counterpartUserId: string;

  @Column({ name: 'counterpart_wallet_id', nullable: true })
  counterpartWalletId: string;

  @Column({ name: 'provider_transaction_id', nullable: true })
  providerTransactionId: string;

  @Column({ name: 'provider_name', nullable: true })
  providerName: string;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @Column({ name: 'failure_code', nullable: true })
  failureCode: string;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ name: 'reversed_at', type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ name: 'reversal_reference', nullable: true })
  reversalReference: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Virtual properties
  get isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return [TransactionStatus.FAILED, TransactionStatus.CANCELLED].includes(this.status);
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  get isReversed(): boolean {
    return this.status === TransactionStatus.REVERSED;
  }

  get isCredit(): boolean {
    return [
      TransactionType.DEPOSIT,
      TransactionType.REFUND,
      TransactionType.TRANSFER, // When receiving
    ].includes(this.type);
  }

  get isDebit(): boolean {
    return [
      TransactionType.PAYMENT,
      TransactionType.WITHDRAWAL,
      TransactionType.FEE,
      TransactionType.CHARGEBACK,
    ].includes(this.type);
  }

  get effectiveAmount(): number {
    // Return negative amount for debits, positive for credits
    return this.isDebit ? -Math.abs(this.amount) : Math.abs(this.amount);
  }

  // Business logic methods
  canBeReversed(): boolean {
    return this.isCompleted && !this.isReversed && this.reversalReference === null;
  }

  markAsCompleted(processedAt: Date = new Date(), balanceAfter?: number): void {
    this.status = TransactionStatus.COMPLETED;
    this.processedAt = processedAt;
    if (balanceAfter !== undefined) {
      this.balanceAfter = balanceAfter;
    }
  }

  markAsFailed(reason: string, code?: string): void {
    this.status = TransactionStatus.FAILED;
    this.failureReason = reason;
    this.failureCode = code;
  }

  markAsReversed(reversalReference: string, reversedAt: Date = new Date()): void {
    this.status = TransactionStatus.REVERSED;
    this.reversalReference = reversalReference;
    this.reversedAt = reversedAt;
  }

  cancel(): void {
    if (this.isPending) {
      this.status = TransactionStatus.CANCELLED;
    }
  }

  setBalances(before: number, after: number): void {
    this.balanceBefore = before;
    this.balanceAfter = after;
  }

  generateReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const typePrefix = this.type.substring(0, 3).toUpperCase();
    return `TXN-${typePrefix}-${timestamp}-${random}`;
  }

  // Audit trail methods
  getAuditTrail(): Record<string, any> {
    return {
      transactionId: this.id,
      reference: this.transactionReference,
      userId: this.userId,
      type: this.type,
      status: this.status,
      amount: this.amount,
      currency: this.currency,
      balanceBefore: this.balanceBefore,
      balanceAfter: this.balanceAfter,
      createdAt: this.createdAt,
      processedAt: this.processedAt,
      metadata: this.metadata,
    };
  }

  static createPaymentTransaction(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    description?: string
  ): Transaction {
    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.paymentId = paymentId;
    transaction.type = TransactionType.PAYMENT;
    transaction.amount = amount;
    transaction.currency = currency;
    transaction.description = description || 'Payment transaction';
    transaction.transactionReference = transaction.generateReference();
    return transaction;
  }

  static createRefundTransaction(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    description?: string
  ): Transaction {
    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.paymentId = paymentId;
    transaction.type = TransactionType.REFUND;
    transaction.amount = amount;
    transaction.currency = currency;
    transaction.description = description || 'Refund transaction';
    transaction.transactionReference = transaction.generateReference();
    return transaction;
  }

  static createWalletTransaction(
    userId: string,
    walletId: string,
    type: TransactionType,
    amount: number,
    currency: string,
    description?: string
  ): Transaction {
    const transaction = new Transaction();
    transaction.userId = userId;
    transaction.walletId = walletId;
    transaction.type = type;
    transaction.amount = amount;
    transaction.currency = currency;
    transaction.description = description || `Wallet ${type}`;
    transaction.transactionReference = transaction.generateReference();
    return transaction;
  }
}