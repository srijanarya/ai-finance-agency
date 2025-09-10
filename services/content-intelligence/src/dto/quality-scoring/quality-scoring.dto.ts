import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean, ValidateNested, Min, Max, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ContentType,
  TargetAudience,
  AssessmentSpecialty,
  IssueType,
  IssueSeverity,
  ImprovementCategory,
  ImprovementPriority,
} from '../../interfaces/quality-scoring/quality-scoring.interface';

export class AssessmentWeightsDto {
  @ApiProperty({ description: 'Weight for readability assessment (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  readability: number;

  @ApiProperty({ description: 'Weight for accuracy assessment (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  accuracy: number;

  @ApiProperty({ description: 'Weight for compliance assessment (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  compliance: number;

  @ApiProperty({ description: 'Weight for engagement assessment (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  engagement: number;

  @ApiProperty({ description: 'Weight for technical assessment (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  technical: number;

  @ApiProperty({ description: 'Weight for financial quality assessment (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  financial: number;
}

export class QualityThresholdsDto {
  @ApiProperty({ description: 'Minimum score to pass assessment (1-10)', minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  minimumPassingScore: number;

  @ApiProperty({ description: 'Score threshold for excellence rating (1-10)', minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  excellenceThreshold: number;

  @ApiProperty({ enum: IssueSeverity, description: 'Severity level that fails assessment' })
  @IsEnum(IssueSeverity)
  criticalIssueThreshold: IssueSeverity;
}

export class CustomQualityRuleDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  id: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty()
  @IsString()
  @Length(1, 500)
  description: string;

  @ApiProperty({ description: 'Regex or text pattern to match' })
  @IsString()
  pattern: string;

  @ApiProperty({ enum: IssueSeverity })
  @IsEnum(IssueSeverity)
  severity: IssueSeverity;

  @ApiProperty({ description: 'Impact weight on overall score (0-1)', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;

  @ApiProperty({ enum: ImprovementCategory })
  @IsEnum(ImprovementCategory)
  category: ImprovementCategory;
}

export class QualityAssessmentCriteriaDto {
  @ApiProperty({ type: AssessmentWeightsDto })
  @ValidateNested()
  @Type(() => AssessmentWeightsDto)
  weights: AssessmentWeightsDto;

  @ApiProperty({ type: QualityThresholdsDto })
  @ValidateNested()
  @Type(() => QualityThresholdsDto)
  thresholds: QualityThresholdsDto;

  @ApiProperty({ enum: AssessmentSpecialty, isArray: true, description: 'Assessment agents to enable' })
  @IsArray()
  @IsEnum(AssessmentSpecialty, { each: true })
  enabledAgents: AssessmentSpecialty[];

  @ApiPropertyOptional({ type: [CustomQualityRuleDto], description: 'Custom quality rules' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomQualityRuleDto)
  customRules?: CustomQualityRuleDto[];
}

export class AssessContentDto {
  @ApiProperty({ description: 'Content to assess for quality' })
  @IsString()
  @Length(10, 50000)
  content: string;

  @ApiProperty({ enum: ContentType, description: 'Type of content being assessed' })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ enum: TargetAudience, description: 'Target audience for the content' })
  @IsEnum(TargetAudience)
  targetAudience: TargetAudience;

  @ApiPropertyOptional({ description: 'Industry context (e.g., technology, healthcare)' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Content language', default: 'en' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  language?: string = 'en';

  @ApiPropertyOptional({ type: QualityAssessmentCriteriaDto, description: 'Custom assessment criteria' })
  @IsOptional()
  @ValidateNested()
  @Type(() => QualityAssessmentCriteriaDto)
  assessmentCriteria?: QualityAssessmentCriteriaDto;
}

export class ReadabilityScoresDto {
  @ApiProperty({ description: 'Flesch Reading Ease score (0-100)' })
  fleschScore: number;

  @ApiProperty({ description: 'Grade level required to understand content' })
  gradeLevel: number;

  @ApiProperty({ description: 'Sentence complexity score (1-10)' })
  sentenceComplexity: number;

  @ApiProperty({ description: 'Vocabulary complexity score (1-10)' })
  vocabularyComplexity: number;

  @ApiProperty({ description: 'Structure clarity score (1-10)' })
  structureClarity: number;

  @ApiProperty({ description: 'Overall readability score (1-10)' })
  overallReadability: number;
}

export class AccuracyScoresDto {
  @ApiProperty({ description: 'Factual accuracy score (1-10)' })
  factualAccuracy: number;

  @ApiProperty({ description: 'Source credibility score (1-10)' })
  sourceCredibility: number;

  @ApiProperty({ description: 'Data consistency score (1-10)' })
  dataConsistency: number;

  @ApiProperty({ description: 'Logical coherence score (1-10)' })
  logicalCoherence: number;

  @ApiProperty({ description: 'Evidence support score (1-10)' })
  evidenceSupport: number;

  @ApiProperty({ description: 'Overall accuracy score (1-10)' })
  overallAccuracy: number;
}

export class ComplianceScoresDto {
  @ApiProperty({ description: 'Regulatory compliance score (1-10)' })
  regulatoryCompliance: number;

  @ApiProperty({ description: 'Ethical standards score (1-10)' })
  ethicalStandards: number;

  @ApiProperty({ description: 'Disclosure adequacy score (1-10)' })
  disclosureAdequacy: number;

  @ApiProperty({ description: 'Risk warnings score (1-10)' })
  riskWarnings: number;

  @ApiProperty({ description: 'Legal compliance score (1-10)' })
  legalCompliance: number;

  @ApiProperty({ description: 'Overall compliance score (1-10)' })
  overallCompliance: number;
}

export class EngagementScoresDto {
  @ApiProperty({ description: 'Content appeal score (1-10)' })
  contentAppeal: number;

  @ApiProperty({ description: 'Audience relevance score (1-10)' })
  audienceRelevance: number;

  @ApiProperty({ description: 'Emotional impact score (1-10)' })
  emotionalImpact: number;

  @ApiProperty({ description: 'Call-to-action effectiveness score (1-10)' })
  callToActionEffectiveness: number;

  @ApiProperty({ description: 'Shareability score (1-10)' })
  shareability: number;

  @ApiProperty({ description: 'Overall engagement score (1-10)' })
  overallEngagement: number;
}

export class TechnicalScoresDto {
  @ApiProperty({ description: 'Grammar accuracy score (1-10)' })
  grammarAccuracy: number;

  @ApiProperty({ description: 'Spelling accuracy score (1-10)' })
  spellingAccuracy: number;

  @ApiProperty({ description: 'Punctuation accuracy score (1-10)' })
  punctuationAccuracy: number;

  @ApiProperty({ description: 'Style consistency score (1-10)' })
  styleConsistency: number;

  @ApiProperty({ description: 'Format compliance score (1-10)' })
  formatCompliance: number;

  @ApiProperty({ description: 'Overall technical score (1-10)' })
  overallTechnical: number;
}

export class FinancialQualityScoresDto {
  @ApiProperty({ description: 'Market analysis depth score (1-10)' })
  marketAnalysisDepth: number;

  @ApiProperty({ description: 'Risk assessment quality score (1-10)' })
  riskAssessmentQuality: number;

  @ApiProperty({ description: 'Data accuracy score (1-10)' })
  dataAccuracy: number;

  @ApiProperty({ description: 'Professional tone score (1-10)' })
  professionalTone: number;

  @ApiProperty({ description: 'Industry expertise score (1-10)' })
  industryExpertise: number;

  @ApiProperty({ description: 'Overall financial quality score (1-10)' })
  overallFinancialQuality: number;
}

export class DetailedQualityScoresDto {
  @ApiProperty({ type: ReadabilityScoresDto })
  readability: ReadabilityScoresDto;

  @ApiProperty({ type: AccuracyScoresDto })
  accuracy: AccuracyScoresDto;

  @ApiProperty({ type: ComplianceScoresDto })
  compliance: ComplianceScoresDto;

  @ApiProperty({ type: EngagementScoresDto })
  engagement: EngagementScoresDto;

  @ApiProperty({ type: TechnicalScoresDto })
  technical: TechnicalScoresDto;

  @ApiProperty({ type: FinancialQualityScoresDto })
  financial: FinancialQualityScoresDto;
}

export class ContentLocationDto {
  @ApiPropertyOptional({ description: 'Line number' })
  line?: number;

  @ApiPropertyOptional({ description: 'Paragraph number' })
  paragraph?: number;

  @ApiPropertyOptional({ description: 'Section name' })
  section?: string;

  @ApiPropertyOptional({ description: 'Start character index' })
  startIndex?: number;

  @ApiPropertyOptional({ description: 'End character index' })
  endIndex?: number;
}

export class QualityIssueDto {
  @ApiProperty({ enum: IssueType })
  type: IssueType;

  @ApiProperty({ enum: IssueSeverity })
  severity: IssueSeverity;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ type: ContentLocationDto })
  location?: ContentLocationDto;

  @ApiProperty()
  suggestion: string;

  @ApiProperty({ description: 'Impact score (0-10)' })
  impact: number;
}

export class AgentAssessmentDto {
  @ApiProperty()
  agentId: string;

  @ApiProperty()
  agentName: string;

  @ApiProperty({ enum: AssessmentSpecialty })
  specialty: AssessmentSpecialty;

  @ApiProperty({ description: 'Agent assessment score (1-10)' })
  score: number;

  @ApiProperty({ description: 'Agent confidence (0-1)' })
  confidence: number;

  @ApiProperty()
  reasoning: string;

  @ApiProperty({ type: [QualityIssueDto] })
  issues: QualityIssueDto[];

  @ApiProperty({ type: [String] })
  suggestions: string[];

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTime: number;
}

export class QualityImprovementDto {
  @ApiProperty({ enum: ImprovementCategory })
  category: ImprovementCategory;

  @ApiProperty({ enum: ImprovementPriority })
  priority: ImprovementPriority;

  @ApiProperty()
  description: string;

  @ApiProperty({ description: 'Expected score improvement (0-10)' })
  impact: number;

  @ApiProperty({ description: 'Implementation effort (0-10)' })
  effort: number;

  @ApiPropertyOptional({ type: [String] })
  examples?: string[];

  @ApiPropertyOptional({ type: [String] })
  resources?: string[];
}

export class QualityAssessmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Overall quality score (1-10)' })
  overallScore: number;

  @ApiProperty({ description: 'Whether content passed quality threshold' })
  passed: boolean;

  @ApiProperty()
  assessmentDate: Date;

  @ApiProperty({ type: DetailedQualityScoresDto })
  detailed: DetailedQualityScoresDto;

  @ApiProperty({ type: [AgentAssessmentDto] })
  agentAssessments: AgentAssessmentDto[];

  @ApiProperty({ type: [QualityImprovementDto] })
  improvements: QualityImprovementDto[];

  @ApiProperty({ description: 'Assessment confidence (0-1)' })
  confidence: number;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTime: number;
}

export class BatchAssessContentDto {
  @ApiProperty({ type: [AssessContentDto], description: 'Array of content assessment requests' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessContentDto)
  requests: AssessContentDto[];

  @ApiPropertyOptional({ description: 'Process assessments in parallel', default: true })
  @IsOptional()
  @IsBoolean()
  parallel?: boolean = true;

  @ApiPropertyOptional({ description: 'Maximum concurrent assessments', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxConcurrency?: number = 3;
}

export class BatchQualityAssessmentResponseDto {
  @ApiProperty({ type: [QualityAssessmentResponseDto] })
  results: QualityAssessmentResponseDto[];

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failureCount: number;

  @ApiProperty({ type: [String] })
  errors: string[];

  @ApiProperty({ description: 'Total processing time in milliseconds' })
  processingTime: number;

  @ApiProperty({ description: 'Average quality score across all assessments' })
  averageScore: number;

  @ApiProperty({ description: 'Pass rate (percentage)' })
  passRate: number;
}

export class QualityTrendDto {
  @ApiProperty()
  period: string;

  @ApiProperty({ description: 'Average quality score for the period' })
  averageScore: number;

  @ApiProperty({ description: 'Distribution of scores' })
  scoreDistribution: { [score: number]: number };

  @ApiProperty({ description: 'Most common issues in the period' })
  commonIssues: { type: IssueType; count: number }[];

  @ApiProperty({ enum: ImprovementCategory, isArray: true })
  improvementAreas: ImprovementCategory[];
}

export class QualityAnalyticsDto {
  @ApiPropertyOptional({ description: 'Start date for analytics (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ContentType, description: 'Filter by content type' })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ enum: TargetAudience, description: 'Filter by target audience' })
  @IsOptional()
  @IsEnum(TargetAudience)
  targetAudience?: TargetAudience;
}