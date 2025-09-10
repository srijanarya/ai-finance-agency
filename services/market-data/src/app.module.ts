import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import * as redisStore from "cache-manager-redis-store";

// Entities
import { MarketData } from "./entities/market-data.entity";
import { HistoricalData } from "./entities/historical-data.entity";
import { MarketAlert } from "./entities/market-alert.entity";
import { Watchlist } from "./entities/watchlist.entity";
import { MarketSession } from "./entities/market-session.entity";

// Modules
import { MarketDataModule } from "./modules/market-data.module";
import { HistoricalDataModule } from "./modules/historical-data.module";
import { AlertModule } from "./modules/alert.module";
import { WatchlistModule } from "./modules/watchlist.module";
import { TechnicalIndicatorsModule } from "./modules/technical-indicators.module";
import { HealthModule } from "./modules/health.module";

// Controllers
import { HealthController } from "./controllers/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_NAME", "market_data"),
        entities: [
          MarketData,
          HistoricalData,
          MarketAlert,
          Watchlist,
          MarketSession,
        ],
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get("NODE_ENV") === "development",
        ssl:
          configService.get("NODE_ENV") === "production"
            ? { rejectUnauthorized: false }
            : false,
        retryAttempts: 0, // Skip database connection in development
      }),
      inject: [ConfigService],
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        ttl: 300, // 5 minutes default TTL
        max: 100, // maximum number of items in cache
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: "medium",
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: "long",
        ttl: 900000, // 15 minutes
        limit: 1000, // 1000 requests per 15 minutes
      },
    ]),

    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    TerminusModule,

    // Feature modules
    MarketDataModule,
    HistoricalDataModule,
    AlertModule,
    WatchlistModule,
    TechnicalIndicatorsModule,
    HealthModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
