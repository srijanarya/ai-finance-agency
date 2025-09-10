import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Position, PositionStatus, PositionType } from '../entities/position.entity';
import { MarketData } from '../entities/market-data.entity';
import {
  CreatePositionDto,
  UpdatePositionDto,
  PositionSearchDto,
  PositionResponseDto,
  PositionListResponseDto,
  PositionAnalyticsDto,
  AddTradeDto,
  AddDividendDto,
} from '../dto/position.dto';

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);

  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(MarketData)
    private marketDataRepository: Repository<MarketData>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {
    this.startPriceUpdateTask();
  }

  async create(
    createPositionDto: CreatePositionDto,
    tenantId: string,
    userId: string,
  ): Promise<PositionResponseDto> {
    try {
      // Check if position already exists
      const existingPosition = await this.positionRepository.findOne({
        where: {
          tenantId,
          userId,
          symbol: createPositionDto.symbol.toUpperCase(),
        },
      });

      if (existingPosition) {
        throw new BadRequestException(`Position for ${createPositionDto.symbol} already exists`);
      }

      const position = this.positionRepository.create({
        ...createPositionDto,
        tenantId,
        userId,
        symbol: createPositionDto.symbol.toUpperCase(),
        totalCost: createPositionDto.quantity * createPositionDto.averageCost,
        marketValue: createPositionDto.currentPrice 
          ? createPositionDto.quantity * createPositionDto.currentPrice
          : createPositionDto.quantity * createPositionDto.averageCost,
        positionType: createPositionDto.quantity >= 0 ? PositionType.LONG : PositionType.SHORT,
        status: PositionStatus.OPEN,
        openedAt: new Date(),
      });

      const savedPosition = await this.positionRepository.save(position);
      this.logger.log(`Created position ${savedPosition.id} for ${savedPosition.symbol}`);
      this.eventEmitter.emit('position.created', savedPosition);

      return this.mapToResponseDto(savedPosition);
    } catch (error) {
      this.logger.error(`Failed to create position: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
    tenantId: string,
    userId: string,
  ): Promise<PositionResponseDto> {
    try {
      const position = await this.positionRepository.findOne({
        where: { id, tenantId, userId },
      });

      if (!position) {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }

      if (updatePositionDto.currentPrice) {
        position.updatePrice(updatePositionDto.currentPrice, position.previousClose);
      }

      if (updatePositionDto.riskMetrics) {
        Object.assign(position, updatePositionDto.riskMetrics);
      }

      // Update other fields
      Object.assign(position, updatePositionDto);

      const updatedPosition = await this.positionRepository.save(position);
      this.logger.log(`Updated position ${id}`);
      this.eventEmitter.emit('position.updated', updatedPosition);

      return this.mapToResponseDto(updatedPosition);
    } catch (error) {
      this.logger.error(`Failed to update position ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async addTrade(
    id: string,
    addTradeDto: AddTradeDto,
    tenantId: string,
    userId: string,
  ): Promise<PositionResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const position = await queryRunner.manager.findOne(Position, {
        where: { id, tenantId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!position) {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }

      const tradeDate = addTradeDto.tradeDate || new Date();
      position.addTrade(
        Math.abs(addTradeDto.quantity),
        addTradeDto.price,
        addTradeDto.isBuy ?? addTradeDto.quantity > 0,
        tradeDate,
      );

      const updatedPosition = await queryRunner.manager.save(Position, position);
      await queryRunner.commitTransaction();

      this.logger.log(`Added trade to position ${id}: ${addTradeDto.quantity} @ ${addTradeDto.price}`);
      this.eventEmitter.emit('position.trade-added', { position: updatedPosition, trade: addTradeDto });

      return this.mapToResponseDto(updatedPosition);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to add trade to position ${id}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addDividend(
    id: string,
    dividendDto: AddDividendDto,
    tenantId: string,
    userId: string,
  ): Promise<PositionResponseDto> {
    try {
      const position = await this.positionRepository.findOne({
        where: { id, tenantId, userId },
      });

      if (!position) {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }

      const totalDividend = dividendDto.amount * Math.abs(position.quantity);
      position.addDividend(totalDividend, dividendDto.paymentDate);

      const updatedPosition = await this.positionRepository.save(position);
      this.logger.log(`Added dividend to position ${id}: $${totalDividend}`);
      this.eventEmitter.emit('position.dividend-added', { position: updatedPosition, dividend: dividendDto });

      return this.mapToResponseDto(updatedPosition);
    } catch (error) {
      this.logger.error(`Failed to add dividend to position ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async close(
    id: string,
    reason: string,
    tenantId: string,
    userId: string,
  ): Promise<PositionResponseDto> {
    try {
      const position = await this.positionRepository.findOne({
        where: { id, tenantId, userId },
      });

      if (!position) {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }

      position.close(reason);
      const closedPosition = await this.positionRepository.save(position);

      this.logger.log(`Closed position ${id}: ${reason}`);
      this.eventEmitter.emit('position.closed', closedPosition);

      return this.mapToResponseDto(closedPosition);
    } catch (error) {
      this.logger.error(`Failed to close position ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(
    id: string,
    tenantId: string,
    userId?: string,
  ): Promise<PositionResponseDto> {
    try {
      const whereCondition: any = { id, tenantId };
      if (userId) {
        whereCondition.userId = userId;
      }

      const position = await this.positionRepository.findOne({
        where: whereCondition,
      });

      if (!position) {
        throw new NotFoundException(`Position with ID ${id} not found`);
      }

      return this.mapToResponseDto(position);
    } catch (error) {
      this.logger.error(`Failed to find position ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async search(
    searchDto: PositionSearchDto,
    tenantId: string,
    userId?: string,
  ): Promise<PositionListResponseDto> {
    try {
      const {
        symbol,
        portfolioId,
        accountId,
        positionType,
        status,
        instrumentType,
        sector,
        assetClass,
        minQuantity,
        maxQuantity,
        minMarketValue,
        maxMarketValue,
        minPnl,
        maxPnl,
        profitableOnly,
        losersOnly,
        openedAfter,
        openedBefore,
        page = 1,
        limit = 20,
        sortBy = 'lastUpdated',
        sortOrder = 'desc',
      } = searchDto;

      const queryBuilder = this.positionRepository.createQueryBuilder('position');
      queryBuilder.where('position.tenantId = :tenantId', { tenantId });

      if (userId) {
        queryBuilder.andWhere('position.userId = :userId', { userId });
      }

      // Apply filters
      if (symbol) {
        queryBuilder.andWhere('position.symbol = :symbol', { symbol: symbol.toUpperCase() });
      }

      if (portfolioId) {
        queryBuilder.andWhere('position.portfolioId = :portfolioId', { portfolioId });
      }

      if (accountId) {
        queryBuilder.andWhere('position.accountId = :accountId', { accountId });
      }

      if (positionType) {
        queryBuilder.andWhere('position.positionType = :positionType', { positionType });
      }

      if (status) {
        queryBuilder.andWhere('position.status = :status', { status });
      }

      if (instrumentType) {
        queryBuilder.andWhere('position.instrumentType = :instrumentType', { instrumentType });
      }

      if (sector) {
        queryBuilder.andWhere('position.sector = :sector', { sector });
      }

      if (assetClass) {
        queryBuilder.andWhere('position.assetClass = :assetClass', { assetClass });
      }

      if (minQuantity !== undefined) {
        queryBuilder.andWhere('ABS(position.quantity) >= :minQuantity', { minQuantity });
      }

      if (maxQuantity !== undefined) {
        queryBuilder.andWhere('ABS(position.quantity) <= :maxQuantity', { maxQuantity });
      }

      if (minMarketValue !== undefined) {
        queryBuilder.andWhere('ABS(position.marketValue) >= :minMarketValue', { minMarketValue });
      }

      if (maxMarketValue !== undefined) {
        queryBuilder.andWhere('ABS(position.marketValue) <= :maxMarketValue', { maxMarketValue });
      }

      if (minPnl !== undefined) {
        queryBuilder.andWhere('position.totalPnl >= :minPnl', { minPnl });
      }

      if (maxPnl !== undefined) {
        queryBuilder.andWhere('position.totalPnl <= :maxPnl', { maxPnl });
      }

      if (profitableOnly) {
        queryBuilder.andWhere('position.totalPnl > 0');
      }

      if (losersOnly) {
        queryBuilder.andWhere('position.totalPnl < 0');
      }

      if (openedAfter) {
        queryBuilder.andWhere('position.openedAt >= :openedAfter', { openedAfter });
      }

      if (openedBefore) {
        queryBuilder.andWhere('position.openedAt <= :openedBefore', { openedBefore });
      }

      // Apply sorting
      const validSortFields = ['lastUpdated', 'openedAt', 'closedAt', 'quantity', 'marketValue', 'totalPnl', 'unrealizedPnl', 'symbol'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastUpdated';
      queryBuilder.orderBy(`position.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      const [positions, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      // Calculate summary statistics
      const summary = this.calculateSummary(positions);

      return {
        positions: positions.map(position => this.mapToResponseDto(position)),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        summary,
      };
    } catch (error) {
      this.logger.error(`Failed to search positions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPortfolioPositions(
    portfolioId: string,
    tenantId: string,
    includeZero: boolean = false,
  ): Promise<PositionResponseDto[]> {
    try {
      const queryBuilder = this.positionRepository.createQueryBuilder('position');
      queryBuilder.where('position.tenantId = :tenantId', { tenantId });
      queryBuilder.andWhere('position.portfolioId = :portfolioId', { portfolioId });

      if (!includeZero) {
        queryBuilder.andWhere('position.quantity != 0');
      }

      queryBuilder.orderBy('position.marketValue', 'DESC');

      const positions = await queryBuilder.getMany();
      return positions.map(position => this.mapToResponseDto(position));
    } catch (error) {
      this.logger.error(`Failed to get portfolio positions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserPositions(
    userId: string,
    tenantId: string,
    includeZero: boolean = false,
  ): Promise<PositionResponseDto[]> {
    try {
      const queryBuilder = this.positionRepository.createQueryBuilder('position');
      queryBuilder.where('position.tenantId = :tenantId', { tenantId });
      queryBuilder.andWhere('position.userId = :userId', { userId });

      if (!includeZero) {
        queryBuilder.andWhere('position.quantity != 0');
      }

      queryBuilder.orderBy('position.marketValue', 'DESC');

      const positions = await queryBuilder.getMany();
      return positions.map(position => this.mapToResponseDto(position));
    } catch (error) {
      this.logger.error(`Failed to get user positions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPositionBySymbol(
    symbol: string,
    tenantId: string,
    userId: string,
  ): Promise<PositionResponseDto | null> {
    try {
      const position = await this.positionRepository.findOne({
        where: {
          symbol: symbol.toUpperCase(),
          tenantId,
          userId,
        },
      });

      return position ? this.mapToResponseDto(position) : null;
    } catch (error) {
      this.logger.error(`Failed to get position by symbol: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAnalytics(
    tenantId: string,
    userId?: string,
    portfolioId?: string,
  ): Promise<PositionAnalyticsDto> {
    try {
      const queryBuilder = this.positionRepository.createQueryBuilder('position');
      queryBuilder.where('position.tenantId = :tenantId', { tenantId });

      if (userId) {
        queryBuilder.andWhere('position.userId = :userId', { userId });
      }

      if (portfolioId) {
        queryBuilder.andWhere('position.portfolioId = :portfolioId', { portfolioId });
      }

      // Only include positions with quantity > 0
      queryBuilder.andWhere('position.quantity != 0');

      const positions = await queryBuilder.getMany();

      return this.calculateAnalytics(positions);
    } catch (error) {
      this.logger.error(`Failed to get position analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updatePrices(tenantId: string, priceUpdates: Array<{ symbol: string; price: number; previousClose?: number }>): Promise<number> {
    try {
      let updatedCount = 0;

      for (const update of priceUpdates) {
        const positions = await this.positionRepository.find({
          where: {
            symbol: update.symbol.toUpperCase(),
            tenantId,
            quantity: {  } as any, // Positions with non-zero quantity
          },
        });

        for (const position of positions) {
          position.updatePrice(update.price, update.previousClose);
          await this.positionRepository.save(position);
          updatedCount++;
        }
      }

      this.logger.log(`Updated prices for ${updatedCount} positions`);
      return updatedCount;
    } catch (error) {
      this.logger.error(`Failed to update prices: ${error.message}`, error.stack);
      throw error;
    }
  }

  private calculateSummary(positions: Position[]) {
    const totalPositions = positions.length;
    const totalMarketValue = positions.reduce((sum, pos) => sum + Math.abs(pos.marketValue || 0), 0);
    const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
    const totalRealizedPnl = positions.reduce((sum, pos) => sum + pos.realizedPnl, 0);
    const totalPnl = positions.reduce((sum, pos) => sum + pos.totalPnl, 0);
    const totalDayPnl = positions.reduce((sum, pos) => sum + pos.dayPnl, 0);
    const averageWeight = totalPositions > 0 ? positions.reduce((sum, pos) => sum + pos.weight, 0) / totalPositions : 0;

    const profitablePositions = positions.filter(pos => pos.totalPnl > 0).length;
    const losingPositions = positions.filter(pos => pos.totalPnl < 0).length;

    const topPerformers = positions
      .filter(pos => pos.totalPnl > 0)
      .sort((a, b) => b.totalReturnPercent - a.totalReturnPercent)
      .slice(0, 5)
      .map(pos => ({
        symbol: pos.symbol,
        pnlPercent: pos.totalReturnPercent,
        marketValue: Math.abs(pos.marketValue || 0),
      }));

    const worstPerformers = positions
      .filter(pos => pos.totalPnl < 0)
      .sort((a, b) => a.totalReturnPercent - b.totalReturnPercent)
      .slice(0, 5)
      .map(pos => ({
        symbol: pos.symbol,
        pnlPercent: pos.totalReturnPercent,
        marketValue: Math.abs(pos.marketValue || 0),
      }));

    return {
      totalPositions,
      totalMarketValue,
      totalUnrealizedPnl,
      totalRealizedPnl,
      totalPnl,
      totalDayPnl,
      averageWeight,
      profitablePositions,
      losingPositions,
      topPerformers,
      worstPerformers,
    };
  }

  private calculateAnalytics(positions: Position[]): PositionAnalyticsDto {
    const totalPositions = positions.length;
    const totalMarketValue = positions.reduce((sum, pos) => sum + Math.abs(pos.marketValue || 0), 0);
    const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
    const totalRealizedPnl = positions.reduce((sum, pos) => sum + pos.realizedPnl, 0);
    const totalPnl = totalUnrealizedPnl + totalRealizedPnl;
    const totalDayPnl = positions.reduce((sum, pos) => sum + pos.dayPnl, 0);
    const totalCost = positions.reduce((sum, pos) => sum + Math.abs(pos.totalCost), 0);

    const totalReturnPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const dayReturnPercent = totalMarketValue > 0 ? (totalDayPnl / totalMarketValue) * 100 : 0;

    const profitablePositions = positions.filter(pos => pos.totalPnl > 0).length;
    const losingPositions = positions.filter(pos => pos.totalPnl < 0).length;
    const winRate = totalPositions > 0 ? (profitablePositions / totalPositions) * 100 : 0;

    const averageHoldingPeriod = totalPositions > 0 
      ? positions.reduce((sum, pos) => sum + pos.holdingPeriodDays, 0) / totalPositions
      : 0;

    // Calculate concentration (largest position as % of portfolio)
    const largestPosition = Math.max(...positions.map(pos => Math.abs(pos.marketValue || 0)));
    const concentration = totalMarketValue > 0 ? (largestPosition / totalMarketValue) * 100 : 0;

    // Sector allocation
    const sectorAllocation = this.calculateAllocation(positions, 'sector');
    const assetClassAllocation = this.calculateAllocation(positions, 'assetClass');

    // Top holdings
    const topHoldings = positions
      .sort((a, b) => Math.abs(b.marketValue || 0) - Math.abs(a.marketValue || 0))
      .slice(0, 10)
      .map(pos => ({
        symbol: pos.symbol,
        marketValue: Math.abs(pos.marketValue || 0),
        weight: totalMarketValue > 0 ? (Math.abs(pos.marketValue || 0) / totalMarketValue) * 100 : 0,
        pnl: pos.totalPnl,
        pnlPercent: pos.totalReturnPercent,
      }));

    // Rebalancing candidates
    const rebalancingCandidates = positions
      .filter(pos => pos.needsRebalancing())
      .map(pos => ({
        symbol: pos.symbol,
        currentWeight: pos.weight,
        targetWeight: pos.targetWeight || 0,
        deviation: pos.weightDeviation,
        marketValue: Math.abs(pos.marketValue || 0),
      }));

    // Basic risk metrics
    const portfolioBeta = this.calculatePortfolioBeta(positions);
    const portfolioVolatility = this.calculatePortfolioVolatility(positions);

    return {
      totalPositions,
      totalMarketValue,
      totalUnrealizedPnl,
      totalRealizedPnl,
      totalPnl,
      totalDayPnl,
      totalReturnPercent,
      dayReturnPercent,
      profitablePositions,
      losingPositions,
      winRate,
      averageHoldingPeriod,
      concentration,
      sectorAllocation,
      assetClassAllocation,
      topHoldings,
      rebalancingCandidates,
      riskMetrics: {
        portfolioBeta,
        portfolioVolatility,
        portfolioVaR: 0, // Would require historical data
        diversificationRatio: 0, // Would require correlation matrix
      },
    };
  }

  private calculateAllocation(positions: Position[], field: 'sector' | 'assetClass') {
    const allocation: Record<string, any> = {};
    const totalValue = positions.reduce((sum, pos) => sum + Math.abs(pos.marketValue || 0), 0);

    positions.forEach(pos => {
      const key = pos[field] || 'Unknown';
      if (!allocation[key]) {
        allocation[key] = {
          count: 0,
          marketValue: 0,
          weight: 0,
          pnl: 0,
        };
      }
      allocation[key].count++;
      allocation[key].marketValue += Math.abs(pos.marketValue || 0);
      allocation[key].pnl += pos.totalPnl;
    });

    // Calculate weights
    Object.values(allocation).forEach((item: any) => {
      item.weight = totalValue > 0 ? (item.marketValue / totalValue) * 100 : 0;
    });

    return allocation;
  }

  private calculatePortfolioBeta(positions: Position[]): number {
    const validBetas = positions.filter(pos => pos.beta !== null && pos.beta !== undefined);
    if (validBetas.length === 0) return 1.0;

    const totalValue = validBetas.reduce((sum, pos) => sum + Math.abs(pos.marketValue || 0), 0);
    if (totalValue === 0) return 1.0;

    return validBetas.reduce((sum, pos) => {
      const weight = Math.abs(pos.marketValue || 0) / totalValue;
      return sum + (pos.beta! * weight);
    }, 0);
  }

  private calculatePortfolioVolatility(positions: Position[]): number {
    const validVolatilities = positions.filter(pos => pos.volatility !== null && pos.volatility !== undefined);
    if (validVolatilities.length === 0) return 0;

    const totalValue = validVolatilities.reduce((sum, pos) => sum + Math.abs(pos.marketValue || 0), 0);
    if (totalValue === 0) return 0;

    // Simplified portfolio volatility (would need correlation matrix for accurate calculation)
    return validVolatilities.reduce((sum, pos) => {
      const weight = Math.abs(pos.marketValue || 0) / totalValue;
      return sum + (pos.volatility! * weight);
    }, 0);
  }

  private mapToResponseDto(position: Position): PositionResponseDto {
    return {
      ...position,
      isLong: position.isLong,
      isShort: position.isShort,
      isOpen: position.isOpen,
      isClosed: position.isClosed,
      notionalValue: position.notionalValue,
      effectiveMarketValue: position.effectiveMarketValue,
      breakEvenPrice: position.breakEvenPrice,
      holdingPeriodDays: position.holdingPeriodDays,
      averageCostPerShare: position.averageCostPerShare,
      totalReturnPercent: position.totalReturnPercent,
    };
  }

  private startPriceUpdateTask(): void {
    // Update positions with latest market prices every minute
    setInterval(async () => {
      try {
        await this.updateAllPositionPrices();
      } catch (error) {
        this.logger.error(`Price update task failed: ${error.message}`);
      }
    }, 60 * 1000); // Every minute
  }

  private async updateAllPositionPrices(): Promise<void> {
    try {
      // Get unique symbols from active positions
      const uniqueSymbols = await this.positionRepository
        .createQueryBuilder('position')
        .select('DISTINCT position.symbol', 'symbol')
        .where('position.quantity != 0')
        .getRawMany();

      if (uniqueSymbols.length === 0) return;

      const symbols = uniqueSymbols.map(row => row.symbol);

      // Get latest market data for these symbols
      const marketDataUpdates = await this.marketDataRepository
        .createQueryBuilder('md')
        .where('md.symbol IN (:...symbols)', { symbols })
        .andWhere('md.dataType = :dataType', { dataType: 'quote' })
        .andWhere('md.isStale = false')
        .orderBy('md.timestamp', 'DESC')
        .getMany();

      // Group by symbol and get latest for each
      const latestPrices: Record<string, { price: number; previousClose?: number }> = {};
      marketDataUpdates.forEach(md => {
        if (!latestPrices[md.symbol] && md.lastPrice) {
          latestPrices[md.symbol] = {
            price: md.lastPrice,
            previousClose: md.previousClose,
          };
        }
      });

      // Update positions
      for (const [symbol, priceData] of Object.entries(latestPrices)) {
        const positions = await this.positionRepository.find({
          where: { symbol, quantity: {  } as any }, // Non-zero quantity
        });

        for (const position of positions) {
          const oldPrice = position.currentPrice;
          position.updatePrice(priceData.price, priceData.previousClose);
          
          if (oldPrice !== priceData.price) {
            await this.positionRepository.save(position);
            this.eventEmitter.emit('position.price-updated', {
              position,
              oldPrice,
              newPrice: priceData.price,
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update position prices: ${error.message}`, error.stack);
    }
  }
}