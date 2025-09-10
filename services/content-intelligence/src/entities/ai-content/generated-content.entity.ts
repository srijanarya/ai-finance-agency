import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentType, ContentStyle, ContentTone, TargetAudience } from '../../interfaces/ai-content/ai-content.interface';

@Entity('ai_generated_content')
@Index(['contentType', 'createdAt'])
@Index(['targetAudience', 'createdAt'])
@Index(['style', 'tone'])
@Index(['userId', 'createdAt'])
export class AIGeneratedContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text' })
  originalPrompt: string;

  @Column({ type: 'enum', enum: ContentType })
  contentType: ContentType;

  @Column({ type: 'enum', enum: ContentStyle })
  style: ContentStyle;

  @Column({ type: 'enum', enum: ContentTone })
  tone: ContentTone;

  @Column({ type: 'enum', enum: TargetAudience })
  targetAudience: TargetAudience;

  @Column({ type: 'int' })
  wordCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  readingTime: number; // in minutes

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  confidence: number; // 0-1

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  relevanceScore: number; // 0-1

  @Column({ type: 'int', nullable: true })
  seoScore?: number; // 0-100

  @Column({ type: 'int', nullable: true })
  readabilityScore?: number; // 0-100

  @Column({ type: 'int', nullable: true })
  complianceScore?: number; // 0-100

  @Column({ type: 'int', nullable: true })
  engagementPrediction?: number; // 0-100

  @Column({ type: 'json', nullable: true })
  complianceFlags?: string[];

  @Column({ type: 'json', nullable: true })
  sources?: string[];

  @Column({ type: 'json', nullable: true })
  keywords?: string[];

  @Column({ type: 'json', nullable: true })
  suggestions?: string[];

  @Column({ type: 'varchar', length: 100 })
  aiProvider: string;

  @Column({ type: 'varchar', length: 100 })
  aiModel: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  generationCost?: number; // in USD

  @Column({ type: 'int' })
  responseTime: number; // in milliseconds

  @Column({ type: 'json', nullable: true })
  marketDataContext?: any;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  templateId?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  campaignId?: string;

  @Column({ type: 'enum', enum: ['draft', 'generated', 'reviewed', 'approved', 'published', 'archived'], default: 'generated' })
  @Index()
  status: string;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  actualEngagementRate?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  userRating?: number; // 0-5

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  getEngagementScore(): number {
    if (!this.actualEngagementRate) return this.engagementPrediction || 0;
    return this.actualEngagementRate;
  }

  getOverallQualityScore(): number {
    const scores = [
      this.confidence * 100,
      this.relevanceScore * 100,
      this.seoScore || 0,
      this.readabilityScore || 0,
      this.complianceScore || 0,
    ].filter(score => score > 0);

    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }

  hasComplianceIssues(): boolean {
    return (this.complianceFlags && this.complianceFlags.length > 0) || 
           (this.complianceScore && this.complianceScore < 80);
  }

  isHighQuality(): boolean {
    return this.getOverallQualityScore() >= 80 && !this.hasComplianceIssues();
  }

  getEstimatedReadTime(): string {
    const minutes = Math.ceil(this.readingTime);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }

  getContentPreview(maxLength: number = 200): string {
    if (this.content.length <= maxLength) return this.content;
    return this.content.substring(0, maxLength).trim() + '...';
  }

  getPerformanceMetrics() {
    return {
      qualityScore: this.getOverallQualityScore(),
      engagementScore: this.getEngagementScore(),
      complianceStatus: this.hasComplianceIssues() ? 'issues' : 'compliant',
      readabilityGrade: this.getReadabilityGrade(),
      seoOptimization: this.getSEOOptimizationLevel(),
    };
  }

  private getReadabilityGrade(): string {
    if (!this.readabilityScore) return 'unknown';
    if (this.readabilityScore >= 90) return 'very easy';
    if (this.readabilityScore >= 80) return 'easy';
    if (this.readabilityScore >= 70) return 'fairly easy';
    if (this.readabilityScore >= 60) return 'standard';
    if (this.readabilityScore >= 50) return 'fairly difficult';
    if (this.readabilityScore >= 30) return 'difficult';
    return 'very difficult';
  }

  private getSEOOptimizationLevel(): string {
    if (!this.seoScore) return 'unknown';
    if (this.seoScore >= 90) return 'excellent';
    if (this.seoScore >= 80) return 'good';
    if (this.seoScore >= 70) return 'fair';
    if (this.seoScore >= 60) return 'needs improvement';
    return 'poor';
  }
}