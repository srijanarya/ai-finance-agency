import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('RiskManagement');
  
  // Create HTTP application
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Risk Management API')
    .setDescription('Enterprise-grade risk management service for AI Finance Agency')
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
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Setup gRPC microservice
  const grpcOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'treum.risk',
      protoPath: join(__dirname, '../../../packages/grpc-contracts/proto/risk.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || 5007}`,
    },
  };

  const microservice = app.connectMicroservice(grpcOptions);

  // Start HTTP server
  const port = process.env.PORT || 3007;
  await app.startAllMicroservices();
  await app.listen(port);
  
  logger.log(`🚀 Risk Management Service started on port ${port}`);
  logger.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  logger.log(`🔄 gRPC Service listening on port ${process.env.GRPC_PORT || 5007}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Risk Management Service:', error);
  process.exit(1);
});