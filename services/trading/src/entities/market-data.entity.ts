import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';

export enum MarketDataType {
  QUOTE = 'quote',
  TRADE = 'trade',
  ORDER_BOOK = 'order_book',
  OHLCV = 'ohlcv',
  NEWS = 'news',
  FUNDAMENTAL = 'fundamental',
  TECHNICAL = 'technical',
  OPTIONS_CHAIN = 'options_chain',
}

export enum DataProvider {
  INTERNAL = 'internal',
  BLOOMBERG = 'bloomberg',
  REFINITIV = 'refinitiv',
  ALPHA_VANTAGE = 'alpha_vantage',
  QUANDL = 'quandl',
  IEX = 'iex',
  YAHOO = 'yahoo',
  POLYGON = 'polygon',
  TWELVE_DATA = 'twelve_data',
  FINNHUB = 'finnhub',
}

export enum MarketStatus {
  PRE_MARKET = 'pre_market',
  OPEN = 'open',
  CLOSED = 'closed',
  AFTER_HOURS = 'after_hours',
  HOLIDAY = 'holiday',
}

export interface Quote {
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  spread: number;
  spreadPercent: number;
  midPoint: number;
  last: number;
  lastSize: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  vwap?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  orderCount?: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: Date;
  sequence?: number;
}

export interface OHLCV {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  timestamp: Date;
  period: string; // 1m, 5m, 15m, 1h, 4h, 1d, etc.
}

export interface OptionsData {
  strike: number;
  expiration: Date;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  intrinsicValue: number;
  timeValue: number;
}

