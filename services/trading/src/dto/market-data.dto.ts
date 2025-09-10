import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsArray,
  IsObject,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { 
  MarketDataType, 
  DataProvider, 
  MarketStatus,
  Quote,
  OrderBook,
  OHLCV,
  OptionsData 
} from '../entities/market-data.entity';

export class CreateMarketDataDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: MarketDataType, description: 'Type of market data' })
  @IsEnum(MarketDataType)
  dataType: MarketDataType;

  @ApiPropertyOptional({ enum: DataProvider, description: 'Data provider', default: DataProvider.INTERNAL })
  @IsOptional()
  @IsEnum(DataProvider)
  provider?: DataProvider = DataProvider.INTERNAL;

  @ApiPropertyOptional({ description: 'Instrument type', default: 'stock' })
  @IsOptional()
  @IsString()
  instrumentType?: string = 'stock';

  @ApiPropertyOptional({ enum: MarketStatus, description: 'Market status' })
  @IsOptional()
  @IsEnum(MarketStatus)
  marketStatus?: MarketStatus;

  @ApiPropertyOptional({ description: 'Bid price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  bidPrice?: number;

  @ApiPropertyOptional({ description: 'Ask price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  askPrice?: number;

  @ApiPropertyOptional({ description: 'Bid size' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  bidSize?: number;

  @ApiPropertyOptional({ description: 'Ask size' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  askSize?: number;

  @ApiPropertyOptional({ description: 'Last trade price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  lastPrice?: number;

  @ApiPropertyOptional({ description: 'Last trade size' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  lastSize?: number;

  @ApiPropertyOptional({ description: 'Open price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  openPrice?: number;

  @ApiPropertyOptional({ description: 'High price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  highPrice?: number;

  @ApiPropertyOptional({ description: 'Low price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  lowPrice?: number;

  @ApiPropertyOptional({ description: 'Close price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  closePrice?: number;

  @ApiPropertyOptional({ description: 'Previous close price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  previousClose?: number;

  @ApiPropertyOptional({ description: 'Trading volume' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Dollar volume' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dollarVolume?: number;

  @ApiPropertyOptional({ description: 'Number of trades' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tradeCount?: number;

  @ApiPropertyOptional({ description: 'Volume-weighted average price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  vwap?: number;

  @ApiPropertyOptional({ description: 'Average volume' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  avgVolume?: number;

  @ApiPropertyOptional({ description: 'Price change' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  change?: number;

  @ApiPropertyOptional({ description: 'Price change percentage' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  changePercent?: number;

  @ApiPropertyOptional({ description: 'Market cap' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marketCap?: number;

  @ApiPropertyOptional({ description: 'Shares outstanding' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sharesOutstanding?: number;

  @ApiPropertyOptional({ description: 'Float shares' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  floatShares?: number;

  @ApiPropertyOptional({ description: 'RSI indicator' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  rsi?: number;

  @ApiPropertyOptional({ description: 'Volatility' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  volatility?: number;

  @ApiPropertyOptional({ description: 'Beta coefficient' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  beta?: number;

  @ApiPropertyOptional({ description: 'P/E ratio' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  peRatio?: number;

  @ApiPropertyOptional({ description: 'Dividend yield' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  dividendYield?: number;

  @ApiPropertyOptional({ description: 'Data timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;

  @ApiPropertyOptional({ description: 'Market date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  marketDate?: Date;

  @ApiPropertyOptional({ description: 'Time zone', default: 'America/New_York' })
  @IsOptional()
  @IsString()
  timeZone?: string = 'America/New_York';

  @ApiPropertyOptional({ description: 'Data quality score (0-100)', default: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  dataQuality?: number = 100;

  @ApiPropertyOptional({ description: 'Delay in seconds', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  delaySeconds?: number = 0;

  @ApiPropertyOptional({ description: 'Source timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sourceTimestamp?: Date;

  @ApiPropertyOptional({ description: 'Exchange name' })
  @IsOptional()
  @IsString()
  exchange?: string;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiPropertyOptional({ description: 'Is regular trading hours', default: true })
  @IsOptional()
  @IsBoolean()
  isRegularHours?: boolean = true;

  @ApiPropertyOptional({ description: 'Is real-time data', default: false })
  @IsOptional()
  @IsBoolean()
  isRealTime?: boolean = false;

  @ApiPropertyOptional({ description: 'Quote data object' })
  @IsOptional()
  @IsObject()
  quoteData?: Quote;

  @ApiPropertyOptional({ description: 'Order book data' })
  @IsOptional()
  @IsObject()
  orderBook?: OrderBook;

  @ApiPropertyOptional({ description: 'OHLCV data' })
  @IsOptional()
  @IsObject()
  ohlcvData?: OHLCV;

  @ApiPropertyOptional({ description: 'Options chain data' })
  @IsOptional()
  @IsArray()
  optionsData?: OptionsData[];

  @ApiPropertyOptional({ description: 'Data tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateMarketDataDto {
  @ApiPropertyOptional({ description: 'Updated bid price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  bidPrice?: number;

  @ApiPropertyOptional({ description: 'Updated ask price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  askPrice?: number;

  @ApiPropertyOptional({ description: 'Updated last price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  lastPrice?: number;

  @ApiPropertyOptional({ description: 'Updated volume' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Updated data quality' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  dataQuality?: number;

  @ApiPropertyOptional({ description: 'Mark data as stale' })
  @IsOptional()
  @IsBoolean()
  isStale?: boolean;

  @ApiPropertyOptional({ description: 'Updated tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Updated metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MarketDataSearchDto {
  @ApiPropertyOptional({ description: 'Filter by symbol' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ description: 'Filter by multiple symbols' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symbols?: string[];

  @ApiPropertyOptional({ enum: MarketDataType, description: 'Filter by data type' })
  @IsOptional()
  @IsEnum(MarketDataType)
  dataType?: MarketDataType;

  @ApiPropertyOptional({ enum: DataProvider, description: 'Filter by provider' })
  @IsOptional()
  @IsEnum(DataProvider)
  provider?: DataProvider;

  @ApiPropertyOptional({ description: 'Filter by instrument type' })
  @IsOptional()
  @IsString()
  instrumentType?: string;

  @ApiPropertyOptional({ description: 'Filter by exchange' })
  @IsOptional()
  @IsString()
  exchange?: string;

  @ApiPropertyOptional({ description: 'Filter data from this timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startTime?: Date;

  @ApiPropertyOptional({ description: 'Filter data until this timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endTime?: Date;

  @ApiPropertyOptional({ description: 'Minimum data quality score' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minQuality?: number;

  @ApiPropertyOptional({ description: 'Include stale data', default: false })
  @IsOptional()
  @IsBoolean()
  includeStale?: boolean = false;

  @ApiPropertyOptional({ description: 'Real-time data only', default: false })
  @IsOptional()
  @IsBoolean()
  realTimeOnly?: boolean = false;

  @ApiPropertyOptional({ description: 'Regular hours data only', default: false })
  @IsOptional()
  @IsBoolean()
  regularHoursOnly?: boolean = false;

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
  @Max(1000)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'timestamp' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class MarketDataSubscriptionDto {
  @ApiProperty({ description: 'Symbols to subscribe to' })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];

  @ApiProperty({ description: 'Data types to receive' })
  @IsArray()
  @IsEnum(MarketDataType, { each: true })
  dataTypes: MarketDataType[];

  @ApiPropertyOptional({ description: 'Preferred data providers' })
  @IsOptional()
  @IsArray()
  @IsEnum(DataProvider, { each: true })
  providers?: DataProvider[];

  @ApiPropertyOptional({ description: 'Real-time data required', default: false })
  @IsOptional()
  @IsBoolean()
  realTime?: boolean = false;

  @ApiPropertyOptional({ description: 'Regular hours only', default: false })
  @IsOptional()
  @IsBoolean()
  regularHoursOnly?: boolean = false;

  @ApiPropertyOptional({ description: 'Minimum update frequency (seconds)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minUpdateFrequency?: number;

  @ApiPropertyOptional({ description: 'Subscription metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MarketDataResponseDto {
  @ApiProperty({ description: 'Market data ID' })
  id: string;

  @ApiProperty({ description: 'Trading symbol' })
  symbol: string;

  @ApiProperty({ description: 'Instrument type' })
  instrumentType: string;

  @ApiProperty({ enum: MarketDataType, description: 'Data type' })
  dataType: MarketDataType;

  @ApiProperty({ enum: DataProvider, description: 'Data provider' })
  provider: DataProvider;

  @ApiProperty({ enum: MarketStatus, description: 'Market status' })
  marketStatus?: MarketStatus;

  @ApiProperty({ description: 'Bid price' })
  bidPrice?: number;

  @ApiProperty({ description: 'Ask price' })
  askPrice?: number;

  @ApiProperty({ description: 'Bid size' })
  bidSize?: number;

  @ApiProperty({ description: 'Ask size' })
  askSize?: number;

  @ApiProperty({ description: 'Last trade price' })
  lastPrice?: number;

  @ApiProperty({ description: 'Last trade size' })
  lastSize?: number;

  @ApiProperty({ description: 'Open price' })
  openPrice?: number;

  @ApiProperty({ description: 'High price' })
  highPrice?: number;

  @ApiProperty({ description: 'Low price' })
  lowPrice?: number;

  @ApiProperty({ description: 'Close price' })
  closePrice?: number;

  @ApiProperty({ description: 'Previous close price' })
  previousClose?: number;

  @ApiProperty({ description: 'Trading volume' })
  volume?: number;

  @ApiProperty({ description: 'Dollar volume' })
  dollarVolume?: number;

  @ApiProperty({ description: 'Number of trades' })
  tradeCount?: number;

  @ApiProperty({ description: 'VWAP' })
  vwap?: number;

  @ApiProperty({ description: 'Average volume' })
  avgVolume?: number;

  @ApiProperty({ description: 'Price change' })
  change?: number;

  @ApiProperty({ description: 'Price change percentage' })
  changePercent?: number;

  @ApiProperty({ description: 'Day change' })
  dayChange?: number;

  @ApiProperty({ description: 'Day change percentage' })
  dayChangePercent?: number;

  @ApiProperty({ description: 'Bid-ask spread' })
  spread?: number;

  @ApiProperty({ description: 'Spread percentage' })
  spreadPercent?: number;

  @ApiProperty({ description: 'Mid price' })
  midPrice?: number;

  @ApiProperty({ description: 'Market cap' })
  marketCap?: number;

  @ApiProperty({ description: 'Shares outstanding' })
  sharesOutstanding?: number;

  @ApiProperty({ description: 'RSI indicator' })
  rsi?: number;

  @ApiProperty({ description: 'Volatility' })
  volatility?: number;

  @ApiProperty({ description: 'Beta coefficient' })
  beta?: number;

  @ApiProperty({ description: 'P/E ratio' })
  peRatio?: number;

  @ApiProperty({ description: 'Dividend yield' })
  dividendYield?: number;

  @ApiProperty({ description: 'Quote data object' })
  quoteData?: Quote;

  @ApiProperty({ description: 'Order book data' })
  orderBook?: OrderBook;

  @ApiProperty({ description: 'OHLCV data' })
  ohlcvData?: OHLCV;

  @ApiProperty({ description: 'Options chain data' })
  optionsData?: OptionsData[];

  @ApiProperty({ description: 'Data timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Market date' })
  marketDate?: Date;

  @ApiProperty({ description: 'Time zone' })
  timeZone: string;

  @ApiProperty({ description: 'Data quality score' })
  dataQuality: number;

  @ApiProperty({ description: 'Delay in seconds' })
  delaySeconds: number;

  @ApiProperty({ description: 'Source timestamp' })
  sourceTimestamp?: Date;

  @ApiProperty({ description: 'Processing latency (ms)' })
  processingLatency?: number;

  @ApiProperty({ description: 'Exchange name' })
  exchange?: string;

  @ApiProperty({ description: 'Currency' })
  currency?: string;

  @ApiProperty({ description: 'Is regular trading hours' })
  isRegularHours: boolean;

  @ApiProperty({ description: 'Is real-time data' })
  isRealTime: boolean;

  @ApiProperty({ description: 'Is stale data' })
  isStale: boolean;

  @ApiProperty({ description: 'Data age in milliseconds' })
  age: number;

  @ApiProperty({ description: 'Data age in minutes' })
  ageMinutes: number;

  @ApiProperty({ description: 'Is recent data (< 5 minutes)' })
  isRecent: boolean;

  @ApiProperty({ description: 'Is delayed data' })
  isDelayed: boolean;

  @ApiProperty({ description: 'Is high quality data' })
  isHighQuality: boolean;

  @ApiProperty({ description: 'Effective spread' })
  effectiveSpread: number;

  @ApiProperty({ description: 'Effective mid price' })
  effectiveMidPrice: number;

  @ApiProperty({ description: 'Data tags' })
  tags?: string[];

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: Record<string, any>;
}

export class MarketDataListResponseDto {
  @ApiProperty({ type: [MarketDataResponseDto], description: 'Array of market data' })
  data: MarketDataResponseDto[];

  @ApiProperty({ description: 'Total number of records' })
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

  @ApiProperty({ description: 'Query execution time (ms)' })
  executionTime: number;
}

export class MarketDataSnapshotDto {
  @ApiProperty({ description: 'Symbol snapshots' })
  snapshots: Record<string, {
    quote?: Quote;
    lastTrade?: {
      price: number;
      size: number;
      timestamp: Date;
    };
    dailyStats?: {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      change: number;
      changePercent: number;
    };
    marketStatus: MarketStatus;
    lastUpdated: Date;
  }>;

  @ApiProperty({ description: 'Snapshot timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Number of symbols included' })
  symbolCount: number;

  @ApiProperty({ description: 'Data freshness (average age in seconds)' })
  avgFreshness: number;
}