import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'user_management'),
        entities: [User, Role, Permission, UserSession, AuditLog],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('DB_LOGGING', false),
        ssl: configService.get('NODE_ENV') === 'production',
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([User, Role, Permission, UserSession, AuditLog]),

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
  ],

  controllers: [AppController, AuthController, UserController, RoleController],

  providers: [
    AppService,
    AuthService,
    UserService,
    RoleService,
    EmailService,
    AuditService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
