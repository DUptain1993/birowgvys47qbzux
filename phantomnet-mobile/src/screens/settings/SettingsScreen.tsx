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
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();
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

      // Load theme preference
      const savedTheme = await storageService.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        setTheme(savedTheme);
      }

      // Load other preferences
      const savedAutoRefresh = await storageService.getItem('auto_refresh');
      if (savedAutoRefresh !== null) {
        setAutoRefresh(savedAutoRefresh === 'true');
      }

      const savedNotifications = await storageService.getItem('notifications');
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === 'true');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveServerConfig = async () => {
    try {
      await apiService.setServerConfig(serverConfig);
      Alert.alert('Success', 'Server configuration saved successfully');
      setIsEditingServer(false);
      setShowServerModal(false);
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
              await storageService.clearAll();
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
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    destructive?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightElement, destructive }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon as any}
          size={24}
          color={destructive ? COLORS.error : COLORS.primary}
          style={styles.settingIcon}
        />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, destructive && { color: COLORS.error }]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />)}
    </TouchableOpacity>
  );

  const ThemeSelector: React.FC = () => (
    <View style={styles.themeSelector}>
      {(['light', 'dark', 'auto'] as const).map((themeOption) => (
        <TouchableOpacity
          key={themeOption}
          style={[
            styles.themeOption,
            theme === themeOption && styles.themeOptionSelected,
          ]}
          onPress={() => saveTheme(themeOption)}
        >
          <Text
            style={[
              styles.themeOptionText,
              theme === themeOption && styles.themeOptionTextSelected,
            ]}
          >
            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <SettingSection title="Server Configuration">
        <SettingItem
          icon="server"
          title="Server Settings"
          subtitle={`${serverConfig.url}:${serverConfig.port}`}
          onPress={() => setShowServerModal(true)}
        />
        <SettingItem
          icon="wifi"
          title="Test Connection"
          onPress={testConnection}
        />
      </SettingSection>

      <SettingSection title="Appearance">
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="color-palette" size={24} color={COLORS.primary} style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Theme</Text>
            </View>
          </View>
        </View>
        <ThemeSelector />
      </SettingSection>

      <SettingSection title="Preferences">
        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="refresh" size={24} color={COLORS.primary} style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Auto Refresh</Text>
              <Text style={styles.settingSubtitle}>Automatically refresh data</Text>
            </View>
          </View>
          <Switch
            value={autoRefresh}
            onValueChange={(value) => {
              setAutoRefresh(value);
              savePreference('auto_refresh', value);
            }}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={autoRefresh ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="notifications" size={24} color={COLORS.primary} style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Receive push notifications</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={(value) => {
              setNotifications(value);
              savePreference('notifications', value);
            }}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={notifications ? COLORS.primary : COLORS.textMuted}
          />
        </View>
      </SettingSection>

      <SettingSection title="Data Management">
        <SettingItem
          icon="trash"
          title="Clear All Data"
          subtitle="Remove all stored data and preferences"
          onPress={clearAllData}
          destructive
        />
      </SettingSection>

      <SettingSection title="Account">
        <SettingItem
          icon="log-out"
          title="Logout"
          subtitle="Sign out of your account"
          onPress={handleLogout}
          destructive
        />
      </SettingSection>

      {/* Server Configuration Modal */}
      <Modal
        visible={showServerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Server Configuration</Text>
            <TouchableOpacity onPress={() => setShowServerModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Server URL</Text>
              <TextInput
                style={styles.textInput}
                value={serverConfig.url}
                onChangeText={(text) => setServerConfig({ ...serverConfig, url: text })}
                placeholder="localhost or IP address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Port</Text>
              <TextInput
                style={styles.textInput}
                value={serverConfig.port.toString()}
                onChangeText={(text) => setServerConfig({ ...serverConfig, port: parseInt(text) || 8443 })}
                placeholder="8443"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Use SSL</Text>
                <Switch
                  value={serverConfig.useSSL}
                  onValueChange={(value) => setServerConfig({ ...serverConfig, useSSL: value })}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                  thumbColor={serverConfig.useSSL ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timeout (ms)</Text>
              <TextInput
                style={styles.textInput}
                value={serverConfig.timeout.toString()}
                onChangeText={(text) => setServerConfig({ ...serverConfig, timeout: parseInt(text) || 30000 })}
                placeholder="30000"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowServerModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveServerConfig}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: SPACING.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  themeOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  themeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  themeOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  themeOptionTextSelected: {
    color: COLORS.surface,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceVariant,
    marginRight: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.surface,
  },
});