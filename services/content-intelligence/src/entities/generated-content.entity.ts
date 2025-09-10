import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ContentTemplate } from './content-template.entity';
import { PlatformOptimizedContent } from './platform-optimized-content.entity';
import { ContentAnalytics } from './content-analytics.entity';

@Entity('generated_content')
@Index(['userId', 'createdAt'])
@Index(['contentType', 'status'])
@Index(['targetPlatforms'])
@Index(['totalEngagement'])
export class GeneratedContent {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique content identifier' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @ApiProperty({ description: 'User who generated the content' })
  userId: string;

  @Column({ name: 'content_title', length: 500, nullable: true })
  @ApiProperty({ description: 'Content title' })
  contentTitle: string;

  @Column({ name: 'content_type', length: 50 })
  @ApiProperty({
    description: 'Content type',
    enum: ['post', 'article', 'email', 'video_script', 'report', 'analysis'],
  })
  contentType: string;

  @Column({ name: 'content_category', length: 100, nullable: true })
  @ApiProperty({
    description: 'Content category',
    enum: ['market_analysis', 'education', 'promotion', 'news', 'opinion'],
  })
  contentCategory: string;

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Template used for generation' })
  templateId: string;

  @ManyToOne(() => ContentTemplate, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: ContentTemplate;

  @Column({ name: 'original_content', type: 'text' })
  @ApiProperty({ description: 'Original generated content' })
  originalContent: string;

  @Column({ name: 'final_content', type: 'text' })
  @ApiProperty({ description: 'Final edited content' })
  finalContent: string;

  @Column({ name: 'content_summary', type: 'text', nullable: true })
  @ApiProperty({ description: 'Content summary' })
  contentSummary: string;

  @Column({ name: 'word_count', type: 'int', nullable: true })
  @ApiProperty({ description: 'Word count of content' })
  wordCount: number;

  @Column({ name: 'ai_model_used', length: 50 })
  @ApiProperty({ description: 'AI model used for generation' })
  aiModelUsed: string;

  @Column({ name: 'generation_parameters', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Parameters used for generation' })
  generationParameters: Record<string, any>;

  @Column({ name: 'generation_time_ms', type: 'int', nullable: true })
  @ApiProperty({ description: 'Generation time in milliseconds' })
  generationTimeMs: number;

  @Column({ name: 'tokens_used', type: 'int', nullable: true })
  @ApiProperty({ description: 'Number of tokens used' })
  tokensUsed: number;

  @Column({ name: 'generation_cost', type: 'decimal', precision: 10, scale: 6, nullable: true })
  @ApiProperty({ description: 'Cost of generation' })
  generationCost: number;

  @Column({ name: 'quality_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  @ApiProperty({ description: 'Content quality score' })
  qualityScore: number;

  @Column({ name: 'readability_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  @ApiProperty({ description: 'Content readability score' })
  readabilityScore: number;

  @Column({ name: 'sentiment_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  @ApiProperty({ description: 'Content sentiment score' })
  sentimentScore: number;

  @Column({ name: 'compliance_status', length: 20, default: 'pending' })
  @ApiProperty({
    description: 'Compliance validation status',
    enum: ['pending', 'approved', 'rejected', 'requires_review'],
    default: 'pending',
  })
  complianceStatus: string;

  @Column({ name: 'compliance_score', type: 'decimal', precision: 3, scale: 1, nullable: true })
  @ApiProperty({ description: 'Compliance validation score' })
  complianceScore: number;

  @Column({ name: 'compliance_violations', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Compliance violations found' })
  complianceViolations: Record<string, any>[];

  @Column({ name: 'required_disclaimers', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Required disclaimers for content' })
  requiredDisclaimers: string[];

  @Column({ name: 'target_platforms', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Target publishing platforms' })
  targetPlatforms: string[];

  @Column({ name: 'publishing_schedule', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Scheduled publishing time' })
  publishingSchedule: Date;

  @Column({ name: 'published_platforms', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Platforms where content was published' })
  publishedPlatforms: Record<string, any>;

  @Column({ name: 'total_engagement', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total engagement across all platforms' })
  totalEngagement: number;

  @Column({ name: 'total_reach', type: 'int', default: 0 })
  @ApiProperty({ description: 'Total reach across all platforms' })
  totalReach: number;

  @Column({ name: 'click_through_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  @ApiProperty({ description: 'Click-through rate' })
  clickThroughRate: number;

  @Column({ name: 'conversion_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of conversions generated' })
  conversionCount: number;

  @Column({ name: 'status', length: 20, default: 'draft' })
  @ApiProperty({
    description: 'Content status',
    enum: ['draft', 'review', 'approved', 'published', 'archived'],
    default: 'draft',
  })
  status: string;

  @Column({ name: 'approval_workflow_id', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Associated approval workflow' })
  approvalWorkflowId: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Content publication date' })
  publishedAt: Date;

  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Content archival date' })
  archivedAt: Date;

  @Column({ name: 'target_audience', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Target audience configuration' })
  targetAudience: Record<string, any>;

  @Column({ name: 'personalization_data', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Personalization data used' })
  personalizationData: Record<string, any>;

  @Column({ name: 'market_context', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Market conditions during generation' })
  marketContext: Record<string, any>;

  @OneToMany(() => PlatformOptimizedContent, (content) => content.generatedContent, {
    cascade: true,
  })
  platformContents: PlatformOptimizedContent[];

  @OneToMany(() => ContentAnalytics, (analytics) => analytics.content, {
    cascade: true,
  })
  analytics: ContentAnalytics[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Content creation date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Content last update date' })
  updatedAt: Date;
}