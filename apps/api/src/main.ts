/**
 * main.ts — Entry point NestJS Racik Media V3
 *
 * Menggunakan Fastify sebagai HTTP adapter (lebih cepat dari Express).
 * CORS dikonfigurasi dari env CORS_ORIGINS.
 * Global validation pipe aktif — semua request otomatis divalidasi via class-validator.
 */
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { validateConfig } from './core/config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validasi semua env vars saat startup — crash jika ada yang kurang
  validateConfig(process.env as Record<string, unknown>);

  // Buat aplikasi dengan Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 3001);
  const host = config.get<string>('API_HOST', '0.0.0.0');
  const prefix = config.get<string>('API_PREFIX', '/api/v1');
  const corsOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  // Prefix global semua endpoint: /api/v1/...
  app.setGlobalPrefix(prefix);

  // CORS — hanya izinkan domain yang ada di env
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Validasi otomatis semua DTO pakai class-validator
  // whitelist: true → hapus field yang tidak ada di DTO
  // forbidNonWhitelisted: true → error jika ada field asing
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,          // otomatis konversi tipe (string → number, dsb)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port, host);
  logger.log(`🚀 API berjalan di: http://${host}:${port}${prefix}`);
  logger.log(`📦 Environment: ${config.get('NODE_ENV', 'development')}`);
}

bootstrap();
