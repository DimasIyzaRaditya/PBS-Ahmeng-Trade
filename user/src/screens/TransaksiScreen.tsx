import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiGetTransaksi, apiGetProduk } from '../services/api';
import {
  colors, commonStyles, headerStyles, tableStyles, inputStyles,
  sectionStyles, spacing, typography, borderRadius, formatRupiah,
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
  emailPembeli: string;
  totalHarga: number;
  createdAt?: string;
}

export default function TransaksiScreen(): React.JSX.Element {
  const { token, user } = useAuth();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [transaksiRes, produkRes] = await Promise.all([
          apiGetTransaksi(token),
          apiGetProduk(token),
        ]);
        setTransaksi(Array.isArray(transaksiRes.data) ? transaksiRes.data : []);
        setProduk(Array.isArray(produkRes.data) ? produkRes.data : []);
      } catch (e) {
        setError('Gagal memuat transaksi');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const getNamaProduk = (produkId: number) =>
    produk.find(p => p.id === produkId)?.nama ?? `#${produkId}`;

  const filteredTransaksi = searchQuery.trim()
    ? transaksi.filter(t =>
        t.namaPembeli.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getNamaProduk(t.produkId).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transaksi;

  return (
    <ScrollView style={commonStyles.container}>
      {/* Header */}
      <View style={headerStyles.containerSecondary}>
        <View style={commonStyles.flexRowBetween}>
          <View style={headerStyles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={headerStyles.logo}
              resizeMode="contain"
            />
            <Text style={headerStyles.brandText}>Ahmeng Trade</Text>
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
            Halo, {user?.name ?? 'User'}!
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[commonStyles.containerPadding, { marginTop: spacing.lg }]}>
        <View style={inputStyles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.text.secondary} />
          <TextInput
            placeholder="Cari transaksi..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={inputStyles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.text.secondary} />
            </Pressable>
          )}
        </View>
      </View>