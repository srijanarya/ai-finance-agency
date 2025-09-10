import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Check,
} from 'typeorm';
import { Transaction } from './transaction.entity';

export enum WalletStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
  FROZEN = 'frozen',
}

export enum WalletType {
  TRADING = 'trading',
  SAVINGS = 'savings',
  ESCROW = 'escrow',
  REWARDS = 'rewards',
  COMMISSION = 'commission',
}

@Entity('wallets')
@Index(['userId', 'currency', 'type'])
@Index(['status', 'currency'])
@Check(`"balance" >= 0`)
@Check(`"locked_balance" >= 0`)
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.TRADING,
  })
  @Index()
  type: WalletType;

  @Column({ length: 3 })
  @Index()
  currency: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  @Index()
  status: WalletStatus;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balance: number;

  @Column({
    name: 'locked_balance',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lockedBalance: number;

  @Column({
    name: 'reserved_balance',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  reservedBalance: number;

  @Column({
    name: 'lifetime_deposits',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lifetimeDeposits: number;

  @Column({
    name: 'lifetime_withdrawals',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lifetimeWithdrawals: number;

  @Column({
    name: 'daily_withdrawal_limit',
    type: 'decimal',
    precision: 20,
    scale: 8,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null,
    },
  })
  dailyWithdrawalLimit: number;

  @Column({
    name: 'daily_withdrawn_amount',
    type: 'decimal',
    precision: 20,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  dailyWithdrawnAmount: number;

  @Column({
    name: 'last_withdrawal_reset',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  lastWithdrawalReset: Date;

  @Column({ name: 'minimum_balance', type: 'decimal', precision: 20, scale: 8, default: 0 })
  minimumBalance: number;

  @Column({
    name: 'interest_rate',
    type: 'decimal',
    precision: 8,
    scale: 6,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  interestRate: number;

  @Column({ name: 'last_interest_calculation', type: 'timestamp', nullable: true })
  lastInterestCalculation: Date;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get availableBalance(): number {
    return this.balance - this.lockedBalance - this.reservedBalance;
  }

  get totalBalance(): number {
    return this.balance + this.lockedBalance + this.reservedBalance;
  }

  get isActive(): boolean {
    return this.status === WalletStatus.ACTIVE;
  }

  get isFrozen(): boolean {
    return this.status === WalletStatus.FROZEN;
  }

  get isSuspended(): boolean {
    return this.status === WalletStatus.SUSPENDED;
  }

  get isClosed(): boolean {
    return this.status === WalletStatus.CLOSED;
  }

  get canTransact(): boolean {
    return this.isActive && !this.isFrozen && !this.isSuspended;
  }

  get dailyWithdrawalRemaining(): number {
    this.resetDailyWithdrawalIfNeeded();
    if (!this.dailyWithdrawalLimit) return Infinity;
    return Math.max(0, this.dailyWithdrawalLimit - this.dailyWithdrawnAmount);
  }

  get netFlow(): number {
    return this.lifetimeDeposits - this.lifetimeWithdrawals;
  }

  // Business logic methods
  canWithdraw(amount: number): boolean {
    if (!this.canTransact) return false;
    if (amount <= 0) return false;
    if (this.availableBalance < amount) return false;
    if (this.dailyWithdrawalRemaining < amount) return false;
    if (this.balance - amount < this.minimumBalance) return false;
    return true;
  }

  canDeposit(amount: number): boolean {
    return this.canTransact && amount > 0;
  }

  canLock(amount: number): boolean {
    return this.canTransact && amount > 0 && this.availableBalance >= amount;
  }

  canReserve(amount: number): boolean {
    return this.canTransact && amount > 0 && this.availableBalance >= amount;
  }

  // Balance operations
  deposit(amount: number): void {
    if (!this.canDeposit(amount)) {
      throw new Error('Cannot deposit to this wallet');
    }
    
    this.balance += amount;
    this.lifetimeDeposits += amount;
  }

  withdraw(amount: number): void {
    if (!this.canWithdraw(amount)) {
      throw new Error('Cannot withdraw from this wallet');
    }
    
    this.balance -= amount;
    this.lifetimeWithdrawals += amount;
    this.dailyWithdrawnAmount += amount;
    this.resetDailyWithdrawalIfNeeded();
  }

  lock(amount: number): void {
    if (!this.canLock(amount)) {
      throw new Error('Insufficient available balance to lock');
    }
    
    this.lockedBalance += amount;
  }

  unlock(amount: number): void {
    const unlockAmount = Math.min(amount, this.lockedBalance);
    this.lockedBalance -= unlockAmount;
  }

  reserve(amount: number): void {
    if (!this.canReserve(amount)) {
      throw new Error('Insufficient available balance to reserve');
    }
    
    this.reservedBalance += amount;
  }

  unreserve(amount: number): void {
    const unreserveAmount = Math.min(amount, this.reservedBalance);
    this.reservedBalance -= unreserveAmount;
  }

  // Transfer between locked/reserved and available balance
  transferLockedToAvailable(amount: number): void {
    const transferAmount = Math.min(amount, this.lockedBalance);
    this.lockedBalance -= transferAmount;
    // Balance increases implicitly as locked decreases
  }

  transferReservedToAvailable(amount: number): void {
    const transferAmount = Math.min(amount, this.reservedBalance);
    this.reservedBalance -= transferAmount;
    // Balance increases implicitly as reserved decreases
  }

  transferAvailableToLocked(amount: number): void {
    if (this.availableBalance < amount) {
      throw new Error('Insufficient available balance');
    }
    this.lockedBalance += amount;
  }

  transferAvailableToReserved(amount: number): void {
    if (this.availableBalance < amount) {
      throw new Error('Insufficient available balance');
    }
    this.reservedBalance += amount;
  }

  // Status management
  activate(): void {
    if (this.status !== WalletStatus.CLOSED) {
      this.status = WalletStatus.ACTIVE;
    }
  }

  suspend(reason?: string): void {
    this.status = WalletStatus.SUSPENDED;
    if (reason) {
      this.metadata = { ...this.metadata, suspensionReason: reason };
    }
  }

  freeze(reason?: string): void {
    this.status = WalletStatus.FROZEN;
    if (reason) {
      this.metadata = { ...this.metadata, freezeReason: reason };
    }
  }

  close(): void {
    if (this.totalBalance > 0) {
      throw new Error('Cannot close wallet with remaining balance');
    }
    this.status = WalletStatus.CLOSED;
  }

  // Interest calculation (for savings wallets)
  calculateInterest(): number {
    if (this.interestRate <= 0 || this.type !== WalletType.SAVINGS) {
      return 0;
    }

    const now = new Date();
    const lastCalculation = this.lastInterestCalculation || this.createdAt;
    const daysDiff = Math.floor((now.getTime() - lastCalculation.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) return 0;

    const dailyRate = this.interestRate / 365;
    const interest = this.balance * (dailyRate / 100) * daysDiff;
    
    this.lastInterestCalculation = now;
    return interest;
  }

  applyInterest(): number {
    const interest = this.calculateInterest();
    if (interest > 0) {
      this.deposit(interest);
    }
    return interest;
  }

  // Daily withdrawal limit management
  private resetDailyWithdrawalIfNeeded(): void {
    const today = new Date().toDateString();
    const lastReset = this.lastWithdrawalReset.toDateString();
    
    if (today !== lastReset) {
      this.dailyWithdrawnAmount = 0;
      this.lastWithdrawalReset = new Date();
    }
  }

  setDailyWithdrawalLimit(limit: number): void {
    this.dailyWithdrawalLimit = Math.max(0, limit);
  }

  removeDailyWithdrawalLimit(): void {
    this.dailyWithdrawalLimit = null;
  }

  // Utility methods
  formatBalance(): string {
    return `${this.balance.toFixed(8)} ${this.currency}`;
  }

  getBalanceSummary(): Record<string, number> {
    return {
      total: this.totalBalance,
      available: this.availableBalance,
      locked: this.lockedBalance,
      reserved: this.reservedBalance,
    };
  }

  // Static factory methods
  static createTradingWallet(userId: string, currency: string = 'USD'): Wallet {
    const wallet = new Wallet();
    wallet.userId = userId;
    wallet.type = WalletType.TRADING;
    wallet.currency = currency;
    wallet.status = WalletStatus.ACTIVE;
    wallet.isDefault = true;
    return wallet;
  }

  static createSavingsWallet(userId: string, currency: string = 'USD', interestRate: number = 0): Wallet {
    const wallet = new Wallet();
    wallet.userId = userId;
    wallet.type = WalletType.SAVINGS;
    wallet.currency = currency;
    wallet.status = WalletStatus.ACTIVE;
    wallet.interestRate = interestRate;
    return wallet;
  }
}