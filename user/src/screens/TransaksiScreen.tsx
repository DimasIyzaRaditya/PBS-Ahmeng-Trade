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

      {/* Section + Tabel */}
      <View style={sectionStyles.container}>
        <Text style={sectionStyles.title}>Daftar Transaksi</Text>
        <Text style={sectionStyles.subtitle}>Semua transaksi yang tercatat</Text>

        {/* Table Header */}
        <View style={tableStyles.header}>
          <Text style={[tableStyles.headerText, { flex: 1 }]}>Produk / Pembeli</Text>
          <Text style={[tableStyles.headerText, { width: 110, textAlign: 'right' }]}>Total</Text>
        </View>

        {/* Table Body */}
        {loading ? (
          <View style={tableStyles.loadingState}>
            <ActivityIndicator size="large" color={colors.text.primary} />
            <Text style={{ color: colors.text.secondary, marginTop: spacing.base }}>Memuat transaksi...</Text>
          </View>
        ) : error ? (
          <View style={tableStyles.emptyState}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.status.error} style={{ marginBottom: spacing.base }} />
            <Text style={{ color: colors.status.error, fontSize: typography.fontSize.base }}>{error}</Text>
          </View>
        ) : filteredTransaksi.length > 0 ? (
          filteredTransaksi.map((item, index) => (
            <View
              key={item.id}
              style={[
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
                {
                  borderBottomWidth: index === filteredTransaksi.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border.primary,
                  borderBottomLeftRadius: index === filteredTransaksi.length - 1 ? borderRadius.md : 0,
                  borderBottomRightRadius: index === filteredTransaksi.length - 1 ? borderRadius.md : 0,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[tableStyles.cellText, { fontWeight: typography.fontWeight.semibold }]}>
                  {getNamaProduk(item.produkId)}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  {item.namaPembeli}
                </Text>
              </View>
              <Text style={[tableStyles.cellText, { width: 110, textAlign: 'right' }]}>
                {formatRupiah(item.totalHarga)}
              </Text>
            </View>
          ))
        ) : (
          <View style={tableStyles.emptyState}>
            <MaterialCommunityIcons name="receipt" size={32} color={colors.text.secondary} style={{ marginBottom: spacing.base }} />
            <Text style={{ color: colors.text.secondary }}>Belum ada transaksi</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}