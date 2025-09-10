import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// DTOs
import { PersonalizationDataDto } from '../dto/content-generation.dto';

export interface PersonalizationContext {
  userProfile: {
    industry: string;
    role: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'low' | 'medium' | 'high';
    investmentGoals: string[];
    preferredAssetClasses: string[];
  };
  contentPreferences: {
    toneStyle: 'formal' | 'conversational' | 'technical' | 'educational';
    complexityLevel: 'basic' | 'intermediate' | 'advanced';
    contentLength: 'short' | 'medium' | 'long';
    preferredFormats: string[];
  };
  audienceContext: {
    targetSegments: string[];
    demographics: Record<string, any>;
    behaviorPatterns: Record<string, any>;
    engagementHistory: Record<string, any>;
  };
  marketContext: {
    relevantMarkets: string[];
    timingPreferences: string[];
    newsTopics: string[];
  };
}

@Injectable()
export class PersonalizationService {
  private readonly logger = new Logger(PersonalizationService.name);

  constructor(private readonly configService: ConfigService) {}

  async buildPersonalizationContext(
    personalizationData: PersonalizationDataDto,
    userId?: string,
  ): Promise<PersonalizationContext> {
    try {
      this.logger.debug('Building personalization context', {
        userId,
        audienceSegments: personalizationData.audienceSegments?.length,
      });

      // Build user profile from personalization data
      const userProfile = await this.buildUserProfile(personalizationData, userId);
      
      // Determine content preferences
      const contentPreferences = await this.determineContentPreferences(userProfile, personalizationData);
      
      // Build audience context
      const audienceContext = await this.buildAudienceContext(personalizationData);
      
      // Build market context
      const marketContext = await this.buildMarketContext(userProfile, personalizationData);

      const context: PersonalizationContext = {
        userProfile,
        contentPreferences,
        audienceContext,
        marketContext,
      };

      this.logger.debug('Personalization context built successfully', {
        userId,
        industry: context.userProfile.industry,
        toneStyle: context.contentPreferences.toneStyle,
        targetSegments: context.audienceContext.targetSegments.length,
      });

      return context;
    } catch (error) {
      this.logger.error('Failed to build personalization context', {
        error: error.message,
        userId,
        personalizationData,
      });

      // Return default context
      return this.getDefaultPersonalizationContext(personalizationData);
    }
  }

  private async buildUserProfile(
    data: PersonalizationDataDto,
    userId?: string,
  ): Promise<PersonalizationContext['userProfile']> {
    // In production, this would fetch user profile data from database
    // For now, we'll infer from the provided data
    
    const industry = data.industry || 'financial_services';
    const role = data.role || 'financial_advisor';
    
    // Infer experience level from role
    const experienceLevel = this.inferExperienceLevel(role);
    
    // Infer risk tolerance from role and industry
    const riskTolerance = this.inferRiskTolerance(role, industry);
    
    // Default investment goals based on role
    const investmentGoals = this.getDefaultInvestmentGoals(role);
    
    // Default asset classes based on industry and role
    const preferredAssetClasses = this.getDefaultAssetClasses(industry, role);

    return {
      industry,
      role,
      experienceLevel,
      riskTolerance,
      investmentGoals,
      preferredAssetClasses,
    };
  }

  private inferExperienceLevel(role: string): 'beginner' | 'intermediate' | 'advanced' {
    const advancedRoles = [
      'portfolio_manager',
      'investment_advisor',
      'fund_manager',
      'chief_investment_officer',
      'hedge_fund_manager',
    ];
    
    const intermediateRoles = [
      'financial_advisor',
      'investment_analyst',
      'financial_planner',
      'wealth_manager',
    ];

    if (advancedRoles.some(r => role.toLowerCase().includes(r))) return 'advanced';
    if (intermediateRoles.some(r => role.toLowerCase().includes(r))) return 'intermediate';
    return 'beginner';
  }

