import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Payment } from './payment.entity';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  CRYPTO = 'crypto',
  WALLET = 'wallet',
  ACH = 'ach',
  WIRE = 'wire',
}

export enum PaymentMethodStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REQUIRES_VERIFICATION = 'requires_verification',
}

@Entity('payment_methods')
@Index(['userId', 'status'])
@Index(['fingerprint'], { unique: true })
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
  })
  @Index()
  type: PaymentMethodType;

  @Column({
    type: 'enum',
    enum: PaymentMethodStatus,
    default: PaymentMethodStatus.ACTIVE,
  })
  @Index()
  status: PaymentMethodStatus;

  @Column({ name: 'provider_payment_method_id', unique: true })
  providerPaymentMethodId: string;

  @Column({ name: 'provider_name', default: 'stripe' })
  providerName: string;

  // Card-specific fields
  @Column({ name: 'card_brand', nullable: true })
  cardBrand: string;

  @Column({ name: 'card_last_four', nullable: true })
  cardLastFour: string;

  @Column({ name: 'card_exp_month', nullable: true })
  cardExpMonth: number;

  @Column({ name: 'card_exp_year', nullable: true })
  cardExpYear: number;

  @Column({ name: 'card_country', nullable: true })
  cardCountry: string;

  // Bank account specific fields
  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_last_four', nullable: true })
  bankAccountLastFour: string;

  @Column({ name: 'bank_routing_number', nullable: true })
  bankRoutingNumber: string;

  @Column({ name: 'bank_account_type', nullable: true })
  bankAccountType: string;

  // Crypto specific fields
  @Column({ name: 'crypto_address', nullable: true })
  cryptoAddress: string;

  @Column({ name: 'crypto_network', nullable: true })
  cryptoNetwork: string;

  // General fields
  @Column({ name: 'display_name', nullable: true })
  displayName: string;

  @Column({ nullable: true })
  fingerprint: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

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

  @OneToMany(() => Payment, (payment) => payment.paymentMethod)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isExpired(): boolean {
    if (!this.cardExpMonth || !this.cardExpYear) return false;
    const now = new Date();
    const expiry = new Date(this.cardExpYear, this.cardExpMonth - 1, 1);
    return now > expiry;
  }

  get displayInfo(): string {
    switch (this.type) {
      case PaymentMethodType.CREDIT_CARD:
      case PaymentMethodType.DEBIT_CARD:
        return `${this.cardBrand} •••• ${this.cardLastFour}`;
      case PaymentMethodType.BANK_ACCOUNT:
        return `${this.bankName} •••• ${this.bankAccountLastFour}`;
      case PaymentMethodType.PAYPAL:
        return 'PayPal';
      case PaymentMethodType.APPLE_PAY:
        return 'Apple Pay';
      case PaymentMethodType.GOOGLE_PAY:
        return 'Google Pay';
      case PaymentMethodType.CRYPTO:
        return `${this.cryptoNetwork} Wallet`;
      default:
        return this.displayName || this.type;
    }
  }

  // Business logic methods
  canBeUsedForPayment(): boolean {
    return (
      this.status === PaymentMethodStatus.ACTIVE &&
      !this.isExpired &&
      this.isVerified
    );
  }

  markAsExpired(): void {
    this.status = PaymentMethodStatus.EXPIRED;
  }

  markAsDefault(): void {
    this.isDefault = true;
  }

  markAsVerified(): void {
    this.isVerified = true;
    if (this.status === PaymentMethodStatus.REQUIRES_VERIFICATION) {
      this.status = PaymentMethodStatus.ACTIVE;
    }
  }
}