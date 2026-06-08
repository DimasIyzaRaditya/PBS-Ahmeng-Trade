import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  colors, commonStyles, headerStyles, cardStyles,
  buttonStyles, spacing, typography, borderRadius,
} from '../styles';

export default function ProfileScreen(): React.JSX.Element {
  const { user, logout } = useAuth();

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
            Profil
          </Text>
        </View>
      </View>

      {/* Avatar & Nama */}
      <View style={{
        alignItems: 'center',
        paddingVertical: spacing['3xl'],
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary,
      }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: colors.background.tertiary,
          borderWidth: 1, borderColor: colors.border.secondary,
          justifyContent: 'center', alignItems: 'center',
          marginBottom: spacing.lg,
        }}>
          <MaterialCommunityIcons name="account" size={36} color={colors.text.secondary} />
        </View>
        <Text style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
          {user?.name ?? '-'}
        </Text>
        <Text style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, marginTop: spacing.xs }}>
          @{user?.username ?? '-'}
        </Text>
      </View>

      {/* Info Akun */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'] }}>
        <Text style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing.lg }}>
          Informasi Akun
        </Text>

        <View style={[cardStyles.container, { marginBottom: spacing.base }]}>
          <View style={commonStyles.flexRowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account-outline" size={18} color={colors.text.secondary} style={{ marginRight: spacing.base }} />
              <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>Nama Lengkap</Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
              {user?.name ?? '-'}
            </Text>
          </View>
        </View>

        <View style={[cardStyles.container, { marginBottom: spacing['3xl'] }]}>
          <View style={commonStyles.flexRowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="at" size={18} color={colors.text.secondary} style={{ marginRight: spacing.base }} />
              <Text style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>Username</Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
              {user?.username ?? '-'}
            </Text>
          </View>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity
          style={[buttonStyles.danger, { borderRadius: borderRadius.base }]}
          onPress={logout}
        >
          <MaterialCommunityIcons name="logout" size={18} color={colors.text.primary} style={{ marginRight: spacing.base }} />
          <Text style={buttonStyles.dangerText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}