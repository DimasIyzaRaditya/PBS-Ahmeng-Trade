import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  colors, commonStyles, headerStyles, spacing, typography,
} from '../styles';

export default function ProdukScreen(): React.JSX.Element {
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
            Halo, {user?.name ?? 'User'}!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}