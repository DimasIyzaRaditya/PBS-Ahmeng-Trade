import { NestFactory } from '@nestjs/core';
import { ProdukModule } from './produk/produk.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ProdukModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3002);
}

bootstrap();
