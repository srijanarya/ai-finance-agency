/**
 * KYC Controller
 * Handles all KYC verification endpoints with comprehensive validation and error handling
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  HttpStatus,
  HttpException,
  Logger,
  Req,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { KYCService } from '../services/kyc.service';
import { FileUploadService } from '../services/file-upload.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { AuditLogService } from '../services/audit-log.service';
import { NotificationService } from '../services/notification.service';

import {
  InitiateKYCDto,
  DocumentUploadDto,
  DocumentVerificationDto,
  AddressVerificationDto,
  PANVerificationDto,
  AadhaarVerificationDto,
  BankAccountVerificationDto,
  VideoKYCRequestDto,
  KYCTierUpdateDto,
  KYCStatusQueryDto,
  ManualReviewAssignmentDto,
  RiskAssessmentOverrideDto,
  KYCTierLevel,
  KYCVerificationStatus,
} from '../dto/kyc-document.dto';

import {
  DocumentUploadResponseDto,
  VerificationResultResponseDto,
  KYCStatusResponseDto,
  KYCTierUpdateResponseDto,
  ManualReviewResponseDto,
  VideoKYCResponseDto,
  RiskAssessmentResponseDto,
  PaginatedKYCApplicationsResponseDto,
  KYCErrorResponseDto,
} from '../dto/kyc-response.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../entities/user.entity';

/**
 * KYC Controller for handling all KYC verification operations
 * Implements Indian financial regulatory requirements (RBI, PMLA, AML)
 */
