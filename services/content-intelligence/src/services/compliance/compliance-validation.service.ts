import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface ComplianceValidationRequest {
  content: string;
  contentType: string;
  targetAudience: string;
  publishChannel?: string;
  metadata?: any;
}

export interface ComplianceValidationResponse {
  id: string;
  isCompliant: boolean;
  overallScore: number; // 0-100
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  recommendations: ComplianceRecommendation[];
  auditTrail: AuditTrailEntry[];
  validatedAt: Date;
  processingTime: number;
}

export interface ComplianceViolation {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: ComplianceCategory;
  description: string;
  location?: ContentLocation;
  evidence: string;
  remediation: string;
  regulatoryReference?: string;
}

export interface ComplianceWarning {
  ruleId: string;
  ruleName: string;
  category: ComplianceCategory;
  description: string;
  recommendation: string;
}

export interface ComplianceRecommendation {
  category: ComplianceCategory;
  priority: 'high' | 'medium' | 'low';
  description: string;
  implementation: string;
  impact: string;
}

export interface AuditTrailEntry {
  timestamp: Date;
  action: string;
  details: string;
  userId?: string;
}

export interface ContentLocation {
  startIndex: number;
  endIndex: number;
  lineNumber?: number;
  context?: string;
}

export enum ComplianceCategory {
  SEC_REGULATIONS = 'sec_regulations',
  FINRA_RULES = 'finra_rules',
  GDPR_PRIVACY = 'gdpr_privacy',
  CCPA_PRIVACY = 'ccpa_privacy',
  INVESTMENT_ADVICE = 'investment_advice',
  RISK_DISCLOSURE = 'risk_disclosure',
  ANTI_MONEY_LAUNDERING = 'anti_money_laundering',
  MARKET_MANIPULATION = 'market_manipulation',
  ADVERTISING_STANDARDS = 'advertising_standards',
  DATA_PROTECTION = 'data_protection'
}

