import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { MarketQuote } from '../../entities/market-data/market-quote.entity';
import { HistoricalMarketData } from '../../entities/market-data/historical-data.entity';

// Services
import { MarketDataService } from '../../services/market-data/market-data.service';
import { AlphaVantageService } from '../../services/market-data/alpha-vantage.service';
import { YahooFinanceService } from '../../services/market-data/yahoo-finance.service';
import { MockMarketDataService } from '../../services/market-data/mock-market-data.service';

// Controllers
import { MarketDataController } from '../../controllers/market-data.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketQuote, HistoricalMarketData]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 30000),
        maxRedirects: 5,
        headers: {
          'User-Agent': 'TREUM-Content-Intelligence/1.0',
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('CACHE_TTL', 300), // 5 minutes
        max: configService.get<number>('CACHE_MAX_ITEMS', 1000),
        store: 'memory', // Can be changed to redis for production
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    AlphaVantageService,
    YahooFinanceService,
    MockMarketDataService,
  ],
  exports: [
    MarketDataService,
    AlphaVantageService,
    YahooFinanceService,
    MockMarketDataService,
  ],
})
export class MarketDataModule {}