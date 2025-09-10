import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('compliance_rules')
@Index(['ruleCategory', 'applicableJurisdictions'])
@Index(['applicableContentTypes'])
@Index(['severityLevel', 'isActive'])
@Index(['effectiveDate', 'expiryDate'])
export class ComplianceRule {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique rule identifier' })
  id: string;

  @Column({ name: 'rule_name', length: 200 })
  @ApiProperty({ description: 'Rule name' })
  ruleName: string;

  @Column({ name: 'rule_category', length: 100 })
  @ApiProperty({
    description: 'Regulatory category',
    enum: ['SEC', 'FINRA', 'GDPR', 'FCA', 'CFTC', 'MiFID', 'ESMA'],
  })
  ruleCategory: string;

  @Column({ name: 'rule_code', length: 50, nullable: true })
  @ApiProperty({ description: 'Official regulation code' })
  ruleCode: string;

  @Column({ name: 'rule_description', type: 'text' })
  @ApiProperty({ description: 'Rule description' })
  ruleDescription: string;

  @Column({ name: 'rule_full_text', type: 'text', nullable: true })
  @ApiProperty({ description: 'Complete rule text' })
  ruleFullText: string;

  @Column({ name: 'interpretation_guidance', type: 'text', nullable: true })
  @ApiProperty({ description: 'Interpretation guidance for the rule' })
  interpretationGuidance: string;

  @Column({ name: 'applicable_jurisdictions', type: 'text', array: true })
  @ApiProperty({ description: 'Jurisdictions where rule applies' })
  applicableJurisdictions: string[];

  @Column({ name: 'applicable_content_types', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Content types this rule applies to' })
  applicableContentTypes: string[];

  @Column({ name: 'applicable_industries', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Industries this rule applies to' })
  applicableIndustries: string[];

  @Column({ name: 'severity_level', length: 20 })
  @ApiProperty({
    description: 'Rule severity level',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  severityLevel: string;

  @Column({ name: 'violation_penalty', type: 'text', nullable: true })
  @ApiProperty({ description: 'Penalty for rule violation' })
  violationPenalty: string;

  @Column({ name: 'detection_keywords', type: 'text', array: true, nullable: true })
  @ApiProperty({ description: 'Keywords that trigger rule evaluation' })
  detectionKeywords: string[];

  @Column({ name: 'detection_patterns', type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Regex patterns and AI prompts for detection' })
  detectionPatterns: Record<string, any>;

  @Column({ name: 'auto_enforcement', type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether rule is automatically enforced' })
  autoEnforcement: boolean;

  @Column({ name: 'requires_human_review', type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether rule violations require human review' })
  requiresHumanReview: boolean;

  @Column({ name: 'effective_date', type: 'date' })
  @ApiProperty({ description: 'Rule effective date' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  @ApiProperty({ description: 'Rule expiry date' })
  expiryDate: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether rule is currently active' })
  isActive: boolean;

  @Column({ name: 'superseded_by', type: 'uuid', nullable: true })
  @ApiProperty({ description: 'Rule that supersedes this one' })
  supersededBy: string;

  @Column({ name: 'regulatory_source', length: 200, nullable: true })
  @ApiProperty({ description: 'Source of the regulation' })
  regulatorySource: string;

  @Column({ name: 'last_updated_by', length: 100, nullable: true })
  @ApiProperty({ description: 'Who last updated the rule' })
  lastUpdatedBy: string;

  @Column({ name: 'update_frequency', length: 50, nullable: true })
  @ApiProperty({ description: 'How often rule is reviewed' })
  updateFrequency: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Rule creation date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Rule last update date' })
  updatedAt: Date;
}