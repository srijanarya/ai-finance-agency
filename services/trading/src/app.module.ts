import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health.module';

// Controllers
import { InstitutionalController } from './controllers/institutional.controller';
import { OrderController } from './controllers/order.controller';
import { PositionController } from './controllers/position.controller';
import { MarketDataController } from './controllers/market-data.controller';

// Services
import { InstitutionalTradingService } from './services/institutional-trading.service';
import { ComplianceEngineService } from './services/compliance-engine.service';
import { RiskManagementService } from './services/risk-management.service';
import { OrderService } from './services/order.service';
import { PositionService } from './services/position.service';
import { MarketDataService } from './services/market-data.service';

// Entities
import { InstitutionalOrder } from './entities/institutional-order.entity';
import { Portfolio } from './entities/portfolio.entity';
import { InstitutionalStrategy } from './entities/institutional-strategy.entity';
import { Order } from './entities/order.entity';
import { Trade } from './entities/trade.entity';
import { Position } from './entities/position.entity';
import { MarketData } from './entities/market-data.entity';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WsJwtGuard } from './guards/ws-jwt.guard';

// Gateways
import { TradingGateway } from './gateways/trading.gateway';

// Filters
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds in milliseconds
      limit: 100,
    }]),
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
        entities: [
          InstitutionalOrder,
          Portfolio,
          InstitutionalStrategy,
          Order,
          Trade,
          Position,
          MarketData,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        maxQueryExecutionTime: 10000,
        extra: {
          max: 20,
          connectionTimeoutMillis: 60000,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      InstitutionalOrder,
      Portfolio,
      InstitutionalStrategy,
      Order,
      Trade,
      Position,
      MarketData,
    ]),
    HealthModule,
  ],
  controllers: [
    AppController,
    InstitutionalController,
    OrderController,
    PositionController,
    MarketDataController,
  ],
  providers: [
    // Core services
    AppService,
    
    // Trading services
    InstitutionalTradingService,
    OrderService,
    PositionService,
    MarketDataService,
    
    // Risk and compliance
    ComplianceEngineService,
    RiskManagementService,
    
    // Guards
    JwtAuthGuard,
    RolesGuard,
    WsJwtGuard,
    
    // Gateways
    TradingGateway,
    
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
