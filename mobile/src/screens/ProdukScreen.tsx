import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiGetProduk } from '../services/api';
import {
  colors, commonStyles, headerStyles, tableStyles,
  sectionStyles, spacing, typography, borderRadius, formatRupiah,
} from '../styles';

interface Produk {
  id: number;
  nama: string;
  harga: number;
}

export default function ProdukScreen(): React.JSX.Element {
  const { token, user } = useAuth();
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const res = await apiGetProduk(token ?? '');
        setProduk(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };
    fetchProduk();
  }, []);

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

      {/* Section + Tabel */}
      <View style={sectionStyles.container}>
        <Text style={sectionStyles.title}>Daftar Produk</Text>
        <Text style={sectionStyles.subtitle}>Semua produk yang tersedia</Text>

        {/* Table Header */}
        <View style={tableStyles.header}>
          <Text style={[tableStyles.headerText, { flex: 1 }]}>Nama Produk</Text>
          <Text style={[tableStyles.headerText, { width: 110, textAlign: 'right' }]}>Harga</Text>
        </View>

        {/* Table Body */}
        {loading ? (
          <View style={tableStyles.loadingState}>
            <ActivityIndicator size="large" color={colors.text.primary} />
            <Text style={{ color: colors.text.secondary, marginTop: spacing.base }}>Memuat produk...</Text>
          </View>
        ) : error ? (
          <View style={tableStyles.emptyState}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={colors.status.error} style={{ marginBottom: spacing.base }} />
            <Text style={{ color: colors.status.error, fontSize: typography.fontSize.base }}>{error}</Text>
          </View>
        ) : produk.length > 0 ? (
          produk.map((item, index) => (
            <View
              key={item.id}
              style={[
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
                {
                  borderBottomWidth: index === produk.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border.primary,
                  borderBottomLeftRadius: index === produk.length - 1 ? borderRadius.md : 0,
                  borderBottomRightRadius: index === produk.length - 1 ? borderRadius.md : 0,
                },
              ]}
            >
              <Text style={[tableStyles.cellText, { flex: 1 }]}>{item.nama}</Text>
              <Text style={[tableStyles.cellText, { width: 110, textAlign: 'right' }]}>{formatRupiah(item.harga)}</Text>
            </View>
          ))
        ) : (
          <View style={tableStyles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={32} color={colors.text.secondary} style={{ marginBottom: spacing.base }} />
            <Text style={{ color: colors.text.secondary }}>Belum ada produk tersedia</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}