import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";

import { MarketData } from "../entities/market-data.entity";
import { MarketSession } from "../entities/market-session.entity";
import { Watchlist } from "../entities/watchlist.entity";
import { MarketDataService } from "../services/market-data.service";
import { MarketDataController } from "../controllers/market-data.controller";
import { MarketDataGateway } from "../gateways/market-data.gateway";
import { HistoricalDataModule } from "./historical-data.module";
import { TechnicalIndicatorsModule } from "./technical-indicators.module";
import { CacheService } from "../services/cache.service";
import { DataAggregationService } from "../services/data-aggregation.service";
import { RateLimiterService } from "../services/rate-limiter.service";
import { MonitoringService } from "../services/monitoring.service";
import { WatchlistService } from "../services/watchlist.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketData, MarketSession, Watchlist]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "24h" },
    }),
    HistoricalDataModule,
    TechnicalIndicatorsModule,
  ],
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    MarketDataGateway,
    CacheService,
    DataAggregationService,
    RateLimiterService,
    MonitoringService,
    WatchlistService,
  ],
  exports: [
    MarketDataService,
    CacheService,
    DataAggregationService,
    RateLimiterService,
    MonitoringService,
  ],
})
export class MarketDataModule {}
