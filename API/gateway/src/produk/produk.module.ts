import { Module } from '@nestjs/common';
import { ProdukService } from './produk.service';
import { ProdukController } from './produk.controller';
import { PrismaProdukService } from '../prisma-produk.service';

@Module({
  controllers: [ProdukController],
  providers: [ProdukService, PrismaProdukService],
})
export class ProdukModule {}
