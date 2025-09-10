import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  ContentType,
  TargetAudience,
  IssueSeverity,
} from '../../interfaces/quality-scoring/quality-scoring.interface';

@Entity('quality_assessments')
@Index(['contentType', 'createdAt'])
@Index(['targetAudience', 'overallScore'])
@Index(['userId', 'createdAt'])
@Index(['overallScore', 'passed'])
export class QualityAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  contentHash?: string; // For deduplication

  @Column({ type: 'enum', enum: ContentType })
  contentType: ContentType;

  @Column({ type: 'enum', enum: TargetAudience })
  targetAudience: TargetAudience;

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry?: string;

  @Column({ type: 'varchar', length: 5, default: 'en' })
  language: string;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  @Index()
  overallScore: number; // 1-10 scale

  @Column({ type: 'boolean' })
  @Index()
  passed: boolean; // true if score >= threshold

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence: number; // 0-1

  @Column({ type: 'int' })
  processingTime: number; // milliseconds

  // Detailed scores
  @Column({ type: 'decimal', precision: 4, scale: 2 })
  readabilityScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  accuracyScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  complianceScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  engagementScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  technicalScore: number;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  financialScore: number;

  // Detailed breakdown (JSON)
  @Column({ type: 'json' })
  detailedScores: any;

  @Column({ type: 'json' })
  agentAssessments: any[];

  @Column({ type: 'json' })
  qualityIssues: any[];

  @Column({ type: 'json' })
  improvements: any[];

  @Column({ type: 'json', nullable: true })
  assessmentCriteria?: any;

  // Issue counts for quick filtering
  @Column({ type: 'int', default: 0 })
  criticalIssueCount: number;

  @Column({ type: 'int', default: 0 })
  highIssueCount: number;

  @Column({ type: 'int', default: 0 })
  mediumIssueCount: number;

  @Column({ type: 'int', default: 0 })
  lowIssueCount: number;

  @Column({ type: 'int', default: 0 })
  totalIssueCount: number;

  // Assessment metadata
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  contentId?: string; // Link to generated content

  @Column({ type: 'varchar', length: 100, nullable: true })
  assessmentVersion?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;

  // Helper methods
  getQualityGrade(): string {
    if (this.overallScore >= 9) return 'A+';
    if (this.overallScore >= 8.5) return 'A';
    if (this.overallScore >= 8) return 'A-';
    if (this.overallScore >= 7.5) return 'B+';
    if (this.overallScore >= 7) return 'B';
    if (this.overallScore >= 6.5) return 'B-';
    if (this.overallScore >= 6) return 'C+';
    if (this.overallScore >= 5.5) return 'C';
    if (this.overallScore >= 5) return 'C-';
    if (this.overallScore >= 4) return 'D';
    return 'F';
  }

  hasCriticalIssues(): boolean {
    return this.criticalIssueCount > 0;
  }

  hasHighPriorityIssues(): boolean {
    return this.criticalIssueCount > 0 || this.highIssueCount > 0;
  }

  getIssueDistribution(): { [severity: string]: number } {
    return {
      critical: this.criticalIssueCount,
      high: this.highIssueCount,
      medium: this.mediumIssueCount,
      low: this.lowIssueCount,
    };
  }

  getTopImprovementAreas(): string[] {
    const scores = [
      { area: 'readability', score: this.readabilityScore },
      { area: 'accuracy', score: this.accuracyScore },
      { area: 'compliance', score: this.complianceScore },
      { area: 'engagement', score: this.engagementScore },
      { area: 'technical', score: this.technicalScore },
      { area: 'financial', score: this.financialScore },
    ];

    return scores
      .filter(item => item.score < 7) // Areas below "good" threshold
      .sort((a, b) => a.score - b.score) // Lowest scores first
      .slice(0, 3)
      .map(item => item.area);
  }

  getStrengths(): string[] {
    const scores = [
      { area: 'readability', score: this.readabilityScore },
      { area: 'accuracy', score: this.accuracyScore },
      { area: 'compliance', score: this.complianceScore },
      { area: 'engagement', score: this.engagementScore },
      { area: 'technical', score: this.technicalScore },
      { area: 'financial', score: this.financialScore },
    ];

    return scores
      .filter(item => item.score >= 8.5) // Areas with excellent scores
      .sort((a, b) => b.score - a.score) // Highest scores first
      .map(item => item.area);
  }

  isHighQuality(): boolean {
    return this.overallScore >= 8 && this.passed && !this.hasCriticalIssues();
  }

  needsReview(): boolean {
    return this.overallScore < 6 || this.hasCriticalIssues() || this.confidence < 0.7;
  }

  getScoreSummary(): string {
    const grade = this.getQualityGrade();
    const status = this.passed ? 'PASSED' : 'FAILED';
    const issues = this.totalIssueCount > 0 ? ` (${this.totalIssueCount} issues)` : '';
    
    return `${grade} - ${status}${issues}`;
  }

  calculateImprovementPotential(): number {
    // Calculate how much the score could realistically improve
    const currentWeaknesses = this.getTopImprovementAreas();
    const maxPossibleImprovement = currentWeaknesses.length * 1.5; // Up to 1.5 points per major weakness
    
    return Math.min(10 - this.overallScore, maxPossibleImprovement);
  }

  getRecommendedActions(): string[] {
    const actions: string[] = [];
    
    if (this.hasCriticalIssues()) {
      actions.push('Address critical compliance and accuracy issues immediately');
    }
    
    if (this.readabilityScore < 6) {
      actions.push('Simplify language and improve content structure');
    }
    
    if (this.technicalScore < 7) {
      actions.push('Proofread for grammar, spelling, and formatting errors');
    }
    
    if (this.complianceScore < 8) {
      actions.push('Review and enhance regulatory compliance measures');
    }
    
    if (this.engagementScore < 7) {
      actions.push('Improve content appeal and audience targeting');
    }
    
    if (actions.length === 0) {
      actions.push('Content quality is good - consider minor optimizations for excellence');
    }
    
    return actions;
  }

  toSummary(): any {
    return {
      id: this.id,
      overallScore: this.overallScore,
      grade: this.getQualityGrade(),
      passed: this.passed,
      contentType: this.contentType,
      targetAudience: this.targetAudience,
      issueCount: this.totalIssueCount,
      hasCriticalIssues: this.hasCriticalIssues(),
      strengths: this.getStrengths(),
      improvementAreas: this.getTopImprovementAreas(),
      recommendedActions: this.getRecommendedActions(),
      createdAt: this.createdAt,
    };
  }
}