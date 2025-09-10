import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface PersonalizationRequest {
  userId: string;
  contentType?: string;
  context?: PersonalizationContext;
  preferences?: UserPreferences;
}

export interface PersonalizationResponse {
  userId: string;
  recommendations: ContentRecommendation[];
  personalizedContent: PersonalizedContent[];
  userProfile: UserProfile;
  insights: PersonalizationInsight[];
  updatedAt: Date;
}

export interface PersonalizationContext {
  currentMarketConditions?: string;
  timeOfDay?: string;
  deviceType?: string;
  location?: string;
  sessionHistory?: string[];
}

export interface UserPreferences {
  contentTypes: string[];
  riskTolerance: RiskTolerance;
  investmentGoals: InvestmentGoal[];
  industries: string[];
  complexityLevel: ComplexityLevel;
  contentLength: ContentLengthPreference;
  updateFrequency: UpdateFrequency;
  languagePreference: string;
  notificationSettings: NotificationSettings;
}

export interface ContentRecommendation {
  id: string;
  contentType: string;
  title: string;
  description: string;
  relevanceScore: number; // 0-1
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  estimatedReadTime: number; // minutes
  tags: string[];
  recommendationReason: string;
  personalizationFactors: PersonalizationFactor[];
}

export interface PersonalizedContent {
  originalContentId: string;
  personalizedVersion: string;
  adaptations: ContentAdaptation[];
  personalizationScore: number;
  targetSegments: string[];
}

export interface UserProfile {
  userId: string;
  demographics: UserDemographics;
  behaviorProfile: BehaviorProfile;
  preferences: UserPreferences;
  engagementHistory: EngagementMetrics;
  riskProfile: RiskProfile;
  investmentProfile: InvestmentProfile;
  learningStyle: LearningStyle;
  lastUpdated: Date;
}

export interface PersonalizationInsight {
  type: InsightType;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendation: string;
  metrics: any;
}

