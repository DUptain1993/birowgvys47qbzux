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

      // Load app preferences
      const savedTheme = await storageService.getTheme();
      setTheme(savedTheme);

      // Load other preferences (you can expand this)
      const savedAutoRefresh = await storageService.getData('auto_refresh');
      if (savedAutoRefresh !== null) {
        setAutoRefresh(savedAutoRefresh);
      }

      const savedNotifications = await storageService.getData('notifications');
      if (savedNotifications !== null) {
        setNotifications(savedNotifications);
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
      await storageService.saveTheme(newTheme);
      setTheme(newTheme);
    } catch (error) {
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const savePreference = async (key: string, value: any) => {
    try {
      await storageService.storeData(key, value);
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
              const success = await storageService.clearAllData();
              if (success) {
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

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingItem = ({
    title,
    subtitle,
    icon,
    onPress,
    rightComponent,
  }: {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={onPress ? COLORS.primary : COLORS.textMuted} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, !onPress && styles.settingTitleDisabled]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, !onPress && styles.settingSubtitleDisabled]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      ))}
    </TouchableOpacity>
  );

  const ThemeSelector = () => (
    <View style={styles.themeSelector}>
      {(['light', 'dark', 'auto'] as const).map((themeOption) => (
        <TouchableOpacity
          key={themeOption}
          style={[
            styles.themeOption,
            theme === themeOption && styles.themeOptionActive,
          ]}
          onPress={() => saveTheme(themeOption)}
        >
          <Text style={[
            styles.themeOptionText,
            theme === themeOption && styles.themeOptionTextActive,
          ]}>
            {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your C2 environment</Text>
      </View>

      {/* Server Configuration */}
      <SettingSection title="Server Configuration">
        <SettingItem
          title="Server Connection"
          subtitle={`${serverConfig.url || 'Not configured'}:${serverConfig.port} ${serverConfig.useSSL ? '(SSL)' : '(HTTP)'}`}
          icon="server"
          onPress={() => setShowServerModal(true)}
        />
        <SettingItem
          title="Test Connection"
          subtitle="Verify server connectivity"
          icon="wifi"
          onPress={testConnection}
        />
      </SettingSection>

      {/* Appearance */}
      <SettingSection title="Appearance">
        <SettingItem
          title="Theme"
          subtitle={`Current: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
          icon="color-palette"
          rightComponent={<ThemeSelector />}
        />
      </SettingSection>

      {/* Preferences */}
      <SettingSection title="Preferences">
        <SettingItem
          title="Auto-refresh"
          subtitle="Automatically refresh data"
          icon="refresh"
          rightComponent={
            <Switch
              value={autoRefresh}
              onValueChange={(value) => {
                setAutoRefresh(value);
                savePreference('auto_refresh', value);
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#ffffff"
            />
          }
        />
        <SettingItem
          title="Notifications"
          subtitle="Receive status notifications"
          icon="notifications"
          rightComponent={
            <Switch
              value={notifications}
              onValueChange={(value) => {
                setNotifications(value);
                savePreference('notifications', value);
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor="#ffffff"
            />
          }
        />
      </SettingSection>

      {/* Data Management */}
      <SettingSection title="Data Management">
        <SettingItem
          title="Clear Cache"
          subtitle="Clear cached data and preferences"
          icon="trash"
          onPress={clearAllData}
        />
        <SettingItem
          title="Export Data"
          subtitle="Export settings and data"
          icon="download"
          onPress={() => Alert.alert('Info', 'Export feature coming soon!')}
        />
      </SettingSection>

      {/* About */}
      <SettingSection title="About">
        <SettingItem
          title="Version"
          subtitle="1.0.0"
          icon="information-circle"
        />
        <SettingItem
          title="Help & Support"
          subtitle="Get help and support"
          icon="help-circle"
          onPress={() => Alert.alert('Help', 'Support documentation coming soon!')}
        />
        <SettingItem
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          icon="shield-checkmark"
          onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
        />
      </SettingSection>

      {/* Server Configuration Modal */}
      <Modal
        visible={showServerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowServerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Server Configuration</Text>
              <TouchableOpacity onPress={() => setShowServerModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Server URL */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Server URL</Text>
                <TextInput
                  style={styles.input}
                  value={serverConfig.url}
                  onChangeText={(url) => setServerConfig({ ...serverConfig, url })}
                  placeholder="your-c2-server.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Port */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Port</Text>
                <TextInput
                  style={styles.input}
                  value={serverConfig.port.toString()}
                  onChangeText={(port) => setServerConfig({ ...serverConfig, port: parseInt(port) || 8443 })}
                  placeholder="8443"
                  keyboardType="numeric"
                />
              </View>

              {/* SSL Toggle */}
              <View style={styles.sslContainer}>
                <Text style={styles.sslLabel}>Use SSL</Text>
                <Switch
                  value={serverConfig.useSSL}
                  onValueChange={(useSSL) => setServerConfig({ ...serverConfig, useSSL })}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Timeout */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Timeout (ms)</Text>
                <TextInput
                  style={styles.input}
                  value={serverConfig.timeout.toString()}
                  onChangeText={(timeout) => setServerConfig({ ...serverConfig, timeout: parseInt(timeout) || 30000 })}
                  placeholder="30000"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowServerModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveServerConfig}
              >
                <Text style={styles.saveButtonText}>Save Configuration</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingTitleDisabled: {
    color: COLORS.textMuted,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  settingSubtitleDisabled: {
    color: COLORS.textMuted,
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    marginLeft: SPACING.sm,
  },
  themeOptionActive: {
    backgroundColor: COLORS.primary,
  },
  themeOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  themeOptionTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.surface,
  },
  sslContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  sslLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceVariant,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
