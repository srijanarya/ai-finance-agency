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
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { 
  CreatePaymentDto, 
  ConfirmPaymentDto, 
  RefundPaymentDto, 
  PaymentQueryDto,
  PaymentResponseDto,
  PaymentSummaryDto,
} from '../dto/payment.dto';
import { Payment } from '../entities/payment.entity';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async createPayment(
    @Request() req: any,
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.createPayment(req.user.sub, createPaymentDto);
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirm a pending payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment confirmed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment cannot be confirmed',
  })
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body(ValidationPipe) confirmPaymentDto: ConfirmPaymentDto,
  ): Promise<Payment> {
    return this.paymentService.confirmPayment(paymentId, confirmPaymentDto.paymentMethodId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user payments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'completed', 'failed'], description: 'Payment status' })
  @ApiQuery({ name: 'type', required: false, enum: ['one_time', 'recurring', 'subscription'], description: 'Payment type' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency code' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum amount' })
  @ApiQuery({ name: 'maxAmount', required: false, type: Number, description: 'Maximum amount' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in description' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payments retrieved successfully',
    type: 'object',
    schema: {
      properties: {
        payments: {
          type: 'array',
          items: { $ref: '#/components/schemas/PaymentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getUserPayments(
    @Request() req: any,
    @Query() queryDto: PaymentQueryDto,
  ): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.paymentService.getUserPayments(req.user.sub, queryDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get payment summary statistics' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency to filter by' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment summary retrieved successfully',
    type: PaymentSummaryDto,
  })
  async getPaymentSummary(
    @Request() req: any,
    @Query('currency') currency?: string,
  ): Promise<PaymentSummaryDto> {
    return this.paymentService.getPaymentSummary(req.user.sub, currency);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async getPayment(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) paymentId: string,
  ): Promise<Payment> {
    return this.paymentService.getPayment(paymentId, req.user.sub);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment cannot be refunded',
  })
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body(ValidationPipe) refundDto: RefundPaymentDto,
  ): Promise<Payment> {
    return this.paymentService.refundPayment(paymentId, refundDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a pending payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment cancelled successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment cannot be cancelled',
  })
  @HttpCode(HttpStatus.OK)
  async cancelPayment(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) paymentId: string,
  ): Promise<Payment> {
    return this.paymentService.cancelPayment(paymentId, req.user.sub);
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All payments retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getAllPayments(
    @Query() queryDto: PaymentQueryDto & { userId?: string },
  ): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // For admin, we can query all users' payments
    return this.paymentService.getUserPayments(queryDto.userId || null, queryDto);
  }

  @Get('admin/:id')
  @ApiOperation({ summary: 'Get any payment by ID (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getPaymentAsAdmin(
    @Param('id', ParseUUIDPipe) paymentId: string,
  ): Promise<Payment> {
    return this.paymentService.getPayment(paymentId);
  }

  @Post('admin/:id/refund')
  @ApiOperation({ summary: 'Force refund a payment (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund processed successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async forceRefundPayment(
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body(ValidationPipe) refundDto: RefundPaymentDto,
  ): Promise<Payment> {
    return this.paymentService.refundPayment(paymentId, refundDto);
  }

  // Batch operations
  @Post('batch/refund')
  @ApiOperation({ summary: 'Batch refund multiple payments (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Batch refund processed successfully',
    type: 'object',
    schema: {
      properties: {
        successful: { type: 'array', items: { type: 'string' } },
        failed: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async batchRefundPayments(
    @Body() batchRefundDto: {
      paymentIds: string[];
      reason?: string;
      amount?: number;
    },
  ): Promise<{
    successful: string[];
    failed: Array<{ paymentId: string; error: string }>;
  }> {
    const results = {
      successful: [],
      failed: [],
    };

    for (const paymentId of batchRefundDto.paymentIds) {
      try {
        await this.paymentService.refundPayment(paymentId, {
          amount: batchRefundDto.amount,
          reason: batchRefundDto.reason,
        });
        results.successful.push(paymentId);
      } catch (error) {
        results.failed.push({
          paymentId,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Analytics and reporting
  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue analytics (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance')
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month', 'year'] })
  @ApiQuery({ name: 'currency', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Revenue analytics retrieved successfully',
  })
  async getRevenueAnalytics(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
    @Query('currency') currency?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<{
    totalRevenue: number;
    currency: string;
    period: string;
    dataPoints: Array<{
      date: string;
      revenue: number;
      transactions: number;
    }>;
  }> {
    // This would be implemented in the service layer
    return {
      totalRevenue: 0,
      currency: currency || 'USD',
      period,
      dataPoints: [],
    };
  }

  @Get('analytics/failure-rate')
  @ApiOperation({ summary: 'Get payment failure rate analytics (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Failure rate analytics retrieved successfully',
  })
  async getFailureRateAnalytics(
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ): Promise<{
    overall: {
      total: number;
      failed: number;
      rate: number;
    };
    byReason: Array<{
      reason: string;
      count: number;
      percentage: number;
    }>;
    byPaymentMethod: Array<{
      method: string;
      total: number;
      failed: number;
      rate: number;
    }>;
  }> {
    // This would be implemented in the service layer
    return {
      overall: {
        total: 0,
        failed: 0,
        rate: 0,
      },
      byReason: [],
      byPaymentMethod: [],
    };
  }
}