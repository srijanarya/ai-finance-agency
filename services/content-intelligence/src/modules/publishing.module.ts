import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';

// Entities
import { PlatformOptimizedContent } from '../entities/platform-optimized-content.entity';
import { GeneratedContent } from '../entities/generated-content.entity';

// Future implementation for multi-platform publishing
// Controllers and services would be implemented here

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlatformOptimizedContent,
      GeneratedContent,
    ]),
    HttpModule,
    BullModule.registerQueue({
      name: 'publishing',
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: 20,
        removeOnFail: 10,
      },
    }),
  ],
  controllers: [
    // PublishingController - to be implemented
  ],
  providers: [
    // PublishingService - to be implemented
    // PlatformConnectorService - to be implemented
    // SchedulingService - to be implemented
  ],
  exports: [
    // Services to be exported
  ],
})
export class PublishingModule {}