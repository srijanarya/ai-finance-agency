import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";

import {
  WatchlistService,
  CreateWatchlistDto,
  UpdateWatchlistDto,
  WatchlistWithMarketData,
} from "../services/watchlist.service";
import { Watchlist } from "../entities/watchlist.entity";

@ApiTags("Watchlist")
@ApiBearerAuth()
@Controller("watchlist")
@UseGuards(ThrottlerGuard)
export class WatchlistController {
  constructor(private watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: "Get user watchlist with current market data" })
  @ApiResponse({
    status: 200,
    description: "Watchlist retrieved successfully",
  })
  async getUserWatchlist(
    @Request() req: any,
  ): Promise<WatchlistWithMarketData[]> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.watchlistService.getUserWatchlist(userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get user watchlist",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: "Add symbol to watchlist" })
  @ApiResponse({
    status: 201,
    description: "Symbol added to watchlist successfully",
    type: Watchlist,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request data or symbol already in watchlist",
  })
  async addToWatchlist(
    @Request() req: any,
    @Body() createWatchlistDto: Omit<CreateWatchlistDto, "userId">,
  ): Promise<Watchlist> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.watchlistService.addToWatchlist({
        ...createWatchlistDto,
        userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to add to watchlist",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("symbols")
  @ApiOperation({ summary: "Get user watchlist symbols only" })
  @ApiResponse({
    status: 200,
    description: "Watchlist symbols retrieved successfully",
  })
  async getUserWatchlistSymbols(
    @Request() req: any,
  ): Promise<{ symbols: string[] }> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const symbols =
        await this.watchlistService.getUserWatchlistSymbols(userId);
      return { symbols };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get watchlist symbols",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("statistics")
  @ApiOperation({ summary: "Get watchlist statistics" })
  @ApiResponse({
    status: 200,
    description: "Watchlist statistics retrieved successfully",
  })
  async getWatchlistStatistics(@Request() req: any) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      return await this.watchlistService.getWatchlistStatistics(userId);
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get watchlist statistics",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("by-tags")
  @ApiOperation({ summary: "Get watchlist items filtered by tags" })
  @ApiResponse({
    status: 200,
    description: "Filtered watchlist retrieved successfully",
  })
  async getWatchlistByTags(
    @Request() req: any,
    @Query("tags") tags: string = "",
  ): Promise<WatchlistWithMarketData[]> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const tagArray = tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      return await this.watchlistService.getWatchlistByTags(userId, tagArray);
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get watchlist by tags",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get watchlist item by ID" })
  @ApiResponse({
    status: 200,
    description: "Watchlist item retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Watchlist item not found" })
  async getWatchlistItem(
    @Param("id") id: string,
  ): Promise<WatchlistWithMarketData> {
    try {
      const item = await this.watchlistService.getWatchlistItem(id);

      if (!item) {
        throw new HttpException(
          "Watchlist item not found",
          HttpStatus.NOT_FOUND,
        );
      }

      return item;
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to get watchlist item",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update watchlist item" })
  @ApiResponse({
    status: 200,
    description: "Watchlist item updated successfully",
    type: Watchlist,
  })
  @ApiResponse({ status: 404, description: "Watchlist item not found" })
  async updateWatchlistItem(
    @Param("id") id: string,
    @Body() updateWatchlistDto: UpdateWatchlistDto,
  ): Promise<Watchlist> {
    try {
      return await this.watchlistService.updateWatchlistItem(
        id,
        updateWatchlistDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to update watchlist item",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove symbol from watchlist" })
  @ApiResponse({
    status: 200,
    description: "Symbol removed from watchlist successfully",
  })
  @ApiResponse({ status: 404, description: "Watchlist item not found" })
  async removeFromWatchlist(
    @Param("id") id: string,
  ): Promise<{ message: string }> {
    try {
      await this.watchlistService.removeFromWatchlist(id);
      return { message: "Symbol removed from watchlist successfully" };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to remove from watchlist",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put("reorder")
  @ApiOperation({ summary: "Reorder watchlist items" })
  @ApiResponse({ status: 200, description: "Watchlist reordered successfully" })
  async reorderWatchlist(
    @Request() req: any,
    @Body() reorderDto: { itemOrders: { id: string; sortOrder: number }[] },
  ): Promise<{ message: string }> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!Array.isArray(reorderDto.itemOrders)) {
        throw new HttpException(
          "itemOrders array is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.watchlistService.reorderWatchlist(
        userId,
        reorderDto.itemOrders,
      );

      return { message: "Watchlist reordered successfully" };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to reorder watchlist",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("bulk-add")
  @ApiOperation({ summary: "Add multiple symbols to watchlist" })
  @ApiResponse({ status: 201, description: "Symbols added to watchlist" })
  async bulkAddToWatchlist(
    @Request() req: any,
    @Body() bulkAddDto: { symbols: string[] },
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (
        !Array.isArray(bulkAddDto.symbols) ||
        bulkAddDto.symbols.length === 0
      ) {
        throw new HttpException(
          "Symbols array is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (bulkAddDto.symbols.length > 50) {
        throw new HttpException(
          "Maximum 50 symbols allowed per bulk add",
          HttpStatus.BAD_REQUEST,
        );
      }

      const results = await this.watchlistService.bulkAddToWatchlist(
        userId,
        bulkAddDto.symbols,
      );

      const errors = bulkAddDto.symbols.length - results.length;

      return {
        success: results,
        summary: {
          total: bulkAddDto.symbols.length,
          successful: results.length,
          failed: errors,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to bulk add to watchlist",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("import-csv")
  @ApiOperation({ summary: "Import watchlist from CSV data" })
  @ApiResponse({ status: 201, description: "Watchlist imported successfully" })
  async importWatchlistFromCSV(
    @Request() req: any,
    @Body() importDto: { csvData: string },
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!importDto.csvData || typeof importDto.csvData !== "string") {
        throw new HttpException("CSV data is required", HttpStatus.BAD_REQUEST);
      }

      const result = await this.watchlistService.importWatchlistFromCSV(
        userId,
        importDto.csvData,
      );

      return {
        ...result,
        summary: {
          total: result.success.length + result.errors.length,
          successful: result.success.length,
          failed: result.errors.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to import watchlist from CSV",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("export/csv")
  @ApiOperation({ summary: "Export watchlist to CSV format" })
  @ApiResponse({ status: 200, description: "Watchlist exported successfully" })
  async exportWatchlistToCSV(
    @Request() req: any,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException(
          "User authentication required",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const watchlist = await this.watchlistService.getUserWatchlist(userId);

      // Create CSV content
      const headers = [
        "Symbol",
        "Display Name",
        "Notes",
        "Tags",
        "Current Price",
        "Change %",
        "Added At Price",
      ];
      const rows = watchlist.map((item) => [
        item.symbol,
        item.displayName || "",
        item.notes || "",
        item.tags.join(";"),
        item.currentPrice?.toString() || "",
        item.changePercent?.toString() || "",
        item.addedAtPrice?.toString() || "",
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `watchlist_${userId}_${timestamp}.csv`;

      return {
        csv: csvContent,
        filename,
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to export watchlist to CSV",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete("bulk-delete")
  @ApiOperation({ summary: "Remove multiple items from watchlist" })
  @ApiResponse({ status: 200, description: "Items removed from watchlist" })
  async bulkRemoveFromWatchlist(@Body() bulkDeleteDto: { itemIds: string[] }) {
    try {
      if (
        !Array.isArray(bulkDeleteDto.itemIds) ||
        bulkDeleteDto.itemIds.length === 0
      ) {
        throw new HttpException(
          "Item IDs array is required",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (bulkDeleteDto.itemIds.length > 50) {
        throw new HttpException(
          "Maximum 50 items allowed per bulk delete",
          HttpStatus.BAD_REQUEST,
        );
      }

      const results = [];
      const errors = [];

      for (const itemId of bulkDeleteDto.itemIds) {
        try {
          await this.watchlistService.removeFromWatchlist(itemId);
          results.push(itemId);
        } catch (error) {
          errors.push({
            itemId,
            error: error.message,
          });
        }
      }

      return {
        success: results,
        errors,
        summary: {
          total: bulkDeleteDto.itemIds.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || "Failed to bulk remove from watchlist",
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
