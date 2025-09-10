import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Wallet } from '../entities/wallet.entity';
import { Subscription } from '../entities/subscription.entity';
import { Invoice } from '../entities/invoice.entity';

interface AuditLog {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor() {
    // In production, this would inject an AuditLog repository
    // @InjectRepository(AuditLog)
    // private auditLogRepository: Repository<AuditLog>,
  }

  // Payment Audit Logs
  async logPaymentCreated(payment: Payment, userId: string, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      action: 'CREATE',
      resource: 'PAYMENT',
      resourceId: payment.id,
      newValues: {
        amount: payment.amount,
        currency: payment.currency,
        type: payment.type,
        status: payment.status,
        paymentMethodId: payment.paymentMethodId,
        providerPaymentId: payment.providerPaymentId,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Payment creation audited: ${payment.id}`);
  }

  async logPaymentConfirmed(payment: Payment, paymentMethodId: string, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: payment.userId,
      action: 'CONFIRM',
      resource: 'PAYMENT',
      resourceId: payment.id,
      newValues: {
        status: payment.status,
        processedAt: payment.processedAt,
        paymentMethodId,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Payment confirmation audited: ${payment.id}`);
  }

  async logPaymentRefunded(payment: Payment, refundAmount: number, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: payment.userId,
      action: 'REFUND',
      resource: 'PAYMENT',
      resourceId: payment.id,
      newValues: {
        refundedAmount: payment.refundedAmount,
        status: payment.status,
      },
      metadata: {
        refundAmount,
        reason,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Payment refund audited: ${payment.id}, amount: ${refundAmount}`);
  }

  async logPaymentCancelled(payment: Payment, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: payment.userId,
      action: 'CANCEL',
      resource: 'PAYMENT',
      resourceId: payment.id,
      oldValues: {
        status: 'PENDING',
      },
      newValues: {
        status: payment.status,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Payment cancellation audited: ${payment.id}`);
  }

