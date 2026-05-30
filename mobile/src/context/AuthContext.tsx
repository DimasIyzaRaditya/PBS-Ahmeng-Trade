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
  login: (email: string, password: string) => Promise<void>;
  register: (nama: string, email: string, password: string) => Promise<void>;
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

  const login = async (email: string, password: string): Promise<void> => {
    const res = await apiLogin(email, password);
    setUser(res.user);
    setToken(res.token);
    await AsyncStorage.setItem('token', res.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.user));
  };

  const register = async (nama: string, email: string, password: string): Promise<void> => {
    await apiRegister(nama, email, password);
    await login(email, password);
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