import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as natural from 'natural';
import * as sentiment from 'sentiment';
import { ContentQualityHelpersService } from './content-quality-helpers.service';

export interface QualityFactors {
  clarity: number;
  accuracy: number;
  relevance: number;
  engagement: number;
  structure: number;
  grammar: number;
  tone: number;
  originality: number;
}

export interface QualityAssessment {
  overallScore: number;
  factors: QualityFactors;
  readabilityScore: number;
  sentimentScore: number;
  improvements: string[];
  strengths: string[];
  gradeLevel: string;
  wordCount: number;
  readingTime: number; // in minutes
  agentScores: {
    grammarAgent: number;
    factualAgent: number;
    engagementAgent: number;
    clarityAgent: number;
    complianceAgent: number;
  };
  confidenceScore: number;
  detailedAnalysis: {
    keywordDensity: Record<string, number>;
    entityRecognition: string[];
    topicRelevance: number;
    financialAccuracy: number;
  };
}

@Injectable()
export class ContentQualityService {
  private readonly logger = new Logger(ContentQualityService.name);
  private readonly openai: OpenAI;
  private readonly anthropic: Anthropic;
  private readonly sentimentAnalyzer: any;

  // Quality assessment agents
  private readonly agents = {
    grammar: 'Grammar and Language Agent',
    factual: 'Factual Accuracy Agent', 
    engagement: 'Engagement and Style Agent',
    clarity: 'Clarity and Structure Agent',
    compliance: 'Financial Compliance Agent',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly helpersService: ContentQualityHelpersService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('ai.openai.apiKey'),
    });

    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ai.anthropic.apiKey'),
    });

    this.sentimentAnalyzer = new sentiment();
  }

  async assessQuality(content: string, contentType: string): Promise<QualityAssessment> {
    try {
      this.logger.debug('Starting multi-agent quality assessment', {
        contentType,
        contentLength: content.length,
      });

      // Perform parallel multi-agent assessments
      const [
        agentScores,
        readabilityScore,
        sentimentScore,
        basicMetrics,
        detailedAnalysis,
      ] = await Promise.all([
        this.performMultiAgentAssessment(content, contentType),
        this.calculateReadabilityScore(content),
        this.analyzeSentimentAdvanced(content),
        this.calculateBasicMetrics(content),
        this.helpersService.performDetailedAnalysis(content, contentType),
      ]);

      // Combine all agent assessments into quality factors
      const factors = this.helpersService.combineAgentResults(agentScores);
      const overallScore = this.helpersService.calculateWeightedOverallScore(factors, agentScores);
      const confidenceScore = this.helpersService.calculateConfidenceScore(agentScores);

      const assessment: QualityAssessment = {
        overallScore,
        factors,
        readabilityScore,
        sentimentScore,
        improvements: await this.helpersService.generateImprovementsFromAgents(agentScores, content),
        strengths: await this.helpersService.generateStrengthsFromAgents(agentScores, content),
        gradeLevel: this.calculateGradeLevel(readabilityScore),
        wordCount: basicMetrics.wordCount,
        readingTime: basicMetrics.readingTime,
        agentScores,
        confidenceScore,
        detailedAnalysis,
      };

      this.logger.debug('Multi-agent quality assessment completed', {
        overallScore: assessment.overallScore,
        confidenceScore: assessment.confidenceScore,
        agentScores: Object.keys(agentScores).length,
        wordCount: assessment.wordCount,
      });

      return assessment;
    } catch (error) {
      this.logger.error('Multi-agent quality assessment failed', {
        error: error.message,
        contentType,
      });

      // Return enhanced default assessment
      return this.helpersService.getEnhancedDefaultAssessment(content);
    }
  }

  /**
   * Perform multi-agent quality assessment using specialized AI agents
   */
  private async performMultiAgentAssessment(
    content: string,
    contentType: string,
  ): Promise<QualityAssessment['agentScores']> {
    try {
      // Run all agents in parallel for efficiency
      const [
        grammarScore,
        factualScore,
        engagementScore,
        clarityScore,
        complianceScore,
      ] = await Promise.all([
        this.runGrammarAgent(content),
        this.runFactualAccuracyAgent(content, contentType),
        this.runEngagementAgent(content, contentType),
        this.runClarityAgent(content),
        this.runComplianceAgent(content, contentType),
      ]);

      return {
        grammarAgent: grammarScore,
        factualAgent: factualScore,
        engagementAgent: engagementScore,
        clarityAgent: clarityScore,
        complianceAgent: complianceScore,
      };
    } catch (error) {
      this.logger.warn('Some agents failed during assessment', { error: error.message });
      
      // Return fallback scores
      return {
        grammarAgent: 5.0,
        factualAgent: 5.0,
        engagementAgent: 5.0,
        clarityAgent: 5.0,
        complianceAgent: 5.0,
      };
    }
  }

  /**
   * Grammar and Language Quality Agent
   */
  private async runGrammarAgent(content: string): Promise<number> {
    try {
      const prompt = `You are a Grammar and Language Quality Agent. Analyze the following content for:
1. Grammar and syntax correctness
2. Spelling and word usage
3. Sentence structure and flow
4. Professional language standards
5. Consistency in style and tone

Content to analyze:
${content}

Provide a score from 1-10 where:
- 1-3: Poor grammar with many errors
- 4-6: Acceptable with some issues
- 7-8: Good grammar with minor issues
- 9-10: Excellent grammar and language

Return only a single number score.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const score = parseFloat(response.choices[0]?.message?.content?.trim() || '5');
      return Math.max(1, Math.min(10, score));
    } catch (error) {
      this.logger.warn('Grammar agent failed', { error: error.message });
      return 5.0;
    }
  }

  /**
   * Factual Accuracy Agent
   */
  private async runFactualAccuracyAgent(content: string, contentType: string): Promise<number> {
    try {
      const prompt = `You are a Factual Accuracy Agent specializing in financial content. Analyze the following ${contentType} for:
1. Factual accuracy of financial information
2. Proper use of financial terminology
3. Logical consistency of statements
4. Currency, dates, and numerical accuracy
5. Industry standard compliance

Content to analyze:
${content}

Provide a score from 1-10 where:
- 1-3: Contains significant factual errors
- 4-6: Generally accurate with some concerns
- 7-8: Factually sound with minor issues
- 9-10: Highly accurate and well-researched

Return only a single number score.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }],
      });

      const content_text = response.content[0]?.type === 'text' ? response.content[0].text : '5';
      const score = parseFloat(content_text.trim());
      return Math.max(1, Math.min(10, score));
    } catch (error) {
      this.logger.warn('Factual accuracy agent failed', { error: error.message });
      return 5.0;
    }
  }

  /**
   * Engagement and Style Agent
   */
  private async runEngagementAgent(content: string, contentType: string): Promise<number> {
    try {
      const prompt = `You are an Engagement and Style Agent. Analyze the following ${contentType} for:
1. Reader engagement and interest level
2. Appropriate tone for the content type
3. Use of compelling language and examples
4. Call-to-action effectiveness (if applicable)
5. Overall persuasiveness and impact

Content to analyze:
${content}

Provide a score from 1-10 where:
- 1-3: Dry, unengaging content
- 4-6: Moderately engaging
- 7-8: Engaging and interesting
- 9-10: Highly compelling and engaging

Return only a single number score.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const score = parseFloat(response.choices[0]?.message?.content?.trim() || '5');
      return Math.max(1, Math.min(10, score));
    } catch (error) {
      this.logger.warn('Engagement agent failed', { error: error.message });
      return 5.0;
    }
  }

  /**
   * Clarity and Structure Agent
   */
  private async runClarityAgent(content: string): Promise<number> {
    try {
      const prompt = `You are a Clarity and Structure Agent. Analyze the following content for:
1. Clear organization and logical flow
2. Proper use of headings and structure
3. Paragraph organization and transitions
4. Ease of understanding and comprehension
5. Information hierarchy and presentation

Content to analyze:
${content}

Provide a score from 1-10 where:
- 1-3: Confusing structure and poor clarity
- 4-6: Acceptable structure with some clarity issues
- 7-8: Well-structured and clear
- 9-10: Exceptionally clear and well-organized

Return only a single number score.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const score = parseFloat(response.choices[0]?.message?.content?.trim() || '5');
      return Math.max(1, Math.min(10, score));
    } catch (error) {
      this.logger.warn('Clarity agent failed', { error: error.message });
      return 5.0;
    }
  }

  /**
   * Financial Compliance Agent
   */
  private async runComplianceAgent(content: string, contentType: string): Promise<number> {
    try {
      const prompt = `You are a Financial Compliance Agent. Analyze the following ${contentType} for:
1. Appropriate disclaimers and risk warnings
2. Compliance with financial content regulations
3. Proper handling of investment advice language
4. Risk disclosure adequacy
5. Regulatory compliance indicators

Content to analyze:
${content}

Provide a score from 1-10 where:
- 1-3: Significant compliance concerns
- 4-6: Some compliance issues present
- 7-8: Generally compliant with minor concerns
- 9-10: Fully compliant and well-disclosed

Return only a single number score.`;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }],
      });

      const content_text = response.content[0]?.type === 'text' ? response.content[0].text : '5';
      const score = parseFloat(content_text.trim());
      return Math.max(1, Math.min(10, score));
    } catch (error) {
      this.logger.warn('Compliance agent failed', { error: error.message });
      return 5.0;
    }
  }

  private async performAIQualityAssessment(content: string, contentType: string): Promise<any> {
    const prompt = `As an expert content quality analyst, evaluate this ${contentType} content across multiple quality dimensions. 

Content to analyze:
${content}

Please provide a detailed assessment in JSON format with the following structure:
{
  "clarity": 1-10,
  "accuracy": 1-10,
  "relevance": 1-10,
  "engagement": 1-10,
  "structure": 1-10,
  "grammar": 1-10,
  "tone": 1-10,
  "originality": 1-10,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "reasoning": {
    "clarity": "explanation",
    "accuracy": "explanation",
    "relevance": "explanation",
    "engagement": "explanation",
    "structure": "explanation",
    "grammar": "explanation",
    "tone": "explanation",
    "originality": "explanation"
  }
}

Focus on financial content best practices and consider the target audience of financial professionals and investors.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.2,
    });

    const result = response.choices[0]?.message?.content || '{}';
    
    try {
      const cleaned = result.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (parseError) {
      this.logger.warn('Failed to parse AI quality assessment', { parseError: parseError.message });
      return this.getDefaultAIAssessment();
    }
  }

  private calculateReadabilityScore(content: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = this.countSentences(content);
    const words = this.countWords(content);
    const syllables = this.countSyllables(content);

    if (sentences === 0 || words === 0) return 0;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Convert to 1-10 scale
    return Math.max(1, Math.min(10, (fleschScore / 10)));
  }

  private countSentences(text: string): number {
    const sentences = text.match(/[.!?]+/g);
    return sentences ? sentences.length : 1;
  }

  private countWords(text: string): number {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g);
    if (!words) return 0;

    return words.reduce((total, word) => {
      // Simple syllable counting heuristic
      const vowelMatches = word.match(/[aeiouy]+/g);
      let syllables = vowelMatches ? vowelMatches.length : 1;
      
      // Adjust for common patterns
      if (word.endsWith('e')) syllables--;
      if (syllables === 0) syllables = 1;
      
      return total + syllables;
    }, 0);
  }

  /**
   * Advanced sentiment analysis using multiple approaches
   */
  private async analyzeSentimentAdvanced(content: string): Promise<number> {
    try {
      // Use both rule-based and AI-based sentiment analysis
      const [ruleBasedSentiment, aiSentiment] = await Promise.all([
        this.analyzeRuleBasedSentiment(content),
        this.analyzeAISentiment(content),
      ]);

      // Combine results with weighted average
      const combinedSentiment = (ruleBasedSentiment * 0.4) + (aiSentiment * 0.6);
      
      return Math.max(-1, Math.min(1, combinedSentiment));
    } catch (error) {
      this.logger.warn('Advanced sentiment analysis failed', { error: error.message });
      return 0;
    }
  }

  private async analyzeRuleBasedSentiment(content: string): Promise<number> {
    try {
      const result = this.sentimentAnalyzer.analyze(content);
      // Normalize score to -1 to 1 range
      return Math.max(-1, Math.min(1, result.score / Math.max(1, Math.abs(result.score) * 5)));
    } catch (error) {
      return 0;
    }
  }

  private async analyzeAISentiment(content: string): Promise<number> {
    try {
      const prompt = `Analyze the sentiment of this financial content. Consider:
1. Overall tone (positive, negative, neutral)
2. Market outlook implications
3. Emotional impact on readers
4. Professional confidence level

Content: ${content.substring(0, 1000)}...

Return only a number between -1 (very negative) and +1 (very positive), where 0 is neutral.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1,
      });

      const result = response.choices[0]?.message?.content || '0';
      const sentiment = parseFloat(result.trim());
      
      return isNaN(sentiment) ? 0 : Math.max(-1, Math.min(1, sentiment));
    } catch (error) {
      this.logger.warn('AI sentiment analysis failed', { error: error.message });
      return 0;
    }
  }

  private calculateBasicMetrics(content: string) {
    const wordCount = this.countWords(content);
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 WPM reading speed

    return {
      wordCount,
      readingTime,
    };
  }

  private parseQualityFactors(assessment: any): QualityFactors {
    return {
      clarity: this.ensureScore(assessment.clarity),
      accuracy: this.ensureScore(assessment.accuracy),
      relevance: this.ensureScore(assessment.relevance),
      engagement: this.ensureScore(assessment.engagement),
      structure: this.ensureScore(assessment.structure),
      grammar: this.ensureScore(assessment.grammar),
      tone: this.ensureScore(assessment.tone),
      originality: this.ensureScore(assessment.originality),
    };
  }

  private ensureScore(score: any): number {
    const num = typeof score === 'number' ? score : parseFloat(score);
    return isNaN(num) ? 5 : Math.max(1, Math.min(10, num));
  }

  private calculateOverallScore(factors: QualityFactors): number {
    // Weighted average of quality factors
    const weights = {
      clarity: 0.15,
      accuracy: 0.20,
      relevance: 0.15,
      engagement: 0.15,
      structure: 0.10,
      grammar: 0.10,
      tone: 0.10,
      originality: 0.05,
    };

    const weightedSum = Object.entries(factors).reduce((sum, [factor, score]) => {
      const weight = weights[factor as keyof QualityFactors] || 0;
      return sum + (score * weight);
    }, 0);

    return Math.round(weightedSum * 10) / 10; // Round to 1 decimal place
  }

  private extractImprovements(assessment: any): string[] {
    if (Array.isArray(assessment.improvements)) {
      return assessment.improvements.slice(0, 5); // Limit to top 5
    }
    
    // Generate default improvements based on low scores
    const improvements: string[] = [];
    if (assessment.clarity < 7) improvements.push('Improve clarity and remove jargon');
    if (assessment.engagement < 7) improvements.push('Add more engaging examples or stories');
    if (assessment.structure < 7) improvements.push('Better organize content with clear headings');
    if (assessment.grammar < 8) improvements.push('Review and fix grammar and punctuation');
    
    return improvements.length > 0 ? improvements : ['Content quality is generally good'];
  }

  private extractStrengths(assessment: any): string[] {
    if (Array.isArray(assessment.strengths)) {
      return assessment.strengths.slice(0, 5); // Limit to top 5
    }

    // Generate default strengths based on high scores
    const strengths: string[] = [];
    if (assessment.accuracy >= 8) strengths.push('Factually accurate information');
    if (assessment.clarity >= 8) strengths.push('Clear and understandable language');
    if (assessment.relevance >= 8) strengths.push('Highly relevant to target audience');
    if (assessment.tone >= 8) strengths.push('Professional and appropriate tone');
    
    return strengths.length > 0 ? strengths : ['Well-written content'];
  }

  private calculateGradeLevel(readabilityScore: number): string {
    if (readabilityScore >= 9) return 'Elementary (5th-6th grade)';
    if (readabilityScore >= 8) return 'Middle School (7th-8th grade)';
    if (readabilityScore >= 7) return 'High School (9th-12th grade)';
    if (readabilityScore >= 6) return 'College Level';
    if (readabilityScore >= 5) return 'Graduate Level';
    return 'Advanced Graduate Level';
  }

  private getDefaultAssessment(content: string): QualityAssessment {
    const wordCount = this.countWords(content);
    
    return {
      overallScore: 5.0,
      factors: {
        clarity: 5,
        accuracy: 5,
        relevance: 5,
        engagement: 5,
        structure: 5,
        grammar: 5,
        tone: 5,
        originality: 5,
      },
      readabilityScore: 5,
      sentimentScore: 0,
      improvements: ['Quality assessment unavailable - manual review recommended'],
      strengths: ['Content analysis incomplete'],
      gradeLevel: 'Unknown',
      wordCount,
      readingTime: Math.ceil(wordCount / 200),
    };
  }

  private getDefaultAIAssessment(): any {
    return {
      clarity: 5,
      accuracy: 5,
      relevance: 5,
      engagement: 5,
      structure: 5,
      grammar: 5,
      tone: 5,
      originality: 5,
      strengths: ['Assessment unavailable'],
      improvements: ['Manual review needed'],
    };
  }

  async compareContentQuality(content1: string, content2: string): Promise<{
    content1Score: number;
    content2Score: number;
    winner: 'content1' | 'content2' | 'tie';
    comparison: string;
  }> {
    try {
      const [assessment1, assessment2] = await Promise.all([
        this.assessQuality(content1, 'comparison'),
        this.assessQuality(content2, 'comparison'),
      ]);

      const winner = assessment1.overallScore > assessment2.overallScore + 0.2 ? 'content1' :
                    assessment2.overallScore > assessment1.overallScore + 0.2 ? 'content2' : 'tie';

      let comparison = '';
      if (winner === 'content1') {
        comparison = 'Content 1 has higher overall quality with better ' + 
          Object.entries(assessment1.factors)
            .filter(([key, score]) => score > (assessment2.factors as any)[key] + 1)
            .map(([key]) => key)
            .join(', ');
      } else if (winner === 'content2') {
        comparison = 'Content 2 has higher overall quality with better ' + 
          Object.entries(assessment2.factors)
            .filter(([key, score]) => score > (assessment1.factors as any)[key] + 1)
            .map(([key]) => key)
            .join(', ');
      } else {
        comparison = 'Both contents have similar quality scores';
      }

      return {
        content1Score: assessment1.overallScore,
        content2Score: assessment2.overallScore,
        winner,
        comparison,
      };
    } catch (error) {
      this.logger.error('Content comparison failed', { error: error.message });
      throw error;
    }
  }

  async suggestImprovements(content: string, targetScore: number = 8.5): Promise<string[]> {
    try {
      const assessment = await this.assessQuality(content, 'improvement');
      
      if (assessment.overallScore >= targetScore) {
        return ['Content already meets quality target'];
      }

      const suggestions: string[] = [];
      
      // Add specific suggestions based on factor scores
      Object.entries(assessment.factors).forEach(([factor, score]) => {
        if (score < targetScore - 1) {
          suggestions.push(this.getFactorSuggestion(factor, score));
        }
      });

      // Add general improvements from assessment
      suggestions.push(...assessment.improvements);

      return [...new Set(suggestions)]; // Remove duplicates
    } catch (error) {
      this.logger.error('Improvement suggestion failed', { error: error.message });
      return ['Manual review and improvement recommended'];
    }
  }

  private getFactorSuggestion(factor: string, score: number): string {
    const suggestions: Record<string, string> = {
      clarity: 'Simplify complex sentences and define technical terms clearly',
      accuracy: 'Verify all facts and figures with reliable sources',
      relevance: 'Focus more on topics directly relevant to your audience',
      engagement: 'Add compelling examples, stories, or interactive elements',
      structure: 'Improve organization with clear headings and logical flow',
      grammar: 'Proofread for grammar, punctuation, and spelling errors',
      tone: 'Adjust tone to be more appropriate for your target audience',
      originality: 'Add unique insights or perspectives to differentiate content',
    };

    return suggestions[factor] || `Improve ${factor} to enhance overall quality`;
  }

  /**
   * Real-time quality monitoring for live content editing
   */
  async monitorQualityRealTime(
    content: string,
    contentType: string,
    checkInterval: number = 5000,
  ): Promise<{
    currentScore: number;
    trendDirection: 'improving' | 'declining' | 'stable';
    suggestions: string[];
    keyIssues: string[];
  }> {
    try {
      // Perform lightweight quality check for real-time monitoring
      const quickAssessment = await this.performQuickQualityCheck(content, contentType);
      
      // Store historical scores for trend analysis (in production, use Redis/database)
      const trendDirection = this.calculateQualityTrend(quickAssessment.score);
      
      return {
        currentScore: quickAssessment.score,
        trendDirection,
        suggestions: quickAssessment.suggestions,
        keyIssues: quickAssessment.issues,
      };
    } catch (error) {
      this.logger.error('Real-time quality monitoring failed', { error: error.message });
      return {
        currentScore: 5.0,
        trendDirection: 'stable',
        suggestions: ['Unable to monitor quality in real-time'],
        keyIssues: ['Quality monitoring service unavailable'],
      };
    }
  }

  private async performQuickQualityCheck(content: string, contentType: string): Promise<{
    score: number;
    suggestions: string[];
    issues: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 7.0; // Start with good baseline

    // Quick rule-based checks
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount < 50) {
      issues.push('Content too short');
      suggestions.push('Expand content to at least 50 words');
      score -= 1.0;
    }

    // Check for basic financial disclaimers
    if (contentType === 'analysis' || contentType === 'report') {
      if (!/disclaimer|not investment advice|risk/i.test(content)) {
        issues.push('Missing financial disclaimers');
        suggestions.push('Add appropriate disclaimers and risk warnings');
        score -= 0.5;
      }
    }

    // Check readability
    const avgSentenceLength = content.split(/[.!?]+/).length > 0 ? 
      wordCount / content.split(/[.!?]+/).length : 0;
    if (avgSentenceLength > 25) {
      issues.push('Sentences too long');
      suggestions.push('Break up long sentences for better readability');
      score -= 0.3;
    }

    // Check for engagement elements
    const hasQuestions = /\?/.test(content);
    const hasActionWords = /\b(discover|learn|find|explore|consider)\b/i.test(content);
    if (!hasQuestions && !hasActionWords && contentType === 'post') {
      suggestions.push('Add engaging questions or action words');
      score -= 0.2;
    }

    return {
      score: Math.max(1, Math.min(10, score)),
      suggestions,
      issues,
    };
  }

  private calculateQualityTrend(currentScore: number): 'improving' | 'declining' | 'stable' {
    // Simplified trend calculation - in production, this would compare with historical data
    // For now, return stable as we don't have historical context
    return 'stable';
  }

  /**
   * Batch quality assessment for multiple content pieces
   */
  async assessQualityBatch(
    contentItems: Array<{ content: string; contentType: string; id: string }>,
  ): Promise<Array<{
    id: string;
    assessment: QualityAssessment;
    processingTime: number;
  }>> {
    try {
      this.logger.log(`Starting batch quality assessment for ${contentItems.length} items`);
      
      const results = await Promise.allSettled(
        contentItems.map(async (item) => {
          const startTime = Date.now();
          const assessment = await this.assessQuality(item.content, item.contentType);
          const processingTime = Date.now() - startTime;
          
          return {
            id: item.id,
            assessment,
            processingTime,
          };
        })
      );

      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      this.logger.log(`Batch assessment completed: ${successfulResults.length}/${contentItems.length} successful`);
      
      return successfulResults;
    } catch (error) {
      this.logger.error('Batch quality assessment failed', { error: error.message });
      return [];
    }
  }

  /**
   * Get quality analytics and insights
   */
  async getQualityAnalytics(
    assessments: QualityAssessment[],
  ): Promise<{
    averageScore: number;
    scoreDistribution: Record<string, number>;
    commonIssues: string[];
    topStrengths: string[];
    agentPerformance: Record<string, number>;
    recommendations: string[];
  }> {
    try {
      if (assessments.length === 0) {
        return {
          averageScore: 0,
          scoreDistribution: {},
          commonIssues: [],
          topStrengths: [],
          agentPerformance: {},
          recommendations: [],
        };
      }

      const averageScore = assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length;
      
      // Score distribution
      const scoreDistribution: Record<string, number> = {};
      assessments.forEach(assessment => {
        const range = this.getScoreRange(assessment.overallScore);
        scoreDistribution[range] = (scoreDistribution[range] || 0) + 1;
      });

      // Common issues and strengths
      const allImprovements = assessments.flatMap(a => a.improvements);
      const allStrengths = assessments.flatMap(a => a.strengths);
      
      const commonIssues = this.getMostCommon(allImprovements, 5);
      const topStrengths = this.getMostCommon(allStrengths, 5);

      // Agent performance
      const agentPerformance: Record<string, number> = {};
      Object.keys(assessments[0].agentScores).forEach(agent => {
        agentPerformance[agent] = assessments.reduce((sum, a) => 
          sum + a.agentScores[agent as keyof typeof a.agentScores], 0
        ) / assessments.length;
      });

      // Generate recommendations
      const recommendations = this.generateAnalyticsRecommendations(
        averageScore,
        commonIssues,
        agentPerformance,
      );

      return {
        averageScore,
        scoreDistribution,
        commonIssues,
        topStrengths,
        agentPerformance,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Quality analytics generation failed', { error: error.message });
      throw error;
    }
  }

  private getScoreRange(score: number): string {
    if (score >= 9) return 'Excellent (9-10)';
    if (score >= 7) return 'Good (7-8.9)';
    if (score >= 5) return 'Fair (5-6.9)';
    return 'Poor (1-4.9)';
  }

  private getMostCommon(items: string[], limit: number): string[] {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item]) => item);
  }

  private generateAnalyticsRecommendations(
    averageScore: number,
    commonIssues: string[],
    agentPerformance: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    if (averageScore < 6) {
      recommendations.push('Focus on improving overall content quality across all dimensions');
    }

    // Agent-specific recommendations
    Object.entries(agentPerformance).forEach(([agent, score]) => {
      if (score < 6) {
        const agentName = agent.replace('Agent', '');
        recommendations.push(`Improve ${agentName} quality through targeted training`);
      }
    });

    // Issue-specific recommendations
    if (commonIssues.includes('Improve grammar and sentence structure')) {
      recommendations.push('Implement grammar checking tools and writer training');
    }

    if (commonIssues.includes('Add appropriate disclaimers and risk warnings')) {
      recommendations.push('Create standard disclaimer templates for financial content');
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }
}