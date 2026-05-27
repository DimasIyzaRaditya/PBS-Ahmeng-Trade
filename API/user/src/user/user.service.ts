import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { formatResponse } from '../utils/response.util';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  // buat construktor untuk prisma
  constructor(private readonly prisma: PrismaService) { }

  // buat fungsi tambah data user
  async create(createUserDto: CreateUserDto) {
    // hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // simpan data user baru
    await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        username: createUserDto.username,
        password: hashedPassword,
      },
    });

    // tampilan respon
    return formatResponse('Berhasil menyimpan data user', undefined, HttpStatus.CREATED);
  }

  // buat fungsi ambil semua data user
  async findAll() {
    // ambil semua data user dari database
    const data = await this.prisma.user.findMany();

    // tampilan respon
    return formatResponse('Berhasil mengambil semua data user', data);
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
    return formatResponse('Berhasil mengambil data user', data);
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
    return formatResponse('Berhasil mengupdate data user', data);
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
    return formatResponse('Berhasil menghapus data user', data);
  }
}
