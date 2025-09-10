import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ContentAnalytics } from '../entities/content-analytics.entity';
import { GeneratedContent } from '../entities/generated-content.entity';
import { PlatformOptimizedContent } from '../entities/platform-optimized-content.entity';

// Future implementation for content analytics
// Controllers and services would be implemented here

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentAnalytics,
      GeneratedContent,
      PlatformOptimizedContent,
    ]),
  ],
  controllers: [
    // AnalyticsController - to be implemented
  ],
  providers: [
    // AnalyticsService - to be implemented
    // MetricsCollectorService - to be implemented
    // ReportingService - to be implemented
  ],
  exports: [
    // Services to be exported
  ],
})
export class AnalyticsModule {}