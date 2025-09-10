import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  IsUUID,
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  AlertType,
  AlertPriority,
  AlertStatus,
} from "../entities/market-alert.entity";

export class CreateAlertDto {
  @ApiProperty({ description: "Trading symbol" })
  @IsString()
  symbol: string;

  @ApiProperty({ description: "Alert type", enum: AlertType })
  @IsEnum(AlertType)
  alertType: AlertType;

  @ApiProperty({ description: "Alert title" })
  @IsString()
  title: string;

  @ApiProperty({ description: "Alert description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Alert conditions in JSON format" })
  @IsObject()
  conditions: Record<string, any>;

  @ApiProperty({
    description: "Target price (for price alerts)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  targetPrice?: number;

  @ApiProperty({ description: "Percentage change threshold", required: false })
  @IsOptional()
  @IsNumber()
  percentageThreshold?: number;

  @ApiProperty({ description: "Volume threshold", required: false })
  @IsOptional()
  @IsNumber()
  volumeThreshold?: number;

  @ApiProperty({
    description: "Alert priority",
    enum: AlertPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @ApiProperty({ description: "Is recurring alert", required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ description: "Alert expiration date", required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({
    description: "Notification methods",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationMethods?: string[];
}

export class UpdateAlertDto {
  @ApiProperty({ description: "Alert title", required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: "Alert description", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Alert conditions in JSON format",
    required: false,
  })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({
    description: "Target price (for price alerts)",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  targetPrice?: number;

  @ApiProperty({ description: "Percentage change threshold", required: false })
  @IsOptional()
  @IsNumber()
  percentageThreshold?: number;

  @ApiProperty({ description: "Volume threshold", required: false })
  @IsOptional()
  @IsNumber()
  volumeThreshold?: number;

  @ApiProperty({
    description: "Alert priority",
    enum: AlertPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @ApiProperty({
    description: "Alert status",
    enum: AlertStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiProperty({ description: "Is recurring alert", required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ description: "Alert expiration date", required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({
    description: "Notification methods",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationMethods?: string[];
}

export class GetAlertsDto {
  @ApiProperty({
    description: "Alert status filter",
    enum: AlertStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiProperty({ description: "Symbol filter", required: false })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiProperty({
    description: "Alert type filter",
    enum: AlertType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertType)
  alertType?: AlertType;

  @ApiProperty({
    description: "Priority filter",
    enum: AlertPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;
}

export class BulkCreateAlertsDto {
  @ApiProperty({
    description: "Array of alerts to create",
    type: [CreateAlertDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAlertDto)
  alerts: CreateAlertDto[];
}

export class BulkUpdateAlertsDto {
  @ApiProperty({ description: "Array of alert IDs to update", type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  alertIds: string[];

  @ApiProperty({ description: "Updates to apply" })
  @ValidateNested()
  @Type(() => UpdateAlertDto)
  updates: UpdateAlertDto;
}

export class BulkDeleteAlertsDto {
  @ApiProperty({ description: "Array of alert IDs to delete", type: [String] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  alertIds: string[];
}

export class AlertResponseDto {
  @ApiProperty({ description: "Alert ID" })
  id: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ description: "Trading symbol" })
  symbol: string;

  @ApiProperty({ description: "Alert type", enum: AlertType })
  alertType: AlertType;

  @ApiProperty({ description: "Alert title" })
  title: string;

  @ApiProperty({ description: "Alert description", required: false })
  description?: string;

  @ApiProperty({ description: "Alert conditions" })
  conditions: Record<string, any>;

  @ApiProperty({ description: "Target price", required: false })
  targetPrice?: number;

  @ApiProperty({ description: "Percentage change threshold", required: false })
  percentageThreshold?: number;

  @ApiProperty({ description: "Volume threshold", required: false })
  volumeThreshold?: number;

  @ApiProperty({ description: "Alert status", enum: AlertStatus })
  status: AlertStatus;

  @ApiProperty({ description: "Alert priority", enum: AlertPriority })
  priority: AlertPriority;

  @ApiProperty({ description: "Is recurring alert" })
  isRecurring: boolean;

  @ApiProperty({ description: "Alert expiration date", required: false })
  expiresAt?: Date;

  @ApiProperty({ description: "When alert was triggered", required: false })
  triggeredAt?: Date;

  @ApiProperty({
    description: "Price when alert was triggered",
    required: false,
  })
  triggeredPrice?: number;

  @ApiProperty({ description: "Number of times alert was triggered" })
  triggerCount: number;

  @ApiProperty({
    description: "Last notification sent timestamp",
    required: false,
  })
  lastNotificationAt?: Date;

  @ApiProperty({ description: "Notification methods", type: [String] })
  notificationMethods: string[];

  @ApiProperty({ description: "Created date" })
  createdAt: Date;

  @ApiProperty({ description: "Updated date" })
  updatedAt: Date;
}

export class AlertStatisticsDto {
  @ApiProperty({ description: "Total number of alerts" })
  total: number;

  @ApiProperty({ description: "Number of active alerts" })
  active: number;

  @ApiProperty({ description: "Number of triggered alerts" })
  triggered: number;

  @ApiProperty({ description: "Number of expired alerts" })
  expired: number;

  @ApiProperty({
    description: "Alerts grouped by symbol",
    type: [Object],
  })
  bySymbol: { symbol: string; count: number }[];

  @ApiProperty({
    description: "Alerts grouped by type",
    type: [Object],
  })
  byType: { type: AlertType; count: number }[];
}

export class AlertTestDto {
  @ApiProperty({
    description: "Mock price to test alert condition",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mockPrice?: number;

  @ApiProperty({
    description: "Mock volume to test alert condition",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mockVolume?: number;

  @ApiProperty({
    description: "Mock percentage change to test alert condition",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mockChangePercent?: number;
}

export class AlertTriggeredEventDto {
  @ApiProperty({ description: "Alert information" })
  alert: {
    id: string;
    symbol: string;
    title: string;
    alertType: AlertType;
    triggeredPrice: number;
    priority: AlertPriority;
  };

  @ApiProperty({ description: "Market data that triggered the alert" })
  marketData: {
    symbol: string;
    price: number;
    change?: number;
    changePercent?: number;
  };

  @ApiProperty({ description: "Trigger timestamp" })
  timestamp: string;
}
