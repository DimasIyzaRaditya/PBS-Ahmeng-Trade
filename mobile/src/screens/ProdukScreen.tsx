import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProdukScreen(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.judul}>Produk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  judul: { fontSize: 24, fontWeight: 'bold', color: '#4F46E5' },
});