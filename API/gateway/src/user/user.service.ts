import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaUserService } from '../prisma-user.service.js';

@Injectable()
export class UserService {
  // buat construktor untuk prisma
  constructor(private readonly prisma: PrismaUserService) { }

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

    // tampilan respon
    return {
      success: true,
      message: 'Berhasil mengambil data user',
      data: data,
      metadata: {
        status: HttpStatus.OK,
      },
    };
  }

  // buat fungsi update data user berdasarkan id
  async update(id: number, updateUserDto: UpdateUserDto) {
    // update data user berdasarkan id
    const data = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: updateUserDto.name,
        username: updateUserDto.username,
        password: updateUserDto.password,
      },
    });

    // tampilan respon
    return {
      success: true,
      message: 'Berhasil mengupdate data user',
      data: data,
      metadata: {
        status: HttpStatus.OK,
      },
    };
  }

  // buat fungsi hapus data user berdasarkan id
  async remove(id: number) {
    // hapus data user berdasarkan id
    const data = await this.prisma.user.delete({
      where: {
        id: id,
      },
    });

    // tampilan respon
    return {
      success: true,
      message: 'Berhasil menghapus data user',
      data: data,
      metadata: {
        status: HttpStatus.OK,
      },
    };
  }
}
