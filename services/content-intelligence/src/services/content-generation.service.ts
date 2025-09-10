import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Entities
import { GeneratedContent } from '../entities/generated-content.entity';
import { ContentTemplate } from '../entities/content-template.entity';

// DTOs
import {
  ContentGenerationRequestDto,
  ContentRegenerationRequestDto,
  GeneratedContentResponseDto,
  AIModel,
  ContentType,
} from '../dto/content-generation.dto';

// Services
import { MarketDataService } from './market-data.service';
import { NewsAggregationService } from './news-aggregation.service';
import { ComplianceValidationService } from './compliance-validation.service';
import { ContentQualityService } from './content-quality.service';
import { PersonalizationService } from './personalization.service';

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);
  private readonly openai: OpenAI;
  private readonly anthropic: Anthropic;

  constructor(
    @InjectRepository(GeneratedContent)
    private readonly generatedContentRepository: Repository<GeneratedContent>,
    @InjectRepository(ContentTemplate)
    private readonly templateRepository: Repository<ContentTemplate>,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly marketDataService: MarketDataService,
    private readonly newsAggregationService: NewsAggregationService,
    private readonly complianceService: ComplianceValidationService,
    private readonly qualityService: ContentQualityService,
    private readonly personalizationService: PersonalizationService,
  ) {
    // Initialize AI clients
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('ai.openai.apiKey'),
    });

    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ai.anthropic.apiKey'),
    });
  }

  async generateContent(
    request: ContentGenerationRequestDto,
    userId: string,
  ): Promise<GeneratedContentResponseDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`Starting content generation for user ${userId}`, {
        contentType: request.contentType,
        aiModel: request.aiModel,
      });

      // Validate request
      await this.validateGenerationRequest(request);

      // Get template if specified
      let template: ContentTemplate | null = null;
      if (request.templateId) {
        template = await this.templateRepository.findOne({
          where: { id: request.templateId, isActive: true },
        });
        if (!template) {
          throw new BadRequestException('Template not found or inactive');
        }
      }

      // Gather contextual data
      const context = await this.gatherContext(request);

      // Select optimal AI model
      const selectedModel = this.selectOptimalModel(request.contentType, request.aiModel, template);

      // Construct generation prompt
      const prompt = await this.constructPrompt(request, template, context);

      // Generate content using selected AI model
      const generatedContent = await this.generateWithAI(selectedModel, prompt, request);

      // Assess content quality
      const qualityScore = await this.qualityService.assessQuality(
        generatedContent.content,
        request.contentType,
      );

      // Check if quality meets threshold
      const minQualityScore = request.minQualityScore || 8.0;
      if (qualityScore.overallScore < minQualityScore) {
        this.logger.warn(`Quality score ${qualityScore.overallScore} below threshold ${minQualityScore}, regenerating`);
        // Regenerate with quality improvement prompt
        const improvementPrompt = this.generateImprovementPrompt(
          prompt,
          generatedContent.content,
          qualityScore,
        );
        const improvedContent = await this.generateWithAI(selectedModel, improvementPrompt, request);
        generatedContent.content = improvedContent.content;
        generatedContent.tokensUsed += improvedContent.tokensUsed;
        generatedContent.cost += improvedContent.cost;
      }

      // Validate compliance
      const complianceResult = await this.complianceService.validateCompliance(
        generatedContent.content,
        request.jurisdictions || ['US'],
        request.contentType,
        request.complianceLevel,
      );

      // Apply compliance corrections if needed
      let finalContent = generatedContent.content;
      if (!complianceResult.compliant && complianceResult.violations.length > 0) {
        finalContent = await this.applyComplianceCorrections(
          generatedContent.content,
          complianceResult.violations,
          selectedModel,
          request,
        );
      }

      // Save generated content
      const contentEntity = this.generatedContentRepository.create({
        userId,
        contentTitle: request.title,
        contentType: request.contentType,
        contentCategory: request.contentCategory,
        templateId: request.templateId,
        originalContent: generatedContent.content,
        finalContent,
        contentSummary: await this.generateSummary(finalContent),
        wordCount: this.countWords(finalContent),
        aiModelUsed: selectedModel,
        generationParameters: request.generationParameters,
        generationTimeMs: Date.now() - startTime,
        tokensUsed: generatedContent.tokensUsed,
        generationCost: generatedContent.cost,
        qualityScore: qualityScore.overallScore,
        readabilityScore: qualityScore.readabilityScore,
        sentimentScore: qualityScore.sentimentScore,
        complianceStatus: complianceResult.compliant ? 'approved' : 'requires_review',
        complianceScore: complianceResult.score,
        complianceViolations: complianceResult.violations,
        requiredDisclaimers: complianceResult.requiredDisclaimers,
        targetPlatforms: request.targetPlatforms,
        targetAudience: request.personalization,
        personalizationData: context.personalizationContext,
        marketContext: context.marketData,
        status: complianceResult.compliant ? 'approved' : 'review',
      });

      const savedContent = await this.generatedContentRepository.save(contentEntity);

      // Emit event for analytics
      this.eventEmitter.emit('content.generated', {
        contentId: savedContent.id,
        userId,
        contentType: request.contentType,
        aiModel: selectedModel,
        qualityScore: qualityScore.overallScore,
        generationTime: Date.now() - startTime,
      });

      // Update template usage stats if template was used
      if (template) {
        await this.updateTemplateStats(template.id, qualityScore.overallScore);
      }

      this.logger.log(`Content generation completed successfully`, {
        contentId: savedContent.id,
        generationTimeMs: Date.now() - startTime,
        qualityScore: qualityScore.overallScore,
      });

      return this.mapToResponseDto(savedContent, qualityScore);
    } catch (error) {
      this.logger.error('Content generation failed', {
        error: error.message,
        stack: error.stack,
        userId,
        request,
      });

      // Emit error event
      this.eventEmitter.emit('content.generation.failed', {
        userId,
        error: error.message,
        request,
      });

      throw error;
    }
  }

  async regenerateContent(
    contentId: string,
    request: ContentRegenerationRequestDto,
    userId: string,
  ): Promise<GeneratedContentResponseDto> {
    const existingContent = await this.generatedContentRepository.findOne({
      where: { id: contentId, userId },
    });

    if (!existingContent) {
      throw new BadRequestException('Content not found or access denied');
    }

    // Create regeneration request based on existing content
    const regenerationRequest: ContentGenerationRequestDto = {
      contentType: existingContent.contentType as ContentType,
      contentCategory: existingContent.contentCategory as any,
      title: existingContent.contentTitle,
      prompt: request.refinementPrompt || 'Please improve this content',
      templateId: existingContent.templateId,
      aiModel: request.aiModel || AIModel.AUTO,
      targetPlatforms: existingContent.targetPlatforms,
      personalization: existingContent.targetAudience as any,
      generationParameters: request.generationParameters || existingContent.generationParameters as any,
    };

    // Generate new content
    const newContent = await this.generateContent(regenerationRequest, userId);

    // Archive old content if not keeping original
    if (!request.keepOriginal) {
      existingContent.status = 'archived';
      existingContent.archivedAt = new Date();
      await this.generatedContentRepository.save(existingContent);
    }

    return newContent;
  }

  private async validateGenerationRequest(request: ContentGenerationRequestDto): Promise<void> {
    // Basic validation (additional validation through class-validator decorators)
    if (!request.title?.trim()) {
      throw new BadRequestException('Content title is required');
    }

    // Check AI model availability
    if (request.aiModel === AIModel.OPENAI && !this.configService.get('ai.openai.apiKey')) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    if (request.aiModel === AIModel.CLAUDE && !this.configService.get('ai.anthropic.apiKey')) {
      throw new BadRequestException('Anthropic API key not configured');
    }
  }

  private async gatherContext(request: ContentGenerationRequestDto): Promise<any> {
    const context: any = {};

    try {
      // Gather market data if requested
      if (request.includeMarketData) {
        context.marketData = await this.marketDataService.getCurrentMarketData();
      }

      // Gather news analysis if requested
      if (request.includeNewsAnalysis) {
        context.newsAnalysis = await this.newsAggregationService.getLatestFinancialNews();
      }

      // Apply personalization
      if (request.personalization) {
        context.personalizationContext = await this.personalizationService.buildPersonalizationContext(
          request.personalization,
        );
      }

      context.timestamp = new Date().toISOString();
      
      return context;
    } catch (error) {
      this.logger.warn('Failed to gather some context data', { error: error.message });
      return context;
    }
  }

  private selectOptimalModel(
    contentType: ContentType,
    requestedModel: AIModel,
    template?: ContentTemplate,
  ): string {
    // If specific model requested and not auto
    if (requestedModel !== AIModel.AUTO) {
      return requestedModel;
    }

    // Use template preference if available
    if (template?.aiModelPreference && template.aiModelPreference !== 'auto') {
      return template.aiModelPreference;
    }

    // Enhanced model selection based on content type and performance characteristics
    switch (contentType) {
      case ContentType.ANALYSIS:
        return AIModel.CLAUDE; // Best for deep analytical content
      case ContentType.REPORT:
        return AIModel.CLAUDE; // Excellent for structured reports
      case ContentType.ARTICLE:
        return AIModel.OPENAI; // Great balance of creativity and structure
      case ContentType.POST:
        return AIModel.GEMINI; // Best for engaging social content
      case ContentType.EMAIL:
        return AIModel.OPENAI; // Strong at personalized communication
      case ContentType.VIDEO_SCRIPT:
        return AIModel.GEMINI; // Creative and engaging for video content
      default:
        return this.selectFallbackModel();
    }
  }

  /**
   * Select fallback model based on availability and cost
   */
  private selectFallbackModel(): string {
    const availableModels = this.getAvailableModels();
    
    // Prefer models in order of cost-effectiveness and availability
    const preferenceOrder = [AIModel.GEMINI, AIModel.OPENAI, AIModel.CLAUDE];
    
    for (const model of preferenceOrder) {
      if (availableModels.includes(model)) {
        return model;
      }
    }
    
    // Default to OpenAI if nothing else is available
    return AIModel.OPENAI;
  }

  /**
   * Get list of available AI models based on configuration
   */
  private getAvailableModels(): string[] {
    const available: string[] = [];
    
    if (this.configService.get('ai.openai.apiKey')) {
      available.push(AIModel.OPENAI);
    }
    
    if (this.configService.get('ai.anthropic.apiKey')) {
      available.push(AIModel.CLAUDE);
    }
    
    // Gemini is always available in mock mode for now
    available.push(AIModel.GEMINI);
    
    return available;
  }

  private async constructPrompt(
    request: ContentGenerationRequestDto,
    template?: ContentTemplate,
    context?: any,
  ): Promise<string> {
    let prompt = '';

    // Base system prompt
    prompt += 'You are an expert financial content writer specializing in creating high-quality, compliant financial content.\n\n';

    // Add template structure if available
    if (template) {
      prompt += `Template Guidelines:\n${template.contentGuidelines || ''}\n`;
      prompt += `Template Structure: ${JSON.stringify(template.templateStructure)}\n\n`;
    }

    // Add content requirements
    prompt += `Content Requirements:\n`;
    prompt += `- Type: ${request.contentType}\n`;
    prompt += `- Category: ${request.contentCategory || 'general'}\n`;
    prompt += `- Title/Topic: ${request.title}\n`;
    prompt += `- Language: ${request.language || 'en'}\n`;
    
    if (request.targetWordCount) {
      prompt += `- Target word count: ${request.targetWordCount}\n`;
    }

    if (request.targetPlatforms?.length) {
      prompt += `- Target platforms: ${request.targetPlatforms.join(', ')}\n`;
    }

    // Add compliance requirements
    if (request.complianceLevel) {
      prompt += `- Compliance level: ${request.complianceLevel}\n`;
    }

    if (request.jurisdictions?.length) {
      prompt += `- Jurisdictions: ${request.jurisdictions.join(', ')}\n`;
    }

    // Add context data
    if (context?.marketData) {
      prompt += `\nMarket Context:\n${JSON.stringify(context.marketData, null, 2)}\n`;
    }

    if (context?.newsAnalysis) {
      prompt += `\nNews Analysis:\n${JSON.stringify(context.newsAnalysis, null, 2)}\n`;
    }

    // Add personalization context
    if (context?.personalizationContext) {
      prompt += `\nPersonalization Context:\n${JSON.stringify(context.personalizationContext, null, 2)}\n`;
    }

    // Add specific prompt/instructions
    if (request.prompt) {
      prompt += `\nSpecific Instructions:\n${request.prompt}\n`;
    }

    // Add keywords
    if (request.keywords?.length) {
      prompt += `\nInclude these keywords: ${request.keywords.join(', ')}\n`;
    }

    if (request.avoidKeywords?.length) {
      prompt += `\nAvoid these keywords: ${request.avoidKeywords.join(', ')}\n`;
    }

    // Add custom instructions
    if (request.customInstructions) {
      prompt += `\nCustom Instructions:\n${request.customInstructions}\n`;
    }

    // Final instructions
    prompt += `\nGenerate high-quality, engaging, and compliant financial content that meets all the above requirements.`;

    return prompt;
  }

  private async generateWithAI(
    model: string,
    prompt: string,
    request: ContentGenerationRequestDto,
  ): Promise<{ content: string; tokensUsed: number; cost: number }> {
    const params = request.generationParameters || {};
    
    switch (model) {
      case AIModel.OPENAI:
        return this.generateWithOpenAI(prompt, params);
      case AIModel.CLAUDE:
        return this.generateWithClaude(prompt, params);
      case AIModel.GEMINI:
        return this.generateWithGemini(prompt, params);
      default:
        throw new BadRequestException(`Unsupported AI model: ${model}`);
    }
  }

  private async generateWithOpenAI(
    prompt: string,
    params: any,
  ): Promise<{ content: string; tokensUsed: number; cost: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('ai.openai.model', 'gpt-4'),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: params.maxTokens || this.configService.get<number>('ai.openai.maxTokens', 2000),
        temperature: params.temperature || this.configService.get<number>('ai.openai.temperature', 0.7),
        top_p: params.topP || 1,
        frequency_penalty: params.frequencyPenalty || 0,
        presence_penalty: params.presencePenalty || 0,
      });

      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      const cost = this.calculateOpenAICost(tokensUsed);

      return { content, tokensUsed, cost };
    } catch (error) {
      this.logger.error('OpenAI generation failed', { error: error.message });
      throw new BadRequestException(`OpenAI generation failed: ${error.message}`);
    }
  }

  private async generateWithClaude(
    prompt: string,
    params: any,
  ): Promise<{ content: string; tokensUsed: number; cost: number }> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.configService.get<string>('ai.anthropic.model', 'claude-3-sonnet-20240229'),
        max_tokens: params.maxTokens || this.configService.get<number>('ai.anthropic.maxTokens', 2000),
        temperature: params.temperature || 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;
      const cost = this.calculateClaudeCost(tokensUsed);

      return { content, tokensUsed, cost };
    } catch (error) {
      this.logger.error('Claude generation failed', { error: error.message });
      throw new BadRequestException(`Claude generation failed: ${error.message}`);
    }
  }

  private async generateWithGemini(
    prompt: string,
    params: any,
  ): Promise<{ content: string; tokensUsed: number; cost: number }> {
    try {
      // Mock Gemini implementation - in production this would use Google AI Platform
      this.logger.debug('Using mock Gemini implementation');
      
      const mockContent = `# AI-Generated Financial Content

Based on your request, here's comprehensive financial analysis content generated using advanced AI models.

## Market Overview

The current market conditions present both opportunities and challenges for investors. Recent economic indicators suggest a cautious but optimistic outlook.

## Key Insights

1. **Market Sentiment**: Current sentiment reflects measured optimism with attention to economic fundamentals
2. **Sector Analysis**: Technology and healthcare sectors showing resilience
3. **Risk Assessment**: Moderate risk environment with emphasis on diversification

## Investment Considerations

- **Short-term**: Focus on quality assets with strong fundamentals
- **Medium-term**: Consider sector rotation opportunities
- **Long-term**: Maintain diversified portfolio approach

*This content is generated for informational purposes and should not be considered investment advice.*`;

      const estimatedTokens = Math.ceil(mockContent.length / 4); // Rough token estimate
      const cost = this.calculateGeminiCost(estimatedTokens);

      return {
        content: mockContent,
        tokensUsed: estimatedTokens,
        cost,
      };
    } catch (error) {
      this.logger.error('Gemini generation failed', { error: error.message });
      throw new BadRequestException(`Gemini generation failed: ${error.message}`);
    }
  }

  private calculateOpenAICost(tokens: number): number {
    // GPT-4 pricing (approximate)
    const inputCostPer1k = 0.03;
    const outputCostPer1k = 0.06;
    // Simplified calculation assuming 50/50 input/output
    return (tokens / 1000) * ((inputCostPer1k + outputCostPer1k) / 2);
  }

  private calculateClaudeCost(tokens: number): number {
    // Claude pricing (approximate)
    const inputCostPer1k = 0.015;
    const outputCostPer1k = 0.075;
    // Simplified calculation assuming 50/50 input/output
    return (tokens / 1000) * ((inputCostPer1k + outputCostPer1k) / 2);
  }

  private calculateGeminiCost(tokens: number): number {
    // Gemini pricing (approximate)
    const inputCostPer1k = 0.0025;
    const outputCostPer1k = 0.005;
    // Simplified calculation assuming 50/50 input/output
    return (tokens / 1000) * ((inputCostPer1k + outputCostPer1k) / 2);
  }

  private generateImprovementPrompt(
    originalPrompt: string,
    content: string,
    qualityScore: any,
  ): string {
    let improvementPrompt = originalPrompt;
    improvementPrompt += '\n\nPrevious attempt had quality issues:\n';
    improvementPrompt += `Quality Score: ${qualityScore.overallScore}/10\n`;
    
    if (qualityScore.improvements?.length) {
      improvementPrompt += `Improvements needed: ${qualityScore.improvements.join(', ')}\n`;
    }

    improvementPrompt += '\nPrevious content:\n' + content;
    improvementPrompt += '\n\nPlease generate improved content addressing the quality issues above.';

    return improvementPrompt;
  }

  private async applyComplianceCorrections(
    content: string,
    violations: any[],
    model: string,
    request: ContentGenerationRequestDto,
  ): Promise<string> {
    const correctionPrompt = `Please correct the following compliance violations in this financial content:

Violations:
${violations.map(v => `- ${v.description}: ${v.violationText}`).join('\n')}

Original Content:
${content}

Please provide the corrected content that addresses all compliance violations while maintaining the original message and quality.`;

    const correctedContent = await this.generateWithAI(model, correctionPrompt, request);
    return correctedContent.content;
  }

  private async generateSummary(content: string): Promise<string> {
    // Simple summary generation (could use AI for better summaries)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return content;
    
    return sentences.slice(0, 2).join('. ') + '.';
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private async updateTemplateStats(templateId: string, qualityScore: number): Promise<void> {
    try {
      await this.templateRepository.increment(
        { id: templateId },
        'usageCount',
        1,
      );

      // Update average quality score (simplified)
      const template = await this.templateRepository.findOne({
        where: { id: templateId },
      });

      if (template) {
        const currentAvg = template.averageQualityScore || 0;
        const count = template.usageCount;
        const newAvg = (currentAvg * (count - 1) + qualityScore) / count;
        
        await this.templateRepository.update(templateId, {
          averageQualityScore: Number(newAvg.toFixed(1)),
        });
      }
    } catch (error) {
      this.logger.warn('Failed to update template stats', { templateId, error: error.message });
    }
  }

  private mapToResponseDto(
    content: GeneratedContent,
    qualityScore: any,
  ): GeneratedContentResponseDto {
    return {
      id: content.id,
      content: content.finalContent,
      title: content.contentTitle,
      contentType: content.contentType as ContentType,
      contentCategory: content.contentCategory as any,
      wordCount: content.wordCount,
      aiModelUsed: content.aiModelUsed,
      generationTimeMs: content.generationTimeMs,
      tokensUsed: content.tokensUsed,
      generationCost: Number(content.generationCost),
      qualityScore: Number(content.qualityScore),
      readabilityScore: Number(content.readabilityScore),
      sentimentScore: Number(content.sentimentScore),
      complianceStatus: content.complianceStatus,
      complianceScore: Number(content.complianceScore),
      complianceViolations: content.complianceViolations,
      requiredDisclaimers: content.requiredDisclaimers,
      status: content.status,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
    };
  }

  /**
   * Generate content variations for A/B testing
   */
  async generateVariations(
    request: ContentGenerationRequestDto,
    userId: string,
    variationCount: number = 3,
  ): Promise<GeneratedContentResponseDto[]> {
    try {
      this.logger.log(`Generating ${variationCount} content variations`, {
        userId,
        contentType: request.contentType,
      });

      const variations: GeneratedContentResponseDto[] = [];
      const basePrompt = request.prompt;

      for (let i = 0; i < variationCount; i++) {
        // Modify the request slightly for each variation
        const variationRequest = {
          ...request,
          prompt: `${basePrompt}\n\nVariation ${i + 1}: Please provide a unique approach or angle while maintaining the core message.`,
          generationParameters: {
            ...request.generationParameters,
            temperature: (request.generationParameters?.temperature || 0.7) + (i * 0.1),
          },
        };

        const variation = await this.generateContent(variationRequest, userId);
        variations.push(variation);
      }

      this.logger.log(`Successfully generated ${variations.length} variations`);
      return variations;
    } catch (error) {
      this.logger.error('Failed to generate content variations', {
        error: error.message,
        userId,
        variationCount,
      });
      throw error;
    }
  }

  /**
   * Optimize content for specific platforms
   */
  async optimizeForPlatforms(
    contentId: string,
    platforms: string[],
    userId: string,
  ): Promise<Record<string, GeneratedContentResponseDto>> {
    try {
      const originalContent = await this.generatedContentRepository.findOne({
        where: { id: contentId, userId },
      });

      if (!originalContent) {
        throw new BadRequestException('Content not found or access denied');
      }

      const optimizedContent: Record<string, GeneratedContentResponseDto> = {};

      for (const platform of platforms) {
        const optimizationPrompt = this.buildPlatformOptimizationPrompt(
          originalContent.finalContent,
          platform,
        );

        const optimizationRequest: ContentGenerationRequestDto = {
          contentType: originalContent.contentType as ContentType,
          contentCategory: originalContent.contentCategory as any,
          title: `${originalContent.contentTitle} - ${platform} Optimized`,
          prompt: optimizationPrompt,
          aiModel: AIModel.AUTO,
          targetPlatforms: [platform],
          personalization: originalContent.targetAudience as any,
        };

        const optimized = await this.generateContent(optimizationRequest, userId);
        optimizedContent[platform] = optimized;
      }

      this.logger.log('Platform optimization completed', {
        contentId,
        platforms,
        optimizedCount: Object.keys(optimizedContent).length,
      });

      return optimizedContent;
    } catch (error) {
      this.logger.error('Platform optimization failed', {
        error: error.message,
        contentId,
        platforms,
      });
      throw error;
    }
  }

  private buildPlatformOptimizationPrompt(content: string, platform: string): string {
    const platformSpecs: Record<string, string> = {
      twitter: 'Optimize for Twitter: Keep concise (under 280 characters), use engaging hooks, include relevant hashtags, and maintain conversational tone.',
      linkedin: 'Optimize for LinkedIn: Professional tone, thought leadership angle, include industry insights, use paragraph breaks for readability.',
      facebook: 'Optimize for Facebook: Engaging and conversational, encourage comments and shares, use storytelling elements.',
      instagram: 'Optimize for Instagram: Visual storytelling focus, engaging captions, strategic hashtag use, call-to-action oriented.',
      email: 'Optimize for Email: Clear subject line implications, scannable format, personalized tone, strong call-to-action.',
      blog: 'Optimize for Blog: SEO-friendly structure, detailed explanations, subheadings, internal linking opportunities.',
      youtube: 'Optimize for YouTube: Script format, hook in first 15 seconds, clear structure with timestamps, engagement cues.',
    };

    const spec = platformSpecs[platform.toLowerCase()] || 'Optimize for the specified platform while maintaining the core message and financial accuracy.';

    return `${spec}

Original Content:
${content}

Please provide an optimized version that maintains the original message while being perfectly suited for ${platform}.`;
  }

  /**
   * Get content performance analytics
   */
  async getContentAnalytics(
    userId: string,
    timeframe: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<{
    totalGenerated: number;
    averageQualityScore: number;
    averageComplianceScore: number;
    contentTypeBreakdown: Record<string, number>;
    modelUsageBreakdown: Record<string, number>;
    totalCost: number;
    totalTokens: number;
    trends: any;
  }> {
    try {
      const timeframeStart = this.getTimeframeStart(timeframe);
      
      const contents = await this.generatedContentRepository
        .createQueryBuilder('content')
        .where('content.userId = :userId', { userId })
        .andWhere('content.createdAt >= :start', { start: timeframeStart })
        .getMany();

      const analytics = {
        totalGenerated: contents.length,
        averageQualityScore: this.calculateAverage(contents.map(c => Number(c.qualityScore))),
        averageComplianceScore: this.calculateAverage(contents.map(c => Number(c.complianceScore))),
        contentTypeBreakdown: this.getContentTypeBreakdown(contents),
        modelUsageBreakdown: this.getModelUsageBreakdown(contents),
        totalCost: contents.reduce((sum, c) => sum + Number(c.generationCost), 0),
        totalTokens: contents.reduce((sum, c) => sum + c.tokensUsed, 0),
        trends: this.calculateTrends(contents, timeframe),
      };

      this.logger.log('Content analytics calculated', {
        userId,
        timeframe,
        totalGenerated: analytics.totalGenerated,
      });

      return analytics;
    } catch (error) {
      this.logger.error('Failed to calculate content analytics', {
        error: error.message,
        userId,
        timeframe,
      });
      throw error;
    }
  }

  private getTimeframeStart(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private getContentTypeBreakdown(contents: GeneratedContent[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    contents.forEach(content => {
      const type = content.contentType;
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return breakdown;
  }

  private getModelUsageBreakdown(contents: GeneratedContent[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    contents.forEach(content => {
      const model = content.aiModelUsed;
      breakdown[model] = (breakdown[model] || 0) + 1;
    });
    return breakdown;
  }

  private calculateTrends(contents: GeneratedContent[], timeframe: string): any {
    // Group contents by time periods
    const periods = this.groupContentsByPeriod(contents, timeframe);
    
    return {
      generationVolume: periods,
      qualityTrend: this.calculateQualityTrend(periods),
      costTrend: this.calculateCostTrend(periods),
    };
  }

  private groupContentsByPeriod(contents: GeneratedContent[], timeframe: string): Record<string, number> {
    const periods: Record<string, number> = {};
    
    contents.forEach(content => {
      const date = new Date(content.createdAt);
      let key: string;
      
      switch (timeframe) {
        case 'day':
          key = date.getHours().toString();
          break;
        case 'week':
          key = date.toLocaleDateString();
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          break;
        case 'year':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toLocaleDateString();
      }
      
      periods[key] = (periods[key] || 0) + 1;
    });
    
    return periods;
  }

  private calculateQualityTrend(periods: Record<string, number>): Record<string, number> {
    // Simplified trend calculation - in production this would be more sophisticated
    const trend: Record<string, number> = {};
    Object.keys(periods).forEach(period => {
      trend[period] = Math.random() * 2 + 7; // Mock quality score between 7-9
    });
    return trend;
  }

  private calculateCostTrend(periods: Record<string, number>): Record<string, number> {
    // Simplified cost trend calculation
    const trend: Record<string, number> = {};
    Object.keys(periods).forEach(period => {
      trend[period] = periods[period] * (Math.random() * 0.5 + 0.1); // Mock cost calculation
    });
    return trend;
  }

  /**
   * Bulk content generation for high-volume scenarios
   */
  async generateBulkContent(
    requests: ContentGenerationRequestDto[],
    userId: string,
    priority: number = 5,
  ): Promise<{
    batchId: string;
    totalRequests: number;
    estimatedCompletionTime: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
  }> {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.logger.log('Starting bulk content generation', {
        batchId,
        userId,
        requestCount: requests.length,
        priority,
      });

      // In production, this would use a queue system like Bull/Redis
      // For now, we'll process sequentially with delays to simulate queue behavior
      const estimatedTimePerRequest = 30000; // 30 seconds per request
      const estimatedCompletionTime = requests.length * estimatedTimePerRequest;

      // Emit event to start background processing
      this.eventEmitter.emit('content.bulk.started', {
        batchId,
        userId,
        requests,
        priority,
      });

      // Process in background (simplified implementation)
      setImmediate(async () => {
        try {
          for (const request of requests) {
            await this.generateContent(request, userId);
            // Add small delay to simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          this.eventEmitter.emit('content.bulk.completed', {
            batchId,
            userId,
            totalGenerated: requests.length,
          });
        } catch (error) {
          this.eventEmitter.emit('content.bulk.failed', {
            batchId,
            userId,
            error: error.message,
          });
        }
      });

      return {
        batchId,
        totalRequests: requests.length,
        estimatedCompletionTime,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error('Bulk content generation failed', {
        error: error.message,
        userId,
        requestCount: requests.length,
      });
      throw error;
    }
  }
}