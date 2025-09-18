// Settings Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and types
import apiService from '../../services/api';
import { storageService } from '../../utils/storage';
import { ServerConfig } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function SettingsScreen() {
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    url: '',
    port: 8443,
    useSSL: true,
    timeout: 30000,
  });
  const [isEditingServer, setIsEditingServer] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showServerModal, setShowServerModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load server configuration
      const config = await apiService.getServerConfig();
      if (config) {
        setServerConfig(config);
      }

      // Load theme preference (assuming storageService.getItem returns string or null)
      const savedTheme = await storageService.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        setTheme(savedTheme);
      }

      // Load other preferences
      const savedAutoRefresh = await storageService.getItem('auto_refresh');
      if (savedAutoRefresh !== null) {
        setAutoRefresh(savedAutoRefresh === 'true' || savedAutoRefresh === true);
      }

      const savedNotifications = await storageService.getItem('notifications');
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === 'true' || savedNotifications === true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveServerConfig = async () => {
    try {
      const success = await apiService.setServerConfig(serverConfig);
      if (success) {
        Alert.alert('Success', 'Server configuration saved successfully');
        setIsEditingServer(false);
        setShowServerModal(false);
      } else {
        Alert.alert('Error', 'Failed to save server configuration');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save server configuration');
    }
  };

  const testConnection = async () => {
    try {
      const isConnected = await apiService.testConnection();
      if (isConnected) {
        Alert.alert('Success', 'Connection to server successful!');
      } else {
        Alert.alert('Connection Failed', 'Unable to connect to the server. Please check your configuration.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test connection');
    }
  };

  const saveTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      await storageService.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const savePreference = async (key: string, value: any) => {
    try {
      // Store booleans as strings for consistency
      const storedValue = typeof value === 'boolean' ? value.toString() : value;
      await storageService.setItem(key, storedValue);
    } catch (error) {
      Alert.alert('Error', 'Failed to save preference');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all stored data including server configuration, cached data, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Assuming storageService.clearAll clears all storage
              const success = await storageService.clearAll();
              if (success !== false) { // Accept undefined or true as success
                Alert.alert('Success', 'All data cleared successfully');
                // Reset to defaults
                setServerConfig({
                  url: '',
                  port: 8443,
                  useSSL: true,
                  timeout: 30000,
                });
                setTheme('auto');
                setAutoRefresh(true);
                setNotifications(true);
              } else {
                Alert.alert('Error', 'Failed to clear data');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  // ... rest of your component unchanged ...

  // (You can keep the SettingSection, SettingItem, ThemeSelector, JSX, and styles as is)

  // For brevity, I am not repeating unchanged parts here.

  // Just make sure to replace all storageService.getData / storeData / getTheme / saveTheme calls with getItem/setItem as above.

  // Also ensure your storageService implements these methods:
  // - getItem(key: string): Promise<string | null>
  // - setItem(key: string, value: string): Promise<void>
  // - clearAll(): Promise<void | boolean>

  // If your storageService uses different method names, adjust accordingly.
}
