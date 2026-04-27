import { NestFactory } from '@nestjs/core';
import { TransaksiModule } from './transaksi/transaksi.module';

async function bootstrap() {
  const app = await NestFactory.create(TransaksiModule);
  await app.listen(3003);
}

bootstrap();