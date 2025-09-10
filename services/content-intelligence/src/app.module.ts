import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

// Configuration
import { databaseConfig } from './config/database.config';
import { aiConfig } from './config/ai.config';
import { redisConfig } from './config/redis.config';
import { publishingConfig } from './config/publishing.config';

// Modules
import { ContentGenerationModule } from './modules/content-generation.module';
import { PublishingModule } from './modules/publishing.module';
import { TemplateModule } from './modules/template.module';
import { AnalyticsModule } from './modules/analytics.module';
import { ComplianceModule } from './modules/compliance.module';
import { WorkflowModule } from './modules/workflow.module';
import { HealthModule } from './modules/health.module';
import { AuthModule } from './modules/auth.module';

// Controllers
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Entities
import { ContentTemplate } from './entities/content-template.entity';
import { GeneratedContent } from './entities/generated-content.entity';
import { PlatformOptimizedContent } from './entities/platform-optimized-content.entity';
import { ContentAnalytics } from './entities/content-analytics.entity';
import { ComplianceRule } from './entities/compliance-rule.entity';
import { ContentApprovalWorkflow } from './entities/content-approval-workflow.entity';
import { ContentApprovalInstance } from './entities/content-approval-instance.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, aiConfig, redisConfig, publishingConfig],
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [
          ContentTemplate,
          GeneratedContent,
          PlatformOptimizedContent,
          ContentAnalytics,
          ComplianceRule,
          ContentApprovalWorkflow,
          ContentApprovalInstance,
        ],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false,
        } : false,
      }),
      inject: [ConfigService],
    }),

    // Redis Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
        prefix: 'content-intelligence',
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // requests per minute
      },
    ]),

    // Event system
    EventEmitterModule.forRoot(),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Health checks
    TerminusModule,

    // Feature modules
    AuthModule,
    ContentGenerationModule,
    PublishingModule,
    TemplateModule,
    AnalyticsModule,
    ComplianceModule,
    WorkflowModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}