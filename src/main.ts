import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function parseCorsOrigins(corsOrigin?: string) {
  const configuredOrigins = corsOrigin
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const mergedOrigins = new Set(DEFAULT_CORS_ORIGINS);

  configuredOrigins?.forEach((origin) => mergedOrigins.add(origin));

  return Array.from(mergedOrigins);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigins = parseCorsOrigins(
    configService.get<string>('CORS_ORIGIN'),
  );

  // Enable CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Start server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📊 Environment: ${configService.get('NODE_ENV') || 'development'}`,
  );
  console.log(`🌐 CORS origins: ${corsOrigins.join(', ')}`);
}

bootstrap();
