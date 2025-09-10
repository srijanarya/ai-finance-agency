import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ComplianceRule } from '../entities/compliance-rule.entity';

// Services
import { ComplianceValidationService } from '../services/compliance-validation.service';

// Future implementation for compliance management
// Controllers would be implemented here

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplianceRule]),
  ],
  controllers: [
    // ComplianceController - to be implemented
  ],
  providers: [
    ComplianceValidationService,
    // ComplianceRuleService - to be implemented
  ],
  exports: [
    ComplianceValidationService,
  ],
})
export class ComplianceModule {}