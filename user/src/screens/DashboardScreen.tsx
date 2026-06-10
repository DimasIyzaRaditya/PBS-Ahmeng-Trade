import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiGetProduk, apiGetTransaksi, apiGetUser } from '../services/api';
import {
  colors, commonStyles, headerStyles, sectionStyles,
  cardStyles, spacing, typography, formatRupiah,
} from '../styles';

interface Produk {
  id: number;
  nama: string;
  harga: number;
}

interface Transaksi {
  id: number;
  produkId: number;
  namaPembeli: string;
  totalHarga: number;
}

interface User {
  id: number;
  name: string;
  username: string;
}

export default function DashboardScreen(): React.JSX.Element {
  const { token, user } = useAuth();
  const [produk, setProduk] = useState<Produk[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [produkRes, transaksiRes, userRes] = await Promise.all([
          apiGetProduk(token),
          apiGetTransaksi(token),
          apiGetUser(token),
        ]);
        setProduk(Array.isArray(produkRes.data) ? produkRes.data : []);
        setTransaksi(Array.isArray(transaksiRes.data) ? transaksiRes.data : []);
        setUsers(Array.isArray(userRes.data) ? userRes.data : []);
      } catch (e) {
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const totalRevenue = transaksi.reduce((sum, t) => sum + (t.totalHarga || 0), 0);

  const getNamaProduk = (produkId: number) =>
    produk.find(p => p.id === produkId)?.nama ?? `#${produkId}`;

  const topProduk = Object.values(
    transaksi.reduce((acc, t) => {
      if (!acc[t.produkId]) {
        acc[t.produkId] = { nama: getNamaProduk(t.produkId), count: 0, revenue: 0 };
      }
      acc[t.produkId].count += 1;
      acc[t.produkId].revenue += t.totalHarga;
      return acc;
    }, {} as Record<number, { nama: string; count: number; revenue: number }>)
  ).sort((a, b) => b.revenue - a.revenue).slice(0, 5);