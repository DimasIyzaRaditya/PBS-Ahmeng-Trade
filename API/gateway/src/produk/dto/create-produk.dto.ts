import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProdukDto {
  @IsString()
  @IsNotEmpty({ message: 'nama tidak boleh kosong' })
  nama: string;

  @IsNumber({}, { message: 'harga harus berupa angka' })
  harga: number;
}

