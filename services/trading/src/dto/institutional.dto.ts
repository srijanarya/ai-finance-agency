import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsDateString,
  IsUUID,
  ValidateNested,
  Min,
  Max,
  IsObject,
  IsNotEmpty,
  ArrayMinSize,
  IsDecimal,
  IsPositive,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum InstitutionalOrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
  ICEBERG = 'iceberg',
  TWAP = 'twap',
  VWAP = 'vwap',
  POV = 'pov', // Percentage of Volume
  IS = 'implementation_shortfall',
  CUSTOM_ALGO = 'custom_algo',
}

export enum InstitutionalOrderStatus {
  PENDING = 'pending',
  WORKING = 'working',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export enum InstitutionalOrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum TimeInForce {
  DAY = 'day',
  GTC = 'gtc', // Good Till Cancelled
  IOC = 'ioc', // Immediate or Cancel
  FOK = 'fok', // Fill or Kill
  GTD = 'gtd', // Good Till Date
}

export enum TradingVenue {
  NYSE = 'nyse',
  NASDAQ = 'nasdaq',
  CBOE = 'cboe',
  DARK_POOL = 'dark_pool',
  ECN = 'ecn',
  SOR = 'sor', // Smart Order Router
}

export enum ComplianceRuleType {
  POSITION_LIMIT = 'POSITION_LIMIT',
  CONCENTRATION_LIMIT = 'CONCENTRATION_LIMIT',
  RESTRICTED_LIST = 'RESTRICTED_LIST',
  WASH_SALE = 'WASH_SALE',
  BEST_EXECUTION = 'BEST_EXECUTION',
  MARKET_MAKING = 'MARKET_MAKING',
  INSIDER_TRADING = 'INSIDER_TRADING',
}

export class CreateInstitutionalOrderDto {
  @ApiProperty({
    description: 'Trading symbol',
    example: 'AAPL',
  })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: 'Order side',
    enum: InstitutionalOrderSide,
    example: InstitutionalOrderSide.BUY,
  })
  @IsEnum(InstitutionalOrderSide)
  side: InstitutionalOrderSide;

  @ApiProperty({
    description: 'Order type',
    enum: InstitutionalOrderType,
    example: InstitutionalOrderType.VWAP,
  })
  @IsEnum(InstitutionalOrderType)
  orderType: InstitutionalOrderType;

  @ApiProperty({
    description: 'Order quantity',
    example: 100000,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({
    description: 'Limit price (required for limit orders)',
    example: 150.50,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({
    description: 'Stop price (for stop orders)',
    example: 145.00,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  stopPrice?: number;

  @ApiProperty({
    description: 'Time in force',
    enum: TimeInForce,
    example: TimeInForce.DAY,
  })
  @IsEnum(TimeInForce)
  timeInForce: TimeInForce;

  @ApiPropertyOptional({
    description: 'Good till date (for GTD orders)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  goodTillDate?: string;

  @ApiPropertyOptional({
    description: 'Preferred trading venues',
    example: ['nyse', 'nasdaq', 'dark_pool'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TradingVenue, { each: true })
  preferredVenues?: TradingVenue[];

  @ApiPropertyOptional({
    description: 'Algorithm parameters for algorithmic orders',
    example: {
      participationRate: 0.10,
      startTime: '09:30:00',
      endTime: '16:00:00',
      minFillSize: 100,
    },
  })
  @IsOptional()
  @IsObject()
  algorithmParams?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Portfolio ID for attribution',
    example: 'portfolio-uuid-123',
  })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiPropertyOptional({
    description: 'Strategy name for reporting',
    example: 'large_cap_momentum',
  })
  @IsOptional()
  @IsString()
  strategy?: string;

  @ApiPropertyOptional({
    description: 'Trader notes',
    example: 'Execute with minimal market impact',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Client order ID for tracking',
    example: 'client-order-12345',
  })
  @IsOptional()
  @IsString()
  clientOrderId?: string;
}

export class BulkOrderDto {
  @ApiProperty({
    description: 'Array of orders to execute',
    type: [CreateInstitutionalOrderDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInstitutionalOrderDto)
  orders: CreateInstitutionalOrderDto[];

  @ApiPropertyOptional({
    description: 'Execution strategy for bulk orders',
    example: 'time_spread',
  })
  @IsOptional()
  @IsString()
  executionStrategy?: 'time_spread' | 'volume_spread' | 'simultaneous' | 'optimized';

  @ApiPropertyOptional({
    description: 'Maximum execution time in minutes',
    example: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480) // 8 hours max
  maxExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Allow partial execution',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  allowPartialExecution?: boolean;
}

export class InstitutionalOrderSearchDto {
  @ApiPropertyOptional({
    description: 'Symbol filter',
    example: 'AAPL',
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({
    description: 'Order status filter',
    enum: InstitutionalOrderStatus,
  })
  @IsOptional()
  @IsEnum(InstitutionalOrderStatus)
  status?: InstitutionalOrderStatus;

  @ApiPropertyOptional({
    description: 'Order side filter',
    enum: InstitutionalOrderSide,
  })
  @IsOptional()
  @IsEnum(InstitutionalOrderSide)
  side?: InstitutionalOrderSide;

  @ApiPropertyOptional({
    description: 'Start date filter',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Portfolio ID filter',
    example: 'portfolio-uuid-123',
  })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiPropertyOptional({
    description: 'Strategy filter',
    example: 'large_cap_momentum',
  })
  @IsOptional()
  @IsString()
  strategy?: string;

  @ApiPropertyOptional({
    description: 'Minimum order size',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSize?: number;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class InstitutionalOrderResponseDto {
  @ApiProperty({ example: 'order-uuid-123' })
  id: string;

  @ApiProperty({ example: 'client-order-12345' })
  clientOrderId?: string;

  @ApiProperty({ example: 'AAPL' })
  symbol: string;

  @ApiProperty({ enum: InstitutionalOrderSide, example: InstitutionalOrderSide.BUY })
  side: InstitutionalOrderSide;

  @ApiProperty({ enum: InstitutionalOrderType, example: InstitutionalOrderType.VWAP })
  orderType: InstitutionalOrderType;

  @ApiProperty({ example: 100000 })
  quantity: number;

  @ApiProperty({ example: 75000 })
  executedQuantity: number;

  @ApiProperty({ example: 150.50 })
  price?: number;

  @ApiProperty({ example: 150.25 })
  averagePrice?: number;

  @ApiProperty({ enum: InstitutionalOrderStatus, example: InstitutionalOrderStatus.PARTIALLY_FILLED })
  status: InstitutionalOrderStatus;

  @ApiProperty({ enum: TimeInForce, example: TimeInForce.DAY })
  timeInForce: TimeInForce;

  @ApiProperty({ example: '2024-01-15T09:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:45:00Z' })
  updatedAt: string;

  @ApiProperty({ example: 'portfolio-uuid-123' })
  portfolioId?: string;

  @ApiProperty({ example: 'large_cap_momentum' })
  strategy?: string;

  @ApiProperty({ example: 'Execute with minimal market impact' })
  notes?: string;

  @ApiProperty({ example: { fills: 15, venues: ['NYSE', 'NASDAQ'] } })
  executionDetails: Record<string, any>;

  @ApiProperty({ example: { slippage: 0.05, marketImpact: 0.02 } })
  performanceMetrics: Record<string, any>;
}

export class RiskLimitsDto {
  @ApiProperty({
    description: 'Maximum position size per symbol',
    example: 1000000,
  })
  @IsNumber()
  @IsPositive()
  maxPositionSize: number;

  @ApiProperty({
    description: 'Maximum daily trading volume',
    example: 10000000,
  })
  @IsNumber()
  @IsPositive()
  maxDailyVolume: number;

  @ApiProperty({
    description: 'Maximum portfolio concentration percentage',
    example: 10.0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  maxConcentration: number;

  @ApiProperty({
    description: 'Maximum daily loss limit',
    example: 500000,
  })
  @IsNumber()
  @IsPositive()
  maxDailyLoss: number;

  @ApiProperty({
    description: 'Value at Risk (VaR) limit',
    example: 1000000,
  })
  @IsNumber()
  @IsPositive()
  varLimit: number;

  @ApiPropertyOptional({
    description: 'Sector exposure limits',
    example: { technology: 25.0, healthcare: 20.0 },
  })
  @IsOptional()
  @IsObject()
  sectorLimits?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Currency exposure limits',
    example: { USD: 100.0, EUR: 15.0 },
  })
  @IsOptional()
  @IsObject()
  currencyLimits?: Record<string, number>;

  @ApiProperty({
    description: 'Current utilization percentages',
    example: {
      positionSize: 45.5,
      dailyVolume: 23.2,
      concentration: 8.1,
      dailyLoss: 12.3,
      var: 67.8,
    },
  })
  currentUtilization: Record<string, number>;
}

export class ComplianceSettingsDto {
  @ApiProperty({
    description: 'Enabled compliance rules',
    example: ['position_limit', 'wash_sale', 'best_execution'],
  })
  @IsArray()
  @IsEnum(ComplianceRuleType, { each: true })
  enabledRules: ComplianceRuleType[];

  @ApiProperty({
    description: 'Pre-trade compliance checks enabled',
    example: true,
  })
  @IsBoolean()
  preTradChecksEnabled: boolean;

  @ApiProperty({
    description: 'Post-trade compliance monitoring enabled',
    example: true,
  })
  @IsBoolean()
  postTradeMonitoringEnabled: boolean;

  @ApiPropertyOptional({
    description: 'Restricted securities list',
    example: ['ABC', 'XYZ'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedSecurities?: string[];

  @ApiPropertyOptional({
    description: 'Watch list securities for enhanced monitoring',
    example: ['WATCH1', 'WATCH2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  watchListSecurities?: string[];

  @ApiProperty({
    description: 'Best execution parameters',
    example: {
      priceImprovementThreshold: 0.01,
      speedOfExecutionWeight: 0.3,
      probabilityOfExecutionWeight: 0.7,
    },
  })
  @IsObject()
  bestExecutionParams: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Wash sale lookback period in days',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  washSaleLookbackDays?: number;
}

export class TradingPermissionsDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user-uuid-123',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Can place orders',
    example: true,
  })
  @IsBoolean()
  canPlaceOrders: boolean;

  @ApiProperty({
    description: 'Can cancel orders',
    example: true,
  })
  @IsBoolean()
  canCancelOrders: boolean;

  @ApiProperty({
    description: 'Can modify orders',
    example: false,
  })
  @IsBoolean()
  canModifyOrders: boolean;

  @ApiProperty({
    description: 'Allowed order types',
    example: ['market', 'limit', 'vwap'],
  })
  @IsArray()
  @IsEnum(InstitutionalOrderType, { each: true })
  allowedOrderTypes: InstitutionalOrderType[];

  @ApiProperty({
    description: 'Allowed trading venues',
    example: ['nyse', 'nasdaq'],
  })
  @IsArray()
  @IsEnum(TradingVenue, { each: true })
  allowedVenues: TradingVenue[];

  @ApiProperty({
    description: 'Maximum order size',
    example: 100000,
  })
  @IsNumber()
  @IsPositive()
  maxOrderSize: number;

  @ApiProperty({
    description: 'Daily trading limit',
    example: 5000000,
  })
  @IsNumber()
  @IsPositive()
  dailyTradingLimit: number;

  @ApiPropertyOptional({
    description: 'Allowed symbols (empty means all)',
    example: ['AAPL', 'GOOGL', 'MSFT'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedSymbols?: string[];

  @ApiPropertyOptional({
    description: 'Restricted symbols',
    example: ['RESTRICTED1'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictedSymbols?: string[];

  @ApiProperty({
    description: 'Can access dark pools',
    example: true,
  })
  @IsBoolean()
  canAccessDarkPools: boolean;

  @ApiProperty({
    description: 'Requires approval for large orders',
    example: true,
  })
  @IsBoolean()
  requiresApprovalForLargeOrders: boolean;

  @ApiProperty({
    description: 'Large order threshold',
    example: 50000,
  })
  @IsNumber()
  @IsPositive()
  largeOrderThreshold: number;
}

export class InstitutionalReportDto {
  @ApiProperty({ example: 'trading_summary_2024_01' })
  reportId: string;

  @ApiProperty({ example: 'monthly' })
  reportType: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  startDate: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  endDate: string;

  @ApiProperty({ example: '2024-02-01T09:00:00Z' })
  generatedAt: string;

  @ApiProperty({
    example: {
      totalOrders: 1250,
      totalVolume: 15750000,
      totalValue: 2362500000,
      avgOrderSize: 12600,
      fillRate: 98.5,
      avgExecutionTime: 145.3,
    },
  })
  summary: Record<string, any>;

  @ApiProperty({
    example: {
      bySymbol: [{ symbol: 'AAPL', volume: 2500000, value: 375000000 }],
      byStrategy: [{ strategy: 'momentum', volume: 5000000, pnl: 2500000 }],
      byVenue: [{ venue: 'NYSE', volume: 8000000, fillRate: 99.2 }],
    },
  })
  breakdown: Record<string, any>;

  @ApiProperty({
    example: {
      avgSlippage: 0.04,
      avgMarketImpact: 0.02,
      implementationShortfall: 0.06,
      sharpeRatio: 1.45,
    },
  })
  performanceMetrics: Record<string, any>;

  @ApiPropertyOptional({
    example: {
      complianceViolations: 2,
      riskMetrics: { var: 850000, maxDrawdown: 125000 },
    },
  })
  riskAndCompliance?: Record<string, any>;
}

export class ExecutionQualityReportDto {
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  startDate: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  endDate: string;

  @ApiProperty({
    example: {
      totalOrders: 850,
      benchmarkBeaten: 723,
      benchmarkBeatRate: 85.1,
      avgPriceImprovement: 0.025,
    },
  })
  summary: Record<string, any>;

  @ApiProperty({
    example: [
      {
        venue: 'NYSE',
        orders: 425,
        avgExecutionTime: 125.5,
        fillRate: 99.5,
        priceImprovement: 0.03,
      },
    ],
  })
  venueAnalysis: Array<Record<string, any>>;

  @ApiProperty({
    example: [
      {
        symbol: 'AAPL',
        orders: 156,
        avgSlippage: 0.02,
        marketImpact: 0.015,
        executionQuality: 'excellent',
      },
    ],
  })
  symbolAnalysis: Array<Record<string, any>>;

  @ApiProperty({
    example: {
      morningSession: { avgSlippage: 0.025, fillRate: 98.8 },
      afternoonSession: { avgSlippage: 0.035, fillRate: 97.2 },
    },
  })
  timeAnalysis: Record<string, any>;
}

export class BestExecutionReportDto {
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  startDate: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  endDate: string;

  @ApiProperty({
    example: {
      ordersAnalyzed: 1250,
      bestExecutionAchieved: 1189,
      bestExecutionRate: 95.1,
      totalSavings: 156780.50,
    },
  })
  summary: Record<string, any>;

  @ApiProperty({
    example: [
      {
        orderId: 'order-123',
        symbol: 'AAPL',
        executionVenue: 'NYSE',
        executionPrice: 150.25,
        bestAvailablePrice: 150.23,
        savings: 125.50,
        quality: 'good',
      },
    ],
  })
  orderAnalysis: Array<Record<string, any>>;

  @ApiProperty({
    example: [
      {
        venue: 'NYSE',
        ordersRouted: 456,
        avgSavings: 0.023,
        executionQuality: 'excellent',
      },
    ],
  })
  venuePerformance: Array<Record<string, any>>;

  @ApiProperty({
    example: {
      priceImprovement: 0.85,
      speedOfExecution: 0.92,
      probabilityOfExecution: 0.95,
      overallScore: 0.91,
    },
  })
  bestExecutionFactors: Record<string, any>;

  @ApiProperty({
    example: [
      'Consider routing more orders to CBOE for better price improvement',
      'Dark pool usage could be increased for large orders',
    ],
  })
  recommendations: string[];
}