  private inferRiskTolerance(role: string, industry: string): 'low' | 'medium' | 'high' {
    const highRiskRoles = ['hedge_fund', 'prop_trader', 'venture_capital'];
    const lowRiskRoles = ['pension_fund', 'insurance', 'conservative'];

    if (highRiskRoles.some(r => role.toLowerCase().includes(r) || industry.toLowerCase().includes(r))) {
      return 'high';
    }
    
    if (lowRiskRoles.some(r => role.toLowerCase().includes(r) || industry.toLowerCase().includes(r))) {
      return 'low';
    }
    
    return 'medium';
  }

  private getDefaultInvestmentGoals(role: string): string[] {
    const goalsByRole: Record<string, string[]> = {
      financial_advisor: ['client_portfolio_growth', 'risk_management', 'income_generation'],
      portfolio_manager: ['alpha_generation', 'risk_adjusted_returns', 'benchmark_outperformance'],
      retirement_planner: ['long_term_growth', 'income_stability', 'inflation_protection'],
      wealth_manager: ['wealth_preservation', 'tax_efficiency', 'estate_planning'],
    };

    return goalsByRole[role] || ['portfolio_growth', 'risk_management'];
  }

  private getDefaultAssetClasses(industry: string, role: string): string[] {
    if (industry.includes('crypto') || role.includes('crypto')) {
      return ['cryptocurrency', 'digital_assets'];
    }
    
    if (industry.includes('real_estate') || role.includes('real_estate')) {
      return ['real_estate', 'reits', 'commodities'];
    }
    
    // Default diversified portfolio
    return ['equities', 'fixed_income', 'alternatives', 'cash'];
  }

  private async determineContentPreferences(
    userProfile: PersonalizationContext['userProfile'],
    data: PersonalizationDataDto,
  ): Promise<PersonalizationContext['contentPreferences']> {
    // Determine tone style based on user profile
    let toneStyle: 'formal' | 'conversational' | 'technical' | 'educational' = 'conversational';
    
    if (data.tonePreference) {
      toneStyle = data.tonePreference as any;
    } else if (userProfile.experienceLevel === 'advanced') {
      toneStyle = 'technical';
    } else if (userProfile.experienceLevel === 'beginner') {
      toneStyle = 'educational';
    } else if (['institutional', 'corporate'].includes(userProfile.industry)) {
      toneStyle = 'formal';
    }

    // Determine complexity level
    let complexityLevel: 'basic' | 'intermediate' | 'advanced' = 
      userProfile.experienceLevel === 'beginner' ? 'basic' : userProfile.experienceLevel as 'basic' | 'intermediate' | 'advanced';
    
    if (data.complexityLevel) {
      complexityLevel = data.complexityLevel as any;
    }

    // Determine preferred content length based on role
    const contentLength = this.getPreferredContentLength(userProfile.role);
    
    // Determine preferred formats
    const preferredFormats = this.getPreferredFormats(userProfile.role, userProfile.industry);

    return {
      toneStyle,
      complexityLevel,
      contentLength,
      preferredFormats,
    };
  }

  private getPreferredContentLength(role: string): 'short' | 'medium' | 'long' {
    const shortContentRoles = ['day_trader', 'social_media_manager'];
    const longContentRoles = ['research_analyst', 'fund_manager', 'portfolio_manager'];
    
    if (shortContentRoles.some(r => role.toLowerCase().includes(r))) return 'short';
    if (longContentRoles.some(r => role.toLowerCase().includes(r))) return 'long';
    return 'medium';
  }

  private getPreferredFormats(role: string, industry: string): string[] {
    const formatsByRole: Record<string, string[]> = {
      social_media_manager: ['social_post', 'infographic', 'video_script'],
      research_analyst: ['report', 'analysis', 'whitepaper'],
      financial_advisor: ['newsletter', 'client_update', 'educational_content'],
      marketing_manager: ['blog_post', 'case_study', 'webinar_script'],
    };

    return formatsByRole[role] || ['article', 'analysis', 'newsletter'];
  }

