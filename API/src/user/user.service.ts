import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class UserService {
  // buat construktor untuk prisma
  constructor(private readonly prisma: PrismaService) { }

  // buat fungsi tambah data user
  async create(createUserDto: CreateUserDto) {
    // simpan data user baru
    await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        username: createUserDto.username,
        password: createUserDto.password,
      },
    });

    // tampilan respon

  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
