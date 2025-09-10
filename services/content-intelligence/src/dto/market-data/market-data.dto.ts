import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetQuoteDto {
  @ApiProperty({
    description: 'Stock symbol (e.g., AAPL, TSLA)',
    example: 'AAPL'
  })
  @IsString()
  symbol: string;
}

export class GetHistoricalDataDto {
  @ApiProperty({
    description: 'Stock symbol',
    example: 'AAPL'
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: 'Start date for historical data',
    example: '2024-01-01'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for historical data',
    example: '2024-12-31'
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Data interval',
    enum: ['1d', '1h', '5m', '1m'],
    default: '1d'
  })
  @IsOptional()
  @IsEnum(['1d', '1h', '5m', '1m'])
  interval?: '1d' | '1h' | '5m' | '1m' = '1d';
}

export class MarketQuoteResponseDto {
  @ApiProperty()
  symbol: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  change: number;

  @ApiProperty()
  changePercent: number;

  @ApiProperty()
  volume: number;

  @ApiProperty({ required: false })
  marketCap?: number;

  @ApiProperty()
  previousClose: number;

  @ApiProperty()
  dayLow: number;

  @ApiProperty()
  dayHigh: number;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  isMarketOpen: boolean;

  @ApiProperty()
  source: string;
}

export class HistoricalDataPointDto {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  open: number;

  @ApiProperty()
  high: number;

  @ApiProperty()
  low: number;

  @ApiProperty()
  close: number;

  @ApiProperty()
  volume: number;

  @ApiProperty({ required: false })
  adjustedClose?: number;
}

export class HistoricalDataResponseDto {
  @ApiProperty()
  symbol: string;

  @ApiProperty({ type: [HistoricalDataPointDto] })
  data: HistoricalDataPointDto[];

  @ApiProperty()
  interval: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  source: string;

  @ApiProperty()
  totalPoints: number;
}

export class MarketStatusResponseDto {
  @ApiProperty()
  isOpen: boolean;

  @ApiProperty({ required: false })
  nextOpenTime?: Date;

  @ApiProperty({ required: false })
  nextCloseTime?: Date;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  marketHours: {
    regular: {
      start: string;
      end: string;
    };
    extended?: {
      premarket?: {
        start: string;
        end: string;
      };
      afterhours?: {
        start: string;
        end: string;
      };
    };
  };
}

export class ValidateSymbolDto {
  @ApiProperty({
    description: 'Stock symbol to validate',
    example: 'AAPL'
  })
  @IsString()
  symbol: string;
}

export class SymbolValidationResponseDto {
  @ApiProperty()
  symbol: string;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ required: false })
  companyName?: string;

  @ApiProperty({ required: false })
  exchange?: string;

  @ApiProperty({ required: false })
  sector?: string;

  @ApiProperty({ required: false })
  industry?: string;
}