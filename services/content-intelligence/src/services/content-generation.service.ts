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

    // Default selection based on content type
    switch (contentType) {
      case ContentType.ANALYSIS:
      case ContentType.REPORT:
        return AIModel.CLAUDE; // Best for complex analysis
      case ContentType.POST:
        return AIModel.GEMINI; // Good for creative social content
      default:
        return AIModel.OPENAI; // Best general-purpose model
    }
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
    // Placeholder for Google Gemini integration
    // This would require the Google AI Platform client
    throw new BadRequestException('Gemini integration not yet implemented');
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
}