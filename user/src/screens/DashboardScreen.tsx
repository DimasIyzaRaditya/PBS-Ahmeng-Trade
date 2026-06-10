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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['3xl'] }}>
          <ActivityIndicator size="large" color={colors.text.primary} />
          <Text style={{ color: colors.text.secondary, marginTop: spacing.base }}>Memuat dashboard...</Text>
        </View>
      ) : error ? (
        <View style={{ padding: spacing.lg }}>
          <Text style={{ color: colors.status.error }}>{error}</Text>
        </View>
      ) : (
        <>
          {/* Stat Cards */}
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'] }}>
            <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg }}>
              Ringkasan
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.base, marginBottom: spacing.base }}>
              <View style={[cardStyles.container, { flex: 1 }]}>
                <MaterialCommunityIcons name="account-group-outline" size={22} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>Total User</Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{users.length}</Text>
              </View>
              <View style={[cardStyles.container, { flex: 1 }]}>
                <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>Total Produk</Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{produk.length}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.base }}>
              <View style={[cardStyles.container, { flex: 1 }]}>
                <MaterialCommunityIcons name="receipt" size={22} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>Total Transaksi</Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{transaksi.length}</Text>
              </View>
              <View style={[cardStyles.container, { flex: 1 }]}>
                <MaterialCommunityIcons name="cash-multiple" size={22} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>Total Revenue</Text>
                <Text style={{ color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold }}>{formatRupiah(totalRevenue)}</Text>
              </View>
            </View>
          </View>

          {/* Top Produk */}
          <View style={[sectionStyles.container, { marginTop: spacing['2xl'] }]}>
            <Text style={sectionStyles.title}>Top Produk Terlaris</Text>
            <Text style={sectionStyles.subtitle}>Berdasarkan total revenue</Text>

            {topProduk.length > 0 ? (
              topProduk.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: spacing.base,
                    borderBottomWidth: index === topProduk.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border.primary,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm, width: 24 }}>
                      {index + 1}.
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text.primary, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }}>
                        {item.nama}
                      </Text>
                      <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                        {item.count} transaksi
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.text.primary, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
                    {formatRupiah(item.revenue)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{ paddingVertical: spacing['2xl'], alignItems: 'center' }}>
                <MaterialCommunityIcons name="chart-bar" size={32} color={colors.text.secondary} />
                <Text style={{ color: colors.text.secondary, marginTop: spacing.base }}>Belum ada data transaksi</Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}