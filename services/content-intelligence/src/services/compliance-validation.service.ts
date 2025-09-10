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
  jurisdiction: string[];
  auditTrail: AuditEntry[];
  automaticCorrections: AutomaticCorrection[];
  complianceChecklist: ComplianceChecklistItem[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  details: string;
  userId?: string;
  systemGenerated: boolean;
}

export interface AutomaticCorrection {
  original: string;
  corrected: string;
  reason: string;
  confidence: number;
}

export interface ComplianceChecklistItem {
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable';
  details: string;
}

@Injectable()
export class ComplianceValidationService {
  private readonly logger = new Logger(ComplianceValidationService.name);
  private readonly openai: OpenAI;
  private cachedRules: ComplianceRule[] = [];
  private rulesCacheTime = 0;
  private readonly rulesCacheTimeout = 60 * 60 * 1000; // 1 hour

  // Enhanced regulatory rule sets
  private readonly regulatoryFrameworks = {
    SEC: {
      name: 'Securities and Exchange Commission',
      rules: ['Investment Advice Disclosure', 'Risk Warnings', 'Performance Claims', 'Material Information'],
      strictness: 'high',
    },
    FINRA: {
      name: 'Financial Industry Regulatory Authority',
      rules: ['Communications Standards', 'Supervision Requirements', 'Suitability Standards'],
      strictness: 'high',
    },
    GDPR: {
      name: 'General Data Protection Regulation',
      rules: ['Data Privacy', 'Consent Requirements', 'Right to be Forgotten'],
      strictness: 'medium',
    },
    FCA: {
      name: 'Financial Conduct Authority',
      rules: ['Clear and Fair Communications', 'Risk Disclosure', 'Product Promotion'],
      strictness: 'high',
    },
    CFTC: {
      name: 'Commodity Futures Trading Commission',
      rules: ['Futures Disclosure', 'Commodity Pool Regulations', 'Swap Dealer Rules'],
      strictness: 'high',
    },
    MiFID: {
      name: 'Markets in Financial Instruments Directive',
      rules: ['Investor Protection', 'Market Transparency', 'Best Execution'],
      strictness: 'medium',
    },
  };

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
    userId?: string,
  ): Promise<ComplianceResult> {
    const startTime = Date.now();
    const auditTrail: AuditEntry[] = [];
    const automaticCorrections: AutomaticCorrection[] = [];

    try {
      this.logger.log('Starting enhanced compliance validation', {
        contentType,
        jurisdictions,
        complianceLevel,
        contentLength: content.length,
        userId,
      });

      // Create audit entry
      auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'compliance_validation_started',
        details: `Validating ${contentType} for jurisdictions: ${jurisdictions.join(', ')}, level: ${complianceLevel}`,
        userId,
        systemGenerated: true,
      });

      // Get applicable compliance rules
      const applicableRules = await this.getApplicableRules(
        jurisdictions,
        contentType,
        complianceLevel,
      );

      this.logger.debug(`Found ${applicableRules.length} applicable compliance rules`);
      auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'rules_loaded',
        details: `Loaded ${applicableRules.length} applicable rules`,
        systemGenerated: true,
      });

      // Perform comprehensive compliance checks
      const [ruleViolations, aiViolations, complianceChecklist, corrections] = await Promise.all([
        this.checkRulesCompliance(content, applicableRules),
        this.performAIComplianceCheck(content, jurisdictions, contentType),
        this.generateComplianceChecklist(content, jurisdictions, contentType),
        this.performAutomaticCorrections(content, contentType),
      ]);

      automaticCorrections.push(...corrections);

      // Combine all violations
      const violations = [...ruleViolations, ...aiViolations];

      // Calculate overall compliance score
      const score = this.calculateComplianceScore(violations, applicableRules.length);

      // Determine risk level
      const riskLevel = this.assessRiskLevel(violations, contentType);

      // Generate enhanced disclaimers
      const requiredDisclaimers = await this.generateEnhancedDisclaimers(
        contentType,
        jurisdictions,
        riskLevel,
        violations,
      );

      // Generate enhanced recommendations
      const recommendations = this.generateEnhancedRecommendations(
        violations,
        complianceChecklist,
        jurisdictions,
      );

      auditTrail.push({
        timestamp: new Date().toISOString(),
        action: 'compliance_validation_completed',
        details: `Score: ${score}, Violations: ${violations.length}, Risk: ${riskLevel}`,
        systemGenerated: true,
      });

      const result: ComplianceResult = {
        compliant: violations.length === 0 && score >= 8.0,
        score,
        violations,
        requiredDisclaimers,
        riskLevel,
        recommendations,
        validatedAt: new Date().toISOString(),
        jurisdiction: jurisdictions,
        auditTrail,
        automaticCorrections,
        complianceChecklist,
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

  /**
   * Enhanced method to check rules compliance with AI assistance
   */
  private async checkRulesCompliance(
    content: string,
    rules: ComplianceRule[],
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    for (const rule of rules) {
      try {
        const violation = await this.checkRuleWithAI(content, rule);
        if (violation) {
          violations.push(violation);
        }
      } catch (error) {
        this.logger.warn(`Rule check failed for rule ${rule.id}`, { error: error.message });
      }
    }

    return violations;
  }

  /**
   * AI-enhanced rule checking
   */
  private async checkRuleWithAI(content: string, rule: ComplianceRule): Promise<ComplianceViolation | null> {
    try {
      const prompt = `You are a compliance expert. Check if the following content violates this regulation rule:

Rule: ${rule.name}
Description: ${rule.description}
Category: ${rule.category}

Content to check:
${content}

If there's a violation, respond with JSON:
{
  "violation": true,
  "violationText": "specific text that violates the rule",
  "confidence": 0.8,
  "suggestion": "how to fix this violation"
}

If no violation, respond with:
{"violation": false}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"violation": false}');

      if (result.violation) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          ruleCategory: rule.category,
          severity: rule.severity as any,
          description: rule.description,
          violationText: result.violationText || '',
          suggestion: result.suggestion || 'Review and modify content to comply with regulations',
          confidence: result.confidence || 0.8,
        };
      }

      return null;
    } catch (error) {
      this.logger.warn(`AI rule check failed for rule ${rule.id}`, { error: error.message });
      return null;
    }
  }

  /**
   * Perform AI-based compliance check across multiple regulatory frameworks
   */
  private async performAIComplianceCheck(
    content: string,
    jurisdictions: string[],
    contentType: string,
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];

    for (const jurisdiction of jurisdictions) {
      try {
        const frameworkViolations = await this.checkFrameworkCompliance(content, jurisdiction, contentType);
        violations.push(...frameworkViolations);
      } catch (error) {
        this.logger.warn(`AI compliance check failed for ${jurisdiction}`, { error: error.message });
      }
    }

    return violations;
  }

  /**
   * Check compliance against specific regulatory framework
   */
  private async checkFrameworkCompliance(
    content: string,
    jurisdiction: string,
    contentType: string,
  ): Promise<ComplianceViolation[]> {
    const framework = this.regulatoryFrameworks[jurisdiction.toUpperCase() as keyof typeof this.regulatoryFrameworks];
    
    if (!framework) {
      return [];
    }

    const prompt = `You are a ${framework.name} compliance expert. Analyze this ${contentType} content for regulatory violations:

Regulatory Framework: ${framework.name}
Key Areas: ${framework.rules.join(', ')}
Strictness Level: ${framework.strictness}

Content:
${content}

Identify any violations and return a JSON array of violations:
[
  {
    "ruleCategory": "category",
    "severity": "low|medium|high|critical",
    "description": "description of violation",
    "violationText": "specific problematic text",
    "suggestion": "how to fix",
    "confidence": 0.8
  }
]

If no violations found, return: []`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const violations = JSON.parse(response.choices[0]?.message?.content || '[]');
      
      return violations.map((v: any, index: number) => ({
        ruleId: `${jurisdiction.toLowerCase()}_ai_${index}`,
        ruleName: `${framework.name} - ${v.ruleCategory}`,
        ruleCategory: v.ruleCategory,
        severity: v.severity,
        description: v.description,
        violationText: v.violationText,
        suggestion: v.suggestion,
        confidence: v.confidence,
      }));
    } catch (error) {
      this.logger.warn(`Framework compliance check failed for ${jurisdiction}`, { error: error.message });
      return [];
    }
  }

  /**
   * Generate comprehensive compliance checklist
   */
  private async generateComplianceChecklist(
    content: string,
    jurisdictions: string[],
    contentType: string,
  ): Promise<ComplianceChecklistItem[]> {
    const checklist: ComplianceChecklistItem[] = [];

    // General financial content requirements
    checklist.push({
      category: 'Disclaimers',
      requirement: 'Contains appropriate investment disclaimers',
      status: this.hasInvestmentDisclaimer(content) ? 'pass' : 'fail',
      details: 'Investment advice disclaimers are required for financial content',
    });

    checklist.push({
      category: 'Risk Warnings',
      requirement: 'Includes risk warnings where applicable',
      status: this.hasRiskWarnings(content) ? 'pass' : 'warning',
      details: 'Risk warnings help inform readers about potential losses',
    });

    // Jurisdiction-specific checks
    for (const jurisdiction of jurisdictions) {
      const frameworkChecks = this.getFrameworkChecklist(content, jurisdiction, contentType);
      checklist.push(...frameworkChecks);
    }

    return checklist;
  }

  private hasInvestmentDisclaimer(content: string): boolean {
    const disclaimerPatterns = [
      /not investment advice/i,
      /consult.*financial advisor/i,
      /past performance.*not guarantee/i,
      /for informational purposes only/i,
    ];

    return disclaimerPatterns.some(pattern => pattern.test(content));
  }

  private hasRiskWarnings(content: string): boolean {
    const riskPatterns = [
      /risk of loss/i,
      /may lose money/i,
      /investment risks/i,
      /volatile/i,
      /uncertain/i,
    ];

    return riskPatterns.some(pattern => pattern.test(content));
  }

  private getFrameworkChecklist(
    content: string,
    jurisdiction: string,
    contentType: string,
  ): ComplianceChecklistItem[] {
    const framework = this.regulatoryFrameworks[jurisdiction.toUpperCase() as keyof typeof this.regulatoryFrameworks];
    const checklist: ComplianceChecklistItem[] = [];

    if (!framework) return checklist;

    // Add framework-specific checks
    framework.rules.forEach(rule => {
      checklist.push({
        category: jurisdiction.toUpperCase(),
        requirement: rule,
        status: 'not_applicable', // Would be determined by AI in production
        details: `${framework.name} requirement: ${rule}`,
      });
    });

    return checklist;
  }

  /**
   * Perform automatic corrections where possible
   */
  private async performAutomaticCorrections(
    content: string,
    contentType: string,
  ): Promise<AutomaticCorrection[]> {
    const corrections: AutomaticCorrection[] = [];

    try {
      // Check for missing disclaimers
      if (!this.hasInvestmentDisclaimer(content) && contentType === 'analysis') {
        corrections.push({
          original: content,
          corrected: content + '\n\n*Disclaimer: This content is for informational purposes only and does not constitute investment advice.*',
          reason: 'Added required investment disclaimer',
          confidence: 0.95,
        });
      }

      // Check for aggressive language that needs softening
      const aggressivePatterns = [
        { pattern: /guaranteed returns?/gi, replacement: 'potential returns' },
        { pattern: /risk-free/gi, replacement: 'lower-risk' },
        { pattern: /always profitable/gi, replacement: 'historically profitable' },
        { pattern: /never fails/gi, replacement: 'rarely fails' },
      ];

      let correctedContent = content;
      aggressivePatterns.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
          correctedContent = correctedContent.replace(pattern, replacement);
          corrections.push({
            original: matches[0],
            corrected: replacement,
            reason: 'Softened aggressive language for compliance',
            confidence: 0.8,
          });
        }
      });

      return corrections;
    } catch (error) {
      this.logger.warn('Automatic corrections failed', { error: error.message });
      return [];
    }
  }

  /**
   * Generate enhanced disclaimers based on content analysis
   */
  private async generateEnhancedDisclaimers(
    contentType: string,
    jurisdictions: string[],
    riskLevel: string,
    violations: ComplianceViolation[],
  ): Promise<string[]> {
    const disclaimers: string[] = [];

    // Base disclaimer
    disclaimers.push('This content is for informational purposes only and does not constitute investment advice.');

    // Risk-based disclaimers
    if (riskLevel === 'high' || riskLevel === 'critical') {
      disclaimers.push('Investment involves substantial risk of loss and may not be suitable for all investors.');
    }

    // Content type specific
    if (contentType === 'analysis' || contentType === 'report') {
      disclaimers.push('Past performance is not indicative of future results.');
      disclaimers.push('Please consult with a qualified financial advisor before making investment decisions.');
    }

    // Jurisdiction specific disclaimers
    jurisdictions.forEach(jurisdiction => {
      if (jurisdiction.toUpperCase() === 'US') {
        disclaimers.push('Securities offered through FINRA member firms only.');
      }
      if (jurisdiction.toUpperCase() === 'EU') {
        disclaimers.push('This content complies with MiFID II investor protection requirements.');
      }
    });

    return disclaimers;
  }

  /**
   * Generate enhanced recommendations
   */
  private generateEnhancedRecommendations(
    violations: ComplianceViolation[],
    checklist: ComplianceChecklistItem[],
    jurisdictions: string[],
  ): string[] {
    const recommendations: string[] = [];

    // Violation-based recommendations
    const severityGroups = violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (severityGroups.critical > 0) {
      recommendations.push('Address critical compliance violations immediately before publishing');
    }

    if (severityGroups.high > 0) {
      recommendations.push('Review and resolve high-severity compliance issues');
    }

    // Checklist-based recommendations
    const failedChecks = checklist.filter(item => item.status === 'fail');
    if (failedChecks.length > 0) {
      recommendations.push(`Complete ${failedChecks.length} failed compliance requirements`);
    }

    // Jurisdiction-specific recommendations
    jurisdictions.forEach(jurisdiction => {
      const framework = this.regulatoryFrameworks[jurisdiction.toUpperCase() as keyof typeof this.regulatoryFrameworks];
      if (framework) {
        recommendations.push(`Ensure compliance with ${framework.name} standards`);
      }
    });

    return recommendations.length > 0 ? recommendations : ['Content appears to meet compliance standards'];
  }

  /**
   * Real-time compliance monitoring
   */
  async monitorComplianceRealTime(
    content: string,
    jurisdictions: string[],
    contentType: string,
  ): Promise<{
    riskScore: number;
    immediateIssues: string[];
    suggestions: string[];
    status: 'compliant' | 'warning' | 'violation';
  }> {
    try {
      // Quick compliance check for real-time editing
      const issues: string[] = [];
      const suggestions: string[] = [];
      let riskScore = 0;

      // Quick pattern matching for common violations
      if (!this.hasInvestmentDisclaimer(content) && contentType !== 'post') {
        issues.push('Missing investment disclaimer');
        suggestions.push('Add appropriate disclaimer');
        riskScore += 3;
      }

      if (/guaranteed profit|risk-free|never lose/i.test(content)) {
        issues.push('Contains prohibited guarantee language');
        suggestions.push('Remove guarantee claims');
        riskScore += 5;
      }

      // Determine status
      let status: 'compliant' | 'warning' | 'violation' = 'compliant';
      if (riskScore > 7) status = 'violation';
      else if (riskScore > 3) status = 'warning';

      return {
        riskScore,
        immediateIssues: issues,
        suggestions,
        status,
      };
    } catch (error) {
      this.logger.error('Real-time compliance monitoring failed', { error: error.message });
      return {
        riskScore: 10,
        immediateIssues: ['Compliance monitoring unavailable'],
        suggestions: ['Manual review required'],
        status: 'violation',
      };
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    results: ComplianceResult[],
    timeframe: { start: Date; end: Date },
  ): Promise<{
    summary: {
      totalValidations: number;
      complianceRate: number;
      averageScore: number;
      criticalViolations: number;
    };
    trends: {
      violationTypes: Record<string, number>;
      jurisdictionIssues: Record<string, number>;
      improvementAreas: string[];
    };
    recommendations: string[];
  }> {
    try {
      const summary = {
        totalValidations: results.length,
        complianceRate: results.filter(r => r.compliant).length / results.length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        criticalViolations: results.reduce((sum, r) => 
          sum + r.violations.filter(v => v.severity === 'critical').length, 0
        ),
      };

      // Analyze violation trends
      const violationTypes: Record<string, number> = {};
      const jurisdictionIssues: Record<string, number> = {};

      results.forEach(result => {
        result.violations.forEach(violation => {
          violationTypes[violation.ruleCategory] = (violationTypes[violation.ruleCategory] || 0) + 1;
        });

        result.jurisdiction.forEach(jurisdiction => {
          if (result.violations.length > 0) {
            jurisdictionIssues[jurisdiction] = (jurisdictionIssues[jurisdiction] || 0) + 1;
          }
        });
      });

      // Generate improvement recommendations
      const improvementAreas = Object.entries(violationTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      const recommendations = [
        `Focus training on top violation category: ${improvementAreas[0] || 'General compliance'}`,
        `Compliance rate is ${(summary.complianceRate * 100).toFixed(1)}% - target is 95%+`,
        `Average compliance score is ${summary.averageScore.toFixed(1)} - target is 8.5+`,
      ];

      if (summary.criticalViolations > 0) {
        recommendations.unshift(`Address ${summary.criticalViolations} critical violations immediately`);
      }

      return {
        summary,
        trends: {
          violationTypes,
          jurisdictionIssues,
          improvementAreas,
        },
        recommendations,
      };
    } catch (error) {
      this.logger.error('Compliance report generation failed', { error: error.message });
      throw error;
    }
  }
}