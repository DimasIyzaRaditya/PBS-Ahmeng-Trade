import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { PrismaProdukService } from '../prisma-produk.service';

@Injectable()
export class ProdukService {
  constructor(private readonly prisma: PrismaProdukService) {}

  // buat fungsi tambah data produk
  async create(createProdukDto: CreateProdukDto) {
    await this.prisma.produk.create({
      data: {
        nama: createProdukDto.nama,
        harga: createProdukDto.harga,
      },
    });

    return {
      success: true,
      message: 'Berhasil menyimpan data produk',
      metadata: { status: HttpStatus.CREATED },
    };
  }

  // buat fungsi ambil semua data produk
  async findAll() {
    const data = await this.prisma.produk.findMany();

    return {
      success: true,
      message: 'Berhasil mengambil semua data produk',
      data: data,
      metadata: { status: HttpStatus.OK },
    };
  }

  // buat fungsi ambil data produk berdasarkan id
  async findOne(id: number) {
    const data = await this.prisma.produk.findUnique({
      where: { id: id },
    });

    return {
      success: true,
      message: 'Berhasil mengambil data produk',
      data: data,
      metadata: { status: HttpStatus.OK },
    };
  }

  // buat fungsi update data produk berdasarkan id
  async update(id: number, updateProdukDto: UpdateProdukDto) {
    const data = await this.prisma.produk.update({
      where: { id: id },
      data: {
        nama: updateProdukDto.nama,
        harga: updateProdukDto.harga,
      },
    });

    return {
      success: true,
      message: 'Berhasil mengupdate data produk',
      data: data,
      metadata: { status: HttpStatus.OK },
    };
  }

  // buat fungsi hapus data produk berdasarkan id
  async remove(id: number) {
    const data = await this.prisma.produk.delete({
      where: { id: id },
    });

    return {
      success: true,
      message: 'Berhasil menghapus data produk',
      data: data,
      metadata: { status: HttpStatus.OK },
    };
  }
}
