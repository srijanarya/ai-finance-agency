import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('market_data')
@Index(['symbol', 'timestamp'])
@Index(['timestamp'])
@Unique(['symbol', 'timestamp', 'timeFrame'])
export class MarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  symbol: string;

  @Column({ type: 'varchar', length: 10 })
  timeFrame: string; // 1min, 5min, 15min, 30min, 1h, 4h, 1d, 1w

  @Column('timestamp')
  @Index()
  timestamp: Date;

  @Column('decimal', { precision: 15, scale: 6 })
  open: number;

  @Column('decimal', { precision: 15, scale: 6 })
  high: number;

  @Column('decimal', { precision: 15, scale: 6 })
  low: number;

  @Column('decimal', { precision: 15, scale: 6 })
  close: number;

  @Column('bigint')
  volume: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  vwap?: number; // Volume Weighted Average Price

  @Column('jsonb', { nullable: true })
  technicalIndicators?: {
    sma?: { [period: string]: number }; // Simple Moving Averages
    ema?: { [period: string]: number }; // Exponential Moving Averages
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollinger?: {
      upper: number;
      middle: number;
      lower: number;
    };
    atr?: number; // Average True Range
    adx?: number; // Average Directional Index
    stochastic?: {
      k: number;
      d: number;
    };
    williamsR?: number;
    cci?: number; // Commodity Channel Index
    mfi?: number; // Money Flow Index
  };

  @Column('jsonb', { nullable: true })
  marketMetrics?: {
    volatility?: number;
    liquidityScore?: number;
    spreadPercent?: number;
    orderBookImbalance?: number;
    marketImpact?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Helper methods
  get priceChange(): number {
    return this.close - this.open;
  }

  get priceChangePercent(): number {
    return ((this.close - this.open) / this.open) * 100;
  }

  get typicalPrice(): number {
    return (this.high + this.low + this.close) / 3;
  }

  get trueRange(): number {
    const tr1 = this.high - this.low;
    const tr2 = Math.abs(this.high - this.close);
    const tr3 = Math.abs(this.low - this.close);
    return Math.max(tr1, tr2, tr3);
  }
}

@Entity('market_news')
@Index(['symbol', 'publishedAt'])
@Index(['publishedAt'])
export class MarketNews {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  symbol?: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'varchar', length: 200 })
  source: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  url?: string;

  @Column('timestamp')
  publishedAt: Date;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  sentimentScore?: number; // -1.0 to 1.0

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  relevanceScore?: number; // 0.0 to 1.0

  @Column('jsonb', { nullable: true })
  nlpAnalysis?: {
    keyPhrases?: string[];
    namedEntities?: string[];
    language?: string;
    confidenceScore?: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('economic_indicators')
@Index(['indicator', 'releaseDate'])
export class EconomicIndicator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  indicator: string; // GDP, CPI, NFP, etc.

  @Column('decimal', { precision: 15, scale: 6 })
  value: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  previousValue?: number;

  @Column('decimal', { precision: 15, scale: 6, nullable: true })
  forecastValue?: number;

  @Column({ type: 'varchar', length: 10 })
  unit: string; // %, $B, K, etc.

  @Column({ type: 'varchar', length: 50 })
  country: string;

  @Column('timestamp')
  releaseDate: Date;

  @Column('varchar', { length: 20 })
  frequency: string; // daily, weekly, monthly, quarterly, annually

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  marketImpact?: number; // 0.0 to 1.0

  @CreateDateColumn()
  createdAt: Date;
}
