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
import { Subscription } from './subscription.entity';
import { Payment } from './payment.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  PARTIAL_PAID = 'partial_paid',
  OVERDUE = 'overdue',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible',
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  currency: string;
  planId?: string;
  productCode?: string;
  periodStart?: Date;
  periodEnd?: Date;
  prorated?: boolean;
  metadata?: Record<string, any>;
}

export interface InvoiceTaxLine {
  name: string;
  rate: number;
  amount: number;
  inclusive: boolean;
  jurisdiction?: string;
  taxId?: string;
}

@Entity('invoices')
@Index(['userId', 'status'])
@Index(['subscriptionId', 'createdAt'])
@Index(['dueDate', 'status'])
@Index(['invoiceNumber'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  invoiceNumber: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.invoices, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  @Index()
  status: InvoiceStatus;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  subtotal: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  taxAmount: number;

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

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalAmount: number;

  @Column({
    name: 'amount_paid',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amountPaid: number;

  @Column({
    name: 'amount_due',
    type: 'decimal',
    precision: 20,
    scale: 8,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amountDue: number;

  @Column({ name: 'line_items', type: 'jsonb' })
  lineItems: InvoiceLineItem[];

  @Column({ name: 'tax_lines', type: 'jsonb', nullable: true })
  taxLines: InvoiceTaxLine[];

  @Column({ name: 'period_start', type: 'timestamp', nullable: true })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamp', nullable: true })
  periodEnd: Date;

  @Column({ name: 'due_date', type: 'timestamp' })
  @Index()
  dueDate: Date;

  @Column({ name: 'issued_at', type: 'timestamp', nullable: true })
  issuedAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'voided_at', type: 'timestamp', nullable: true })
  voidedAt: Date;

  @Column({ name: 'provider_invoice_id', nullable: true })
  providerInvoiceId: string;

  @Column({ name: 'provider_name', default: 'stripe' })
  providerName: string;

  @Column({ name: 'attempt_count', default: 0 })
  attemptCount: number;

  @Column({ name: 'next_payment_attempt', type: 'timestamp', nullable: true })
  nextPaymentAttempt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'billing_address', type: 'jsonb', nullable: true })
  billingAddress: {
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    email?: string;
    phone?: string;
  };

  @Column({ name: 'invoice_pdf_url', nullable: true })
  invoicePdfUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isPaid(): boolean {
    return this.status === InvoiceStatus.PAID;
  }

  get isOpen(): boolean {
    return this.status === InvoiceStatus.OPEN;
  }

  get isOverdue(): boolean {
    return this.status === InvoiceStatus.OVERDUE || 
           (this.isOpen && this.dueDate < new Date());
  }

  get isVoid(): boolean {
    return this.status === InvoiceStatus.VOID;
  }

  get remainingBalance(): number {
    return this.totalAmount - this.amountPaid;
  }

  get isFullyPaid(): boolean {
    return this.amountPaid >= this.totalAmount;
  }

  get isPartiallyPaid(): boolean {
    return this.amountPaid > 0 && this.amountPaid < this.totalAmount;
  }

  get daysOverdue(): number {
    if (!this.isOverdue) return 0;
    const now = new Date();
    const timeDiff = now.getTime() - this.dueDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }

  get taxRate(): number {
    if (this.subtotal === 0) return 0;
    return (this.taxAmount / this.subtotal) * 100;
  }

  get effectiveDiscountRate(): number {
    if (this.subtotal === 0) return 0;
    return (this.discountAmount / this.subtotal) * 100;
  }

  // Business logic methods
  canBePaid(): boolean {
    return [InvoiceStatus.OPEN, InvoiceStatus.OVERDUE, InvoiceStatus.PARTIAL_PAID].includes(this.status) 
           && this.remainingBalance > 0;
  }

  canBeVoided(): boolean {
    return [InvoiceStatus.DRAFT, InvoiceStatus.OPEN].includes(this.status);
  }

  addLineItem(item: Omit<InvoiceLineItem, 'id'>): void {
    const lineItem: InvoiceLineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
    };
    
    this.lineItems = [...this.lineItems, lineItem];
    this.recalculateTotals();
  }

  removeLineItem(itemId: string): void {
    this.lineItems = this.lineItems.filter(item => item.id !== itemId);
    this.recalculateTotals();
  }

  updateLineItem(itemId: string, updates: Partial<InvoiceLineItem>): void {
    this.lineItems = this.lineItems.map(item => 
      item.id === itemId ? { ...item, ...updates, amount: (updates.quantity || item.quantity) * (updates.unitPrice || item.unitPrice) } : item
    );
    this.recalculateTotals();
  }

  addTaxLine(taxLine: InvoiceTaxLine): void {
    this.taxLines = this.taxLines ? [...this.taxLines, taxLine] : [taxLine];
    this.recalculateAmounts();
  }

  private recalculateTotals(): void {
    this.subtotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
    this.recalculateAmounts();
  }

  private recalculateAmounts(): void {
    // Calculate tax amount if tax lines exist
    if (this.taxLines && this.taxLines.length > 0) {
      this.taxAmount = this.taxLines.reduce((sum, tax) => {
        if (tax.inclusive) {
          return sum; // Tax already included in subtotal
        }
        return sum + tax.amount;
      }, 0);
    }

    this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
    this.amountDue = this.totalAmount - this.amountPaid;
  }

  markAsPaid(paidAmount: number, paidAt: Date = new Date()): void {
    this.amountPaid += paidAmount;
    this.recalculateAmounts();
    
    if (this.isFullyPaid) {
      this.status = InvoiceStatus.PAID;
      this.paidAt = paidAt;
    } else if (this.isPartiallyPaid) {
      this.status = InvoiceStatus.PARTIAL_PAID;
    }
  }

  markAsOpen(issuedAt: Date = new Date()): void {
    this.status = InvoiceStatus.OPEN;
    this.issuedAt = issuedAt;
  }

  markAsOverdue(): void {
    if (this.isOpen && this.dueDate < new Date()) {
      this.status = InvoiceStatus.OVERDUE;
    }
  }

  void(voidedAt: Date = new Date()): void {
    if (this.canBeVoided()) {
      this.status = InvoiceStatus.VOID;
      this.voidedAt = voidedAt;
    }
  }

  markAsUncollectible(): void {
    this.status = InvoiceStatus.UNCOLLECTIBLE;
  }

  scheduleNextAttempt(attemptDate: Date): void {
    this.attemptCount += 1;
    this.nextPaymentAttempt = attemptDate;
  }

  applyDiscount(amount: number): void {
    this.discountAmount = amount;
    this.recalculateAmounts();
  }

  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${year}${month}-${timestamp}`;
  }
}