const BASE_URL = 'http://localhost:8000/api';

export const apiLogin = async (email, password) => {
  return { token: 'dummy-token', user: { email } };
};

export const apiGetProduk = async () => {
  return [];
};

export const apiRegister = async (nama, email, password) => {
  return { token: 'dummy-token', user: { nama, email } };
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