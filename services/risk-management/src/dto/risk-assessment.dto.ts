import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RiskLevel } from '../entities/risk-assessment.entity';

export class MarketDataDto {
  @ApiProperty({ description: 'Asset volatility (annualized)', example: 0.25 })
  @IsNumber()
  @Min(0)
  @Max(5)
  volatility: number;

  @ApiProperty({ description: 'Liquidity score (0-1)', example: 0.8 })
  @IsNumber()
  @Min(0)
  @Max(1)
  liquidity: number;

  @ApiProperty({ description: 'Beta coefficient', example: 1.2 })
  @IsNumber()
  @Min(-3)
  @Max(3)
  beta: number;

  @ApiProperty({ description: 'Correlation coefficient', example: 0.7 })
  @IsNumber()
  @Min(-1)
  @Max(1)
  correlation: number;
}

export class ExistingPositionDto {
  @ApiProperty({ description: 'Asset symbol', example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Position quantity', example: 100 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Market value', example: 15000 })
  @IsNumber()
  @Min(0)
  marketValue: number;

  @ApiProperty({ description: 'Unrealized P&L', example: 500 })
  @IsNumber()
  unrealizedPnl: number;
}

export class CreateRiskAssessmentDto {
  @ApiProperty({ description: 'User ID', example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Trading account ID', example: 'account456' })
  @IsString()
  accountId: string;

  @ApiPropertyOptional({ description: 'Trade ID if assessing existing trade', example: 'trade789' })
  @IsOptional()
  @IsString()
  tradeId?: string;

  @ApiProperty({ description: 'Asset symbol', example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Asset type', example: 'STOCK' })
  @IsString()
  assetType: string;

  @ApiProperty({ description: 'Trade side', enum: ['BUY', 'SELL'], example: 'BUY' })
  @IsEnum(['BUY', 'SELL'])
  side: 'BUY' | 'SELL';

  @ApiProperty({ description: 'Trade quantity', example: 100 })
  @IsNumber()
  @Min(0.000001)
  quantity: number;

  @ApiProperty({ description: 'Trade price', example: 150.50 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({ description: 'Stop loss price', example: 140.00 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  stopLoss?: number;

  @ApiPropertyOptional({ description: 'Take profit price', example: 165.00 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  takeProfit?: number;

  @ApiPropertyOptional({ description: 'Leverage ratio', example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  leverage?: number;

  @ApiProperty({ description: 'Total portfolio value', example: 100000 })
  @IsNumber()
  @Min(0)
  portfolioValue: number;

  @ApiProperty({ description: 'Available balance', example: 25000 })
  @IsNumber()
  @Min(0)
  availableBalance: number;

  @ApiPropertyOptional({ description: 'Existing positions in portfolio', type: [ExistingPositionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExistingPositionDto)
  existingPositions?: ExistingPositionDto[];

  @ApiPropertyOptional({ description: 'Market data for the asset', type: MarketDataDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarketDataDto)
  marketData?: MarketDataDto;
}

export class RiskFactorDto {
  @ApiProperty({ description: 'Risk factor name', example: 'position_size' })
  factor: string;

  @ApiProperty({ description: 'Factor value', example: 0.15 })
  value: number;

  @ApiProperty({ description: 'Factor weight in calculation', example: 0.25 })
  weight: number;

  @ApiProperty({ description: 'Contribution to overall risk score', example: 3.75 })
  contribution: number;

  @ApiProperty({ description: 'Factor description', example: 'Position represents 15% of portfolio' })
  description: string;
}

export class RiskAssessmentResponseDto {
  @ApiProperty({ enum: RiskLevel, description: 'Calculated risk level' })
  riskLevel: RiskLevel;

  @ApiProperty({ description: 'Numerical risk score (0-100)', example: 35.5 })
  riskScore: number;

  @ApiProperty({ description: 'Risk factors contributing to score', type: [RiskFactorDto] })
  factors: RiskFactorDto[];

  @ApiProperty({ description: 'Risk mitigation recommendations', example: ['Consider reducing position size'] })
  recommendations: string[];

  @ApiProperty({ description: 'Risk warnings', example: ['No stop loss protection'] })
  warnings: string[];

  @ApiProperty({ description: 'Whether trade is approved', example: true })
  approved: boolean;

  @ApiPropertyOptional({ description: 'Maximum recommended position size', example: 75 })
  maxPositionSize?: number;

  @ApiPropertyOptional({ description: 'Suggested stop loss price', example: 142.50 })
  suggestedStopLoss?: number;
}

export class PortfolioPositionDto {
  @ApiProperty({ description: 'Asset symbol', example: 'AAPL' })
  @IsString()
  symbol: string;

  @ApiProperty({ description: 'Asset type', example: 'STOCK' })
  @IsString()
  assetType: string;

  @ApiProperty({ description: 'Position quantity', example: 100 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Average purchase price', example: 145.00 })
  @IsNumber()
  @Min(0)
  averagePrice: number;

  @ApiProperty({ description: 'Current market price', example: 150.50 })
  @IsNumber()
  @Min(0)
  currentPrice: number;

  @ApiProperty({ description: 'Current market value', example: 15050 })
  @IsNumber()
  @Min(0)
  marketValue: number;

  @ApiProperty({ description: 'Unrealized P&L', example: 550 })
  @IsNumber()
  unrealizedPnl: number;

  @ApiPropertyOptional({ description: 'Sector classification', example: 'Technology' })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiPropertyOptional({ description: 'Currency', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Beta coefficient', example: 1.2 })
  @IsOptional()
  @IsNumber()
  beta?: number;

  @ApiPropertyOptional({ description: 'Volatility', example: 0.25 })
  @IsOptional()
  @IsNumber()
  volatility?: number;

  @ApiPropertyOptional({ description: 'Correlations with other assets' })
  @IsOptional()
  correlation?: Record<string, number>;
}

export class PortfolioRiskRequestDto {
  @ApiProperty({ description: 'User ID', example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Account ID', example: 'account456' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Portfolio ID', example: 'portfolio789' })
  @IsString()
  portfolioId: string;

  @ApiProperty({ description: 'Total portfolio value', example: 100000 })
  @IsNumber()
  @Min(0)
  totalValue: number;

  @ApiProperty({ description: 'Available cash balance', example: 10000 })
  @IsNumber()
  @Min(0)
  availableBalance: number;

  @ApiProperty({ description: 'Used margin', example: 5000 })
  @IsNumber()
  @Min(0)
  usedMargin: number;

  @ApiProperty({ description: 'Current leverage ratio', example: 1.5 })
  @IsNumber()
  @Min(1)
  leverage: number;

  @ApiProperty({ description: 'Portfolio positions', type: [PortfolioPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioPositionDto)
  positions: PortfolioPositionDto[];

  @ApiProperty({ description: 'Historical daily returns', example: [0.01, -0.02, 0.015] })
  @IsArray()
  @IsNumber({}, { each: true })
  historicalReturns: number[];

  @ApiPropertyOptional({ description: 'Benchmark returns for comparison', example: [0.008, -0.015, 0.012] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  benchmarkReturns?: number[];
}

export class UpdateRiskAssessmentDto {
  @ApiPropertyOptional({ description: 'Updated risk level', enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional({ description: 'Risk score adjustment', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  scoreAdjustment?: number;

  @ApiPropertyOptional({ description: 'Additional recommendations' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalRecommendations?: string[];

  @ApiPropertyOptional({ description: 'Override approval status', example: true })
  @IsOptional()
  overrideApproval?: boolean;

  @ApiPropertyOptional({ description: 'Override reason', example: 'Manual review completed' })
  @IsOptional()
  @IsString()
  overrideReason?: string;
}