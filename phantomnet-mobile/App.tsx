import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import constants for theming
import { COLORS } from './src/constants';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" backgroundColor={COLORS.primary} />
    </SafeAreaProvider>
  );
}
