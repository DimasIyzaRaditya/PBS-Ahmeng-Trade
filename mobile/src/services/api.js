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
  return { token: 'dummy-token', user: { nama, email } };
};

export const apiGetProduk = async () => {
  return [];
};

export const apiGetUser = async () => {
  return {};
};

export const apiGetTransaksi = async () => {
  return [];
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