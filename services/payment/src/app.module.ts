import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import configuration from './config/configuration';

// Entities
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { Invoice } from './entities/invoice.entity';
import { Transaction } from './entities/transaction.entity';
import { Wallet } from './entities/wallet.entity';

// Controllers
import { PaymentsController } from './controllers/payments.controller';
import { WalletsController } from './controllers/wallets.controller';
import { HealthController } from './controllers/health.controller';
import { WebhookController } from './webhook/webhook.controller';

// Services
import { PaymentService } from './services/payment.service';
import { WalletService } from './services/wallet.service';
import { TaxService } from './services/tax.service';
import { NotificationService } from './services/notification.service';
import { AuditService } from './services/audit.service';
import { WebhookService } from './webhook/webhook.service';

// Guards and Interceptors
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('payment.database.host'),
        port: configService.get('payment.database.port'),
        username: configService.get('payment.database.username'),
        password: configService.get('payment.database.password'),
        database: configService.get('payment.database.database'),
        entities: [Payment, PaymentMethod, Subscription, Plan, Invoice, Transaction, Wallet],
        synchronize: configService.get('payment.database.synchronize'),
        logging: configService.get('payment.database.logging'),
        ssl: configService.get('payment.database.ssl') ? { rejectUnauthorized: false } : false,
      }),
    }),

    // TypeORM entities
    TypeOrmModule.forFeature([
      Payment,
      PaymentMethod,
      Subscription,
      Plan,
      Invoice,
      Transaction,
      Wallet,
    ]),

    // JWT
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('payment.jwt.secret'),
        signOptions: {
          expiresIn: configService.get('payment.jwt.expiresIn'),
        },
      }),
    }),

    // Scheduling for background tasks
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('payment.security.rateLimiting.windowMs', 60000),
            limit: configService.get('payment.security.rateLimiting.max', 100),
          },
        ],
      }),
    }),
  ],
  controllers: [
    PaymentsController,
    WalletsController,
    HealthController,
    WebhookController,
  ],
  providers: [
    // Services
    PaymentService,
    WalletService,
    TaxService,
    NotificationService,
    AuditService,
    WebhookService,

    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    PaymentService,
    WalletService,
    TaxService,
    NotificationService,
    AuditService,
  ],
})
export class AppModule {}
