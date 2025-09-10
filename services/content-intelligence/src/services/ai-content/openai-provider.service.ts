import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AIContentProvider,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ValidationResult,
  ContentPerformanceMetrics,
  AIProvider,
  ContentContext,
  ContentType,
  ContentStyle,
  ContentTone,
  TargetAudience,
} from '../../interfaces/ai-content/ai-content.interface';

@Injectable()
export class OpenAIProviderService implements AIContentProvider {
  private readonly logger = new Logger(OpenAIProviderService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.openai.apiKey');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured, using mock responses');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || 'mock-key',
    });

    this.model = this.configService.get<string>('ai.openai.model', 'gpt-4');
    this.maxTokens = this.configService.get<number>('ai.openai.maxTokens', 2000);
    this.temperature = this.configService.get<number>('ai.openai.temperature', 0.7);
  }

  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Generating ${request.contentType} content with OpenAI`);

      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      let completion: OpenAI.Chat.Completions.ChatCompletion;

      if (this.configService.get<string>('ai.openai.apiKey')) {
        completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });
      } else {
        // Mock response for development
        completion = this.createMockCompletion(request);
      }

      const content = completion.choices[0]?.message?.content || '';
      const responseTime = Date.now() - startTime;

      // Parse structured content if available
      const parsedContent = this.parseStructuredContent(content);

      // Generate metadata
      const metadata = await this.generateMetadata(parsedContent.content, request);

      // Estimate performance
      const performance = await this.estimatePerformance(parsedContent.content, {
        targetAudience: request.targetAudience,
      });

      const response: ContentGenerationResponse = {
        id: this.generateId(),
        content: parsedContent.content,
        title: parsedContent.title,
        summary: parsedContent.summary,
        metadata,
        suggestions: await this.generateSuggestions(parsedContent.content, request),
        performance,
        generatedAt: new Date(),
        provider: {
          name: 'OpenAI',
          version: '1.0',
          model: this.model,
          maxTokens: this.maxTokens,
          temperature: this.temperature,
          responseTime,
          cost: this.calculateCost(completion.usage?.total_tokens || 0),
        },
      };

      this.logger.log(`Content generated successfully in ${responseTime}ms`);
      return response;
    } catch (error) {
      this.logger.error(`OpenAI content generation failed: ${error.message}`);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async validateContent(content: string): Promise<ValidationResult> {
    try {
      const systemPrompt = `You are a content validation expert. Analyze the provided content and return a JSON response with validation results.

Return format:
{
  "isValid": boolean,
  "errors": [{"type": string, "message": string, "severity": "low"|"medium"|"high"|"critical", "suggestion": string}],
  "warnings": [{"type": string, "message": string, "suggestion": string}],
  "suggestions": [string],
  "score": number (0-100)
}

Focus on:
- Content quality and clarity
- Grammar and spelling
- Factual accuracy (flag potential issues)
- Compliance concerns
- Readability
- SEO potential`;

      const userPrompt = `Please validate this content:\n\n${content}`;

      let completion: OpenAI.Chat.Completions.ChatCompletion;

      if (this.configService.get<string>('ai.openai.apiKey')) {
        completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });
      } else {
        // Mock validation
        return this.createMockValidation(content);
      }

      const responseText = completion.choices[0]?.message?.content || '{}';
      const validation = JSON.parse(responseText);

      return {
        isValid: validation.isValid || false,
        errors: validation.errors || [],
        warnings: validation.warnings || [],
        suggestions: validation.suggestions || [],
        score: validation.score || 0,
      };
    } catch (error) {
      this.logger.error(`Content validation failed: ${error.message}`);
      return {
        isValid: false,
        errors: [{ type: 'system', message: 'Validation service unavailable', severity: 'medium', suggestion: 'Try again later' }],
        warnings: [],
        suggestions: [],
        score: 0,
      };
    }
  }

  async suggestImprovements(content: string): Promise<string[]> {
    try {
      const systemPrompt = `You are a content improvement expert. Analyze the provided content and suggest specific improvements.

