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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AlertService, CreateAlertDto, UpdateAlertDto } from '../services/alert.service';
import { MarketAlert, AlertStatus } from '../entities/market-alert.entity';

@ApiTags('Market Alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(ThrottlerGuard)
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new market alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully', type: MarketAlert })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAlert(
    @Request() req: any,
    @Body() createAlertDto: Omit<CreateAlertDto, 'userId'>
  ): Promise<MarketAlert> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException('User authentication required', HttpStatus.UNAUTHORIZED);
      }

      return await this.alertService.createAlert({
        ...createAlertDto,
        userId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create alert',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get user alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully', type: [MarketAlert] })
  async getUserAlerts(
    @Request() req: any,
    @Query('status') status?: AlertStatus
  ): Promise<MarketAlert[]> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException('User authentication required', HttpStatus.UNAUTHORIZED);
      }

      return await this.alertService.getUserAlerts(userId, status);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get user alerts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('symbol/:symbol')
  @ApiOperation({ summary: 'Get alerts for a specific symbol' })
  @ApiResponse({ status: 200, description: 'Symbol alerts retrieved successfully', type: [MarketAlert] })
  async getAlertsBySymbol(
    @Param('symbol') symbol: string,
    @Query('status') status?: AlertStatus
  ): Promise<MarketAlert[]> {
    try {
      return await this.alertService.getAlertsBySymbol(symbol.toUpperCase(), status);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get alerts by symbol',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get alert statistics for the user' })
  @ApiResponse({ status: 200, description: 'Alert statistics retrieved successfully' })
  async getAlertStatistics(@Request() req: any) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException('User authentication required', HttpStatus.UNAUTHORIZED);
      }

      return await this.alertService.getAlertStatistics(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get alert statistics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert by ID' })
  @ApiResponse({ status: 200, description: 'Alert retrieved successfully', type: MarketAlert })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async getAlert(@Param('id') id: string): Promise<MarketAlert> {
    try {
      const alerts = await this.alertService.getUserAlerts(''); // This needs to be refactored
      const alert = alerts.find(a => a.id === id);
      
      if (!alert) {
        throw new HttpException('Alert not found', HttpStatus.NOT_FOUND);
      }

      return alert;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get alert',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an alert' })
  @ApiResponse({ status: 200, description: 'Alert updated successfully', type: MarketAlert })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async updateAlert(
    @Param('id') id: string,
    @Body() updateAlertDto: UpdateAlertDto
  ): Promise<MarketAlert> {
    try {
      return await this.alertService.updateAlert(id, updateAlertDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update alert',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  async deleteAlert(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.alertService.deleteAlert(id);
      return { message: 'Alert deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete alert',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('batch')
  @ApiOperation({ summary: 'Create multiple alerts' })
  @ApiResponse({ status: 201, description: 'Alerts created successfully' })
  async createBatchAlerts(
    @Request() req: any,
    @Body() createAlertsDto: { alerts: Omit<CreateAlertDto, 'userId'>[] }
  ) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException('User authentication required', HttpStatus.UNAUTHORIZED);
      }

      if (!Array.isArray(createAlertsDto.alerts) || createAlertsDto.alerts.length === 0) {
        throw new HttpException('Alerts array is required', HttpStatus.BAD_REQUEST);
      }

      if (createAlertsDto.alerts.length > 20) {
        throw new HttpException('Maximum 20 alerts allowed per batch', HttpStatus.BAD_REQUEST);
      }

      const results = [];
      const errors = [];

      for (const alertDto of createAlertsDto.alerts) {
        try {
          const alert = await this.alertService.createAlert({
            ...alertDto,
            userId,
          });
          results.push(alert);
        } catch (error) {
          errors.push({
            symbol: alertDto.symbol,
            error: error.message,
          });
        }
      }

      return {
        success: results,
        errors,
        summary: {
          total: createAlertsDto.alerts.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create batch alerts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('bulk-update')
  @ApiOperation({ summary: 'Bulk update alerts' })
  @ApiResponse({ status: 200, description: 'Alerts updated successfully' })
  async bulkUpdateAlerts(
    @Body() updateDto: {
      alertIds: string[];
      updates: UpdateAlertDto;
    }
  ) {
    try {
      if (!Array.isArray(updateDto.alertIds) || updateDto.alertIds.length === 0) {
        throw new HttpException('Alert IDs array is required', HttpStatus.BAD_REQUEST);
      }

      if (updateDto.alertIds.length > 50) {
        throw new HttpException('Maximum 50 alerts allowed per bulk update', HttpStatus.BAD_REQUEST);
      }

      const results = [];
      const errors = [];

      for (const alertId of updateDto.alertIds) {
        try {
          const alert = await this.alertService.updateAlert(alertId, updateDto.updates);
          results.push(alert);
        } catch (error) {
          errors.push({
            alertId,
            error: error.message,
          });
        }
      }

      return {
        success: results,
        errors,
        summary: {
          total: updateDto.alertIds.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to bulk update alerts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete alerts' })
  @ApiResponse({ status: 200, description: 'Alerts deleted successfully' })
  async bulkDeleteAlerts(
    @Body() deleteDto: { alertIds: string[] }
  ) {
    try {
      if (!Array.isArray(deleteDto.alertIds) || deleteDto.alertIds.length === 0) {
        throw new HttpException('Alert IDs array is required', HttpStatus.BAD_REQUEST);
      }

      if (deleteDto.alertIds.length > 50) {
        throw new HttpException('Maximum 50 alerts allowed per bulk delete', HttpStatus.BAD_REQUEST);
      }

      const results = [];
      const errors = [];

      for (const alertId of deleteDto.alertIds) {
        try {
          await this.alertService.deleteAlert(alertId);
          results.push(alertId);
        } catch (error) {
          errors.push({
            alertId,
            error: error.message,
          });
        }
      }

      return {
        success: results,
        errors,
        summary: {
          total: deleteDto.alertIds.length,
          successful: results.length,
          failed: errors.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to bulk delete alerts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('active/count')
  @ApiOperation({ summary: 'Get count of active alerts for user' })
  @ApiResponse({ status: 200, description: 'Active alert count retrieved successfully' })
  async getActiveAlertCount(@Request() req: any) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        throw new HttpException('User authentication required', HttpStatus.UNAUTHORIZED);
      }

      const activeAlerts = await this.alertService.getUserAlerts(userId, AlertStatus.ACTIVE);
      
      return {
        count: activeAlerts.length,
        userId,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get active alert count',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test an alert condition (simulation)' })
  @ApiResponse({ status: 200, description: 'Alert test completed' })
  async testAlert(
    @Param('id') id: string,
    @Body() testData?: { mockPrice?: number }
  ) {
    try {
      // This would be a test/simulation endpoint to see if alert conditions would trigger
      // Implementation would depend on your specific requirements
      
      return {
        message: 'Alert test functionality not yet implemented',
        alertId: id,
        testData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to test alert',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}