import { Injectable, HttpStatus, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaUserService } from '../prisma-user.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  // buat construktor untuk prisma
  constructor(private readonly prisma: PrismaUserService) { }

  // buat fungsi tambah data user
  async create(createUserDto: CreateUserDto) {
    // hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // simpan data user baru
    try {
      await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          username: createUserDto.username,
          password: hashedPassword,
        },
      });
    } catch (error: any) {
      // P2002 = unique constraint violation (username sudah dipakai)
      if (error?.code === 'P2002') {
        throw new ConflictException(`Username "${createUserDto.username}" sudah dipakai, gunakan username lain`);
      }
      throw error;
    }

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
    // hash password baru jika disertakan
    let hashedPassword: string | undefined = undefined;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    // update data user berdasarkan id
    const data = await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: updateUserDto.name,
        username: updateUserDto.username,
        password: hashedPassword,
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
