import { Module } from '@nestjs/common';
import { ProdukService } from './produk.service';
import { ProdukController } from './produk.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProdukController],
  providers: [ProdukService, PrismaService],
})
export class ProdukModule {}
