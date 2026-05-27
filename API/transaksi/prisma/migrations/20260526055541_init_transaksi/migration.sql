-- CreateTable
CREATE TABLE "Transaksi" (
    "id" SERIAL NOT NULL,
    "produkId" INTEGER NOT NULL,
    "namaPembeli" TEXT NOT NULL,
    "emailPembeli" TEXT NOT NULL,
    "totalHarga" INTEGER NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);
