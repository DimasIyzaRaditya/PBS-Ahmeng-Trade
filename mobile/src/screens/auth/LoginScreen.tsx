import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  colors, authStyles, inputStyles, buttonStyles,
  alertStyles, spacing, typography,
} from '../../styles';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (e) {
      setError('Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: '100%', paddingHorizontal: spacing.lg }}
    >
      <View style={authStyles.container}>
        <View style={authStyles.headerContainer}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 80, height: 80, marginBottom: spacing['2xl'] }}
            resizeMode="contain"
          />
          <Text style={authStyles.title}>Login</Text>
          <Text style={authStyles.subtitle}>Masuk dengan akun Ahmeng Trade Anda</Text>
        </View>

        <View style={inputStyles.container}>
          <Text style={inputStyles.label}>Username</Text>
          <View style={inputStyles.wrapper}>
            <MaterialCommunityIcons name="account-outline" size={18} color={colors.text.secondary} />
            <TextInput
              placeholder="Masukkan username"
              placeholderTextColor={colors.text.muted}
              value={username}
              onChangeText={setUsername}
              editable={!loading}
              autoCapitalize="none"
              style={inputStyles.input}
            />
          </View>
        </View>

        <View style={inputStyles.container}>
          <Text style={inputStyles.label}>Password</Text>
          <View style={inputStyles.wrapper}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={colors.text.secondary} />
            <TextInput
              placeholder="Masukkan password"
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              style={inputStyles.input}
            />
          </View>
        </View>

        {error ? (
          <View style={alertStyles.container}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.status.error} style={{ marginRight: spacing.md }} />
            <Text style={alertStyles.text}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[buttonStyles.primary, { marginBottom: spacing.base }, loading && buttonStyles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.background.primary} />
            : <Text style={buttonStyles.primaryText}>Login</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={[authStyles.link, { textAlign: 'center', marginTop: spacing.base, fontSize: typography.fontSize.base }]}>
            Belum punya akun? Daftar di sini
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}