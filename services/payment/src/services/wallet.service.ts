import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, QueryRunner, DataSource } from 'typeorm';
import { Wallet, WalletStatus, WalletType } from '../entities/wallet.entity';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { 
  CreateWalletDto, 
  UpdateWalletDto, 
  WalletTransactionDto, 
  WalletTransferDto, 
  WalletBalanceOperationDto,
  WalletQueryDto,
  WalletSummaryDto 
} from '../dto/wallet.dto';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private auditService: AuditService,
    private notificationService: NotificationService,
  ) {}

  async createWallet(userId: string, createWalletDto: CreateWalletDto): Promise<Wallet> {
    this.logger.log(`Creating wallet for user ${userId}, type: ${createWalletDto.type}, currency: ${createWalletDto.currency}`);

    // Check if user already has a wallet of this type and currency
    const existingWallet = await this.walletRepository.findOne({
      where: {
        userId,
        type: createWalletDto.type,
        currency: createWalletDto.currency,
      },
    });

    if (existingWallet) {
      throw new BadRequestException(`Wallet of type ${createWalletDto.type} with currency ${createWalletDto.currency} already exists`);
    }

    // If this is set as default, unset other default wallets of the same currency
    if (createWalletDto.isDefault) {
      await this.walletRepository.update(
        { userId, currency: createWalletDto.currency, isDefault: true },
        { isDefault: false },
      );
    }

    const wallet = this.walletRepository.create({
      userId,
      ...createWalletDto,
    });

    const savedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletCreated(savedWallet, userId);

    this.logger.log(`Wallet created successfully: ${savedWallet.id}`);
    return savedWallet;
  }

  async getUserWallets(userId: string, queryDto?: WalletQueryDto): Promise<{
    wallets: Wallet[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, ...filters } = queryDto || {};
    const offset = (page - 1) * limit;

    const whereClause: any = { userId };
    
    if (filters.type) {
      whereClause.type = filters.type;
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.currency) {
      whereClause.currency = filters.currency;
    }

    if (filters.isDefault !== undefined) {
      whereClause.isDefault = filters.isDefault;
    }

    const findOptions: FindManyOptions<Wallet> = {
      where: whereClause,
      order: { isDefault: 'DESC', createdAt: 'ASC' },
      skip: offset,
      take: limit,
    };

    const [wallets, total] = await this.walletRepository.findAndCount(findOptions);

    return { wallets, total, page, limit };
  }

  async getWallet(walletId: string, userId?: string): Promise<Wallet> {
    const whereClause: any = { id: walletId };
    if (userId) {
      whereClause.userId = userId;
    }

    const wallet = await this.walletRepository.findOne({
      where: whereClause,
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getDefaultWallet(userId: string, currency: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { userId, currency, isDefault: true, status: WalletStatus.ACTIVE },
    });

    if (!wallet) {
      throw new NotFoundException(`No default ${currency} wallet found`);
    }

    return wallet;
  }

  async updateWallet(walletId: string, updateWalletDto: UpdateWalletDto, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);

    // Update fields
    Object.assign(wallet, updateWalletDto);

    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletUpdated(updatedWallet, updateWalletDto);

    return updatedWallet;
  }

  async deposit(userId: string, currency: string, amount: number, description?: string, metadata?: any): Promise<{ wallet: Wallet; transaction: Transaction }> {
    return this.executeWalletTransaction(async (queryRunner) => {
      // Get or create default wallet
      let wallet = await this.walletRepository.findOne({
        where: { userId, currency, isDefault: true, status: WalletStatus.ACTIVE },
      });

      if (!wallet) {
        // Create default trading wallet if none exists
        wallet = Wallet.createTradingWallet(userId, currency);
        wallet = await queryRunner.manager.save(wallet);
      }

      if (!wallet.canDeposit(amount)) {
        throw new BadRequestException('Cannot deposit to this wallet');
      }

      // Record balance before transaction
      const balanceBefore = wallet.balance;

      // Perform deposit
      wallet.deposit(amount);
      const updatedWallet = await queryRunner.manager.save(wallet);

      // Create transaction record
      const transaction = Transaction.createWalletTransaction(
        userId,
        wallet.id,
        TransactionType.DEPOSIT,
        amount,
        currency,
        description || 'Wallet deposit',
      );

      transaction.setBalances(balanceBefore, wallet.balance);
      transaction.markAsCompleted();
      transaction.metadata = metadata;

      const savedTransaction = await queryRunner.manager.save(transaction);

      return { wallet: updatedWallet, transaction: savedTransaction };
    });
  }

  async withdraw(walletId: string, withdrawDto: WalletTransactionDto, userId?: string): Promise<{ wallet: Wallet; transaction: Transaction }> {
    return this.executeWalletTransaction(async (queryRunner) => {
      const wallet = await this.getWallet(walletId, userId);

      if (!wallet.canWithdraw(withdrawDto.amount)) {
        throw new BadRequestException('Cannot withdraw from this wallet. Check balance, limits, and wallet status.');
      }

      // Record balance before transaction
      const balanceBefore = wallet.balance;

      // Perform withdrawal
      wallet.withdraw(withdrawDto.amount);
      const updatedWallet = await queryRunner.manager.save(wallet);

      // Create transaction record
      const transaction = Transaction.createWalletTransaction(
        wallet.userId,
        wallet.id,
        TransactionType.WITHDRAWAL,
        withdrawDto.amount,
        wallet.currency,
        withdrawDto.description || 'Wallet withdrawal',
      );

      transaction.setBalances(balanceBefore, wallet.balance);
      transaction.markAsCompleted();
      transaction.metadata = withdrawDto.metadata;

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Send notification for large withdrawals
      if (withdrawDto.amount > 1000) {
        await this.notificationService.sendLargeWithdrawalNotification(
          wallet.userId,
          updatedWallet,
          withdrawDto.amount,
        );
      }

      return { wallet: updatedWallet, transaction: savedTransaction };
    });
  }

  async transfer(fromWalletId: string, transferDto: WalletTransferDto, userId?: string): Promise<{
    fromWallet: Wallet;
    toWallet: Wallet;
    transactions: Transaction[];
  }> {
    return this.executeWalletTransaction(async (queryRunner) => {
      const fromWallet = await this.getWallet(fromWalletId, userId);
      const toWallet = await this.getWallet(transferDto.toWalletId);

      // Validate transfer
      if (fromWallet.currency !== toWallet.currency) {
        throw new BadRequestException('Cannot transfer between different currencies');
      }

      if (!fromWallet.canWithdraw(transferDto.amount)) {
        throw new BadRequestException('Insufficient balance or wallet cannot perform withdrawals');
      }

      if (!toWallet.canDeposit(transferDto.amount)) {
        throw new BadRequestException('Destination wallet cannot accept deposits');
      }

      // Record balances before transfer
      const fromBalanceBefore = fromWallet.balance;
      const toBalanceBefore = toWallet.balance;

      // Perform transfer
      fromWallet.withdraw(transferDto.amount);
      toWallet.deposit(transferDto.amount);

      const updatedFromWallet = await queryRunner.manager.save(fromWallet);
      const updatedToWallet = await queryRunner.manager.save(toWallet);

      // Create withdrawal transaction
      const withdrawalTransaction = Transaction.createWalletTransaction(
        fromWallet.userId,
        fromWallet.id,
        TransactionType.TRANSFER,
        transferDto.amount,
        fromWallet.currency,
        transferDto.description || 'Wallet transfer (outgoing)',
      );

      withdrawalTransaction.setBalances(fromBalanceBefore, fromWallet.balance);
      withdrawalTransaction.counterpartUserId = toWallet.userId;
      withdrawalTransaction.counterpartWalletId = toWallet.id;
      withdrawalTransaction.markAsCompleted();
      withdrawalTransaction.metadata = transferDto.metadata;

      // Create deposit transaction
      const depositTransaction = Transaction.createWalletTransaction(
        toWallet.userId,
        toWallet.id,
        TransactionType.TRANSFER,
        transferDto.amount,
        toWallet.currency,
        transferDto.description || 'Wallet transfer (incoming)',
      );

      depositTransaction.setBalances(toBalanceBefore, toWallet.balance);
      depositTransaction.counterpartUserId = fromWallet.userId;
      depositTransaction.counterpartWalletId = fromWallet.id;
      depositTransaction.markAsCompleted();
      depositTransaction.metadata = transferDto.metadata;

      const savedTransactions = await queryRunner.manager.save([
        withdrawalTransaction,
        depositTransaction,
      ]);

      return {
        fromWallet: updatedFromWallet,
        toWallet: updatedToWallet,
        transactions: savedTransactions,
      };
    });
  }

  async lockBalance(walletId: string, lockDto: WalletBalanceOperationDto, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);

    if (!wallet.canLock(lockDto.amount)) {
      throw new BadRequestException('Cannot lock the specified amount');
    }

    wallet.lock(lockDto.amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletBalanceLocked(updatedWallet, lockDto.amount, lockDto.reason);

    return updatedWallet;
  }

  async unlockBalance(walletId: string, unlockDto: WalletBalanceOperationDto, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);

    wallet.unlock(unlockDto.amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletBalanceUnlocked(updatedWallet, unlockDto.amount, unlockDto.reason);

    return updatedWallet;
  }

  async reserveBalance(walletId: string, reserveDto: WalletBalanceOperationDto, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);

    if (!wallet.canReserve(reserveDto.amount)) {
      throw new BadRequestException('Cannot reserve the specified amount');
    }

    wallet.reserve(reserveDto.amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletBalanceReserved(updatedWallet, reserveDto.amount, reserveDto.reason);

    return updatedWallet;
  }

  async unreserveBalance(walletId: string, unreserveDto: WalletBalanceOperationDto, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);

    wallet.unreserve(unreserveDto.amount);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletBalanceUnreserved(updatedWallet, unreserveDto.amount, unreserveDto.reason);

    return updatedWallet;
  }

  async getWalletTransactions(
    walletId: string, 
    userId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const wallet = await this.getWallet(walletId, userId);
    const offset = (page - 1) * limit;

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return { transactions, total, page, limit };
  }

  async getWalletSummary(userId: string): Promise<WalletSummaryDto> {
    const wallets = await this.walletRepository.find({
      where: { userId },
    });

    const summary: WalletSummaryDto = {
      totalWallets: wallets.length,
      activeWallets: 0,
      inactiveWallets: 0,
      totalBalancesByCurrency: {},
      availableBalancesByCurrency: {},
      lockedBalancesByCurrency: {},
      reservedBalancesByCurrency: {},
      lifetimeDepositsByCurrency: {},
      lifetimeWithdrawalsByCurrency: {},
      netFlowByCurrency: {},
    };

    for (const wallet of wallets) {
      if (wallet.isActive) {
        summary.activeWallets++;
      } else {
        summary.inactiveWallets++;
      }

      const currency = wallet.currency;
      
      summary.totalBalancesByCurrency[currency] = (summary.totalBalancesByCurrency[currency] || 0) + wallet.totalBalance;
      summary.availableBalancesByCurrency[currency] = (summary.availableBalancesByCurrency[currency] || 0) + wallet.availableBalance;
      summary.lockedBalancesByCurrency[currency] = (summary.lockedBalancesByCurrency[currency] || 0) + wallet.lockedBalance;
      summary.reservedBalancesByCurrency[currency] = (summary.reservedBalancesByCurrency[currency] || 0) + wallet.reservedBalance;
      summary.lifetimeDepositsByCurrency[currency] = (summary.lifetimeDepositsByCurrency[currency] || 0) + wallet.lifetimeDeposits;
      summary.lifetimeWithdrawalsByCurrency[currency] = (summary.lifetimeWithdrawalsByCurrency[currency] || 0) + wallet.lifetimeWithdrawals;
      summary.netFlowByCurrency[currency] = (summary.netFlowByCurrency[currency] || 0) + wallet.netFlow;
    }

    return summary;
  }

  async calculateInterestForSavingsWallets(): Promise<void> {
    this.logger.log('Calculating interest for savings wallets');

    const savingsWallets = await this.walletRepository.find({
      where: { type: WalletType.SAVINGS, status: WalletStatus.ACTIVE },
    });

    for (const wallet of savingsWallets) {
      try {
        const interest = wallet.applyInterest();
        
        if (interest > 0) {
          await this.walletRepository.save(wallet);

          // Create interest transaction
          const interestTransaction = Transaction.createWalletTransaction(
            wallet.userId,
            wallet.id,
            TransactionType.ADJUSTMENT,
            interest,
            wallet.currency,
            'Interest earned on savings wallet',
          );

          interestTransaction.markAsCompleted();
          await this.transactionRepository.save(interestTransaction);

          this.logger.log(`Interest applied to wallet ${wallet.id}: ${interest} ${wallet.currency}`);
        }
      } catch (error) {
        this.logger.error(`Error calculating interest for wallet ${wallet.id}`, error.stack);
      }
    }
  }

  async suspendWallet(walletId: string, reason: string, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);
    
    wallet.suspend(reason);
    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletSuspended(updatedWallet, reason);

    return updatedWallet;
  }

  async activateWallet(walletId: string, userId?: string): Promise<Wallet> {
    const wallet = await this.getWallet(walletId, userId);
    
    if (wallet.isClosed) {
      throw new BadRequestException('Cannot activate a closed wallet');
    }

    wallet.activate();
    const updatedWallet = await this.walletRepository.save(wallet);

    // Log audit trail
    await this.auditService.logWalletActivated(updatedWallet);

    return updatedWallet;
  }

  private async executeWalletTransaction<T>(
    operation: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Wallet transaction failed, rolling back', error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}