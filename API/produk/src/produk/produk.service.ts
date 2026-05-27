import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateProdukDto } from './dto/create-produk.dto';
import { formatResponse } from '../utils/response.util';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProdukService {
  constructor(private readonly prisma: PrismaService) { }

  // buat fungsi tambah data produk
  async create(createProdukDto: CreateProdukDto) {
    await this.prisma.produk.create({
      data: {
        nama: createProdukDto.nama,
        harga: createProdukDto.harga,
      },
    });

    return formatResponse('Berhasil menyimpan data produk', undefined, HttpStatus.CREATED);
  }

  // buat fungsi ambil semua data produk
  async findAll() {
    const data = await this.prisma.produk.findMany();

    return formatResponse('Berhasil mengambil semua data produk', data);
  }

  // buat fungsi ambil data produk berdasarkan id
  async findOne(id: number) {
    const data = await this.prisma.produk.findUnique({
      where: { id: id },
    });

    return formatResponse('Berhasil mengambil data produk', data);
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

    return formatResponse('Berhasil mengupdate data produk', data);
  }

  // buat fungsi hapus data produk berdasarkan id
  async remove(id: number) {
    const data = await this.prisma.produk.delete({
      where: { id: id },
    });

    return formatResponse('Berhasil menghapus data produk', data);
  }
}
