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