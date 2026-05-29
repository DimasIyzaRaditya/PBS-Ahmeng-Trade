import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'username tidak boleh kosong' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'password tidak boleh kosong' })
  password!: string;
}

