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
import { PositionType, PositionStatus, TaxLot, PerformanceMetrics } from '../entities/position.entity';

export class CreatePositionDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Initial quantity', minimum: 0.00000001 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  quantity: number;

  @ApiProperty({ description: 'Average cost per share', minimum: 0.00000001 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  averageCost: number;

  @ApiPropertyOptional({ description: 'Portfolio ID' })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiPropertyOptional({ description: 'Account ID' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ description: 'Instrument type', default: 'stock' })
  @IsOptional()
  @IsString()
  instrumentType?: string = 'stock';

  @ApiPropertyOptional({ description: 'CUSIP identifier' })
  @IsOptional()
  @IsString()
  cusip?: string;

  @ApiPropertyOptional({ description: 'ISIN identifier' })
  @IsOptional()
  @IsString()
  isin?: string;

  @ApiPropertyOptional({ description: 'Security name' })
  @IsOptional()
  @IsString()
  securityName?: string;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiPropertyOptional({ description: 'Sector' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ description: 'Industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Asset class' })
  @IsOptional()
  @IsString()
  assetClass?: string;

  @ApiPropertyOptional({ description: 'Current market price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  currentPrice?: number;

  @ApiPropertyOptional({ description: 'Target weight in portfolio (%)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  targetWeight?: number;

  @ApiPropertyOptional({ description: 'Position notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Position tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdatePositionDto {
  @ApiPropertyOptional({ description: 'Updated current price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  currentPrice?: number;

  @ApiPropertyOptional({ description: 'Updated target weight (%)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  targetWeight?: number;

  @ApiPropertyOptional({ description: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Updated tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Updated metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Risk metrics update' })
  @IsOptional()
  @IsObject()
  riskMetrics?: {
    beta?: number;
    volatility?: number;
    var1Day?: number;
    var5Day?: number;
    delta?: number;
    gamma?: number;
    theta?: number;
    vega?: number;
  };
}

export class PositionSearchDto {
  @ApiPropertyOptional({ description: 'Filter by symbol' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ description: 'Filter by portfolio ID' })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiPropertyOptional({ description: 'Filter by account ID' })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({ enum: PositionType, description: 'Filter by position type' })
  @IsOptional()
  @IsEnum(PositionType)
  positionType?: PositionType;

  @ApiPropertyOptional({ enum: PositionStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(PositionStatus)
  status?: PositionStatus;

  @ApiPropertyOptional({ description: 'Filter by instrument type' })
  @IsOptional()
  @IsString()
  instrumentType?: string;

  @ApiPropertyOptional({ description: 'Filter by sector' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ description: 'Filter by asset class' })
  @IsOptional()
  @IsString()
  assetClass?: string;

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

  @ApiPropertyOptional({ description: 'Minimum market value filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minMarketValue?: number;

  @ApiPropertyOptional({ description: 'Maximum market value filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxMarketValue?: number;

  @ApiPropertyOptional({ description: 'Minimum P&L filter' })
  @IsOptional()
  @IsNumber()
  minPnl?: number;

  @ApiPropertyOptional({ description: 'Maximum P&L filter' })
  @IsOptional()
  @IsNumber()
  maxPnl?: number;

  @ApiPropertyOptional({ description: 'Show only profitable positions' })
  @IsOptional()
  @IsBoolean()
  profitableOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only positions with losses' })
  @IsOptional()
  @IsBoolean()
  losersOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter positions opened after this date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  openedAfter?: Date;

  @ApiPropertyOptional({ description: 'Filter positions opened before this date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  openedBefore?: Date;

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

  @ApiPropertyOptional({ description: 'Sort field', default: 'lastUpdated' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'lastUpdated';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AddTradeDto {
  @ApiProperty({ description: 'Trade quantity (positive for buy, negative for sell)' })
  @IsNumber({ maxDecimalPlaces: 8 })
  quantity: number;

  @ApiProperty({ description: 'Trade price', minimum: 0.00000001 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  price: number;

  @ApiPropertyOptional({ description: 'Is this a buy trade', default: true })
  @IsOptional()
  @IsBoolean()
  isBuy?: boolean = true;

  @ApiPropertyOptional({ description: 'Trade date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  tradeDate?: Date;

  @ApiPropertyOptional({ description: 'Trade notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddDividendDto {
  @ApiProperty({ description: 'Dividend amount per share' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  amount: number;

  @ApiPropertyOptional({ description: 'Payment date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @ApiPropertyOptional({ description: 'Ex-dividend date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  exDate?: Date;

  @ApiPropertyOptional({ description: 'Dividend type' })
  @IsOptional()
  @IsString()
  dividendType?: string;
}

export class PositionResponseDto {
  @ApiProperty({ description: 'Position ID' })
  id: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Portfolio ID' })
  portfolioId?: string;

  @ApiProperty({ description: 'Account ID' })
  accountId?: string;

  @ApiProperty({ description: 'Trading symbol' })
  symbol: string;

  @ApiProperty({ description: 'Instrument type' })
  instrumentType: string;

  @ApiProperty({ description: 'CUSIP identifier' })
  cusip?: string;

  @ApiProperty({ description: 'ISIN identifier' })
  isin?: string;

  @ApiProperty({ description: 'Security name' })
  securityName?: string;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Sector' })
  sector?: string;

  @ApiProperty({ description: 'Industry' })
  industry?: string;

  @ApiProperty({ description: 'Asset class' })
  assetClass?: string;

  @ApiProperty({ description: 'Current position quantity' })
  quantity: number;

  @ApiProperty({ enum: PositionType, description: 'Position type' })
  positionType: PositionType;

  @ApiProperty({ enum: PositionStatus, description: 'Position status' })
  status: PositionStatus;

  @ApiProperty({ description: 'Average cost per share' })
  averageCost: number;

  @ApiProperty({ description: 'Total cost basis' })
  totalCost: number;

  @ApiProperty({ description: 'Current market price' })
  currentPrice?: number;

  @ApiProperty({ description: 'Current market value' })
  marketValue?: number;

  @ApiProperty({ description: 'Previous close price' })
  previousClose?: number;

  @ApiProperty({ description: 'Unrealized P&L' })
  unrealizedPnl: number;

  @ApiProperty({ description: 'Realized P&L' })
  realizedPnl: number;

  @ApiProperty({ description: 'Total P&L' })
  totalPnl: number;

  @ApiProperty({ description: 'Day P&L' })
  dayPnl: number;

  @ApiProperty({ description: 'Unrealized P&L percentage' })
  unrealizedPnlPercent: number;

  @ApiProperty({ description: 'Day change percentage' })
  dayChangePercent: number;

  @ApiProperty({ description: 'Total buy quantity' })
  buyQuantity: number;

  @ApiProperty({ description: 'Total sell quantity' })
  sellQuantity: number;

  @ApiProperty({ description: 'Total buy value' })
  buyValue: number;

  @ApiProperty({ description: 'Total sell value' })
  sellValue: number;

  @ApiProperty({ description: 'Number of trades' })
  tradeCount: number;

  @ApiProperty({ description: 'Last trade price' })
  lastTradePrice?: number;

  @ApiProperty({ description: 'Last trade quantity' })
  lastTradeQuantity?: number;

  @ApiProperty({ description: 'Last trade date' })
  lastTradeDate?: Date;

  @ApiProperty({ description: 'Tax lots', type: [Object] })
  taxLots: TaxLot[];

  @ApiProperty({ description: 'Wash sale loss deferred' })
  washSaleLossDeferred: number;

  @ApiProperty({ description: 'Short-term gain/loss' })
  shortTermGainLoss: number;

  @ApiProperty({ description: 'Long-term gain/loss' })
  longTermGainLoss: number;

  @ApiProperty({ description: 'Total dividend income' })
  dividendIncome: number;

  @ApiProperty({ description: 'Total interest income' })
  interestIncome: number;

  @ApiProperty({ description: 'Other income' })
  otherIncome: number;

  @ApiProperty({ description: 'Total income' })
  totalIncome: number;

  @ApiProperty({ description: 'Beta coefficient' })
  beta?: number;

  @ApiProperty({ description: 'Volatility' })
  volatility?: number;

  @ApiProperty({ description: '1-day Value at Risk' })
  var1Day?: number;

  @ApiProperty({ description: '5-day Value at Risk' })
  var5Day?: number;

  @ApiProperty({ description: 'Delta (for options)' })
  delta?: number;

  @ApiProperty({ description: 'Gamma (for options)' })
  gamma?: number;

  @ApiProperty({ description: 'Theta (for options)' })
  theta?: number;

  @ApiProperty({ description: 'Vega (for options)' })
  vega?: number;

  @ApiProperty({ description: 'Position weight in portfolio (%)' })
  weight: number;

  @ApiProperty({ description: 'Target weight in portfolio (%)' })
  targetWeight?: number;

  @ApiProperty({ description: 'Weight deviation from target' })
  weightDeviation: number;

  @ApiProperty({ description: 'Performance metrics', type: Object })
  performanceMetrics?: PerformanceMetrics;

  @ApiProperty({ description: 'Position notes' })
  notes?: string;

  @ApiProperty({ description: 'Position tags' })
  tags?: string[];

  @ApiProperty({ description: 'Position opened date' })
  openedAt: Date;

  @ApiProperty({ description: 'Position closed date' })
  closedAt?: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Is long position' })
  isLong: boolean;

  @ApiProperty({ description: 'Is short position' })
  isShort: boolean;

  @ApiProperty({ description: 'Is position open' })
  isOpen: boolean;

  @ApiProperty({ description: 'Is position closed' })
  isClosed: boolean;

  @ApiProperty({ description: 'Notional value' })
  notionalValue: number;

  @ApiProperty({ description: 'Effective market value' })
  effectiveMarketValue: number;

  @ApiProperty({ description: 'Break-even price' })
  breakEvenPrice: number;

  @ApiProperty({ description: 'Holding period in days' })
  holdingPeriodDays: number;

  @ApiProperty({ description: 'Average cost per share' })
  averageCostPerShare: number;

  @ApiProperty({ description: 'Total return percentage' })
  totalReturnPercent: number;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: Record<string, any>;
}

export class PositionListResponseDto {
  @ApiProperty({ type: [PositionResponseDto], description: 'Array of positions' })
  positions: PositionResponseDto[];

  @ApiProperty({ description: 'Total number of positions' })
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
    totalPositions: number;
    totalMarketValue: number;
    totalUnrealizedPnl: number;
    totalRealizedPnl: number;
    totalPnl: number;
    totalDayPnl: number;
    averageWeight: number;
    profitablePositions: number;
    losingPositions: number;
    topPerformers: Array<{
      symbol: string;
      pnlPercent: number;
      marketValue: number;
    }>;
    worstPerformers: Array<{
      symbol: string;
      pnlPercent: number;
      marketValue: number;
    }>;
  };
}

export class PositionAnalyticsDto {
  @ApiProperty({ description: 'Total number of positions' })
  totalPositions: number;

  @ApiProperty({ description: 'Total market value' })
  totalMarketValue: number;

  @ApiProperty({ description: 'Total unrealized P&L' })
  totalUnrealizedPnl: number;

  @ApiProperty({ description: 'Total realized P&L' })
  totalRealizedPnl: number;

  @ApiProperty({ description: 'Total P&L' })
  totalPnl: number;

  @ApiProperty({ description: 'Total day P&L' })
  totalDayPnl: number;

  @ApiProperty({ description: 'Overall return percentage' })
  totalReturnPercent: number;

  @ApiProperty({ description: 'Day return percentage' })
  dayReturnPercent: number;

  @ApiProperty({ description: 'Number of profitable positions' })
  profitablePositions: number;

  @ApiProperty({ description: 'Number of losing positions' })
  losingPositions: number;

  @ApiProperty({ description: 'Win rate percentage' })
  winRate: number;

  @ApiProperty({ description: 'Average holding period (days)' })
  averageHoldingPeriod: number;

  @ApiProperty({ description: 'Portfolio concentration (%)' })
  concentration: number;

  @ApiProperty({ description: 'Sector allocation' })
  sectorAllocation: Record<string, {
    count: number;
    marketValue: number;
    weight: number;
    pnl: number;
  }>;

  @ApiProperty({ description: 'Asset class allocation' })
  assetClassAllocation: Record<string, {
    count: number;
    marketValue: number;
    weight: number;
    pnl: number;
  }>;

  @ApiProperty({ description: 'Top holdings by market value' })
  topHoldings: Array<{
    symbol: string;
    marketValue: number;
    weight: number;
    pnl: number;
    pnlPercent: number;
  }>;

  @ApiProperty({ description: 'Positions requiring rebalancing' })
  rebalancingCandidates: Array<{
    symbol: string;
    currentWeight: number;
    targetWeight: number;
    deviation: number;
    marketValue: number;
  }>;

  @ApiProperty({ description: 'Risk metrics summary' })
  riskMetrics: {
    portfolioBeta: number;
    portfolioVolatility: number;
    portfolioVaR: number;
    correlationMatrix?: Record<string, Record<string, number>>;
    diversificationRatio: number;
  };
}