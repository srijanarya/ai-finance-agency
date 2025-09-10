import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Logger,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

import { AIContentService } from '../services/ai-content/ai-content.service';
import {
  GenerateContentDto,
  BatchGenerateContentDto,
  ContentGenerationResponseDto,
  BatchContentGenerationResponseDto,
  ValidateContentDto,
  ValidationResultDto,
  ContentImprovementDto,
  ContentSuggestionDto,
  ContentPerformanceMetricsDto,
} from '../dto/ai-content/ai-content.dto';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

@ApiTags('AI Content Generation')
@Controller('ai-content')
@UseGuards(ThrottlerGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AIContentController {
  private readonly logger = new Logger(AIContentController.name);

  constructor(private readonly aiContentService: AIContentService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate content using AI',
    description: 'Creates high-quality financial content using advanced AI providers with customizable style, tone, and audience targeting.'
  })
  @ApiResponse({
    status: 201,
    description: 'Content generated successfully',
    type: ContentGenerationResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async generateContent(
    @Body() generateContentDto: GenerateContentDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ContentGenerationResponseDto> {
    try {
      this.logger.log(`Generating content for user: ${req.user?.sub}`);

      const request = {
        prompt: generateContentDto.prompt,
        contentType: generateContentDto.contentType,
        style: generateContentDto.style,
        tone: generateContentDto.tone,
        targetAudience: generateContentDto.targetAudience,
        maxLength: generateContentDto.maxLength,
        minLength: generateContentDto.minLength,
        includeSources: generateContentDto.includeSources,
        marketData: generateContentDto.marketData,
        templateId: generateContentDto.templateId,
        personalizations: generateContentDto.personalizations,
      };

      const response = await this.aiContentService.generateContent(request, req.user?.sub);

      return {
        id: response.id,
        content: response.content,
        title: response.title,
        summary: response.summary,
        metadata: {
          wordCount: response.metadata.wordCount,
          readingTime: response.metadata.readingTime,
          contentType: response.metadata.contentType,
          style: response.metadata.style,
          tone: response.metadata.tone,
          targetAudience: response.metadata.targetAudience,
          confidence: response.metadata.confidence,
          relevanceScore: response.metadata.relevanceScore,
          seoScore: response.metadata.seoScore,
          complianceFlags: response.metadata.complianceFlags,
          sources: response.metadata.sources,
          keywords: response.metadata.keywords,
        },
        suggestions: response.suggestions,
        performance: response.performance ? {
          readabilityScore: response.performance.readabilityScore,
          seoScore: response.performance.seoScore,
          complianceScore: response.performance.complianceScore,
          engagementPrediction: response.performance.engagementPrediction,
          viralityScore: response.performance.viralityScore,
          conversionPotential: response.performance.conversionPotential,
        } : undefined,
        generatedAt: response.generatedAt,
        provider: {
          name: response.provider.name,
          version: response.provider.version,
          model: response.provider.model,
          maxTokens: response.provider.maxTokens,
          temperature: response.provider.temperature,
          responseTime: response.provider.responseTime,
          cost: response.provider.cost,
        },
      };
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`);
      throw error;
    }
  }

  @Post('generate/batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generate multiple pieces of content',
    description: 'Efficiently generates multiple pieces of content with parallel processing and concurrency control.'
  })
  @ApiResponse({
    status: 201,
    description: 'Batch content generation completed',
    type: BatchContentGenerationResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid batch request' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async generateBatchContent(
    @Body() batchDto: BatchGenerateContentDto,
    @Req() req: AuthenticatedRequest
  ): Promise<BatchContentGenerationResponseDto> {
    try {
      this.logger.log(`Generating batch content: ${batchDto.requests.length} requests for user: ${req.user?.sub}`);

      const startTime = Date.now();

      const requests = batchDto.requests.map(dto => ({
        prompt: dto.prompt,
        contentType: dto.contentType,
        style: dto.style,
        tone: dto.tone,
        targetAudience: dto.targetAudience,
        maxLength: dto.maxLength,
        minLength: dto.minLength,
        includeSources: dto.includeSources,
        marketData: dto.marketData,
        templateId: dto.templateId,
        personalizations: dto.personalizations,
      }));

      const results = await this.aiContentService.generateBatchContent(
        requests,
        {
          parallel: batchDto.parallel,
          maxConcurrency: batchDto.maxConcurrency,
        },
        req.user?.sub
      );

      const processingTime = Date.now() - startTime;

      return {
        results: results.map(response => ({
          id: response.id,
          content: response.content,
          title: response.title,
          summary: response.summary,
          metadata: {
            wordCount: response.metadata.wordCount,
            readingTime: response.metadata.readingTime,
            contentType: response.metadata.contentType,
            style: response.metadata.style,
            tone: response.metadata.tone,
            targetAudience: response.metadata.targetAudience,
            confidence: response.metadata.confidence,
            relevanceScore: response.metadata.relevanceScore,
            seoScore: response.metadata.seoScore,
            complianceFlags: response.metadata.complianceFlags,
            sources: response.metadata.sources,
            keywords: response.metadata.keywords,
          },
          suggestions: response.suggestions,
          performance: response.performance ? {
            readabilityScore: response.performance.readabilityScore,
            seoScore: response.performance.seoScore,
            complianceScore: response.performance.complianceScore,
            engagementPrediction: response.performance.engagementPrediction,
            viralityScore: response.performance.viralityScore,
            conversionPotential: response.performance.conversionPotential,
          } : undefined,
          generatedAt: response.generatedAt,
          provider: {
            name: response.provider.name,
            version: response.provider.version,
            model: response.provider.model,
            maxTokens: response.provider.maxTokens,
            temperature: response.provider.temperature,
            responseTime: response.provider.responseTime,
            cost: response.provider.cost,
          },
        })),
        totalCount: batchDto.requests.length,
        successCount: results.length,
        failureCount: batchDto.requests.length - results.length,
        errors: [], // Could be enhanced to track specific errors
        processingTime,
      };
    } catch (error) {
      this.logger.error(`Batch content generation failed: ${error.message}`);
      throw error;
    }
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate content quality and compliance',
    description: 'Analyzes content for quality, compliance, readability, and provides improvement suggestions.'
  })
  @ApiResponse({
    status: 200,
    description: 'Content validation completed',
    type: ValidationResultDto
  })
  @ApiResponse({ status: 400, description: 'Invalid content for validation' })
  async validateContent(@Body() validateDto: ValidateContentDto): Promise<ValidationResultDto> {
    try {
      this.logger.log(`Validating content of type: ${validateDto.contentType}`);

      const validation = await this.aiContentService.validateContent(
        validateDto.content,
        validateDto.contentType
      );

      return {
        isValid: validation.isValid,
        errors: validation.errors.map(error => ({
          type: error.type,
          message: error.message,
          severity: error.severity,
          suggestion: error.suggestion,
        })),
        warnings: validation.warnings.map(warning => warning.message),
        suggestions: validation.suggestions,
        score: validation.score,
      };
    } catch (error) {
      this.logger.error(`Content validation failed: ${error.message}`);
      throw error;
    }
  }

  @Post('improve')
  @ApiOperation({
    summary: 'Get content improvement suggestions',
    description: 'Analyzes content and provides specific, actionable suggestions for improvement.'
  })
  @ApiResponse({
    status: 200,
    description: 'Improvement suggestions generated',
    type: [ContentSuggestionDto]
  })
  @ApiResponse({ status: 400, description: 'Invalid content for analysis' })
  async suggestImprovements(@Body() improvementDto: ContentImprovementDto): Promise<ContentSuggestionDto[]> {
    try {
      this.logger.log('Generating content improvement suggestions');

      const suggestions = await this.aiContentService.suggestImprovements(
        improvementDto.content,
        improvementDto.focusAreas
      );

      // Transform suggestions into structured format
      return suggestions.slice(0, improvementDto.maxSuggestions || 5).map((suggestion, index) => ({
        type: 'improvement',
        suggestion,
        reason: 'AI-generated recommendation',
        impact: 70 + Math.random() * 30, // Mock impact score
        difficulty: 30 + Math.random() * 40, // Mock difficulty score
        example: index === 0 ? 'Example implementation of the suggestion' : undefined,
      }));
    } catch (error) {
      this.logger.error(`Content improvement suggestion failed: ${error.message}`);
      throw error;
    }
  }

  @Get('content/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get generated content by ID',
    description: 'Retrieves a specific piece of generated content with full metadata.'
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({
    status: 200,
    description: 'Content retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getContent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving content: ${id} for user: ${req.user?.sub}`);

      const content = await this.aiContentService.getGeneratedContent(id, req.user?.sub);

      return {
        id: content.id,
        content: content.content,
        title: content.title,
        summary: content.summary,
        originalPrompt: content.originalPrompt,
        contentType: content.contentType,
        style: content.style,
        tone: content.tone,
        targetAudience: content.targetAudience,
        metadata: {
          wordCount: content.wordCount,
          readingTime: content.readingTime,
          confidence: content.confidence,
          relevanceScore: content.relevanceScore,
          seoScore: content.seoScore,
          readabilityScore: content.readabilityScore,
          complianceScore: content.complianceScore,
          engagementPrediction: content.engagementPrediction,
          complianceFlags: content.complianceFlags,
          sources: content.sources,
          keywords: content.keywords,
        },
        suggestions: content.suggestions,
        provider: {
          name: content.aiProvider,
          model: content.aiModel,
          cost: content.generationCost,
          responseTime: content.responseTime,
        },
        performance: content.getPerformanceMetrics(),
        status: content.status,
        userRating: content.userRating,
        feedback: content.feedback,
        viewCount: content.viewCount,
        shareCount: content.shareCount,
        likeCount: content.likeCount,
        createdAt: content.createdAt,
        updatedAt: content.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve content ${id}: ${error.message}`);
      throw error;
    }
  }

  @Get('content')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user content with pagination',
    description: 'Retrieves user\'s generated content with filtering and pagination options.'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'contentType', required: false, description: 'Filter by content type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({
    status: 200,
    description: 'Content list retrieved successfully'
  })
  async getUserContent(
    @Req() req: AuthenticatedRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('contentType') contentType?: string,
    @Query('status') status?: string
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving user content for: ${req.user?.sub}`);

      if (limit > 100) {
        throw new BadRequestException('Limit cannot exceed 100');
      }

      const result = await this.aiContentService.getUserContent(req.user?.sub!, {
        page: Number(page),
        limit: Number(limit),
        contentType,
        status,
      });

      return {
        content: result.content.map(content => ({
          id: content.id,
          title: content.title,
          contentType: content.contentType,
          style: content.style,
          tone: content.tone,
          targetAudience: content.targetAudience,
          wordCount: content.wordCount,
          readingTime: content.readingTime,
          status: content.status,
          userRating: content.userRating,
          qualityScore: content.getOverallQualityScore(),
          engagementScore: content.getEngagementScore(),
          hasComplianceIssues: content.hasComplianceIssues(),
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          pages: result.pages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve user content: ${error.message}`);
      throw error;
    }
  }

  @Put('content/:id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rate generated content',
    description: 'Provides rating and feedback for generated content to improve AI performance.'
  })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({
    status: 200,
    description: 'Content rated successfully'
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async rateContent(
    @Param('id') id: string,
    @Body() ratingData: { rating: number; feedback?: string },
    @Req() req: AuthenticatedRequest
  ): Promise<any> {
    try {
      this.logger.log(`Rating content: ${id} by user: ${req.user?.sub}`);

      if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const content = await this.aiContentService.rateContent(
        id,
        ratingData.rating,
        ratingData.feedback,
        req.user?.sub
      );

      return {
        id: content.id,
        userRating: content.userRating,
        feedback: content.feedback,
        updatedAt: content.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to rate content ${id}: ${error.message}`);
      throw error;
    }
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get content analytics',
    description: 'Retrieves comprehensive analytics and performance metrics for generated content.'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for analytics (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for analytics (ISO string)' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully'
  })
  async getAnalytics(
    @Req() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    try {
      this.logger.log(`Retrieving analytics for user: ${req.user?.sub}`);

      let timeRange: { start: Date; end: Date } | undefined;
      if (startDate && endDate) {
        timeRange = {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      }

      const analytics = await this.aiContentService.getContentAnalytics(req.user?.sub, timeRange);

      return {
        summary: {
          totalContent: analytics.totalContent,
          averageRating: analytics.avgRating,
          timeRange: timeRange ? {
            start: timeRange.start,
            end: timeRange.end,
          } : null,
        },
        distributions: {
          contentByType: analytics.contentByType,
          contentByProvider: analytics.contentByProvider,
        },
        performance: {
          averageScores: analytics.avgPerformanceScores,
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve analytics: ${error.message}`);
      throw error;
    }
  }
}