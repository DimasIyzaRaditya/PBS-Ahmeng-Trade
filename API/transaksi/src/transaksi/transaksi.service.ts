import {
  Injectable,
  HttpStatus,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateTransaksiDto } from './dto/update-transaksi.dto';
import { formatResponse } from '../utils/response.util';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransaksiService {
  constructor(private readonly prisma: PrismaService) { }

  // validasi apakah produk benar-benar ada di service produk
  private async validateProduk(produkId: number): Promise<any> {
    const produkServiceUrl =
      process.env.PRODUK_SERVICE_URL ?? 'http://localhost:3002';

    try {
      const res = await fetch(`${produkServiceUrl}/produk/${produkId}`);

      if (res.status === 404) {
        throw new NotFoundException(
          `Produk dengan id ${produkId} tidak ditemukan`,
        );
      }

      if (!res.ok) {
        throw new BadGatewayException(
          `Gagal memvalidasi produk: produk service mengembalikan status ${res.status}`,
        );
      }

      const body: any = await res.json();
      if (!body?.data) {
        throw new NotFoundException(
          `Produk dengan id ${produkId} tidak ditemukan`,
        );
      }

      return body.data;
    } catch (err) {
      // re-throw jika sudah jenis error Nest
      if (err instanceof NotFoundException || err instanceof BadGatewayException) {
        throw err;
      }
      // network error / produk service mati
      throw new BadGatewayException(
        'Produk service tidak dapat dihubungi. Pastikan service produk sedang berjalan.',
      );
    }
  }

  // buat fungsi tambah data transaksi
  async create(createTransaksiDto: CreateTransaksiDto) {
    // validasi produkId ke produk service terlebih dahulu
    const produk = await this.validateProduk(createTransaksiDto.produkId);

    await this.prisma.transaksi.create({
      data: {
        produkId: createTransaksiDto.produkId,
        namaPembeli: createTransaksiDto.namaPembeli,
        emailPembeli: createTransaksiDto.emailPembeli,
        totalHarga: produk.harga,
      },
    });

    return formatResponse('Berhasil menyimpan data transaksi', undefined, HttpStatus.CREATED);
  }

  // buat fungsi ambil semua data transaksi
  async findAll() {
    const data = await this.prisma.transaksi.findMany();

    return formatResponse('Berhasil mengambil semua data transaksi', data);
  }

  // buat fungsi ambil data transaksi berdasarkan id
  async findOne(id: number) {
    const data = await this.prisma.transaksi.findUnique({
      where: { id: id },
    });

    return formatResponse('Berhasil mengambil data transaksi', data);
  }

  // buat fungsi update data transaksi berdasarkan id
  async update(id: number, updateTransaksiDto: UpdateTransaksiDto) {
    let hargaBaru: number | undefined = undefined;

    // jika produkId diupdate, validasi dulu ke produk service
    if (updateTransaksiDto.produkId !== undefined) {
      const produk = await this.validateProduk(updateTransaksiDto.produkId);
      hargaBaru = produk.harga;
    }

    const data = await this.prisma.transaksi.update({
      where: { id: id },
      data: {
        produkId: updateTransaksiDto.produkId,
        namaPembeli: updateTransaksiDto.namaPembeli,
        emailPembeli: updateTransaksiDto.emailPembeli,
        ...(hargaBaru !== undefined && { totalHarga: hargaBaru }),
      },
    });

    return formatResponse('Berhasil mengupdate data transaksi', data);
  }

  // buat fungsi hapus data transaksi berdasarkan id
  async remove(id: number) {
    const data = await this.prisma.transaksi.delete({
      where: { id: id },
    });

    return formatResponse('Berhasil menghapus data transaksi', data);
  }
}

