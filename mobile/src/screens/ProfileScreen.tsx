import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  colors, commonStyles, headerStyles, spacing, typography,
} from '../styles';

export default function ProfileScreen(): React.JSX.Element {
  const { user } = useAuth();

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
    </ScrollView>
  );
}