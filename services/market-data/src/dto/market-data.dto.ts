import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DataSource } from '../entities/market-data.entity';
import { TimeInterval } from '../entities/historical-data.entity';

export class GetMarketDataDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;
}

export class GetBatchMarketDataDto {
  @ApiProperty({ description: 'Array of trading symbols', type: [String] })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];
}

export class GetHistoricalDataDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Time interval', enum: TimeInterval, required: false })
  @IsOptional()
  @IsEnum(TimeInterval)
  interval?: TimeInterval;

  @ApiProperty({ description: 'Start date (ISO string)', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO string)', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: 'Maximum number of records', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class MarketDataUpdateDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Current price' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Bid price', required: false })
  @IsOptional()
  @IsNumber()
  bid?: number;

  @ApiProperty({ description: 'Ask price', required: false })
  @IsOptional()
  @IsNumber()
  ask?: number;

  @ApiProperty({ description: 'Bid size', required: false })
  @IsOptional()
  @IsNumber()
  bidSize?: number;

  @ApiProperty({ description: 'Ask size', required: false })
  @IsOptional()
  @IsNumber()
  askSize?: number;

  @ApiProperty({ description: 'Trading volume', required: false })
  @IsOptional()
  @IsNumber()
  volume?: number;

  @ApiProperty({ description: 'Previous close price', required: false })
  @IsOptional()
  @IsNumber()
  previousClose?: number;

  @ApiProperty({ description: 'Daily change amount', required: false })
  @IsOptional()
  @IsNumber()
  change?: number;

  @ApiProperty({ description: 'Daily change percentage', required: false })
  @IsOptional()
  @IsNumber()
  changePercent?: number;

  @ApiProperty({ description: 'Daily high', required: false })
  @IsOptional()
  @IsNumber()
  dayHigh?: number;

  @ApiProperty({ description: 'Daily low', required: false })
  @IsOptional()
  @IsNumber()
  dayLow?: number;

  @ApiProperty({ description: 'Market cap', required: false })
  @IsOptional()
  @IsNumber()
  marketCap?: number;

  @ApiProperty({ description: 'Data source', enum: DataSource, required: false })
  @IsOptional()
  @IsEnum(DataSource)
  source?: DataSource;

  @ApiProperty({ description: 'Is market currently open', required: false })
  @IsOptional()
  @IsBoolean()
  isMarketOpen?: boolean;

  @ApiProperty({ description: 'Market session', required: false })
  @IsOptional()
  @IsString()
  marketSession?: string;
}

export class SearchSymbolsDto {
  @ApiProperty({ description: 'Search query' })
  @IsString()
  query: string;
}

export class TechnicalAnalysisDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Time interval', enum: TimeInterval, required: false })
  @IsOptional()
  @IsEnum(TimeInterval)
  interval?: TimeInterval;

  @ApiProperty({ description: 'Period for calculation', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  period?: number;

  @ApiProperty({ description: 'Number of days for analysis', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  days?: number;
}

export class MovingAverageDto extends TechnicalAnalysisDto {
  @ApiProperty({ description: 'Moving average type', enum: ['SMA', 'EMA'], required: false })
  @IsOptional()
  @IsEnum(['SMA', 'EMA'])
  type?: 'SMA' | 'EMA';
}

export class MarketDataResponseDto {
  @ApiProperty({ description: 'Trading symbol' })
  symbol: string;

  @ApiProperty({ description: 'Current price' })
  price: number;

  @ApiProperty({ description: 'Bid price', required: false })
  bid?: number;

  @ApiProperty({ description: 'Ask price', required: false })
  ask?: number;

  @ApiProperty({ description: 'Trading volume' })
  volume: number;

  @ApiProperty({ description: 'Daily change amount', required: false })
  change?: number;

  @ApiProperty({ description: 'Daily change percentage', required: false })
  changePercent?: number;

  @ApiProperty({ description: 'Daily high', required: false })
  dayHigh?: number;

  @ApiProperty({ description: 'Daily low', required: false })
  dayLow?: number;

  @ApiProperty({ description: 'Previous close price', required: false })
  previousClose?: number;

  @ApiProperty({ description: 'Is market currently open' })
  isMarketOpen: boolean;

  @ApiProperty({ description: 'Market session' })
  marketSession?: string;

  @ApiProperty({ description: 'Data timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Data source', enum: DataSource })
  source: DataSource;
}

export class HistoricalDataResponseDto {
  @ApiProperty({ description: 'Trading symbol' })
  symbol: string;

  @ApiProperty({ description: 'Time interval', enum: TimeInterval })
  interval: TimeInterval;

  @ApiProperty({ description: 'Opening price' })
  open: number;

  @ApiProperty({ description: 'Highest price' })
  high: number;

  @ApiProperty({ description: 'Lowest price' })
  low: number;

  @ApiProperty({ description: 'Closing price' })
  close: number;

  @ApiProperty({ description: 'Adjusted closing price', required: false })
  adjustedClose?: number;

  @ApiProperty({ description: 'Trading volume' })
  volume: number;

  @ApiProperty({ description: 'Volume weighted average price', required: false })
  vwap?: number;

  @ApiProperty({ description: 'Candle timestamp' })
  timestamp: Date;

  @ApiProperty({ description: 'Data source', enum: DataSource })
  source: DataSource;
}

export class VolumeProfileResponseDto {
  @ApiProperty({ description: 'Price level' })
  price: number;

  @ApiProperty({ description: 'Volume at this price level' })
  volume: number;
}

export class WebSocketSubscriptionDto {
  @ApiProperty({ description: 'Array of symbols to subscribe to', type: [String] })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];
}

export class WebSocketUnsubscriptionDto {
  @ApiProperty({ description: 'Array of symbols to unsubscribe from', type: [String] })
  @IsArray()
  @IsString({ each: true })
  symbols: string[];
}