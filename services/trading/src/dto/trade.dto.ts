import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsUUID,
  IsArray,
  IsObject,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TradeType, TradeStatus, LiquidityType } from '../entities/trade.entity';

export class CreateTradeDto {
  @ApiProperty({ description: 'Order ID this trade belongs to' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: TradeType, description: 'Trade type (buy/sell)' })
  @IsEnum(TradeType)
  type: TradeType;

  @ApiProperty({ description: 'Trade quantity', minimum: 0.00000001 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  quantity: number;

  @ApiProperty({ description: 'Trade price', minimum: 0.00000001 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  price: number;

  @ApiPropertyOptional({ description: 'External trade ID' })
  @IsOptional()
  @IsString()
  tradeId?: string;

  @ApiPropertyOptional({ description: 'Execution ID' })
  @IsOptional()
  @IsString()
  executionId?: string;

  @ApiPropertyOptional({ description: 'Trading venue' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ description: 'Exchange name' })
  @IsOptional()
  @IsString()
  exchange?: string;

  @ApiPropertyOptional({ description: 'Contra party' })
  @IsOptional()
  @IsString()
  contraParty?: string;

  @ApiPropertyOptional({ enum: LiquidityType, description: 'Liquidity type' })
  @IsOptional()
  @IsEnum(LiquidityType)
  liquidityType?: LiquidityType;

  @ApiPropertyOptional({ description: 'Commission amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  commission?: number;

  @ApiPropertyOptional({ description: 'Fees amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  fees?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ description: 'Regulatory fees' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  regulatoryFees?: number;

  @ApiPropertyOptional({ description: 'Clearing fees' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  clearingFees?: number;

  @ApiPropertyOptional({ description: 'Exchange fees' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  exchangeFees?: number;

  @ApiPropertyOptional({ description: 'Settlement date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  settlementDate?: Date;

  @ApiPropertyOptional({ description: 'Settlement currency', default: 'USD' })
  @IsOptional()
  @IsString()
  settlementCurrency?: string = 'USD';

  @ApiPropertyOptional({ description: 'Settlement price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  settlementPrice?: number;

  @ApiPropertyOptional({ description: 'Accrued interest' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  accruedInterest?: number;

  @ApiPropertyOptional({ description: 'Bid price at execution' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  bidPrice?: number;

  @ApiPropertyOptional({ description: 'Ask price at execution' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  askPrice?: number;

  @ApiPropertyOptional({ description: 'Mid price at execution' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  midPrice?: number;

  @ApiPropertyOptional({ description: 'Last price before execution' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  lastPrice?: number;

  @ApiPropertyOptional({ description: 'Market volume at execution' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Trade date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  tradeDate?: Date;

  @ApiPropertyOptional({ description: 'Trade time (HH:MM:SS)' })
  @IsOptional()
  @IsString()
  tradeTime?: string;

  @ApiPropertyOptional({ description: 'Execution timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  executedAt?: Date;

  @ApiPropertyOptional({ description: 'Trade notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTradeDto {
  @ApiPropertyOptional({ enum: TradeStatus, description: 'Updated trade status' })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({ description: 'Updated settlement date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  settlementDate?: Date;

  @ApiPropertyOptional({ description: 'Updated settlement price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  settlementPrice?: number;

  @ApiPropertyOptional({ description: 'Updated commission' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  commission?: number;

  @ApiPropertyOptional({ description: 'Updated fees' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  fees?: number;

  @ApiPropertyOptional({ description: 'Updated tax' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  tax?: number;

  @ApiPropertyOptional({ description: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Updated metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class TradeSearchDto {
  @ApiPropertyOptional({ description: 'Filter by symbol' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ description: 'Filter by order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ enum: TradeType, description: 'Filter by trade type' })
  @IsOptional()
  @IsEnum(TradeType)
  type?: TradeType;

  @ApiPropertyOptional({ enum: TradeStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(TradeStatus)
  status?: TradeStatus;

  @ApiPropertyOptional({ description: 'Filter by venue' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ description: 'Filter by exchange' })
  @IsOptional()
  @IsString()
  exchange?: string;

  @ApiPropertyOptional({ description: 'Filter by trade ID' })
  @IsOptional()
  @IsString()
  tradeId?: string;

  @ApiPropertyOptional({ description: 'Filter trades executed after this date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Filter trades executed before this date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Minimum quantity filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum gross value filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minGrossValue?: number;

  @ApiPropertyOptional({ description: 'Maximum gross value filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxGrossValue?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'executedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'executedAt';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class TradePerformanceDto {
  @ApiPropertyOptional({ description: 'Expected price for slippage calculation' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  expectedPrice?: number;

  @ApiPropertyOptional({ description: 'Reference price for improvement calculation' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  referencePrice?: number;

  @ApiPropertyOptional({ description: 'Benchmark price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  benchmarkPrice?: number;
}

export class TradeResponseDto {
  @ApiProperty({ description: 'Trade ID' })
  id: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Order ID' })
  orderId: string;

  @ApiProperty({ description: 'External trade ID' })
  tradeId?: string;

  @ApiProperty({ description: 'Execution ID' })
  executionId?: string;

  @ApiProperty({ description: 'Trading symbol' })
  symbol: string;

  @ApiProperty({ enum: TradeType, description: 'Trade type' })
  type: TradeType;

  @ApiProperty({ description: 'Trade quantity' })
  quantity: number;

  @ApiProperty({ description: 'Trade price' })
  price: number;

  @ApiProperty({ description: 'Gross trade value' })
  grossValue: number;

  @ApiProperty({ description: 'Net trade value' })
  netValue: number;

  @ApiProperty({ enum: TradeStatus, description: 'Trade status' })
  status: TradeStatus;

  @ApiProperty({ description: 'Trading venue' })
  venue?: string;

  @ApiProperty({ description: 'Exchange name' })
  exchange?: string;

  @ApiProperty({ description: 'Contra party' })
  contraParty?: string;

  @ApiProperty({ enum: LiquidityType, description: 'Liquidity type' })
  liquidityType?: LiquidityType;

  @ApiProperty({ description: 'Commission amount' })
  commission: number;

  @ApiProperty({ description: 'Fees amount' })
  fees: number;

  @ApiProperty({ description: 'Tax amount' })
  tax: number;

  @ApiProperty({ description: 'Regulatory fees' })
  regulatoryFees: number;

  @ApiProperty({ description: 'Clearing fees' })
  clearingFees: number;

  @ApiProperty({ description: 'Exchange fees' })
  exchangeFees: number;

  @ApiProperty({ description: 'Total fees' })
  totalFees: number;

  @ApiProperty({ description: 'Settlement date' })
  settlementDate?: Date;

  @ApiProperty({ description: 'Settlement currency' })
  settlementCurrency: string;

  @ApiProperty({ description: 'Settlement price' })
  settlementPrice?: number;

  @ApiProperty({ description: 'Accrued interest' })
  accruedInterest: number;

  @ApiProperty({ description: 'Bid price at execution' })
  bidPrice?: number;

  @ApiProperty({ description: 'Ask price at execution' })
  askPrice?: number;

  @ApiProperty({ description: 'Mid price at execution' })
  midPrice?: number;

  @ApiProperty({ description: 'Last price before execution' })
  lastPrice?: number;

  @ApiProperty({ description: 'Market volume at execution' })
  volume?: number;

  @ApiProperty({ description: 'Slippage amount' })
  slippage?: number;

  @ApiProperty({ description: 'Market impact' })
  marketImpact?: number;

  @ApiProperty({ description: 'Price improvement' })
  priceImprovement?: number;

  @ApiProperty({ description: 'Trade date' })
  tradeDate: Date;

  @ApiProperty({ description: 'Trade time' })
  tradeTime: string;

  @ApiProperty({ description: 'Execution timestamp' })
  executedAt: Date;

  @ApiProperty({ description: 'Reported timestamp' })
  reportedAt?: Date;

  @ApiProperty({ description: 'Confirmed timestamp' })
  confirmedAt?: Date;

  @ApiProperty({ description: 'Settled timestamp' })
  settledAt?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Trade notes' })
  notes?: string;

  @ApiProperty({ description: 'Total transaction cost' })
  totalCost: number;

  @ApiProperty({ description: 'Effective price per share' })
  effectivePrice: number;

  @ApiProperty({ description: 'Is trade settled' })
  isSettled: boolean;

  @ApiProperty({ description: 'Has price improvement' })
  hasPriceImprovement: boolean;

  @ApiProperty({ description: 'Has significant slippage' })
  hasSlippage: boolean;

  @ApiProperty({ description: 'Execution quality score (0-100)' })
  executionQualityScore: number;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: Record<string, any>;
}

export class TradeListResponseDto {
  @ApiProperty({ type: [TradeResponseDto], description: 'Array of trades' })
  trades: TradeResponseDto[];

  @ApiProperty({ description: 'Total number of trades' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;

  @ApiProperty({ description: 'Summary statistics' })
  summary: {
    totalVolume: number;
    totalValue: number;
    averagePrice: number;
    totalFees: number;
    buyCount: number;
    sellCount: number;
    averageExecutionQuality: number;
  };
}

export class TradeAnalyticsDto {
  @ApiProperty({ description: 'Total number of trades' })
  totalTrades: number;

  @ApiProperty({ description: 'Total volume traded' })
  totalVolume: number;

  @ApiProperty({ description: 'Total value traded' })
  totalValue: number;

  @ApiProperty({ description: 'Average trade size' })
  averageTradeSize: number;

  @ApiProperty({ description: 'Average execution price' })
  averagePrice: number;

  @ApiProperty({ description: 'Total fees paid' })
  totalFees: number;

  @ApiProperty({ description: 'Average execution quality score' })
  averageExecutionQuality: number;

  @ApiProperty({ description: 'Total slippage' })
  totalSlippage: number;

  @ApiProperty({ description: 'Total price improvement' })
  totalPriceImprovement: number;

  @ApiProperty({ description: 'Percentage of trades with price improvement' })
  priceImprovementRate: number;

  @ApiProperty({ description: 'Average time to settlement (in days)' })
  averageSettlementTime: number;

  @ApiProperty({ description: 'Trades by venue' })
  venueBreakdown: Record<string, {
    count: number;
    volume: number;
    value: number;
    averageQuality: number;
  }>;

  @ApiProperty({ description: 'Trades by liquidity type' })
  liquidityBreakdown: Record<string, {
    count: number;
    volume: number;
    value: number;
  }>;

  @ApiProperty({ description: 'Daily trading activity' })
  dailyActivity: Array<{
    date: string;
    tradeCount: number;
    volume: number;
    value: number;
    averagePrice: number;
  }>;
}