import { Module } from '@nestjs/common';
import { TransaksiService } from './transaksi.service';
import { TransaksiController } from './transaksi.controller';
import { PrismaTransaksiService } from '../prisma-transaksi.service';

@Module({
  controllers: [TransaksiController],
  providers: [TransaksiService, PrismaTransaksiService],
})
export class TransaksiModule {}
