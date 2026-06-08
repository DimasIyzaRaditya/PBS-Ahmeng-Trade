import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { apiGetProduk } from '../services/api';
import {
  colors, commonStyles, headerStyles, tableStyles,
  sectionStyles, spacing, typography,
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

      {/* Section */}
      <View style={sectionStyles.container}>
        <Text style={sectionStyles.title}>Daftar Produk</Text>
        <Text style={sectionStyles.subtitle}>Semua produk yang tersedia</Text>
      </View>
    </ScrollView>
  );
}