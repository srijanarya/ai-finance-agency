import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get service information',
    description: 'Retrieve basic information about the Content Intelligence Engine service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service information retrieved successfully',
  })
  getServiceInfo(): {
    service: string;
    version: string;
    status: string;
    description: string;
    features: string[];
  } {
    return this.appService.getServiceInfo();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the service is healthy and operational',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
  } {
    return this.appService.getHealth();
  }
}