export interface PersonalizationFactor {
  factor: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface ContentAdaptation {
  type: AdaptationType;
  originalElement: string;
  adaptedElement: string;
  reason: string;
}

export interface UserDemographics {
  ageRange?: string;
  location?: string;
  occupation?: string;
  incomeRange?: string;
  investmentExperience?: string;
}

export interface BehaviorProfile {
  readingPatterns: ReadingPattern[];
  engagementTimes: EngagementTime[];
  contentPreferences: ContentPreferenceData[];
  interactionHistory: InteractionEvent[];
  sessionDuration: number; // average in minutes
  bounceRate: number; // 0-1
}

export interface EngagementMetrics {
  totalSessions: number;
  avgSessionDuration: number;
  totalContentViewed: number;
  avgEngagementScore: number;
  preferredContentTypes: { [type: string]: number };
  mostActiveHours: number[];
  lastActiveDate: Date;
}

export interface RiskProfile {
  tolerance: RiskTolerance;
  capacity: RiskCapacity;
  assessmentDate: Date;
  questionsAnswered: RiskQuestion[];
  calculatedScore: number;
}

export interface InvestmentProfile {
  goals: InvestmentGoal[];
  timeHorizon: TimeHorizon;
  liquidityNeeds: LiquidityNeeds;
  currentPortfolio?: PortfolioAllocation;
  investmentKnowledge: InvestmentKnowledge;
  regulatoryStatus: RegulatoryStatus;
}

export interface ReadingPattern {
  contentType: string;
  avgReadTime: number;
  completionRate: number;
  preferredLength: ContentLengthPreference;
  timeOfDay: string;
}

export interface EngagementTime {
  hour: number;
  dayOfWeek: number;
  engagementLevel: number;
  contentTypesViewed: string[];
}

export interface ContentPreferenceData {
  contentType: string;
  topics: string[];
  preferredStyle: string;
  preferredTone: string;
  engagementScore: number;
}

export interface InteractionEvent {
  timestamp: Date;
  eventType: string;
  contentId: string;
  duration: number;
  engagement: number;
  outcome: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: UpdateFrequency;
  categories: string[];
  quietHours: { start: string; end: string };
}

export interface RiskQuestion {
  questionId: string;
  answer: string;
  weight: number;
  category: string;
}

export interface PortfolioAllocation {
  stocks: number;
  bonds: number;
  cash: number;
  alternatives: number;
  international: number;
}

export enum RiskTolerance {
  VERY_CONSERVATIVE = 'very_conservative',
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  VERY_AGGRESSIVE = 'very_aggressive'
}

export enum RiskCapacity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum InvestmentGoal {
  WEALTH_BUILDING = 'wealth_building',
  RETIREMENT = 'retirement',
  INCOME_GENERATION = 'income_generation',
  CAPITAL_PRESERVATION = 'capital_preservation',
  EDUCATION_FUNDING = 'education_funding',
  MAJOR_PURCHASE = 'major_purchase',
  EMERGENCY_FUND = 'emergency_fund'
}

export enum TimeHorizon {
  SHORT_TERM = 'short_term', // < 3 years
  MEDIUM_TERM = 'medium_term', // 3-10 years
  LONG_TERM = 'long_term' // > 10 years
}

export enum ComplexityLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ContentLengthPreference {
  SHORT = 'short', // < 500 words
  MEDIUM = 'medium', // 500-1500 words
  LONG = 'long', // > 1500 words
  MIXED = 'mixed'
}

export enum UpdateFrequency {
  REAL_TIME = 'real_time',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum LiquidityNeeds {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum InvestmentKnowledge {
  BEGINNER = 'beginner',
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum RegulatoryStatus {
  RETAIL = 'retail',
  PROFESSIONAL = 'professional',
  ELIGIBLE_COUNTERPARTY = 'eligible_counterparty'
}

export enum InsightType {
  CONTENT_PREFERENCE = 'content_preference',
  BEHAVIOR_PATTERN = 'behavior_pattern',
  ENGAGEMENT_OPTIMIZATION = 'engagement_optimization',
  RISK_ALIGNMENT = 'risk_alignment',
  GOAL_PROGRESS = 'goal_progress'
}

export enum AdaptationType {
  TONE_ADJUSTMENT = 'tone_adjustment',
  COMPLEXITY_LEVEL = 'complexity_level',
  LENGTH_OPTIMIZATION = 'length_optimization',
  EXAMPLE_CUSTOMIZATION = 'example_customization',
  TERMINOLOGY_ADAPTATION = 'terminology_adaptation'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
  MULTIMODAL = 'multimodal'
}

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    // Note: In a full implementation, you'd inject user profile and interaction repositories
  ) {}

  async personalizeContent(request: PersonalizationRequest): Promise<PersonalizationResponse> {
    try {
      this.logger.log(`Personalizing content for user: ${request.userId}`);

      // Get or create user profile
      const userProfile = await this.getUserProfile(request.userId, request.preferences);

      // Generate content recommendations
      const recommendations = await this.generateRecommendations(userProfile, request.context);

      // Personalize existing content
      const personalizedContent = await this.adaptContent(userProfile, request.contentType);

      // Generate insights
      const insights = this.generateInsights(userProfile, recommendations);

      // Update user profile based on current interaction
      await this.updateUserProfile(userProfile, request);

      const response: PersonalizationResponse = {
        userId: request.userId,
        recommendations,
        personalizedContent,
        userProfile,
        insights,
        updatedAt: new Date(),
      };

      // Emit personalization event
      this.eventEmitter.emit('content.personalized', {
        userId: request.userId,
        recommendationCount: recommendations.length,
        adaptationCount: personalizedContent.length,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      this.logger.error(`Personalization failed for user ${request.userId}: ${error.message}`);
      throw error;
    }
  }

  private async getUserProfile(userId: string, preferences?: UserPreferences): Promise<UserProfile> {
    // In a real implementation, this would fetch from database
    // For now, return a mock profile
    return {
      userId,
      demographics: {
        ageRange: '30-40',
        location: 'United States',
        occupation: 'Technology Professional',
        incomeRange: '100k-150k',
        investmentExperience: 'Intermediate',
      },
      behaviorProfile: {
        readingPatterns: [
          {
            contentType: 'market_analysis',
            avgReadTime: 5.2,
            completionRate: 0.78,
            preferredLength: ContentLengthPreference.MEDIUM,
            timeOfDay: 'morning',
          },
        ],
        engagementTimes: [
          { hour: 8, dayOfWeek: 1, engagementLevel: 0.9, contentTypesViewed: ['market_analysis'] },
          { hour: 18, dayOfWeek: 1, engagementLevel: 0.7, contentTypesViewed: ['newsletter'] },
        ],
        contentPreferences: [
          {
            contentType: 'market_analysis',
            topics: ['technology', 'growth stocks'],
            preferredStyle: 'analytical',
            preferredTone: 'professional',
            engagementScore: 0.85,
          },
        ],
        interactionHistory: [],
        sessionDuration: 12.5,
        bounceRate: 0.25,
      },
      preferences: preferences || {
        contentTypes: ['market_analysis', 'research_report'],
        riskTolerance: RiskTolerance.MODERATE,
        investmentGoals: [InvestmentGoal.WEALTH_BUILDING, InvestmentGoal.RETIREMENT],
        industries: ['technology', 'healthcare'],
        complexityLevel: ComplexityLevel.INTERMEDIATE,
        contentLength: ContentLengthPreference.MEDIUM,
        updateFrequency: UpdateFrequency.DAILY,
        languagePreference: 'en',
        notificationSettings: {
          email: true,
          push: false,
          sms: false,
          frequency: UpdateFrequency.DAILY,
          categories: ['market_updates', 'portfolio_alerts'],
          quietHours: { start: '22:00', end: '07:00' },
        },
      },
      engagementHistory: {
        totalSessions: 45,
        avgSessionDuration: 12.5,
        totalContentViewed: 120,
        avgEngagementScore: 0.75,
        preferredContentTypes: { 'market_analysis': 40, 'newsletter': 35, 'research_report': 25 },
        mostActiveHours: [8, 12, 18],
        lastActiveDate: new Date(),
      },
      riskProfile: {
        tolerance: RiskTolerance.MODERATE,
        capacity: RiskCapacity.MEDIUM,
        assessmentDate: new Date(),
        questionsAnswered: [],
        calculatedScore: 6.5,
      },
      investmentProfile: {
        goals: [InvestmentGoal.WEALTH_BUILDING, InvestmentGoal.RETIREMENT],
        timeHorizon: TimeHorizon.LONG_TERM,
        liquidityNeeds: LiquidityNeeds.MEDIUM,
        investmentKnowledge: InvestmentKnowledge.INTERMEDIATE,
        regulatoryStatus: RegulatoryStatus.RETAIL,
      },
      learningStyle: LearningStyle.VISUAL,
      lastUpdated: new Date(),
    };
  }

  private async generateRecommendations(
    userProfile: UserProfile,
    context?: PersonalizationContext
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    // Generate recommendations based on user preferences
    const preferredTypes = userProfile.preferences.contentTypes;
    const preferredIndustries = userProfile.preferences.industries;

    // Mock recommendation generation
    const mockRecommendations = [
      {
        contentType: 'market_analysis',
        title: 'Technology Sector Growth Outlook',
        description: 'Analysis of growth prospects in the technology sector',
        tags: ['technology', 'growth', 'analysis'],
        urgency: 'medium' as const,
        estimatedReadTime: 6,
      },
      {
        contentType: 'research_report',
        title: 'Healthcare Innovation Investment Opportunities',
        description: 'Deep dive into emerging healthcare investment themes',
        tags: ['healthcare', 'innovation', 'investment'],
        urgency: 'low' as const,
        estimatedReadTime: 12,
      },
      {
        contentType: 'newsletter',
        title: 'Weekly Market Roundup',
        description: 'Summary of key market developments this week',
        tags: ['market', 'summary', 'weekly'],
        urgency: 'high' as const,
        estimatedReadTime: 4,
      },
    ];

    mockRecommendations.forEach((mock, index) => {
      const relevanceScore = this.calculateRelevanceScore(mock, userProfile);
      const personalizationFactors = this.identifyPersonalizationFactors(mock, userProfile);

      if (relevanceScore > 0.3) { // Only include relevant recommendations
        recommendations.push({
          id: `rec_${Date.now()}_${index}`,
          contentType: mock.contentType,
          title: mock.title,
          description: mock.description,
          relevanceScore,
          urgency: mock.urgency,
          estimatedReadTime: mock.estimatedReadTime,
          tags: mock.tags,
          recommendationReason: this.generateRecommendationReason(mock, userProfile, relevanceScore),
          personalizationFactors,
        });
      }
    });

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async adaptContent(userProfile: UserProfile, contentType?: string): Promise<PersonalizedContent[]> {
    const adaptations: PersonalizedContent[] = [];

    // Mock content adaptation
    const mockContent = {
      originalContentId: 'content_123',
      originalText: 'The market has shown significant volatility in recent weeks, with technology stocks experiencing particular pressure due to interest rate concerns.',
    };

    const adaptedVersion = this.adaptContentForUser(mockContent.originalText, userProfile);
    const contentAdaptations = this.identifyAdaptations(mockContent.originalText, adaptedVersion);

    adaptations.push({
      originalContentId: mockContent.originalContentId,
      personalizedVersion: adaptedVersion,
      adaptations: contentAdaptations,
      personalizationScore: 0.85,
      targetSegments: this.identifyTargetSegments(userProfile),
    });

    return adaptations;
  }

  private generateInsights(
    userProfile: UserProfile,
    recommendations: ContentRecommendation[]
  ): PersonalizationInsight[] {
    const insights: PersonalizationInsight[] = [];

    // Content preference insights
    const topContentType = Object.entries(userProfile.engagementHistory.preferredContentTypes)
      .sort(([,a], [,b]) => b - a)[0];

    if (topContentType) {
      insights.push({
        type: InsightType.CONTENT_PREFERENCE,
        description: `User shows strong preference for ${topContentType[0]} content (${topContentType[1]}% of engagement)`,
        confidence: 0.85,
        actionable: true,
        recommendation: `Prioritize ${topContentType[0]} content in future recommendations`,
        metrics: { contentType: topContentType[0], engagementPercentage: topContentType[1] },
      });
    }

    // Behavior pattern insights
    const peakHours = userProfile.engagementHistory.mostActiveHours;
    if (peakHours.length > 0) {
      insights.push({
        type: InsightType.BEHAVIOR_PATTERN,
        description: `User is most active during hours: ${peakHours.join(', ')}`,
        confidence: 0.78,
        actionable: true,
        recommendation: 'Schedule content delivery during peak engagement hours',
        metrics: { peakHours, avgSessionDuration: userProfile.engagementHistory.avgSessionDuration },
      });
    }

    // Risk alignment insights
    const riskScore = userProfile.riskProfile.calculatedScore;
    insights.push({
      type: InsightType.RISK_ALIGNMENT,
      description: `User risk profile (${riskScore}/10) aligns with ${userProfile.riskProfile.tolerance} investment approach`,
      confidence: 0.9,
      actionable: true,
      recommendation: 'Tailor investment content to match moderate risk tolerance',
      metrics: { riskScore, riskTolerance: userProfile.riskProfile.tolerance },
    });

    return insights;
  }

  private calculateRelevanceScore(content: any, userProfile: UserProfile): number {
    let score = 0.3; // Base score

    // Content type preference
    if (userProfile.preferences.contentTypes.includes(content.contentType)) {
      score += 0.3;
    }

    // Industry interest
    const hasRelevantIndustry = content.tags.some((tag: string) =>
      userProfile.preferences.industries.some(industry =>
        tag.toLowerCase().includes(industry.toLowerCase())
      )
    );
    if (hasRelevantIndustry) {
      score += 0.2;
    }

    // Reading time preference
    const readingTime = content.estimatedReadTime;
    const preferredLength = userProfile.preferences.contentLength;
    
    if (
      (preferredLength === ContentLengthPreference.SHORT && readingTime <= 5) ||
      (preferredLength === ContentLengthPreference.MEDIUM && readingTime > 5 && readingTime <= 15) ||
      (preferredLength === ContentLengthPreference.LONG && readingTime > 15) ||
      (preferredLength === ContentLengthPreference.MIXED)
    ) {
      score += 0.15;
    }

    // Historical engagement
    const historicalEngagement = userProfile.behaviorProfile.contentPreferences.find(
      pref => pref.contentType === content.contentType
    );
    if (historicalEngagement) {
      score += historicalEngagement.engagementScore * 0.05;
    }

    return Math.min(1, score);
  }

  private identifyPersonalizationFactors(content: any, userProfile: UserProfile): PersonalizationFactor[] {
    const factors: PersonalizationFactor[] = [];

    // Content type preference factor
    if (userProfile.preferences.contentTypes.includes(content.contentType)) {
      factors.push({
        factor: 'Content Type Preference',
        weight: 0.3,
        contribution: 0.3,
        explanation: `User has expressed preference for ${content.contentType} content`,
      });
    }

    // Industry interest factor
    const matchingIndustries = content.tags.filter((tag: string) =>
      userProfile.preferences.industries.some(industry =>
        tag.toLowerCase().includes(industry.toLowerCase())
      )
    );

    if (matchingIndustries.length > 0) {
      factors.push({
        factor: 'Industry Interest',
        weight: 0.2,
        contribution: 0.2,
        explanation: `Content covers user's interested industries: ${matchingIndustries.join(', ')}`,
      });
    }

    // Reading time alignment
    factors.push({
      factor: 'Reading Time Preference',
      weight: 0.15,
      contribution: 0.1,
      explanation: 'Content length aligns with user preferences',
    });

    return factors;
  }

  private generateRecommendationReason(content: any, userProfile: UserProfile, relevanceScore: number): string {
    const reasons: string[] = [];

    if (userProfile.preferences.contentTypes.includes(content.contentType)) {
      reasons.push(`matches your preference for ${content.contentType} content`);
    }

    const hasRelevantIndustry = content.tags.some((tag: string) =>
      userProfile.preferences.industries.some(industry =>
        tag.toLowerCase().includes(industry.toLowerCase())
      )
    );

    if (hasRelevantIndustry) {
      reasons.push('covers industries you follow');
    }

    if (content.urgency === 'high' || content.urgency === 'urgent') {
      reasons.push('contains time-sensitive market information');
    }

    if (reasons.length === 0) {
      reasons.push('based on your reading patterns and preferences');
    }

    return `Recommended because it ${reasons.join(' and ')}.`;
  }

  private adaptContentForUser(originalText: string, userProfile: UserProfile): string {
    let adaptedText = originalText;

    // Adapt based on complexity level
    if (userProfile.preferences.complexityLevel === ComplexityLevel.BEGINNER) {
      adaptedText = adaptedText.replace('volatility', 'price swings');
      adaptedText = adaptedText.replace('interest rate concerns', 'worries about rising borrowing costs');
    }

    // Adapt based on risk tolerance
    if (userProfile.riskProfile.tolerance === RiskTolerance.CONSERVATIVE) {
      adaptedText += ' For conservative investors, this period emphasizes the importance of diversification and maintaining a long-term perspective.';
    }

    // Adapt based on preferred industries
    if (userProfile.preferences.industries.includes('technology')) {
      adaptedText += ' Technology investors should particularly monitor earnings reports and guidance from major tech companies.';
    }

    return adaptedText;
  }

  private identifyAdaptations(originalText: string, adaptedText: string): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];

    if (originalText !== adaptedText) {
      if (adaptedText.includes('price swings')) {
        adaptations.push({
          type: AdaptationType.TERMINOLOGY_ADAPTATION,
          originalElement: 'volatility',
          adaptedElement: 'price swings',
          reason: 'Simplified terminology for beginner complexity level',
        });
      }

      if (adaptedText.includes('conservative investors')) {
        adaptations.push({
          type: AdaptationType.TONE_ADJUSTMENT,
          originalElement: 'original content',
          adaptedElement: 'added conservative investor guidance',
          reason: 'Aligned with user risk tolerance',
        });
      }

      if (adaptedText.includes('Technology investors')) {
        adaptations.push({
          type: AdaptationType.EXAMPLE_CUSTOMIZATION,
          originalElement: 'generic content',
          adaptedElement: 'technology-specific guidance',
          reason: 'Customized for user industry preferences',
        });
      }
    }

    return adaptations;
  }

  private identifyTargetSegments(userProfile: UserProfile): string[] {
    const segments: string[] = [];

    // Risk-based segmentation
    segments.push(`risk_${userProfile.riskProfile.tolerance}`);

    // Experience-based segmentation
    segments.push(`experience_${userProfile.investmentProfile.investmentKnowledge}`);

    // Goal-based segmentation
    userProfile.investmentProfile.goals.forEach(goal => {
      segments.push(`goal_${goal}`);
    });

    // Behavior-based segmentation
    if (userProfile.engagementHistory.avgEngagementScore > 0.8) {
      segments.push('high_engagement');
    }

    return segments;
  }

  private async updateUserProfile(userProfile: UserProfile, request: PersonalizationRequest): Promise<void> {
    // In a real implementation, this would update the user profile in the database
    // based on the current interaction and preferences
    userProfile.lastUpdated = new Date();

    // Update preferences if provided
    if (request.preferences) {
      userProfile.preferences = { ...userProfile.preferences, ...request.preferences };
    }

    // Log interaction
    const interactionEvent: InteractionEvent = {
      timestamp: new Date(),
      eventType: 'personalization_request',
      contentId: request.contentType || 'general',
      duration: 0, // Would be calculated from actual interaction
      engagement: 0.5, // Default engagement score
      outcome: 'personalized_content_delivered',
    };

    userProfile.behaviorProfile.interactionHistory.push(interactionEvent);

    // Emit profile update event
    this.eventEmitter.emit('user.profile.updated', {
      userId: userProfile.userId,
      updateType: 'personalization_interaction',
      timestamp: new Date(),
    });
  }
}