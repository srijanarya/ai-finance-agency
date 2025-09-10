import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum SessionType {
  PRE_MARKET = "pre_market",
  REGULAR = "regular",
  AFTER_HOURS = "after_hours",
  CLOSED = "closed",
}

export enum MarketType {
  STOCK = "stock",
  FOREX = "forex",
  CRYPTO = "crypto",
  COMMODITY = "commodity",
  FUTURES = "futures",
  OPTIONS = "options",
}

@Entity("market_sessions")
@Index(["market", "sessionDate"])
export class MarketSession {
  @ApiProperty({ description: "Unique identifier" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Market identifier (e.g., NYSE, NASDAQ, FOREX)" })
  @Column({ type: "varchar", length: 50 })
  @Index()
  market: string;

  @ApiProperty({ description: "Market type", enum: MarketType })
  @Column({
    type: "enum",
    enum: MarketType,
  })
  marketType: MarketType;

  @ApiProperty({ description: "Session date" })
  @Column({ type: "date" })
  @Index()
  sessionDate: Date;

  @ApiProperty({ description: "Current session type", enum: SessionType })
  @Column({
    type: "enum",
    enum: SessionType,
    default: SessionType.CLOSED,
  })
  currentSession: SessionType;

  @ApiProperty({ description: "Is market currently open" })
  @Column({ type: "boolean", default: false })
  isOpen: boolean;

  @ApiProperty({ description: "Pre-market session start time" })
  @Column({ type: "time", nullable: true })
  preMarketStart?: string;

  @ApiProperty({ description: "Pre-market session end time" })
  @Column({ type: "time", nullable: true })
  preMarketEnd?: string;

  @ApiProperty({ description: "Regular session start time" })
  @Column({ type: "time" })
  regularStart: string;

  @ApiProperty({ description: "Regular session end time" })
  @Column({ type: "time" })
  regularEnd: string;

  @ApiProperty({ description: "After-hours session start time" })
  @Column({ type: "time", nullable: true })
  afterHoursStart?: string;

  @ApiProperty({ description: "After-hours session end time" })
  @Column({ type: "time", nullable: true })
  afterHoursEnd?: string;

  @ApiProperty({ description: "Market timezone" })
  @Column({ type: "varchar", length: 50, default: "America/New_York" })
  timezone: string;

  @ApiProperty({ description: "Is this a holiday" })
  @Column({ type: "boolean", default: false })
  isHoliday: boolean;

  @ApiProperty({ description: "Holiday name if applicable" })
  @Column({ type: "varchar", length: 100, nullable: true })
  holidayName?: string;

  @ApiProperty({ description: "Early close time if applicable" })
  @Column({ type: "time", nullable: true })
  earlyCloseTime?: string;

  @ApiProperty({ description: "Next session opening time" })
  @Column({ type: "timestamp with time zone", nullable: true })
  nextSessionOpen?: Date;

  @ApiProperty({ description: "Additional session metadata" })
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
