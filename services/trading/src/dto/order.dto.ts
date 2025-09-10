import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  IsUUID,
  IsArray,
  IsObject,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderType, OrderSide, OrderStatus, TimeInForce, OrderSource } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ enum: OrderSide, description: 'Order side (buy/sell)' })
  @IsEnum(OrderSide)
  side: OrderSide;

  @ApiProperty({ enum: OrderType, description: 'Order type' })
  @IsEnum(OrderType)
  orderType: OrderType;

  @ApiProperty({ description: 'Order quantity', minimum: 0.00000001 })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  quantity: number;

  @ApiPropertyOptional({ description: 'Order price (required for limit orders)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  price?: number;

  @ApiPropertyOptional({ description: 'Stop price (required for stop orders)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  stopPrice?: number;

  @ApiPropertyOptional({ description: 'Limit price (for stop-limit orders)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  limitPrice?: number;

  @ApiPropertyOptional({ enum: TimeInForce, description: 'Time in force', default: TimeInForce.DAY })
  @IsOptional()
  @IsEnum(TimeInForce)
  timeInForce?: TimeInForce = TimeInForce.DAY;

  @ApiPropertyOptional({ description: 'Good till date (required for GTD orders)' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  goodTillDate?: Date;

  @ApiPropertyOptional({ enum: OrderSource, description: 'Order source', default: OrderSource.API })
  @IsOptional()
  @IsEnum(OrderSource)
  source?: OrderSource = OrderSource.API;

  @ApiPropertyOptional({ description: 'Client-provided order ID' })
  @IsOptional()
  @IsString()
  clientOrderId?: string;

  @ApiPropertyOptional({ description: 'Parent order ID (for child orders)' })
  @IsOptional()
  @IsUUID()
  parentOrderId?: string;

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Updated quantity' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Updated price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  price?: number;

  @ApiPropertyOptional({ description: 'Updated stop price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  stopPrice?: number;

  @ApiPropertyOptional({ description: 'Updated limit price' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  limitPrice?: number;

  @ApiPropertyOptional({ enum: TimeInForce, description: 'Updated time in force' })
  @IsOptional()
  @IsEnum(TimeInForce)
  timeInForce?: TimeInForce;

  @ApiPropertyOptional({ description: 'Updated good till date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  goodTillDate?: Date;

  @ApiPropertyOptional({ description: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Updated metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class OrderSearchDto {
  @ApiPropertyOptional({ description: 'Filter by symbol' })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({ enum: OrderSide, description: 'Filter by side' })
  @IsOptional()
  @IsEnum(OrderSide)
  side?: OrderSide;

  @ApiPropertyOptional({ enum: OrderType, description: 'Filter by order type' })
  @IsOptional()
  @IsEnum(OrderType)
  orderType?: OrderType;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Filter by client order ID' })
  @IsOptional()
  @IsString()
  clientOrderId?: string;

  @ApiPropertyOptional({ description: 'Filter orders created after this date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Filter orders created before this date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Minimum quantity filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort direction', default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class BulkOrderDto {
  @ApiProperty({ type: [CreateOrderDto], description: 'Array of orders to create' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: CreateOrderDto[];

  @ApiPropertyOptional({ description: 'Execute orders atomically (all or none)' })
  @IsOptional()
  @IsBoolean()
  atomic?: boolean = false;

  @ApiPropertyOptional({ description: 'Validate orders before execution' })
  @IsOptional()
  @IsBoolean()
  validate?: boolean = true;

  @ApiPropertyOptional({ description: 'Maximum allowed total notional value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxNotionalValue?: number;
}

export class CancelOrderDto {
  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Force cancellation even if partially filled' })
  @IsOptional()
  @IsBoolean()
  force?: boolean = false;
}

export class OrderFillDto {
  @ApiProperty({ description: 'Fill quantity' })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  quantity: number;

  @ApiProperty({ description: 'Fill price' })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0.00000001)
  price: number;

  @ApiPropertyOptional({ description: 'Execution venue' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ description: 'Contra party' })
  @IsOptional()
  @IsString()
  contraParty?: string;

  @ApiPropertyOptional({ description: 'Liquidity type' })
  @IsOptional()
  @IsString()
  liquidityType?: string;

  @ApiPropertyOptional({ description: 'Trade ID' })
  @IsOptional()
  @IsString()
  tradeId?: string;

  @ApiPropertyOptional({ description: 'Commission charged' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  commission?: number;

  @ApiPropertyOptional({ description: 'Fees charged' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  fees?: number;

  @ApiPropertyOptional({ description: 'Fill timestamp' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  timestamp?: Date;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Client order ID' })
  clientOrderId?: string;

  @ApiProperty({ description: 'Parent order ID' })
  parentOrderId?: string;

  @ApiProperty({ description: 'Trading symbol' })
  symbol: string;

  @ApiProperty({ enum: OrderSide, description: 'Order side' })
  side: OrderSide;

  @ApiProperty({ enum: OrderType, description: 'Order type' })
  orderType: OrderType;

  @ApiProperty({ description: 'Order quantity' })
  quantity: number;

  @ApiProperty({ description: 'Executed quantity' })
  executedQuantity: number;

  @ApiProperty({ description: 'Remaining quantity' })
  remainingQuantity: number;

  @ApiProperty({ description: 'Order price' })
  price?: number;

  @ApiProperty({ description: 'Stop price' })
  stopPrice?: number;

  @ApiProperty({ description: 'Limit price' })
  limitPrice?: number;

  @ApiProperty({ description: 'Average execution price' })
  averagePrice?: number;

  @ApiProperty({ enum: OrderStatus, description: 'Order status' })
  status: OrderStatus;

  @ApiProperty({ enum: TimeInForce, description: 'Time in force' })
  timeInForce: TimeInForce;

  @ApiProperty({ description: 'Good till date' })
  goodTillDate?: Date;

  @ApiProperty({ enum: OrderSource, description: 'Order source' })
  source: OrderSource;

  @ApiProperty({ description: 'Exchange order ID' })
  exchangeOrderId?: string;

  @ApiProperty({ description: 'Number of fills' })
  fillCount: number;

  @ApiProperty({ description: 'Notional value' })
  notionalValue?: number;

  @ApiProperty({ description: 'Executed value' })
  executedValue?: number;

  @ApiProperty({ description: 'Commission' })
  commission?: number;

  @ApiProperty({ description: 'Fees' })
  fees?: number;

  @ApiProperty({ description: 'Total cost' })
  totalCost?: number;

  @ApiProperty({ description: 'Order notes' })
  notes?: string;

  @ApiProperty({ description: 'Error code if rejected' })
  errorCode?: string;

  @ApiProperty({ description: 'Error message if rejected' })
  errorMessage?: string;

  @ApiProperty({ description: 'Retry count' })
  retryCount: number;

  @ApiProperty({ description: 'Submitted timestamp' })
  submittedAt?: Date;

  @ApiProperty({ description: 'Executed timestamp' })
  executedAt?: Date;

  @ApiProperty({ description: 'Cancelled timestamp' })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Expired timestamp' })
  expiredAt?: Date;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Fill rate percentage' })
  fillRate: number;

  @ApiProperty({ description: 'Is order complete' })
  isComplete: boolean;

  @ApiProperty({ description: 'Is order active' })
  isActive: boolean;

  @ApiProperty({ description: 'Total transaction cost' })
  totalTransactionCost: number;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: Record<string, any>;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto], description: 'Array of orders' })
  orders: OrderResponseDto[];

  @ApiProperty({ description: 'Total number of orders' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}

export class BulkOrderResponseDto {
  @ApiProperty({ type: [OrderResponseDto], description: 'Successfully created orders' })
  success: OrderResponseDto[];

  @ApiProperty({ description: 'Failed order creations' })
  errors: Array<{
    order: CreateOrderDto;
    error: string;
    index: number;
  }>;

  @ApiProperty({ description: 'Total orders processed' })
  totalProcessed: number;

  @ApiProperty({ description: 'Successfully created count' })
  successCount: number;

  @ApiProperty({ description: 'Failed count' })
  errorCount: number;

  @ApiProperty({ description: 'Was executed atomically' })
  atomic: boolean;

  @ApiProperty({ description: 'Total notional value' })
  totalNotionalValue: number;
}