/**
 * Market Insight Extraction Service
 * 
 * Specialized service for extracting actionable financial insights from text content:
 * - Trading signals and recommendations
 * - Market trends and pattern identification
 * - Price targets and analyst predictions
 * - Financial metrics and performance indicators
 * - Risk factors and market opportunities
 * 
 * Uses advanced NLP, pattern matching, and AI-powered analysis for accurate insight extraction
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NlpProcessingService } from './nlp-processing.service';
import OpenAI from 'openai';
import * as nlp from 'compromise';
import {
  MarketInsightResult,
  TradingSignal,
  MarketTrend,
  PriceTarget,
  AnalystRecommendation,
  FinancialMetric,
  RiskFactor,
  MarketOpportunity,
  NLPProcessingResult,
  EntityType
} from '../interfaces/nlp.interface';

interface InsightExtractionOptions {
  includeWeakSignals?: boolean;
  confidenceThreshold?: number;
  maxInsights?: number;
  focusSymbols?: string[];
  timeframe?: string;
  useAIAnalysis?: boolean;
}

@Injectable()
export class MarketInsightService {
  private readonly logger = new Logger(MarketInsightService.name);
  private readonly openai: OpenAI;

  // Financial pattern recognition
  private readonly signalPatterns = {
    buy: /\b(buy|bullish|long|upside|positive|outperform|overweight|strong\s+buy|accumulate)\b/gi,
    sell: /\b(sell|bearish|short|downside|negative|underperform|underweight|strong\s+sell|reduce|avoid)\b/gi,
    hold: /\b(hold|neutral|maintain|fair\s+value|market\s+perform|equal\s+weight)\b/gi,
    priceTarget: /(?:price\s+target|target\s+price|pt)[:\s]*\$?(\d+(?:\.\d+)?)/gi,
    earnings: /(?:eps|earnings\s+per\s+share)[:\s]*\$?(\d+(?:\.\d+)?)/gi,
    revenue: /(?:revenue|sales)[:\s]*\$?(\d+(?:\.\d+)?(?:[bmk])?)/gi,
    growth: /(?:growth|increase)[:\s]*(\d+(?:\.\d+)?)%/gi,
    decline: /(?:decline|decrease|drop)[:\s]*(\d+(?:\.\d+)?)%/gi,
    volatility: /(?:volatility|vol)[:\s]*(\d+(?:\.\d+)?)%?/gi,
    volume: /(?:volume|trading\s+volume)[:\s]*(\d+(?:,\d+)*(?:\.\d+)?(?:[bmk])?)/gi
  };

  private readonly riskIndicators = [
    'recession', 'inflation', 'interest rate', 'regulatory', 'competition',
    'lawsuit', 'investigation', 'fraud', 'bankruptcy', 'default',
    'geopolitical', 'supply chain', 'pandemic', 'cyber attack',
    'market crash', 'liquidity crisis', 'credit risk', 'operational risk'
  ];

  private readonly opportunityIndicators = [
    'merger', 'acquisition', 'partnership', 'innovation', 'patent',
    'expansion', 'launch', 'breakthrough', 'approval', 'contract',
    'dividend increase', 'buyback', 'spin-off', 'ipo', 'market share'
  ];

  private readonly analystFirms = [
    'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Bank of America',
    'Citigroup', 'Wells Fargo', 'UBS', 'Credit Suisse', 'Deutsche Bank',
    'Barclays', 'RBC', 'TD Securities', 'BMO', 'Jefferies', 'Piper Sandler',
    'Raymond James', 'Stifel', 'Oppenheimer', 'Wedbush', 'Evercore'
  ];

  constructor(
    private configService: ConfigService,
    private nlpService: NlpProcessingService,
  ) {
    const openaiKey = this.configService.get<string>('ai.openaiApiKey');
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
  }

  /**
   * Main method to extract comprehensive market insights from text
   */
  async extractInsights(
    text: string,
    options: InsightExtractionOptions = {}
  ): Promise<MarketInsightResult> {
    const startTime = Date.now();

    try {
      // First perform comprehensive NLP processing
      const nlpResult = await this.nlpService.processText(text, {
        enableSentimentAnalysis: true,
        enableEntityExtraction: true,
        enableKeyPhraseExtraction: true,
        useAdvancedNLP: options.useAIAnalysis
      });

      // Extract different types of insights in parallel
      const [
        tradingSignals,
        marketTrends,
        priceTargets,
        analystRecommendations,
        financialMetrics,
        riskFactors,
        opportunities
      ] = await Promise.all([
        this.extractTradingSignals(text, nlpResult, options),
        this.extractMarketTrends(text, nlpResult, options),
        this.extractPriceTargets(text, nlpResult, options),
        this.extractAnalystRecommendations(text, nlpResult, options),
        this.extractFinancialMetrics(text, nlpResult, options),
        this.extractRiskFactors(text, nlpResult, options),
        this.extractOpportunities(text, nlpResult, options)
      ]);

      // Calculate overall confidence based on signal strength and consistency
      const confidence = this.calculateOverallConfidence([
        ...tradingSignals,
        ...marketTrends,
        ...priceTargets,
        ...analystRecommendations,
        ...financialMetrics,
        ...riskFactors,
        ...opportunities
      ]);

      const result: MarketInsightResult = {
        tradingSignals: this.filterByConfidence(tradingSignals, options.confidenceThreshold),
        marketTrends: this.filterByConfidence(marketTrends, options.confidenceThreshold),
        priceTargets: this.filterByConfidence(priceTargets, options.confidenceThreshold),
        analystRecommendations: this.filterByConfidence(analystRecommendations, options.confidenceThreshold),
        financialMetrics: this.filterByConfidence(financialMetrics, options.confidenceThreshold),
        riskFactors: this.filterByConfidence(riskFactors, options.confidenceThreshold),
        opportunities: this.filterByConfidence(opportunities, options.confidenceThreshold),
        confidence,
        extractedAt: new Date()
      };

      this.logger.log(`Extracted market insights in ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      this.logger.error('Failed to extract market insights:', error);
      throw new Error(`Market insight extraction failed: ${error.message}`);
    }
  }

  /**
   * Extract trading signals from text using pattern matching and sentiment analysis
   */
  private async extractTradingSignals(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<TradingSignal[]> {
    const signals: TradingSignal[] = [];

    try {
      // Get stock symbols from entities
      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      // Extract explicit signals using pattern matching
      const buyMatches = [...text.matchAll(this.signalPatterns.buy)];
      const sellMatches = [...text.matchAll(this.signalPatterns.sell)];
      const holdMatches = [...text.matchAll(this.signalPatterns.hold)];

      // Process buy signals
      buyMatches.forEach(match => {
        const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
        contextSymbols.forEach(symbol => {
          signals.push({
            symbol,
            signal: 'buy',
            strength: this.calculateSignalStrength(match[0], text, nlpResult.sentiment),
            timeframe: this.extractTimeframe(text, match.index!) || 'medium-term',
            confidence: this.calculateSignalConfidence(match[0], text),
            reasoning: this.extractReasoning(text, match.index!),
            extractedFrom: match[0]
          });
        });
      });

      // Process sell signals
      sellMatches.forEach(match => {
        const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
        contextSymbols.forEach(symbol => {
          signals.push({
            symbol,
            signal: 'sell',
            strength: this.calculateSignalStrength(match[0], text, nlpResult.sentiment),
            timeframe: this.extractTimeframe(text, match.index!) || 'medium-term',
            confidence: this.calculateSignalConfidence(match[0], text),
            reasoning: this.extractReasoning(text, match.index!),
            extractedFrom: match[0]
          });
        });
      });

      // Process hold signals
      holdMatches.forEach(match => {
        const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
        contextSymbols.forEach(symbol => {
          signals.push({
            symbol,
            signal: 'hold',
            strength: this.calculateSignalStrength(match[0], text, nlpResult.sentiment),
            timeframe: this.extractTimeframe(text, match.index!) || 'medium-term',
            confidence: this.calculateSignalConfidence(match[0], text),
            reasoning: this.extractReasoning(text, match.index!),
            extractedFrom: match[0]
          });
        });
      });

      // Use AI for complex signal extraction if enabled
      if (options.useAIAnalysis && this.openai) {
        const aiSignals = await this.extractAITradingSignals(text, stockSymbols);
        signals.push(...aiSignals);
      }

      // Remove duplicates and rank by confidence
      return this.deduplicateSignals(signals)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, options.maxInsights || 10);

    } catch (error) {
      this.logger.error('Failed to extract trading signals:', error);
      return [];
    }
  }

  /**
   * Extract market trends from text content
   */
  private async extractMarketTrends(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<MarketTrend[]> {
    const trends: MarketTrend[] = [];

    try {
      const sentiment = nlpResult.sentiment;
      if (!sentiment) return trends;

      // Determine overall market trend based on sentiment and key phrases
      const trendDirection = sentiment.score > 0.3 ? 'bullish' : 
                           sentiment.score < -0.3 ? 'bearish' : 'neutral';

      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      // Extract trend drivers from key phrases
      const drivers = nlpResult.keyPhrases?.keyPhrases
        .filter(p => p.relevanceScore > 0.5)
        .map(p => p.text)
        .slice(0, 5) || [];

      if (stockSymbols.length > 0) {
        trends.push({
          trend: trendDirection,
          strength: Math.abs(sentiment.score),
          timeframe: this.inferTimeframe(text),
          affectedSymbols: stockSymbols,
          drivers,
          confidence: sentiment.confidence,
          duration: this.extractDuration(text)
        });
      }

      return trends;

    } catch (error) {
      this.logger.error('Failed to extract market trends:', error);
      return [];
    }
  }

  /**
   * Extract price targets from analyst recommendations
   */
  private async extractPriceTargets(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<PriceTarget[]> {
    const targets: PriceTarget[] = [];

    try {
      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      const priceTargetMatches = [...text.matchAll(this.signalPatterns.priceTarget)];

      priceTargetMatches.forEach(match => {
        const targetPrice = parseFloat(match[1]);
        if (isNaN(targetPrice)) return;

        const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
        const analyst = this.findNearbyAnalyst(text, match.index!);

        contextSymbols.forEach(symbol => {
          targets.push({
            symbol,
            targetPrice,
            timeframe: this.extractTimeframe(text, match.index!) || '12 months',
            analyst,
            confidence: this.calculatePriceTargetConfidence(match[0], text),
            reasoning: this.extractReasoning(text, match.index!)
          });
        });
      });

      return targets.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      this.logger.error('Failed to extract price targets:', error);
      return [];
    }
  }

  /**
   * Extract analyst recommendations and ratings
   */
  private async extractAnalystRecommendations(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<AnalystRecommendation[]> {
    const recommendations: AnalystRecommendation[] = [];

    try {
      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      // Find analyst firms mentioned in text
      const mentionedFirms = this.analystFirms.filter(firm =>
        text.toLowerCase().includes(firm.toLowerCase())
      );

      // Extract recommendation patterns
      const recMatches = [...text.matchAll(this.signalPatterns.buy)];
      recMatches.push(...text.matchAll(this.signalPatterns.sell));
      recMatches.push(...text.matchAll(this.signalPatterns.hold));

      recMatches.forEach(match => {
        const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
        const nearbyFirm = this.findNearbyFirm(text, match.index!, mentionedFirms);

        if (nearbyFirm && contextSymbols.length > 0) {
          contextSymbols.forEach(symbol => {
            recommendations.push({
              symbol,
              recommendation: this.mapToRecommendation(match[0]),
              analyst: 'Unknown',
              firm: nearbyFirm,
              reasoning: this.extractReasoning(text, match.index!),
              date: new Date(),
              confidence: this.calculateRecommendationConfidence(match[0], text)
            });
          });
        }
      });

      return recommendations.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      this.logger.error('Failed to extract analyst recommendations:', error);
      return [];
    }
  }

  /**
   * Extract financial metrics and KPIs
   */
  private async extractFinancialMetrics(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<FinancialMetric[]> {
    const metrics: FinancialMetric[] = [];

    try {
      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      // Extract earnings metrics
      const earningsMatches = [...text.matchAll(this.signalPatterns.earnings)];
      earningsMatches.forEach(match => {
        const value = parseFloat(match[1]);
        if (!isNaN(value)) {
          const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
          contextSymbols.forEach(symbol => {
            metrics.push({
              symbol,
              metric: 'EPS',
              value,
              unit: 'USD',
              period: this.extractPeriod(text, match.index!) || 'quarterly',
              confidence: 0.8
            });
          });
        }
      });

      // Extract revenue metrics
      const revenueMatches = [...text.matchAll(this.signalPatterns.revenue)];
      revenueMatches.forEach(match => {
        const value = this.parseFinancialValue(match[1]);
        if (value) {
          const contextSymbols = this.findNearbySymbols(text, match.index!, stockSymbols);
          contextSymbols.forEach(symbol => {
            metrics.push({
              symbol,
              metric: 'Revenue',
              value: value.amount,
              unit: value.unit,
              period: this.extractPeriod(text, match.index!) || 'quarterly',
              confidence: 0.8
            });
          });
        }
      });

      return metrics.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      this.logger.error('Failed to extract financial metrics:', error);
      return [];
    }
  }

  /**
   * Extract risk factors from text content
   */
  private async extractRiskFactors(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<RiskFactor[]> {
    const risks: RiskFactor[] = [];

    try {
      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      // Find risk indicators in text
      this.riskIndicators.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = [...text.matchAll(regex)];

        matches.forEach(match => {
          const context = this.extractContext(text, match.index!, 200);
          const sentiment = nlpResult.sentiment?.score || 0;
          
          risks.push({
            type: this.categorizeRisk(indicator),
            description: context,
            severity: this.assessRiskSeverity(context, sentiment),
            probability: this.assessRiskProbability(context, sentiment),
            impact: Math.abs(sentiment) * 0.8,
            affectedSymbols: this.findNearbySymbols(text, match.index!, stockSymbols),
            mitigation: this.suggestMitigation(indicator)
          });
        });
      });

      return risks.sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact));

    } catch (error) {
      this.logger.error('Failed to extract risk factors:', error);
      return [];
    }
  }

  /**
   * Extract market opportunities from text content
   */
  private async extractOpportunities(
    text: string,
    nlpResult: NLPProcessingResult,
    options: InsightExtractionOptions
  ): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];

    try {
      const stockSymbols = nlpResult.entities?.entities
        .filter(e => e.type === EntityType.STOCK_SYMBOL)
        .map(e => e.text) || [];

      // Find opportunity indicators in text
      this.opportunityIndicators.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = [...text.matchAll(regex)];

        matches.forEach(match => {
          const context = this.extractContext(text, match.index!, 200);
          const sentiment = nlpResult.sentiment?.score || 0;
          
          if (sentiment > 0) { // Only positive sentiment indicates opportunities
            opportunities.push({
              type: this.categorizeOpportunity(indicator),
              description: context,
              symbols: this.findNearbySymbols(text, match.index!, stockSymbols),
              timeframe: this.extractTimeframe(text, match.index!) || 'medium-term',
              potential: sentiment * 0.9,
              confidence: nlpResult.sentiment?.confidence || 0.5,
              requirements: this.extractRequirements(context)
            });
          }
        });
      });

      return opportunities.sort((a, b) => b.potential - a.potential);

    } catch (error) {
      this.logger.error('Failed to extract opportunities:', error);
      return [];
    }
  }

  // Helper methods

  private findNearbySymbols(text: string, index: number, symbols: string[], window = 100): string[] {
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + window);
    const context = text.substring(start, end);
    
    return symbols.filter(symbol => 
      context.toUpperCase().includes(symbol.toUpperCase())
    );
  }

  private findNearbyAnalyst(text: string, index: number, window = 100): string {
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + window);
    const context = text.substring(start, end);
    
    // Look for analyst names or firms
    const analystPattern = /(?:analyst|by)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i;
    const match = context.match(analystPattern);
    
    return match ? match[1] : 'Unknown';
  }

  private findNearbyFirm(text: string, index: number, firms: string[], window = 200): string | undefined {
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + window);
    const context = text.substring(start, end);
    
    return firms.find(firm => 
      context.toLowerCase().includes(firm.toLowerCase())
    );
  }

  private calculateSignalStrength(signal: string, fullText: string, sentiment?: any): number {
    // Base strength from signal type
    let strength = 0.5;
    
    // Adjust based on signal intensity
    if (/strong|very|highly/.test(signal.toLowerCase())) strength += 0.3;
    if (/weak|slight|moderately/.test(signal.toLowerCase())) strength -= 0.2;
    
    // Adjust based on overall sentiment
    if (sentiment) {
      strength += Math.abs(sentiment.score) * 0.3;
    }
    
    return Math.min(1, Math.max(0, strength));
  }

  private calculateSignalConfidence(signal: string, fullText: string): number {
    let confidence = 0.6; // Base confidence
    
    // Higher confidence for explicit signals
    if (/rating|recommendation|target/.test(signal.toLowerCase())) confidence += 0.2;
    
    // Check for supporting context
    const contextWords = ['analyst', 'firm', 'research', 'report', 'upgrade', 'downgrade'];
    const hasContext = contextWords.some(word => 
      fullText.toLowerCase().includes(word)
    );
    
    if (hasContext) confidence += 0.2;
    
    return Math.min(1, confidence);
  }

  private extractTimeframe(text: string, index: number, window = 100): string | undefined {
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + window);
    const context = text.substring(start, end);
    
    const timeframes = {
      'short-term': /\b(?:short.?term|near.?term|next\s+(?:week|month)|1-3\s+months?)\b/i,
      'medium-term': /\b(?:medium.?term|6-12\s+months?|next\s+quarter|this\s+year)\b/i,
      'long-term': /\b(?:long.?term|1-2\s+years?|next\s+2-3\s+years?)\b/i
    };
    
    for (const [timeframe, pattern] of Object.entries(timeframes)) {
      if (pattern.test(context)) {
        return timeframe;
      }
    }
    
    return undefined;
  }

  private extractReasoning(text: string, index: number, window = 200): string {
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + window);
    const context = text.substring(start, end);
    
    // Extract the most relevant sentence
    const sentences = nlp(context).sentences().out('array');
    return sentences.find(s => s.length > 20 && s.length < 150) || 
           sentences[0] || 
           'No reasoning available';
  }

  private mapToRecommendation(signal: string): AnalystRecommendation['recommendation'] {
    const lower = signal.toLowerCase();
    
    if (/strong.?buy|outperform|overweight/.test(lower)) return 'strong_buy';
    if (/buy|positive|bullish/.test(lower)) return 'buy';
    if (/sell|negative|bearish/.test(lower)) return 'sell';
    if (/strong.?sell|underperform|underweight/.test(lower)) return 'strong_sell';
    
    return 'hold';
  }

  private parseFinancialValue(value: string): { amount: number; unit: string } | null {
    const numMatch = value.match(/(\d+(?:\.\d+)?)/);
    if (!numMatch) return null;
    
    const amount = parseFloat(numMatch[1]);
    let unit = 'USD';
    
    if (value.includes('b') || value.includes('B')) {
      return { amount: amount * 1e9, unit: 'USD' };
    } else if (value.includes('m') || value.includes('M')) {
      return { amount: amount * 1e6, unit: 'USD' };
    } else if (value.includes('k') || value.includes('K')) {
      return { amount: amount * 1e3, unit: 'USD' };
    }
    
    return { amount, unit };
  }

  private extractPeriod(text: string, index: number): string | undefined {
    const periods = ['quarterly', 'annually', 'monthly', 'yearly'];
    const context = text.substring(Math.max(0, index - 100), index + 100);
    
    return periods.find(period => 
      context.toLowerCase().includes(period) ||
      context.toLowerCase().includes(period.slice(0, -2)) // Remove 'ly'
    );
  }

  private extractContext(text: string, index: number, window: number): string {
    const start = Math.max(0, index - window);
    const end = Math.min(text.length, index + window);
    return text.substring(start, end).trim();
  }

  private categorizeRisk(indicator: string): RiskFactor['type'] {
    if (['recession', 'inflation', 'interest rate', 'market crash'].includes(indicator)) {
      return 'market';
    }
    if (['regulatory', 'investigation', 'lawsuit'].includes(indicator)) {
      return 'regulatory';
    }
    if (['bankruptcy', 'default', 'fraud'].includes(indicator)) {
      return 'financial';
    }
    if (['cyber attack', 'supply chain', 'operational risk'].includes(indicator)) {
      return 'operational';
    }
    
    return 'company';
  }

  private categorizeOpportunity(indicator: string): MarketOpportunity['type'] {
    if (['merger', 'acquisition', 'partnership'].includes(indicator)) {
      return 'event_driven';
    }
    if (['innovation', 'patent', 'breakthrough'].includes(indicator)) {
      return 'growth';
    }
    if (['dividend increase', 'buyback'].includes(indicator)) {
      return 'value';
    }
    
    return 'growth';
  }

  private assessRiskSeverity(context: string, sentiment: number): RiskFactor['severity'] {
    const severity = Math.abs(sentiment);
    
    if (severity > 0.8) return 'critical';
    if (severity > 0.6) return 'high';
    if (severity > 0.3) return 'medium';
    
    return 'low';
  }

  private assessRiskProbability(context: string, sentiment: number): number {
    // Base probability on negative sentiment strength
    return Math.max(0.1, Math.min(1, Math.abs(Math.min(0, sentiment)) + 0.3));
  }

  private suggestMitigation(riskType: string): string {
    const mitigations = {
      'recession': 'Diversification and defensive positioning',
      'inflation': 'Inflation-protected securities and commodities',
      'regulatory': 'Compliance monitoring and regulatory engagement',
      'competition': 'Innovation and competitive differentiation',
      'default': 'Credit analysis and risk monitoring'
    };
    
    return mitigations[riskType] || 'Risk monitoring and contingency planning';
  }

  private extractRequirements(context: string): string[] {
    // Extract action items and requirements from context
    const requirements: string[] = [];
    
    if (/approval/.test(context)) requirements.push('Regulatory approval');
    if (/funding/.test(context)) requirements.push('Adequate funding');
    if (/market/.test(context)) requirements.push('Market conditions');
    
    return requirements;
  }

  private inferTimeframe(text: string): string {
    if (/near.?term|short.?term|immediate/.test(text)) return 'short-term';
    if (/long.?term|strategic|future/.test(text)) return 'long-term';
    return 'medium-term';
  }

  private extractDuration(text: string): string | undefined {
    const durationPattern = /(\d+)\s*(days?|weeks?|months?|years?)/i;
    const match = text.match(durationPattern);
    
    return match ? `${match[1]} ${match[2]}` : undefined;
  }

  private calculateOverallConfidence(insights: Array<{ confidence: number }>): number {
    if (insights.length === 0) return 0;
    
    const avgConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length;
    const consistencyBonus = insights.length > 3 ? 0.1 : 0;
    
    return Math.min(1, avgConfidence + consistencyBonus);
  }

  private filterByConfidence<T extends { confidence: number }>(
    items: T[],
    threshold = 0.5
  ): T[] {
    return items.filter(item => item.confidence >= threshold);
  }

  private deduplicateSignals(signals: TradingSignal[]): TradingSignal[] {
    const seen = new Set<string>();
    return signals.filter(signal => {
      const key = `${signal.symbol}_${signal.signal}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private calculatePriceTargetConfidence(target: string, fullText: string): number {
    let confidence = 0.7; // Base confidence for explicit price targets
    
    // Higher confidence if from known analyst firm
    if (this.analystFirms.some(firm => fullText.includes(firm))) {
      confidence += 0.2;
    }
    
    // Check for supporting analysis
    if (/analysis|research|forecast/.test(fullText.toLowerCase())) {
      confidence += 0.1;
    }
    
    return Math.min(1, confidence);
  }

  private calculateRecommendationConfidence(rec: string, fullText: string): number {
    let confidence = 0.6; // Base confidence
    
    // Higher confidence for explicit recommendations
    if (/upgrade|downgrade|initiate|reiterate/.test(rec.toLowerCase())) {
      confidence += 0.3;
    }
    
    return Math.min(1, confidence);
  }

  /**
   * Use AI for advanced signal extraction when traditional methods are insufficient
   */
  private async extractAITradingSignals(text: string, symbols: string[]): Promise<TradingSignal[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a financial analyst expert. Extract trading signals from the following text and respond with a JSON array of objects containing: symbol, signal (buy/sell/hold), strength (0-1), confidence (0-1), and reasoning. Focus on explicit recommendations and price targets.`
          },
          {
            role: 'user',
            content: `Extract trading signals from this text. Known symbols: ${symbols.join(', ')}\n\nText: ${text.substring(0, 3000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      const aiSignals = JSON.parse(content);
      return aiSignals.map((signal: any) => ({
        ...signal,
        timeframe: signal.timeframe || 'medium-term',
        extractedFrom: 'AI Analysis'
      }));

    } catch (error) {
      this.logger.warn('AI signal extraction failed:', error);
      return [];
    }
  }
}