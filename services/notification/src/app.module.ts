import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Notification } from './entities/notification.entity';
import { NotificationPreferences } from './entities/notification-preferences.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationHistory } from './entities/notification-history.entity';
import { PushSubscription } from './entities/push-subscription.entity';
import { NotificationController } from './controllers/notification.controller';
import { NotificationPreferencesController } from './controllers/notification-preferences.controller';
import { NotificationService } from './services/notification.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushNotificationService } from './services/push-notification.service';
import { WebSocketGateway } from './gateways/websocket.gateway';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityMiddleware } from './middleware/security.middleware';
import { HealthModule } from './modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    EventEmitterModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'notification'),
        entities: [
          Notification,
          NotificationPreferences,
          NotificationTemplate,
          NotificationHistory,
          PushSubscription,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('DB_LOGGING', false),
        ssl: configService.get('NODE_ENV') === 'production',
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([
      Notification,
      NotificationPreferences,
      NotificationTemplate,
      NotificationHistory,
      PushSubscription,
    ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: configService.get('THROTTLE_TTL', 60000), // 1 minute
          limit: configService.get('THROTTLE_LIMIT', 10), // 10 requests per minute
        },
        {
          name: 'medium',
          ttl: configService.get('THROTTLE_TTL_MEDIUM', 60000 * 15), // 15 minutes
          limit: configService.get('THROTTLE_LIMIT_MEDIUM', 100), // 100 requests per 15 minutes
        },
        {
          name: 'long',
          ttl: configService.get('THROTTLE_TTL_LONG', 60000 * 60), // 1 hour
          limit: configService.get('THROTTLE_LIMIT_LONG', 500), // 500 requests per hour
        },
      ],
      inject: [ConfigService],
    }),

    HealthModule,
  ],

  controllers: [
    AppController,
    NotificationController,
    NotificationPreferencesController,
  ],

  providers: [
    AppService,
    NotificationService,
    EmailService,
    SmsService,
    PushNotificationService,
    WebSocketGateway,
    JwtStrategy,
    SecurityMiddleware,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
  }
}
