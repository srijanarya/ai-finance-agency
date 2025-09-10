import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

import {
  QualityAssessmentRequest,
  QualityAssessmentResponse,
  QualityAgent,
  AssessmentSpecialty,
  AgentAssessment,
  DetailedQualityScores,
  QualityImprovement,
  ImprovementCategory,
  ImprovementPriority,
  QualityIssue,
  IssueSeverity,
} from '../../interfaces/quality-scoring/quality-scoring.interface';

import { QualityAssessment } from '../../entities/quality-scoring/quality-assessment.entity';
import { ReadabilityAgentService } from './agents/readability-agent.service';
import { FinancialAccuracyAgentService } from './agents/financial-accuracy-agent.service';

@Injectable()
export class QualityScoringService {
  private readonly logger = new Logger(QualityScoringService.name);
  private readonly agents: Map<AssessmentSpecialty, QualityAgent> = new Map();
  private readonly defaultWeights = {
    readability: 0.2,
    accuracy: 0.25,
    compliance: 0.25,
    engagement: 0.15,
    technical: 0.1,
    financial: 0.05,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(QualityAssessment)
    private readonly assessmentRepository: Repository<QualityAssessment>,
    private readonly readabilityAgent: ReadabilityAgentService,
    private readonly financialAccuracyAgent: FinancialAccuracyAgentService,
  ) {
    this.initializeAgents();
  }

