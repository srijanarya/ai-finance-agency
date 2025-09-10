import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsUUID,
  IsBoolean,
  IsObject,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentType {
  POST = 'post',
  ARTICLE = 'article',
  EMAIL = 'email',
  VIDEO_SCRIPT = 'video_script',
  REPORT = 'report',
  ANALYSIS = 'analysis',
}

export enum ContentCategory {
  MARKET_ANALYSIS = 'market_analysis',
  EDUCATION = 'education',
  PROMOTION = 'promotion',
  NEWS = 'news',
  OPINION = 'opinion',
}

export enum AIModel {
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  AUTO = 'auto',
}

export enum ComplianceLevel {
  LOW = 'low',
  STANDARD = 'standard',
  HIGH = 'high',
  REGULATORY = 'regulatory',
}

export class PersonalizationDataDto {
  @ApiPropertyOptional({ description: 'Target audience segments' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  audienceSegments?: string[];

  @ApiPropertyOptional({ description: 'User industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'User role/position' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Content tone preference' })
  @IsOptional()
  @IsString()
  tonePreference?: string;

  @ApiPropertyOptional({ description: 'Complexity level preference' })
  @IsOptional()
  @IsString()
  complexityLevel?: string;
}

export class GenerationParametersDto {
  @ApiPropertyOptional({ description: 'AI temperature (creativity)', minimum: 0, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Maximum tokens to generate', minimum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(100)
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Top-p sampling parameter', minimum: 0, maximum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  topP?: number;

  @ApiPropertyOptional({ description: 'Frequency penalty', minimum: -2, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  frequencyPenalty?: number;

  @ApiPropertyOptional({ description: 'Presence penalty', minimum: -2, maximum: 2 })
  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  presencePenalty?: number;
}

export class ContentGenerationRequestDto {
  @ApiProperty({ description: 'Content type to generate', enum: ContentType })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({ description: 'Content category', enum: ContentCategory })
  @IsOptional()
  @IsEnum(ContentCategory)
  contentCategory?: ContentCategory;

  @ApiProperty({ description: 'Content title or prompt' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Additional content prompt or context' })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Template ID to use for generation' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Preferred AI model', enum: AIModel, default: AIModel.AUTO })
  @IsOptional()
  @IsEnum(AIModel)
  aiModel?: AIModel = AIModel.AUTO;

  @ApiPropertyOptional({ description: 'Target platforms for optimization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetPlatforms?: string[];

  @ApiPropertyOptional({ description: 'Content language', default: 'en' })
  @IsOptional()
  @IsString()
  language?: string = 'en';

  @ApiPropertyOptional({ description: 'Target word count' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  targetWordCount?: number;

  @ApiPropertyOptional({ description: 'Include market data context' })
  @IsOptional()
  @IsBoolean()
  includeMarketData?: boolean = false;

  @ApiPropertyOptional({ description: 'Include news analysis' })
  @IsOptional()
  @IsBoolean()
  includeNewsAnalysis?: boolean = false;

  @ApiPropertyOptional({ description: 'Compliance level required', enum: ComplianceLevel })
  @IsOptional()
  @IsEnum(ComplianceLevel)
  complianceLevel?: ComplianceLevel = ComplianceLevel.STANDARD;

  @ApiPropertyOptional({ description: 'Target jurisdictions for compliance' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];

  @ApiPropertyOptional({ description: 'Minimum quality score', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  minQualityScore?: number = 8.0;

  @ApiPropertyOptional({ description: 'Personalization data' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalizationDataDto)
  personalization?: PersonalizationDataDto;

  @ApiPropertyOptional({ description: 'AI generation parameters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GenerationParametersDto)
  generationParameters?: GenerationParametersDto;

  @ApiPropertyOptional({ description: 'Keywords to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: 'Keywords to avoid' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidKeywords?: string[];

  @ApiPropertyOptional({ description: 'Custom instructions' })
  @IsOptional()
  @IsString()
  customInstructions?: string;
}

export class ContentRegenerationRequestDto {
  @ApiPropertyOptional({ description: 'Refinement prompt for regeneration' })
  @IsOptional()
  @IsString()
  refinementPrompt?: string;

  @ApiPropertyOptional({ description: 'New AI model to use', enum: AIModel })
  @IsOptional()
  @IsEnum(AIModel)
  aiModel?: AIModel;

  @ApiPropertyOptional({ description: 'Updated generation parameters' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GenerationParametersDto)
  generationParameters?: GenerationParametersDto;

  @ApiPropertyOptional({ description: 'Keep original content for comparison' })
  @IsOptional()
  @IsBoolean()
  keepOriginal?: boolean = true;
}

export class ContentOptimizationRequestDto {
  @ApiProperty({ description: 'Target platforms for optimization' })
  @IsArray()
  @IsString({ each: true })
  targetPlatforms: string[];

  @ApiPropertyOptional({ description: 'Include hashtag suggestions' })
  @IsOptional()
  @IsBoolean()
  includeHashtags?: boolean = true;

  @ApiPropertyOptional({ description: 'Include mention suggestions' })
  @IsOptional()
  @IsBoolean()
  includeMentions?: boolean = false;

  @ApiPropertyOptional({ description: 'Include call-to-action' })
  @IsOptional()
  @IsBoolean()
  includeCallToAction?: boolean = true;

  @ApiPropertyOptional({ description: 'Preserve original meaning' })
  @IsOptional()
  @IsBoolean()
  preserveMeaning?: boolean = true;
}

export class GeneratedContentResponseDto {
  @ApiProperty({ description: 'Content ID' })
  id: string;

  @ApiProperty({ description: 'Generated content text' })
  content: string;

  @ApiProperty({ description: 'Content title' })
  title: string;

  @ApiProperty({ description: 'Content type', enum: ContentType })
  contentType: ContentType;

  @ApiProperty({ description: 'Content category', enum: ContentCategory })
  contentCategory: ContentCategory;

  @ApiProperty({ description: 'Word count' })
  wordCount: number;

  @ApiProperty({ description: 'AI model used' })
  aiModelUsed: string;

  @ApiProperty({ description: 'Generation time in milliseconds' })
  generationTimeMs: number;

  @ApiProperty({ description: 'Tokens used' })
  tokensUsed: number;

  @ApiProperty({ description: 'Generation cost' })
  generationCost: number;

  @ApiProperty({ description: 'Quality score', minimum: 1, maximum: 10 })
  qualityScore: number;

  @ApiProperty({ description: 'Readability score', minimum: 1, maximum: 10 })
  readabilityScore: number;

  @ApiProperty({ description: 'Sentiment score', minimum: -1, maximum: 1 })
  sentimentScore: number;

  @ApiProperty({ description: 'Compliance status' })
  complianceStatus: string;

  @ApiProperty({ description: 'Compliance score', minimum: 1, maximum: 10 })
  complianceScore: number;

  @ApiPropertyOptional({ description: 'Compliance violations' })
  complianceViolations?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Required disclaimers' })
  requiredDisclaimers?: string[];

  @ApiProperty({ description: 'Content status' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class BulkContentGenerationRequestDto {
  @ApiProperty({ description: 'Array of content generation requests' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentGenerationRequestDto)
  requests: ContentGenerationRequestDto[];

  @ApiPropertyOptional({ description: 'Batch processing priority', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priority?: number = 5;

  @ApiPropertyOptional({ description: 'Webhook URL for completion notification' })
  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class ContentAnalysisResponseDto {
  @ApiProperty({ description: 'Content ID' })
  contentId: string;

  @ApiProperty({ description: 'Quality analysis results' })
  qualityAnalysis: {
    score: number;
    factors: Record<string, number>;
    improvements: string[];
  };

  @ApiProperty({ description: 'Readability analysis' })
  readabilityAnalysis: {
    score: number;
    gradeLevel: string;
    suggestions: string[];
  };

  @ApiProperty({ description: 'SEO analysis' })
  seoAnalysis: {
    score: number;
    keywords: string[];
    recommendations: string[];
  };

  @ApiProperty({ description: 'Sentiment analysis' })
  sentimentAnalysis: {
    score: number;
    classification: string;
    confidence: number;
  };

  @ApiProperty({ description: 'Compliance analysis' })
  complianceAnalysis: {
    score: number;
    status: string;
    violations: any[];
    requiredDisclaimers: string[];
  };
}