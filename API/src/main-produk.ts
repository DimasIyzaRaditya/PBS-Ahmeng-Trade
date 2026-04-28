import { NestFactory } from '@nestjs/core';
import { ProdukModule } from './produk/produk.module';

async function bootstrap() {
  const app = await NestFactory.create(ProdukModule);
  await app.listen(3002);
}

bootstrap();
