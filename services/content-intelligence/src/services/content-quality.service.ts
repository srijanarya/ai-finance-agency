import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

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
}

@Injectable()
export class ContentQualityService {
  private readonly logger = new Logger(ContentQualityService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('ai.openai.apiKey'),
    });
  }

  async assessQuality(content: string, contentType: string): Promise<QualityAssessment> {
    try {
      this.logger.debug('Starting quality assessment', {
        contentType,
        contentLength: content.length,
      });

      // Perform parallel assessments
      const [
        aiAssessment,
        readabilityScore,
        sentimentScore,
        basicMetrics,
      ] = await Promise.all([
        this.performAIQualityAssessment(content, contentType),
        this.calculateReadabilityScore(content),
        this.analyzeSentiment(content),
        this.calculateBasicMetrics(content),
      ]);

      const factors = this.parseQualityFactors(aiAssessment);
      const overallScore = this.calculateOverallScore(factors);

      const assessment: QualityAssessment = {
        overallScore,
        factors,
        readabilityScore,
        sentimentScore,
        improvements: this.extractImprovements(aiAssessment),
        strengths: this.extractStrengths(aiAssessment),
        gradeLevel: this.calculateGradeLevel(readabilityScore),
        wordCount: basicMetrics.wordCount,
        readingTime: basicMetrics.readingTime,
      };

      this.logger.debug('Quality assessment completed', {
        overallScore: assessment.overallScore,
        readabilityScore: assessment.readabilityScore,
        wordCount: assessment.wordCount,
      });

      return assessment;
    } catch (error) {
      this.logger.error('Quality assessment failed', {
        error: error.message,
        contentType,
      });

      // Return default assessment
      return this.getDefaultAssessment(content);
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

  private async analyzeSentiment(content: string): Promise<number> {
    try {
      const prompt = `Analyze the sentiment of this financial content. Return only a number between -1 (very negative) and +1 (very positive), where 0 is neutral.

Content: ${content.substring(0, 1000)}...`;

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
      this.logger.warn('Sentiment analysis failed', { error: error.message });
      return 0; // Neutral sentiment as fallback
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
}