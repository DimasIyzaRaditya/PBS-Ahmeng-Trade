import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProdukModule } from './produk/produk.module';
import { TransaksiModule } from './transaksi/transaksi.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, UserModule, ProdukModule, TransaksiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