@ApiTags('KYC Verification')
@Controller('api/v1/kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KYCController {
  private readonly logger = new Logger(KYCController.name);

  constructor(
    private readonly kycService: KYCService,
    private readonly fileUploadService: FileUploadService,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Initiate KYC verification process
   */
  @Post('initiate')
  @ApiOperation({
    summary: 'Initiate KYC verification process',
    description: 'Start a new KYC verification application for the specified tier level',
  })
  @ApiResponse({
    status: 201,
    description: 'KYC application initiated successfully',
    type: KYCStatusResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
    type: KYCErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'KYC application already exists',
    type: KYCErrorResponseDto,
  })
  @Throttle(5, 300) // 5 requests per 5 minutes
  async initiateKYC(
    @Body() initiateKYCDto: InitiateKYCDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<KYCStatusResponseDto> {
    try {
      this.logger.log(`Initiating KYC for user ${user.id} with tier ${initiateKYCDto.targetTier}`);

      const kycApplication = await this.kycService.initiateKYC(
        user.id,
        initiateKYCDto.targetTier,
        {
          applicationNotes: initiateKYCDto.applicationNotes,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'KYC_INITIATED',
        details: {
          targetTier: initiateKYCDto.targetTier,
          applicationId: kycApplication.id,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      // Send notification
      await this.notificationService.sendKYCInitiatedNotification(user.id, kycApplication.id);

      const response = await this.kycService.getKYCStatus(user.id);
      return {
        success: true,
        message: 'KYC application initiated successfully',
        timestamp: new Date().toISOString(),
        data: response,
      };
    } catch (error) {
      this.logger.error(`Failed to initiate KYC for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to initiate KYC application',
          timestamp: new Date().toISOString(),
          error: {
            code: 'KYC_INITIATION_FAILED',
            details: error.message,
            suggestedActions: ['Check if KYC application already exists', 'Verify target tier requirements'],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Upload KYC document
   */
  @Post('upload-document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload KYC document',
    description: 'Upload and process a KYC document for verification',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document upload with metadata',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, JPG, PNG)',
        },
        documentType: {
          type: 'string',
          enum: ['PAN', 'AADHAAR', 'BANK_STATEMENT', 'UTILITY_BILL', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID'],
        },
        documentNumber: {
          type: 'string',
          description: 'Document number',
        },
        issueDate: {
          type: 'string',
          format: 'date',
          description: 'Document issue date',
        },
        expiryDate: {
          type: 'string',
          format: 'date',
          description: 'Document expiry date',
        },
      },
      required: ['file', 'documentType', 'documentNumber'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: DocumentUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or document data',
    type: KYCErrorResponseDto,
  })
  @Throttle(10, 3600) // 10 uploads per hour
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() documentUploadDto: DocumentUploadDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<DocumentUploadResponseDto> {
    try {
      this.logger.log(`Uploading ${documentUploadDto.documentType} document for user ${user.id}`);

      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      // Validate file
      const validation = await this.fileUploadService.validateFile(file, documentUploadDto.documentType);
      if (!validation.isValid) {
        throw new HttpException(validation.error, HttpStatus.BAD_REQUEST);
      }

      // Upload and process document
      const document = await this.kycService.uploadDocument(
        user.id,
        file,
        documentUploadDto,
        {
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        },
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'DOCUMENT_UPLOADED',
        details: {
          documentType: documentUploadDto.documentType,
          documentId: document.id,
          fileSize: file.size,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Document uploaded successfully',
        timestamp: new Date().toISOString(),
        data: {
          documentId: document.id,
          documentType: document.documentType,
          verificationStatus: document.verificationStatus,
          fileHash: document.fileHash,
          fileSize: document.fileSize,
          uploadedAt: document.uploadedAt.toISOString(),
          estimatedVerificationTime: this.getEstimatedVerificationTime(document.documentType),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to upload document for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to upload document',
          timestamp: new Date().toISOString(),
          error: {
            code: 'DOCUMENT_UPLOAD_FAILED',
            details: error.message,
            suggestedActions: [
              'Check file size (max 10MB)',
              'Ensure file format is supported (PDF, JPG, PNG)',
              'Verify document type matches uploaded file',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get KYC status
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get KYC status',
    description: 'Retrieve current KYC verification status and details',
  })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
    type: KYCStatusResponseDto,
  })
  async getKYCStatus(@CurrentUser() user: User): Promise<KYCStatusResponseDto> {
    try {
      const status = await this.kycService.getKYCStatus(user.id);
      
      return {
        success: true,
        message: 'KYC status retrieved successfully',
        timestamp: new Date().toISOString(),
        data: status,
      };
    } catch (error) {
      this.logger.error(`Failed to get KYC status for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve KYC status',
          timestamp: new Date().toISOString(),
          error: {
            code: 'KYC_STATUS_FETCH_FAILED',
            details: error.message,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update KYC tier
   */
  @Put('update-tier')
  @ApiOperation({
    summary: 'Update KYC tier',
    description: 'Request upgrade to higher KYC tier level',
  })
  @ApiResponse({
    status: 200,
    description: 'KYC tier updated successfully',
    type: KYCTierUpdateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid tier upgrade request',
    type: KYCErrorResponseDto,
  })
  @Throttle(3, 86400) // 3 tier updates per day
  async updateKYCTier(
    @Body() kycTierUpdateDto: KYCTierUpdateDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<KYCTierUpdateResponseDto> {
    try {
      this.logger.log(`Updating KYC tier to ${kycTierUpdateDto.newTier} for user ${user.id}`);

      const result = await this.kycService.updateKYCTier(
        user.id,
        kycTierUpdateDto.newTier,
        kycTierUpdateDto.upgradeReason,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'KYC_TIER_UPDATE_REQUESTED',
        details: {
          newTier: kycTierUpdateDto.newTier,
          reason: kycTierUpdateDto.upgradeReason,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: 'KYC tier updated successfully',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to update KYC tier for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to update KYC tier',
          timestamp: new Date().toISOString(),
          error: {
            code: 'KYC_TIER_UPDATE_FAILED',
            details: error.message,
            suggestedActions: [
              'Ensure all required documents are uploaded',
              'Check current tier requirements',
              'Complete pending verifications',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Verify PAN card
   */
  @Post('verify-pan')
  @ApiOperation({
    summary: 'Verify PAN card',
    description: 'Verify PAN card details with government databases',
  })
  @ApiResponse({
    status: 200,
    description: 'PAN verification completed',
    type: VerificationResultResponseDto,
  })
  @Throttle(5, 3600) // 5 PAN verifications per hour
  async verifyPAN(
    @Body() panVerificationDto: PANVerificationDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<VerificationResultResponseDto> {
    try {
      this.logger.log(`Verifying PAN ${panVerificationDto.panNumber} for user ${user.id}`);

      const result = await this.kycService.verifyPAN(
        user.id,
        panVerificationDto.panNumber,
        panVerificationDto.fullName,
        panVerificationDto.dateOfBirth,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'PAN_VERIFICATION_ATTEMPTED',
        details: {
          panNumber: panVerificationDto.panNumber.substring(0, 5) + 'XXXX' + panVerificationDto.panNumber.slice(-1),
          verified: result.verified,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: result.verified ? 'PAN verified successfully' : 'PAN verification failed',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`PAN verification failed for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'PAN verification failed',
          timestamp: new Date().toISOString(),
          error: {
            code: 'PAN_VERIFICATION_FAILED',
            details: error.message,
            suggestedActions: [
              'Verify PAN number format (ABCDE1234F)',
              'Ensure name matches PAN card exactly',
              'Check date of birth format',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Verify Aadhaar card
   */
  @Post('verify-aadhaar')
  @ApiOperation({
    summary: 'Verify Aadhaar card',
    description: 'Verify Aadhaar card details with UIDAI',
  })
  @ApiResponse({
    status: 200,
    description: 'Aadhaar verification completed',
    type: VerificationResultResponseDto,
  })
  @Throttle(3, 3600) // 3 Aadhaar verifications per hour
  async verifyAadhaar(
    @Body() aadhaarVerificationDto: AadhaarVerificationDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<VerificationResultResponseDto> {
    try {
      this.logger.log(`Verifying Aadhaar for user ${user.id}`);

      const result = await this.kycService.verifyAadhaar(
        user.id,
        aadhaarVerificationDto.aadhaarNumber,
        aadhaarVerificationDto.fullName,
        aadhaarVerificationDto.dateOfBirth,
        aadhaarVerificationDto.digilockerReference,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'AADHAAR_VERIFICATION_ATTEMPTED',
        details: {
          aadhaarNumber: 'XXXX-XXXX-' + aadhaarVerificationDto.aadhaarNumber.slice(-4),
          verified: result.verified,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: result.verified ? 'Aadhaar verified successfully' : 'Aadhaar verification failed',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Aadhaar verification failed for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Aadhaar verification failed',
          timestamp: new Date().toISOString(),
          error: {
            code: 'AADHAAR_VERIFICATION_FAILED',
            details: error.message,
            suggestedActions: [
              'Verify Aadhaar number format (12 digits)',
              'Ensure name matches Aadhaar card exactly',
              'Check date of birth if provided',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Verify bank account
   */
  @Post('verify-bank-account')
  @ApiOperation({
    summary: 'Verify bank account',
    description: 'Verify bank account details with bank APIs',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank account verification completed',
    type: VerificationResultResponseDto,
  })
  @Throttle(5, 3600) // 5 bank verifications per hour
  async verifyBankAccount(
    @Body() bankAccountVerificationDto: BankAccountVerificationDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<VerificationResultResponseDto> {
    try {
      this.logger.log(`Verifying bank account for user ${user.id}`);

      const result = await this.kycService.verifyBankAccount(
        user.id,
        bankAccountVerificationDto.accountNumber,
        bankAccountVerificationDto.ifscCode,
        bankAccountVerificationDto.accountHolderName,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'BANK_VERIFICATION_ATTEMPTED',
        details: {
          accountNumber: 'XXXXXXXX' + bankAccountVerificationDto.accountNumber.slice(-4),
          ifscCode: bankAccountVerificationDto.ifscCode,
          verified: result.verified,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: result.verified ? 'Bank account verified successfully' : 'Bank account verification failed',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Bank verification failed for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Bank account verification failed',
          timestamp: new Date().toISOString(),
          error: {
            code: 'BANK_VERIFICATION_FAILED',
            details: error.message,
            suggestedActions: [
              'Verify account number format',
              'Check IFSC code format (ABCD0123456)',
              'Ensure account holder name matches',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Verify address
   */
  @Post('verify-address')
  @ApiOperation({
    summary: 'Verify address',
    description: 'Verify address with multiple data sources',
  })
  @ApiResponse({
    status: 200,
    description: 'Address verification completed',
    type: VerificationResultResponseDto,
  })
  async verifyAddress(
    @Body() addressVerificationDto: AddressVerificationDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<VerificationResultResponseDto> {
    try {
      this.logger.log(`Verifying address for user ${user.id}`);

      const result = await this.kycService.verifyAddress(user.id, addressVerificationDto);

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'ADDRESS_VERIFICATION_ATTEMPTED',
        details: {
          pinCode: addressVerificationDto.pinCode,
          verificationMethod: addressVerificationDto.verificationMethod,
          verified: result.verified,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: result.verified ? 'Address verified successfully' : 'Address verification failed',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Address verification failed for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Address verification failed',
          timestamp: new Date().toISOString(),
          error: {
            code: 'ADDRESS_VERIFICATION_FAILED',
            details: error.message,
            suggestedActions: [
              'Check PIN code format (6 digits)',
              'Verify address details',
              'Ensure verification method is appropriate',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Request video KYC
   */
  @Post('video-kyc/request')
  @ApiOperation({
    summary: 'Request video KYC session',
    description: 'Initiate video KYC verification session',
  })
  @ApiResponse({
    status: 201,
    description: 'Video KYC session initiated',
    type: VideoKYCResponseDto,
  })
  @Throttle(3, 86400) // 3 video KYC requests per day
  async requestVideoKYC(
    @Body() videoKYCRequestDto: VideoKYCRequestDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<VideoKYCResponseDto> {
    try {
      this.logger.log(`Requesting video KYC for user ${user.id}`);

      const session = await this.kycService.initiateVideoKYC(user.id, videoKYCRequestDto);

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'VIDEO_KYC_REQUESTED',
        details: {
          sessionId: session.sessionId,
          sessionType: videoKYCRequestDto.sessionType,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Video KYC session initiated successfully',
        timestamp: new Date().toISOString(),
        data: session,
      };
    } catch (error) {
      this.logger.error(`Video KYC request failed for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to initiate video KYC session',
          timestamp: new Date().toISOString(),
          error: {
            code: 'VIDEO_KYC_INITIATION_FAILED',
            details: error.message,
            suggestedActions: [
              'Ensure basic KYC is completed',
              'Check if video KYC is already completed',
              'Verify session type requirements',
            ],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get risk assessment
   */
  @Get('risk-assessment')
  @ApiOperation({
    summary: 'Get risk assessment',
    description: 'Retrieve current risk assessment details',
  })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment retrieved successfully',
    type: RiskAssessmentResponseDto,
  })
  async getRiskAssessment(@CurrentUser() user: User): Promise<RiskAssessmentResponseDto> {
    try {
      const assessment = await this.riskAssessmentService.calculateRiskAssessment(user.id);

      return {
        success: true,
        message: 'Risk assessment completed successfully',
        timestamp: new Date().toISOString(),
        data: assessment,
      };
    } catch (error) {
      this.logger.error(`Risk assessment failed for user ${user.id}:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve risk assessment',
          timestamp: new Date().toISOString(),
          error: {
            code: 'RISK_ASSESSMENT_FAILED',
            details: error.message,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Admin endpoints (require admin role)

  /**
   * Get all KYC applications (Admin only)
   */
  @Get('admin/applications')
  @Roles('admin', 'kyc_reviewer')
  @ApiOperation({
    summary: 'Get all KYC applications',
    description: 'Retrieve paginated list of KYC applications for review (Admin only)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: KYCVerificationStatus })
  @ApiQuery({ name: 'tierLevel', required: false, enum: KYCTierLevel })
  @ApiResponse({
    status: 200,
    description: 'KYC applications retrieved successfully',
    type: PaginatedKYCApplicationsResponseDto,
  })
  async getAllKYCApplications(
    @Query() queryDto: KYCStatusQueryDto,
  ): Promise<PaginatedKYCApplicationsResponseDto> {
    try {
      const result = await this.kycService.getAllKYCApplications(queryDto);

      return {
        success: true,
        message: 'KYC applications retrieved successfully',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to get KYC applications:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to retrieve KYC applications',
          timestamp: new Date().toISOString(),
          error: {
            code: 'KYC_APPLICATIONS_FETCH_FAILED',
            details: error.message,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify document manually (Admin only)
   */
  @Put('admin/verify-document')
  @Roles('admin', 'kyc_reviewer')
  @ApiOperation({
    summary: 'Verify document manually',
    description: 'Manually verify a KYC document (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Document verified successfully',
    type: VerificationResultResponseDto,
  })
  async verifyDocumentManually(
    @Body() documentVerificationDto: DocumentVerificationDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<VerificationResultResponseDto> {
    try {
      this.logger.log(`Manual document verification by ${user.id} for document ${documentVerificationDto.documentId}`);

      const result = await this.kycService.verifyDocumentManually(
        documentVerificationDto.documentId,
        documentVerificationDto.verificationStatus,
        user.id,
        documentVerificationDto.verificationNotes,
        documentVerificationDto.rejectionReason,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'DOCUMENT_VERIFIED_MANUALLY',
        details: {
          documentId: documentVerificationDto.documentId,
          verificationStatus: documentVerificationDto.verificationStatus,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Document verified successfully',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Manual document verification failed:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to verify document',
          timestamp: new Date().toISOString(),
          error: {
            code: 'MANUAL_VERIFICATION_FAILED',
            details: error.message,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Assign for manual review (Admin only)
   */
  @Post('admin/manual-review')
  @Roles('admin', 'kyc_manager')
  @ApiOperation({
    summary: 'Assign KYC application for manual review',
    description: 'Assign a KYC application to a reviewer for manual review (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Application assigned for manual review',
    type: ManualReviewResponseDto,
  })
  async assignForManualReview(
    @Body() manualReviewAssignmentDto: ManualReviewAssignmentDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<ManualReviewResponseDto> {
    try {
      this.logger.log(`Assigning application ${manualReviewAssignmentDto.applicationId} for manual review`);

      const result = await this.kycService.assignForManualReview(
        manualReviewAssignmentDto.applicationId,
        manualReviewAssignmentDto.reviewerId,
        manualReviewAssignmentDto.priority,
        manualReviewAssignmentDto.assignmentNotes,
        user.id,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'MANUAL_REVIEW_ASSIGNED',
        details: {
          applicationId: manualReviewAssignmentDto.applicationId,
          reviewerId: manualReviewAssignmentDto.reviewerId,
          priority: manualReviewAssignmentDto.priority,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Application assigned for manual review',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Manual review assignment failed:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to assign for manual review',
          timestamp: new Date().toISOString(),
          error: {
            code: 'MANUAL_REVIEW_ASSIGNMENT_FAILED',
            details: error.message,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Override risk assessment (Admin only)
   */
  @Put('admin/override-risk')
  @Roles('admin', 'risk_manager')
  @ApiOperation({
    summary: 'Override risk assessment',
    description: 'Override user risk assessment score (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment overridden successfully',
    type: RiskAssessmentResponseDto,
  })
  async overrideRiskAssessment(
    @Body() riskAssessmentOverrideDto: RiskAssessmentOverrideDto,
    @CurrentUser() user: User,
    @Req() request: Request,
  ): Promise<RiskAssessmentResponseDto> {
    try {
      this.logger.log(`Overriding risk assessment for user ${riskAssessmentOverrideDto.userId}`);

      const result = await this.riskAssessmentService.overrideRiskAssessment(
        riskAssessmentOverrideDto.userId,
        riskAssessmentOverrideDto.newRiskScore,
        riskAssessmentOverrideDto.overrideReason,
        riskAssessmentOverrideDto.additionalRiskFactors,
        user.id,
      );

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'RISK_ASSESSMENT_OVERRIDDEN',
        details: {
          targetUserId: riskAssessmentOverrideDto.userId,
          newRiskScore: riskAssessmentOverrideDto.newRiskScore,
          reason: riskAssessmentOverrideDto.overrideReason,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return {
        success: true,
        message: 'Risk assessment overridden successfully',
        timestamp: new Date().toISOString(),
        data: result,
      };
    } catch (error) {
      this.logger.error(`Risk assessment override failed:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to override risk assessment',
          timestamp: new Date().toISOString(),
          error: {
            code: 'RISK_OVERRIDE_FAILED',
            details: error.message,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Download document (Admin only)
   */
  @Get('admin/document/:documentId/download')
  @Roles('admin', 'kyc_reviewer')
  @ApiOperation({
    summary: 'Download KYC document',
    description: 'Download encrypted KYC document for review (Admin only)',
  })
  @ApiParam({ name: 'documentId', description: 'Document UUID' })
  async downloadDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: User,
    @Res() response: Response,
    @Req() request: Request,
  ): Promise<void> {
    try {
      this.logger.log(`Document download requested by ${user.id} for document ${documentId}`);

      const { fileStream, mimeType, filename } = await this.kycService.downloadDocument(documentId, user.id);

      // Log audit trail
      await this.auditLogService.log({
        userId: user.id,
        action: 'DOCUMENT_DOWNLOADED',
        details: {
          documentId,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      response.setHeader('Content-Type', mimeType);
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      fileStream.pipe(response);
    } catch (error) {
      this.logger.error(`Document download failed:`, error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to download document',
          timestamp: new Date().toISOString(),
          error: {
            code: 'DOCUMENT_DOWNLOAD_FAILED',
            details: error.message,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Helper methods

  /**
   * Get estimated verification time based on document type
   */
  private getEstimatedVerificationTime(documentType: string): number {
    const estimationMap = {
      PAN: 2,
      AADHAAR: 4,
      BANK_STATEMENT: 24,
      UTILITY_BILL: 12,
      PASSPORT: 8,
      DRIVING_LICENSE: 6,
      VOTER_ID: 6,
    };

    return estimationMap[documentType] || 24;
  }
}