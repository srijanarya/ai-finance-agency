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
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { OrderService } from '../services/order.service';
import { CurrentUserDto } from '../dto/auth.dto';
import { OrderStatus } from '../entities/order.entity';
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

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(createOrderDto, user.tenantId, user.id);
  }

  @Post('bulk')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Create multiple orders in bulk' })
  @ApiResponse({ status: 201, type: BulkOrderResponseDto })
  async createBulk(
    @Body() bulkOrderDto: BulkOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<BulkOrderResponseDto> {
    return this.orderService.createBulk(bulkOrderDto, user.tenantId, user.id);
  }

  @Get('search')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Search orders with filters' })
  @ApiResponse({ status: 200, type: OrderListResponseDto })
  async search(
    @Query() searchDto: OrderSearchDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderListResponseDto> {
    // Regular users can only see their own orders, admins can see all
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    return this.orderService.search(searchDto, user.tenantId, userId);
  }

  @Get('my-orders')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of orders to return' })
  async getMyOrders(
    @Query('limit') limit: number = 20,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto[]> {
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    return this.orderService.getUserOrders(user.id, user.tenantId, limit);
  }

  @Get('status/:status')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get orders by status' })
  @ApiResponse({ status: 200, type: [OrderResponseDto] })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of orders to return' })
  async getOrdersByStatus(
    @Param('status') status: OrderStatus,
    @Query('limit') limit: number = 100,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto[]> {
    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    if (limit < 1 || limit > 1000) {
      throw new BadRequestException('Limit must be between 1 and 1000');
    }

    return this.orderService.getOrdersByStatus(status, user.tenantId, limit);
  }

  @Get(':id')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'analyst', 'admin')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto> {
    // Regular users can only see their own orders, admins can see all
    const userId = user.roles?.includes('admin') ? undefined : user.id;
    return this.orderService.findOne(id, user.tenantId, userId);
  }

  @Put(':id')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.update(id, updateOrderDto, user.tenantId, user.id);
  }

  @Put(':id/cancel')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async cancel(
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.cancel(id, cancelOrderDto, user.tenantId, user.id);
  }

  @Post(':id/fill')
  @Roles('admin', 'system', 'market_maker')
  @ApiOperation({ summary: 'Fill order (system/admin only)' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async fill(
    @Param('id') id: string,
    @Body() fillDto: OrderFillDto,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.fill(id, fillDto, user.tenantId);
  }

  // Statistics and analytics endpoints
  @Get('analytics/summary')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get order analytics summary' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (1d, 7d, 30d, 90d, 1y)' })
  async getOrderSummary(
    @Query('period') period: string = '30d',
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{
    totalOrders: number;
    totalVolume: number;
    totalValue: number;
    averageOrderSize: number;
    fillRate: number;
    ordersByStatus: Record<string, number>;
    ordersByType: Record<string, number>;
    topSymbols: Array<{
      symbol: string;
      orderCount: number;
      volume: number;
      value: number;
    }>;
    dailyActivity: Array<{
      date: string;
      orderCount: number;
      volume: number;
      value: number;
    }>;
  }> {
    // This would typically be implemented with more sophisticated analytics
    // For now, return a placeholder structure
    const startDate = this.getPeriodStartDate(period);
    
    const searchDto: OrderSearchDto = {
      startDate,
      page: 1,
      limit: 1000,
    };

    const result = await this.orderService.search(searchDto, user.tenantId, user.id);
    
    // Calculate summary statistics
    const orders = result.orders;
    const totalOrders = orders.length;
    const totalVolume = orders.reduce((sum, order) => sum + order.executedQuantity, 0);
    const totalValue = orders.reduce((sum, order) => sum + (order.executedValue || 0), 0);
    const fillRate = totalOrders > 0 ? (orders.filter(o => o.isComplete).length / totalOrders) * 100 : 0;

    // Group by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by type
    const ordersByType = orders.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top symbols
    const symbolStats = orders.reduce((acc, order) => {
      if (!acc[order.symbol]) {
        acc[order.symbol] = { symbol: order.symbol, orderCount: 0, volume: 0, value: 0 };
      }
      acc[order.symbol].orderCount++;
      acc[order.symbol].volume += order.executedQuantity;
      acc[order.symbol].value += order.executedValue || 0;
      return acc;
    }, {} as Record<string, any>);

    const topSymbols = Object.values(symbolStats)
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10);

    // Daily activity (simplified)
    const dailyActivity = this.calculateDailyActivity(orders, startDate);

    return {
      totalOrders,
      totalVolume,
      totalValue,
      averageOrderSize: totalOrders > 0 ? totalVolume / totalOrders : 0,
      fillRate,
      ordersByStatus,
      ordersByType,
      topSymbols,
      dailyActivity,
    };
  }

  @Get('analytics/performance')
  @Roles('trader', 'institutional_trader', 'portfolio_manager', 'admin')
  @ApiOperation({ summary: 'Get order execution performance metrics' })
  @ApiResponse({ status: 200 })
  @ApiQuery({ name: 'period', required: false, description: 'Time period (1d, 7d, 30d, 90d, 1y)' })
  async getExecutionPerformance(
    @Query('period') period: string = '30d',
    @CurrentUser() user: CurrentUserDto,
  ): Promise<{
    averageFillTime: number; // in seconds
    averageFillRate: number; // percentage
    totalCommissions: number;
    totalFees: number;
    executionQuality: {
      averageSlippage: number;
      priceImprovement: number;
      marketImpact: number;
    };
    venueBreakdown: Record<string, {
      orderCount: number;
      volume: number;
      averagePrice: number;
      fillRate: number;
    }>;
  }> {
    const startDate = this.getPeriodStartDate(period);
    
    const searchDto: OrderSearchDto = {
      startDate,
      page: 1,
      limit: 1000,
    };

    const result = await this.orderService.search(searchDto, user.tenantId, user.id);
    const orders = result.orders;

    // Calculate execution performance metrics
    const completedOrders = orders.filter(o => o.isComplete);
    const totalCommissions = orders.reduce((sum, order) => sum + (order.commission || 0), 0);
    const totalFees = orders.reduce((sum, order) => sum + (order.fees || 0), 0);

    // Calculate average fill time for completed orders
    const ordersWithFillTime = completedOrders.filter(o => o.submittedAt && o.executedAt);
    const averageFillTime = ordersWithFillTime.length > 0 
      ? ordersWithFillTime.reduce((sum, order) => {
          const fillTime = new Date(order.executedAt!).getTime() - new Date(order.submittedAt!).getTime();
          return sum + (fillTime / 1000); // Convert to seconds
        }, 0) / ordersWithFillTime.length
      : 0;

    const averageFillRate = orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.fillRate, 0) / orders.length
      : 0;

    return {
      averageFillTime,
      averageFillRate,
      totalCommissions,
      totalFees,
      executionQuality: {
        averageSlippage: 0, // Would need market data to calculate actual slippage
        priceImprovement: 0,
        marketImpact: 0,
      },
      venueBreakdown: {}, // Would need venue data from fills
    };
  }

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private calculateDailyActivity(orders: OrderResponseDto[], startDate: Date): Array<{
    date: string;
    orderCount: number;
    volume: number;
    value: number;
  }> {
    const dailyStats: Record<string, { orderCount: number; volume: number; value: number }> = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyStats[orderDate]) {
        dailyStats[orderDate] = { orderCount: 0, volume: 0, value: 0 };
      }
      dailyStats[orderDate].orderCount++;
      dailyStats[orderDate].volume += order.executedQuantity;
      dailyStats[orderDate].value += order.executedValue || 0;
    });

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}