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