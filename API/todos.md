# 📋 API PBS — Todos & Progress

## ✅ Yang Sudah Selesai

### Struktur Proyek
- [x] Monorepo API dengan 4 service terpisah
- [x] Root `package.json` dengan `concurrently` untuk run semua service sekaligus
- [x] `.gitignore` lengkap di semua level (root, API, tiap service)

### Scripts (dari folder `API/`)
| Command | Fungsi |
|---|---|
| `npm run start` | Jalankan semua service (production) |
| `npm run dev` | Jalankan semua service (hot-reload) |
| `npm run build` | Build semua service |
| `npm run kill` | Matikan semua proses Node.js |

---

### 🔵 Service: Gateway (`port 3000`)
- [x] `main.ts` → load `AppModule`, listen port **3000**
- [x] `AppModule` → import `UserModule`, `ProdukModule`, `TransaksiModule`
- [x] 3 PrismaService terpisah:
  - `PrismaUserService` → `USER_DATABASE_URL` (`db_user`)
  - `PrismaProdukService` → `PRODUK_DATABASE_URL` (`db_produk`)
  - `PrismaTransaksiService` → `TRANSAKSI_DATABASE_URL` (`db_transaksi`)
- [x] Schema Prisma gabungan (semua model) → generate unified client
- [x] `.env` berisi `USER_DATABASE_URL`, `PRODUK_DATABASE_URL`, `TRANSAKSI_DATABASE_URL`, `PRODUK_SERVICE_URL`
- [x] Semua route ter-expose di satu port:
  - `/user` → `UserModule`
  - `/produk` → `ProdukModule`
  - `/transaksi` → `TransaksiModule`

---

### 🟢 Service: User (`port 3001`) — Database: `db_user`
- [x] `main.ts` → listen port **3001**
- [x] Prisma schema → model `User` (id, name, username, password)
- [x] Migration: `init_user`
- [x] CRUD lengkap:
  - `POST   /user` — tambah user
  - `GET    /user` — ambil semua user
  - `GET    /user/:id` — ambil user by id
  - `PATCH  /user/:id` — update user
  - `DELETE /user/:id` — hapus user
- [x] Tested & verified via HTTP

---

### 🟡 Service: Produk (`port 3002`) — Database: `db_produk`
- [x] `main.ts` → listen port **3002**
- [x] Prisma schema → model `Produk` (id, nama, harga)
- [x] Migration: `init_produk`
- [x] CRUD lengkap:
  - `POST   /produk` — tambah produk
  - `GET    /produk` — ambil semua produk
  - `GET    /produk/:id` — ambil produk by id
  - `PATCH  /produk/:id` — update produk
  - `DELETE /produk/:id` — hapus produk
- [x] Tested & verified via HTTP

---

### 🟣 Service: Transaksi (`port 3003`) — Database: `db_transaksi`
- [x] `main.ts` → listen port **3003**
- [x] Prisma schema → model `Transaksi` (id, produkId, namaPembeli, emailPembeli, totalHarga, createdAt)
- [x] Migration: `init_transaksi`
- [x] `produkId` adalah referensi **logis** ke `db_produk` (bukan FK constraint karena lintas database)
- [x] Validasi `produkId` via HTTP call ke produk service sebelum create/update
- [x] `.env` berisi `PRODUK_SERVICE_URL=http://localhost:3002`
- [x] CRUD lengkap:
  - `POST   /transaksi` — tambah transaksi (validasi produkId dulu)
  - `GET    /transaksi` — ambil semua transaksi
  - `GET    /transaksi/:id` — ambil transaksi by id
  - `PATCH  /transaksi/:id` — update transaksi (validasi produkId jika diubah)
  - `DELETE /transaksi/:id` — hapus transaksi
- [x] Tested & verified via HTTP

---

## 🔲 Template: Cara Menambah Service Baru

Ikuti langkah berikut untuk menambah service baru (contoh: `kategori`):

### 1. Buat folder service baru
Buat folder `API/namaservice/` dengan struktur sama seperti service yang sudah ada.

