import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  KYCApplication,
  KYCRiskLevel,
} from '../entities/kyc-application.entity';
import { AuditAction } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';

export interface RiskAssessmentResult {
  riskLevel: KYCRiskLevel;
  riskScore: number;
  factors: RiskFactor[];
  recommendation: string;
  requiresManualReview: boolean;
}

export interface RiskFactor {
  category: string;
  factor: string;
  score: number;
  weight: number;
  description: string;
}

@Injectable()
export class RiskAssessmentService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(KYCApplication)
    private kycApplicationRepository: Repository<KYCApplication>,
    private auditService: AuditService,
  ) {}

  async assessKycRisk(kycApplicationId: string): Promise<RiskAssessmentResult> {
    const application = await this.kycApplicationRepository.findOne({
      where: { id: kycApplicationId },
      relations: ['user', 'documents', 'addressVerifications'],
    });

    if (!application) {
      throw new Error('KYC application not found');
    }

    const factors = await this.calculateRiskFactors(application);
    const totalScore = this.calculateTotalRiskScore(factors);
    const riskLevel = this.determineRiskLevel(totalScore);
    const recommendation = this.generateRecommendation(riskLevel, factors);
    const requiresManualReview = this.requiresManualReview(riskLevel, factors);

    const result: RiskAssessmentResult = {
      riskLevel,
      riskScore: totalScore,
      factors,
      recommendation,
      requiresManualReview,
    };

    // Update the application with risk assessment
    application.updateRiskAssessment(riskLevel, totalScore, recommendation);
    await this.kycApplicationRepository.save(application);

    // Update user risk score
    await this.userRepository.update(application.userId, {
      riskScore: totalScore,
    });

    // Log the risk assessment
    await this.auditService.log({
      userId: application.userId,
      action: AuditAction.RISK_ASSESSMENT,
      resource: 'kyc_application',
      resourceId: kycApplicationId,
      details: {
        riskLevel,
        riskScore: totalScore,
        requiresManualReview,
      },
    });

    return result;
  }

  private async calculateRiskFactors(
    application: KYCApplication,
  ): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Geographic risk factors
    factors.push(...this.assessGeographicRisk(application));

    // Age risk factors
    factors.push(...this.assessAgeRisk(application));

    // Document risk factors
    factors.push(...this.assessDocumentRisk(application));

    // PEP and sanctions risk
    factors.push(...this.assessPepSanctionsRisk(application));

    // Income and occupation risk
    factors.push(...this.assessIncomeOccupationRisk(application));

    // Address verification risk
    factors.push(...this.assessAddressRisk(application));

    return factors;
  }

  private assessGeographicRisk(application: KYCApplication): RiskFactor[] {
    const factors: RiskFactor[] = [];
    const highRiskCountries = ['AF', 'IR', 'KP', 'SY']; // Example high-risk countries

    if (highRiskCountries.includes(application.countryOfResidence)) {
      factors.push({
        category: 'Geographic',
        factor: 'High-risk country of residence',
        score: 30,
        weight: 0.8,
        description: `Country of residence (${application.countryOfResidence}) is considered high-risk`,
      });
    }

    if (application.nationality !== application.countryOfResidence) {
      factors.push({
        category: 'Geographic',
        factor: 'Different nationality and residence',
        score: 10,
        weight: 0.3,
        description: 'Nationality differs from country of residence',
      });
    }

    return factors;
  }

  private assessAgeRisk(application: KYCApplication): RiskFactor[] {
    const factors: RiskFactor[] = [];
    const age = application.age;

    if (age < 18) {
      factors.push({
        category: 'Demographics',
        factor: 'Underage',
        score: 50,
        weight: 1.0,
        description: 'Applicant is under 18 years old',
      });
    } else if (age < 21) {
      factors.push({
        category: 'Demographics',
        factor: 'Young adult',
        score: 15,
        weight: 0.4,
        description: 'Applicant is under 21 years old',
      });
    }

    return factors;
  }

  private assessDocumentRisk(application: KYCApplication): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (!application.documents || application.documents.length === 0) {
      factors.push({
        category: 'Documentation',
        factor: 'No documents uploaded',
        score: 40,
        weight: 0.9,
        description: 'No supporting documents have been uploaded',
      });
      return factors;
    }

    const verifiedDocuments = application.documents.filter(
      (doc) => doc.isVerified,
    );
    const rejectedDocuments = application.documents.filter(
      (doc) => doc.isRejected,
    );

    if (rejectedDocuments.length > 0) {
      factors.push({
        category: 'Documentation',
        factor: 'Rejected documents',
        score: 25,
        weight: 0.7,
        description: `${rejectedDocuments.length} document(s) have been rejected`,
      });
    }

    if (verifiedDocuments.length === 0) {
      factors.push({
        category: 'Documentation',
        factor: 'No verified documents',
        score: 35,
        weight: 0.8,
        description: 'No documents have been successfully verified',
      });
    }

    return factors;
  }

  private assessPepSanctionsRisk(application: KYCApplication): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (application.isPep) {
      factors.push({
        category: 'PEP/Sanctions',
        factor: 'Politically Exposed Person',
        score: 40,
        weight: 0.9,
        description: 'Applicant is identified as a Politically Exposed Person',
      });
    }

    if (application.sanctionsCheckPassed === false) {
      factors.push({
        category: 'PEP/Sanctions',
        factor: 'Failed sanctions check',
        score: 60,
        weight: 1.0,
        description: 'Applicant failed sanctions screening',
      });
    }

    return factors;
  }

  private assessIncomeOccupationRisk(
    application: KYCApplication,
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];
    const highRiskOccupations = [
      'crypto',
      'gambling',
      'adult entertainment',
      'arms dealer',
    ];

    if (application.occupation) {
      const occupation = application.occupation.toLowerCase();
      const isHighRisk = highRiskOccupations.some((risk) =>
        occupation.includes(risk),
      );

      if (isHighRisk) {
        factors.push({
          category: 'Occupation',
          factor: 'High-risk occupation',
          score: 25,
          weight: 0.6,
          description: `Occupation (${application.occupation}) is considered high-risk`,
        });
      }
    }

    if (application.annualIncome && application.annualIncome > 1000000) {
      factors.push({
        category: 'Income',
        factor: 'High income',
        score: 10,
        weight: 0.3,
        description:
          'Annual income exceeds $1M, requires enhanced due diligence',
      });
    }

    return factors;
  }

  private assessAddressRisk(application: KYCApplication): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (
      !application.addressVerifications ||
      application.addressVerifications.length === 0
    ) {
      factors.push({
        category: 'Address',
        factor: 'No address verification',
        score: 20,
        weight: 0.5,
        description: 'Address has not been verified',
      });
      return factors;
    }

    const failedVerifications = application.addressVerifications.filter(
      (v) => v.isFailed,
    );
    if (failedVerifications.length > 0) {
      factors.push({
        category: 'Address',
        factor: 'Failed address verification',
        score: 30,
        weight: 0.7,
        description: 'Address verification failed',
      });
    }

    return factors;
  }

  private calculateTotalRiskScore(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0;

    const weightedSum = factors.reduce((sum, factor) => {
      return sum + factor.score * factor.weight;
    }, 0);

    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  private determineRiskLevel(score: number): KYCRiskLevel {
    if (score >= 70) return KYCRiskLevel.VERY_HIGH;
    if (score >= 50) return KYCRiskLevel.HIGH;
    if (score >= 30) return KYCRiskLevel.MEDIUM;
    return KYCRiskLevel.LOW;
  }

  private generateRecommendation(
    riskLevel: KYCRiskLevel,
    factors: RiskFactor[],
  ): string {
    switch (riskLevel) {
      case KYCRiskLevel.VERY_HIGH:
        return 'Reject application or require extensive additional documentation and enhanced due diligence';
      case KYCRiskLevel.HIGH:
        return 'Requires manual review and enhanced due diligence procedures';
      case KYCRiskLevel.MEDIUM:
        return 'Requires manual review and additional verification steps';
      case KYCRiskLevel.LOW:
        return 'Can proceed with standard verification procedures';
      default:
        return 'Risk assessment inconclusive';
    }
  }

  private requiresManualReview(
    riskLevel: KYCRiskLevel,
    factors: RiskFactor[],
  ): boolean {
    if (
      riskLevel === KYCRiskLevel.HIGH ||
      riskLevel === KYCRiskLevel.VERY_HIGH
    ) {
      return true;
    }

    // Check for specific high-risk factors
    const criticalFactors = factors.filter(
      (f) =>
        f.factor.includes('sanctions') ||
        f.factor.includes('PEP') ||
        f.factor.includes('Underage'),
    );

    return criticalFactors.length > 0;
  }

  async getUserRiskProfile(userId: string): Promise<{
    currentRiskScore: number;
    riskLevel: KYCRiskLevel;
    lastAssessmentDate: Date | null;
    riskHistory: Array<{
      date: Date;
      score: number;
      level: KYCRiskLevel;
    }>;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const kycApplication = await this.kycApplicationRepository.findOne({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });

    return {
      currentRiskScore: user.riskScore || 0,
      riskLevel: kycApplication?.riskLevel || KYCRiskLevel.LOW,
      lastAssessmentDate: kycApplication?.updatedAt || null,
      riskHistory: [], // This would come from historical data in a real implementation
    };
  }
}
