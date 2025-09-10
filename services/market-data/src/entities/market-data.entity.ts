import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum DataSource {
  ALPHA_VANTAGE = "alpha_vantage",
  IEX = "iex",
  YAHOO_FINANCE = "yahoo_finance",
  BINANCE = "binance",
  COINBASE = "coinbase",
  FINNHUB = "finnhub",
}

@Entity("market_data")
@Index(["symbol", "timestamp"])
@Index(["symbol", "source"])
export class MarketData {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Trading symbol (e.g., AAPL, BTC-USD)" })
  @Column({ type: "varchar", length: 20 })
  @Index()
  symbol: string;

  @ApiProperty({ description: "Current price" })
  @Column({ type: "decimal", precision: 18, scale: 8 })
  price: number;

  @ApiProperty({ description: "Bid price" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  bid?: number;

  @ApiProperty({ description: "Ask price" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  ask?: number;

  @ApiProperty({ description: "Bid size" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  bidSize?: number;

  @ApiProperty({ description: "Ask size" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  askSize?: number;

  @ApiProperty({ description: "Trading volume" })
  @Column({ type: "bigint", default: 0 })
  volume: number;

  @ApiProperty({ description: "Previous close price" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  previousClose?: number;

  @ApiProperty({ description: "Daily change amount" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  change?: number;

  @ApiProperty({ description: "Daily change percentage" })
  @Column({ type: "decimal", precision: 8, scale: 4, nullable: true })
  changePercent?: number;

  @ApiProperty({ description: "Daily high" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  dayHigh?: number;

  @ApiProperty({ description: "Daily low" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  dayLow?: number;

  @ApiProperty({ description: "Market cap" })
  @Column({ type: "bigint", nullable: true })
  marketCap?: number;

  @ApiProperty({ description: "Data source", enum: DataSource })
  @Column({
    type: "enum",
    enum: DataSource,
    default: DataSource.ALPHA_VANTAGE,
  })
  source: DataSource;

  @ApiProperty({ description: "Data timestamp" })
  @Column({ type: "timestamp with time zone" })
  @Index()
  timestamp: Date;

  @ApiProperty({ description: "Is market currently open" })
  @Column({ type: "boolean", default: false })
  isMarketOpen: boolean;

  @ApiProperty({
    description: "Market session (pre-market, regular, after-hours)",
  })
  @Column({ type: "varchar", length: 20, nullable: true })
  marketSession?: string;

  @ApiProperty({ description: "Additional metadata in JSON format" })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
