import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('historical_market_data')
@Unique(['symbol', 'date', 'interval'])
@Index(['symbol', 'date'])
@Index(['symbol', 'interval'])
export class HistoricalMarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  symbol: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'varchar', length: 5, default: '1d' })
  interval: string;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  open: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  high: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  low: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  close: number;

  @Column({ type: 'bigint' })
  volume: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  adjustedClose?: number;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  // Helper methods
  getDailyReturn(): number {
    if (this.adjustedClose && this.open) {
      return ((this.adjustedClose - this.open) / this.open) * 100;
    }
    return ((this.close - this.open) / this.open) * 100;
  }

  getTrueRange(): number {
    // True Range calculation for volatility analysis
    const highLow = this.high - this.low;
    const highPrevClose = Math.abs(this.high - this.open); // Approximation
    const lowPrevClose = Math.abs(this.low - this.open); // Approximation
    
    return Math.max(highLow, highPrevClose, lowPrevClose);
  }

  getBodySize(): number {
    return Math.abs(this.close - this.open);
  }

  getUpperShadow(): number {
    return this.high - Math.max(this.open, this.close);
  }

  getLowerShadow(): number {
    return Math.min(this.open, this.close) - this.low;
  }

  isBullish(): boolean {
    return this.close > this.open;
  }

  isBearish(): boolean {
    return this.close < this.open;
  }

  isDoji(): boolean {
    const bodySize = this.getBodySize();
    const totalRange = this.high - this.low;
    // Doji if body is less than 10% of total range
    return totalRange > 0 && (bodySize / totalRange) < 0.1;
  }

  getOHLCString(): string {
    return `O:${this.open.toFixed(2)} H:${this.high.toFixed(2)} L:${this.low.toFixed(2)} C:${this.close.toFixed(2)}`;
  }
}