Provide 3-7 actionable suggestions that would improve:
- Clarity and readability
- Engagement and impact
- SEO optimization
- Professional quality
- Compliance considerations

Return only a JSON array of suggestion strings.`;

      const userPrompt = `Please suggest improvements for this content:\n\n${content}`;

      let completion: OpenAI.Chat.Completions.ChatCompletion;

      if (this.configService.get<string>('ai.openai.apiKey')) {
        completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.7,
        });
      } else {
        // Mock suggestions
        return this.createMockSuggestions(content);
      }

      const responseText = completion.choices[0]?.message?.content || '[]';
      const suggestions = JSON.parse(responseText);

      return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
      this.logger.error(`Suggestion generation failed: ${error.message}`);
      return ['Unable to generate suggestions at this time'];
    }
  }

  async estimatePerformance(content: string, context: ContentContext): Promise<ContentPerformanceMetrics> {
    // Implement basic performance estimation
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Basic readability score (simplified Flesch Reading Ease)
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (this.countSyllables(content) / wordCount))
    ));

    // Basic SEO score based on content structure
    const seoScore = this.calculateSEOScore(content);

    // Engagement prediction based on content characteristics
    const engagementPrediction = this.predictEngagement(content, context);

    return {
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      complianceScore: 85, // Default compliance score, would be enhanced with actual compliance checking
      engagementPrediction: Math.round(engagementPrediction),
      viralityScore: Math.round(engagementPrediction * 0.7), // Estimated based on engagement
      conversionPotential: Math.round(engagementPrediction * 0.8), // Estimated based on engagement
    };
  }

  getProviderInfo(): AIProvider {
    return {
      name: 'OpenAI',
      version: '1.0',
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      responseTime: 0, // Will be set during actual calls
    };
  }

  private buildSystemPrompt(request: ContentGenerationRequest): string {
    const styleInstructions = this.getStyleInstructions(request.style);
    const toneInstructions = this.getToneInstructions(request.tone);
    const audienceInstructions = this.getAudienceInstructions(request.targetAudience);

    return `You are an expert financial content writer specializing in ${request.contentType} content.

STYLE: ${styleInstructions}
TONE: ${toneInstructions}
AUDIENCE: ${audienceInstructions}

Content Requirements:
- Type: ${request.contentType}
- ${request.minLength ? `Minimum ${request.minLength} words` : ''}
- ${request.maxLength ? `Maximum ${request.maxLength} words` : ''}
- ${request.includeSources ? 'Include credible source citations' : 'No source citations required'}

${request.marketData ? this.formatMarketDataContext(request.marketData) : ''}

Return your response in this JSON format:
{
  "title": "Compelling title for the content",
  "content": "The main content body",
  "summary": "Brief summary of key points"
}

Ensure all content is accurate, compliant with financial regulations, and appropriate for the target audience.`;
  }

  private buildUserPrompt(request: ContentGenerationRequest): string {
    let prompt = request.prompt;

    if (request.personalizations && request.personalizations.length > 0) {
      const personalization = request.personalizations[0]; // Use first personalization for now
      if (personalization.preferences) {
        prompt += `\n\nPersonalization preferences:
