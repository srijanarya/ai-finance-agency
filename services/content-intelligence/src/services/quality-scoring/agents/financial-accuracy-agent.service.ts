import { Injectable, Logger } from '@nestjs/common';
import {
  QualityAgent,
  AssessmentSpecialty,
  AgentAssessment,
  AssessmentContext,
  AgentCapabilities,
  QualityIssue,
  IssueType,
  IssueSeverity,
  ContentType,
} from '../../../interfaces/quality-scoring/quality-scoring.interface';

@Injectable()
export class FinancialAccuracyAgentService implements QualityAgent {
  readonly id = 'financial-accuracy-agent';
  readonly name = 'Financial Accuracy Assessment Agent';
  readonly specialty = AssessmentSpecialty.FINANCIAL_ACCURACY;
  
  private readonly logger = new Logger(FinancialAccuracyAgentService.name);

  async assess(content: string, context: AssessmentContext): Promise<AgentAssessment> {
    const startTime = Date.now();

    try {
      this.logger.log(`Assessing financial accuracy for ${context.contentType} content`);

      const analysis = this.analyzeFinancialContent(content, context);
      const issues = this.identifyAccuracyIssues(content, analysis, context);
      const suggestions = this.generateSuggestions(analysis, issues, context);
      const score = this.calculateAccuracyScore(analysis, context);

      return {
        agentId: this.id,
        agentName: this.name,
        specialty: this.specialty,
        score,
        confidence: this.calculateConfidence(analysis, content.length),
        reasoning: this.generateReasoning(analysis, score, context),
        issues,
        suggestions,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Financial accuracy assessment failed: ${error.message}`);
      throw error;
    }
  }

  getCapabilities(): AgentCapabilities {
    return {
      supportedContentTypes: [
        ContentType.MARKET_ANALYSIS,
        ContentType.RESEARCH_REPORT,
        ContentType.INVESTMENT_MEMO,
        ContentType.NEWSLETTER,
        ContentType.BLOG_POST,
        ContentType.EDUCATIONAL,
        ContentType.PRESS_RELEASE
      ],
      supportedLanguages: ['en'],
      assessmentAreas: [
        'financial_data_accuracy',
        'market_terminology',
        'calculation_verification',
        'trend_analysis',
        'risk_disclosure',
        'performance_metrics',
        'regulatory_references'
      ],
      processingSpeed: 'medium',
      accuracy: 0.89,
    };
  }

  private analyzeFinancialContent(content: string, context: AssessmentContext): FinancialAnalysis {
    // Extract financial entities and data
    const stockSymbols = this.extractStockSymbols(content);
    const financialNumbers = this.extractFinancialNumbers(content);
    const percentages = this.extractPercentages(content);
    const financialTerms = this.extractFinancialTerms(content);
    const dateReferences = this.extractDateReferences(content);
    
    // Analyze financial statements and claims
    const performanceClaims = this.extractPerformanceClaims(content);
    const riskStatements = this.extractRiskStatements(content);
    const predictions = this.extractPredictions(content);
    const historicalReferences = this.extractHistoricalReferences(content);
    
    // Check for data consistency
    const inconsistentData = this.findInconsistentData(financialNumbers, percentages);
    const unrealisticClaims = this.findUnrealisticClaims(performanceClaims, percentages);
    
    // Verify financial terminology usage
    const termUsageAccuracy = this.verifyTerminologyUsage(financialTerms, content);
    
    // Check calculation accuracy where possible
    const calculationErrors = this.verifyCalculations(content, financialNumbers);

    return {
      stockSymbols,
      financialNumbers,
      percentages,
      financialTerms,
      dateReferences,
      performanceClaims,
      riskStatements,
      predictions,
      historicalReferences,
      inconsistentData,
      unrealisticClaims,
      termUsageAccuracy,
      calculationErrors,
      hasSourceCitations: this.hasSourceCitations(content),
      hasRiskDisclosures: this.hasRiskDisclosures(content),
      hasDisclaimers: this.hasDisclaimers(content),
      dataRecency: this.assessDataRecency(dateReferences),
    };
  }

  private identifyAccuracyIssues(
    content: string,
    analysis: FinancialAnalysis,
    context: AssessmentContext
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Inconsistent financial data
    analysis.inconsistentData.forEach(inconsistency => {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.HIGH,
        description: `Inconsistent financial data: ${inconsistency.description}`,
        suggestion: `Verify and correct the inconsistent data points`,
        impact: 9,
        location: inconsistency.location,
      });
    });

    // Unrealistic performance claims
    analysis.unrealisticClaims.forEach(claim => {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.CRITICAL,
        description: `Unrealistic performance claim: ${claim.description}`,
        suggestion: `Review and substantiate with credible sources or remove the claim`,
        impact: 10,
        location: claim.location,
      });
    });

    // Calculation errors
    analysis.calculationErrors.forEach(error => {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.HIGH,
        description: `Calculation error: ${error.description}`,
        suggestion: `Verify and correct the mathematical calculation`,
        impact: 8,
        location: error.location,
      });
    });

    // Incorrect terminology usage
    analysis.termUsageAccuracy.incorrectUsages.forEach(usage => {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.MEDIUM,
        description: `Incorrect use of financial term: "${usage.term}"`,
        suggestion: `Use "${usage.correctTerm}" instead or provide proper definition`,
        impact: 6,
        location: usage.location,
      });
    });

    // Missing risk disclosures for investment content
    if (this.requiresRiskDisclosure(context.contentType) && !analysis.hasRiskDisclosures) {
      issues.push({
        type: IssueType.COMPLIANCE_VIOLATION,
        severity: IssueSeverity.HIGH,
        description: 'Investment-related content lacks appropriate risk disclosures',
        suggestion: 'Add clear risk warnings and disclaimers about investment risks',
        impact: 8,
      });
    }

    // Outdated data references
    if (analysis.dataRecency.hasOutdatedData) {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.MEDIUM,
        description: `Content references outdated data (older than ${analysis.dataRecency.oldestDataAge} months)`,
        suggestion: 'Update with more recent financial data and market information',
        impact: 6,
      });
    }

    // Missing source citations for claims
    if (analysis.performanceClaims.length > 0 && !analysis.hasSourceCitations) {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.MEDIUM,
        description: 'Performance claims lack credible source citations',
        suggestion: 'Add references to reputable financial data sources',
        impact: 7,
      });
    }

    // Vague or unsubstantiated predictions
    const vaguePredictions = analysis.predictions.filter(p => p.confidence === 'low');
    if (vaguePredictions.length > 0) {
      issues.push({
        type: IssueType.FACTUAL_ERROR,
        severity: IssueSeverity.MEDIUM,
        description: `${vaguePredictions.length} predictions lack proper substantiation`,
        suggestion: 'Provide more specific analysis and evidence for market predictions',
        impact: 6,
      });
    }

    return issues;
  }

  private generateSuggestions(
    analysis: FinancialAnalysis,
    issues: QualityIssue[],
    context: AssessmentContext
  ): string[] {
    const suggestions: string[] = [];

    // General accuracy improvements
    if (analysis.financialNumbers.length > 3 && !analysis.hasSourceCitations) {
      suggestions.push('Add credible source citations for all financial data and statistics');
    }

    if (analysis.stockSymbols.length > 0) {
      suggestions.push('Verify all stock symbols and ensure current market data is referenced');
    }

    if (analysis.percentages.length > 2) {
      suggestions.push('Double-check all percentage calculations and ensure they align with stated base values');
    }

    // Content type specific suggestions
    if (context.contentType === ContentType.MARKET_ANALYSIS) {
      suggestions.push('Include recent market data and specify the analysis timeframe');
      suggestions.push('Provide context for all market comparisons and benchmarks');
      
      if (analysis.predictions.length > 0) {
        suggestions.push('Clearly distinguish between analysis and speculative forecasts');
      }
    }

    if (context.contentType === ContentType.RESEARCH_REPORT) {
      suggestions.push('Ensure all financial metrics are properly defined and calculated');
      suggestions.push('Include methodology section for any proprietary analysis');
      
      if (!analysis.hasDisclaimers) {
        suggestions.push('Add appropriate research disclaimers and conflict of interest statements');
      }
    }

    if (context.contentType === ContentType.EDUCATIONAL) {
      suggestions.push('Define all financial terms clearly for the target audience');
      suggestions.push('Use concrete examples to illustrate abstract financial concepts');
    }

    // Risk and compliance suggestions
    if (this.containsInvestmentAdvice(analysis)) {
      suggestions.push('Include standard investment disclaimer about past performance and future risks');
      suggestions.push('Clearly state that content is for informational purposes only');
    }

    // Data quality suggestions
    if (analysis.dataRecency.hasOutdatedData) {
      suggestions.push('Update all market data to the most recent available information');
    }

    if (analysis.historicalReferences.some(ref => ref.period > 10)) {
      suggestions.push('Consider relevance of historical data older than 10 years in current market context');
    }

    return suggestions.filter((suggestion, index, array) => 
      array.indexOf(suggestion) === index // Remove duplicates
    );
  }

  private calculateAccuracyScore(analysis: FinancialAnalysis, context: AssessmentContext): number {
    let score = 8; // Start with good score, deduct for issues

    // Deduct for data consistency issues
    score -= analysis.inconsistentData.length * 1.5;
    score -= analysis.unrealisticClaims.length * 2;
    score -= analysis.calculationErrors.length * 1.5;

    // Deduct for terminology issues
    score -= analysis.termUsageAccuracy.incorrectUsages.length * 0.5;

    // Deduct for missing risk disclosures
    if (this.requiresRiskDisclosure(context.contentType) && !analysis.hasRiskDisclosures) {
      score -= 2;
    }

    // Deduct for outdated data
    if (analysis.dataRecency.hasOutdatedData) {
      score -= Math.min(2, analysis.dataRecency.oldestDataAge / 12); // More deduction for older data
    }

    // Deduct for missing citations with performance claims
    if (analysis.performanceClaims.length > 0 && !analysis.hasSourceCitations) {
      score -= 1.5;
    }

    // Bonus for good practices
    if (analysis.hasSourceCitations) score += 0.5;
    if (analysis.hasRiskDisclosures) score += 0.5;
    if (analysis.hasDisclaimers) score += 0.3;

    // Ensure score is within valid range
    return Math.max(1, Math.min(10, score));
  }

  private calculateConfidence(analysis: FinancialAnalysis, contentLength: number): number {
    let confidence = 0.85; // Base confidence

    // More confident with more financial content
    const financialContentRatio = (
      analysis.financialNumbers.length + 
      analysis.financialTerms.length + 
      analysis.stockSymbols.length
    ) / Math.max(1, contentLength / 100);

    if (financialContentRatio > 0.1) confidence += 0.1;
    if (financialContentRatio < 0.02) confidence -= 0.2;

    // Less confident with very technical content
    if (analysis.financialTerms.length > contentLength / 50) {
      confidence -= 0.1;
    }

    // More confident with proper structure
    if (analysis.hasSourceCitations) confidence += 0.05;
    if (analysis.hasRiskDisclosures) confidence += 0.05;

    return Math.max(0.4, Math.min(1, confidence));
  }

  private generateReasoning(
    analysis: FinancialAnalysis,
    score: number,
    context: AssessmentContext
  ): string {
    let reasoning = `Financial accuracy assessment based on: `;
    reasoning += `${analysis.financialNumbers.length} financial data points, `;
    reasoning += `${analysis.financialTerms.length} financial terms, `;
    reasoning += `${analysis.stockSymbols.length} stock symbols. `;

    if (analysis.inconsistentData.length > 0) {
      reasoning += `Found ${analysis.inconsistentData.length} data inconsistencies. `;
    }

    if (analysis.unrealisticClaims.length > 0) {
      reasoning += `Identified ${analysis.unrealisticClaims.length} potentially unrealistic claims. `;
    }

    if (score >= 8) {
      reasoning += 'Financial content demonstrates high accuracy and proper use of terminology.';
    } else if (score >= 6) {
      reasoning += 'Financial content is generally accurate but has some areas for improvement.';
    } else if (score >= 4) {
      reasoning += 'Financial content has accuracy issues that need to be addressed.';
    } else {
      reasoning += 'Financial content has significant accuracy problems requiring major revision.';
    }

    return reasoning;
  }

  // Helper methods for financial content analysis
  private extractStockSymbols(content: string): string[] {
    const symbolPattern = /\b[A-Z]{1,5}\b(?=\s|$|[.,;:])/g;
    const matches = content.match(symbolPattern) || [];
    
    // Filter out common false positives
    const commonWords = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'ITS']);
    
    return matches.filter(match => 
      !commonWords.has(match) && 
      match.length <= 5 &&
      match.length >= 1
    );
  }

  private extractFinancialNumbers(content: string): FinancialNumber[] {
    const patterns = [
      /\$[\d,]+(?:\.\d{2})?(?:[KMB])?/g, // Currency
      /[\d,]+(?:\.\d+)?%/g, // Percentages
      /[\d,]+(?:\.\d+)?\s*(?:billion|million|thousand|trillion)/gi, // Large numbers
      /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g, // General numbers
    ];

    const numbers: FinancialNumber[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        numbers.push({
          value: match,
          type: this.classifyNumberType(match),
          position: content.indexOf(match),
        });
      });
    });

    return numbers;
  }

  private extractPercentages(content: string): Percentage[] {
    const percentPattern = /([\d,]+(?:\.\d+)?)%/g;
    const matches = Array.from(content.matchAll(percentPattern));
    
    return matches.map(match => ({
      value: parseFloat(match[1].replace(',', '')),
      text: match[0],
      position: match.index || 0,
      context: this.getContext(content, match.index || 0, 50),
    }));
  }

  private extractFinancialTerms(content: string): FinancialTerm[] {
    const financialTerms = [
      'revenue', 'profit', 'earnings', 'EBITDA', 'cash flow', 'dividend',
      'market cap', 'P/E ratio', 'EPS', 'ROI', 'volatility', 'beta',
      'yield', 'spread', 'margin', 'equity', 'debt', 'assets', 'liabilities',
      'portfolio', 'diversification', 'hedge', 'derivative', 'option',
      'bond', 'stock', 'share', 'mutual fund', 'ETF', 'index'
    ];

    const terms: FinancialTerm[] = [];
    financialTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = Array.from(content.matchAll(regex));
      matches.forEach(match => {
        terms.push({
          term: match[0],
          position: match.index || 0,
          context: this.getContext(content, match.index || 0, 30),
        });
      });
    });

    return terms;
  }

  private extractDateReferences(content: string): DateReference[] {
    const datePatterns = [
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\bQ[1-4]\s+\d{4}\b/g,
      /\b\d{4}\s+fiscal year\b/gi,
    ];

    const dates: DateReference[] = [];
    datePatterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      matches.forEach(match => {
        dates.push({
          text: match[0],
          position: match.index || 0,
          estimatedDate: this.parseDate(match[0]),
        });
      });
    });

    return dates;
  }

  private extractPerformanceClaims(content: string): PerformanceClaim[] {
    const claimPatterns = [
      /(?:gained|increased|rose|grew|up)\s+[\d.]+%/gi,
      /(?:lost|decreased|fell|dropped|down)\s+[\d.]+%/gi,
      /(?:returned|yielded|generated)\s+[\d.]+%/gi,
      /(?:outperformed|beat|exceeded).*?by\s+[\d.]+%/gi,
    ];

    const claims: PerformanceClaim[] = [];
    claimPatterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      matches.forEach(match => {
        claims.push({
          text: match[0],
          position: match.index || 0,
          type: this.classifyClaimType(match[0]),
          confidence: this.assessClaimConfidence(match[0]),
        });
      });
    });

    return claims;
  }

  private extractRiskStatements(content: string): string[] {
    const riskPatterns = [
      /risk/gi,
      /uncertain/gi,
      /volatile/gi,
      /may\s+(?:decline|fall|lose)/gi,
      /past\s+performance.*not.*guarantee/gi,
    ];

    const statements: string[] = [];
    riskPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      statements.push(...matches);
    });

    return statements;
  }

  private extractPredictions(content: string): Prediction[] {
    const predictionPatterns = [
      /(?:will|expected to|projected to|forecasted to)\s+.{1,100}/gi,
      /(?:predict|expect|anticipate|forecast)\s+.{1,100}/gi,
      /by\s+\d{4}.*(?:will|should|expected)/gi,
    ];

    const predictions: Prediction[] = [];
    predictionPatterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      matches.forEach(match => {
        predictions.push({
          text: match[0],
          position: match.index || 0,
          confidence: this.assessPredictionConfidence(match[0]),
          timeframe: this.extractTimeframe(match[0]),
        });
      });
    });

    return predictions;
  }

  private extractHistoricalReferences(content: string): HistoricalReference[] {
    const historicalPatterns = [
      /in\s+\d{4}/gi,
      /since\s+\d{4}/gi,
      /over\s+the\s+(?:past|last)\s+\d+\s+(?:years?|months?)/gi,
    ];

    const references: HistoricalReference[] = [];
    historicalPatterns.forEach(pattern => {
      const matches = Array.from(content.matchAll(pattern));
      matches.forEach(match => {
        references.push({
          text: match[0],
          position: match.index || 0,
          period: this.extractHistoricalPeriod(match[0]),
        });
      });
    });

    return references;
  }

  private findInconsistentData(numbers: FinancialNumber[], percentages: Percentage[]): InconsistentData[] {
    // This is a simplified version - in reality, this would be much more sophisticated
    const inconsistencies: InconsistentData[] = [];
    
    // Check for percentage values over 100% that might be unrealistic
    percentages.forEach(pct => {
      if (pct.value > 200 && pct.context.includes('return')) {
        inconsistencies.push({
          description: `Extremely high return percentage: ${pct.value}%`,
          location: { startIndex: pct.position, endIndex: pct.position + pct.text.length },
        });
      }
    });

    return inconsistencies;
  }

  private findUnrealisticClaims(claims: PerformanceClaim[], percentages: Percentage[]): UnrealisticClaim[] {
    const unrealistic: UnrealisticClaim[] = [];
    
    claims.forEach(claim => {
      // Check for guaranteed returns
      if (claim.text.toLowerCase().includes('guarantee') && claim.type === 'positive_return') {
        unrealistic.push({
          description: `Guaranteed return claim: "${claim.text}"`,
          location: { startIndex: claim.position, endIndex: claim.position + claim.text.length },
        });
      }
      
      // Check for extremely high returns without proper context
      if (claim.confidence === 'low' && claim.type === 'positive_return') {
        const numbers = claim.text.match(/[\d.]+/g);
        if (numbers && parseFloat(numbers[0]) > 50) {
          unrealistic.push({
            description: `Potentially unrealistic return claim: "${claim.text}"`,
            location: { startIndex: claim.position, endIndex: claim.position + claim.text.length },
          });
        }
      }
    });

    return unrealistic;
  }

  private verifyTerminologyUsage(terms: FinancialTerm[], content: string): TerminologyAccuracy {
    const incorrectUsages: IncorrectUsage[] = [];
    
    // Simple checks for common misusages
    terms.forEach(term => {
      const context = term.context.toLowerCase();
      
      // Check for common confusions
      if (term.term.toLowerCase() === 'revenue' && context.includes('profit')) {
        incorrectUsages.push({
          term: term.term,
          correctTerm: 'revenue (top-line) vs profit (bottom-line)',
          location: { startIndex: term.position, endIndex: term.position + term.term.length },
        });
      }
    });

    return {
      totalTerms: terms.length,
      correctUsages: terms.length - incorrectUsages.length,
      incorrectUsages,
    };
  }

  private verifyCalculations(content: string, numbers: FinancialNumber[]): CalculationError[] {
    const errors: CalculationError[] = [];
    
    // Simple calculation verification (this would be much more sophisticated in practice)
    const calculationPattern = /([\d.]+)\s*[+\-*/]\s*([\d.]+)\s*=\s*([\d.]+)/g;
    const matches = Array.from(content.matchAll(calculationPattern));
    
    matches.forEach(match => {
      const [full, num1, operator, num2, result] = match;
      const a = parseFloat(num1);
      const b = parseFloat(num2);
      const expectedResult = parseFloat(result);
      
      let actualResult: number;
      switch (operator.trim()) {
        case '+': actualResult = a + b; break;
        case '-': actualResult = a - b; break;
        case '*': actualResult = a * b; break;
        case '/': actualResult = a / b; break;
        default: return;
      }
      
      if (Math.abs(actualResult - expectedResult) > 0.01) {
        errors.push({
          description: `Calculation error: ${full} (should be ${actualResult.toFixed(2)})`,
          location: { startIndex: match.index || 0, endIndex: (match.index || 0) + full.length },
        });
      }
    });

    return errors;
  }

  // Additional helper methods...
  private hasSourceCitations(content: string): boolean {
    const citationPatterns = [
      /\(.*\d{4}.*\)/,
      /source:/i,
      /according to/i,
      /data from/i,
      /reported by/i,
    ];
    return citationPatterns.some(pattern => pattern.test(content));
  }

  private hasRiskDisclosures(content: string): boolean {
    const riskPatterns = [
      /past performance.*not.*guarantee/i,
      /investment.*risk/i,
      /may lose money/i,
      /consult.*financial advisor/i,
    ];
    return riskPatterns.some(pattern => pattern.test(content));
  }

  private hasDisclaimers(content: string): boolean {
    const disclaimerPatterns = [
      /disclaimer/i,
      /for informational purposes/i,
      /not financial advice/i,
      /educational purposes/i,
    ];
    return disclaimerPatterns.some(pattern => pattern.test(content));
  }

  private assessDataRecency(dateRefs: DateReference[]): DataRecency {
    const currentDate = new Date();
    let oldestDataAge = 0;
    let hasOutdatedData = false;

    dateRefs.forEach(ref => {
      if (ref.estimatedDate) {
        const ageInMonths = (currentDate.getTime() - ref.estimatedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (ageInMonths > oldestDataAge) {
          oldestDataAge = ageInMonths;
        }
        if (ageInMonths > 12) { // Data older than 1 year
          hasOutdatedData = true;
        }
      }
    });

    return {
      hasOutdatedData,
      oldestDataAge: Math.round(oldestDataAge),
    };
  }

  private requiresRiskDisclosure(contentType: ContentType): boolean {
    return [
      ContentType.INVESTMENT_MEMO,
      ContentType.MARKET_ANALYSIS,
      ContentType.RESEARCH_REPORT,
      ContentType.NEWSLETTER
    ].includes(contentType);
  }

  private containsInvestmentAdvice(analysis: FinancialAnalysis): boolean {
    return analysis.performanceClaims.length > 0 || 
           analysis.predictions.length > 0 ||
           analysis.stockSymbols.length > 0;
  }

  // Utility methods...
  private classifyNumberType(numStr: string): string {
    if (numStr.includes('$')) return 'currency';
    if (numStr.includes('%')) return 'percentage';
    if (numStr.toLowerCase().includes('billion') || numStr.toLowerCase().includes('million')) return 'large_number';
    return 'general';
  }

  private getContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.substring(start, end);
  }

  private parseDate(dateStr: string): Date | null {
    try {
      // Simple date parsing - would be more sophisticated in practice
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  private classifyClaimType(claimText: string): string {
    if (/gained|increased|rose|grew|up|outperformed|beat|exceeded/i.test(claimText)) {
      return 'positive_return';
    }
    if (/lost|decreased|fell|dropped|down/i.test(claimText)) {
      return 'negative_return';
    }
    return 'general_performance';
  }

  private assessClaimConfidence(claimText: string): 'high' | 'medium' | 'low' {
    if (/guarantee|certain|definitely/i.test(claimText)) return 'high';
    if (/likely|probably|expected/i.test(claimText)) return 'medium';
    return 'low';
  }

  private assessPredictionConfidence(predictionText: string): 'high' | 'medium' | 'low' {
    if (/will definitely|guaranteed to|certain to/i.test(predictionText)) return 'high';
    if (/likely to|expected to|projected to/i.test(predictionText)) return 'medium';
    return 'low';
  }

  private extractTimeframe(text: string): string {
    const timeframes = text.match(/\d{4}|next \w+|within \w+/i);
    return timeframes ? timeframes[0] : 'unspecified';
  }

  private extractHistoricalPeriod(text: string): number {
    const yearMatch = text.match(/\d+/);
    return yearMatch ? parseInt(yearMatch[0]) : 0;
  }
}

// Interfaces for financial analysis
interface FinancialAnalysis {
  stockSymbols: string[];
  financialNumbers: FinancialNumber[];
  percentages: Percentage[];
  financialTerms: FinancialTerm[];
  dateReferences: DateReference[];
  performanceClaims: PerformanceClaim[];
  riskStatements: string[];
  predictions: Prediction[];
  historicalReferences: HistoricalReference[];
  inconsistentData: InconsistentData[];
  unrealisticClaims: UnrealisticClaim[];
  termUsageAccuracy: TerminologyAccuracy;
  calculationErrors: CalculationError[];
  hasSourceCitations: boolean;
  hasRiskDisclosures: boolean;
  hasDisclaimers: boolean;
  dataRecency: DataRecency;
}

interface FinancialNumber {
  value: string;
  type: string;
  position: number;
}

interface Percentage {
  value: number;
  text: string;
  position: number;
  context: string;
}

interface FinancialTerm {
  term: string;
  position: number;
  context: string;
}

interface DateReference {
  text: string;
  position: number;
  estimatedDate: Date | null;
}

interface PerformanceClaim {
  text: string;
  position: number;
  type: string;
  confidence: 'high' | 'medium' | 'low';
}

interface Prediction {
  text: string;
  position: number;
  confidence: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface HistoricalReference {
  text: string;
  position: number;
  period: number;
}

interface InconsistentData {
  description: string;
  location: { startIndex: number; endIndex: number };
}

interface UnrealisticClaim {
  description: string;
  location: { startIndex: number; endIndex: number };
}

interface TerminologyAccuracy {
  totalTerms: number;
  correctUsages: number;
  incorrectUsages: IncorrectUsage[];
}

interface IncorrectUsage {
  term: string;
  correctTerm: string;
  location: { startIndex: number; endIndex: number };
}

interface CalculationError {
  description: string;
  location: { startIndex: number; endIndex: number };
}

interface DataRecency {
  hasOutdatedData: boolean;
  oldestDataAge: number;
}