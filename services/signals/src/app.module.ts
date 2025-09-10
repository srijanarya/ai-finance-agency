import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { Signal } from './entities/signal.entity';
import { MarketData, MarketNews, EconomicIndicator } from './entities/market-data.entity';
import { BacktestResult, BacktestTrade } from './entities/backtest-result.entity';

// Services
import { SignalGeneratorService } from './services/signal-generator.service';
import { MarketDataService } from './services/market-data.service';
import { TechnicalAnalysisService } from './services/technical-analysis.service';
import { MLModelService } from './services/ml-model.service';
import { BacktestService } from './services/backtest.service';

// Controllers
import { SignalsController } from './controllers/signals.controller';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// Configuration
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // JWT Module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
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
        entities: [Signal, MarketData, MarketNews, EconomicIndicator, BacktestResult, BacktestTrade],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging', false),
        migrations: ['dist/migrations/**/*{.ts,.js}'],
        migrationsRun: configService.get('database.migrationsRun', false),
      }),
      inject: [ConfigService],
    }),

    // TypeORM Feature modules for repositories
    TypeOrmModule.forFeature([
      Signal,
      MarketData,
      MarketNews,
      EconomicIndicator,
      BacktestResult,
      BacktestTrade,
    ]),
  ],
  controllers: [AppController, SignalsController],
  providers: [
    AppService,
    SignalGeneratorService,
    MarketDataService,
    TechnicalAnalysisService,
    MLModelService,
    BacktestService,
    JwtAuthGuard,
  ],
  exports: [
    SignalGeneratorService,
    MarketDataService,
    TechnicalAnalysisService,
    MLModelService,
    BacktestService,
  ],
})
export class AppModule {}