@Entity('market_data')
@Index(['symbol', 'dataType', 'timestamp'])
@Index(['symbol', 'timestamp'])
@Index(['dataType', 'timestamp'])
@Index(['provider', 'timestamp'])
@Index(['timestamp'])
export class MarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  symbol: string;

  @Column({ name: 'instrument_type', default: 'stock' })
  instrumentType: string;

  @Column({
    name: 'data_type',
    type: 'enum',
    enum: MarketDataType,
  })
  @Index()
  dataType: MarketDataType;

  @Column({
    type: 'enum',
    enum: DataProvider,
    default: DataProvider.INTERNAL,
  })
  @Index()
  provider: DataProvider;

  @Column({
    name: 'market_status',
    type: 'enum',
    enum: MarketStatus,
    nullable: true,
  })
  marketStatus?: MarketStatus;

  // Quote Data
  @Column({ name: 'bid_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  bidPrice?: number;

  @Column({ name: 'ask_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  askPrice?: number;

  @Column({ name: 'bid_size', type: 'decimal', precision: 20, scale: 8, nullable: true })
  bidSize?: number;

  @Column({ name: 'ask_size', type: 'decimal', precision: 20, scale: 8, nullable: true })
  askSize?: number;

  @Column({ name: 'last_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  lastPrice?: number;

  @Column({ name: 'last_size', type: 'decimal', precision: 20, scale: 8, nullable: true })
  lastSize?: number;

  // OHLCV Data
  @Column({ name: 'open_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  openPrice?: number;

  @Column({ name: 'high_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  highPrice?: number;

  @Column({ name: 'low_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  lowPrice?: number;

  @Column({ name: 'close_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  closePrice?: number;

  @Column({ name: 'previous_close', type: 'decimal', precision: 20, scale: 8, nullable: true })
  previousClose?: number;

  // Volume and Trading Activity
  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  volume?: number;

  @Column({ name: 'dollar_volume', type: 'decimal', precision: 20, scale: 2, nullable: true })
  dollarVolume?: number;

  @Column({ name: 'trade_count', nullable: true })
  tradeCount?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  vwap?: number;

  @Column({ name: 'avg_volume', type: 'decimal', precision: 20, scale: 8, nullable: true })
  avgVolume?: number;

  // Price Changes
  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  change?: number;

  @Column({ name: 'change_percent', type: 'decimal', precision: 10, scale: 4, nullable: true })
  changePercent?: number;

  @Column({ name: 'day_change', type: 'decimal', precision: 20, scale: 8, nullable: true })
  dayChange?: number;

  @Column({ name: 'day_change_percent', type: 'decimal', precision: 10, scale: 4, nullable: true })
  dayChangePercent?: number;

  // Spread Analysis
  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  spread?: number;

  @Column({ name: 'spread_percent', type: 'decimal', precision: 10, scale: 4, nullable: true })
  spreadPercent?: number;

  @Column({ name: 'mid_price', type: 'decimal', precision: 20, scale: 8, nullable: true })
  midPrice?: number;

  // Market Cap and Fundamentals
  @Column({ name: 'market_cap', type: 'decimal', precision: 20, scale: 2, nullable: true })
  marketCap?: number;

  @Column({ name: 'shares_outstanding', type: 'decimal', precision: 20, scale: 0, nullable: true })
  sharesOutstanding?: number;

  @Column({ name: 'float_shares', type: 'decimal', precision: 20, scale: 0, nullable: true })
  floatShares?: number;

  // Technical Indicators
  @Column({ name: 'rsi', type: 'decimal', precision: 10, scale: 4, nullable: true })
  rsi?: number;

  @Column({ name: 'volatility', type: 'decimal', precision: 10, scale: 4, nullable: true })
  volatility?: number;

  @Column({ name: 'beta', type: 'decimal', precision: 10, scale: 4, nullable: true })
  beta?: number;

  @Column({ name: 'pe_ratio', type: 'decimal', precision: 10, scale: 2, nullable: true })
  peRatio?: number;

  @Column({ name: 'dividend_yield', type: 'decimal', precision: 10, scale: 4, nullable: true })
  dividendYield?: number;

  // Complex Data as JSON
  @Column({ name: 'quote_data', type: 'jsonb', nullable: true })
  quoteData?: Quote;

  @Column({ name: 'order_book', type: 'jsonb', nullable: true })
  orderBook?: OrderBook;

  @Column({ name: 'ohlcv_data', type: 'jsonb', nullable: true })
  ohlcvData?: OHLCV;

  @Column({ name: 'options_data', type: 'jsonb', nullable: true })
  optionsData?: OptionsData[];

  // Time and Date Information
  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ name: 'market_date', type: 'date', nullable: true })
  marketDate?: Date;

  @Column({ name: 'time_zone', default: 'America/New_York' })
  timeZone: string;

  // Data Quality and Metadata
  @Column({ name: 'data_quality', type: 'decimal', precision: 5, scale: 2, default: 100 })
  dataQuality: number; // 0-100 score

  @Column({ name: 'delay_seconds', default: 0 })
  delaySeconds: number; // Real-time = 0, 15 min delay = 900, etc.

  @Column({ name: 'source_timestamp', type: 'timestamp', nullable: true })
  sourceTimestamp?: Date;

  @Column({ name: 'processing_latency', nullable: true })
  processingLatency?: number; // milliseconds

  @Column({ nullable: true })
  exchange?: string;

  @Column({ nullable: true })
  currency?: string;

  @Column({ name: 'is_regular_hours', default: true })
  isRegularHours: boolean;

  @Column({ name: 'is_real_time', default: false })
  isRealTime: boolean;

  @Column({ name: 'is_stale', default: false })
  isStale: boolean;

  // Additional Metadata
  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual Properties
  get age(): number {
    return Date.now() - this.timestamp.getTime();
  }

  get ageMinutes(): number {
    return Math.floor(this.age / (1000 * 60));
  }

  get isRecent(): boolean {
    return this.ageMinutes < 5; // Consider data recent if less than 5 minutes old
  }

  get isDelayed(): boolean {
    return this.delaySeconds > 0;
  }

  get isHighQuality(): boolean {
    return this.dataQuality >= 95;
  }

  get effectiveSpread(): number {
    if (this.bidPrice && this.askPrice) {
      return this.askPrice - this.bidPrice;
    }
    return this.spread || 0;
  }

  get effectiveMidPrice(): number {
    if (this.bidPrice && this.askPrice) {
      return (this.bidPrice + this.askPrice) / 2;
    }
    return this.midPrice || this.lastPrice || 0;
  }

  // Methods
  @BeforeInsert()
  setDefaults(): void {
    if (!this.timestamp) {
      this.timestamp = new Date();
    }
    
    if (!this.marketDate) {
      this.marketDate = new Date(this.timestamp.toDateString());
    }
    
    this.calculateSpread();
    this.calculateChanges();
  }

  private calculateSpread(): void {
    if (this.bidPrice && this.askPrice && this.bidPrice > 0 && this.askPrice > 0) {
      this.spread = this.askPrice - this.bidPrice;
      this.midPrice = (this.bidPrice + this.askPrice) / 2;
      
      if (this.midPrice > 0) {
        this.spreadPercent = (this.spread / this.midPrice) * 100;
      }
    }
  }

  private calculateChanges(): void {
    if (this.lastPrice && this.previousClose && this.previousClose > 0) {
      this.change = this.lastPrice - this.previousClose;
      this.changePercent = (this.change / this.previousClose) * 100;
    }
  }

  markAsStale(): void {
    this.isStale = true;
    this.dataQuality = Math.max(0, this.dataQuality - 20);
  }

  updateQuality(qualityScore: number): void {
    this.dataQuality = Math.max(0, Math.min(100, qualityScore));
  }

  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  toQuote(): Quote | null {
    if (!this.bidPrice || !this.askPrice || !this.lastPrice) {
      return null;
    }

    return {
      bid: this.bidPrice,
      ask: this.askPrice,
      bidSize: this.bidSize || 0,
      askSize: this.askSize || 0,
      spread: this.effectiveSpread,
      spreadPercent: this.spreadPercent || 0,
      midPoint: this.effectiveMidPrice,
      last: this.lastPrice,
      lastSize: this.lastSize || 0,
      change: this.change || 0,
      changePercent: this.changePercent || 0,
      volume: this.volume || 0,
      avgVolume: this.avgVolume || 0,
      vwap: this.vwap,
      high: this.highPrice || this.lastPrice,
      low: this.lowPrice || this.lastPrice,
      open: this.openPrice || this.lastPrice,
      previousClose: this.previousClose || this.lastPrice,
    };
  }

  toOHLCV(period: string = '1d'): OHLCV | null {
    if (!this.openPrice || !this.highPrice || !this.lowPrice || !this.closePrice) {
      return null;
    }

    return {
      open: this.openPrice,
      high: this.highPrice,
      low: this.lowPrice,
      close: this.closePrice,
      volume: this.volume || 0,
      vwap: this.vwap,
      timestamp: this.timestamp,
      period,
    };
  }

  static createQuote(
    symbol: string,
    bid: number,
    ask: number,
    last: number,
    provider: DataProvider = DataProvider.INTERNAL,
  ): Partial<MarketData> {
    const timestamp = new Date();
    
    return {
      symbol,
      instrumentType: 'stock',
      dataType: MarketDataType.QUOTE,
      provider,
      bidPrice: bid,
      askPrice: ask,
      lastPrice: last,
      spread: ask - bid,
      spreadPercent: ((ask - bid) / ((ask + bid) / 2)) * 100,
      midPrice: (bid + ask) / 2,
      timestamp,
      marketDate: new Date(timestamp.toDateString()),
      timeZone: 'America/New_York',
      dataQuality: 100,
      delaySeconds: 0,
      isRealTime: true,
      isStale: false,
    };
  }

  static createOHLCV(
    symbol: string,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
    provider: DataProvider = DataProvider.INTERNAL,
  ): Partial<MarketData> {
    const timestamp = new Date();
    
    return {
      symbol,
      instrumentType: 'stock',
      dataType: MarketDataType.OHLCV,
      provider,
      openPrice: open,
      highPrice: high,
      lowPrice: low,
      closePrice: close,
      volume,
      timestamp,
      marketDate: new Date(timestamp.toDateString()),
      timeZone: 'America/New_York',
      dataQuality: 100,
      delaySeconds: 0,
      isRealTime: true,
      isStale: false,
    };
  }

  static createTrade(
    symbol: string,
    price: number,
    size: number,
    provider: DataProvider = DataProvider.INTERNAL,
  ): Partial<MarketData> {
    const timestamp = new Date();
    
    return {
      symbol,
      instrumentType: 'stock',
      dataType: MarketDataType.TRADE,
      provider,
      lastPrice: price,
      lastSize: size,
      volume: size,
      timestamp,
      marketDate: new Date(timestamp.toDateString()),
      timeZone: 'America/New_York',
      dataQuality: 100,
      delaySeconds: 0,
      isRealTime: true,
      isStale: false,
    };
  }
}