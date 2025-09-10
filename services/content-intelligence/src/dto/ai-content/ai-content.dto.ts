import { IsString, IsOptional, IsEnum, IsArray, IsNumber, IsBoolean, ValidateNested, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  ContentType,
  ContentStyle,
  ContentTone,
  TargetAudience,
  ComplexityLevel,
  RiskProfile,
  InvestmentGoal
} from '../../interfaces/ai-content/ai-content.interface';

export class MarketDataContextDto {
  @ApiPropertyOptional({ type: [String], description: 'Stock symbols to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symbols?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Market events to reference' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketEvents?: string[];

  @ApiPropertyOptional({ description: 'Time frame for market data' })
  @IsOptional()
  @IsString()
  timeframe?: string;
}

export class UserPreferencesDto {
  @ApiProperty({ enum: ContentType, isArray: true })
  @IsArray()
  @IsEnum(ContentType, { each: true })
  preferredContentTypes: ContentType[];

  @ApiProperty({ enum: ContentStyle, isArray: true })
  @IsArray()
  @IsEnum(ContentStyle, { each: true })
  preferredStyles: ContentStyle[];

  @ApiProperty({ enum: ContentTone, isArray: true })
  @IsArray()
  @IsEnum(ContentTone, { each: true })
  preferredTones: ContentTone[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedTopics?: string[];

  @ApiProperty({ default: 'en' })
  @IsString()
  languagePreference: string;

  @ApiProperty({ enum: ComplexityLevel })
  @IsEnum(ComplexityLevel)
  complexityLevel: ComplexityLevel;
}

export class ContentPersonalizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ type: UserPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences?: UserPreferencesDto;

  @ApiPropertyOptional({ enum: RiskProfile })
  @IsOptional()
  @IsEnum(RiskProfile)
  riskProfile?: RiskProfile;

  @ApiPropertyOptional({ enum: InvestmentGoal, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(InvestmentGoal, { each: true })
  investmentGoals?: InvestmentGoal[];
}

export class GenerateContentDto {
  @ApiProperty({ description: 'Content generation prompt', example: 'Write an analysis of Apple stock performance this quarter' })
  @IsString()
  @Length(10, 2000)
  prompt: string;

  @ApiProperty({ enum: ContentType, description: 'Type of content to generate' })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ enum: ContentStyle, description: 'Writing style for the content' })
  @IsEnum(ContentStyle)
  style: ContentStyle;

  @ApiProperty({ enum: ContentTone, description: 'Tone of the content' })
  @IsEnum(ContentTone)
  tone: ContentTone;

  @ApiProperty({ enum: TargetAudience, description: 'Target audience for the content' })
  @IsEnum(TargetAudience)
  targetAudience: TargetAudience;

  @ApiPropertyOptional({ description: 'Maximum content length in words', minimum: 10, maximum: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(10000)
  maxLength?: number;

  @ApiPropertyOptional({ description: 'Minimum content length in words', minimum: 5, maximum: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(1000)
  minLength?: number;

  @ApiPropertyOptional({ description: 'Include source citations', default: false })
  @IsOptional()
  @IsBoolean()
  includeSources?: boolean = false;

  @ApiPropertyOptional({ type: MarketDataContextDto, description: 'Market data context for content generation' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MarketDataContextDto)
  marketData?: MarketDataContextDto;

  @ApiPropertyOptional({ description: 'Template ID to use for generation' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ type: [ContentPersonalizationDto], description: 'Personalization settings' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentPersonalizationDto)
  personalizations?: ContentPersonalizationDto[];
}

export class ContentMetadataResponseDto {
  @ApiProperty()
  wordCount: number;

  @ApiProperty()
  readingTime: number;

  @ApiProperty({ enum: ContentType })
  contentType: ContentType;

  @ApiProperty({ enum: ContentStyle })
  style: ContentStyle;

  @ApiProperty({ enum: ContentTone })
  tone: ContentTone;

  @ApiProperty({ enum: TargetAudience })
  targetAudience: TargetAudience;

  @ApiProperty({ description: 'AI confidence score (0-1)' })
  confidence: number;

  @ApiProperty({ description: 'Content relevance score (0-1)' })
  relevanceScore: number;

  @ApiPropertyOptional({ description: 'SEO score (0-100)' })
  seoScore?: number;

  @ApiPropertyOptional({ type: [String], description: 'Compliance flags if any' })
  complianceFlags?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Source references' })
  sources?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Extracted keywords' })
  keywords?: string[];
}

export class AIProviderResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  maxTokens: number;

  @ApiProperty()
  temperature: number;

  @ApiProperty({ description: 'Response time in milliseconds' })
  responseTime: number;

  @ApiPropertyOptional({ description: 'Generation cost in USD' })
  cost?: number;
}

export class ContentPerformanceMetricsDto {
  @ApiProperty({ description: 'Readability score (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  readabilityScore: number;

  @ApiProperty({ description: 'SEO score (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  seoScore: number;

  @ApiProperty({ description: 'Compliance score (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  complianceScore: number;

  @ApiProperty({ description: 'Predicted engagement score (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  engagementPrediction: number;

  @ApiPropertyOptional({ description: 'Virality potential (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  viralityScore?: number;

  @ApiPropertyOptional({ description: 'Conversion potential (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  conversionPotential?: number;
}

export class ContentGenerationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  summary?: string;

  @ApiProperty({ type: ContentMetadataResponseDto })
  metadata: ContentMetadataResponseDto;

  @ApiPropertyOptional({ type: [String] })
  suggestions?: string[];

  @ApiPropertyOptional({ type: ContentPerformanceMetricsDto })
  performance?: ContentPerformanceMetricsDto;

  @ApiProperty()
  generatedAt: Date;

  @ApiProperty({ type: AIProviderResponseDto })
  provider: AIProviderResponseDto;
}

export class BatchGenerateContentDto {
  @ApiProperty({ type: [GenerateContentDto], description: 'Array of content generation requests' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateContentDto)
  requests: GenerateContentDto[];

  @ApiPropertyOptional({ description: 'Generate content in parallel', default: true })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean = true;

  @ApiPropertyOptional({ description: 'Maximum concurrent generations', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxConcurrency?: number = 3;
}

export class BatchContentGenerationResponseDto {
  @ApiProperty({ type: [ContentGenerationResponseDto] })
  results: ContentGenerationResponseDto[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failureCount: number;

  @ApiProperty({ type: [String] })
  errors: string[];

  @ApiProperty({ description: 'Total processing time in milliseconds' })
  processingTime: number;
}

export class ValidateContentDto {
  @ApiProperty({ description: 'Content to validate' })
  @IsString()
  @Length(1, 50000)
  content: string;

  @ApiProperty({ enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ enum: TargetAudience })
  @IsEnum(TargetAudience)
  targetAudience: TargetAudience;

  @ApiPropertyOptional({ description: 'Check compliance rules', default: true })
  @IsOptional()
  @IsBoolean()
  checkCompliance?: boolean = true;

  @ApiPropertyOptional({ description: 'Check SEO optimization', default: true })
  @IsOptional()
  @IsBoolean()
  checkSEO?: boolean = true;

  @ApiPropertyOptional({ description: 'Check readability', default: true })
  @IsOptional()
  @IsBoolean()
  checkReadability?: boolean = true;
}

export class ValidationErrorDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiPropertyOptional()
  suggestion?: string;
}

export class ValidationResultDto {
  @ApiProperty()
  isValid: boolean;

  @ApiProperty({ type: [ValidationErrorDto] })
  errors: ValidationErrorDto[];

  @ApiProperty({ type: [String] })
  warnings: string[];

  @ApiProperty({ type: [String] })
  suggestions: string[];

  @ApiProperty({ description: 'Overall validation score (0-100)' })
  score: number;
}

export class ContentImprovementDto {
  @ApiProperty({ description: 'Content to improve' })
  @IsString()
  @Length(1, 50000)
  content: string;

  @ApiPropertyOptional({ description: 'Focus areas for improvement' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @ApiPropertyOptional({ enum: TargetAudience })
  @IsOptional()
  @IsEnum(TargetAudience)
  targetAudience?: TargetAudience;

  @ApiPropertyOptional({ description: 'Maximum number of suggestions', minimum: 1, maximum: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxSuggestions?: number = 5;
}

export class ContentSuggestionDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  suggestion: string;

  @ApiProperty()
  reason: string;

  @ApiProperty({ description: 'Impact score (0-100)' })
  impact: number;

  @ApiProperty({ description: 'Implementation difficulty (0-100)' })
  difficulty: number;

  @ApiPropertyOptional()
  example?: string;
}