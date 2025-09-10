import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource, Between, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, OrderStatus, OrderType, OrderSide, TimeInForce } from '../entities/order.entity';
import { Trade, TradeType, TradeStatus } from '../entities/trade.entity';
import { Position } from '../entities/position.entity';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderSearchDto,
  OrderResponseDto,
  OrderListResponseDto,
  BulkOrderDto,
  BulkOrderResponseDto,
  CancelOrderDto,
  OrderFillDto,
} from '../dto/order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    tenantId: string,
    userId: string,
  ): Promise<OrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate order
      this.validateOrder(createOrderDto);

      // Check trading permissions and risk limits
      await this.checkTradingPermissions(tenantId, userId, createOrderDto);

      const order = queryRunner.manager.create(Order, {
        ...createOrderDto,
        tenantId,
        userId,
        status: OrderStatus.PENDING,
        executedQuantity: 0,
        remainingQuantity: createOrderDto.quantity,
        fillCount: 0,
        retryCount: 0,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);
      await queryRunner.commitTransaction();

      this.logger.log(`Created order ${savedOrder.id} for user ${userId}`);
      this.eventEmitter.emit('order.created', savedOrder);

      return this.mapToResponseDto(savedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createBulk(
    bulkOrderDto: BulkOrderDto,
    tenantId: string,
    userId: string,
  ): Promise<BulkOrderResponseDto> {
    const { orders, atomic = false, validate = true, maxNotionalValue } = bulkOrderDto;
    const success: OrderResponseDto[] = [];
    const errors: Array<{ order: CreateOrderDto; error: string; index: number }> = [];
    let totalNotionalValue = 0;

    if (orders.length === 0) {
      throw new BadRequestException('At least one order is required');
    }

    if (orders.length > 100) {
      throw new BadRequestException('Maximum 100 orders allowed per bulk request');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    if (atomic) {
      await queryRunner.startTransaction();
    }

    try {
      for (let i = 0; i < orders.length; i++) {
        const orderDto = orders[i];

        try {
          if (validate) {
            this.validateOrder(orderDto);
            await this.checkTradingPermissions(tenantId, userId, orderDto);
          }

          // Calculate notional value
          const notional = this.calculateNotionalValue(orderDto);
          totalNotionalValue += notional;

          if (maxNotionalValue && totalNotionalValue > maxNotionalValue) {
            throw new BadRequestException(`Total notional value exceeds limit of ${maxNotionalValue}`);
          }

          const order = queryRunner.manager.create(Order, {
            ...orderDto,
            tenantId,
            userId,
            status: OrderStatus.PENDING,
            executedQuantity: 0,
            remainingQuantity: orderDto.quantity,
            fillCount: 0,
            retryCount: 0,
          });

          const savedOrder = await queryRunner.manager.save(Order, order);
          success.push(this.mapToResponseDto(savedOrder));
          
          this.eventEmitter.emit('order.created', savedOrder);
        } catch (error) {
          errors.push({
            order: orderDto,
            error: error.message,
            index: i,
          });

          if (atomic) {
            throw error; // This will cause the entire transaction to rollback
          }
        }
      }

      if (atomic) {
        await queryRunner.commitTransaction();
      }

      this.logger.log(`Bulk order creation completed: ${success.length} success, ${errors.length} errors`);

      return {
        success,
        errors,
        totalProcessed: orders.length,
        successCount: success.length,
        errorCount: errors.length,
        atomic,
        totalNotionalValue,
      };
    } catch (error) {
      if (atomic) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error(`Bulk order creation failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    tenantId: string,
    userId: string,
  ): Promise<OrderResponseDto> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id, tenantId, userId },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (order.isComplete) {
        throw new BadRequestException('Cannot update completed order');
      }

      // Validate updates
      if (updateOrderDto.quantity && updateOrderDto.quantity < order.executedQuantity) {
        throw new BadRequestException('New quantity cannot be less than executed quantity');
      }

      Object.assign(order, updateOrderDto);

      if (updateOrderDto.quantity) {
        order.remainingQuantity = updateOrderDto.quantity - order.executedQuantity;
      }

      const updatedOrder = await this.orderRepository.save(order);
      this.logger.log(`Updated order ${id}`);
      this.eventEmitter.emit('order.updated', updatedOrder);

      return this.mapToResponseDto(updatedOrder);
    } catch (error) {
      this.logger.error(`Failed to update order ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async cancel(
    id: string,
    cancelOrderDto: CancelOrderDto,
    tenantId: string,
    userId: string,
  ): Promise<OrderResponseDto> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id, tenantId, userId },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (order.isComplete) {
        throw new BadRequestException('Order is already complete');
      }

      if (order.status === OrderStatus.PARTIALLY_FILLED && !cancelOrderDto.force) {
        throw new BadRequestException('Order is partially filled. Use force=true to cancel');
      }

      order.cancel(cancelOrderDto.reason);
      const cancelledOrder = await this.orderRepository.save(order);

      this.logger.log(`Cancelled order ${id}${cancelOrderDto.reason ? `: ${cancelOrderDto.reason}` : ''}`);
      this.eventEmitter.emit('order.cancelled', cancelledOrder);

      return this.mapToResponseDto(cancelledOrder);
    } catch (error) {
      this.logger.error(`Failed to cancel order ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async fill(
    id: string,
    fillDto: OrderFillDto,
    tenantId: string,
  ): Promise<OrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id, tenantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      if (!order.isActive) {
        throw new BadRequestException('Order is not active');
      }

      if (fillDto.quantity > order.remainingQuantity) {
        throw new BadRequestException('Fill quantity exceeds remaining quantity');
      }

      // Create trade record
      const trade = queryRunner.manager.create(Trade, {
        tenantId: order.tenantId,
        userId: order.userId,
        orderId: order.id,
        symbol: order.symbol,
        type: order.side === OrderSide.BUY ? TradeType.BUY : TradeType.SELL,
        quantity: fillDto.quantity,
        price: fillDto.price,
        grossValue: fillDto.quantity * fillDto.price,
        netValue: fillDto.quantity * fillDto.price,
        status: TradeStatus.CONFIRMED,
        venue: fillDto.venue,
        contraParty: fillDto.contraParty,
        commission: fillDto.commission || 0,
        fees: fillDto.fees || 0,
        tradeId: fillDto.tradeId,
        executedAt: fillDto.timestamp || new Date(),
        tradeDate: new Date(),
        tradeTime: new Date().toTimeString().split(' ')[0],
      });

      const savedTrade = await queryRunner.manager.save(Trade, trade);

      // Update order
      order.fill(fillDto.quantity, fillDto.price);
      if (fillDto.commission) order.commission = (order.commission || 0) + fillDto.commission;
      if (fillDto.fees) order.fees = (order.fees || 0) + fillDto.fees;
      order.calculateCosts();

      const updatedOrder = await queryRunner.manager.save(Order, order);

      // Update or create position
      await this.updatePosition(
        queryRunner,
        order.tenantId,
        order.userId,
        order.symbol,
        order.side === OrderSide.BUY ? fillDto.quantity : -fillDto.quantity,
        fillDto.price,
        savedTrade.executedAt,
      );

      await queryRunner.commitTransaction();

      this.logger.log(`Filled order ${id}: ${fillDto.quantity} @ ${fillDto.price}`);
      this.eventEmitter.emit('order.filled', { order: updatedOrder, trade: savedTrade });

      return this.mapToResponseDto(updatedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to fill order ${id}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string, tenantId: string, userId?: string): Promise<OrderResponseDto> {
    try {
      const whereCondition: any = { id, tenantId };
      if (userId) {
        whereCondition.userId = userId;
      }

      const order = await this.orderRepository.findOne({
        where: whereCondition,
        relations: ['trades'],
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return this.mapToResponseDto(order);
    } catch (error) {
      this.logger.error(`Failed to find order ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async search(
    searchDto: OrderSearchDto,
    tenantId: string,
    userId?: string,
  ): Promise<OrderListResponseDto> {
    try {
      const {
        symbol,
        side,
        orderType,
        status,
        clientOrderId,
        startDate,
        endDate,
        minQuantity,
        maxQuantity,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = searchDto;

      const queryBuilder = this.orderRepository.createQueryBuilder('order');
      queryBuilder.where('order.tenantId = :tenantId', { tenantId });

      if (userId) {
        queryBuilder.andWhere('order.userId = :userId', { userId });
      }

      // Apply filters
      if (symbol) {
        queryBuilder.andWhere('order.symbol = :symbol', { symbol });
      }

      if (side) {
        queryBuilder.andWhere('order.side = :side', { side });
      }

      if (orderType) {
        queryBuilder.andWhere('order.orderType = :orderType', { orderType });
      }

      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }

      if (clientOrderId) {
        queryBuilder.andWhere('order.clientOrderId = :clientOrderId', { clientOrderId });
      }

      if (startDate) {
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
      }

      if (minQuantity !== undefined) {
        queryBuilder.andWhere('order.quantity >= :minQuantity', { minQuantity });
      }

      if (maxQuantity !== undefined) {
        queryBuilder.andWhere('order.quantity <= :maxQuantity', { maxQuantity });
      }

      if (minPrice !== undefined) {
        queryBuilder.andWhere('order.price >= :minPrice', { minPrice });
      }

      if (maxPrice !== undefined) {
        queryBuilder.andWhere('order.price <= :maxPrice', { maxPrice });
      }

      // Apply sorting
      const validSortFields = ['createdAt', 'updatedAt', 'submittedAt', 'executedAt', 'quantity', 'price', 'status'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      queryBuilder.orderBy(`order.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

      // Apply pagination
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      const [orders, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);

      return {
        orders: orders.map(order => this.mapToResponseDto(order)),
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error) {
      this.logger.error(`Failed to search orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserOrders(
    userId: string,
    tenantId: string,
    limit: number = 20,
  ): Promise<OrderResponseDto[]> {
    try {
      const orders = await this.orderRepository.find({
        where: { userId, tenantId },
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return orders.map(order => this.mapToResponseDto(order));
    } catch (error) {
      this.logger.error(`Failed to get user orders: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getOrdersByStatus(
    status: OrderStatus,
    tenantId: string,
    limit: number = 100,
  ): Promise<OrderResponseDto[]> {
    try {
      const orders = await this.orderRepository.find({
        where: { status, tenantId },
        order: { createdAt: 'ASC' },
        take: limit,
      });

      return orders.map(order => this.mapToResponseDto(order));
    } catch (error) {
      this.logger.error(`Failed to get orders by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateOrder(orderDto: CreateOrderDto): void {
    // Validate required fields based on order type
    switch (orderDto.orderType) {
      case OrderType.LIMIT:
      case OrderType.STOP_LIMIT:
        if (!orderDto.price) {
          throw new BadRequestException(`${orderDto.orderType} orders require a price`);
        }
        break;
      case OrderType.STOP:
      case OrderType.TRAILING_STOP:
        if (!orderDto.stopPrice) {
          throw new BadRequestException(`${orderDto.orderType} orders require a stop price`);
        }
        break;
    }

    // Validate GTD orders
    if (orderDto.timeInForce === TimeInForce.GTD && !orderDto.goodTillDate) {
      throw new BadRequestException('GTD orders require a good till date');
    }

    // Validate quantity
    if (orderDto.quantity <= 0) {
      throw new BadRequestException('Order quantity must be positive');
    }

    // Validate prices
    if (orderDto.price && orderDto.price <= 0) {
      throw new BadRequestException('Order price must be positive');
    }

    if (orderDto.stopPrice && orderDto.stopPrice <= 0) {
      throw new BadRequestException('Stop price must be positive');
    }

    if (orderDto.limitPrice && orderDto.limitPrice <= 0) {
      throw new BadRequestException('Limit price must be positive');
    }
  }

  private async checkTradingPermissions(
    tenantId: string,
    userId: string,
    orderDto: CreateOrderDto,
  ): Promise<void> {
    // TODO: Implement comprehensive trading permissions check
    // This should check:
    // - User's trading permissions
    // - Symbol restrictions
    // - Position limits
    // - Risk limits
    // - Account status
    // - Market hours
    // - Minimum order sizes
    // - Maximum order sizes per user/tenant

    // Placeholder implementation
    const notionalValue = this.calculateNotionalValue(orderDto);
    const maxOrderValue = 1000000; // $1M limit

    if (notionalValue > maxOrderValue) {
      throw new ForbiddenException(`Order value ${notionalValue} exceeds maximum allowed ${maxOrderValue}`);
    }
  }

  private calculateNotionalValue(orderDto: CreateOrderDto): number {
    if (orderDto.orderType === OrderType.MARKET) {
      // For market orders, we need to estimate based on current market price
      // In a real implementation, you'd get the current market price
      return orderDto.quantity * 100; // Placeholder calculation
    }

    const price = orderDto.price || orderDto.limitPrice || orderDto.stopPrice || 0;
    return orderDto.quantity * price;
  }

  private async updatePosition(
    queryRunner: QueryRunner,
    tenantId: string,
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    tradeDate: Date,
  ): Promise<void> {
    try {
      let position = await queryRunner.manager.findOne(Position, {
        where: { tenantId, userId, symbol },
        lock: { mode: 'pessimistic_write' },
      });

      if (!position) {
        // Create new position
        position = queryRunner.manager.create(Position, Position.create(
          tenantId,
          userId,
          symbol,
          quantity,
          price,
        ));
      } else {
        // Update existing position
        position.addTrade(Math.abs(quantity), price, quantity > 0, tradeDate);
      }

      await queryRunner.manager.save(Position, position);
      this.eventEmitter.emit('position.updated', position);
    } catch (error) {
      this.logger.error(`Failed to update position: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToResponseDto(order: Order): OrderResponseDto {
    return {
      ...order,
      fillRate: order.fillRate,
      isComplete: order.isComplete,
      isActive: order.isActive,
      totalTransactionCost: order.totalTransactionCost,
    };
  }
}