import { Platform } from 'react-native';
import Constants from 'expo-constants';

// This config chooses a sensible default BASE_URL for local/team testing:
// - If you set `expo.extra.API_BASE_URL` (app config) it will be used.
// - On Android emulator use 10.0.2.2 which maps to host machine.
// - Otherwise prefer localhost:3000 (or change DEFAULT_PORT).

const DEFAULT_PORT = 3000;

const extra = (Constants.manifest && (Constants.manifest as any).extra) || (Constants.expoConfig && (Constants.expoConfig as any).extra) || {};

const expoOverride: string | undefined = extra.API_BASE_URL;

const chooseBaseUrl = (): string => {
  if (expoOverride) return expoOverride;
  // User asked to default to Android emulator address for testing
  return `http://10.0.2.2:${DEFAULT_PORT}`;
};

export const API_BASE_URL = chooseBaseUrl();

export const ENDPOINTS = {
  login: '/auth/login',
  register: '/user',
  produk: '/produk',
  transaksi: '/transaksi',
  user: '/user',
};

export const url = (path: string) => `${API_BASE_URL}${path}`;
