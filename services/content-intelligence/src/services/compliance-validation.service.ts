import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import OpenAI from 'openai';

// Entities
import { ComplianceRule } from '../entities/compliance-rule.entity';

// DTOs
import { ComplianceLevel } from '../dto/content-generation.dto';

export interface ComplianceViolation {
  ruleId: string;
  ruleName: string;
  ruleCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  violationText: string;
  suggestion: string;
  confidence: number;
}

export interface ComplianceResult {
  compliant: boolean;
  score: number;
  violations: ComplianceViolation[];
  requiredDisclaimers: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  validatedAt: string;
}

@Injectable()
export class ComplianceValidationService {
  private readonly logger = new Logger(ComplianceValidationService.name);
  private readonly openai: OpenAI;
  private cachedRules: ComplianceRule[] = [];
  private rulesCacheTime = 0;
  private readonly rulesCacheTimeout = 60 * 60 * 1000; // 1 hour

  constructor(
    @InjectRepository(ComplianceRule)
    private readonly complianceRuleRepository: Repository<ComplianceRule>,
    private readonly configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('ai.openai.apiKey'),
    });
  }

  async validateCompliance(
    content: string,
    jurisdictions: string[],
    contentType: string,
    complianceLevel: ComplianceLevel = ComplianceLevel.STANDARD,
  ): Promise<ComplianceResult> {
    const startTime = Date.now();

    try {
      this.logger.log('Starting compliance validation', {
        contentType,
        jurisdictions,
        complianceLevel,
        contentLength: content.length,
      });

      // Get applicable compliance rules
      const applicableRules = await this.getApplicableRules(
        jurisdictions,
        contentType,
        complianceLevel,
      );

      this.logger.debug(`Found ${applicableRules.length} applicable compliance rules`);

      // Check each rule against the content
      const violations: ComplianceViolation[] = [];
      for (const rule of applicableRules) {
        const violation = await this.checkRule(content, rule);
        if (violation) {
          violations.push(violation);
        }
      }

      // Calculate overall compliance score
      const score = this.calculateComplianceScore(violations, applicableRules.length);

      // Determine risk level
      const riskLevel = this.assessRiskLevel(violations, contentType);

      // Generate required disclaimers
      const requiredDisclaimers = await this.generateDisclaimers(
        contentType,
        jurisdictions,
        riskLevel,
        violations,
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(violations);

      const result: ComplianceResult = {
        compliant: violations.length === 0,
        score,
        violations,
        requiredDisclaimers,
        riskLevel,
        recommendations,
        validatedAt: new Date().toISOString(),
      };

      const validationTime = Date.now() - startTime;
      this.logger.log('Compliance validation completed', {
        compliant: result.compliant,
        score: result.score,
        violationCount: violations.length,
        riskLevel: result.riskLevel,
        validationTimeMs: validationTime,
      });

      return result;
    } catch (error) {
      this.logger.error('Compliance validation failed', {
        error: error.message,
        stack: error.stack,
        contentType,
        jurisdictions,
      });

      // Return a conservative result in case of error
      return {
        compliant: false,
        score: 0,
        violations: [{
          ruleId: 'error',
          ruleName: 'Validation Error',
          ruleCategory: 'SYSTEM',
          severity: 'critical',
          description: 'Compliance validation system error',
          violationText: 'System error occurred during validation',
          suggestion: 'Manual review required',
          confidence: 1.0,
        }],
        requiredDisclaimers: ['Manual compliance review required due to system error'],
        riskLevel: 'critical',
        recommendations: ['Require manual compliance review before publishing'],
        validatedAt: new Date().toISOString(),
      };
    }
  }

  private async getApplicableRules(
    jurisdictions: string[],
    contentType: string,
    complianceLevel: ComplianceLevel,
  ): Promise<ComplianceRule[]> {
    const now = Date.now();

    // Refresh rules cache if needed
    if (!this.cachedRules.length || (now - this.rulesCacheTime) > this.rulesCacheTimeout) {
      this.cachedRules = await this.complianceRuleRepository.find({
        where: { isActive: true },
      });
      this.rulesCacheTime = now;
    }

    // Filter rules by jurisdiction, content type, and compliance level
    return this.cachedRules.filter(rule => {
      // Check jurisdiction
      const jurisdictionMatch = rule.applicableJurisdictions.some(j => 
        jurisdictions.includes(j) || j === 'GLOBAL'
      );

      // Check content type (if rule specifies content types)
      const contentTypeMatch = !rule.applicableContentTypes?.length ||
        rule.applicableContentTypes.includes(contentType) ||
        rule.applicableContentTypes.includes('ALL');

      // Check compliance level
      const levelMatch = this.shouldApplyRule(rule.severityLevel, complianceLevel);

      // Check if rule is currently effective
      const now = new Date();
      const effectiveMatch = new Date(rule.effectiveDate) <= now &&
        (!rule.expiryDate || new Date(rule.expiryDate) > now);

      return jurisdictionMatch && contentTypeMatch && levelMatch && effectiveMatch;
    });
  }

  private shouldApplyRule(ruleSeverity: string, complianceLevel: ComplianceLevel): boolean {
    const severityLevels = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
    };

    const complianceLevels = {
      [ComplianceLevel.LOW]: 2,
      [ComplianceLevel.STANDARD]: 3,
      [ComplianceLevel.HIGH]: 4,
      [ComplianceLevel.REGULATORY]: 4,
    };

    return severityLevels[ruleSeverity] <= complianceLevels[complianceLevel];
  }

  private async checkRule(content: string, rule: ComplianceRule): Promise<ComplianceViolation | null> {
    try {
      // First, check using keyword detection
      if (rule.detectionKeywords?.length) {
        const keywordViolation = this.checkKeywords(content, rule);
        if (keywordViolation) {
          return keywordViolation;
        }
      }

      // Then use AI-based analysis for more sophisticated detection
      return await this.checkRuleWithAI(content, rule);
    } catch (error) {
      this.logger.warn('Failed to check rule', {
        ruleId: rule.id,
        ruleName: rule.ruleName,
        error: error.message,
      });
      return null;
    }
  }

  private checkKeywords(content: string, rule: ComplianceRule): ComplianceViolation | null {
    const lowerContent = content.toLowerCase();
    
    for (const keyword of rule.detectionKeywords || []) {
      const lowerKeyword = keyword.toLowerCase();
      if (lowerContent.includes(lowerKeyword)) {
        return {
          ruleId: rule.id,
          ruleName: rule.ruleName,
          ruleCategory: rule.ruleCategory,
          severity: rule.severityLevel as any,
          description: rule.ruleDescription,
          violationText: this.extractViolationContext(content, keyword),
          suggestion: this.generateBasicSuggestion(rule),
          confidence: 0.7, // Lower confidence for keyword-based detection
        };
      }
    }

    return null;
  }

  private async checkRuleWithAI(content: string, rule: ComplianceRule): Promise<ComplianceViolation | null> {
    try {
      const prompt = this.buildAICompliancePrompt(content, rule);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.1, // Low temperature for consistent compliance checking
      });

      const analysisResult = response.choices[0]?.message?.content || '';
      return this.parseAIComplianceResponse(analysisResult, rule);
    } catch (error) {
      this.logger.warn('AI compliance check failed', {
        ruleId: rule.id,
        error: error.message,
      });
      return null;
    }
  }

  private buildAICompliancePrompt(content: string, rule: ComplianceRule): string {
    return `As a financial compliance expert, analyze the following content for violations of this specific regulation:

REGULATION:
Name: ${rule.ruleName}
Category: ${rule.ruleCategory}
Description: ${rule.ruleDescription}
${rule.interpretationGuidance ? `\nGuidance: ${rule.interpretationGuidance}` : ''}

CONTENT TO ANALYZE:
${content}

Please analyze whether this content violates the regulation. Respond in this JSON format:
{
  "violation": true/false,
  "confidence": 0.0-1.0,
  "violationText": "specific text that violates the rule",
  "explanation": "why this is a violation",
  "suggestion": "how to fix the violation"
}

Only return the JSON, no other text.`;
  }

  private parseAIComplianceResponse(response: string, rule: ComplianceRule): ComplianceViolation | null {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(cleaned);

      if (analysis.violation && analysis.confidence > 0.6) {
        return {
          ruleId: rule.id,
          ruleName: rule.ruleName,
          ruleCategory: rule.ruleCategory,
          severity: rule.severityLevel as any,
          description: analysis.explanation || rule.ruleDescription,
          violationText: analysis.violationText || '',
          suggestion: analysis.suggestion || this.generateBasicSuggestion(rule),
          confidence: analysis.confidence,
        };
      }

      return null;
    } catch (error) {
      this.logger.warn('Failed to parse AI compliance response', {
        response,
        error: error.message,
      });
      return null;
    }
  }

  private extractViolationContext(content: string, keyword: string, contextLength: number = 100): string {
    const index = content.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return keyword;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + keyword.length + contextLength);
    
    return content.substring(start, end).trim();
  }

  private generateBasicSuggestion(rule: ComplianceRule): string {
    const suggestions: Record<string, string> = {
      'SEC': 'Add appropriate SEC disclaimers and risk warnings',
      'FINRA': 'Include required FINRA disclosures and supervisory approval',
      'GDPR': 'Ensure data privacy compliance and user consent mechanisms',
      'FCA': 'Include FCA-required risk warnings and regulatory disclaimers',
    };

    return suggestions[rule.ruleCategory] || 
      'Review content with legal/compliance team and add appropriate disclaimers';
  }

  private calculateComplianceScore(violations: ComplianceViolation[], totalRules: number): number {
    if (totalRules === 0) return 10; // Perfect score if no rules apply

    const severityWeights = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4,
    };

    const totalWeight = violations.reduce((sum, violation) => 
      sum + severityWeights[violation.severity], 0
    );

    const maxPossibleWeight = totalRules * 4; // Assuming all could be critical
    const penaltyRatio = totalWeight / maxPossibleWeight;
    
    return Math.max(0, 10 * (1 - penaltyRatio));
  }

  private assessRiskLevel(violations: ComplianceViolation[], contentType: string): 'low' | 'medium' | 'high' | 'critical' {
    if (!violations.length) return 'low';

    const hasCritical = violations.some(v => v.severity === 'critical');
    const hasHigh = violations.some(v => v.severity === 'high');
    const highRiskContent = ['analysis', 'recommendation', 'investment_advice'].includes(contentType);

    if (hasCritical || (hasHigh && highRiskContent)) return 'critical';
    if (hasHigh || violations.length > 3) return 'high';
    if (violations.length > 1) return 'medium';
    return 'low';
  }

  private async generateDisclaimers(
    contentType: string,
    jurisdictions: string[],
    riskLevel: string,
    violations: ComplianceViolation[],
  ): Promise<string[]> {
    const disclaimers: string[] = [];

    // Standard financial disclaimer
    if (['analysis', 'recommendation', 'post'].includes(contentType)) {
      disclaimers.push(
        'This content is for informational purposes only and should not be considered as personalized investment advice.'
      );
    }

    // Risk warning for high-risk content
    if (riskLevel === 'high' || riskLevel === 'critical') {
      disclaimers.push(
        'All investments involve risk, including the potential loss of principal. Past performance does not guarantee future results.'
      );
    }

    // Jurisdiction-specific disclaimers
    if (jurisdictions.includes('US')) {
      disclaimers.push(
        'Securities offered through registered representatives. Member FINRA/SIPC.'
      );
    }

    if (jurisdictions.includes('EU')) {
      disclaimers.push(
        'This communication is marketing material and is not independent investment research.'
      );
    }

    // Rule-specific disclaimers
    violations.forEach(violation => {
      if (violation.ruleCategory === 'SEC' && !disclaimers.find(d => d.includes('SEC'))) {
        disclaimers.push(
          'This content has not been approved by the SEC and should not be relied upon for investment decisions.'
        );
      }
    });

    return disclaimers;
  }

  private generateRecommendations(violations: ComplianceViolation[]): string[] {
    if (!violations.length) {
      return ['Content appears to be compliant with applicable regulations.'];
    }

    const recommendations: string[] = [];

    // Critical violations
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      recommendations.push('URGENT: Manual legal review required before publication due to critical compliance violations.');
    }

    // High severity violations
    const highViolations = violations.filter(v => v.severity === 'high');
    if (highViolations.length > 0) {
      recommendations.push('Compliance team review recommended for high-severity violations.');
    }

    // General recommendations
    recommendations.push('Consider adding appropriate disclaimers and risk warnings.');
    recommendations.push('Ensure all factual claims are supported by reliable sources.');

    if (violations.some(v => v.ruleCategory === 'SEC')) {
      recommendations.push('Review content against SEC advertising rules and disclosure requirements.');
    }

    if (violations.some(v => v.ruleCategory === 'FINRA')) {
      recommendations.push('Ensure FINRA supervisory approval process is followed.');
    }

    return recommendations;
  }

  async addComplianceRule(ruleData: Partial<ComplianceRule>): Promise<ComplianceRule> {
    const rule = this.complianceRuleRepository.create(ruleData);
    const savedRule = await this.complianceRuleRepository.save(rule);
    
    // Clear cache to force refresh
    this.cachedRules = [];
    
    this.logger.log('New compliance rule added', { ruleId: savedRule.id, ruleName: savedRule.ruleName });
    return savedRule;
  }

  async updateComplianceRule(ruleId: string, updates: Partial<ComplianceRule>): Promise<ComplianceRule> {
    await this.complianceRuleRepository.update(ruleId, updates);
    const updatedRule = await this.complianceRuleRepository.findOne({ where: { id: ruleId } });
    
    if (!updatedRule) {
      throw new Error(`Compliance rule not found: ${ruleId}`);
    }

    // Clear cache to force refresh
    this.cachedRules = [];
    
    this.logger.log('Compliance rule updated', { ruleId, ruleName: updatedRule.ruleName });
    return updatedRule;
  }

  async getComplianceRules(filters?: {
    category?: string;
    jurisdiction?: string;
    contentType?: string;
  }): Promise<ComplianceRule[]> {
    const query = this.complianceRuleRepository.createQueryBuilder('rule')
      .where('rule.isActive = :isActive', { isActive: true });

    if (filters?.category) {
      query.andWhere('rule.ruleCategory = :category', { category: filters.category });
    }

    if (filters?.jurisdiction) {
      query.andWhere(':jurisdiction = ANY(rule.applicableJurisdictions)', { jurisdiction: filters.jurisdiction });
    }

    if (filters?.contentType) {
      query.andWhere('(:contentType = ANY(rule.applicableContentTypes) OR array_length(rule.applicableContentTypes, 1) IS NULL)', 
        { contentType: filters.contentType });
    }

    return query.getMany();
  }
}