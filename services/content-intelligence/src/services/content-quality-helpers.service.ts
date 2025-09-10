import { Injectable, Logger } from '@nestjs/common';
import * as natural from 'natural';

@Injectable()
export class ContentQualityHelpersService {
  private readonly logger = new Logger(ContentQualityHelpersService.name);

  /**
   * Perform detailed content analysis
   */
  async performDetailedAnalysis(content: string, contentType: string): Promise<{
    keywordDensity: Record<string, number>;
    entityRecognition: string[];
    topicRelevance: number;
    financialAccuracy: number;
  }> {
    try {
      const [
        keywordDensity,
        entities,
        topicRelevance,
        financialAccuracy,
      ] = await Promise.all([
        this.calculateKeywordDensity(content),
        this.extractEntities(content),
        this.assessTopicRelevance(content, contentType),
        this.assessFinancialAccuracy(content),
      ]);

      return {
        keywordDensity,
        entityRecognition: entities,
        topicRelevance,
        financialAccuracy,
      };
    } catch (error) {
      this.logger.error('Detailed analysis failed', { error: error.message });
      return {
        keywordDensity: {},
        entityRecognition: [],
        topicRelevance: 5.0,
        financialAccuracy: 5.0,
      };
    }
  }

  /**
   * Calculate keyword density for SEO and content optimization
   */
  private async calculateKeywordDensity(content: string): Promise<Record<string, number>> {
    try {
      const words = content.toLowerCase().match(/\b\w+\b/g) || [];
      const totalWords = words.length;
      
      if (totalWords === 0) return {};

      // Filter out common stop words
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
      
      const filteredWords = words.filter(word => 
        word.length > 3 && !stopWords.has(word)
      );

      // Count word frequency
      const wordCount: Record<string, number> = {};
      filteredWords.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });

      // Calculate density (percentage of total words)
      const density: Record<string, number> = {};
      Object.entries(wordCount).forEach(([word, count]) => {
        density[word] = (count / totalWords) * 100;
      });

