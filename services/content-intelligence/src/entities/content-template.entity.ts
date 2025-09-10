import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('content_templates')
@Index(['templateCategory', 'templateType'])
@Index(['industryTags', 'audienceTags'])
@Index(['usageCount'])
export class ContentTemplate {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique template identifier' })
  id: string;

  @Column({ name: 'template_name', length: 200 })
  @ApiProperty({ description: 'Template name' })
  templateName: string;

  @Column({ name: 'template_category', length: 100 })
  @ApiProperty({
    description: 'Template category',
    enum: ['market_analysis', 'education', 'social', 'newsletter', 'promotion', 'compliance'],
  })
  templateCategory: string;

  @Column({ name: 'template_type', length: 50 })
  @ApiProperty({
    description: 'Template type',
    enum: ['post', 'article', 'video_script', 'email', 'report', 'analysis'],
  })
  templateType: string;

  @Column({ name: 'template_structure', type: 'jsonb' })
  @ApiProperty({ description: 'Template framework with placeholders' })
  templateStructure: Record<string, any>;

  @Column({ name: 'example_content', type: 'text', nullable: true })
  @ApiProperty({ description: 'Example content for template' })
  exampleContent: string;

  @Column({ name: 'content_guidelines', type: 'text', nullable: true })
  @ApiProperty({ description: 'Content creation guidelines' })
  contentGuidelines: string;

  @Column({ name: 'ai_model_preference', length: 50, default: 'auto' })
  @ApiProperty({
    description: 'Preferred AI model',
    enum: ['openai', 'claude', 'gemini', 'auto'],
    default: 'auto',
  })
  aiModelPreference: string;

  @Column({ name: 'generation_parameters', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'AI generation parameters (temperature, max_tokens, etc.)' })
  generationParameters: Record<string, any>;

  @Column({ name: 'quality_threshold', type: 'decimal', precision: 3, scale: 1, default: 8.0 })
  @ApiProperty({ description: 'Minimum quality threshold', default: 8.0 })
  qualityThreshold: number;

  @Column({ name: 'compliance_level', length: 20, default: 'standard' })
  @ApiProperty({
    description: 'Compliance level required',
    enum: ['low', 'standard', 'high', 'regulatory'],
    default: 'standard',
  })
  complianceLevel: string;

  @Column({ name: 'required_disclaimers', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Required disclaimers for this template' })
  requiredDisclaimers: string[];

  @Column({ name: 'restricted_jurisdictions', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Jurisdictions where this template is restricted' })
  restrictedJurisdictions: string[];

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Number of times template has been used' })
  usageCount: number;

  @Column({
    name: 'average_quality_score',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  @ApiProperty({ description: 'Average quality score of generated content' })
  averageQualityScore: number;

  @Column({
    name: 'average_engagement_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  @ApiProperty({ description: 'Average engagement rate of content from this template' })
  averageEngagementRate: number;

  @Column({ name: 'industry_tags', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Industry tags for template categorization' })
  industryTags: string[];

  @Column({ name: 'audience_tags', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Target audience tags' })
  audienceTags: string[];

  @Column({ name: 'language', length: 5, default: 'en' })
  @ApiProperty({ description: 'Template language', default: 'en' })
  language: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether template is active' })
  isActive: boolean;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether template is premium' })
  isPremium: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'User who created the template' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Template creation date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Template last update date' })
  updatedAt: Date;
}