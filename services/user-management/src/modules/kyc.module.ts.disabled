/**
 * KYC Module
 * Comprehensive module for KYC verification system
 * Includes all services, controllers, and configurations needed for KYC operations
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { ThrottlerModule } from '@nestjs/throttler';

// Entities
import { KYCApplication } from '../entities/kyc-application.entity';
import { KYCDocument } from '../entities/kyc-document.entity';
import { AddressVerification } from '../entities/address-verification.entity';
import { User } from '../entities/user.entity';

// Controllers
import { KYCController } from '../controllers/kyc.controller';

// Services
import { KYCService } from '../services/kyc.service';
import { FileUploadService } from '../services/file-upload.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { VerificationAPIService } from '../services/verification-api.service';
import { NotificationService } from '../services/notification.service';
import { AuditLogService } from '../services/audit-log.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'kyc',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    TypeOrmModule.forFeature([
      KYCApplication,
      KYCDocument,
      AddressVerification,
      User,
    ]),
  ],
  controllers: [KYCController],
  providers: [
    KYCService,
    FileUploadService,
    RiskAssessmentService,
    VerificationAPIService,
    NotificationService,
    AuditLogService,
  ],
  exports: [
    KYCService,
    FileUploadService,
    RiskAssessmentService,
    VerificationAPIService,
    NotificationService,
    AuditLogService,
  ],
})
export class KYCModule {}
