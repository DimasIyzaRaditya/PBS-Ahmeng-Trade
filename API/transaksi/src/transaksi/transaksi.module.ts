import { Module } from '@nestjs/common';
import { TransaksiService } from './transaksi.service';
import { TransaksiController } from './transaksi.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TransaksiController],
  providers: [TransaksiService, PrismaService],
})
export class TransaksiModule {}
