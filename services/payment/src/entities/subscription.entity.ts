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
import { Plan } from './plan.entity';
import { Payment } from './payment.entity';
import { Invoice } from './invoice.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAUSED = 'paused',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

@Entity('subscriptions')
@Index(['userId', 'status'])
@Index(['status', 'nextBillingDate'])
@Index(['providerSubscriptionId'], { unique: true })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'plan_id' })
  planId: string;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INCOMPLETE,
  })
  @Index()
  status: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  billingCycle: BillingCycle;

  @Column({ name: 'provider_subscription_id', unique: true })
  providerSubscriptionId: string;

  @Column({ name: 'provider_name', default: 'stripe' })
  providerName: string;

  @Column({ name: 'provider_customer_id' })
  providerCustomerId: string;

  @Column({
    name: 'current_price',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  currentPrice: number;

  @Column({ name: 'current_currency', length: 3 })
  currentCurrency: string;

  @Column({ name: 'quantity', default: 1 })
  quantity: number;

  @Column({ name: 'trial_start', type: 'timestamp', nullable: true })
  trialStart: Date;

  @Column({ name: 'trial_end', type: 'timestamp', nullable: true })
  trialEnd: Date;

  @Column({ name: 'current_period_start', type: 'timestamp' })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp' })
  currentPeriodEnd: Date;

  @Column({ name: 'next_billing_date', type: 'timestamp' })
  @Index()
  nextBillingDate: Date;

  @Column({ name: 'cancel_at', type: 'timestamp', nullable: true })
  cancelAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ name: 'pause_collection_behavior', nullable: true })
  pauseCollectionBehavior: string;

  @Column({ name: 'paused_at', type: 'timestamp', nullable: true })
  pausedAt: Date;

  @Column({ name: 'resume_at', type: 'timestamp', nullable: true })
  resumeAt: Date;

  @Column({ name: 'discount_coupon_id', nullable: true })
  discountCouponId: string;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discountAmount: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'tax_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];

  @OneToMany(() => Invoice, (invoice) => invoice.subscription)
  invoices: Invoice[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  get isTrialing(): boolean {
    return this.status === SubscriptionStatus.TRIALING;
  }

  get isCancelled(): boolean {
    return [
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.INCOMPLETE_EXPIRED,
    ].includes(this.status);
  }

  get isPastDue(): boolean {
    return this.status === SubscriptionStatus.PAST_DUE;
  }

  get isPaused(): boolean {
    return this.status === SubscriptionStatus.PAUSED;
  }

  get effectivePrice(): number {
    let price = this.currentPrice * this.quantity;
    
    if (this.discountAmount > 0) {
      price -= this.discountAmount;
    } else if (this.discountPercent > 0) {
      price -= (price * this.discountPercent / 100);
    }
    
    return Math.max(0, price);
  }

  get totalWithTax(): number {
    const effectivePrice = this.effectivePrice;
    return effectivePrice + (effectivePrice * this.taxPercent / 100);
  }

  get daysUntilNextBilling(): number {
    const now = new Date();
    const timeDiff = this.nextBillingDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  get isInTrial(): boolean {
    if (!this.trialStart || !this.trialEnd) return false;
    const now = new Date();
    return now >= this.trialStart && now <= this.trialEnd;
  }

  // Business logic methods
  canBeCancelled(): boolean {
    return !this.isCancelled && this.status !== SubscriptionStatus.INCOMPLETE_EXPIRED;
  }

  canBePaused(): boolean {
    return this.isActive && !this.isPaused;
  }

  canBeResumed(): boolean {
    return this.isPaused;
  }

  cancel(cancelAt?: Date): void {
    this.cancelAt = cancelAt || new Date();
    if (!cancelAt || cancelAt <= new Date()) {
      this.status = SubscriptionStatus.CANCELLED;
      this.cancelledAt = new Date();
      this.endedAt = new Date();
    }
  }

  pause(resumeAt?: Date): void {
    this.status = SubscriptionStatus.PAUSED;
    this.pausedAt = new Date();
    this.resumeAt = resumeAt;
  }

  resume(): void {
    this.status = SubscriptionStatus.ACTIVE;
    this.pausedAt = null;
    this.resumeAt = null;
  }

  markAsPastDue(): void {
    this.status = SubscriptionStatus.PAST_DUE;
  }

  activate(): void {
    this.status = SubscriptionStatus.ACTIVE;
  }

  updateBillingCycle(cycle: BillingCycle): void {
    this.billingCycle = cycle;
    this.updateNextBillingDate();
  }

  private updateNextBillingDate(): void {
    const current = this.currentPeriodEnd || new Date();
    
    switch (this.billingCycle) {
      case BillingCycle.DAILY:
        this.nextBillingDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        break;
      case BillingCycle.WEEKLY:
        this.nextBillingDate = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case BillingCycle.MONTHLY:
        this.nextBillingDate = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
        break;
      case BillingCycle.QUARTERLY:
        this.nextBillingDate = new Date(current.getFullYear(), current.getMonth() + 3, current.getDate());
        break;
      case BillingCycle.YEARLY:
        this.nextBillingDate = new Date(current.getFullYear() + 1, current.getMonth(), current.getDate());
        break;
    }
  }
}