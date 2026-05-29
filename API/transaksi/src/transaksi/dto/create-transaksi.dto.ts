import { IsString, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class CreateTransaksiDto {
  @IsNumber()
  produkId: number;

  @IsString()
  @IsNotEmpty()
  namaPembeli: string;

  @IsEmail()
  emailPembeli: string;
}
