import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Subscription, BillingCycle } from './subscription.entity';

export enum PlanStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum PlanTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  PROFESSIONAL = 'professional',
}

@Entity('plans')
@Index(['status', 'tier'])
@Index(['productCode'], { unique: true })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_code', unique: true })
  productCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PlanTier,
    default: PlanTier.BASIC,
  })
  @Index()
  tier: PlanTier;

  @Column({
    type: 'enum',
    enum: PlanStatus,
    default: PlanStatus.ACTIVE,
  })
  @Index()
  status: PlanStatus;

  // Pricing structure - supports multiple billing cycles
  @Column({
    name: 'monthly_price',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null,
    },
  })
  monthlyPrice: number;

  @Column({
    name: 'quarterly_price',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null,
    },
  })
  quarterlyPrice: number;

  @Column({
    name: 'yearly_price',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null,
    },
  })
  yearlyPrice: number;

  @Column({
    name: 'setup_fee',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  setupFee: number;

  @Column({ name: 'trial_days', default: 0 })
  trialDays: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Plan features and limits
  @Column({ type: 'jsonb', nullable: true })
  features: {
    maxTrades?: number;
    maxPortfolios?: number;
    advancedAnalytics?: boolean;
    prioritySupport?: boolean;
    apiAccess?: boolean;
    customIndicators?: boolean;
    realTimeData?: boolean;
    backtesting?: boolean;
    paperTrading?: boolean;
    multipleExchanges?: boolean;
    customAlerts?: number;
    dataHistory?: string; // e.g., "1year", "5years", "unlimited"
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  limits: {
    maxApiCalls?: number;
    maxDataRequests?: number;
    maxAlerts?: number;
    maxWatchlists?: number;
    maxBacktests?: number;
    [key: string]: any;
  };

  // Provider-specific IDs
  @Column({ name: 'stripe_price_monthly_id', nullable: true })
  stripePriceMonthlyId: string;

  @Column({ name: 'stripe_price_quarterly_id', nullable: true })
  stripePriceQuarterlyId: string;

  @Column({ name: 'stripe_price_yearly_id', nullable: true })
  stripePriceYearlyId: string;

  @Column({ name: 'stripe_product_id', nullable: true })
  stripeProductId: string;

  // Display and marketing
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean;

  @Column({ name: 'is_recommended', default: false })
  isRecommended: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isActive(): boolean {
    return this.status === PlanStatus.ACTIVE;
  }

  get isFree(): boolean {
    return this.tier === PlanTier.FREE || this.getPrice(BillingCycle.MONTHLY) === 0;
  }

  get hasTrialPeriod(): boolean {
    return this.trialDays > 0;
  }

  get monthlyEquivalent(): number {
    if (this.monthlyPrice) return this.monthlyPrice;
    if (this.quarterlyPrice) return this.quarterlyPrice / 3;
    if (this.yearlyPrice) return this.yearlyPrice / 12;
    return 0;
  }

  get yearlyDiscount(): number {
    if (!this.monthlyPrice || !this.yearlyPrice) return 0;
    const yearlyViaMonthly = this.monthlyPrice * 12;
    return ((yearlyViaMonthly - this.yearlyPrice) / yearlyViaMonthly) * 100;
  }

  // Business logic methods
  getPrice(billingCycle: BillingCycle): number {
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        return this.monthlyPrice || 0;
      case BillingCycle.QUARTERLY:
        return this.quarterlyPrice || (this.monthlyPrice ? this.monthlyPrice * 3 : 0);
      case BillingCycle.YEARLY:
        return this.yearlyPrice || (this.monthlyPrice ? this.monthlyPrice * 12 : 0);
      default:
        return this.monthlyPrice || 0;
    }
  }

  getStripePrice(billingCycle: BillingCycle): string {
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        return this.stripePriceMonthlyId;
      case BillingCycle.QUARTERLY:
        return this.stripePriceQuarterlyId;
      case BillingCycle.YEARLY:
        return this.stripePriceYearlyId;
      default:
        return this.stripePriceMonthlyId;
    }
  }

  supportsBillingCycle(billingCycle: BillingCycle): boolean {
    return this.getPrice(billingCycle) > 0;
  }

  canUpgradeTo(targetPlan: Plan): boolean {
    if (!this.isActive || !targetPlan.isActive) return false;
    
    const tierOrder = {
      [PlanTier.FREE]: 0,
      [PlanTier.BASIC]: 1,
      [PlanTier.PREMIUM]: 2,
      [PlanTier.PROFESSIONAL]: 3,
      [PlanTier.ENTERPRISE]: 4,
    };
    
    return tierOrder[targetPlan.tier] > tierOrder[this.tier];
  }

  canDowngradeTo(targetPlan: Plan): boolean {
    if (!this.isActive || !targetPlan.isActive) return false;
    
    const tierOrder = {
      [PlanTier.FREE]: 0,
      [PlanTier.BASIC]: 1,
      [PlanTier.PREMIUM]: 2,
      [PlanTier.PROFESSIONAL]: 3,
      [PlanTier.ENTERPRISE]: 4,
    };
    
    return tierOrder[targetPlan.tier] < tierOrder[this.tier];
  }

  hasFeature(feature: string): boolean {
    return this.features && this.features[feature] === true;
  }

  getFeatureLimit(feature: string): number {
    return this.limits && this.limits[feature] ? this.limits[feature] : 0;
  }

  activate(): void {
    this.status = PlanStatus.ACTIVE;
  }

  deactivate(): void {
    this.status = PlanStatus.INACTIVE;
  }

  archive(): void {
    this.status = PlanStatus.ARCHIVED;
  }
}