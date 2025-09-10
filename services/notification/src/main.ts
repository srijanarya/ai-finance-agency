import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      cors: false, // We'll configure CORS manually
    });

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3006);
    const environment = configService.get<string>('NODE_ENV', 'development');

    // Security middleware
    app.use(
      helmet.default({
        contentSecurityPolicy: environment === 'production' ? undefined : false,
        crossOriginEmbedderPolicy: environment === 'production',
      }),
    );

    // Compression middleware
    app.use(compression());

    // CORS configuration
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN', '*').split(','),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-Id',
        'X-API-Key',
      ],
      exposedHeaders: [
        'X-Request-Id',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
      ],
      maxAge: 86400, // 24 hours
    });

    // API versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
      prefix: 'api/v',
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // Global filters
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global interceptors
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger documentation
    if (environment !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Notification Service API')
        .setDescription(
          'Real-time notification service for AI Finance Agency',
        )
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addApiKey(
          {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API Key for service-to-service communication',
          },
          'api-key',
        )
        .addServer(`http://localhost:${port}`, 'Local Development')
        .addServer('https://api.staging.aifinanceagency.com', 'Staging')
        .addServer('https://api.aifinanceagency.com', 'Production')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });

      logger.log(
        `Swagger documentation available at http://localhost:${port}/api/docs`,
      );
    }

    // Graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.log(`Received ${signal}, starting graceful shutdown...`);

        try {
          await app.close();
          logger.log('Application closed successfully');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', error);
          process.exit(1);
        }
      });
    });

    // Start the application
    await app.listen(port, '0.0.0.0');

    logger.log(`
      ========================================
      Notification Service Started
      ========================================
      Environment: ${environment}
      Port: ${port}
      API URL: http://localhost:${port}/api
      Docs: ${environment !== 'production' ? `http://localhost:${port}/api/docs` : 'Disabled'}
      Health: http://localhost:${port}/api/health
      ========================================
    `);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
