const BASE_URL = 'http://192.168.1.7:8000/api';

export const apiLogin = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login gagal');
  return await res.json();
};

export const apiRegister = async (nama, email, password) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama, email, password }),
  });
  if (!res.ok) throw new Error('Registrasi gagal');
  return await res.json();
};

export const apiGetProduk = async (token) => {
  const res = await fetch(`${BASE_URL}/produk`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal ambil data produk');
  return await res.json();
};

export const apiGetUser = async (token) => {
  const res = await fetch(`${BASE_URL}/user`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal ambil data user');
  return await res.json();
};

export const apiGetTransaksi = async (token) => {
  const res = await fetch(`${BASE_URL}/transaksi`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Gagal ambil data transaksi');
  return await res.json();
};

export const apiTambahTransaksi = async (data) => {
  return { success: true, data };
};

export const apiHapusProduk = async (id) => {
  return { success: true };
};

export const apiUpdateProduk = async (id, data) => {
  return { success: true, data };
};