  private async buildAudienceContext(
    data: PersonalizationDataDto,
  ): Promise<PersonalizationContext['audienceContext']> {
    const targetSegments = data.audienceSegments || ['retail_investors'];
    
    // Build demographics based on target segments
    const demographics = this.inferDemographics(targetSegments);
    
    // Build behavior patterns
    const behaviorPatterns = this.inferBehaviorPatterns(targetSegments);
    
    // Mock engagement history (in production, fetch from analytics)
    const engagementHistory = this.getMockEngagementHistory(targetSegments);

    return {
      targetSegments,
      demographics,
      behaviorPatterns,
      engagementHistory,
    };
  }

  private inferDemographics(segments: string[]): Record<string, any> {
    const demographics: Record<string, any> = {};

    if (segments.includes('retail_investors')) {
      demographics.ageRange = '25-65';
      demographics.incomeLevel = 'middle-to-high';
      demographics.educationLevel = 'college+';
    }

    if (segments.includes('institutional_investors')) {
      demographics.organizationType = 'financial_institution';
      demographics.assetRange = '$100M+';
    }

    if (segments.includes('millennials')) {
      demographics.ageRange = '25-40';
      demographics.techSavvy = 'high';
      demographics.preferredChannels = ['digital', 'social_media'];
    }

    return demographics;
  }

  private inferBehaviorPatterns(segments: string[]): Record<string, any> {
    const patterns: Record<string, any> = {};

    if (segments.includes('active_traders')) {
      patterns.tradingFrequency = 'daily';
      patterns.contentConsumption = 'high';
      patterns.preferredTimings = ['market_open', 'market_close'];
    }

    if (segments.includes('passive_investors')) {
      patterns.tradingFrequency = 'monthly';
      patterns.contentConsumption = 'moderate';
      patterns.preferredTimings = ['weekends', 'evenings'];
    }

    if (segments.includes('crypto_enthusiasts')) {
      patterns.volatilityTolerance = 'high';
      patterns.newsConsumption = 'high';
      patterns.socialMediaActivity = 'high';
    }

    return patterns;
  }

  private getMockEngagementHistory(segments: string[]): Record<string, any> {
    // Mock engagement data - in production, fetch from analytics service
    return {
      avgEngagementRate: 0.045,
      bestPerformingContentTypes: ['market_analysis', 'educational'],
      preferredPostingTimes: ['9:00', '17:00'],
      topPerformingTopics: ['AI investing', 'ESG funds', 'market outlook'],
    };
  }

  private async buildMarketContext(
    userProfile: PersonalizationContext['userProfile'],
    data: PersonalizationDataDto,
  ): Promise<PersonalizationContext['marketContext']> {
    // Determine relevant markets based on user profile
    const relevantMarkets = this.getRelevantMarkets(userProfile);
    
    // Determine timing preferences
    const timingPreferences = this.getTimingPreferences(userProfile);
    
    // Determine relevant news topics
    const newsTopics = this.getRelevantNewsTopics(userProfile);

    return {
      relevantMarkets,
      timingPreferences,
      newsTopics,
    };
  }

  private getRelevantMarkets(userProfile: PersonalizationContext['userProfile']): string[] {
    const markets = ['US'];

    // Add markets based on asset classes
    if (userProfile.preferredAssetClasses.includes('international_equities')) {
      markets.push('Europe', 'Asia-Pacific');
    }
    
    if (userProfile.preferredAssetClasses.includes('emerging_markets')) {
      markets.push('Emerging Markets');
    }
    
    if (userProfile.preferredAssetClasses.includes('cryptocurrency')) {
      markets.push('Crypto');
    }

    return markets;
  }

  private getTimingPreferences(userProfile: PersonalizationContext['userProfile']): string[] {
    if (userProfile.role.includes('trader')) {
      return ['market_hours', 'pre_market', 'after_hours'];
    }
    
    if (userProfile.role.includes('advisor')) {
      return ['morning', 'end_of_week'];
    }
    
    return ['morning', 'end_of_day'];
  }

