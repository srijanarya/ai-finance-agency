/**
 * Content Scoring Service
 * 
 * Comprehensive content quality and relevance scoring system that evaluates:
 * - Content relevance to financial markets and user interests
 * - Source credibility and authority assessment
 * - Timeliness and market impact scoring
 * - Content quality metrics (readability, structure, depth)
 * - Engagement potential and viral probability
 * 
 * Uses machine learning algorithms, NLP analysis, and market data
 * to provide actionable scoring with detailed breakdown and recommendations
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as nlp from 'compromise';
import {
  ContentScoringResult,
  ScoreBreakdown,
  NLPProcessingResult,
  MarketInsightResult
} from '../interfaces/nlp.interface';
import { NlpProcessingService } from './nlp-processing.service';
import { MarketInsightService } from './market-insight.service';

interface ScoringOptions {
  targetAudience?: 'retail' | 'institutional' | 'professional' | 'general';
  contentType?: 'news' | 'analysis' | 'opinion' | 'research' | 'social';
  urgency?: 'low' | 'medium' | 'high' | 'breaking';
  marketFocus?: string[]; // Specific symbols or sectors to focus on
  useAIScoring?: boolean;
}

interface SourceCredibility {
  domain: string;
  authorityScore: number;
  reputationScore: number;
  expertiseScore: number;
  biasScore: number;
  lastUpdated: Date;
}

interface ContentMetrics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  readabilityScore: number;
  complexityScore: number;
  structureScore: number;
  clarityScore: number;
}

interface MarketRelevance {
  symbolRelevance: Record<string, number>;
  sectorRelevance: Record<string, number>;
  themeRelevance: Record<string, number>;
  timeRelevance: number;
  impactScore: number;
}

@Injectable()
export class ContentScoringService {
  private readonly logger = new Logger(ContentScoringService.name);
  private readonly redis: Redis;

  // Source credibility database (would be populated from external sources)
  private readonly sourceCredibilityMap = new Map<string, SourceCredibility>();

  // Financial relevance keywords with weights
  private readonly financialKeywords = new Map([
    // Market movements
    ['earnings', 2.0], ['revenue', 1.8], ['profit', 1.8], ['loss', 1.5],
    ['dividend', 1.7], ['yield', 1.6], ['volatility', 1.4], ['volume', 1.3],
    
    // Analysis terms
    ['bullish', 1.9], ['bearish', 1.9], ['rally', 1.6], ['correction', 1.5],
    ['breakout', 1.7], ['support', 1.4], ['resistance', 1.4], ['trend', 1.3],
    
    // Corporate actions
    ['merger', 2.2], ['acquisition', 2.1], ['ipo', 2.0], ['buyback', 1.8],
    ['split', 1.6], ['spinoff', 1.7], ['restructuring', 1.5],
    
    // Economic indicators
    ['inflation', 1.8], ['gdp', 1.7], ['unemployment', 1.6], ['fed', 2.0],
    ['interest rate', 2.1], ['quantitative easing', 1.9],
    
    // Risk factors
    ['risk', 1.3], ['uncertainty', 1.2], ['volatility', 1.4], ['crisis', 1.8],
    ['recession', 1.9], ['bear market', 2.0], ['bubble', 1.7]
  ]);

  // Content quality indicators
  private readonly qualityIndicators = {
    positive: ['analysis', 'research', 'data', 'statistics', 'evidence', 'study', 'report'],
    negative: ['rumor', 'speculation', 'unconfirmed', 'allegedly', 'reportedly'],
    structure: ['introduction', 'conclusion', 'summary', 'key points', 'analysis', 'methodology'],
    depth: ['because', 'therefore', 'however', 'moreover', 'furthermore', 'nevertheless']
  };

  // Engagement patterns
  private readonly engagementIndicators = {
    viral: ['breaking', 'exclusive', 'shocking', 'unprecedented', 'major', 'significant'],
    controversial: ['controversial', 'disputed', 'disagreement', 'criticism', 'debate'],
    actionable: ['buy', 'sell', 'hold', 'recommendation', 'target', 'action', 'strategy'],
    timely: ['today', 'now', 'immediate', 'urgent', 'breaking', 'latest', 'developing']
  };

  constructor(
    private configService: ConfigService,
    private nlpService: NlpProcessingService,
    private marketInsightService: MarketInsightService,
  ) {
    // Initialize Redis connection
    this.redis = new Redis({
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
      password: this.configService.get<string>('redis.password'),
      keyPrefix: 'content-scoring:'
    });

    this.initializeSourceCredibility();
  }

  /**
   * Main content scoring method
   */
  async scoreContent(
    content: string,
    source?: string,
    options: ScoringOptions = {}
  ): Promise<ContentScoringResult> {
    const startTime = Date.now();

    try {
      // Perform comprehensive NLP analysis
      const nlpResult = await this.nlpService.processText(content, {
        enableSentimentAnalysis: true,
        enableEntityExtraction: true,
        enableKeyPhraseExtraction: true,
        enableTextSummarization: true,
        useAdvancedNLP: options.useAIScoring
      });

      // Extract market insights
      const marketInsights = await this.marketInsightService.extractInsights(content, {
        useAIAnalysis: options.useAIScoring,
        confidenceThreshold: 0.5
      });

      // Calculate individual score components
      const [
        relevanceScore,
        credibilityScore,
        timelinessScore,
        impactScore,
        qualityScore,
        breakdown
      ] = await Promise.all([
        this.calculateRelevanceScore(nlpResult, marketInsights, options),
        this.calculateCredibilityScore(source, content, nlpResult),
        this.calculateTimelinessScore(content, nlpResult, options),
        this.calculateImpactScore(marketInsights, nlpResult, options),
        this.calculateQualityScore(content, nlpResult),
        this.generateScoreBreakdown(content, source, nlpResult, marketInsights)
      ]);

      // Calculate weighted overall score
      const weights = this.getScoreWeights(options);
      const overallScore = Math.round(
        (relevanceScore * weights.relevance) +
        (credibilityScore * weights.credibility) +
        (timelinessScore * weights.timeliness) +
        (impactScore * weights.impact) +
        (qualityScore * weights.quality)
      );

      // Generate recommendation
      const recommendation = this.generateRecommendation(overallScore, breakdown);
      const reasons = this.generateScoringReasons(overallScore, breakdown);
      const improvementSuggestions = this.generateImprovementSuggestions(breakdown);

      const result: ContentScoringResult = {
        overallScore,
        relevanceScore,
        credibilityScore,
        timelinessScore,
        impactScore,
        qualityScore,
        breakdown,
        recommendation,
        reasons,
        improvementSuggestions
      };

      // Cache result for performance
      await this.cacheResult(content, result);

      this.logger.debug(`Content scored in ${Date.now() - startTime}ms: ${overallScore}/100`);
      return result;

    } catch (error) {
      this.logger.error('Content scoring failed:', error);
      throw new Error(`Content scoring failed: ${error.message}`);
    }
  }

  /**
   * Calculate content relevance score based on financial keywords and market context
   */
  private async calculateRelevanceScore(
    nlpResult: NLPProcessingResult,
    marketInsights: MarketInsightResult,
    options: ScoringOptions
  ): Promise<number> {
    try {
      let relevanceScore = 0;

      // Base relevance from financial keywords
      const keywordRelevance = this.calculateKeywordRelevance(nlpResult);
      relevanceScore += keywordRelevance * 0.3;

      // Entity relevance (stocks, companies, financial instruments)
      const entityRelevance = this.calculateEntityRelevance(nlpResult, options);
      relevanceScore += entityRelevance * 0.25;

      // Market insights relevance
      const insightRelevance = this.calculateInsightRelevance(marketInsights);
      relevanceScore += insightRelevance * 0.25;

      // Topic relevance
      const topicRelevance = this.calculateTopicRelevance(nlpResult);
      relevanceScore += topicRelevance * 0.2;

      return Math.min(100, Math.max(0, Math.round(relevanceScore)));

    } catch (error) {
      this.logger.warn('Relevance score calculation failed:', error);
      return 50; // Default moderate relevance
    }
  }

  /**
   * Calculate source credibility score
   */
  private async calculateCredibilityScore(
    source?: string,
    content?: string,
    nlpResult?: NLPProcessingResult
  ): Promise<number> {
    try {
      let credibilityScore = 50; // Base score

      // Source-based credibility
      if (source) {
        const sourceCredibility = await this.getSourceCredibility(source);
        if (sourceCredibility) {
          credibilityScore = (
            sourceCredibility.authorityScore * 0.3 +
            sourceCredibility.reputationScore * 0.3 +
            sourceCredibility.expertiseScore * 0.25 +
            (100 - sourceCredibility.biasScore) * 0.15
          );
        }
      }

      // Content-based credibility indicators
      if (content && nlpResult) {
        const contentCredibility = this.analyzeContentCredibility(content, nlpResult);
        credibilityScore = (credibilityScore * 0.7) + (contentCredibility * 0.3);
      }

      return Math.min(100, Math.max(0, Math.round(credibilityScore)));

    } catch (error) {
      this.logger.warn('Credibility score calculation failed:', error);
      return 50;
    }
  }

  /**
   * Calculate timeliness score based on content freshness and market timing
   */
  private async calculateTimelinessScore(
    content: string,
    nlpResult: NLPProcessingResult,
    options: ScoringOptions
  ): Promise<number> {
    try {
      let timelinessScore = 50; // Base score

      // Time-sensitive keywords
      const timeKeywords = this.engagementIndicators.timely;
      const hasTimeKeywords = timeKeywords.some(keyword =>
        content.toLowerCase().includes(keyword)
      );

      if (hasTimeKeywords) {
        timelinessScore += 25;
      }

      // Urgency modifier
      switch (options.urgency) {
        case 'breaking':
          timelinessScore += 30;
          break;
        case 'high':
          timelinessScore += 20;
          break;
        case 'medium':
          timelinessScore += 10;
          break;
      }

      // Market hours consideration (content is more timely during trading hours)
      const isMarketHours = this.isMarketHours();
      if (isMarketHours) {
        timelinessScore += 15;
      }

      // Earnings season or major market events
      const hasMarketEvents = await this.checkMarketEvents();
      if (hasMarketEvents) {
        timelinessScore += 10;
      }

      return Math.min(100, Math.max(0, Math.round(timelinessScore)));

    } catch (error) {
      this.logger.warn('Timeliness score calculation failed:', error);
      return 50;
    }
  }

  /**
   * Calculate market impact score
   */
  private async calculateImpactScore(
    marketInsights: MarketInsightResult,
    nlpResult: NLPProcessingResult,
    options: ScoringOptions
  ): Promise<number> {
    try {
      let impactScore = 0;

      // Trading signals impact
      const strongSignals = marketInsights.tradingSignals.filter(s => s.confidence > 0.7);
      impactScore += Math.min(30, strongSignals.length * 10);

      // Price target impact
      impactScore += Math.min(20, marketInsights.priceTargets.length * 7);

      // Risk factors impact
      const criticalRisks = marketInsights.riskFactors.filter(r => r.severity === 'critical');
      impactScore += Math.min(25, criticalRisks.length * 12);

      // Analyst recommendations impact
      impactScore += Math.min(15, marketInsights.analystRecommendations.length * 5);

      // Sentiment magnitude impact
      if (nlpResult.sentiment) {
        impactScore += nlpResult.sentiment.magnitude * 20;
      }

      // Opportunity impact
      impactScore += Math.min(10, marketInsights.opportunities.length * 3);

      return Math.min(100, Math.max(0, Math.round(impactScore)));

    } catch (error) {
      this.logger.warn('Impact score calculation failed:', error);
      return 30;
    }
  }

  /**
   * Calculate content quality score
   */
  private async calculateQualityScore(
    content: string,
    nlpResult: NLPProcessingResult
  ): Promise<number> {
    try {
      const metrics = this.extractContentMetrics(content, nlpResult);
      
      let qualityScore = 0;

      // Length score (optimal range: 300-1500 words)
      const lengthScore = this.calculateLengthScore(metrics.wordCount);
      qualityScore += lengthScore * 0.15;

      // Readability score
      qualityScore += metrics.readabilityScore * 0.25;

      // Structure score
      qualityScore += metrics.structureScore * 0.2;

      // Clarity score
      qualityScore += metrics.clarityScore * 0.2;

      // Depth indicators
      const depthScore = this.calculateDepthScore(content);
      qualityScore += depthScore * 0.2;

      return Math.min(100, Math.max(0, Math.round(qualityScore)));

    } catch (error) {
      this.logger.warn('Quality score calculation failed:', error);
      return 50;
    }
  }

  /**
   * Generate detailed score breakdown
   */
  private async generateScoreBreakdown(
    content: string,
    source?: string,
    nlpResult?: NLPProcessingResult,
    marketInsights?: MarketInsightResult
  ): Promise<ScoreBreakdown> {
    const metrics = nlpResult ? this.extractContentMetrics(content, nlpResult) : null;

    return {
      content: {
        length: this.calculateLengthScore(content.split(' ').length),
        readability: metrics?.readabilityScore || 50,
        structure: metrics?.structureScore || 50,
        clarity: metrics?.clarityScore || 50
      },
      sources: {
        authority: source ? await this.getAuthorityScore(source) : 50,
        reputation: source ? await this.getReputationScore(source) : 50,
        expertise: source ? await this.getExpertiseScore(source) : 50,
        bias: source ? await this.getBiasScore(source) : 50
      },
      market: {
        relevance: nlpResult ? this.calculateKeywordRelevance(nlpResult) : 30,
        timeliness: this.isMarketHours() ? 80 : 60,
        significance: marketInsights ? this.calculateSignificanceScore(marketInsights) : 40,
        uniqueness: this.calculateUniquenessScore(content)
      },
      engagement: {
        potential: this.calculateEngagementPotential(content),
        targetAlignment: 70, // Would be calculated based on user preferences
        virality: this.calculateViralityScore(content)
      }
    };
  }

  // Helper methods for score calculations

  private calculateKeywordRelevance(nlpResult: NLPProcessingResult): number {
    if (!nlpResult.keyPhrases) return 0;

    let relevanceScore = 0;
    let totalKeywords = 0;

    nlpResult.keyPhrases.keyPhrases.forEach(phrase => {
      const weight = this.financialKeywords.get(phrase.text.toLowerCase()) || 0;
      relevanceScore += weight * phrase.relevanceScore;
      totalKeywords++;
    });

    return totalKeywords > 0 ? Math.min(100, (relevanceScore / totalKeywords) * 30) : 0;
  }

  private calculateEntityRelevance(nlpResult: NLPProcessingResult, options: ScoringOptions): number {
    if (!nlpResult.entities) return 0;

    const financialEntities = nlpResult.entities.entities.filter(entity => 
      ['STOCK_SYMBOL', 'COMPANY', 'FINANCIAL_INSTRUMENT', 'EXCHANGE'].includes(entity.type)
    );

    let relevanceScore = financialEntities.length * 15;

    // Bonus for entities matching target focus
    if (options.marketFocus) {
      const matchingEntities = financialEntities.filter(entity =>
        options.marketFocus!.some(focus => 
          entity.text.toLowerCase().includes(focus.toLowerCase())
        )
      );
      relevanceScore += matchingEntities.length * 10;
    }

    return Math.min(100, relevanceScore);
  }

  private calculateInsightRelevance(marketInsights: MarketInsightResult): number {
    let score = 0;

    // High-confidence insights add to relevance
    score += marketInsights.tradingSignals.filter(s => s.confidence > 0.7).length * 8;
    score += marketInsights.priceTargets.filter(pt => pt.confidence > 0.7).length * 6;
    score += marketInsights.analystRecommendations.filter(ar => ar.confidence > 0.7).length * 5;

    return Math.min(100, score);
  }

  private calculateTopicRelevance(nlpResult: NLPProcessingResult): number {
    if (!nlpResult.topics) return 50;

    // Higher relevance for financial topics
    const financialTopics = nlpResult.topics.topics.filter(topic =>
      topic.keywords.some(keyword => this.financialKeywords.has(keyword.toLowerCase()))
    );

    return Math.min(100, 30 + (financialTopics.length * 20));
  }

  private analyzeContentCredibility(content: string, nlpResult: NLPProcessingResult): number {
    let score = 50;

    // Positive indicators
    const positiveIndicators = this.qualityIndicators.positive;
    const positiveCount = positiveIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length;
    score += positiveCount * 5;

    // Negative indicators
    const negativeIndicators = this.qualityIndicators.negative;
    const negativeCount = negativeIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length;
    score -= negativeCount * 10;

    // Citations and references
    const citationPattern = /\bhttps?:\/\/|doi:|source:|according to|study by|research from/gi;
    const citations = content.match(citationPattern) || [];
    score += Math.min(20, citations.length * 3);

    // Sentiment consistency (extreme sentiment may indicate bias)
    if (nlpResult.sentiment) {
      const sentimentExtremity = Math.abs(nlpResult.sentiment.score);
      if (sentimentExtremity > 0.8) {
        score -= 10; // Penalty for extreme sentiment
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private extractContentMetrics(content: string, nlpResult: NLPProcessingResult): ContentMetrics {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = nlp(content).sentences().out('array');
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgSentenceLength: words.length / Math.max(sentences.length, 1),
      readabilityScore: nlpResult.metadata.readabilityScore || 50,
      complexityScore: nlpResult.metadata.complexity || 50,
      structureScore: this.calculateStructureScore(content),
      clarityScore: this.calculateClarityScore(content, nlpResult)
    };
  }

  private calculateLengthScore(wordCount: number): number {
    // Optimal range: 300-1500 words
    if (wordCount >= 300 && wordCount <= 1500) return 100;
    if (wordCount >= 150 && wordCount < 300) return 70;
    if (wordCount >= 1500 && wordCount <= 2500) return 80;
    if (wordCount < 150) return Math.max(30, wordCount / 150 * 70);
    return Math.max(40, 100 - ((wordCount - 2500) / 100));
  }

  private calculateStructureScore(content: string): number {
    let score = 50;

    // Check for structural elements
    const structureElements = this.qualityIndicators.structure;
    const elementCount = structureElements.filter(element =>
      content.toLowerCase().includes(element)
    ).length;
    score += elementCount * 8;

    // Check for headings/sections
    const headingPattern = /^#{1,6}\s+.+|^.+\n[=-]{3,}/gm;
    const headings = content.match(headingPattern) || [];
    score += Math.min(20, headings.length * 5);

    // Check for lists
    const listPattern = /^\s*[-*+•]\s+.+|^\s*\d+\.\s+.+/gm;
    const lists = content.match(listPattern) || [];
    score += Math.min(15, lists.length * 2);

    return Math.min(100, score);
  }

  private calculateClarityScore(content: string, nlpResult: NLPProcessingResult): number {
    let score = 60; // Base clarity score

    // Sentence length variation (good for readability)
    const sentences = nlp(content).sentences().out('array');
    const lengths = sentences.map(s => s.split(' ').length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    
    // Moderate variance is good for readability
    if (variance >= 20 && variance <= 100) score += 15;

    // Jargon density (financial jargon should be balanced)
    const jargonCount = Array.from(this.financialKeywords.keys()).filter(term =>
      content.toLowerCase().includes(term)
    ).length;
    const jargonDensity = jargonCount / Math.max(content.split(' ').length / 100, 1);
    
    if (jargonDensity >= 1 && jargonDensity <= 5) score += 10; // Optimal jargon density
    else if (jargonDensity > 10) score -= 15; // Too much jargon

    // Transition words and logical flow
    const transitionWords = ['however', 'therefore', 'moreover', 'furthermore', 'consequently', 'additionally'];
    const transitionCount = transitionWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    score += Math.min(15, transitionCount * 3);

    return Math.min(100, Math.max(0, score));
  }

  private calculateDepthScore(content: string): number {
    let score = 30; // Base depth score

    // Analysis depth indicators
    const depthIndicators = this.qualityIndicators.depth;
    const depthCount = depthIndicators.filter(indicator =>
      content.toLowerCase().includes(indicator)
    ).length;
    score += depthCount * 5;

    // Numbers and statistics (indicate data-driven analysis)
    const numberPattern = /\b\d+(?:\.\d+)?(?:%|\$|billion|million|thousand)?\b/g;
    const numbers = content.match(numberPattern) || [];
    score += Math.min(25, numbers.length * 2);

    // Quotes and citations
    const quotePattern = /"[^"]{20,}"/g;
    const quotes = content.match(quotePattern) || [];
    score += Math.min(15, quotes.length * 3);

    return Math.min(100, score);
  }

  private calculateEngagementPotential(content: string): number {
    let score = 40;

    // Viral keywords
    const viralCount = this.engagementIndicators.viral.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    score += viralCount * 8;

    // Actionable content
    const actionableCount = this.engagementIndicators.actionable.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    score += actionableCount * 6;

    // Controversial topics (can drive engagement)
    const controversialCount = this.engagementIndicators.controversial.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    score += controversialCount * 4;

    return Math.min(100, score);
  }

  private calculateViralityScore(content: string): number {
    let score = 30;

    // Emotional triggers
    const emotionalWords = ['shocking', 'incredible', 'massive', 'historic', 'unprecedented'];
    const emotionalCount = emotionalWords.filter(word =>
      content.toLowerCase().includes(word)
    ).length;
    score += emotionalCount * 10;

    // Numbers that grab attention
    const bigNumberPattern = /\b(?:\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?(?:%|billion|million))\b/g;
    const bigNumbers = content.match(bigNumberPattern) || [];
    score += Math.min(20, bigNumbers.length * 3);

    return Math.min(100, score);
  }

  private calculateSignificanceScore(marketInsights: MarketInsightResult): number {
    let score = 0;

    // High-impact signals
    const highImpactSignals = marketInsights.tradingSignals.filter(s => 
      s.confidence > 0.8 && s.strength > 0.7
    );
    score += highImpactSignals.length * 15;

    // Major price movements
    const significantTargets = marketInsights.priceTargets.filter(pt => 
      pt.upside && Math.abs(pt.upside) > 20
    );
    score += significantTargets.length * 10;

    // Critical risks
    const criticalRisks = marketInsights.riskFactors.filter(r => 
      r.severity === 'critical' && r.probability > 0.7
    );
    score += criticalRisks.length * 20;

    return Math.min(100, score);
  }

  private calculateUniquenessScore(content: string): number {
    // In a real implementation, this would check against a database of similar content
    // For now, we'll use content characteristics as a proxy
    
    let score = 60; // Base uniqueness score

    // Specific numbers and data points increase uniqueness
    const specificNumberPattern = /\b\d+\.\d{2,}\b/g;
    const specificNumbers = content.match(specificNumberPattern) || [];
    score += Math.min(20, specificNumbers.length * 2);

    // Direct quotes increase uniqueness
    const quotePattern = /"[^"]{30,}"/g;
    const quotes = content.match(quotePattern) || [];
    score += Math.min(15, quotes.length * 5);

    // Specific company names and details
    const companyPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc|Corp|Ltd|LLC|Co)\b/g;
    const companies = content.match(companyPattern) || [];
    score += Math.min(10, companies.length * 2);

    return Math.min(100, score);
  }

  private getScoreWeights(options: ScoringOptions): Record<string, number> {
    // Default weights
    let weights = {
      relevance: 0.25,
      credibility: 0.25,
      timeliness: 0.2,
      impact: 0.15,
      quality: 0.15
    };

    // Adjust weights based on content type and audience
    switch (options.contentType) {
      case 'news':
        weights.timeliness = 0.3;
        weights.credibility = 0.3;
        weights.relevance = 0.2;
        break;
      case 'analysis':
        weights.quality = 0.25;
        weights.relevance = 0.3;
        weights.credibility = 0.2;
        break;
      case 'research':
        weights.credibility = 0.35;
        weights.quality = 0.25;
        weights.relevance = 0.2;
        break;
    }

    switch (options.targetAudience) {
      case 'institutional':
        weights.credibility = Math.min(0.4, weights.credibility + 0.1);
        weights.quality = Math.min(0.3, weights.quality + 0.05);
        break;
      case 'retail':
        weights.timeliness = Math.min(0.3, weights.timeliness + 0.05);
        weights.relevance = Math.min(0.35, weights.relevance + 0.05);
        break;
    }

    return weights;
  }

  private generateRecommendation(
    overallScore: number,
    breakdown: ScoreBreakdown
  ): ContentScoringResult['recommendation'] {
    if (overallScore >= 85) return 'publish';
    if (overallScore >= 70) return 'review';
    if (overallScore >= 50) return 'enhance';
    return 'reject';
  }

  private generateScoringReasons(overallScore: number, breakdown: ScoreBreakdown): string[] {
    const reasons: string[] = [];

    if (overallScore >= 85) {
      reasons.push('High-quality content with strong market relevance');
    }

    if (breakdown.market.relevance > 80) {
      reasons.push('Highly relevant to financial markets');
    }

    if (breakdown.sources.credibility > 80) {
      reasons.push('High source credibility and authority');
    }

    if (breakdown.content.readability > 80) {
      reasons.push('Excellent readability and clarity');
    }

    if (breakdown.market.timeliness > 80) {
      reasons.push('Timely and market-relevant content');
    }

    // Negative reasons
    if (breakdown.content.structure < 50) {
      reasons.push('Poor content structure and organization');
    }

    if (breakdown.sources.bias > 70) {
      reasons.push('Potential bias concerns in source material');
    }

    if (breakdown.market.relevance < 40) {
      reasons.push('Limited relevance to financial markets');
    }

    return reasons;
  }

  private generateImprovementSuggestions(breakdown: ScoreBreakdown): string[] {
    const suggestions: string[] = [];

    if (breakdown.content.structure < 60) {
      suggestions.push('Improve content structure with clear headings and sections');
    }

    if (breakdown.content.readability < 60) {
      suggestions.push('Simplify language and reduce sentence complexity');
    }

    if (breakdown.market.relevance < 50) {
      suggestions.push('Include more relevant financial keywords and market context');
    }

    if (breakdown.sources.credibility < 60) {
      suggestions.push('Add citations and references from authoritative sources');
    }

    if (breakdown.engagement.potential < 50) {
      suggestions.push('Include more actionable insights and compelling data points');
    }

    if (breakdown.content.clarity < 60) {
      suggestions.push('Improve logical flow with better transitions between ideas');
    }

    return suggestions;
  }

  // Source credibility methods

  private async initializeSourceCredibility(): Promise<void> {
    // Initialize with known financial sources
    const knownSources = [
      { domain: 'bloomberg.com', authority: 95, reputation: 95, expertise: 90, bias: 20 },
      { domain: 'reuters.com', authority: 90, reputation: 90, expertise: 85, bias: 15 },
      { domain: 'wsj.com', authority: 90, reputation: 90, expertise: 90, bias: 25 },
      { domain: 'ft.com', authority: 85, reputation: 85, expertise: 85, bias: 20 },
      { domain: 'cnbc.com', authority: 80, reputation: 80, expertise: 80, bias: 30 },
      { domain: 'marketwatch.com', authority: 75, reputation: 75, expertise: 80, bias: 25 },
      { domain: 'seekingalpha.com', authority: 70, reputation: 70, expertise: 85, bias: 40 },
      { domain: 'fool.com', authority: 60, reputation: 65, expertise: 70, bias: 35 }
    ];

    for (const source of knownSources) {
      this.sourceCredibilityMap.set(source.domain, {
        domain: source.domain,
        authorityScore: source.authority,
        reputationScore: source.reputation,
        expertiseScore: source.expertise,
        biasScore: source.bias,
        lastUpdated: new Date()
      });
    }
  }

  private async getSourceCredibility(source: string): Promise<SourceCredibility | null> {
    try {
      const domain = new URL(source).hostname;
      return this.sourceCredibilityMap.get(domain) || null;
    } catch {
      return null;
    }
  }

  private async getAuthorityScore(source: string): Promise<number> {
    const credibility = await this.getSourceCredibility(source);
    return credibility?.authorityScore || 50;
  }

  private async getReputationScore(source: string): Promise<number> {
    const credibility = await this.getSourceCredibility(source);
    return credibility?.reputationScore || 50;
  }

  private async getExpertiseScore(source: string): Promise<number> {
    const credibility = await this.getSourceCredibility(source);
    return credibility?.expertiseScore || 50;
  }

  private async getBiasScore(source: string): Promise<number> {
    const credibility = await this.getSourceCredibility(source);
    return credibility?.biasScore || 50;
  }

  // Utility methods

  private isMarketHours(): boolean {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcDay = now.getUTCDay();
    
    // US market hours: 9:30 AM - 4:00 PM EST (14:30 - 21:00 UTC)
    // Weekdays only
    return utcDay >= 1 && utcDay <= 5 && utcHours >= 14 && utcHours < 21;
  }

  private async checkMarketEvents(): Promise<boolean> {
    // In a real implementation, this would check against an economic calendar
    // For now, return false
    return false;
  }

  private async cacheResult(content: string, result: ContentScoringResult): Promise<void> {
    try {
      const contentHash = this.hashContent(content);
      const key = `score:${contentHash}`;
      await this.redis.setex(key, 3600, JSON.stringify(result)); // Cache for 1 hour
    } catch (error) {
      this.logger.warn('Failed to cache scoring result:', error);
    }
  }

  private hashContent(content: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}