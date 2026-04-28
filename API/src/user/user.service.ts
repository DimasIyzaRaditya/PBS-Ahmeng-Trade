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
    return {
      success: true,
      message: 'Berhasil menyimpan data user',
      metadata: {
        status: HttpStatus.CREATED,
      },
    };
  }

  // buat fungsi ambil semua data user
  async findAll() {
    // ambil semua data user dari database
    const data = await this.prisma.user.findMany();

    // tampilan respon
    return {
      success: true,
      message: 'Berhasil mengambil semua data user',
      data: data,
      metadata: {
        status: HttpStatus.OK,
      },
    };
  }

  // buat fungsi ambil data user berdasarkan id
  async findOne(id: number) {
    // cari data user berdasarkan id
    const data = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
