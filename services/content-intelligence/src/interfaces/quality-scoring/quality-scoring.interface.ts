export interface QualityAssessmentRequest {
  content: string;
  contentType: ContentType;
  targetAudience: TargetAudience;
  industry?: string;
  language?: string;
  assessmentCriteria?: QualityAssessmentCriteria;
}

export interface QualityAssessmentResponse {
  id: string;
  overallScore: number; // 1-10 scale
  passed: boolean; // true if score >= threshold (8+)
  assessmentDate: Date;
  detailed: DetailedQualityScores;
  agentAssessments: AgentAssessment[];
  improvements: QualityImprovement[];
  confidence: number; // 0-1
  processingTime: number; // milliseconds
}

export interface DetailedQualityScores {
  readability: ReadabilityScores;
  accuracy: AccuracyScores;
  compliance: ComplianceScores;
  engagement: EngagementScores;
  technical: TechnicalScores;
  financial: FinancialQualityScores;
}

export interface ReadabilityScores {
  fleschScore: number; // 0-100
  gradeLevel: number;
  sentenceComplexity: number; // 1-10
  vocabularyComplexity: number; // 1-10
  structureClarity: number; // 1-10
  overallReadability: number; // 1-10
}

export interface AccuracyScores {
  factualAccuracy: number; // 1-10
  sourceCredibility: number; // 1-10
  dataConsistency: number; // 1-10
  logicalCoherence: number; // 1-10
  evidenceSupport: number; // 1-10
  overallAccuracy: number; // 1-10
}

export interface ComplianceScores {
  regulatoryCompliance: number; // 1-10
  ethicalStandards: number; // 1-10
  disclosureAdequacy: number; // 1-10
  riskWarnings: number; // 1-10
  legalCompliance: number; // 1-10
  overallCompliance: number; // 1-10
}

export interface EngagementScores {
  contentAppeal: number; // 1-10
  audienceRelevance: number; // 1-10
  emotionalImpact: number; // 1-10
  callToActionEffectiveness: number; // 1-10
  shareability: number; // 1-10
  overallEngagement: number; // 1-10
}

export interface TechnicalScores {
  grammarAccuracy: number; // 1-10
  spellingAccuracy: number; // 1-10
  punctuationAccuracy: number; // 1-10
  styleConsistency: number; // 1-10
  formatCompliance: number; // 1-10
  overallTechnical: number; // 1-10
}

export interface FinancialQualityScores {
  marketAnalysisDepth: number; // 1-10
  riskAssessmentQuality: number; // 1-10
  dataAccuracy: number; // 1-10
  professionalTone: number; // 1-10
  industryExpertise: number; // 1-10
  overallFinancialQuality: number; // 1-10
}

export interface AgentAssessment {
  agentId: string;
  agentName: string;
  specialty: AssessmentSpecialty;
  score: number; // 1-10
  confidence: number; // 0-1
  reasoning: string;
  issues: QualityIssue[];
  suggestions: string[];
  processingTime: number;
}

export interface QualityIssue {
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  location?: ContentLocation;
  suggestion: string;
  impact: number; // 0-10
}

export interface ContentLocation {
  line?: number;
  paragraph?: number;
  section?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface QualityImprovement {
  category: ImprovementCategory;
  priority: ImprovementPriority;
  description: string;
  impact: number; // Expected score improvement (0-10)
  effort: number; // Implementation effort (0-10)
  examples?: string[];
  resources?: string[];
}

export interface QualityAssessmentCriteria {
  weights: AssessmentWeights;
  thresholds: QualityThresholds;
  enabledAgents: AssessmentSpecialty[];
  customRules?: CustomQualityRule[];
}

export interface AssessmentWeights {
  readability: number; // 0-1
  accuracy: number;
  compliance: number;
  engagement: number;
  technical: number;
  financial: number;
}

export interface QualityThresholds {
  minimumPassingScore: number; // 1-10
  excellenceThreshold: number; // 1-10
  criticalIssueThreshold: number; // Severity level that fails assessment
}

export interface CustomQualityRule {
  id: string;
  name: string;
  description: string;
  pattern: string; // Regex or text pattern
  severity: IssueSeverity;
  weight: number; // Impact on overall score
  category: ImprovementCategory;
}

export enum ContentType {
  MARKET_ANALYSIS = 'market_analysis',
  RESEARCH_REPORT = 'research_report',
  INVESTMENT_MEMO = 'investment_memo',
  NEWSLETTER = 'newsletter',
  BLOG_POST = 'blog_post',
  PRESS_RELEASE = 'press_release',
  SOCIAL_MEDIA = 'social_media',
  EMAIL_CAMPAIGN = 'email_campaign',
  EDUCATIONAL = 'educational',
  REGULATORY_FILING = 'regulatory_filing'
}

export enum TargetAudience {
  RETAIL_INVESTORS = 'retail_investors',
  INSTITUTIONAL_INVESTORS = 'institutional_investors',
  FINANCIAL_ADVISORS = 'financial_advisors',
  INDUSTRY_PROFESSIONALS = 'industry_professionals',
  GENERAL_PUBLIC = 'general_public',
  REGULATORS = 'regulators',
  MEDIA = 'media',
  ANALYSTS = 'analysts'
}

export enum AssessmentSpecialty {
  READABILITY = 'readability',
  FINANCIAL_ACCURACY = 'financial_accuracy',
  COMPLIANCE = 'compliance',
  ENGAGEMENT = 'engagement',
  TECHNICAL_WRITING = 'technical_writing',
  MARKET_ANALYSIS = 'market_analysis',
  RISK_ASSESSMENT = 'risk_assessment',
  SEO_OPTIMIZATION = 'seo_optimization'
}

export enum IssueType {
  GRAMMAR = 'grammar',
  SPELLING = 'spelling',
  PUNCTUATION = 'punctuation',
  READABILITY = 'readability',
  FACTUAL_ERROR = 'factual_error',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  BIAS = 'bias',
  TONE_INCONSISTENCY = 'tone_inconsistency',
  STRUCTURE = 'structure',
  CLARITY = 'clarity',
  RELEVANCE = 'relevance',
  ENGAGEMENT = 'engagement'
}

export enum IssueSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ImprovementCategory {
  CONTENT_QUALITY = 'content_quality',
  READABILITY = 'readability',
  TECHNICAL = 'technical',
  COMPLIANCE = 'compliance',
  ENGAGEMENT = 'engagement',
  SEO = 'seo',
  ACCURACY = 'accuracy',
  STRUCTURE = 'structure'
}

export enum ImprovementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface QualityAgent {
  id: string;
  name: string;
  specialty: AssessmentSpecialty;
  assess(content: string, context: AssessmentContext): Promise<AgentAssessment>;
  getCapabilities(): AgentCapabilities;
}

export interface AssessmentContext {
  contentType: ContentType;
  targetAudience: TargetAudience;
  industry?: string;
  language: string;
  customCriteria?: QualityAssessmentCriteria;
}

export interface AgentCapabilities {
  supportedContentTypes: ContentType[];
  supportedLanguages: string[];
  assessmentAreas: string[];
  processingSpeed: 'fast' | 'medium' | 'slow';
  accuracy: number; // 0-1
}

export interface QualityTrend {
  period: string;
  averageScore: number;
  scoreDistribution: { [score: number]: number };
  commonIssues: { type: IssueType; count: number }[];
  improvementAreas: ImprovementCategory[];
}

export interface BenchmarkData {
  industry: string;
  contentType: ContentType;
  averageScore: number;
  topPerformers: number; // 90th percentile score
  benchmarkDate: Date;
  sampleSize: number;
}