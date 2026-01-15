import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import RoadmapScreen from './RoadmapScreen';
import CertificationsScreen from './CertificationsScreen';
import ProgressScreen from './ProgressScreen';
import ProfileScreen from './ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import LoadingScreen from '../components/LoadingScreen';

const Tab = createBottomTabNavigator();

function DashboardTabs() {
  const { logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 16, gap: 12 }}>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await logout();
                navigation.navigate('Login' as never);
              }}
            >
              <Ionicons name="log-out-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ),
        headerTitle: 'Learning Planner',
        headerTitleStyle: { color: colors.primary, fontWeight: 'bold' },
        tabBarStyle: { 
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Roadmap"
        component={RoadmapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Certifications"
        component={CertificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Navigate to profile screen in stack
            navigation.navigate('Profile' as never);
            e.preventDefault();
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      checkProfile();
    }, [])
  );

  const checkProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      if (!response.data.profile) {
        navigation.navigate('Onboarding' as never);
      }
    } catch (error) {
      console.error('Profile check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen 
        message="Loading Your Dashboard"
        subMessage="Preparing your personalized learning experience..."
      />
    );
  }

  return <DashboardTabs />;
}
