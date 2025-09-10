import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for webhook signature verification
  });

  const configService = app.get(ConfigService);
  const port = configService.get('payment.api.port');
  const host = configService.get('payment.api.host');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.enableCors({
    origin: configService.get('payment.security.cors.origin'),
    credentials: configService.get('payment.security.cors.credentials'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Body parsing middleware
  app.use('/webhooks', json({ limit: '5mb' })); // Raw JSON for webhooks
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  const apiPrefix = configService.get('payment.api.prefix');
  const apiVersion = configService.get('payment.api.version');
  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  // Swagger documentation
  if (configService.get('payment.api.swaggerEnabled')) {
    const config = new DocumentBuilder()
      .setTitle('Payment Service API')
      .setDescription('Comprehensive payment processing service for trading platform')
      .setVersion('1.0')
      .addTag('Payments', 'Payment processing and management')
      .addTag('Wallets', 'Digital wallet management')
      .addTag('Subscriptions', 'Recurring billing and subscriptions')
      .addTag('Invoices', 'Invoice generation and management')
      .addTag('Webhooks', 'Payment provider webhooks')
      .addBearerAuth()
      .addServer(`http://localhost:${port}`, 'Development server')
      .addServer('https://api.tradingplatform.com', 'Production server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = configService.get('payment.api.swaggerPath');
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
    
    logger.log(`Swagger documentation available at http://localhost:${port}/${swaggerPath}`);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  // Start server
  await app.listen(port, host);
  logger.log(`Payment service running on http://${host}:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`API available at http://${host}:${port}/${apiPrefix}/${apiVersion}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start payment service', error.stack);
  process.exit(1);
});
