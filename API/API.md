# Panduan Integrasi API untuk Frontend

Dokumen ini berisi panduan lengkap untuk tim frontend dalam melakukan integrasi dengan backend API. Backend menggunakan arsitektur microservices yang digabungkan melalui **API Gateway** sebagai single entry point.

---

##  Cara Menjalankan API
Semua command di bawah ini harus dijalankan di dalam folder `API/`.

*   **Jalankan Normal (Production)**
    ```bash
    npm run start
    ```
*   **Jalankan dengan Hot-Reload (Development)**
    ```bash
    npm run dev
    ```
*   **Mengatasi Port Error / Masih Terpakai**
    Jika mendapatkan error port sudah digunakan, jalankan command berikut untuk mematikan proses node yang menggantung:
    ```bash
    npm run kill
    ```
    Setelah itu, jalankan kembali dengan `npm run dev` atau `npm run start`.

---

##  Informasi Server & Base URL
Walaupun sistem di backend menggunakan beberapa microservices dengan port tersendiri (User: `3001`, Produk: `3002`, Transaksi: `3003`), frontend **hanya perlu menembak ke API Gateway** sebagai perantara utama.

*   **Base URL:** `http://localhost:3000`
*   **Format Response Standar (Success):**
    ```json
    {
      "success": true,
      "message": "Pesan sukses dari server",
      "data": { ... },
      "metadata": {
        "status": 200
      }
    }
    ```
*   **Format Response Standar (Error/Validation):**
    ```json
    {
      "message": "Pesan error spesifik",
      "error": "Tipe Error (misal: Bad Request, Not Found)",
      "statusCode": 400
    }
    ```

---

##  1. User API (`/user`)
Digunakan untuk mengelola data pengguna (nama, username, password).

### Model Schema
| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `Int` (Auto-increment) | ID unik User |
| `name` | `String` | Nama lengkap User |
| `username`| `String` | Username untuk login (unik) |
| `password`| `String` | Password User |

### Endpoints
*   **GET `/user`** - Ambil semua user.
*   **GET `/user/:id`** - Ambil user berdasarkan ID.
*   **POST `/user`** - Tambah user baru.
    *   **Body (JSON):**
        ```json
        {
          "name": "Dimas Raditya",
          "username": "dimasraditya",
          "password": "securepassword123"
        }
        ```
*   **PATCH `/user/:id`** - Update data user.
    *   **Body (JSON) [Partial/Opsional]:**
        ```json
        {
          "name": "Dimas Iyza Raditya"
        }
        ```
*   **DELETE `/user/:id`** - Hapus user berdasarkan ID.

---

## 2. Produk API (`/produk`)
Digunakan untuk mengelola katalog produk.

### Model Schema
| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `Int` (Auto-increment) | ID unik Produk |
| `nama` | `String` | Nama produk |
| `harga` | `Float / Int` | Harga produk |

### Endpoints
*   **GET `/produk`** - Ambil semua produk.
*   **GET `/produk/:id`** - Ambil detail produk berdasarkan ID.
*   **POST `/produk`** - Tambah produk baru.
    *   **Body (JSON):**
        ```json
        {
          "nama": "Sepatu Compass Gazelle",
          "harga": 450000
        }
        ```
*   **PATCH `/produk/:id`** - Update data produk.
    *   **Body (JSON) [Partial/Opsional]:**
        ```json
        {
          "harga": 480000
        }
        ```
*   **DELETE `/produk/:id`** - Hapus produk berdasarkan ID.

---

## 3. Transaksi API (`/transaksi`)
Digunakan untuk mengelola transaksi pembelian produk.

### Model Schema
| Field | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `id` | `Int` (Auto-increment) | ID unik Transaksi |
| `produkId` | `Int` | Referensi logis ke ID Produk di Produk Service |
| `namaPembeli` | `String` | Nama lengkap pembeli |
| `emailPembeli`| `String` | Email aktif pembeli |
| `totalHarga` | `Float / Int` | Total harga pembayaran transaksi |
| `createdAt` | `DateTime` | Tanggal transaksi dibuat (otomatis) |

### Catatan Penting untuk Frontend (Validasi Relasi):
*   Field **`produkId`** harus berupa ID produk yang valid dan **terdaftar** di database Produk.
*   Sebelum transaksi dibuat atau di-update, backend akan melakukan **validasi lintas service (HTTP call)** ke Produk Service.
*   Jika `produkId` yang dikirimkan tidak valid/tidak ditemukan, API Gateway akan mengembalikan status `404 Not Found` dengan pesan:
    ```json
    {
      "message": "Produk dengan id <produkId> tidak ditemukan",
      "error": "Not Found",
      "statusCode": 404
    }
    ```
*   Jika service produk sedang mati atau tidak dapat diakses oleh gateway, API Gateway akan mengembalikan status `502 Bad Gateway`.

### Endpoints
*   **GET `/transaksi`** - Ambil semua transaksi.
*   **GET `/transaksi/:id`** - Ambil detail transaksi berdasarkan ID.
*   **POST `/transaksi`** - Buat transaksi baru.
    *   **Body (JSON):**
        ```json
        {
          "produkId": 1,
          "namaPembeli": "Ahmeng",
          "emailPembeli": "ahmeng@example.com",
          "totalHarga": 450000
        }
        ```
*   **PATCH `/transaksi/:id`** - Update transaksi.
    *   **Body (JSON) [Partial/Opsional]:**
        ```json
        {
          "namaPembeli": "Ahmeng Trade"
        }
        ```
*   **DELETE `/transaksi/:id`** - Hapus transaksi berdasarkan ID.

---

## Tips & Integrasi Frontend
1.  **Tipe Data Numerik:** Pastikan nilai field `harga`, `totalHarga`, dan `produkId` dikirim sebagai tipe data `number` (bukan string).
2.  **CORS (Cross-Origin Resource Sharing):** Jika mendapati error CORS saat melakukan fetch dari frontend (misalnya React/Vue/Svelte yang berjalan di localhost port lain), silakan minta tim backend untuk menambahkan `app.enableCors()` di file `gateway/src/main.ts`.
3.  **Error Handling:** Tangkap object error dari backend untuk memberikan feedback yang interaktif bagi user (misal menampilkan alert *"Produk tidak ditemukan"* jika status code yang dikembalikan adalah `404` pada saat submit transaksi).