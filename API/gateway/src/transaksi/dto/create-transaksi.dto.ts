import { IsString, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class CreateTransaksiDto {
  @IsNumber({}, { message: 'produkId harus berupa angka' })
  produkId: number;

  @IsString()
  @IsNotEmpty({ message: 'namaPembeli tidak boleh kosong' })
  namaPembeli: string;

  @IsEmail({}, { message: 'emailPembeli harus berupa email yang valid' })
  emailPembeli: string;
}

