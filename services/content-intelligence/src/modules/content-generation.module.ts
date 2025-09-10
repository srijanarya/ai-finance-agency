import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';

// Entities
import { GeneratedContent } from '../entities/generated-content.entity';
import { ContentTemplate } from '../entities/content-template.entity';
import { ComplianceRule } from '../entities/compliance-rule.entity';

// Controllers
import { ContentGenerationController } from '../controllers/content-generation.controller';

// Services
import { ContentGenerationService } from '../services/content-generation.service';
import { MarketDataService } from '../services/market-data.service';
import { NewsAggregationService } from '../services/news-aggregation.service';
import { ComplianceValidationService } from '../services/compliance-validation.service';
import { ContentQualityService } from '../services/content-quality.service';
import { PersonalizationService } from '../services/personalization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GeneratedContent,
      ContentTemplate,
      ComplianceRule,
    ]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    BullModule.registerQueue({
      name: 'content-generation',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      },
    }),
  ],
  controllers: [ContentGenerationController],
  providers: [
    ContentGenerationService,
    MarketDataService,
    NewsAggregationService,
    ComplianceValidationService,
    ContentQualityService,
    PersonalizationService,
  ],
  exports: [
    ContentGenerationService,
    MarketDataService,
    NewsAggregationService,
    ComplianceValidationService,
    ContentQualityService,
    PersonalizationService,
  ],
})
export class ContentGenerationModule {}