  /**
   * Assess content quality using multiple specialized agents
   */
  async assessQuality(request: QualityAssessmentRequest, userId?: string): Promise<QualityAssessmentResponse> {
    const startTime = Date.now();

    try {
      this.logger.log(`Assessing quality for ${request.contentType} content (${request.content.length} chars)`);

      // Generate content hash for deduplication
      const contentHash = this.generateContentHash(request.content);

      // Check for recent duplicate assessment
      const existingAssessment = await this.findRecentAssessment(contentHash, userId);
      if (existingAssessment) {
        this.logger.log(`Returning cached assessment for content hash: ${contentHash}`);
        return this.convertEntityToResponse(existingAssessment);
      }

      // Determine which agents to use
      const enabledAgents = this.getEnabledAgents(request);

      // Run assessments in parallel
      const agentAssessments = await this.runAgentAssessments(request, enabledAgents);

      // Calculate overall scores
      const detailedScores = this.calculateDetailedScores(agentAssessments);
      const overallScore = this.calculateOverallScore(detailedScores, request.assessmentCriteria?.weights);

      // Determine pass/fail status
      const threshold = request.assessmentCriteria?.thresholds?.minimumPassingScore || 8;
      const passed = overallScore >= threshold && !this.hasCriticalIssues(agentAssessments);

      // Generate improvement suggestions
      const improvements = this.generateImprovements(agentAssessments, detailedScores, request);

      // Calculate confidence
      const confidence = this.calculateConfidence(agentAssessments, request.content.length);

      const processingTime = Date.now() - startTime;

      // Create response
      const response: QualityAssessmentResponse = {
        id: this.generateAssessmentId(),
        overallScore: Math.round(overallScore * 100) / 100,
        passed,
        assessmentDate: new Date(),
        detailed: detailedScores,
        agentAssessments,
        improvements,
        confidence,
        processingTime,
      };

      // Save assessment to database
      await this.saveAssessment(request, response, contentHash, userId);

      // Emit assessment completed event
      this.eventEmitter.emit('quality.assessment.completed', {
        assessmentId: response.id,
        userId,
        contentType: request.contentType,
        overallScore: response.overallScore,
        passed: response.passed,
        processingTime,
      });

      return response;
    } catch (error) {
      this.logger.error(`Quality assessment failed: ${error.message}`);
      
      // Emit error event
      this.eventEmitter.emit('quality.assessment.failed', {
        userId,
        contentType: request.contentType,
        error: error.message,
        processingTime: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Assess multiple pieces of content efficiently
   */
  async assessBatchQuality(
    requests: QualityAssessmentRequest[],
    options: { parallel?: boolean; maxConcurrency?: number } = {},
    userId?: string
  ): Promise<QualityAssessmentResponse[]> {
    const { parallel = true, maxConcurrency = 3 } = options;

    this.logger.log(`Assessing batch quality: ${requests.length} requests`);

    if (requests.length === 0) {
      return [];
    }

    const startTime = Date.now();
    const results: QualityAssessmentResponse[] = [];

    try {
      if (parallel) {
        // Process requests in parallel with concurrency control
        const chunks = this.chunkArray(requests, maxConcurrency);
        
        for (const chunk of chunks) {
          const chunkPromises = chunk.map(async (request) => {
            try {
              return await this.assessQuality(request, userId);
            } catch (error) {
              this.logger.error(`Batch assessment failed for one item: ${error.message}`);
              return null;
            }
          });

          const chunkResults = await Promise.all(chunkPromises);
          results.push(...chunkResults.filter(result => result !== null));
        }
      } else {
        // Process requests sequentially
        for (const request of requests) {
          try {
            const result = await this.assessQuality(request, userId);
            results.push(result);
          } catch (error) {
            this.logger.error(`Batch assessment failed for one item: ${error.message}`);
          }
        }
      }

      // Emit batch completion event
      this.eventEmitter.emit('quality.batch.completed', {
        userId,
        totalRequests: requests.length,
        successCount: results.length,
        failureCount: requests.length - results.length,
        processingTime: Date.now() - startTime,
      });

      return results;
    } catch (error) {
      this.logger.error(`Batch quality assessment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get quality assessment by ID
   */
  async getAssessment(id: string, userId?: string): Promise<QualityAssessment> {
    const whereClause = userId ? { id, userId } : { id };
    
    const assessment = await this.assessmentRepository.findOne({
      where: whereClause,
    });

    if (!assessment) {
      throw new Error('Quality assessment not found');
    }

    return assessment;
  }

  /**
   * Get user's quality assessments with pagination
   */
  async getUserAssessments(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      contentType?: string;
      passed?: boolean;
    } = {}
  ): Promise<{ assessments: QualityAssessment[]; total: number; pages: number }> {
    const { page = 1, limit = 20, contentType, passed } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.assessmentRepository.createQueryBuilder('assessment')
      .where('assessment.userId = :userId', { userId });

    if (contentType) {
      queryBuilder.andWhere('assessment.contentType = :contentType', { contentType });
    }

    if (passed !== undefined) {
      queryBuilder.andWhere('assessment.passed = :passed', { passed });
    }

    const [assessments, total] = await queryBuilder
      .orderBy('assessment.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      assessments,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get quality analytics and trends
   */
  async getQualityAnalytics(
    userId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<any> {
    const queryBuilder = this.assessmentRepository.createQueryBuilder('assessment');

    if (userId) {
      queryBuilder.where('assessment.userId = :userId', { userId });
    }

    if (timeRange) {
      queryBuilder.andWhere('assessment.createdAt BETWEEN :start AND :end', {
        start: timeRange.start,
        end: timeRange.end,
      });
    }

    const [
      totalAssessments,
      passedAssessments,
      averageScore,
      scoreDistribution,
      issueDistribution,
      contentTypeDistribution,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().where('assessment.passed = true').getCount(),
      queryBuilder.select('AVG(assessment.overallScore)', 'avgScore').getRawOne(),
      this.getScoreDistribution(queryBuilder),
      this.getIssueDistribution(queryBuilder),
      this.getContentTypeDistribution(queryBuilder),
    ]);

    return {
      summary: {
        totalAssessments,
        passedAssessments,
        passRate: totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0,
        averageScore: parseFloat(averageScore?.avgScore || '0'),
      },
      distributions: {
        scoreDistribution,
        issueDistribution,
        contentTypeDistribution,
      },
      timeRange: timeRange ? {
        start: timeRange.start,
        end: timeRange.end,
      } : null,
    };
  }

  private initializeAgents(): void {
    this.agents.set(AssessmentSpecialty.READABILITY, this.readabilityAgent);
    this.agents.set(AssessmentSpecialty.FINANCIAL_ACCURACY, this.financialAccuracyAgent);
    
    // Additional agents would be added here
    // this.agents.set(AssessmentSpecialty.COMPLIANCE, this.complianceAgent);
    // this.agents.set(AssessmentSpecialty.ENGAGEMENT, this.engagementAgent);
    // this.agents.set(AssessmentSpecialty.TECHNICAL_WRITING, this.technicalAgent);

    this.logger.log(`Initialized ${this.agents.size} quality assessment agents`);
  }

  private getEnabledAgents(request: QualityAssessmentRequest): AssessmentSpecialty[] {
    if (request.assessmentCriteria?.enabledAgents) {
      return request.assessmentCriteria.enabledAgents;
    }

    // Default agents based on content type
    const defaultAgents = [AssessmentSpecialty.READABILITY];
    
    // Add financial accuracy for financial content
    const financialContentTypes = ['market_analysis', 'research_report', 'investment_memo', 'newsletter'];
    if (financialContentTypes.includes(request.contentType)) {
      defaultAgents.push(AssessmentSpecialty.FINANCIAL_ACCURACY);
    }

    return defaultAgents;
  }

  private async runAgentAssessments(
    request: QualityAssessmentRequest,
    enabledAgents: AssessmentSpecialty[]
  ): Promise<AgentAssessment[]> {
    const context = {
      contentType: request.contentType,
      targetAudience: request.targetAudience,
      industry: request.industry,
      language: request.language || 'en',
      customCriteria: request.assessmentCriteria,
    };

    const assessmentPromises = enabledAgents.map(async (specialty) => {
      const agent = this.agents.get(specialty);
      if (!agent) {
        this.logger.warn(`Agent not found for specialty: ${specialty}`);
        return null;
      }

      try {
        return await agent.assess(request.content, context);
      } catch (error) {
        this.logger.error(`Agent ${specialty} failed: ${error.message}`);
        return null;
      }
    });

    const results = await Promise.all(assessmentPromises);
    return results.filter(result => result !== null);
  }

  private calculateDetailedScores(agentAssessments: AgentAssessment[]): DetailedQualityScores {
    // Initialize default scores
    const scores: DetailedQualityScores = {
      readability: {
        fleschScore: 70,
        gradeLevel: 10,
        sentenceComplexity: 6,
        vocabularyComplexity: 6,
        structureClarity: 7,
        overallReadability: 7,
      },
      accuracy: {
        factualAccuracy: 8,
        sourceCredibility: 7,
        dataConsistency: 8,
        logicalCoherence: 8,
        evidenceSupport: 7,
        overallAccuracy: 7.6,
      },
      compliance: {
        regulatoryCompliance: 8,
        ethicalStandards: 8,
        disclosureAdequacy: 7,
        riskWarnings: 7,
        legalCompliance: 8,
        overallCompliance: 7.6,
      },
      engagement: {
        contentAppeal: 7,
        audienceRelevance: 7,
        emotionalImpact: 6,
        callToActionEffectiveness: 6,
        shareability: 6,
        overallEngagement: 6.4,
      },
      technical: {
        grammarAccuracy: 8,
        spellingAccuracy: 9,
        punctuationAccuracy: 8,
        styleConsistency: 7,
        formatCompliance: 8,
        overallTechnical: 8,
      },
      financial: {
        marketAnalysisDepth: 7,
        riskAssessmentQuality: 7,
        dataAccuracy: 8,
        professionalTone: 8,
        industryExpertise: 7,
        overallFinancialQuality: 7.4,
      },
    };

    // Update scores based on agent assessments
    agentAssessments.forEach(assessment => {
      switch (assessment.specialty) {
        case AssessmentSpecialty.READABILITY:
          scores.readability.overallReadability = assessment.score;
          // Extract detailed scores from assessment if available
          break;

        case AssessmentSpecialty.FINANCIAL_ACCURACY:
          scores.accuracy.overallAccuracy = assessment.score;
          scores.financial.overallFinancialQuality = assessment.score;
          break;

        // Add cases for other specialties as agents are implemented
      }
    });

    return scores;
  }

  private calculateOverallScore(
    detailedScores: DetailedQualityScores,
    customWeights?: any
  ): number {
    const weights = customWeights || this.defaultWeights;

    const weightedScore = 
      (detailedScores.readability.overallReadability * weights.readability) +
      (detailedScores.accuracy.overallAccuracy * weights.accuracy) +
      (detailedScores.compliance.overallCompliance * weights.compliance) +
      (detailedScores.engagement.overallEngagement * weights.engagement) +
      (detailedScores.technical.overallTechnical * weights.technical) +
      (detailedScores.financial.overallFinancialQuality * weights.financial);

    return Math.max(1, Math.min(10, weightedScore));
  }

  private hasCriticalIssues(agentAssessments: AgentAssessment[]): boolean {
    return agentAssessments.some(assessment =>
      assessment.issues.some(issue => issue.severity === IssueSeverity.CRITICAL)
    );
  }

  private generateImprovements(
    agentAssessments: AgentAssessment[],
    detailedScores: DetailedQualityScores,
    request: QualityAssessmentRequest
  ): QualityImprovement[] {
    const improvements: QualityImprovement[] = [];

    // Collect all issues and suggestions from agents
    const allIssues: QualityIssue[] = [];
    const allSuggestions: string[] = [];

    agentAssessments.forEach(assessment => {
      allIssues.push(...assessment.issues);
      allSuggestions.push(...assessment.suggestions);
    });

    // Generate improvements based on low-scoring areas
    const scoreThreshold = 6;

    if (detailedScores.readability.overallReadability < scoreThreshold) {
      improvements.push({
        category: ImprovementCategory.READABILITY,
        priority: ImprovementPriority.HIGH,
        description: 'Improve content readability by simplifying language and structure',
        impact: 10 - detailedScores.readability.overallReadability,
        effort: 6,
        examples: [
          'Break long sentences into shorter ones',
          'Use simpler vocabulary where appropriate',
          'Add headings and bullet points for better organization'
        ],
      });
    }

    if (detailedScores.accuracy.overallAccuracy < scoreThreshold) {
      improvements.push({
        category: ImprovementCategory.ACCURACY,
        priority: ImprovementPriority.CRITICAL,
        description: 'Enhance factual accuracy and data verification',
        impact: 10 - detailedScores.accuracy.overallAccuracy,
        effort: 8,
        examples: [
          'Verify all financial data with credible sources',
          'Add source citations for all claims',
          'Review calculations for accuracy'
        ],
      });
    }

    if (detailedScores.compliance.overallCompliance < scoreThreshold) {
      improvements.push({
        category: ImprovementCategory.COMPLIANCE,
        priority: ImprovementPriority.CRITICAL,
        description: 'Strengthen regulatory compliance and risk disclosures',
        impact: 10 - detailedScores.compliance.overallCompliance,
        effort: 7,
        examples: [
          'Add appropriate risk warnings',
          'Include required disclaimers',
          'Review for regulatory compliance'
        ],
      });
    }

    // Add issue-specific improvements
    const criticalIssues = allIssues.filter(issue => issue.severity === IssueSeverity.CRITICAL);
    criticalIssues.forEach(issue => {
      improvements.push({
        category: this.mapIssueToCategory(issue.type),
        priority: ImprovementPriority.CRITICAL,
        description: issue.suggestion,
        impact: issue.impact,
        effort: 5,
      });
    });

    // Sort by priority and impact
    return improvements
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.impact - a.impact;
      })
      .slice(0, 10); // Limit to top 10 improvements
  }

  private calculateConfidence(agentAssessments: AgentAssessment[], contentLength: number): number {
    if (agentAssessments.length === 0) return 0.3;

    // Average agent confidences
    const avgAgentConfidence = agentAssessments.reduce((sum, assessment) => 
      sum + assessment.confidence, 0) / agentAssessments.length;

    // Adjust based on content length
    let lengthAdjustment = 0;
    if (contentLength > 1000) lengthAdjustment = 0.1;
    else if (contentLength < 100) lengthAdjustment = -0.2;

    // Adjust based on number of agents
    const agentAdjustment = Math.min(0.1, agentAssessments.length * 0.02);

    return Math.max(0.3, Math.min(1, avgAgentConfidence + lengthAdjustment + agentAdjustment));
  }

  private generateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  private async findRecentAssessment(
    contentHash: string,
    userId?: string
  ): Promise<QualityAssessment | null> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const whereClause: any = {
      contentHash,
      createdAt: { $gte: oneHourAgo } as any,
    };

    if (userId) {
      whereClause.userId = userId;
    }

    return await this.assessmentRepository.findOne({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
  }

  private async saveAssessment(
    request: QualityAssessmentRequest,
    response: QualityAssessmentResponse,
    contentHash: string,
    userId?: string
  ): Promise<QualityAssessment> {
    // Count issues by severity
    const allIssues = response.agentAssessments.flatMap(assessment => assessment.issues);
    const issueCounts = {
      critical: allIssues.filter(i => i.severity === IssueSeverity.CRITICAL).length,
      high: allIssues.filter(i => i.severity === IssueSeverity.HIGH).length,
      medium: allIssues.filter(i => i.severity === IssueSeverity.MEDIUM).length,
      low: allIssues.filter(i => i.severity === IssueSeverity.LOW).length,
    };

    const assessment = this.assessmentRepository.create({
      content: request.content,
      contentHash,
      contentType: request.contentType,
      targetAudience: request.targetAudience,
      industry: request.industry,
      language: request.language || 'en',
      overallScore: response.overallScore,
      passed: response.passed,
      confidence: response.confidence,
      processingTime: response.processingTime,
      readabilityScore: response.detailed.readability.overallReadability,
      accuracyScore: response.detailed.accuracy.overallAccuracy,
      complianceScore: response.detailed.compliance.overallCompliance,
      engagementScore: response.detailed.engagement.overallEngagement,
      technicalScore: response.detailed.technical.overallTechnical,
      financialScore: response.detailed.financial.overallFinancialQuality,
      detailedScores: response.detailed,
      agentAssessments: response.agentAssessments,
      qualityIssues: allIssues,
      improvements: response.improvements,
      assessmentCriteria: request.assessmentCriteria,
      criticalIssueCount: issueCounts.critical,
      highIssueCount: issueCounts.high,
      mediumIssueCount: issueCounts.medium,
      lowIssueCount: issueCounts.low,
      totalIssueCount: allIssues.length,
      userId,
    });

    return await this.assessmentRepository.save(assessment);
  }

  private convertEntityToResponse(entity: QualityAssessment): QualityAssessmentResponse {
    return {
      id: entity.id,
      overallScore: entity.overallScore,
      passed: entity.passed,
      assessmentDate: entity.createdAt,
      detailed: entity.detailedScores,
      agentAssessments: entity.agentAssessments,
      improvements: entity.improvements,
      confidence: entity.confidence,
      processingTime: entity.processingTime,
    };
  }

  private mapIssueToCategory(issueType: string): ImprovementCategory {
    const mapping: { [key: string]: ImprovementCategory } = {
      'grammar': ImprovementCategory.TECHNICAL,
      'spelling': ImprovementCategory.TECHNICAL,
      'punctuation': ImprovementCategory.TECHNICAL,
      'readability': ImprovementCategory.READABILITY,
      'factual_error': ImprovementCategory.ACCURACY,
      'compliance_violation': ImprovementCategory.COMPLIANCE,
      'structure': ImprovementCategory.STRUCTURE,
      'engagement': ImprovementCategory.ENGAGEMENT,
    };
    return mapping[issueType] || ImprovementCategory.CONTENT_QUALITY;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private generateAssessmentId(): string {
    return `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Analytics helper methods
  private async getScoreDistribution(queryBuilder: any): Promise<any> {
    const result = await queryBuilder
      .select('FLOOR(assessment.overallScore)', 'scoreRange')
      .addSelect('COUNT(*)', 'count')
      .groupBy('FLOOR(assessment.overallScore)')
      .getRawMany();

    return result.reduce((acc: any, row: any) => {
      acc[row.scoreRange] = parseInt(row.count);
      return acc;
    }, {});
  }

  private async getIssueDistribution(queryBuilder: any): Promise<any> {
    const result = await queryBuilder
      .select('assessment.criticalIssueCount', 'critical')
      .addSelect('assessment.highIssueCount', 'high')
      .addSelect('assessment.mediumIssueCount', 'medium')
      .addSelect('assessment.lowIssueCount', 'low')
      .getRawMany();

    return result.reduce((acc: any, row: any) => {
      acc.critical = (acc.critical || 0) + parseInt(row.critical || 0);
      acc.high = (acc.high || 0) + parseInt(row.high || 0);
      acc.medium = (acc.medium || 0) + parseInt(row.medium || 0);
      acc.low = (acc.low || 0) + parseInt(row.low || 0);
      return acc;
    }, {});
  }

  private async getContentTypeDistribution(queryBuilder: any): Promise<any> {
    const result = await queryBuilder
      .select('assessment.contentType', 'contentType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('assessment.contentType')
      .getRawMany();

    return result.reduce((acc: any, row: any) => {
      acc[row.contentType] = parseInt(row.count);
      return acc;
    }, {});
  }
}