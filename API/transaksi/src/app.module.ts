import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransaksiModule } from './transaksi/transaksi.module';

@Module({
  imports: [TransaksiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
