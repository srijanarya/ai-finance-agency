import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateWatchlistDto {
  @ApiProperty({ description: "Trading symbol" })
  @IsString()
  symbol: string;

  @ApiProperty({ description: "Display name for the symbol", required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ description: "User notes about this symbol", required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: "Custom tags for categorization",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: "Target buy price", required: false })
  @IsOptional()
  @IsNumber()
  targetBuyPrice?: number;

  @ApiProperty({ description: "Target sell price", required: false })
  @IsOptional()
  @IsNumber()
  targetSellPrice?: number;

  @ApiProperty({ description: "Stop loss price", required: false })
  @IsOptional()
  @IsNumber()
  stopLossPrice?: number;

  @ApiProperty({
    description: "Receive price alerts for this symbol",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableAlerts?: boolean;
}

export class UpdateWatchlistDto {
  @ApiProperty({ description: "Display name for the symbol", required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ description: "User notes about this symbol", required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: "Custom tags for categorization",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: "Order/position in the watchlist",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: "Target buy price", required: false })
  @IsOptional()
  @IsNumber()
  targetBuyPrice?: number;

  @ApiProperty({ description: "Target sell price", required: false })
  @IsOptional()
  @IsNumber()
  targetSellPrice?: number;

  @ApiProperty({ description: "Stop loss price", required: false })
  @IsOptional()
  @IsNumber()
  stopLossPrice?: number;

  @ApiProperty({
    description: "Is this symbol actively monitored",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: "Receive price alerts for this symbol",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableAlerts?: boolean;
}

export class WatchlistResponseDto {
  @ApiProperty({ description: "Watchlist item ID" })
  id: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ description: "Trading symbol" })
  symbol: string;

  @ApiProperty({ description: "Display name for the symbol", required: false })
  displayName?: string;

  @ApiProperty({ description: "User notes about this symbol", required: false })
  notes?: string;

  @ApiProperty({
    description: "Custom tags for categorization",
    type: [String],
  })
  tags: string[];

  @ApiProperty({ description: "Order/position in the watchlist" })
  sortOrder: number;

  @ApiProperty({ description: "Target buy price", required: false })
  targetBuyPrice?: number;

  @ApiProperty({ description: "Target sell price", required: false })
  targetSellPrice?: number;

  @ApiProperty({ description: "Stop loss price", required: false })
  stopLossPrice?: number;

  @ApiProperty({ description: "Is this symbol actively monitored" })
  isActive: boolean;

  @ApiProperty({ description: "Receive price alerts for this symbol" })
  enableAlerts: boolean;

  @ApiProperty({
    description: "Price when added to watchlist",
    required: false,
  })
  addedAtPrice?: number;

  @ApiProperty({ description: "Created date" })
  createdAt: Date;

  @ApiProperty({ description: "Updated date" })
  updatedAt: Date;
}

export class WatchlistWithMarketDataDto extends WatchlistResponseDto {
  @ApiProperty({ description: "Current price", required: false })
  currentPrice?: number;

  @ApiProperty({ description: "Daily change amount", required: false })
  change?: number;

  @ApiProperty({ description: "Daily change percentage", required: false })
  changePercent?: number;

  @ApiProperty({ description: "Daily high", required: false })
  dayHigh?: number;

  @ApiProperty({ description: "Daily low", required: false })
  dayLow?: number;

  @ApiProperty({ description: "Trading volume", required: false })
  volume?: number;

  @ApiProperty({ description: "Is market currently open", required: false })
  isMarketOpen?: boolean;
}

export class ReorderWatchlistDto {
  @ApiProperty({ description: "Array of item orders", type: [Object] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemOrderDto)
  itemOrders: ItemOrderDto[];
}

export class ItemOrderDto {
  @ApiProperty({ description: "Watchlist item ID" })
  @IsUUID()
  id: string;

  @ApiProperty({ description: "Sort order" })
  @IsNumber()
  sortOrder: number;
}

export class BulkAddToWatchlistDto {
  @ApiProperty({ description: "Array of symbols to add", type: [String] })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];
}

export class BulkRemoveFromWatchlistDto {
  @ApiProperty({
    description: "Array of watchlist item IDs to remove",
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  itemIds: string[];
}

export class ImportWatchlistDto {
  @ApiProperty({ description: "CSV data to import" })
  @IsString()
  csvData: string;
}

export class WatchlistStatisticsDto {
  @ApiProperty({ description: "Total number of symbols in watchlist" })
  totalSymbols: number;

  @ApiProperty({ description: "Number of active symbols" })
  activeSymbols: number;

  @ApiProperty({ description: "Symbols grouped by tags", type: [Object] })
  symbolsByTags: { tag: string; count: number }[];

  @ApiProperty({ description: "Number of symbols with price alerts enabled" })
  priceAlerts: number;

  @ApiProperty({
    description: "Top gaining symbols",
    type: [WatchlistWithMarketDataDto],
  })
  topGainers: WatchlistWithMarketDataDto[];

  @ApiProperty({
    description: "Top losing symbols",
    type: [WatchlistWithMarketDataDto],
  })
  topLosers: WatchlistWithMarketDataDto[];
}

export class WatchlistImportResultDto {
  @ApiProperty({
    description: "Successfully imported items",
    type: [WatchlistResponseDto],
  })
  success: WatchlistResponseDto[];

  @ApiProperty({ description: "Import errors", type: [Object] })
  errors: { symbol: string; error: string }[];

  @ApiProperty({ description: "Import summary", type: Object })
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export class WatchlistExportDto {
  @ApiProperty({ description: "CSV content" })
  csv: string;

  @ApiProperty({ description: "Suggested filename" })
  filename: string;
}

export class GetWatchlistByTagsDto {
  @ApiProperty({
    description: "Comma-separated tags to filter by",
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}

export class WatchlistSymbolsDto {
  @ApiProperty({ description: "Array of symbols in watchlist", type: [String] })
  symbols: string[];
}
