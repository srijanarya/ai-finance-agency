import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Entities
import { QualityAssessment } from '../../entities/quality-scoring/quality-assessment.entity';

// Services
import { QualityScoringService } from '../../services/quality-scoring/quality-scoring.service';
import { ReadabilityAgentService } from '../../services/quality-scoring/agents/readability-agent.service';
import { FinancialAccuracyAgentService } from '../../services/quality-scoring/agents/financial-accuracy-agent.service';

// Controllers
import { QualityScoringController } from '../../controllers/quality-scoring.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([QualityAssessment]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [QualityScoringController],
  providers: [
    QualityScoringService,
    ReadabilityAgentService,
    FinancialAccuracyAgentService,
  ],
  exports: [
    QualityScoringService,
    ReadabilityAgentService,
    FinancialAccuracyAgentService,
  ],
})
export class QualityScoringModule {}