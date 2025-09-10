import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KYCService } from '../services/kyc.service';
import { FileUploadService } from '../services/file-upload.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { NotificationService } from '../services/notification.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { SystemRole } from '../entities/role.entity';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KYCController {
  constructor(
    private readonly kycService: KYCService,
    private readonly fileUploadService: FileUploadService,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('application')
  @ApiOperation({ summary: 'Get current user KYC application' })
  @ApiResponse({
    status: 200,
    description: 'KYC application retrieved successfully',
  })
  async getMyApplication(@GetUser() user: User) {
    const application = await this.kycService.findByUserId(user.id);
    return { application };
  }

  @Post('application')
  @ApiOperation({ summary: 'Create or update KYC application' })
  @ApiResponse({
    status: 201,
    description: 'KYC application created successfully',
  })
  async createOrUpdateApplication(
    @GetUser() user: User,
    @Body(ValidationPipe) applicationData: any, // Would be a proper DTO in real implementation
  ) {
    let application = await this.kycService.findByUserId(user.id);

    if (!application) {
      application = await this.kycService.createApplication(user.id);
    }

    application = await this.kycService.updateApplication(
      application.id,
      applicationData,
      user.id,
    );

    return { application };
  }

  @Post('application/submit')
  @ApiOperation({ summary: 'Submit KYC application for review' })
  @ApiResponse({
    status: 200,
    description: 'KYC application submitted successfully',
  })
  async submitApplication(@GetUser() user: User) {
    const application = await this.kycService.findByUserId(user.id);
    if (!application) {
      throw new Error('No KYC application found');
    }

    const submittedApplication = await this.kycService.submitApplication(
      application.id,
      user.id,
    );

    // Notify user about submission
    await this.notificationService.notifyKycStatusChange(user.id, 'submitted');

    return {
      application: submittedApplication,
      message: 'KYC application submitted successfully',
    };
  }

  @Get('application/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('kyc:read')
  @ApiOperation({ summary: 'Get KYC application by ID (Admin only)' })
  async getApplicationById(@Param('id', ParseUUIDPipe) id: string) {
    const application = await this.kycService.findById(id);
    return { application };
  }

  @Put('application/:id/approve')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(SystemRole.ADMIN, SystemRole.COMPLIANCE_OFFICER)
  @Permissions('kyc:approve')
  @ApiOperation({ summary: 'Approve KYC application (Admin/Compliance only)' })
  async approveApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approvalData: { notes?: string },
    @GetUser() reviewer: User,
  ) {
    const application = await this.kycService.approveApplication(
      id,
      reviewer.id,
      approvalData.notes,
    );

    // Notify user about approval
    await this.notificationService.notifyKycStatusChange(
      application.userId,
      'approved',
      { reviewedBy: reviewer.fullName },
    );

    return {
      application,
      message: 'KYC application approved successfully',
    };
  }

  @Put('application/:id/reject')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(SystemRole.ADMIN, SystemRole.COMPLIANCE_OFFICER)
  @Permissions('kyc:reject')
  @ApiOperation({ summary: 'Reject KYC application (Admin/Compliance only)' })
  async rejectApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) rejectionData: { reason: string; notes?: string },
    @GetUser() reviewer: User,
  ) {
    const application = await this.kycService.rejectApplication(
      id,
      reviewer.id,
      rejectionData.reason,
      rejectionData.notes,
    );

    // Notify user about rejection
    await this.notificationService.notifyKycStatusChange(
      application.userId,
      'rejected',
      {
        reason: rejectionData.reason,
        reviewedBy: reviewer.fullName,
      },
    );

    return {
      application,
      message: 'KYC application rejected',
    };
  }

  @Post('application/:id/risk-assessment')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(
    SystemRole.ADMIN,
    SystemRole.COMPLIANCE_OFFICER,
    SystemRole.RISK_MANAGER,
  )
  @Permissions('risk:assess')
  @ApiOperation({ summary: 'Perform risk assessment on KYC application' })
  async performRiskAssessment(@Param('id', ParseUUIDPipe) id: string) {
    const riskAssessment = await this.riskAssessmentService.assessKycRisk(id);
    return { riskAssessment };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC statistics (Admin only)' })
  async getKycStats() {
    const stats = await this.kycService.getKycStats();
    return { stats };
  }

  @Get('applications')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(SystemRole.ADMIN, SystemRole.COMPLIANCE_OFFICER)
  @Permissions('kyc:read')
  @ApiOperation({ summary: 'Get all KYC applications (Admin only)' })
  async getAllApplications(
    @Query()
    query: {
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    // This would implement pagination and filtering
    // For now, return basic response
    return {
      applications: [],
      total: 0,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  // Document upload endpoints would go here
  @Post('documents/upload')
  @ApiOperation({ summary: 'Upload KYC document' })
  async uploadDocument(
    @GetUser() user: User,
    // In real implementation, this would handle file upload
    @Body() uploadData: { documentType: string; fileData: any },
  ) {
    const application = await this.kycService.findByUserId(user.id);
    if (!application) {
      throw new Error('No KYC application found');
    }

    // This would handle actual file upload
    // const result = await this.fileUploadService.uploadDocument(
    //   application.id,
    //   uploadData.documentType as DocumentType,
    //   uploadData.fileData
    // );

    return {
      message: 'Document upload endpoint - implementation pending',
      applicationId: application.id,
    };
  }

  // User risk profile
  @Get('risk-profile')
  @ApiOperation({ summary: 'Get current user risk profile' })
  async getMyRiskProfile(@GetUser() user: User) {
    const riskProfile = await this.riskAssessmentService.getUserRiskProfile(
      user.id,
    );
    return { riskProfile };
  }
}
