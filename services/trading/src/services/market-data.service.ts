import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThan, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MarketData, MarketDataType, DataProvider, MarketStatus } from '../entities/market-data.entity';
import {
  CreateMarketDataDto,
  UpdateMarketDataDto,
  MarketDataSearchDto,
  MarketDataResponseDto,
  MarketDataListResponseDto,
  MarketDataSnapshotDto,
} from '../dto/market-data.dto';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly realtimeSymbols = new Set<string>();
  private readonly subscriptions = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    private eventEmitter: EventEmitter2,
  ) {
    this.startMaintenanceTask();
  }

  async create(createMarketDataDto: CreateMarketDataDto): Promise<MarketDataResponseDto> {
    try {
      // Validate required fields based on data type
      this.validateCreateData(createMarketDataDto);

      const marketData = this.marketDataRepository.create({
        ...createMarketDataDto,
        timestamp: createMarketDataDto.timestamp || new Date(),
      });

      const savedData = await this.marketDataRepository.save(marketData);
      this.logger.log(`Created market data for ${savedData.symbol} (${savedData.dataType})`);

      // Emit real-time update event
      this.eventEmitter.emit('market-data.updated', savedData);

      return this.mapToResponseDto(savedData);
    } catch (error) {
      this.logger.error(`Failed to create market data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createBulk(createMarketDataDtos: CreateMarketDataDto[]): Promise<MarketDataResponseDto[]> {
    try {
      const marketDataEntities = createMarketDataDtos.map(dto => {
        this.validateCreateData(dto);
        return this.marketDataRepository.create({
          ...dto,
          timestamp: dto.timestamp || new Date(),
        });
      });

      const savedData = await this.marketDataRepository.save(marketDataEntities);
      this.logger.log(`Created ${savedData.length} market data records`);

      // Emit bulk update event
      this.eventEmitter.emit('market-data.bulk-updated', savedData);

      return savedData.map(data => this.mapToResponseDto(data));
    } catch (error) {
      this.logger.error(`Failed to create bulk market data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateMarketDataDto: UpdateMarketDataDto): Promise<MarketDataResponseDto> {
    try {
      const marketData = await this.marketDataRepository.findOne({ where: { id } });
      if (!marketData) {
        throw new NotFoundException(`Market data with ID ${id} not found`);
      }

      Object.assign(marketData, updateMarketDataDto);
      const updatedData = await this.marketDataRepository.save(marketData);

      this.logger.log(`Updated market data ${id}`);
      this.eventEmitter.emit('market-data.updated', updatedData);

      return this.mapToResponseDto(updatedData);
    } catch (error) {
      this.logger.error(`Failed to update market data ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<MarketDataResponseDto> {
    try {
      const marketData = await this.marketDataRepository.findOne({ where: { id } });
      if (!marketData) {
        throw new NotFoundException(`Market data with ID ${id} not found`);
      }

      return this.mapToResponseDto(marketData);
    } catch (error) {
      this.logger.error(`Failed to find market data ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async search(searchDto: MarketDataSearchDto): Promise<MarketDataListResponseDto> {
    try {
      const {
        symbol,
        symbols,
        dataType,
        provider,
        instrumentType,
        exchange,
        startTime,
        endTime,
        minQuality,
        includeStale,
        realTimeOnly,
        regularHoursOnly,
        page = 1,
        limit = 20,
        sortBy = 'timestamp',
        sortOrder = 'desc',
      } = searchDto;

      const queryBuilder = this.marketDataRepository.createQueryBuilder('md');

      // Apply filters
      if (symbol) {
        queryBuilder.andWhere('md.symbol = :symbol', { symbol });
      }

      if (symbols && symbols.length > 0) {
        queryBuilder.andWhere('md.symbol IN (:...symbols)', { symbols });
      }

      if (dataType) {
        queryBuilder.andWhere('md.dataType = :dataType', { dataType });
      }

      if (provider) {
        queryBuilder.andWhere('md.provider = :provider', { provider });
      }

      if (instrumentType) {
        queryBuilder.andWhere('md.instrumentType = :instrumentType', { instrumentType });
      }

      if (exchange) {
        queryBuilder.andWhere('md.exchange = :exchange', { exchange });
      }

      if (startTime) {
        queryBuilder.andWhere('md.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('md.timestamp <= :endTime', { endTime });
      }

      if (minQuality !== undefined) {
        queryBuilder.andWhere('md.dataQuality >= :minQuality', { minQuality });
      }

      if (!includeStale) {
        queryBuilder.andWhere('md.isStale = false');
      }

      if (realTimeOnly) {
        queryBuilder.andWhere('md.isRealTime = true');
      }

      if (regularHoursOnly) {
        queryBuilder.andWhere('md.isRegularHours = true');
      }

      // Apply sorting
      const validSortFields = ['timestamp', 'symbol', 'dataType', 'provider', 'dataQuality'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'timestamp';
      queryBuilder.orderBy(`md.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      const queryStartTime = Date.now();
      const [data, total] = await queryBuilder.getManyAndCount();
      const executionTime = Date.now() - queryStartTime;

      const totalPages = Math.ceil(total / limit);

      return {
        data: data.map(item => this.mapToResponseDto(item)),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        executionTime,
      };
    } catch (error) {
      this.logger.error(`Failed to search market data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLatestQuote(symbol: string): Promise<MarketDataResponseDto | null> {
    try {
      const quote = await this.marketDataRepository.findOne({
        where: {
          symbol,
          dataType: MarketDataType.QUOTE,
          isStale: false,
        },
        order: { timestamp: 'DESC' },
      });

      return quote ? this.mapToResponseDto(quote) : null;
    } catch (error) {
      this.logger.error(`Failed to get latest quote for ${symbol}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLatestTrade(symbol: string): Promise<MarketDataResponseDto | null> {
    try {
      const trade = await this.marketDataRepository.findOne({
        where: {
          symbol,
          dataType: MarketDataType.TRADE,
          isStale: false,
        },
        order: { timestamp: 'DESC' },
      });

      return trade ? this.mapToResponseDto(trade) : null;
    } catch (error) {
      this.logger.error(`Failed to get latest trade for ${symbol}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getOHLCV(
    symbol: string,
    period: string = '1d',
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<MarketDataResponseDto[]> {
    try {
      const queryBuilder = this.marketDataRepository.createQueryBuilder('md');
      
      queryBuilder
        .where('md.symbol = :symbol', { symbol })
        .andWhere('md.dataType = :dataType', { dataType: MarketDataType.OHLCV })
        .andWhere('md.isStale = false');

      if (startDate) {
        queryBuilder.andWhere('md.timestamp >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('md.timestamp <= :endDate', { endDate });
      }

      queryBuilder
        .orderBy('md.timestamp', 'DESC')
        .take(limit);

      const ohlcvData = await queryBuilder.getMany();
      return ohlcvData.map(data => this.mapToResponseDto(data));
    } catch (error) {
      this.logger.error(`Failed to get OHLCV for ${symbol}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSnapshot(symbols: string[]): Promise<MarketDataSnapshotDto> {
    try {
      const timestamp = new Date();
      const snapshots: Record<string, any> = {};
      let totalFreshness = 0;
      let validDataCount = 0;

      for (const symbol of symbols) {
        const [quote, trade, ohlcv] = await Promise.all([
          this.getLatestQuote(symbol),
          this.getLatestTrade(symbol),
          this.getLatestOHLCV(symbol),
        ]);

        const snapshot: any = {};

        if (quote) {
          snapshot.quote = quote.quoteData;
          totalFreshness += quote.ageMinutes;
          validDataCount++;
        }

        if (trade) {
          snapshot.lastTrade = {
            price: trade.lastPrice,
            size: trade.lastSize,
            timestamp: trade.timestamp,
          };
        }

        if (ohlcv) {
          snapshot.dailyStats = {
            open: ohlcv.openPrice,
            high: ohlcv.highPrice,
            low: ohlcv.lowPrice,
            close: ohlcv.closePrice,
            volume: ohlcv.volume,
            change: ohlcv.change,
            changePercent: ohlcv.changePercent,
          };
        }

        snapshot.marketStatus = quote?.marketStatus || MarketStatus.CLOSED;
        snapshot.lastUpdated = quote?.timestamp || trade?.timestamp || ohlcv?.timestamp || timestamp;

        if (Object.keys(snapshot).length > 0) {
          snapshots[symbol] = snapshot;
        }
      }

      return {
        snapshots,
        timestamp,
        symbolCount: Object.keys(snapshots).length,
        avgFreshness: validDataCount > 0 ? Math.round((totalFreshness / validDataCount) * 60) : 0, // Convert to seconds
      };
    } catch (error) {
      this.logger.error(`Failed to get snapshot: ${error.message}`, error.stack);
      throw error;
    }
  }

  async subscribeToSymbol(symbol: string, userId?: string): Promise<void> {
    try {
      this.realtimeSymbols.add(symbol.toUpperCase());
      
      if (userId) {
        if (!this.subscriptions.has(userId)) {
          this.subscriptions.set(userId, new Set());
        }
        this.subscriptions.get(userId)?.add(symbol.toUpperCase());
      }

      this.logger.log(`Subscribed to real-time data for ${symbol}`);
      this.eventEmitter.emit('market-data.subscribed', { symbol, userId });
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${symbol}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async unsubscribeFromSymbol(symbol: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        this.subscriptions.get(userId)?.delete(symbol.toUpperCase());
        if (this.subscriptions.get(userId)?.size === 0) {
          this.subscriptions.delete(userId);
        }
      }

      // Check if any other users are subscribed
      let hasOtherSubscribers = false;
      for (const [, userSymbols] of this.subscriptions) {
        if (userSymbols.has(symbol.toUpperCase())) {
          hasOtherSubscribers = true;
          break;
        }
      }

      if (!hasOtherSubscribers) {
        this.realtimeSymbols.delete(symbol.toUpperCase());
      }

      this.logger.log(`Unsubscribed from real-time data for ${symbol}`);
      this.eventEmitter.emit('market-data.unsubscribed', { symbol, userId });
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from ${symbol}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserSubscriptions(userId: string): Promise<string[]> {
    return Array.from(this.subscriptions.get(userId) || []);
  }

  async getActiveSubscriptions(): Promise<string[]> {
    return Array.from(this.realtimeSymbols);
  }

  async markStaleData(olderThanMinutes: number = 15): Promise<number> {
    try {
      const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
      
      const result = await this.marketDataRepository
        .createQueryBuilder()
        .update(MarketData)
        .set({ isStale: true, dataQuality: () => 'GREATEST(0, data_quality - 25)' })
        .where('timestamp < :cutoffTime', { cutoffTime })
        .andWhere('isStale = false')
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Marked ${result.affected} records as stale`);
      }

      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to mark stale data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async cleanupOldData(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      
      const result = await this.marketDataRepository
        .createQueryBuilder()
        .delete()
        .where('timestamp < :cutoffDate', { cutoffDate })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Deleted ${result.affected} old market data records`);
      }

      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to cleanup old data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getLatestOHLCV(symbol: string): Promise<MarketDataResponseDto | null> {
    try {
      const ohlcv = await this.marketDataRepository.findOne({
        where: {
          symbol,
          dataType: MarketDataType.OHLCV,
          isStale: false,
        },
        order: { timestamp: 'DESC' },
      });

      return ohlcv ? this.mapToResponseDto(ohlcv) : null;
    } catch (error) {
      this.logger.error(`Failed to get latest OHLCV for ${symbol}: ${error.message}`, error.stack);
      return null;
    }
  }

  private validateCreateData(dto: CreateMarketDataDto): void {
    switch (dto.dataType) {
      case MarketDataType.QUOTE:
        if (!dto.bidPrice || !dto.askPrice) {
          throw new BadRequestException('Quote data requires bidPrice and askPrice');
        }
        break;
      case MarketDataType.TRADE:
        if (!dto.lastPrice) {
          throw new BadRequestException('Trade data requires lastPrice');
        }
        break;
      case MarketDataType.OHLCV:
        if (!dto.openPrice || !dto.highPrice || !dto.lowPrice || !dto.closePrice) {
          throw new BadRequestException('OHLCV data requires open, high, low, and close prices');
        }
        break;
    }
  }

  private mapToResponseDto(marketData: MarketData): MarketDataResponseDto {
    return {
      ...marketData,
      age: marketData.age,
      ageMinutes: marketData.ageMinutes,
      isRecent: marketData.isRecent,
      isDelayed: marketData.isDelayed,
      isHighQuality: marketData.isHighQuality,
      effectiveSpread: marketData.effectiveSpread,
      effectiveMidPrice: marketData.effectiveMidPrice,
    };
  }

  private startMaintenanceTask(): void {
    // Mark stale data every 5 minutes
    setInterval(() => {
      this.markStaleData().catch(error => {
        this.logger.error(`Stale data marking failed: ${error.message}`);
      });
    }, 5 * 60 * 1000);

    // Cleanup old data daily
    setInterval(() => {
      this.cleanupOldData().catch(error => {
        this.logger.error(`Old data cleanup failed: ${error.message}`);
      });
    }, 24 * 60 * 60 * 1000);
  }
}