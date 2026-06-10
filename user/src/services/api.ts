const BASE_URL = 'http://192.168.21.205:3000';

export const apiLogin = async (email: string, password: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw new Error('Login gagal');
  return await res.json();
};

export const apiRegister = async (nama: string, email: string, password: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nama, username: email, password }),
  });
  if (!res.ok) throw new Error('Registrasi gagal');
  return await res.json();
};

export const apiGetProduk = async (token: string): Promise<any> => {
  try {
    const res = await fetch(`${BASE_URL}/produk`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Gagal ambil data produk');
    return await res.json();
  } catch {
    return {
      data: [
        { id: 1, nama: 'Voucher Google Play Rp 50.000', harga: 50000 },
        { id: 2, nama: 'Voucher Steam Rp 100.000', harga: 100000 },
        { id: 3, nama: 'Paket Data 10GB', harga: 35000 },
        { id: 4, nama: 'Voucher Spotify 1 Bulan', harga: 55000 },
        { id: 5, nama: 'Token Listrik Rp 50.000', harga: 50000 },
      ],
    };
  }
};

export const apiGetUser = async (token: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal ambil data user');
  return await res.json();
};

export const apiGetTransaksi = async (token: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/transaksi`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal ambil data transaksi');
  return await res.json();
};

export const apiTambahTransaksi = async (token: string, data: object): Promise<any> => {
  const res = await fetch(`${BASE_URL}/transaksi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal tambah transaksi');
  return await res.json();
};

export const apiHapusProduk = async (token: string, id: number): Promise<any> => {
  const res = await fetch(`${BASE_URL}/produk/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal hapus produk');
  return await res.json();
};

export const apiUpdateProduk = async (token: string, id: number, data: object): Promise<any> => {
  const res = await fetch(`${BASE_URL}/produk/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal update produk');
  return await res.json();
};