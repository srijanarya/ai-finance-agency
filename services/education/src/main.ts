import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet({
    contentSecurityPolicy: configService.get('security.helmet.contentSecurityPolicy'),
  }));

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: configService.get('cors.credentials'),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (configService.get('nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(configService.get('swagger.title'))
      .setDescription(configService.get('swagger.description'))
      .setVersion(configService.get('swagger.version'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get('swagger.path'), app, document);
  }

  const port = configService.get('port');
  await app.listen(port);

  console.log(`🚀 Education service is running on: http://localhost:${port}/api/v1`);
  if (configService.get('nodeEnv') !== 'production') {
    console.log(`📚 Swagger docs available at: http://localhost:${port}/${configService.get('swagger.path')}`);
  }
}

bootstrap();
