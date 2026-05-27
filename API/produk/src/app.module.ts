import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdukModule } from './produk/produk.module';

@Module({
  imports: [ProdukModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
