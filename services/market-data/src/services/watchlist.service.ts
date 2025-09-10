import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { Watchlist } from "../entities/watchlist.entity";
import { MarketDataService } from "./market-data.service";

export interface CreateWatchlistDto {
  userId: string;
  symbol: string;
  displayName?: string;
  notes?: string;
  tags?: string[];
  targetBuyPrice?: number;
  targetSellPrice?: number;
  stopLossPrice?: number;
  enableAlerts?: boolean;
}

export interface UpdateWatchlistDto {
  displayName?: string;
  notes?: string;
  tags?: string[];
  sortOrder?: number;
  targetBuyPrice?: number;
  targetSellPrice?: number;
  stopLossPrice?: number;
  isActive?: boolean;
  enableAlerts?: boolean;
}

export interface WatchlistWithMarketData extends Watchlist {
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  isMarketOpen?: boolean;
}

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(
    @InjectRepository(Watchlist)
    private watchlistRepository: Repository<Watchlist>,
    private marketDataService: MarketDataService,
    private eventEmitter: EventEmitter2,
  ) {}

  async addToWatchlist(
    createWatchlistDto: CreateWatchlistDto,
  ): Promise<Watchlist> {
    try {
      // Check if symbol already exists in user's watchlist
      const existing = await this.watchlistRepository.findOne({
        where: {
          userId: createWatchlistDto.userId,
          symbol: createWatchlistDto.symbol.toUpperCase(),
        },
      });

      if (existing) {
        throw new Error("Symbol already in watchlist");
      }

      // Get current market data for the symbol
      const marketData = await this.marketDataService.getRealtimeData(
        createWatchlistDto.symbol,
      );

      const watchlistItem = this.watchlistRepository.create({
        ...createWatchlistDto,
        symbol: createWatchlistDto.symbol.toUpperCase(),
        tags: createWatchlistDto.tags || [],
        sortOrder: await this.getNextSortOrder(createWatchlistDto.userId),
        addedAtPrice: marketData?.price,
        enableAlerts: createWatchlistDto.enableAlerts || false,
      });

      const savedItem = await this.watchlistRepository.save(watchlistItem);

      this.eventEmitter.emit("watchlist.symbol.added", {
        userId: savedItem.userId,
        symbol: savedItem.symbol,
        watchlistItem: savedItem,
      });

      this.logger.log(
        `Added ${savedItem.symbol} to watchlist for user ${savedItem.userId}`,
      );

      return savedItem;
    } catch (error) {
      this.logger.error("Error adding to watchlist:", error);
      throw error;
    }
  }

  async updateWatchlistItem(
    id: string,
    updateWatchlistDto: UpdateWatchlistDto,
  ): Promise<Watchlist> {
    try {
      const watchlistItem = await this.watchlistRepository.findOne({
        where: { id },
      });

      if (!watchlistItem) {
        throw new NotFoundException("Watchlist item not found");
      }

      Object.assign(watchlistItem, updateWatchlistDto);

      const updatedItem = await this.watchlistRepository.save(watchlistItem);

      this.eventEmitter.emit("watchlist.item.updated", {
        userId: updatedItem.userId,
        symbol: updatedItem.symbol,
        watchlistItem: updatedItem,
        changes: updateWatchlistDto,
      });

      this.logger.log(`Updated watchlist item ${id}`);

      return updatedItem;
    } catch (error) {
      this.logger.error("Error updating watchlist item:", error);
      throw error;
    }
  }

  async removeFromWatchlist(id: string): Promise<void> {
    try {
      const watchlistItem = await this.watchlistRepository.findOne({
        where: { id },
      });

      if (!watchlistItem) {
        throw new NotFoundException("Watchlist item not found");
      }

      await this.watchlistRepository.remove(watchlistItem);

      this.eventEmitter.emit("watchlist.symbol.removed", {
        userId: watchlistItem.userId,
        symbol: watchlistItem.symbol,
        watchlistItem,
      });

      this.logger.log(
        `Removed ${watchlistItem.symbol} from watchlist for user ${watchlistItem.userId}`,
      );
    } catch (error) {
      this.logger.error("Error removing from watchlist:", error);
      throw error;
    }
  }

  async getUserWatchlist(userId: string): Promise<WatchlistWithMarketData[]> {
    try {
      const watchlistItems = await this.watchlistRepository.find({
        where: { userId, isActive: true },
        order: { sortOrder: "ASC", createdAt: "DESC" },
      });

      // Fetch current market data for all symbols
      const symbols = watchlistItems.map((item) => item.symbol);
      const marketDataList =
        await this.marketDataService.getMultipleRealtimeData(symbols);

      // Create a map for quick lookup
      const marketDataMap = new Map();
      marketDataList.forEach((data) => {
        marketDataMap.set(data.symbol, data);
      });

      // Combine watchlist items with market data
      const watchlistWithData: WatchlistWithMarketData[] = watchlistItems.map(
        (item) => {
          const marketData = marketDataMap.get(item.symbol);

          return {
            ...item,
            currentPrice: marketData?.price,
            change: marketData?.change,
            changePercent: marketData?.changePercent,
            dayHigh: marketData?.dayHigh,
            dayLow: marketData?.dayLow,
            volume: marketData?.volume,
            isMarketOpen: marketData?.isMarketOpen,
          };
        },
      );

      return watchlistWithData;
    } catch (error) {
      this.logger.error("Error getting user watchlist:", error);
      throw error;
    }
  }

  async getWatchlistItem(id: string): Promise<WatchlistWithMarketData | null> {
    try {
      const watchlistItem = await this.watchlistRepository.findOne({
        where: { id },
      });

      if (!watchlistItem) {
        return null;
      }

      const marketData = await this.marketDataService.getRealtimeData(
        watchlistItem.symbol,
      );

      return {
        ...watchlistItem,
        currentPrice: marketData?.price,
        change: marketData?.change,
        changePercent: marketData?.changePercent,
        dayHigh: marketData?.dayHigh,
        dayLow: marketData?.dayLow,
        volume: marketData?.volume,
        isMarketOpen: marketData?.isMarketOpen,
      };
    } catch (error) {
      this.logger.error("Error getting watchlist item:", error);
      throw error;
    }
  }

  async reorderWatchlist(
    userId: string,
    itemOrders: { id: string; sortOrder: number }[],
  ): Promise<void> {
    try {
      for (const { id, sortOrder } of itemOrders) {
        await this.watchlistRepository.update({ id, userId }, { sortOrder });
      }

      this.eventEmitter.emit("watchlist.reordered", {
        userId,
        itemOrders,
      });

      this.logger.log(`Reordered watchlist for user ${userId}`);
    } catch (error) {
      this.logger.error("Error reordering watchlist:", error);
      throw error;
    }
  }

  async getWatchlistByTags(
    userId: string,
    tags: string[],
  ): Promise<WatchlistWithMarketData[]> {
    try {
      const query = this.watchlistRepository
        .createQueryBuilder("watchlist")
        .where("watchlist.userId = :userId", { userId })
        .andWhere("watchlist.isActive = :isActive", { isActive: true });

      if (tags.length > 0) {
        query.andWhere("watchlist.tags && :tags", { tags });
      }

      const watchlistItems = await query
        .orderBy("watchlist.sortOrder", "ASC")
        .getMany();

      // Fetch market data for all symbols
      const symbols = watchlistItems.map((item) => item.symbol);
      const marketDataList =
        await this.marketDataService.getMultipleRealtimeData(symbols);

      const marketDataMap = new Map();
      marketDataList.forEach((data) => {
        marketDataMap.set(data.symbol, data);
      });

      return watchlistItems.map((item) => {
        const marketData = marketDataMap.get(item.symbol);

        return {
          ...item,
          currentPrice: marketData?.price,
          change: marketData?.change,
          changePercent: marketData?.changePercent,
          dayHigh: marketData?.dayHigh,
          dayLow: marketData?.dayLow,
          volume: marketData?.volume,
          isMarketOpen: marketData?.isMarketOpen,
        };
      });
    } catch (error) {
      this.logger.error("Error getting watchlist by tags:", error);
      throw error;
    }
  }

  async getUserWatchlistSymbols(userId: string): Promise<string[]> {
    try {
      const watchlistItems = await this.watchlistRepository.find({
        where: { userId, isActive: true },
        select: ["symbol"],
      });

      return watchlistItems.map((item) => item.symbol);
    } catch (error) {
      this.logger.error("Error getting user watchlist symbols:", error);
      return [];
    }
  }

  async getWatchlistStatistics(userId: string): Promise<{
    totalSymbols: number;
    activeSymbols: number;
    symbolsByTags: { tag: string; count: number }[];
    priceAlerts: number;
    topGainers: WatchlistWithMarketData[];
    topLosers: WatchlistWithMarketData[];
  }> {
    try {
      const watchlistItems = await this.getUserWatchlist(userId);

      const activeSymbols = watchlistItems.filter((item) => item.isActive);
      const symbolsWithAlerts = watchlistItems.filter(
        (item) => item.enableAlerts,
      );

      // Count symbols by tags
      const tagCounts = new Map<string, number>();
      watchlistItems.forEach((item) => {
        item.tags.forEach((tag) => {
          const count = tagCounts.get(tag) || 0;
          tagCounts.set(tag, count + 1);
        });
      });

      const symbolsByTags = Array.from(tagCounts.entries()).map(
        ([tag, count]) => ({
          tag,
          count,
        }),
      );

      // Get top gainers and losers
      const itemsWithPrice = watchlistItems.filter(
        (item) =>
          item.changePercent !== undefined && item.changePercent !== null,
      );

      const topGainers = itemsWithPrice
        .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
        .slice(0, 5);

      const topLosers = itemsWithPrice
        .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
        .slice(0, 5);

      return {
        totalSymbols: watchlistItems.length,
        activeSymbols: activeSymbols.length,
        symbolsByTags,
        priceAlerts: symbolsWithAlerts.length,
        topGainers,
        topLosers,
      };
    } catch (error) {
      this.logger.error("Error getting watchlist statistics:", error);
      throw error;
    }
  }

  private async getNextSortOrder(userId: string): Promise<number> {
    try {
      const result = await this.watchlistRepository
        .createQueryBuilder("watchlist")
        .select("MAX(watchlist.sortOrder)", "maxOrder")
        .where("watchlist.userId = :userId", { userId })
        .getRawOne();

      return (result?.maxOrder || 0) + 1;
    } catch (error) {
      this.logger.error("Error getting next sort order:", error);
      return 1;
    }
  }

  async bulkAddToWatchlist(
    userId: string,
    symbols: string[],
  ): Promise<Watchlist[]> {
    try {
      const results: Watchlist[] = [];

      for (const symbol of symbols) {
        try {
          const item = await this.addToWatchlist({
            userId,
            symbol,
          });
          results.push(item);
        } catch (error) {
          this.logger.warn(
            `Failed to add ${symbol} to watchlist:`,
            error.message,
          );
        }
      }

      return results;
    } catch (error) {
      this.logger.error("Error bulk adding to watchlist:", error);
      throw error;
    }
  }

  async importWatchlistFromCSV(
    userId: string,
    csvData: string,
  ): Promise<{
    success: Watchlist[];
    errors: { symbol: string; error: string }[];
  }> {
    try {
      const lines = csvData.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const success: Watchlist[] = [];
      const errors: { symbol: string; error: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());

        if (values.length < 1) continue;

        const symbolIndex = headers.indexOf("symbol") || 0;
        const symbol = values[symbolIndex];

        if (!symbol) continue;

        try {
          const createDto: CreateWatchlistDto = {
            userId,
            symbol,
          };

          // Optional fields
          const displayNameIndex = headers.indexOf("displayname");
          if (displayNameIndex >= 0 && values[displayNameIndex]) {
            createDto.displayName = values[displayNameIndex];
          }

          const notesIndex = headers.indexOf("notes");
          if (notesIndex >= 0 && values[notesIndex]) {
            createDto.notes = values[notesIndex];
          }

          const tagsIndex = headers.indexOf("tags");
          if (tagsIndex >= 0 && values[tagsIndex]) {
            createDto.tags = values[tagsIndex].split(";").map((t) => t.trim());
          }

          const item = await this.addToWatchlist(createDto);
          success.push(item);
        } catch (error) {
          errors.push({ symbol, error: error.message });
        }
      }

      return { success, errors };
    } catch (error) {
      this.logger.error("Error importing watchlist from CSV:", error);
      throw error;
    }
  }
}
