import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegister } from '../services/api';

interface User {
  id: number;
  name: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (nama: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai dalam AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.warn('Gagal load session:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const res = await apiLogin(username, password);
    const userData = res.data ?? res;
    const accessToken = userData.access_token ?? userData.token;
    const userInfo: User = {
      id: userData.user?.id ?? userData.id,
      name: userData.user?.name ?? userData.name,
      username: userData.user?.username ?? userData.username,
    };

    if (!accessToken) throw new Error('Token tidak ditemukan dari server');

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');

    setUser(userInfo);
    setToken(accessToken);
    await AsyncStorage.setItem('token', accessToken);
    await AsyncStorage.setItem('user', JSON.stringify(userInfo));
  };

  const register = async (nama: string, username: string, password: string): Promise<void> => {
    await apiRegister(nama, username, password);
    await login(username, password);
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};