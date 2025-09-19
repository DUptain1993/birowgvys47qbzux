// Main Navigation Component for PhantomNet C2 Mobile App

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import auth context
import { useAuth } from '../contexts/AuthContext';

// Import Screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BotsScreen from '../screens/bots/BotsScreen';
import BotDetailsScreen from '../screens/bots/BotDetailsScreen';
import CommandsScreen from '../screens/commands/CommandsScreen';
import PayloadsScreen from '../screens/payloads/PayloadsScreen';
import TargetsScreen from '../screens/targets/TargetsScreen';
import CampaignsScreen from '../screens/campaigns/CampaignsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import DatabaseScreen from '../screens/database/DatabaseScreen';

// Import Types
import { RootStackParamList } from '../types';

// Create Navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Main Tab Navigator for authenticated users
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bots') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          } else if (route.name === 'Commands') {
            iconName = focused ? 'terminal' : 'terminal-outline';
          } else if (route.name === 'Payloads') {
            iconName = focused ? 'nuclear' : 'nuclear-outline';
          } else if (route.name === 'Targets') {
            iconName = focused ? 'locate' : 'locate-outline';
          } else if (route.name === 'Campaigns') {
            iconName = focused ? 'rocket' : 'rocket-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: '#ffffff',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'PhantomNet C2',
        }}
      />
      <Tab.Screen
        name="Bots"
        component={BotsScreen}
        options={{
          title: 'Bots',
        }}
      />
      <Tab.Screen
        name="Commands"
        component={CommandsScreen}
        options={{
          title: 'Commands',
        }}
      />
      <Tab.Screen
        name="Payloads"
        component={PayloadsScreen}
        options={{
          title: 'Payloads',
        }}
      />
      <Tab.Screen
        name="Targets"
        component={TargetsScreen}
        options={{
          title: 'Targets',
        }}
      />
      <Tab.Screen
        name="Campaigns"
        component={CampaignsScreen}
        options={{
          title: 'Campaigns',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: '#ffffff',
          headerBackTitleVisible: false,
        }}
      >
        {isAuthenticated ? (
          // Authenticated Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BotDetails"
              component={BotDetailsScreen}
              options={{
                title: 'Bot Details',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Database"
              component={DatabaseScreen}
              options={{
                title: 'Database Access',
              }}
            />
          </>
        ) : (
          // Unauthenticated Stack
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#667eea',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
