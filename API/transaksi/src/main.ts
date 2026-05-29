import { NestFactory } from '@nestjs/core';
import { TransaksiModule } from './transaksi/transaksi.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(TransaksiModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3003);
}

bootstrap();
