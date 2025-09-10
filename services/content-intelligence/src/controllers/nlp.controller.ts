/**
 * NLP Controller
 * 
 * RESTful API endpoints for Natural Language Processing operations:
 * - Content processing and analysis
 * - Market insight extraction
 * - Trend detection and monitoring
 * - Content scoring and quality assessment
 * - Cache management and performance metrics
 * 
 * Provides comprehensive API access to all NLP capabilities with proper
 * validation, error handling, and performance monitoring.
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

// Services
import { NlpProcessingService } from '../services/nlp-processing.service';
import { MarketInsightService } from '../services/market-insight.service';
import { TrendDetectionService } from '../services/trend-detection.service';
import { ContentScoringService } from '../services/content-scoring.service';
import { ContentCacheService } from '../services/content-cache.service';
import { ContentStreamGateway } from '../gateways/content-stream.gateway';

// DTOs
import {
  NLPProcessingOptions,
  NLPProcessingResult,
  MarketInsightResult,
  TrendDetectionResult,
  ContentScoringResult,
  EntityType
} from '../interfaces/nlp.interface';

// Request DTOs
class ProcessContentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  enableSentimentAnalysis?: boolean;

  @IsOptional()
  @IsBoolean()
  enableEntityExtraction?: boolean;

  @IsOptional()
  @IsBoolean()
  enableKeyPhraseExtraction?: boolean;

  @IsOptional()
  @IsBoolean()
  enableLanguageDetection?: boolean;

  @IsOptional()
  @IsBoolean()
  enableTextSummarization?: boolean;

  @IsOptional()
  @IsBoolean()
  enableTopicModeling?: boolean;

  @IsOptional()
  @IsArray()
  entityTypes?: EntityType[];

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(1000)
  summaryLength?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(50)
  maxKeyPhrases?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  confidenceThreshold?: number;

  @IsOptional()
  @IsBoolean()
  useAdvancedNLP?: boolean;
}

class ExtractInsightsDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  includeWeakSignals?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  confidenceThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxInsights?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusSymbols?: string[];

  @IsOptional()
  @IsString()
  timeframe?: string;

  @IsOptional()
  @IsBoolean()
  useAIAnalysis?: boolean;
}

class ScoreContentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  targetAudience?: 'retail' | 'institutional' | 'professional' | 'general';

  @IsOptional()
  @IsString()
  contentType?: 'news' | 'analysis' | 'opinion' | 'research' | 'social';

  @IsOptional()
  @IsString()
  urgency?: 'low' | 'medium' | 'high' | 'breaking';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  marketFocus?: string[];

  @IsOptional()
  @IsBoolean()
  useAIScoring?: boolean;
}

@ApiTags('NLP Processing')
@Controller('nlp')
@UseGuards(ThrottlerGuard)
export class NlpController {
  private readonly logger = new Logger(NlpController.name);

  constructor(
    private readonly nlpProcessingService: NlpProcessingService,
    private readonly marketInsightService: MarketInsightService,
    private readonly trendDetectionService: TrendDetectionService,
    private readonly contentScoringService: ContentScoringService,
    private readonly contentCacheService: ContentCacheService,
    private readonly contentStreamGateway: ContentStreamGateway,
  ) {}

  @Post('process')
  @ApiOperation({ 
    summary: 'Process content with NLP analysis',
    description: 'Performs comprehensive natural language processing including sentiment analysis, entity extraction, key phrase identification, and more.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Content processed successfully',
    type: Object // Would be NLPProcessingResult in real implementation
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid input data' 
  })
  @ApiResponse({ 
    status: HttpStatus.TOO_MANY_REQUESTS, 
    description: 'Rate limit exceeded' 
  })
  async processContent(@Body(ValidationPipe) dto: ProcessContentDto): Promise<NLPProcessingResult> {
    try {
      this.logger.log(`Processing content from source: ${dto.source || 'unknown'}`);

      // Check cache first
      const contentHash = this.generateContentHash(dto.content);
      const cached = await this.contentCacheService.getCachedNLPResult(contentHash);
      
      if (cached) {
        this.logger.debug('Returning cached NLP result');
        return cached;
      }

      // Process content
      const options: NLPProcessingOptions = {
        enableSentimentAnalysis: dto.enableSentimentAnalysis,
        enableEntityExtraction: dto.enableEntityExtraction,
        enableKeyPhraseExtraction: dto.enableKeyPhraseExtraction,
        enableLanguageDetection: dto.enableLanguageDetection,
        enableTextSummarization: dto.enableTextSummarization,
        enableTopicModeling: dto.enableTopicModeling,
        entityTypes: dto.entityTypes,
        summaryLength: dto.summaryLength,
        maxKeyPhrases: dto.maxKeyPhrases,
        confidenceThreshold: dto.confidenceThreshold,
        useAdvancedNLP: dto.useAdvancedNLP,
      };

      const result = await this.nlpProcessingService.processText(dto.content, options);

      // Cache the result
      await this.contentCacheService.cacheNLPResult(contentHash, result);

      // Emit event for real-time subscribers
      if (dto.source) {
        await this.contentStreamGateway.streamContentProcessed({
          content: dto.content,
          nlpResult: result,
          source: dto.source,
          contentId: contentHash
        });
      }

      return result;

    } catch (error) {
      this.logger.error('Content processing failed:', error);
      throw error;
    }
  }

  @Post('insights')
  @ApiOperation({ 
    summary: 'Extract market insights from content',
    description: 'Analyzes content to extract trading signals, price targets, analyst recommendations, and market opportunities.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Market insights extracted successfully' 
  })
  async extractInsights(@Body(ValidationPipe) dto: ExtractInsightsDto): Promise<MarketInsightResult> {
    try {
      this.logger.log('Extracting market insights from content');

      // Check cache first
      const contentHash = this.generateContentHash(dto.content);
      const cached = await this.contentCacheService.getCachedMarketInsights(contentHash);
      
      if (cached) {
        this.logger.debug('Returning cached market insights');
        return cached;
      }

      const options = {
        includeWeakSignals: dto.includeWeakSignals,
        confidenceThreshold: dto.confidenceThreshold,
        maxInsights: dto.maxInsights,
        focusSymbols: dto.focusSymbols,
        timeframe: dto.timeframe,
        useAIAnalysis: dto.useAIAnalysis,
      };

      const insights = await this.marketInsightService.extractInsights(dto.content, options);

      // Cache the results
      await this.contentCacheService.cacheMarketInsights(
        contentHash, 
        insights, 
        dto.focusSymbols
      );

      // Emit event for real-time subscribers
      await this.contentStreamGateway.streamMarketInsights({
        insights,
        contentId: contentHash,
        source: 'api'
      });

      return insights;

    } catch (error) {
      this.logger.error('Market insight extraction failed:', error);
      throw error;
    }
  }

  @Get('trends')
  @ApiOperation({ 
    summary: 'Get trend detection results',
    description: 'Retrieves real-time trend analysis for specified symbols or overall market.'
  })
  @ApiQuery({ name: 'symbol', required: false, description: 'Stock symbol to analyze' })
  @ApiQuery({ name: 'timeframe', required: false, enum: ['real-time', 'hourly', 'daily'] })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Trend detection results retrieved successfully' 
  })
  async getTrends(
    @Query('symbol') symbol?: string,
    @Query('timeframe') timeframe?: 'real-time' | 'hourly' | 'daily'
  ): Promise<TrendDetectionResult> {
    try {
      this.logger.log(`Getting trends for symbol: ${symbol || 'all'}`);

      // Check cache first
      const cached = await this.contentCacheService.getCachedTrendDetection(symbol);
      
      if (cached && timeframe !== 'real-time') {
        this.logger.debug('Returning cached trend detection');
        return cached;
      }

      const trends = await this.trendDetectionService.detectTrends(symbol, timeframe);

      // Cache the results (except for real-time requests)
      if (timeframe !== 'real-time') {
        await this.contentCacheService.cacheTrendDetection(symbol || 'global', trends);
      }

      return trends;

    } catch (error) {
      this.logger.error('Trend detection failed:', error);
      throw error;
    }
  }

  @Post('score')
  @ApiOperation({ 
    summary: 'Score content quality and relevance',
    description: 'Evaluates content across multiple dimensions including relevance, credibility, timeliness, and engagement potential.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Content scored successfully' 
  })
  async scoreContent(@Body(ValidationPipe) dto: ScoreContentDto): Promise<ContentScoringResult> {
    try {
      this.logger.log(`Scoring content from source: ${dto.source || 'unknown'}`);

      // Check cache first
      const contentHash = this.generateContentHash(dto.content);
      const cached = await this.contentCacheService.getCachedContentScore(contentHash);
      
      if (cached) {
        this.logger.debug('Returning cached content score');
        return cached;
      }

      const options = {
        targetAudience: dto.targetAudience,
        contentType: dto.contentType,
        urgency: dto.urgency,
        marketFocus: dto.marketFocus,
        useAIScoring: dto.useAIScoring,
      };

      const score = await this.contentScoringService.scoreContent(
        dto.content, 
        dto.source, 
        options
      );

      // Cache the results
      await this.contentCacheService.cacheContentScore(contentHash, score, dto.source);

      // Emit event for real-time subscribers
      await this.contentStreamGateway.streamContentScore({
        contentId: contentHash,
        score,
        source: dto.source || 'api'
      });

      return score;

    } catch (error) {
      this.logger.error('Content scoring failed:', error);
      throw error;
    }
  }

  @Post('process-batch')
  @ApiOperation({ 
    summary: 'Process multiple content items in batch',
    description: 'Efficiently processes multiple content items with full NLP analysis, insights extraction, and scoring.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Batch processing completed successfully' 
  })
  async processBatch(
    @Body(ValidationPipe) dto: { items: Array<{ content: string; source?: string }> }
  ): Promise<{
    results: Array<{
      contentId: string;
      nlp: NLPProcessingResult;
      insights: MarketInsightResult;
      score: ContentScoringResult;
    }>;
    summary: {
      processed: number;
      cached: number;
      processingTime: number;
    };
  }> {
    const startTime = Date.now();
    const results: any[] = [];
    let cachedCount = 0;

    try {
      this.logger.log(`Processing batch of ${dto.items.length} items`);

      // Process items in parallel with reasonable concurrency
      const concurrencyLimit = 5;
      const chunks = this.chunkArray(dto.items, concurrencyLimit);

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (item) => {
          const contentHash = this.generateContentHash(item.content);
          
          // Check if all results are cached
          const [cachedNLP, cachedInsights, cachedScore] = await Promise.all([
            this.contentCacheService.getCachedNLPResult(contentHash),
            this.contentCacheService.getCachedMarketInsights(contentHash),
            this.contentCacheService.getCachedContentScore(contentHash)
          ]);

          if (cachedNLP && cachedInsights && cachedScore) {
            cachedCount++;
            return {
              contentId: contentHash,
              nlp: cachedNLP,
              insights: cachedInsights,
              score: cachedScore
            };
          }

          // Process if not fully cached
          const [nlp, insights, score] = await Promise.all([
            cachedNLP || this.nlpProcessingService.processText(item.content, { useAdvancedNLP: false }),
            cachedInsights || this.marketInsightService.extractInsights(item.content, { useAIAnalysis: false }),
            cachedScore || this.contentScoringService.scoreContent(item.content, item.source, { useAIScoring: false })
          ]);

          // Cache results that weren't cached
          await Promise.all([
            !cachedNLP && this.contentCacheService.cacheNLPResult(contentHash, nlp),
            !cachedInsights && this.contentCacheService.cacheMarketInsights(contentHash, insights),
            !cachedScore && this.contentCacheService.cacheContentScore(contentHash, score, item.source)
          ]);

          return {
            contentId: contentHash,
            nlp,
            insights,
            score
          };
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }

      const processingTime = Date.now() - startTime;

      return {
        results,
        summary: {
          processed: dto.items.length,
          cached: cachedCount,
          processingTime
        }
      };

    } catch (error) {
      this.logger.error('Batch processing failed:', error);
      throw error;
    }
  }

  @Get('cache/stats')
  @ApiOperation({ 
    summary: 'Get cache statistics',
    description: 'Retrieves comprehensive cache performance metrics and statistics.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cache statistics retrieved successfully' 
  })
  async getCacheStats() {
    try {
      const [metrics, info] = await Promise.all([
        this.contentCacheService.getMetrics(),
        this.contentCacheService.getCacheInfo()
      ]);

      return {
        metrics,
        info,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      throw error;
    }
  }

  @Delete('cache/:pattern')
  @ApiOperation({ 
    summary: 'Invalidate cache by pattern',
    description: 'Removes cached entries matching the specified pattern.'
  })
  @ApiParam({ name: 'pattern', description: 'Cache key pattern to invalidate' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Cache invalidated successfully' 
  })
  async invalidateCache(@Param('pattern') pattern: string): Promise<{ invalidated: number }> {
    try {
      this.logger.log(`Invalidating cache pattern: ${pattern}`);
      
      const invalidated = await this.contentCacheService.invalidateByPattern(pattern);
      
      return { invalidated };

    } catch (error) {
      this.logger.error(`Cache invalidation failed for pattern ${pattern}:`, error);
      throw error;
    }
  }

  @Get('gateway/stats')
  @ApiOperation({ 
    summary: 'Get WebSocket gateway statistics',
    description: 'Retrieves real-time statistics about connected WebSocket clients and subscriptions.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Gateway statistics retrieved successfully' 
  })
  async getGatewayStats() {
    return this.contentStreamGateway.getStatistics();
  }

  @Post('process-stream')
  @ApiOperation({ 
    summary: 'Process content for trend analysis',
    description: 'Processes content specifically for real-time trend detection and streams results to connected clients.'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Content processed and streamed successfully' 
  })
  async processForTrends(
    @Body(ValidationPipe) dto: { content: string; source: string; metadata?: Record<string, any> }
  ): Promise<{ processed: boolean; trendsDetected: number }> {
    try {
      this.logger.log(`Processing content for trends from source: ${dto.source}`);

      await this.trendDetectionService.processContentForTrends(
        dto.content, 
        dto.source, 
        dto.metadata || {}
      );

      return { 
        processed: true, 
        trendsDetected: 0 // Would be returned from the service in real implementation
      };

    } catch (error) {
      this.logger.error('Stream processing failed:', error);
      throw error;
    }
  }

  // Helper methods

  private generateContentHash(content: string): string {
    // Simple hash function for content identification
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}