import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";

import {
  MarketAlert,
  AlertType,
  AlertStatus,
  AlertPriority,
} from "../entities/market-alert.entity";
import { MarketData } from "../entities/market-data.entity";

export interface CreateAlertDto {
  userId: string;
  symbol: string;
  alertType: AlertType;
  title: string;
  description?: string;
  conditions: Record<string, any>;
  targetPrice?: number;
  percentageThreshold?: number;
  volumeThreshold?: number;
  priority?: AlertPriority;
  isRecurring?: boolean;
  expiresAt?: Date;
  notificationMethods?: string[];
}

export interface UpdateAlertDto {
  title?: string;
  description?: string;
  conditions?: Record<string, any>;
  targetPrice?: number;
  percentageThreshold?: number;
  volumeThreshold?: number;
  priority?: AlertPriority;
  status?: AlertStatus;
  isRecurring?: boolean;
  expiresAt?: Date;
  notificationMethods?: string[];
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  constructor(
    @InjectRepository(MarketAlert)
    private alertRepository: Repository<MarketAlert>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createAlert(createAlertDto: CreateAlertDto): Promise<MarketAlert> {
    try {
      const alert = this.alertRepository.create({
        ...createAlertDto,
        symbol: createAlertDto.symbol.toUpperCase(),
        status: AlertStatus.ACTIVE,
        priority: createAlertDto.priority || AlertPriority.MEDIUM,
        triggerCount: 0,
        notificationMethods: createAlertDto.notificationMethods || ["push"],
      });

      const savedAlert = await this.alertRepository.save(alert);

      this.logger.log(
        `Created alert ${savedAlert.id} for ${savedAlert.symbol}`,
      );

      return savedAlert;
    } catch (error) {
      this.logger.error("Error creating alert:", error);
      throw error;
    }
  }

  async updateAlert(
    id: string,
    updateAlertDto: UpdateAlertDto,
  ): Promise<MarketAlert> {
    try {
      const alert = await this.alertRepository.findOne({ where: { id } });

      if (!alert) {
        throw new Error("Alert not found");
      }

      Object.assign(alert, updateAlertDto);

      const updatedAlert = await this.alertRepository.save(alert);

      this.logger.log(`Updated alert ${id}`);

      return updatedAlert;
    } catch (error) {
      this.logger.error("Error updating alert:", error);
      throw error;
    }
  }

  async deleteAlert(id: string): Promise<void> {
    try {
      const result = await this.alertRepository.delete(id);

      if (result.affected === 0) {
        throw new Error("Alert not found");
      }

      this.logger.log(`Deleted alert ${id}`);
    } catch (error) {
      this.logger.error("Error deleting alert:", error);
      throw error;
    }
  }

  async getUserAlerts(
    userId: string,
    status?: AlertStatus,
  ): Promise<MarketAlert[]> {
    try {
      const whereConditions: any = { userId };

      if (status) {
        whereConditions.status = status;
      }

      return await this.alertRepository.find({
        where: whereConditions,
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      this.logger.error("Error getting user alerts:", error);
      throw error;
    }
  }

  async getAlertsBySymbol(
    symbol: string,
    status?: AlertStatus,
  ): Promise<MarketAlert[]> {
    try {
      const whereConditions: any = { symbol: symbol.toUpperCase() };

      if (status) {
        whereConditions.status = status;
      }

      return await this.alertRepository.find({
        where: whereConditions,
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      this.logger.error("Error getting alerts by symbol:", error);
      throw error;
    }
  }

  @OnEvent("market.data.updated")
  async handleMarketDataUpdate(payload: {
    symbol: string;
    data: MarketData;
  }): Promise<void> {
    try {
      const { symbol, data } = payload;

      // Get all active alerts for this symbol
      const alerts = await this.alertRepository.find({
        where: {
          symbol: symbol.toUpperCase(),
          status: AlertStatus.ACTIVE,
        },
      });

      for (const alert of alerts) {
        await this.checkAlert(alert, data);
      }
    } catch (error) {
      this.logger.error("Error handling market data update for alerts:", error);
    }
  }

  private async checkAlert(
    alert: MarketAlert,
    marketData: MarketData,
  ): Promise<void> {
    try {
      let isTriggered = false;
      const currentPrice = marketData.price;

      switch (alert.alertType) {
        case AlertType.PRICE_ABOVE:
          isTriggered =
            alert.targetPrice !== null && currentPrice > alert.targetPrice;
          break;

        case AlertType.PRICE_BELOW:
          isTriggered =
            alert.targetPrice !== null && currentPrice < alert.targetPrice;
          break;

        case AlertType.PRICE_CHANGE:
          if (
            alert.percentageThreshold !== null &&
            marketData.changePercent !== null
          ) {
            isTriggered =
              Math.abs(marketData.changePercent) >=
              Math.abs(alert.percentageThreshold);
          }
          break;

        case AlertType.VOLUME_SPIKE:
          if (alert.volumeThreshold !== null && marketData.volume) {
            isTriggered = marketData.volume >= alert.volumeThreshold;
          }
          break;

        case AlertType.TECHNICAL_INDICATOR:
          // Implement technical indicator checks based on conditions
          isTriggered = await this.checkTechnicalIndicatorConditions(
            alert,
            marketData,
          );
          break;

        case AlertType.NEWS_SENTIMENT:
          // Implement news sentiment checks based on conditions
          isTriggered = await this.checkNewsSentimentConditions(alert);
          break;
      }

      if (isTriggered) {
        await this.triggerAlert(alert, marketData);
      }
    } catch (error) {
      this.logger.error(`Error checking alert ${alert.id}:`, error);
    }
  }

  private async triggerAlert(
    alert: MarketAlert,
    marketData: MarketData,
  ): Promise<void> {
    try {
      // Check if we should avoid duplicate notifications
      const timeSinceLastNotification = alert.lastNotificationAt
        ? Date.now() - alert.lastNotificationAt.getTime()
        : Infinity;

      // Don't send notification if last one was less than 5 minutes ago
      if (timeSinceLastNotification < 5 * 60 * 1000) {
        return;
      }

      // Update alert
      alert.status = alert.isRecurring
        ? AlertStatus.ACTIVE
        : AlertStatus.TRIGGERED;
      alert.triggeredAt = new Date();
      alert.triggeredPrice = marketData.price;
      alert.triggerCount += 1;
      alert.lastNotificationAt = new Date();

      await this.alertRepository.save(alert);

      // Emit alert triggered event
      this.eventEmitter.emit("alert.triggered", {
        alert,
        marketData,
        triggerDetails: {
          price: marketData.price,
          timestamp: new Date(),
          conditions: alert.conditions,
        },
      });

      this.logger.log(
        `Alert triggered: ${alert.title} for ${alert.symbol} at price ${marketData.price}`,
      );
    } catch (error) {
      this.logger.error(`Error triggering alert ${alert.id}:`, error);
    }
  }

  private async checkTechnicalIndicatorConditions(
    alert: MarketAlert,
    marketData: MarketData,
  ): Promise<boolean> {
    try {
      // Implement technical indicator checks based on alert.conditions
      // This could include RSI, MACD, Bollinger Bands, etc.
      const conditions = alert.conditions;

      if (conditions.indicator === "rsi") {
        // Example: RSI conditions
        return conditions.value > 70 || conditions.value < 30;
      }

      if (conditions.indicator === "bollinger_bands") {
        // Example: Bollinger Bands conditions
        return (
          marketData.price > conditions.upperBand ||
          marketData.price < conditions.lowerBand
        );
      }

      return false;
    } catch (error) {
      this.logger.error(
        "Error checking technical indicator conditions:",
        error,
      );
      return false;
    }
  }

  private async checkNewsSentimentConditions(
    alert: MarketAlert,
  ): Promise<boolean> {
    try {
      // Implement news sentiment checks
      // This would integrate with news APIs and sentiment analysis
      const conditions = alert.conditions;

      if (conditions.sentimentThreshold) {
        // Check if sentiment score meets threshold
        // This is a placeholder - implement based on your news service
        return false;
      }

      return false;
    } catch (error) {
      this.logger.error("Error checking news sentiment conditions:", error);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanupExpiredAlerts(): Promise<void> {
    try {
      const now = new Date();

      const result = await this.alertRepository
        .createQueryBuilder()
        .update(MarketAlert)
        .set({ status: AlertStatus.EXPIRED })
        .where("expiresAt < :now", { now })
        .andWhere("status = :status", { status: AlertStatus.ACTIVE })
        .execute();

      if (result.affected > 0) {
        this.logger.log(`Expired ${result.affected} alerts`);
      }
    } catch (error) {
      this.logger.error("Error cleaning up expired alerts:", error);
    }
  }

  async getAlertStatistics(userId: string): Promise<{
    total: number;
    active: number;
    triggered: number;
    expired: number;
    bySymbol: { symbol: string; count: number }[];
    byType: { type: AlertType; count: number }[];
  }> {
    try {
      const alerts = await this.alertRepository.find({
        where: { userId },
      });

      const stats = {
        total: alerts.length,
        active: alerts.filter((a) => a.status === AlertStatus.ACTIVE).length,
        triggered: alerts.filter((a) => a.status === AlertStatus.TRIGGERED)
          .length,
        expired: alerts.filter((a) => a.status === AlertStatus.EXPIRED).length,
        bySymbol: [] as { symbol: string; count: number }[],
        byType: [] as { type: AlertType; count: number }[],
      };

      // Group by symbol
      const symbolGroups = new Map<string, number>();
      alerts.forEach((alert) => {
        const count = symbolGroups.get(alert.symbol) || 0;
        symbolGroups.set(alert.symbol, count + 1);
      });
      stats.bySymbol = Array.from(symbolGroups.entries()).map(
        ([symbol, count]) => ({
          symbol,
          count,
        }),
      );

      // Group by type
      const typeGroups = new Map<AlertType, number>();
      alerts.forEach((alert) => {
        const count = typeGroups.get(alert.alertType) || 0;
        typeGroups.set(alert.alertType, count + 1);
      });
      stats.byType = Array.from(typeGroups.entries()).map(([type, count]) => ({
        type,
        count,
      }));

      return stats;
    } catch (error) {
      this.logger.error("Error getting alert statistics:", error);
      throw error;
    }
  }
}