### 2. Tentukan port
| Service | Port |
|---|---|
| gateway | 3000 |
| user | 3001 |
| produk | 3002 |
| transaksi | 3003 |
| **service baru** | **3004, 3005, dst.** |

### 3. Buat `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model NamaModel {
  id Int @id @default(autoincrement())
  // tambah field lainnya...
}
```

### 4. Buat `prisma.config.ts`
```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

### 5. Setup `.env`
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/db_namaservice"
# tambah env lain jika butuh validasi ke service lain:
# PRODUK_SERVICE_URL="http://localhost:3002"
```

### 6. Jalankan migration & generate client
```bash
npx prisma migrate dev --name init_namaservice
npx prisma generate
```

### 7. Implement `src/`
```
src/
├── main.ts                        ← listen port baru
├── app.module.ts                  ← import hanya NamaserviceModule
├── prisma.service.ts              ← copy dari service lain
└── namaservice/
    ├── namaservice.module.ts      ← providers: [NamaserviceService, PrismaService]
    ├── namaservice.service.ts     ← CRUD dengan Prisma
    ├── namaservice.controller.ts  ← REST endpoints
    └── dto/
        ├── create-namaservice.dto.ts
        └── update-namaservice.dto.ts  ← PartialType(CreateDto)
```

### 8. Tambahkan ke root `API/package.json`
Tambah `--prefix namaservice` di script `dev`, `start`, dan `build`.

### 9. Copy src ke gateway
```powershell
Copy-Item -Path "namaservice/src/namaservice/*" -Destination "gateway/src/namaservice/" -Recurse -Force
```

### 10. Buat PrismaService di gateway
Buat file `gateway/src/prisma-namaservice.service.ts`:
```ts
export class PrismaNamaserviceService extends PrismaClient {
  constructor() {
    super({ adapter: new PrismaPg({
      connectionString: process.env.NAMASERVICE_DATABASE_URL
    })});
  }
  async onModuleInit() { await this.$connect(); }
}
```

### 11. Update gateway
- Tambah model ke `gateway/prisma/schema.prisma`
- Tambah `NAMASERVICE_DATABASE_URL` ke `gateway/.env`
- Update `gateway/src/namaservice/namaservice.module.ts` → pakai `PrismaNamaserviceService`
- Update `gateway/src/namaservice/namaservice.service.ts` → inject `PrismaNamaserviceService`
- Update `gateway/src/app.module.ts` → import `NamaserviceModule`
- Jalankan `npx prisma generate` di folder gateway

### 12. Test semua endpoint
```powershell
# Test via gateway (port 3000) dan service langsung (port baru)
Invoke-WebRequest -Uri "http://localhost:3000/namaservice" -Method GET | Select-Object -ExpandProperty Content
Invoke-WebRequest -Uri "http://localhost:PORT/namaservice" -Method GET | Select-Object -ExpandProperty Content
```

---

## 📁 Struktur File Referensi

```
API/
├── package.json              ← scripts: start, dev, build, kill
├── .gitignore
├── node_modules/             ← concurrently
├── gateway/                  ← port 3000 (aggregator semua route)
│   ├── .env                  ← USER/PRODUK/TRANSAKSI_DATABASE_URL
│   ├── prisma/schema.prisma  ← semua model (untuk generate unified client)
│   └── src/
│       ├── main.ts           ← listen 3000, load AppModule
│       ├── app.module.ts     ← import semua modul
│       ├── prisma-user.service.ts
│       ├── prisma-produk.service.ts
│       ├── prisma-transaksi.service.ts
│       ├── user/             ← copy dari user service
│       ├── produk/           ← copy dari produk service
│       └── transaksi/        ← copy dari transaksi service
├── user/                     ← port 3001, db_user
│   ├── .env                  ← DATABASE_URL=db_user
│   └── src/user/             ← CRUD User
├── produk/                   ← port 3002, db_produk
│   ├── .env                  ← DATABASE_URL=db_produk
│   └── src/produk/           ← CRUD Produk
└── transaksi/                ← port 3003, db_transaksi
    ├── .env                  ← DATABASE_URL=db_transaksi, PRODUK_SERVICE_URL
    └── src/transaksi/        ← CRUD Transaksi + validasi produkId
```