  private getRelevantNewsTopics(userProfile: PersonalizationContext['userProfile']): string[] {
    const topics = ['market_outlook', 'economic_indicators'];

    userProfile.preferredAssetClasses.forEach(assetClass => {
      switch (assetClass) {
        case 'equities':
          topics.push('earnings', 'stock_market');
          break;
        case 'fixed_income':
          topics.push('interest_rates', 'bond_market');
          break;
        case 'cryptocurrency':
          topics.push('crypto_regulation', 'blockchain');
          break;
        case 'real_estate':
          topics.push('real_estate_market', 'mortgage_rates');
          break;
      }
    });

    return [...new Set(topics)];
  }

  private getDefaultPersonalizationContext(
    data: PersonalizationDataDto,
  ): PersonalizationContext {
    return {
      userProfile: {
        industry: data.industry || 'financial_services',
        role: data.role || 'financial_professional',
        experienceLevel: 'intermediate',
        riskTolerance: 'medium',
        investmentGoals: ['portfolio_growth', 'risk_management'],
        preferredAssetClasses: ['equities', 'fixed_income'],
      },
      contentPreferences: {
        toneStyle: data.tonePreference as any || 'conversational',
        complexityLevel: data.complexityLevel as any || 'intermediate',
        contentLength: 'medium',
        preferredFormats: ['article', 'analysis'],
      },
      audienceContext: {
        targetSegments: data.audienceSegments || ['retail_investors'],
        demographics: {},
        behaviorPatterns: {},
        engagementHistory: {},
      },
      marketContext: {
        relevantMarkets: ['US'],
        timingPreferences: ['morning'],
        newsTopics: ['market_outlook'],
      },
    };
  }

  async optimizeContentForAudience(
    content: string,
    personalizationContext: PersonalizationContext,
  ): Promise<string> {
    try {
      // This would use AI to optimize content based on personalization context
      // For now, return the original content with a note about personalization
      
      const optimizations: string[] = [];
      
      // Add tone adjustments
      if (personalizationContext.contentPreferences.toneStyle === 'formal') {
        optimizations.push('Adjust tone to be more formal and professional');
      } else if (personalizationContext.contentPreferences.toneStyle === 'conversational') {
        optimizations.push('Make language more conversational and accessible');
      }
      
      // Add complexity adjustments
      if (personalizationContext.contentPreferences.complexityLevel === 'basic') {
        optimizations.push('Simplify technical terms and add explanations');
      } else if (personalizationContext.contentPreferences.complexityLevel === 'advanced') {
        optimizations.push('Include more technical depth and industry jargon');
      }
      
      this.logger.debug('Content personalization optimizations identified', {
        optimizationCount: optimizations.length,
        toneStyle: personalizationContext.contentPreferences.toneStyle,
        complexityLevel: personalizationContext.contentPreferences.complexityLevel,
      });
      
      // In production, this would apply the optimizations using AI
      return content;
    } catch (error) {
      this.logger.error('Content personalization failed', { error: error.message });
      return content; // Return original content on error
    }
  }

  async getPersonalizationRecommendations(
    userId: string,
    contentType: string,
  ): Promise<{
    recommendedTone: string;
    recommendedLength: string;
    recommendedTopics: string[];
    recommendedFormats: string[];
  }> {
    try {
      // In production, this would analyze user history and preferences
      // For now, return default recommendations
      
      return {
        recommendedTone: 'conversational',
        recommendedLength: 'medium',
        recommendedTopics: ['market_analysis', 'investment_strategies', 'financial_planning'],
        recommendedFormats: ['article', 'newsletter', 'social_post'],
      };
    } catch (error) {
      this.logger.error('Failed to get personalization recommendations', {
        error: error.message,
        userId,
        contentType,
      });
      
      throw error;
    }
  }
}