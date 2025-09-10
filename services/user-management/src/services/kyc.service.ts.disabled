import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  KYCApplication,
  KYCType,
  KYCRiskLevel,
} from '../entities/kyc-application.entity';
import { User, KycStatus } from '../entities/user.entity';
import { AuditAction } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';

@Injectable()
export class KYCService {
  constructor(
    @InjectRepository(KYCApplication)
    private kycRepository: Repository<KYCApplication>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async findByUserId(userId: string): Promise<KYCApplication | null> {
    return this.kycRepository.findOne({
      where: { userId },
      relations: ['documents', 'addressVerifications'],
    });
  }

  async findById(id: string): Promise<KYCApplication> {
    const application = await this.kycRepository.findOne({
      where: { id },
      relations: ['user', 'documents', 'addressVerifications'],
    });

    if (!application) {
      throw new NotFoundException('KYC application not found');
    }

    return application;
  }

  async createApplication(userId: string): Promise<KYCApplication> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if application already exists
    const existingApplication = await this.findByUserId(userId);
    if (existingApplication) {
      throw new BadRequestException(
        'KYC application already exists for this user',
      );
    }

    const applicationData = KYCApplication.createFromUser(user);
    const application = this.kycRepository.create(applicationData);
    const savedApplication = await this.kycRepository.save(application);

    // Update user KYC status
    await this.userRepository.update(userId, {
      kycStatus: KycStatus.IN_PROGRESS,
    });

    // Log the creation
    await this.auditService.log({
      userId,
      action: AuditAction.KYC_STARTED,
      resource: 'kyc_application',
      resourceId: savedApplication.id,
    });

    return savedApplication;
  }

  async updateApplication(
    id: string,
    updateData: Partial<KYCApplication>,
    updatedBy?: string,
  ): Promise<KYCApplication> {
    const application = await this.findById(id);

    await this.kycRepository.update(id, updateData);

    // Log the update
    await this.auditService.log({
      userId: updatedBy || application.userId,
      action: AuditAction.KYC_SUBMITTED,
      resource: 'kyc_application',
      resourceId: id,
    });

    return this.findById(id);
  }

  async submitApplication(
    id: string,
    submittedBy?: string,
  ): Promise<KYCApplication> {
    const application = await this.findById(id);
    application.submit();

    await this.kycRepository.save(application);
    await this.userRepository.update(application.userId, {
      kycStatus: KycStatus.PENDING_REVIEW,
    });

    // Log the submission
    await this.auditService.log({
      userId: submittedBy || application.userId,
      action: AuditAction.KYC_SUBMITTED,
      resource: 'kyc_application',
      resourceId: id,
    });

    return application;
  }

  async approveApplication(
    id: string,
    reviewerId: string,
    notes?: string,
  ): Promise<KYCApplication> {
    const application = await this.findById(id);
    application.approve(reviewerId, notes);

    await this.kycRepository.save(application);
    await this.userRepository.update(application.userId, {
      kycStatus: KycStatus.APPROVED,
      kycApprovedAt: new Date(),
    });

    // Log the approval
    await this.auditService.log({
      userId: reviewerId,
      action: AuditAction.KYC_APPROVED,
      resource: 'kyc_application',
      resourceId: id,
      details: { notes },
    });

    return application;
  }

  async rejectApplication(
    id: string,
    reviewerId: string,
    reason: string,
    notes?: string,
  ): Promise<KYCApplication> {
    const application = await this.findById(id);
    application.reject(reviewerId, reason, notes);

    await this.kycRepository.save(application);
    await this.userRepository.update(application.userId, {
      kycStatus: KycStatus.REJECTED,
      kycRejectedAt: new Date(),
      kycRejectionReason: reason,
    });

    // Log the rejection
    await this.auditService.log({
      userId: reviewerId,
      action: AuditAction.KYC_REJECTED,
      resource: 'kyc_application',
      resourceId: id,
      details: { reason, notes },
    });

    return application;
  }

  async getKycStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
  }> {
    const [total, pending, approved, rejected, expired] = await Promise.all([
      this.kycRepository.count(),
      this.kycRepository.count({ where: { status: KycStatus.PENDING_REVIEW } }),
      this.kycRepository.count({ where: { status: KycStatus.APPROVED } }),
      this.kycRepository.count({ where: { status: KycStatus.REJECTED } }),
      this.kycRepository.count({ where: { status: KycStatus.EXPIRED } }),
    ]);

    return { total, pending, approved, rejected, expired };
  }
}