  // Wallet Audit Logs
  async logWalletCreated(wallet: Wallet, userId: string, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      action: 'CREATE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        type: wallet.type,
        currency: wallet.currency,
        status: wallet.status,
        balance: wallet.balance,
        isDefault: wallet.isDefault,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet creation audited: ${wallet.id}`);
  }

  async logWalletUpdated(wallet: Wallet, changes: Record<string, any>, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'UPDATE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: changes,
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet update audited: ${wallet.id}`);
  }

  async logWalletDeposit(wallet: Wallet, amount: number, description?: string, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'DEPOSIT',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        amount,
        balance: wallet.balance,
        description,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet deposit audited: ${wallet.id}, amount: ${amount}`);
  }

  async logWalletWithdrawal(wallet: Wallet, amount: number, description?: string, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'WITHDRAWAL',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        amount,
        balance: wallet.balance,
        description,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet withdrawal audited: ${wallet.id}, amount: ${amount}`);
  }

  async logWalletTransfer(fromWallet: Wallet, toWallet: Wallet, amount: number, description?: string): Promise<void> {
    // Log outgoing transfer
    const outgoingAuditLog: AuditLog = {
      userId: fromWallet.userId,
      action: 'TRANSFER_OUT',
      resource: 'WALLET',
      resourceId: fromWallet.id,
      newValues: {
        amount: -amount, // Negative for outgoing
        balance: fromWallet.balance,
        toWalletId: toWallet.id,
        toUserId: toWallet.userId,
        description,
      },
      timestamp: new Date(),
    };

    // Log incoming transfer
    const incomingAuditLog: AuditLog = {
      userId: toWallet.userId,
      action: 'TRANSFER_IN',
      resource: 'WALLET',
      resourceId: toWallet.id,
      newValues: {
        amount: amount, // Positive for incoming
        balance: toWallet.balance,
        fromWalletId: fromWallet.id,
        fromUserId: fromWallet.userId,
        description,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(outgoingAuditLog);
    await this.writeAuditLog(incomingAuditLog);
    this.logger.log(`Wallet transfer audited: ${fromWallet.id} -> ${toWallet.id}, amount: ${amount}`);
  }

  async logWalletBalanceLocked(wallet: Wallet, amount: number, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'LOCK_BALANCE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        lockedAmount: amount,
        lockedBalance: wallet.lockedBalance,
        availableBalance: wallet.availableBalance,
        reason,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet balance lock audited: ${wallet.id}, amount: ${amount}`);
  }

  async logWalletBalanceUnlocked(wallet: Wallet, amount: number, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'UNLOCK_BALANCE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        unlockedAmount: amount,
        lockedBalance: wallet.lockedBalance,
        availableBalance: wallet.availableBalance,
        reason,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet balance unlock audited: ${wallet.id}, amount: ${amount}`);
  }

  async logWalletBalanceReserved(wallet: Wallet, amount: number, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'RESERVE_BALANCE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        reservedAmount: amount,
        reservedBalance: wallet.reservedBalance,
        availableBalance: wallet.availableBalance,
        reason,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet balance reserve audited: ${wallet.id}, amount: ${amount}`);
  }

  async logWalletBalanceUnreserved(wallet: Wallet, amount: number, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'UNRESERVE_BALANCE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        unreservedAmount: amount,
        reservedBalance: wallet.reservedBalance,
        availableBalance: wallet.availableBalance,
        reason,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet balance unreserve audited: ${wallet.id}, amount: ${amount}`);
  }

  async logWalletSuspended(wallet: Wallet, reason: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'SUSPEND',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        status: wallet.status,
        reason,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet suspension audited: ${wallet.id}, reason: ${reason}`);
  }

  async logWalletActivated(wallet: Wallet): Promise<void> {
    const auditLog: AuditLog = {
      userId: wallet.userId,
      action: 'ACTIVATE',
      resource: 'WALLET',
      resourceId: wallet.id,
      newValues: {
        status: wallet.status,
      },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Wallet activation audited: ${wallet.id}`);
  }

  // Subscription Audit Logs
  async logSubscriptionCreated(subscription: Subscription, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: subscription.userId,
      action: 'CREATE',
      resource: 'SUBSCRIPTION',
      resourceId: subscription.id,
      newValues: {
        planId: subscription.planId,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPrice: subscription.currentPrice,
        currentCurrency: subscription.currentCurrency,
        nextBillingDate: subscription.nextBillingDate,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Subscription creation audited: ${subscription.id}`);
  }

  async logSubscriptionUpdated(subscription: Subscription, changes: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: subscription.userId,
      action: 'UPDATE',
      resource: 'SUBSCRIPTION',
      resourceId: subscription.id,
      newValues: changes,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Subscription update audited: ${subscription.id}`);
  }

  async logSubscriptionCancelled(subscription: Subscription, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: subscription.userId,
      action: 'CANCEL',
      resource: 'SUBSCRIPTION',
      resourceId: subscription.id,
      newValues: {
        status: subscription.status,
        cancelledAt: subscription.cancelledAt,
        cancelAt: subscription.cancelAt,
      },
      metadata: { reason },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Subscription cancellation audited: ${subscription.id}`);
  }

  // Invoice Audit Logs
  async logInvoiceGenerated(invoice: Invoice, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: invoice.userId,
      action: 'GENERATE',
      resource: 'INVOICE',
      resourceId: invoice.id,
      newValues: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.dueDate,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Invoice generation audited: ${invoice.id}`);
  }

  async logInvoicePaid(invoice: Invoice, paymentAmount: number, metadata?: Record<string, any>): Promise<void> {
    const auditLog: AuditLog = {
      userId: invoice.userId,
      action: 'PAY',
      resource: 'INVOICE',
      resourceId: invoice.id,
      newValues: {
        status: invoice.status,
        amountPaid: invoice.amountPaid,
        paidAt: invoice.paidAt,
        paymentAmount,
      },
      metadata,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Invoice payment audited: ${invoice.id}, amount: ${paymentAmount}`);
  }

  async logInvoiceVoided(invoice: Invoice, reason?: string): Promise<void> {
    const auditLog: AuditLog = {
      userId: invoice.userId,
      action: 'VOID',
      resource: 'INVOICE',
      resourceId: invoice.id,
      newValues: {
        status: invoice.status,
        voidedAt: invoice.voidedAt,
      },
      metadata: { reason },
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.log(`Invoice void audited: ${invoice.id}`);
  }

  // Security Audit Logs
  async logSuspiciousActivity(
    userId: string,
    activity: string,
    riskScore: number,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      action: 'SUSPICIOUS_ACTIVITY',
      resource: 'SECURITY',
      resourceId: `suspicious_${Date.now()}`,
      newValues: {
        activity,
        riskScore,
        details,
      },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.warn(`Suspicious activity audited for user ${userId}: ${activity}, risk score: ${riskScore}`);
  }

  async logAuthenticationFailure(
    userId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog: AuditLog = {
      userId,
      action: 'AUTH_FAILURE',
      resource: 'SECURITY',
      resourceId: `auth_failure_${Date.now()}`,
      newValues: {
        reason,
        attemptTime: new Date(),
      },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    await this.writeAuditLog(auditLog);
    this.logger.warn(`Authentication failure audited for user ${userId}: ${reason}`);
  }

  // Query Methods
  async getUserAuditLogs(
    userId: string,
    page: number = 1,
    limit: number = 50,
    resource?: string,
    action?: string,
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    // In production, this would query the actual audit log repository
    this.logger.log(`Fetching audit logs for user ${userId}, page: ${page}, limit: ${limit}`);
    
    // Placeholder implementation
    return {
      logs: [],
      total: 0,
      page,
      limit,
    };
  }

  async getResourceAuditTrail(
    resource: string,
    resourceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    // In production, this would query the actual audit log repository
    this.logger.log(`Fetching audit trail for ${resource}:${resourceId}, page: ${page}, limit: ${limit}`);
    
    // Placeholder implementation
    return {
      logs: [],
      total: 0,
      page,
      limit,
    };
  }

  async getComplianceReport(
    startDate: Date,
    endDate: Date,
    userId?: string,
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    suspiciousActivities: number;
    complianceScore: number;
    recommendations: string[];
  }> {
    this.logger.log(`Generating compliance report from ${startDate} to ${endDate}`);
    
    // In production, this would analyze actual audit data
    return {
      totalActions: 0,
      actionsByType: {},
      suspiciousActivities: 0,
      complianceScore: 100,
      recommendations: [],
    };
  }

  // Private methods
  private async writeAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      // In production, this would save to a dedicated audit log database
      // For now, we'll just log to the application logs
      const logMessage = {
        timestamp: auditLog.timestamp.toISOString(),
        userId: auditLog.userId,
        action: auditLog.action,
        resource: auditLog.resource,
        resourceId: auditLog.resourceId,
        oldValues: auditLog.oldValues,
        newValues: auditLog.newValues,
        metadata: auditLog.metadata,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
      };

      // Write to secure audit log (in production, this would be a separate, tamper-proof storage)
      this.logger.log(`AUDIT: ${JSON.stringify(logMessage)}`);

      // In a real implementation:
      // await this.auditLogRepository.save(auditLog);
      
    } catch (error) {
      this.logger.error('Failed to write audit log', error.stack);
      // Audit log failures should be handled carefully to avoid infinite loops
    }
  }

  // Compliance and reporting helper methods
  async detectAnomalousPatterns(userId: string, timeWindow: number = 24): Promise<{
    anomalies: Array<{
      type: string;
      description: string;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      timestamp: Date;
    }>;
    riskScore: number;
  }> {
    this.logger.log(`Analyzing anomalous patterns for user ${userId} in last ${timeWindow} hours`);
    
    // In production, this would analyze audit logs using ML or rule-based detection
    return {
      anomalies: [],
      riskScore: 0,
    };
  }

  async generateDataRetentionReport(): Promise<{
    totalRecords: number;
    recordsByAge: Record<string, number>;
    recordsToDelete: number;
    recommendations: string[];
  }> {
    this.logger.log('Generating data retention report');
    
    // In production, this would analyze actual audit log data
    return {
      totalRecords: 0,
      recordsByAge: {},
      recordsToDelete: 0,
      recommendations: [],
    };
  }
}