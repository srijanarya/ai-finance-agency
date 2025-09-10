import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stripe')
  @ApiExcludeEndpoint() // Hide from Swagger as this is for webhook providers
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    this.logger.log('Received Stripe webhook');

    if (!signature) {
      this.logger.error('Missing Stripe signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const rawBody = request.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Missing request body');
      }

      await this.webhookService.handleStripeWebhook(rawBody, signature);
      
      this.logger.log('Stripe webhook processed successfully');
      return { received: true };
    } catch (error) {
      this.logger.error(`Failed to process Stripe webhook: ${error.message}`, error.stack);
      throw new BadRequestException(`Webhook processing failed: ${error.message}`);
    }
  }

  @Post('paypal')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handlePayPalWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ): Promise<{ received: boolean }> {
    this.logger.log('Received PayPal webhook');

    try {
      const rawBody = request.rawBody;
      const webhookHeaders = {
        'paypal-auth-algo': headers['paypal-auth-algo'],
        'paypal-transmission-id': headers['paypal-transmission-id'],
        'paypal-cert-id': headers['paypal-cert-id'],
        'paypal-transmission-sig': headers['paypal-transmission-sig'],
        'paypal-transmission-time': headers['paypal-transmission-time'],
      };

      await this.webhookService.handlePayPalWebhook(rawBody, webhookHeaders);
      
      this.logger.log('PayPal webhook processed successfully');
      return { received: true };
    } catch (error) {
      this.logger.error(`Failed to process PayPal webhook: ${error.message}`, error.stack);
      throw new BadRequestException(`Webhook processing failed: ${error.message}`);
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Test webhook endpoint for development' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test webhook received successfully',
  })
  @HttpCode(HttpStatus.OK)
  async handleTestWebhook(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ): Promise<{ received: boolean; data: any }> {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new BadRequestException('Test webhooks not available in production');
    }

    this.logger.log('Received test webhook');
    this.logger.debug(`Test webhook body: ${JSON.stringify(body)}`);
    this.logger.debug(`Test webhook headers: ${JSON.stringify(headers)}`);

    try {
      await this.webhookService.handleTestWebhook(body, headers);
      return { received: true, data: body };
    } catch (error) {
      this.logger.error(`Failed to process test webhook: ${error.message}`, error.stack);
      throw new BadRequestException(`Test webhook processing failed: ${error.message}`);
    }
  }

  // Health check endpoint for webhook providers
  @Post('health')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}