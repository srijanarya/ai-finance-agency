import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstitutionalController } from './controllers/institutional.controller';
import { InstitutionalTradingService } from './services/institutional-trading.service';
import { InstitutionalOrder } from './entities/institutional-order.entity';
import { Portfolio } from './entities/portfolio.entity';
import { InstitutionalStrategy } from './entities/institutional-strategy.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'trading-service-secret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'trading'),
        entities: [InstitutionalOrder, Portfolio, InstitutionalStrategy],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([InstitutionalOrder, Portfolio, InstitutionalStrategy]),
  ],
  controllers: [AppController, InstitutionalController],
  providers: [AppService, InstitutionalTradingService],
})
export class AppModule {}