@Injectable()
export class ComplianceValidationService {
  private readonly logger = new Logger(ComplianceValidationService.name);
  private readonly complianceRules: Map<string, ComplianceRule> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeComplianceRules();
  }

  async validateCompliance(request: ComplianceValidationRequest, userId?: string): Promise<ComplianceValidationResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Validating compliance for ${request.contentType} content`);

      const auditTrail: AuditTrailEntry[] = [{
        timestamp: new Date(),
        action: 'COMPLIANCE_VALIDATION_STARTED',
        details: `Content type: ${request.contentType}, Target audience: ${request.targetAudience}`,
        userId,
      }];

      // Get applicable rules based on content type and audience
      const applicableRules = this.getApplicableRules(request);
      
      // Run compliance checks
      const violations: ComplianceViolation[] = [];
      const warnings: ComplianceWarning[] = [];

      for (const rule of applicableRules) {
        const result = await this.executeRule(rule, request);
        violations.push(...result.violations);
        warnings.push(...result.warnings);
      }

      // Calculate compliance score
      const overallScore = this.calculateComplianceScore(violations, warnings);
      
      // Determine compliance status
      const isCompliant = this.determineComplianceStatus(violations, overallScore);

      // Generate recommendations
      const recommendations = this.generateRecommendations(violations, warnings, request);

      const processingTime = Date.now() - startTime;

      auditTrail.push({
        timestamp: new Date(),
        action: 'COMPLIANCE_VALIDATION_COMPLETED',
        details: `Score: ${overallScore}, Violations: ${violations.length}, Warnings: ${warnings.length}`,
        userId,
      });

      const response: ComplianceValidationResponse = {
        id: this.generateValidationId(),
        isCompliant,
        overallScore,
        violations,
        warnings,
        recommendations,
        auditTrail,
        validatedAt: new Date(),
        processingTime,
      };

      // Emit compliance validation event
      this.eventEmitter.emit('compliance.validated', {
        validationId: response.id,
        userId,
        contentType: request.contentType,
        isCompliant,
        overallScore,
        violationCount: violations.length,
        processingTime,
      });

      return response;
    } catch (error) {
      this.logger.error(`Compliance validation failed: ${error.message}`);
      throw error;
    }
  }

  private initializeComplianceRules(): void {
    // SEC Investment Advice Rules
    this.complianceRules.set('SEC_INVESTMENT_ADVICE_001', {
      id: 'SEC_INVESTMENT_ADVICE_001',
      name: 'Investment Advice Disclosure',
      category: ComplianceCategory.SEC_REGULATIONS,
      severity: 'critical',
      description: 'Content providing investment advice must include appropriate disclaimers',
      pattern: /\b(recommend|should buy|should sell|invest in|guaranteed returns?)\b/gi,
      requiredElements: ['risk disclosure', 'past performance disclaimer'],
      applicableContentTypes: ['market_analysis', 'research_report', 'investment_memo', 'newsletter'],
      regulatoryReference: 'SEC Rule 206(4)-1',
    });

    this.complianceRules.set('SEC_GUARANTEED_RETURNS_001', {
      id: 'SEC_GUARANTEED_RETURNS_001',
      name: 'Prohibited Guaranteed Returns',
      category: ComplianceCategory.SEC_REGULATIONS,
      severity: 'critical',
      description: 'Cannot guarantee investment returns or suggest risk-free investments',
      pattern: /\b(guarantee\w*|risk-free|certain return|sure thing|can\'t lose)\b/gi,
      applicableContentTypes: ['market_analysis', 'research_report', 'investment_memo', 'newsletter', 'blog_post'],
      regulatoryReference: 'SEC Investment Advisers Act Section 206',
    });

    // FINRA Rules
    this.complianceRules.set('FINRA_FAIR_DEALING_001', {
      id: 'FINRA_FAIR_DEALING_001',
      name: 'Fair Dealing with Customers',
      category: ComplianceCategory.FINRA_RULES,
      severity: 'high',
      description: 'Must deal fairly with all customers and not mislead',
      pattern: /\b(exclusive deal|limited time|act now|hurry|urgent)\b/gi,
      applicableContentTypes: ['newsletter', 'email_campaign', 'social_media'],
      regulatoryReference: 'FINRA Rule 2111',
    });

    // GDPR Privacy Rules
    this.complianceRules.set('GDPR_DATA_COLLECTION_001', {
      id: 'GDPR_DATA_COLLECTION_001',
      name: 'Data Collection Disclosure',
      category: ComplianceCategory.GDPR_PRIVACY,
      severity: 'high',
      description: 'Must disclose data collection and processing activities',
      pattern: /\b(collect\w* data|personal information|email address|tracking)\b/gi,
      requiredElements: ['privacy policy link', 'data protection notice'],
      applicableContentTypes: ['newsletter', 'email_campaign', 'social_media', 'educational'],
      regulatoryReference: 'GDPR Article 13',
    });

    // Risk Disclosure Requirements
    this.complianceRules.set('RISK_DISCLOSURE_001', {
      id: 'RISK_DISCLOSURE_001',
      name: 'Investment Risk Disclosure',
      category: ComplianceCategory.RISK_DISCLOSURE,
      severity: 'critical',
      description: 'Investment content must include adequate risk warnings',
      pattern: /\b(investment|trading|portfolio|stock|bond|fund)\b/gi,
      requiredElements: ['risk warning', 'past performance disclaimer'],
      applicableContentTypes: ['market_analysis', 'research_report', 'investment_memo', 'newsletter'],
      regulatoryReference: 'Various SEC and FINRA requirements',
    });

    // Anti-Money Laundering
    this.complianceRules.set('AML_SUSPICIOUS_ACTIVITY_001', {
      id: 'AML_SUSPICIOUS_ACTIVITY_001',
      name: 'Suspicious Activity Prevention',
      category: ComplianceCategory.ANTI_MONEY_LAUNDERING,
      severity: 'critical',
      description: 'Content cannot facilitate or encourage money laundering activities',
      pattern: /\b(cash transactions?|anonymous|untraceable|offshore|shell company)\b/gi,
      applicableContentTypes: ['blog_post', 'educational', 'newsletter'],
      regulatoryReference: 'Bank Secrecy Act',
    });

    // Market Manipulation
    this.complianceRules.set('MARKET_MANIPULATION_001', {
      id: 'MARKET_MANIPULATION_001',
      name: 'Market Manipulation Prevention',
      category: ComplianceCategory.MARKET_MANIPULATION,
      severity: 'critical',
      description: 'Content cannot engage in pump and dump or other manipulation schemes',
      pattern: /\b(pump|dump|artificial\w* inflat\w*|coordinate\w* buy\w*)\b/gi,
      applicableContentTypes: ['social_media', 'blog_post', 'newsletter'],
      regulatoryReference: 'Securities Exchange Act Section 9(a)',
    });

    this.logger.log(`Initialized ${this.complianceRules.size} compliance rules`);
  }

  private getApplicableRules(request: ComplianceValidationRequest): ComplianceRule[] {
    return Array.from(this.complianceRules.values()).filter(rule =>
      rule.applicableContentTypes.includes(request.contentType)
    );
  }

  private async executeRule(rule: ComplianceRule, request: ComplianceValidationRequest): Promise<RuleExecutionResult> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];

    try {
      // Check for pattern matches
      if (rule.pattern) {
        const matches = Array.from(request.content.matchAll(rule.pattern));
        
        for (const match of matches) {
          const location: ContentLocation = {
            startIndex: match.index || 0,
            endIndex: (match.index || 0) + match[0].length,
            context: this.getContext(request.content, match.index || 0, 50),
          };

          // Check if this is a violation or warning
          const isViolation = await this.assessViolationSeverity(rule, match[0], request);
          
          if (isViolation) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              category: rule.category,
              description: rule.description,
              location,
              evidence: match[0],
              remediation: this.getRemediation(rule, match[0]),
              regulatoryReference: rule.regulatoryReference,
            });
          } else {
            warnings.push({
              ruleId: rule.id,
              ruleName: rule.name,
              category: rule.category,
              description: `Potential compliance concern: ${rule.description}`,
              recommendation: this.getRecommendation(rule, match[0]),
            });
          }
        }
      }

      // Check for required elements
      if (rule.requiredElements) {
        for (const element of rule.requiredElements) {
          if (!this.hasRequiredElement(request.content, element)) {
            violations.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              category: rule.category,
              description: `Missing required element: ${element}`,
              evidence: 'Element not found in content',
              remediation: `Add ${element} to ensure compliance`,
              regulatoryReference: rule.regulatoryReference,
            });
          }
        }
      }

    } catch (error) {
      this.logger.error(`Rule execution failed for ${rule.id}: ${error.message}`);
    }

    return { violations, warnings };
  }

  private async assessViolationSeverity(rule: ComplianceRule, match: string, request: ComplianceValidationRequest): Promise<boolean> {
    // Enhanced logic to determine if a pattern match constitutes a violation
    const context = request.content.toLowerCase();
    const matchLower = match.toLowerCase();

    // Special cases for investment advice
    if (rule.category === ComplianceCategory.SEC_REGULATIONS && rule.id.includes('INVESTMENT_ADVICE')) {
      // Check if disclaimer is present nearby
      const hasNearbyDisclaimer = this.hasNearbyDisclaimer(request.content, match, 200);
      return !hasNearbyDisclaimer;
    }

    // Special cases for guaranteed returns
    if (rule.category === ComplianceCategory.SEC_REGULATIONS && rule.id.includes('GUARANTEED_RETURNS')) {
      // Always a violation for guaranteed returns language
      return true;
    }

    // Special cases for privacy
    if (rule.category === ComplianceCategory.GDPR_PRIVACY) {
      // Check if privacy policy is mentioned
      const hasPrivacyMention = /privacy policy|data protection|gdpr/i.test(context);
      return !hasPrivacyMention;
    }

    // Default: treat pattern matches as violations for critical rules
    return rule.severity === 'critical';
  }

  private hasRequiredElement(content: string, element: string): boolean {
    const elementPatterns: { [key: string]: RegExp } = {
      'risk disclosure': /risk\w*\s+disclosure|investment\w*\s+risk|past\s+performance|no\s+guarantee/i,
      'past performance disclaimer': /past\s+performance.*not.*guarantee|historical.*not.*indication/i,
      'privacy policy link': /privacy\s+policy|data\s+protection\s+policy/i,
      'data protection notice': /data\s+protection|gdpr|privacy\s+notice/i,
      'risk warning': /risk\w*\s+warning|investment\w*\s+risk|financial\s+risk/i,
    };

    const pattern = elementPatterns[element.toLowerCase()];
    return pattern ? pattern.test(content) : false;
  }

  private hasNearbyDisclaimer(content: string, match: string, radius: number): boolean {
    const matchIndex = content.indexOf(match);
    if (matchIndex === -1) return false;

    const start = Math.max(0, matchIndex - radius);
    const end = Math.min(content.length, matchIndex + match.length + radius);
    const surroundingText = content.substring(start, end);

    const disclaimerPatterns = [
      /not\s+financial\s+advice/i,
      /consult.*financial\s+advisor/i,
      /past\s+performance.*not.*guarantee/i,
      /investment\w*\s+risk/i,
      /do\s+your\s+own\s+research/i,
    ];

    return disclaimerPatterns.some(pattern => pattern.test(surroundingText));
  }

  private getContext(content: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(content.length, position + radius);
    return content.substring(start, end);
  }

  private getRemediation(rule: ComplianceRule, evidence: string): string {
    const remediationMap: { [key: string]: string } = {
      'SEC_INVESTMENT_ADVICE_001': 'Add disclaimer stating this is not personalized financial advice and readers should consult with qualified financial professionals',
      'SEC_GUARANTEED_RETURNS_001': 'Remove or modify language that guarantees returns. Use terms like "potential," "historically," or "may"',
      'FINRA_FAIR_DEALING_001': 'Remove high-pressure sales language and provide balanced information',
      'GDPR_DATA_COLLECTION_001': 'Add privacy policy link and data collection disclosure',
      'RISK_DISCLOSURE_001': 'Include comprehensive risk warnings about potential losses',
      'AML_SUSPICIOUS_ACTIVITY_001': 'Remove content that could facilitate money laundering activities',
      'MARKET_MANIPULATION_001': 'Remove language that could be construed as market manipulation',
    };

    return remediationMap[rule.id] || `Review and modify content to comply with ${rule.name}`;
  }

  private getRecommendation(rule: ComplianceRule, evidence: string): string {
    return `Consider reviewing the use of "${evidence}" in context of ${rule.name} requirements`;
  }

  private calculateComplianceScore(violations: ComplianceViolation[], warnings: ComplianceWarning[]): number {
    let score = 100;

    // Deduct points based on violations
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Deduct smaller amounts for warnings
    warnings.forEach(() => {
      score -= 2;
    });

    return Math.max(0, Math.min(100, score));
  }

  private determineComplianceStatus(violations: ComplianceViolation[], score: number): boolean {
    // Automatic fail for critical violations
    const hasCriticalViolations = violations.some(v => v.severity === 'critical');
    if (hasCriticalViolations) return false;

    // Require minimum score
    return score >= 80;
  }

  private generateRecommendations(
    violations: ComplianceViolation[],
    warnings: ComplianceWarning[],
    request: ComplianceValidationRequest
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // Group violations by category
    const violationsByCategory = violations.reduce((acc, violation) => {
      if (!acc[violation.category]) acc[violation.category] = [];
      acc[violation.category].push(violation);
      return acc;
    }, {} as { [key: string]: ComplianceViolation[] });

    // Generate category-specific recommendations
    Object.entries(violationsByCategory).forEach(([category, categoryViolations]) => {
      const criticalCount = categoryViolations.filter(v => v.severity === 'critical').length;
      
      recommendations.push({
        category: category as ComplianceCategory,
        priority: criticalCount > 0 ? 'high' : 'medium',
        description: this.getCategoryRecommendation(category as ComplianceCategory, categoryViolations.length),
        implementation: this.getCategoryImplementation(category as ComplianceCategory),
        impact: this.getCategoryImpact(category as ComplianceCategory, criticalCount),
      });
    });

    // General recommendations based on content type
    if (request.contentType === 'market_analysis' || request.contentType === 'research_report') {
      recommendations.push({
        category: ComplianceCategory.RISK_DISCLOSURE,
        priority: 'high',
        description: 'Ensure comprehensive risk disclosures for investment analysis',
        implementation: 'Add standard risk disclaimer section at the beginning or end of content',
        impact: 'Reduces regulatory risk and protects readers',
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private getCategoryRecommendation(category: ComplianceCategory, violationCount: number): string {
    const recommendations = {
      [ComplianceCategory.SEC_REGULATIONS]: `Address ${violationCount} SEC regulatory issues to ensure investment content compliance`,
      [ComplianceCategory.FINRA_RULES]: `Resolve ${violationCount} FINRA rule violations related to fair dealing and advertising`,
      [ComplianceCategory.GDPR_PRIVACY]: `Fix ${violationCount} GDPR privacy compliance issues`,
      [ComplianceCategory.RISK_DISCLOSURE]: `Add ${violationCount} missing risk disclosure elements`,
      [ComplianceCategory.INVESTMENT_ADVICE]: `Clarify investment advice disclaimers for ${violationCount} instances`,
    };

    return recommendations[category] || `Address ${violationCount} compliance issues in ${category}`;
  }

  private getCategoryImplementation(category: ComplianceCategory): string {
    const implementations = {
      [ComplianceCategory.SEC_REGULATIONS]: 'Review SEC guidelines and add required disclaimers',
      [ComplianceCategory.FINRA_RULES]: 'Follow FINRA advertising standards and fair dealing practices',
      [ComplianceCategory.GDPR_PRIVACY]: 'Add privacy policy links and data collection notices',
      [ComplianceCategory.RISK_DISCLOSURE]: 'Include comprehensive risk warnings and disclaimers',
      [ComplianceCategory.INVESTMENT_ADVICE]: 'Add "not financial advice" disclaimers',
    };

    return implementations[category] || 'Consult regulatory guidelines and implement required changes';
  }

  private getCategoryImpact(category: ComplianceCategory, criticalCount: number): string {
    if (criticalCount > 0) {
      return 'Critical: Non-compliance may result in regulatory action and legal liability';
    }
    
    return 'Moderate: Improves compliance posture and reduces regulatory risk';
  }

  private generateValidationId(): string {
    return `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for controller endpoints
  async validateContent(request: ComplianceValidationRequest): Promise<ComplianceValidationResponse> {
    return this.validate(request);
  }

  async validateContentBatch(requests: ComplianceValidationRequest[]): Promise<ComplianceValidationResponse[]> {
    const results = await Promise.all(requests.map(request => this.validate(request)));
    return results;
  }

  async autoCorrectContent(request: ComplianceValidationRequest): Promise<{ correctedContent: string; changes: string[] }> {
    const validation = await this.validate(request);
    let correctedContent = request.content;
    const changes: string[] = [];

    // Apply basic corrections based on violations
    for (const violation of validation.violations) {
      if (violation.suggestion) {
        // Simple text replacement for common issues
        if (violation.suggestion.includes('Add disclaimer')) {
          correctedContent += '\n\nDisclaimer: This is not financial advice. Please consult with a qualified financial advisor.';
          changes.push('Added financial disclaimer');
        }
        if (violation.suggestion.includes('risk warning')) {
          correctedContent += '\n\nRisk Warning: Investments carry risk and past performance does not guarantee future results.';
          changes.push('Added risk warning');
        }
      }
    }

    return { correctedContent, changes };
  }

  async getAvailableFrameworks(): Promise<string[]> {
    return ['SEC', 'FINRA', 'GDPR', 'CCPA', 'MIFID', 'SOX'];
  }

  async getSupportedJurisdictions(): Promise<string[]> {
    return ['US', 'EU', 'UK', 'Canada', 'Australia', 'Singapore'];
  }

  async generateAuditTrail(validationId: string, startDate?: Date, endDate?: Date): Promise<AuditTrailEntry[]> {
    // In a real implementation, this would query the database
    return [
      {
        timestamp: new Date(),
        action: 'validation_performed',
        user: 'system',
        details: { validationId, status: 'completed' },
        outcome: 'passed'
      }
    ];
  }

  async getComplianceChecklist(contentType: string, jurisdiction?: string): Promise<any> {
    const baseChecklist = {
      SEC: ['Risk disclosure', 'Performance disclaimers', 'Regulatory statements'],
      FINRA: ['Fair dealing', 'Material information', 'Suitability disclosures'],
      GDPR: ['Data collection notice', 'Privacy policy link', 'Consent mechanisms']
    };

    return {
      contentType,
      jurisdiction: jurisdiction || 'US',
      requiredItems: baseChecklist,
      recommendations: ['Regular compliance reviews', 'Legal consultation', 'Staff training']
    };
  }

  async getComplianceAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    return {
      period: { startDate, endDate },
      totalValidations: 150,
      passRate: 0.87,
      commonViolations: [
        { type: 'Missing disclaimers', count: 12 },
        { type: 'Inadequate risk warnings', count: 8 },
        { type: 'GDPR violations', count: 5 }
      ],
      trends: {
        complianceImprovement: 0.12,
        criticalViolations: -0.25
      }
    };
  }

  async getRiskAssessmentGuidelines(riskLevel?: string): Promise<any> {
    const guidelines = {
      low: {
        requiredDisclosures: ['Basic risk warning'],
        recommendedPractices: ['Simple language', 'Clear terms']
      },
      medium: {
        requiredDisclosures: ['Risk warning', 'Performance disclaimer'],
        recommendedPractices: ['Detailed explanations', 'Examples']
      },
      high: {
        requiredDisclosures: ['Comprehensive risk warning', 'Performance disclaimer', 'Regulatory statements'],
        recommendedPractices: ['Expert review', 'Legal approval', 'Regular updates']
      }
    };

    return riskLevel ? guidelines[riskLevel] || guidelines.medium : guidelines;
  }
}

// Supporting interfaces
interface ComplianceRule {
  id: string;
  name: string;
  category: ComplianceCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  pattern?: RegExp;
  requiredElements?: string[];
  applicableContentTypes: string[];
  regulatoryReference?: string;
}

interface RuleExecutionResult {
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
}