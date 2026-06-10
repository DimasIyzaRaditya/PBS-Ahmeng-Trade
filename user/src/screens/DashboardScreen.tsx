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