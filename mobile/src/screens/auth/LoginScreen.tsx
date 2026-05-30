import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Email dan password tidak boleh kosong');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      Alert.alert('Login Gagal', 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.judul}>PBS Ahmeng Trade</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan email kamu"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan password kamu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Masuk</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Belum punya akun? Daftar di sini</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  judul: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32, color: '#4F46E5' },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 15, backgroundColor: '#F9FAFB' },
  button: { backgroundColor: '#4F46E5', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkText: { textAlign: 'center', marginTop: 16, color: '#4F46E5', fontSize: 14 },
});