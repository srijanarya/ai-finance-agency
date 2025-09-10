import { ApiProperty } from "@nestjs/swagger";

export class WatchlistWithMarketDataDto {
  @ApiProperty({ description: "Watchlist ID" })
  id: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ description: "Symbol" })
  symbol: string;

  @ApiProperty({ description: "Display name", required: false })
  displayName?: string;

  @ApiProperty({ description: "Notes", required: false })
  notes?: string;

  @ApiProperty({ description: "Tags", type: [String], required: false })
  tags?: string[];

  @ApiProperty({ description: "Sort order" })
  sortOrder: number;

  @ApiProperty({ description: "Target buy price", required: false })
  targetBuyPrice?: number;

  @ApiProperty({ description: "Target sell price", required: false })
  targetSellPrice?: number;

  @ApiProperty({ description: "Stop loss price", required: false })
  stopLossPrice?: number;

  @ApiProperty({ description: "Is active" })
  isActive: boolean;

  @ApiProperty({ description: "Enable alerts" })
  enableAlerts: boolean;

  @ApiProperty({ description: "Current price", required: false })
  currentPrice?: number;

  @ApiProperty({ description: "Price change", required: false })
  change?: number;

  @ApiProperty({ description: "Price change percentage", required: false })
  changePercent?: number;

  @ApiProperty({ description: "Day high", required: false })
  dayHigh?: number;

  @ApiProperty({ description: "Day low", required: false })
  dayLow?: number;

  @ApiProperty({ description: "Volume", required: false })
  volume?: number;

  @ApiProperty({ description: "Is market open", required: false })
  isMarketOpen?: boolean;

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiProperty({ description: "Updated at" })
  updatedAt: Date;
}
