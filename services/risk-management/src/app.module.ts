import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

// Entities
import {
  RiskAssessment,
  ComplianceCheck,
  RiskAlert,
  RiskLimit,
  RiskMetrics,
} from './entities';

// Services
import {
  TradeRiskAssessmentService,
  PortfolioRiskCalculationService,
  ComplianceMonitoringService,
  FraudDetectionService,
  RiskAlertingService,
} from './services';

// Controllers
import {
  HealthController,
  RiskAssessmentController,
  ComplianceController,
  RiskAlertsController,
} from './controllers';

// Guards and Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'risk_management'),
        entities: [RiskAssessment, ComplianceCheck, RiskAlert, RiskLimit, RiskMetrics],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),

    // Entity Modules
    TypeOrmModule.forFeature([
      RiskAssessment,
      ComplianceCheck,
      RiskAlert,
      RiskLimit,
      RiskMetrics,
    ]),

    // Event System
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Health Checks
    TerminusModule,

    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'dev-secret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: parseInt(configService.get('THROTTLE_TTL', '60000')), // 1 minute
            limit: parseInt(configService.get('THROTTLE_LIMIT', '100')), // 100 requests per minute
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // Microservices Communication
    ClientsModule.registerAsync([
      {
        name: 'TRADING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'treum.trading',
            protoPath: join(__dirname, '../../../packages/grpc-contracts/proto/trading.proto'),
            url: `${configService.get('TRADING_SERVICE_HOST', 'localhost')}:${configService.get('TRADING_SERVICE_GRPC_PORT', '5001')}`,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'USER_MANAGEMENT_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'treum.user',
            protoPath: join(__dirname, '../../../packages/grpc-contracts/proto/user.proto'),
            url: `${configService.get('USER_SERVICE_HOST', 'localhost')}:${configService.get('USER_SERVICE_GRPC_PORT', '5002')}`,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'treum.notification',
            protoPath: join(__dirname, '../../../packages/grpc-contracts/proto/notification.proto'),
            url: `${configService.get('NOTIFICATION_SERVICE_HOST', 'localhost')}:${configService.get('NOTIFICATION_SERVICE_GRPC_PORT', '5005')}`,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [
    HealthController,
    RiskAssessmentController,
    ComplianceController,
    RiskAlertsController,
  ],
  providers: [
    // Authentication
    JwtStrategy,

    // Core Services
    TradeRiskAssessmentService,
    PortfolioRiskCalculationService,
    ComplianceMonitoringService,
    FraudDetectionService,
    RiskAlertingService,
  ],
  exports: [
    // Export services for potential use by other modules
    TradeRiskAssessmentService,
    PortfolioRiskCalculationService,
    ComplianceMonitoringService,
    FraudDetectionService,
    RiskAlertingService,
  ],
})
export class AppModule {}