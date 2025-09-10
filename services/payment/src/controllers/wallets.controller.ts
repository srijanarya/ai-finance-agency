import {
  Controller,
  Get,
  Post,
  Put,
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
import { WalletService } from '../services/wallet.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { 
  CreateWalletDto, 
  UpdateWalletDto, 
  WalletTransactionDto, 
  WalletTransferDto, 
  WalletBalanceOperationDto,
  WalletQueryDto,
  WalletResponseDto,
  WalletSummaryDto,
  WalletBalanceSummaryDto,
} from '../dto/wallet.dto';
import { Wallet } from '../entities/wallet.entity';
import { Transaction } from '../entities/transaction.entity';

@ApiTags('Wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Wallet created successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid wallet data or wallet already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async createWallet(
    @Request() req: any,
    @Body(ValidationPipe) createWalletDto: CreateWalletDto,
  ): Promise<Wallet> {
    return this.walletService.createWallet(req.user.sub, createWalletDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wallets' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: ['trading', 'savings', 'escrow'], description: 'Wallet type' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended'], description: 'Wallet status' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency code' })
  @ApiQuery({ name: 'isDefault', required: false, type: Boolean, description: 'Default wallets only' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallets retrieved successfully',
    type: 'object',
    schema: {
      properties: {
        wallets: {
          type: 'array',
          items: { $ref: '#/components/schemas/WalletResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getUserWallets(
    @Request() req: any,
    @Query() queryDto: WalletQueryDto,
  ): Promise<{
    wallets: Wallet[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.walletService.getUserWallets(req.user.sub, queryDto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get wallet summary statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet summary retrieved successfully',
    type: WalletSummaryDto,
  })
  async getWalletSummary(@Request() req: any): Promise<WalletSummaryDto> {
    return this.walletService.getWalletSummary(req.user.sub);
  }

  @Get('default/:currency')
  @ApiOperation({ summary: 'Get default wallet for a currency' })
  @ApiParam({ name: 'currency', description: 'Currency code (e.g., USD, EUR)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Default wallet retrieved successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Default wallet not found for currency',
  })
  async getDefaultWallet(
    @Request() req: any,
    @Param('currency') currency: string,
  ): Promise<Wallet> {
    return this.walletService.getDefaultWallet(req.user.sub, currency);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet retrieved successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found',
  })
  async getWallet(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
  ): Promise<Wallet> {
    return this.walletService.getWallet(walletId, req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update wallet settings' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet updated successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Wallet not found',
  })
  @HttpCode(HttpStatus.OK)
  async updateWallet(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) updateWalletDto: UpdateWalletDto,
  ): Promise<Wallet> {
    return this.walletService.updateWallet(walletId, updateWalletDto, req.user.sub);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get wallet balance summary' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Balance summary retrieved successfully',
    type: WalletBalanceSummaryDto,
  })
  async getWalletBalance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
  ): Promise<WalletBalanceSummaryDto> {
    const wallet = await this.walletService.getWallet(walletId, req.user.sub);
    return {
      total: wallet.totalBalance,
      available: wallet.availableBalance,
      locked: wallet.lockedBalance,
      reserved: wallet.reservedBalance,
      currency: wallet.currency,
    };
  }

  // Wallet transactions
  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit funds to wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deposit completed successfully',
    type: 'object',
    schema: {
      properties: {
        wallet: { $ref: '#/components/schemas/WalletResponseDto' },
        transaction: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot deposit to wallet',
  })
  @HttpCode(HttpStatus.OK)
  async depositToWallet(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) depositDto: WalletTransactionDto,
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    // For direct deposits, we use the withdraw method (which validates the wallet)
    // but call the deposit service method instead
    return this.walletService.deposit(
      req.user.sub,
      (await this.walletService.getWallet(walletId, req.user.sub)).currency,
      depositDto.amount,
      depositDto.description,
      depositDto.metadata,
    );
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw funds from wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Withdrawal completed successfully',
    type: 'object',
    schema: {
      properties: {
        wallet: { $ref: '#/components/schemas/WalletResponseDto' },
        transaction: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot withdraw from wallet',
  })
  @HttpCode(HttpStatus.OK)
  async withdrawFromWallet(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) withdrawDto: WalletTransactionDto,
  ): Promise<{ wallet: Wallet; transaction: Transaction }> {
    return this.walletService.withdraw(walletId, withdrawDto, req.user.sub);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer funds to another wallet' })
  @ApiParam({ name: 'id', description: 'Source wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer completed successfully',
    type: 'object',
    schema: {
      properties: {
        fromWallet: { $ref: '#/components/schemas/WalletResponseDto' },
        toWallet: { $ref: '#/components/schemas/WalletResponseDto' },
        transactions: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot complete transfer',
  })
  @HttpCode(HttpStatus.OK)
  async transferBetweenWallets(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) fromWalletId: string,
    @Body(ValidationPipe) transferDto: WalletTransferDto,
  ): Promise<{
    fromWallet: Wallet;
    toWallet: Wallet;
    transactions: Transaction[];
  }> {
    return this.walletService.transfer(fromWalletId, transferDto, req.user.sub);
  }

  // Balance operations
  @Post(':id/lock')
  @ApiOperation({ summary: 'Lock funds in wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds locked successfully',
    type: WalletResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async lockBalance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) lockDto: WalletBalanceOperationDto,
  ): Promise<Wallet> {
    return this.walletService.lockBalance(walletId, lockDto, req.user.sub);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock funds in wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds unlocked successfully',
    type: WalletResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async unlockBalance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) unlockDto: WalletBalanceOperationDto,
  ): Promise<Wallet> {
    return this.walletService.unlockBalance(walletId, unlockDto, req.user.sub);
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: 'Reserve funds in wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds reserved successfully',
    type: WalletResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async reserveBalance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) reserveDto: WalletBalanceOperationDto,
  ): Promise<Wallet> {
    return this.walletService.reserveBalance(walletId, reserveDto, req.user.sub);
  }

  @Post(':id/unreserve')
  @ApiOperation({ summary: 'Unreserve funds in wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Funds unreserved successfully',
    type: WalletResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async unreserveBalance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body(ValidationPipe) unreserveDto: WalletBalanceOperationDto,
  ): Promise<Wallet> {
    return this.walletService.unreserveBalance(walletId, unreserveDto, req.user.sub);
  }

  // Transaction history
  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction history retrieved successfully',
    type: 'object',
    schema: {
      properties: {
        transactions: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getWalletTransactions(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) walletId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.walletService.getWalletTransactions(walletId, req.user.sub, page, limit);
  }

  // Wallet management
  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend wallet (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet suspended successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async suspendWallet(
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body('reason') reason: string,
  ): Promise<Wallet> {
    return this.walletService.suspendWallet(walletId, reason);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate wallet (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Wallet activated successfully',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async activateWallet(
    @Param('id', ParseUUIDPipe) walletId: string,
  ): Promise<Wallet> {
    return this.walletService.activateWallet(walletId);
  }

  // Admin endpoints
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all wallets (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'support')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'currency', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All wallets retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async getAllWallets(
    @Query() queryDto: WalletQueryDto & { userId?: string },
  ): Promise<{
    wallets: Wallet[];
    total: number;
    page: number;
    limit: number;
  }> {
    // For admin, we can query specific user's wallets or all
    return this.walletService.getUserWallets(queryDto.userId || null, queryDto);
  }

  @Get('admin/analytics/balances')
  @ApiOperation({ summary: 'Get wallet balance analytics (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'finance')
  @ApiQuery({ name: 'currency', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Balance analytics retrieved successfully',
  })
  async getBalanceAnalytics(
    @Query('currency') currency?: string,
  ): Promise<{
    totalBalances: Record<string, number>;
    totalUsers: number;
    averageBalance: Record<string, number>;
    distribution: Array<{
      range: string;
      count: number;
      totalBalance: number;
    }>;
  }> {
    // This would be implemented in the service layer
    return {
      totalBalances: {},
      totalUsers: 0,
      averageBalance: {},
      distribution: [],
    };
  }

  @Post('admin/bulk-operations')
  @ApiOperation({ summary: 'Perform bulk wallet operations (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk operation completed',
    type: 'object',
    schema: {
      properties: {
        successful: { type: 'array', items: { type: 'string' } },
        failed: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async bulkWalletOperations(
    @Body() bulkOperationDto: {
      operation: 'suspend' | 'activate' | 'adjust_balance';
      walletIds: string[];
      reason?: string;
      amount?: number;
      description?: string;
    },
  ): Promise<{
    successful: string[];
    failed: Array<{ walletId: string; error: string }>;
  }> {
    const results = {
      successful: [],
      failed: [],
    };

    for (const walletId of bulkOperationDto.walletIds) {
      try {
        switch (bulkOperationDto.operation) {
          case 'suspend':
            await this.walletService.suspendWallet(walletId, bulkOperationDto.reason);
            break;
          case 'activate':
            await this.walletService.activateWallet(walletId);
            break;
          // Add other operations as needed
          default:
            throw new Error(`Unknown operation: ${bulkOperationDto.operation}`);
        }
        results.successful.push(walletId);
      } catch (error) {
        results.failed.push({
          walletId,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Maintenance endpoints
  @Post('maintenance/calculate-interest')
  @ApiOperation({ summary: 'Calculate interest for savings wallets (Admin only)' })
  @UseGuards(RolesGuard)
  @Roles('admin', 'system')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Interest calculation completed',
  })
  @HttpCode(HttpStatus.OK)
  async calculateInterest(): Promise<{ message: string }> {
    await this.walletService.calculateInterestForSavingsWallets();
    return { message: 'Interest calculation completed for all savings wallets' };
  }
}