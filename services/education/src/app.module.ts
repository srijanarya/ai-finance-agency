import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { APP_GUARD } from '@nestjs/core';

import configuration from './config/configuration';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Entities
import { Category } from './entities/category.entity';
import { Course } from './entities/course.entity';
import { Lesson } from './entities/lesson.entity';
import { UserProgress } from './entities/user-progress.entity';
import { Assessment } from './entities/assessment.entity';
import { AssessmentAttempt } from './entities/assessment-attempt.entity';
import { Certificate } from './entities/certificate.entity';

// Services
import { CoursesService } from './services/courses.service';
import { ProgressService } from './services/progress.service';

// Controllers
import { AppController } from './app.controller';
import { CoursesController } from './controllers/courses.controller';
import { ProgressController } from './controllers/progress.controller';
import { HealthController } from './controllers/health.controller';

import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          Category,
          Course,
          Lesson,
          UserProgress,
          Assessment,
          AssessmentAttempt,
          Certificate,
        ],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
      inject: [ConfigService],
    }),

    // TypeORM Feature modules
    TypeOrmModule.forFeature([
      Category,
      Course,
      Lesson,
      UserProgress,
      Assessment,
      AssessmentAttempt,
      Certificate,
    ]),

    // JWT
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expirationTime') },
      }),
      inject: [ConfigService],
    }),

    // Throttling/Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ([
        {
          ttl: configService.get('rateLimit.ttl'),
          limit: configService.get('rateLimit.limit'),
        },
      ]),
      inject: [ConfigService],
    }),

    // Health checks
    TerminusModule,
  ],
  controllers: [
    AppController,
    CoursesController,
    ProgressController,
    HealthController,
  ],
  providers: [
    AppService,
    CoursesService,
    ProgressService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
