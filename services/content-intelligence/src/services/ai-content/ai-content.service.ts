import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  AIContentProvider,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ValidationResult,
  ContentPerformanceMetrics,
  ContentContext,
} from '../../interfaces/ai-content/ai-content.interface';

import { AIGeneratedContent } from '../../entities/ai-content/generated-content.entity';
import { ContentTemplate } from '../../entities/ai-content/content-template.entity';
import { OpenAIProviderService } from './openai-provider.service';
import { AnthropicProviderService } from './anthropic-provider.service';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable()
export class AIContentService {
  private readonly logger = new Logger(AIContentService.name);
  private readonly providers: Map<string, AIContentProvider> = new Map();
  private readonly primaryProvider: string;
  private readonly fallbackProviders: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(AIGeneratedContent)
    private readonly contentRepository: Repository<AIGeneratedContent>,
    @InjectRepository(ContentTemplate)
    private readonly templateRepository: Repository<ContentTemplate>,
    private readonly openaiProvider: OpenAIProviderService,
    private readonly anthropicProvider: AnthropicProviderService,
    private readonly marketDataService: MarketDataService,
  ) {
    this.initializeProviders();
    this.primaryProvider = this.configService.get<string>('ai.primary.provider', 'openai');
    this.fallbackProviders = this.configService.get<string[]>('ai.fallback.providers', ['anthropic']);
  }

  /**
   * Generate content using AI providers with fallback support
   */
  async generateContent(request: ContentGenerationRequest, userId?: string): Promise<ContentGenerationResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating content: ${request.contentType} for ${request.targetAudience}`);

      // Validate request
      await this.validateRequest(request);

      // Enhance request with market data if needed
      const enhancedRequest = await this.enhanceWithMarketData(request);

      // Apply template if specified
      const finalRequest = await this.applyTemplate(enhancedRequest);

      // Generate content with primary provider
      let response: ContentGenerationResponse;
      try {
        const provider = this.getProvider(this.primaryProvider);
        response = await provider.generateContent(finalRequest);
        this.logger.log(`Content generated with primary provider (${this.primaryProvider})`);
      } catch (error) {
        this.logger.warn(`Primary provider failed: ${error.message}, trying fallback`);
        response = await this.tryFallbackProviders(finalRequest);
      }

      // Post-process and enhance response
      const enhancedResponse = await this.enhanceResponse(response, finalRequest);

      // Save to database
      const savedContent = await this.saveGeneratedContent(enhancedResponse, finalRequest, userId);

      // Emit events for analytics and notifications
      this.eventEmitter.emit('content.generated', {
        contentId: savedContent.id,
        userId,
        contentType: request.contentType,
        provider: response.provider.name,
        responseTime: Date.now() - startTime,
      });

      return {
        ...enhancedResponse,
        id: savedContent.id,
      };
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`);
      
      // Emit error event for monitoring
      this.eventEmitter.emit('content.generation.failed', {
        userId,
        request,
        error: error.message,
        responseTime: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Generate multiple pieces of content efficiently
   */
  async generateBatchContent(
    requests: ContentGenerationRequest[],
    options: { parallel?: boolean; maxConcurrency?: number } = {},
    userId?: string
  ): Promise<ContentGenerationResponse[]> {
    const { parallel = true, maxConcurrency = 3 } = options;

    this.logger.log(`Generating batch content: ${requests.length} requests`);

    if (requests.length === 0) {
      throw new BadRequestException('At least one content request is required');
    }

    if (requests.length > 10) {
      throw new BadRequestException('Maximum 10 requests allowed per batch');
    }

    const startTime = Date.now();
    const results: ContentGenerationResponse[] = [];
    const errors: string[] = [];

    try {
      if (parallel) {
        // Process requests in parallel with concurrency control
        const chunks = this.chunkArray(requests, maxConcurrency);
        
        for (const chunk of chunks) {
          const chunkPromises = chunk.map(async (request) => {
            try {
              return await this.generateContent(request, userId);
            } catch (error) {
              errors.push(`Request ${chunk.indexOf(request)}: ${error.message}`);
              return null;
            }
          });

          const chunkResults = await Promise.all(chunkPromises);
          results.push(...chunkResults.filter(result => result !== null));
        }
      } else {
        // Process requests sequentially
        for (let i = 0; i < requests.length; i++) {
          try {
            const result = await this.generateContent(requests[i], userId);
            results.push(result);
          } catch (error) {
            errors.push(`Request ${i}: ${error.message}`);
          }
        }
      }

      // Emit batch completion event
      this.eventEmitter.emit('content.batch.completed', {
        userId,
        totalRequests: requests.length,
        successCount: results.length,
        failureCount: errors.length,
        processingTime: Date.now() - startTime,
      });

      return results;
    } catch (error) {
      this.logger.error(`Batch content generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate content quality and compliance
   */
  async validateContent(content: string, contentType: string): Promise<ValidationResult> {
    try {
      this.logger.log(`Validating content of type: ${contentType}`);

      const provider = this.getProvider(this.primaryProvider);
      const validation = await provider.validateContent(content);

      // Emit validation event
      this.eventEmitter.emit('content.validated', {
        contentType,
        isValid: validation.isValid,
        score: validation.score,
        errorCount: validation.errors.length,
      });

      return validation;
    } catch (error) {
      this.logger.error(`Content validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get content improvement suggestions
   */
  async suggestImprovements(content: string, focusAreas?: string[]): Promise<string[]> {
    try {
      this.logger.log('Generating content improvement suggestions');

      const provider = this.getProvider(this.primaryProvider);
      let suggestions = await provider.suggestImprovements(content);

      // Filter suggestions based on focus areas if provided
      if (focusAreas && focusAreas.length > 0) {
        suggestions = suggestions.filter(suggestion =>
          focusAreas.some(area =>
            suggestion.toLowerCase().includes(area.toLowerCase())
          )
        );
      }

      return suggestions;
    } catch (error) {
      this.logger.error(`Suggestion generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Estimate content performance metrics
   */
  async estimatePerformance(content: string, context: ContentContext): Promise<ContentPerformanceMetrics> {
    try {
      this.logger.log('Estimating content performance');

      const provider = this.getProvider(this.primaryProvider);
      const metrics = await provider.estimatePerformance(content, context);

      return metrics;
    } catch (error) {
      this.logger.error(`Performance estimation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get generated content by ID
   */
  async getGeneratedContent(id: string, userId?: string): Promise<AIGeneratedContent> {
    const whereClause = userId ? { id, userId } : { id };
    
    const content = await this.contentRepository.findOne({
      where: whereClause,
    });

    if (!content) {
      throw new BadRequestException('Content not found');
    }

    return content;
  }

  /**
   * Get user's generated content with pagination
   */
  async getUserContent(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      contentType?: string;
      status?: string;
    } = {}
  ): Promise<{ content: AIGeneratedContent[]; total: number; pages: number }> {
    const { page = 1, limit = 20, contentType, status } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contentRepository.createQueryBuilder('content')
      .where('content.userId = :userId', { userId });

    if (contentType) {
      queryBuilder.andWhere('content.contentType = :contentType', { contentType });
    }

    if (status) {
      queryBuilder.andWhere('content.status = :status', { status });
    }

    const [content, total] = await queryBuilder
      .orderBy('content.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      content,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update content rating and feedback
   */
  async rateContent(id: string, rating: number, feedback?: string, userId?: string): Promise<AIGeneratedContent> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const whereClause = userId ? { id, userId } : { id };
    const content = await this.contentRepository.findOne({ where: whereClause });

    if (!content) {
      throw new BadRequestException('Content not found');
    }

    content.userRating = rating;
    if (feedback) {
      content.feedback = feedback;
    }

    const updatedContent = await this.contentRepository.save(content);

    // Emit rating event for analytics
    this.eventEmitter.emit('content.rated', {
      contentId: id,
      rating,
      userId,
      contentType: content.contentType,
    });

    return updatedContent;
  }

  /**
   * Get content analytics and performance metrics
   */
  async getContentAnalytics(
    userId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<any> {
    const queryBuilder = this.contentRepository.createQueryBuilder('content');

    if (userId) {
      queryBuilder.where('content.userId = :userId', { userId });
    }

    if (timeRange) {
      queryBuilder.andWhere('content.createdAt BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end,
      });
    }

    const [
      totalContent,
      avgRating,
      contentByType,
      contentByProvider,
      avgPerformanceScores,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.select('AVG(content.userRating)', 'avgRating').getRawOne(),
      queryBuilder
        .select('content.contentType', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('content.contentType')
        .getRawMany(),
      queryBuilder
        .select('content.aiProvider', 'provider')
        .addSelect('COUNT(*)', 'count')
        .groupBy('content.aiProvider')
        .getRawMany(),
      queryBuilder
        .select('AVG(content.readabilityScore)', 'avgReadability')
        .addSelect('AVG(content.seoScore)', 'avgSEO')
        .addSelect('AVG(content.complianceScore)', 'avgCompliance')
        .addSelect('AVG(content.engagementPrediction)', 'avgEngagement')
        .getRawOne(),
    ]);

    return {
      totalContent,
      avgRating: parseFloat(avgRating?.avgRating || '0'),
      contentByType,
      contentByProvider,
      avgPerformanceScores: {
        readability: parseFloat(avgPerformanceScores?.avgReadability || '0'),
        seo: parseFloat(avgPerformanceScores?.avgSEO || '0'),
        compliance: parseFloat(avgPerformanceScores?.avgCompliance || '0'),
        engagement: parseFloat(avgPerformanceScores?.avgEngagement || '0'),
      },
    };
  }

  private initializeProviders(): void {
    this.providers.set('openai', this.openaiProvider);
    this.providers.set('anthropic', this.anthropicProvider);
    this.logger.log(`Initialized ${this.providers.size} AI providers`);
  }

  private getProvider(providerName: string): AIContentProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    return provider;
  }

  private async tryFallbackProviders(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    for (const providerName of this.fallbackProviders) {
      try {
        const provider = this.getProvider(providerName);
        const response = await provider.generateContent(request);
        this.logger.log(`Content generated with fallback provider (${providerName})`);
        return response;
      } catch (error) {
        this.logger.warn(`Fallback provider ${providerName} failed: ${error.message}`);
      }
    }
    
    throw new Error('All AI providers failed to generate content');
  }

  private async validateRequest(request: ContentGenerationRequest): Promise<void> {
    if (!request.prompt || request.prompt.trim().length < 10) {
      throw new BadRequestException('Prompt must be at least 10 characters long');
    }

    if (request.maxLength && request.minLength && request.maxLength < request.minLength) {
      throw new BadRequestException('Maximum length cannot be less than minimum length');
    }

    if (request.maxLength && request.maxLength > 10000) {
      throw new BadRequestException('Maximum length cannot exceed 10,000 words');
    }

    // Validate template if specified
    if (request.templateId) {
      const template = await this.templateRepository.findOne({
        where: { id: request.templateId, isActive: true },
      });

      if (!template) {
        throw new BadRequestException('Template not found or inactive');
      }
    }
  }

  private async enhanceWithMarketData(request: ContentGenerationRequest): Promise<ContentGenerationRequest> {
    if (!request.marketData || !request.marketData.symbols?.length) {
      return request;
    }

    try {
      // Fetch current market data for specified symbols
      const quotes = await this.marketDataService.getMultipleQuotes(request.marketData.symbols);
      
      const currentPrices: { [symbol: string]: number } = {};
      quotes.forEach(quote => {
        currentPrices[quote.symbol] = quote.price;
      });

      return {
        ...request,
        marketData: {
          ...request.marketData,
          currentPrices,
        },
      };
    } catch (error) {
      this.logger.warn(`Failed to enhance with market data: ${error.message}`);
      return request;
    }
  }

  private async applyTemplate(request: ContentGenerationRequest): Promise<ContentGenerationRequest> {
    if (!request.templateId) {
      return request;
    }

    try {
      const template = await this.templateRepository.findOne({
        where: { id: request.templateId, isActive: true },
      });

      if (!template) {
        return request;
      }

      // Generate prompt from template
      const templatePrompt = template.generatePrompt({
        originalPrompt: request.prompt,
        contentType: request.contentType,
        targetAudience: request.targetAudience,
        // Add other template variables as needed
      });

      return {
        ...request,
        prompt: templatePrompt,
        // Apply template constraints
        maxLength: Math.min(request.maxLength || template.constraints.maxLength, template.constraints.maxLength),
        minLength: Math.max(request.minLength || template.constraints.minLength, template.constraints.minLength),
      };
    } catch (error) {
      this.logger.warn(`Failed to apply template: ${error.message}`);
      return request;
    }
  }

  private async enhanceResponse(
    response: ContentGenerationResponse,
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> {
    // Additional post-processing can be added here
    // For example: compliance checking, SEO optimization, etc.
    return response;
  }

  private async saveGeneratedContent(
    response: ContentGenerationResponse,
    request: ContentGenerationRequest,
    userId?: string
  ): Promise<AIGeneratedContent> {
    const contentEntity = this.contentRepository.create({
      content: response.content,
      title: response.title,
      summary: response.summary,
      originalPrompt: request.prompt,
      contentType: request.contentType,
      style: request.style,
      tone: request.tone,
      targetAudience: request.targetAudience,
      wordCount: response.metadata.wordCount,
      readingTime: response.metadata.readingTime,
      confidence: response.metadata.confidence,
      relevanceScore: response.metadata.relevanceScore,
      seoScore: response.metadata.seoScore,
      readabilityScore: response.performance?.readabilityScore,
      complianceScore: response.performance?.complianceScore,
      engagementPrediction: response.performance?.engagementPrediction,
      complianceFlags: response.metadata.complianceFlags,
      sources: response.metadata.sources,
      keywords: response.metadata.keywords,
      suggestions: response.suggestions,
      aiProvider: response.provider.name,
      aiModel: response.provider.model,
      generationCost: response.provider.cost,
      responseTime: response.provider.responseTime,
      marketDataContext: request.marketData,
      userId,
      templateId: request.templateId,
      status: 'generated',
    });

    return await this.contentRepository.save(contentEntity);
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}