      // Return top 20 keywords by density
      return Object.fromEntries(
        Object.entries(density)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20)
      );
    } catch (error) {
      this.logger.warn('Keyword density calculation failed', { error: error.message });
      return {};
    }
  }

  /**
   * Extract named entities from content
   */
  private async extractEntities(content: string): Promise<string[]> {
    try {
      // Use Natural NLP for basic entity extraction
      const tokenizer = new natural.WordTokenizer();
      const words = tokenizer.tokenize(content);
      
      if (!words) return [];

      // Simple rule-based entity recognition for financial content
      const entities: string[] = [];
      
      // Financial terms pattern matching
      const financialPatterns = [
        /\b[A-Z]{2,5}\b/g, // Stock symbols (2-5 uppercase letters)
        /\$[\d,]+\.?\d*/g, // Currency amounts
        /\b\d{1,2}[.,]\d{1,2}%/g, // Percentages
        /\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Company names (simplified)
      ];

      financialPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          entities.push(...matches);
        }
      });

      // Remove duplicates and return
      return [...new Set(entities)].slice(0, 50);
    } catch (error) {
      this.logger.warn('Entity extraction failed', { error: error.message });
      return [];
    }
  }

  /**
   * Assess topic relevance to financial content
   */
  private async assessTopicRelevance(content: string, contentType: string): Promise<number> {
    try {
      const financialTerms = [
        'investment', 'portfolio', 'stock', 'bond', 'market', 'finance', 'trading',
        'equity', 'dividend', 'roi', 'return', 'risk', 'asset', 'fund', 'etf',
        'mutual', 'cryptocurrency', 'bitcoin', 'blockchain', 'forex', 'currency',
        'inflation', 'interest', 'rate', 'federal', 'reserve', 'sec', 'finra',
        'regulation', 'compliance', 'earnings', 'revenue', 'profit', 'loss',
        'bull', 'bear', 'volatility', 'diversification', 'allocation', 'hedge'
      ];

      const words = content.toLowerCase().split(/\W+/);
      const financialWordCount = words.filter(word => 
        financialTerms.some(term => word.includes(term))
      ).length;

      const relevanceRatio = financialWordCount / Math.max(words.length, 1);
      
      // Convert to 1-10 scale
      return Math.min(10, Math.max(1, relevanceRatio * 50));
    } catch (error) {
      this.logger.warn('Topic relevance assessment failed', { error: error.message });
      return 5.0;
    }
  }

  /**
   * Assess financial accuracy indicators
   */
  private async assessFinancialAccuracy(content: string): Promise<number> {
    try {
      let score = 7.0; // Start with neutral-good score

      // Check for common financial accuracy indicators
      const hasDisclaimers = /disclaimer|not investment advice|consult|financial advisor|past performance/i.test(content);
      const hasRiskWarnings = /risk|loss|volatility|uncertain/i.test(content);
      const hasSourceAttribution = /source|data|report|according to/i.test(content);
      const hasCurrentDates = /202[3-5]|recent|current|latest/i.test(content);

      // Bonus points for good practices
      if (hasDisclaimers) score += 0.5;
      if (hasRiskWarnings) score += 0.5;
      if (hasSourceAttribution) score += 0.5;
      if (hasCurrentDates) score += 0.5;

      // Check for potential red flags
      const hasGuarantees = /guarantee|certain|always|never fails|risk-free/i.test(content);
      const hasExtremeLanguage = /amazing|incredible|unbelievable|secret|insider/i.test(content);
      
      // Penalty for red flags
      if (hasGuarantees) score -= 1.0;
      if (hasExtremeLanguage) score -= 0.5;

      return Math.max(1, Math.min(10, score));
    } catch (error) {
      this.logger.warn('Financial accuracy assessment failed', { error: error.message });
      return 5.0;
    }
  }

  /**
   * Combine agent results into quality factors
   */
  combineAgentResults(agentScores: any): any {
    return {
      clarity: (agentScores.clarityAgent + agentScores.grammarAgent) / 2,
      accuracy: agentScores.factualAgent,
      relevance: (agentScores.factualAgent + agentScores.complianceAgent) / 2,
      engagement: agentScores.engagementAgent,
      structure: agentScores.clarityAgent,
      grammar: agentScores.grammarAgent,
      tone: agentScores.engagementAgent,
      originality: (agentScores.engagementAgent + agentScores.clarityAgent) / 2,
    };
  }

  /**
   * Calculate weighted overall score from multiple agents
   */
  calculateWeightedOverallScore(factors: any, agentScores: any): number {
    // Weighted average considering agent specializations
    const weights = {
      grammarAgent: 0.15,
      factualAgent: 0.25,
      engagementAgent: 0.20,
      clarityAgent: 0.20,
      complianceAgent: 0.20,
    };

    const weightedSum = Object.entries(agentScores).reduce((sum, [agent, score]) => {
      const weight = weights[agent as keyof typeof weights] || 0;
      return sum + (score as number * weight);
    }, 0);

    return Math.round(weightedSum * 10) / 10;
  }

  /**
   * Calculate confidence score based on agent agreement
   */
  calculateConfidenceScore(agentScores: any): number {
    const scores = Object.values(agentScores) as number[];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Calculate standard deviation
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher confidence when agents agree (lower standard deviation)
    const maxStdDev = 3.0; // Maximum expected standard deviation
    const confidence = Math.max(0, Math.min(1, 1 - (stdDev / maxStdDev)));
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Generate improvements based on agent feedback
   */
  async generateImprovementsFromAgents(agentScores: any, content: string): Promise<string[]> {
    const improvements: string[] = [];

    // Grammar improvements
    if (agentScores.grammarAgent < 7) {
      improvements.push('Improve grammar and sentence structure');
      improvements.push('Check for spelling and punctuation errors');
    }

    // Factual accuracy improvements
    if (agentScores.factualAgent < 7) {
      improvements.push('Verify financial facts and figures');
      improvements.push('Add source citations for claims');
    }

    // Engagement improvements
    if (agentScores.engagementAgent < 7) {
      improvements.push('Use more engaging language and examples');
      improvements.push('Add compelling hooks and calls-to-action');
    }

    // Clarity improvements
    if (agentScores.clarityAgent < 7) {
      improvements.push('Improve content structure and organization');
      improvements.push('Use clearer headings and transitions');
    }

    // Compliance improvements
    if (agentScores.complianceAgent < 7) {
      improvements.push('Add appropriate disclaimers and risk warnings');
      improvements.push('Review regulatory compliance requirements');
    }

    return improvements.length > 0 ? improvements : ['Content quality is acceptable'];
  }

  /**
   * Generate strengths based on agent feedback
   */
  async generateStrengthsFromAgents(agentScores: any, content: string): Promise<string[]> {
    const strengths: string[] = [];

    // Identify strong areas
    if (agentScores.grammarAgent >= 8) {
      strengths.push('Excellent grammar and language quality');
    }

    if (agentScores.factualAgent >= 8) {
      strengths.push('Highly accurate financial information');
    }

    if (agentScores.engagementAgent >= 8) {
      strengths.push('Engaging and compelling writing style');
    }

    if (agentScores.clarityAgent >= 8) {
      strengths.push('Clear structure and easy to understand');
    }

    if (agentScores.complianceAgent >= 8) {
      strengths.push('Strong regulatory compliance');
    }

    return strengths.length > 0 ? strengths : ['Well-written content'];
  }

  /**
   * Enhanced default assessment for fallback scenarios
   */
  getEnhancedDefaultAssessment(content: string): any {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      overallScore: 6.0,
      factors: {
        clarity: 6,
        accuracy: 6,
        relevance: 6,
        engagement: 6,
        structure: 6,
        grammar: 6,
        tone: 6,
        originality: 6,
      },
      readabilityScore: 6,
      sentimentScore: 0,
      improvements: ['Quality assessment unavailable - manual review recommended'],
      strengths: ['Unable to analyze - system error'],
      gradeLevel: 'College Level',
      wordCount,
      readingTime: Math.ceil(wordCount / 200),
      agentScores: {
        grammarAgent: 6.0,
        factualAgent: 6.0,
        engagementAgent: 6.0,
        clarityAgent: 6.0,
        complianceAgent: 6.0,
      },
      confidenceScore: 0.5,
      detailedAnalysis: {
        keywordDensity: {},
        entityRecognition: [],
        topicRelevance: 5.0,
        financialAccuracy: 5.0,
      },
    };
  }
}