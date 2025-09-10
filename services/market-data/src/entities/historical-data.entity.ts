import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { DataSource } from "./market-data.entity";

export enum TimeInterval {
  ONE_MINUTE = "1min",
  FIVE_MINUTES = "5min",
  FIFTEEN_MINUTES = "15min",
  THIRTY_MINUTES = "30min",
  ONE_HOUR = "1hour",
  FOUR_HOURS = "4hour",
  ONE_DAY = "1day",
  ONE_WEEK = "1week",
  ONE_MONTH = "1month",
}

@Entity("historical_data")
@Index(["symbol", "interval", "timestamp"], { unique: true })
@Index(["symbol", "timestamp"])
export class HistoricalData {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Trading symbol" })
  @Column({ type: "varchar", length: 20 })
  @Index()
  symbol: string;

  @ApiProperty({ description: "Time interval", enum: TimeInterval })
  @Column({
    type: "enum",
    enum: TimeInterval,
  })
  interval: TimeInterval;

  @ApiProperty({ description: "Opening price" })
  @Column({ type: "decimal", precision: 18, scale: 8 })
  open: number;

  @ApiProperty({ description: "Highest price" })
  @Column({ type: "decimal", precision: 18, scale: 8 })
  high: number;

  @ApiProperty({ description: "Lowest price" })
  @Column({ type: "decimal", precision: 18, scale: 8 })
  low: number;

  @ApiProperty({ description: "Closing price" })
  @Column({ type: "decimal", precision: 18, scale: 8 })
  close: number;

  @ApiProperty({ description: "Adjusted closing price" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  adjustedClose?: number;

  @ApiProperty({ description: "Trading volume" })
  @Column({ type: "bigint", default: 0 })
  volume: number;

  @ApiProperty({ description: "Volume weighted average price" })
  @Column({ type: "decimal", precision: 18, scale: 8, nullable: true })
  vwap?: number;

  @ApiProperty({ description: "Data source", enum: DataSource })
  @Column({
    type: "enum",
    enum: DataSource,
    default: DataSource.ALPHA_VANTAGE,
  })
  source: DataSource;

  @ApiProperty({ description: "Candle timestamp" })
  @Column({ type: "timestamp with time zone" })
  @Index()
  timestamp: Date;

  @ApiProperty({ description: "Number of trades" })
  @Column({ type: "integer", nullable: true })
  tradeCount?: number;

  @ApiProperty({ description: "Additional metadata" })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
