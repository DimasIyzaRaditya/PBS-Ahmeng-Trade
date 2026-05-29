import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'name tidak boleh kosong' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'username tidak boleh kosong' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'password tidak boleh kosong' })
  password!: string;
}

