import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProdukScreen from '../screens/ProdukScreen';
import ProfileScreen from '../screens/ProfileScreen';

type AppTabParamList = {
  Home: undefined;
  Produk: undefined;
  Profil: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Produk" component={ProdukScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}