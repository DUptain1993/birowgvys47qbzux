// Dashboard Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and types
import apiService from '../services/api';
import offlineManager from '../services/offline';
import { ServerStats, Bot, Command, Target, Campaign } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, REFRESH_INTERVALS } from '../constants';

// Import components
import NetworkStatusIndicator from '../components/common/NetworkStatusIndicator';
import OfflineIndicator from '../components/common/OfflineIndicator';

export default function DashboardScreen() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [recentBots, setRecentBots] = useState<Bot[]>([]);
  const [recentCommands, setRecentCommands] = useState<Command[]>([]);
  const [recentTargets, setRecentTargets] = useState<Target[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState({
    stats: false,
    bots: false,
    commands: false,
    targets: false,
    campaigns: false,
  });

  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh
    const interval = setInterval(loadDashboardData, REFRESH_INTERVALS.DASHBOARD);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard data in parallel using offline-aware methods
      const [statsResult, botsResult, commandsResult, targetsResult, campaignsResult] = await Promise.all([
        apiService.getStatsOfflineAware(),
        apiService.getBotsOfflineAware(),
        apiService.getCommandsOfflineAware(),
        apiService.getTargetsOfflineAware(),
        apiService.getCampaignsOfflineAware(),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
        setFromCache(prev => ({ ...prev, stats: statsResult.fromCache || false }));
      }

      if (botsResult.success) {
        setRecentBots(botsResult.data?.slice(0, 5) || []);
        setFromCache(prev => ({ ...prev, bots: botsResult.fromCache || false }));
      }

      if (commandsResult.success) {
        // Transform tasks to commands format for display
        const tasks = commandsResult.data || [];
        const commands: Command[] = tasks.map(task => ({
          id: task.id,
          bot_id: task.bot_id,
          command: task.command,
          args: task.args ? JSON.parse(task.args) : undefined,
          timestamp: task.created_at,
          status: task.status,
          result: task.result,
        }));
        setRecentCommands(commands.slice(0, 5));
        setFromCache(prev => ({ ...prev, commands: commandsResult.fromCache || false }));
      }

      if (targetsResult.success) {
        setRecentTargets(targetsResult.data?.slice(0, 5) || []);
        setFromCache(prev => ({ ...prev, targets: targetsResult.fromCache || false }));
      }

      if (campaignsResult.success) {
        setRecentCampaigns(campaignsResult.data?.slice(0, 5) || []);
        setFromCache(prev => ({ ...prev, campaigns: campaignsResult.fromCache || false }));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
        return COLORS.success;
      case 'pending':
      case 'running':
        return COLORS.warning;
      case 'failed':
      case 'offline':
        return COLORS.error;
      default:
        return COLORS.info;
    }
  };

  const StatCard = ({ title, value, icon, color = COLORS.primary }: {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    color?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const RecentItem = ({ item, type }: { item: any; type: string }) => {
    let title = '';
    let subtitle = '';
    let status = '';
    let icon: keyof typeof Ionicons.glyphMap = 'help-circle';

    switch (type) {
      case 'bot':
        title = item.hostname || item.id;
        subtitle = `${item.os_info} • ${item.ip_address}`;
        status = item.status;
        icon = 'hardware-chip';
        break;
      case 'command':
        title = item.command;
        subtitle = `Bot: ${item.bot_id.slice(0, 8)}...`;
        status = item.status;
        icon = 'terminal';
        break;
      case 'target':
        title = item.ip_address;
        subtitle = item.hostname || 'Unknown hostname';
        status = item.status;
        icon = 'locate';
        break;
      case 'campaign':
        title = item.name;
        subtitle = `${item.targets_discovered} targets • ${item.success_rate}% success`;
        status = item.status;
        icon = 'rocket';
        break;
    }

    return (
      <View style={styles.recentItem}>
        <View style={styles.recentIcon}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.recentContent}>
          <Text style={styles.recentTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.recentSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    );
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="refresh-circle" size={50} color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>PhantomNet C2 Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleString()}
          </Text>
        </View>
        <NetworkStatusIndicator />
      </View>

      {/* Offline Indicators */}
      <View style={styles.offlineIndicators}>
        {fromCache.stats && <OfflineIndicator visible={true} message="Stats from cache" />}
        {fromCache.bots && <OfflineIndicator visible={true} message="Bots from cache" />}
        {fromCache.commands && <OfflineIndicator visible={true} message="Commands from cache" />}
        {fromCache.targets && <OfflineIndicator visible={true} message="Targets from cache" />}
        {fromCache.campaigns && <OfflineIndicator visible={true} message="Campaigns from cache" />}
      </View>

      {/* Statistics Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Bots"
            value={stats.total_bots}
            icon="hardware-chip"
            color={COLORS.primary}
          />
          <StatCard
            title="Active Bots"
            value={stats.active_bots}
            icon="wifi"
            color={COLORS.success}
          />
          <StatCard
            title="Discovered Targets"
            value={stats.total_targets}
            icon="locate"
            color={COLORS.warning}
          />
          <StatCard
            title="Active Campaigns"
            value={stats.active_campaigns}
            icon="rocket"
            color={COLORS.info}
          />
          <StatCard
            title="Generated Payloads"
            value={stats.total_payloads}
            icon="nuclear"
            color={COLORS.secondary}
          />
          <StatCard
            title="Total Tasks"
            value={stats.total_tasks}
            icon="list"
            color={COLORS.accent}
          />
        </View>
      )}

      {/* Recent Activity Sections */}
      <View style={styles.activityContainer}>
        {/* Recent Bots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bots</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {recentBots.length > 0 ? (
            recentBots.map((bot) => (
              <RecentItem item={bot} type="bot" />
            ))
          ) : (
            <Text style={styles.emptyText}>No bots connected</Text>
          )}
        </View>

        {/* Recent Commands */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Commands</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {recentCommands.length > 0 ? (
            recentCommands.map((command) => (
              <RecentItem item={command} type="command" />
            ))
          ) : (
            <Text style={styles.emptyText}>No recent commands</Text>
          )}
        </View>

        {/* Recent Targets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Targets</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {recentTargets.length > 0 ? (
            recentTargets.map((target) => (
              <RecentItem item={target} type="target" />
            ))
          ) : (
            <Text style={styles.emptyText}>No targets discovered</Text>
          )}
        </View>

        {/* Recent Campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Campaigns</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          {recentCampaigns.length > 0 ? (
            recentCampaigns.map((campaign) => (
              <RecentItem item={campaign} type="campaign" />
            ))
          ) : (
            <Text style={styles.emptyText}>No campaigns created</Text>
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  offlineIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  statsContainer: {
    padding: SPACING.md,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  activityContainer: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recentContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  recentSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
