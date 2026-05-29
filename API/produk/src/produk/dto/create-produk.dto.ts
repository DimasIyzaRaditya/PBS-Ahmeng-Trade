import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProdukDto {
  @IsString()
  @IsNotEmpty()
  nama: string;

  @IsNumber()
  harga: number;
}