- Complexity level: ${personalization.preferences.complexityLevel}
- Preferred language: ${personalization.preferences.languagePreference}`;
      }
      if (personalization.riskProfile) {
        prompt += `\n- Risk profile: ${personalization.riskProfile}`;
      }
    }

    return prompt;
  }

  private getStyleInstructions(style: ContentStyle): string {
    const styleMap = {
      [ContentStyle.PROFESSIONAL]: 'Write in a formal, business-appropriate style with industry terminology',
      [ContentStyle.CASUAL]: 'Use a relaxed, conversational tone while maintaining credibility',
      [ContentStyle.EDUCATIONAL]: 'Focus on explaining concepts clearly with examples and definitions',
      [ContentStyle.URGENT]: 'Convey immediacy and importance with clear calls to action',
      [ContentStyle.ANALYTICAL]: 'Use data-driven language with logical structure and evidence',
      [ContentStyle.NARRATIVE]: 'Tell a story with engaging flow and human interest elements',
      [ContentStyle.TECHNICAL]: 'Use precise terminology and detailed explanations',
      [ContentStyle.CONVERSATIONAL]: 'Write as if speaking directly to the reader',
      [ContentStyle.FORMAL]: 'Maintain strict professional standards and official language',
      [ContentStyle.CREATIVE]: 'Use innovative approaches while remaining factually accurate',
    };
    return styleMap[style] || 'Write in a professional, clear style';
  }

  private getToneInstructions(tone: ContentTone): string {
    const toneMap = {
      [ContentTone.NEUTRAL]: 'Maintain objectivity and balanced perspective',
      [ContentTone.OPTIMISTIC]: 'Emphasize positive aspects while remaining realistic',
      [ContentTone.CAUTIOUS]: 'Highlight risks and encourage careful consideration',
      [ContentTone.CONFIDENT]: 'Express certainty in facts and recommendations',
      [ContentTone.URGENT]: 'Convey time-sensitivity and importance of action',
      [ContentTone.FRIENDLY]: 'Be warm and approachable while maintaining professionalism',
      [ContentTone.AUTHORITATIVE]: 'Demonstrate expertise and command of the subject',
      [ContentTone.EMPATHETIC]: 'Show understanding of reader concerns and situations',
      [ContentTone.ANALYTICAL]: 'Focus on facts, data, and logical reasoning',
      [ContentTone.MOTIVATIONAL]: 'Inspire action and confidence in the reader',
    };
    return toneMap[tone] || 'Use a balanced, professional tone';
  }

  private getAudienceInstructions(audience: TargetAudience): string {
    const audienceMap = {
      [TargetAudience.RETAIL_INVESTORS]: 'Write for individual investors with varying experience levels',
      [TargetAudience.INSTITUTIONAL_INVESTORS]: 'Address professional fund managers and institutional decision-makers',
      [TargetAudience.DAY_TRADERS]: 'Focus on short-term opportunities and technical analysis',
      [TargetAudience.LONG_TERM_INVESTORS]: 'Emphasize fundamental analysis and long-term strategy',
      [TargetAudience.FINANCIAL_ADVISORS]: 'Provide insights useful for client advisory services',
      [TargetAudience.BEGINNERS]: 'Explain concepts clearly with minimal jargon and helpful context',
      [TargetAudience.ADVANCED]: 'Use sophisticated analysis and assume deep market knowledge',
      [TargetAudience.GENERAL_PUBLIC]: 'Make financial concepts accessible to non-investors',
      [TargetAudience.INDUSTRY_PROFESSIONALS]: 'Address those working in financial services',
      [TargetAudience.MEDIA]: 'Provide quotable insights suitable for journalism',
    };
    return audienceMap[audience] || 'Write for a general professional audience';
  }

  private formatMarketDataContext(marketData: any): string {
    let context = '\nMarket Data Context:\n';
    if (marketData.symbols) {
      context += `- Focus symbols: ${marketData.symbols.join(', ')}\n`;
    }
    if (marketData.marketEvents) {
      context += `- Market events: ${marketData.marketEvents.join(', ')}\n`;
    }
    if (marketData.timeframe) {
      context += `- Timeframe: ${marketData.timeframe}\n`;
    }
    return context;
  }

  private parseStructuredContent(content: string): { content: string; title?: string; summary?: string } {
    try {
      const parsed = JSON.parse(content);
      return {
        content: parsed.content || content,
        title: parsed.title,
        summary: parsed.summary,
      };
    } catch {
      // If not JSON, treat as plain content
      return { content };
    }
  }

  private async generateMetadata(content: string, request: ContentGenerationRequest) {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const readingTime = Math.ceil(words.length / 200); // 200 words per minute

    // Extract basic keywords (simplified)
    const keywords = this.extractKeywords(content);

    return {
      wordCount: words.length,
      readingTime,
      contentType: request.contentType,
      style: request.style,
      tone: request.tone,
      targetAudience: request.targetAudience,
      confidence: 0.85, // Default confidence
      relevanceScore: 0.9, // Default relevance
      keywords,
    };
  }

  private async generateSuggestions(content: string, request: ContentGenerationRequest): Promise<string[]> {
    // Basic suggestions based on content analysis
    const suggestions: string[] = [];
    
    if (content.length < 100) {
      suggestions.push('Consider expanding the content for better engagement');
    }
    
    if (!content.includes('?')) {
      suggestions.push('Add rhetorical questions to increase reader engagement');
    }
    
    if (request.includeSources && !content.includes('source') && !content.includes('according to')) {
      suggestions.push('Include credible source citations to enhance credibility');
    }

    return suggestions;
  }

  private extractKeywords(content: string): string[] {
    // Simplified keyword extraction
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiouy]+/g, 'a')
      .length;
  }

  private calculateSEOScore(content: string): number {
    let score = 50; // Base score

    // Check for headings (simplified)
    if (content.includes('#') || content.includes('**')) score += 10;
    
    // Check length
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 2000) score += 15;
    
    // Check for lists
    if (content.includes('- ') || content.includes('1.')) score += 10;
    
    // Check for questions
    if (content.includes('?')) score += 5;

    return Math.min(100, score);
  }

  private predictEngagement(content: string, context: ContentContext): number {
    let score = 50; // Base score

    const wordCount = content.split(/\s+/).length;
    
    // Optimal length for engagement
    if (wordCount >= 300 && wordCount <= 1200) score += 20;
    else if (wordCount < 100) score -= 20;
    
    // Question marks increase engagement
    const questionMarks = (content.match(/\?/g) || []).length;
    score += Math.min(questionMarks * 5, 15);
    
    // Audience-specific adjustments
    if (context.targetAudience === TargetAudience.BEGINNERS && content.includes('example')) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateCost(tokens: number): number {
    // Approximate cost calculation for GPT-4 (as of 2024)
    const costPer1KTokens = 0.03; // $0.03 per 1K tokens
    return (tokens / 1000) * costPer1KTokens;
  }

  private generateId(): string {
    return `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createMockCompletion(request: ContentGenerationRequest): OpenAI.Chat.Completions.ChatCompletion {
    const mockContent = this.generateMockContent(request);
    
    return {
      id: 'mock_completion',
      object: 'chat.completion',
      created: Date.now(),
      model: this.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: JSON.stringify(mockContent),
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    };
  }

  private generateMockContent(request: ContentGenerationRequest): any {
    const mockTitles = {
      [ContentType.MARKET_ANALYSIS]: 'Market Analysis: Key Trends and Opportunities',
      [ContentType.ARTICLE]: 'Financial Insights: What You Need to Know',
      [ContentType.NEWSLETTER]: 'Weekly Market Update',
      [ContentType.BLOG_POST]: 'Understanding Market Dynamics',
    };

    const mockContent = `This is a mock ${request.contentType} generated for testing purposes. 
    
The content demonstrates the ${request.style} style with a ${request.tone} tone, specifically tailored for ${request.targetAudience}.

Key points covered:
• Market overview and current conditions
• Analysis of relevant trends
• Actionable insights and recommendations
• Risk considerations and opportunities

This mock content would typically be much longer and more detailed in a production environment, with real market data, analysis, and insights from the AI provider.

Please note: This is generated mock content for development and testing purposes only.`;

    return {
      title: mockTitles[request.contentType] || 'Financial Content',
      content: mockContent,
      summary: 'A comprehensive analysis providing key insights and actionable recommendations for the target audience.',
    };
  }

  private createMockValidation(content: string): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [
        'Consider adding more specific examples',
        'Include current market data for better relevance',
        'Add a compelling call-to-action'
      ],
      score: 85,
    };
  }

  private createMockSuggestions(content: string): string[] {
    return [
      'Add more specific market data to support key points',
      'Include relevant charts or graphs for visual appeal',
      'Consider adding a FAQ section for common questions',
      'Improve SEO by adding more targeted keywords',
      'Add social proof or expert quotes to enhance credibility'
    ];
  }
}