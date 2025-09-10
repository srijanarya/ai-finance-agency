import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('market_quotes')
@Index(['symbol', 'timestamp'], { unique: false })
@Index(['symbol', 'createdAt'])
export class MarketQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  symbol: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  change: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  changePercent: number;

  @Column({ type: 'bigint' })
  volume: number;

  @Column({ type: 'bigint', nullable: true })
  marketCap?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  previousClose: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  dayLow: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  dayHigh: number;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @Column({ type: 'boolean', default: true })
  isMarketOpen: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  getFormattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }

  getFormattedChange(): string {
    const sign = this.change >= 0 ? '+' : '';
    return `${sign}$${this.change.toFixed(2)} (${sign}${this.changePercent.toFixed(2)}%)`;
  }

  isPositiveChange(): boolean {
    return this.change > 0;
  }

  getMarketCapFormatted(): string | null {
    if (!this.marketCap) return null;
    
    if (this.marketCap >= 1e12) {
      return `$${(this.marketCap / 1e12).toFixed(2)}T`;
    } else if (this.marketCap >= 1e9) {
      return `$${(this.marketCap / 1e9).toFixed(2)}B`;
    } else if (this.marketCap >= 1e6) {
      return `$${(this.marketCap / 1e6).toFixed(2)}M`;
    }
    
    return `$${this.marketCap.toLocaleString()}`;
  }
}