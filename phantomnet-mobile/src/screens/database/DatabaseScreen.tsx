// Database Access Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and types
import apiService from '../../services/api';
import { Bot, Command, Target, Payload, Campaign, Exploit, Task } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

type DatabaseTable = 'bots' | 'commands' | 'targets' | 'payloads' | 'campaigns' | 'exploits' | 'tasks';

interface TableInfo {
  name: DatabaseTable;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count?: number;
}

export default function DatabaseScreen() {
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    bots: 0,
    commands: 0,
    targets: 0,
    payloads: 0,
    campaigns: 0,
    exploits: 0,
    tasks: 0,
  });

  const tables: TableInfo[] = [
    { name: 'bots', label: 'Bots', icon: 'hardware-chip', color: COLORS.primary, count: stats.bots },
    { name: 'commands', label: 'Commands', icon: 'terminal', color: COLORS.secondary, count: stats.commands },
    { name: 'targets', label: 'Targets', icon: 'locate', color: COLORS.warning, count: stats.targets },
    { name: 'payloads', label: 'Payloads', icon: 'nuclear', color: COLORS.info, count: stats.payloads },
    { name: 'campaigns', label: 'Campaigns', icon: 'rocket', color: COLORS.accent, count: stats.campaigns },
    { name: 'exploits', label: 'Exploits', icon: 'bug', color: COLORS.error, count: stats.exploits },
    { name: 'tasks', label: 'Tasks', icon: 'list', color: COLORS.success, count: stats.tasks },
  ];

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      const result = await apiService.getDashboardStats();
      if (result.success && result.data) {
        setStats({
          bots: result.data.total_bots,
          commands: result.data.total_commands,
          targets: result.data.total_targets,
          payloads: result.data.total_payloads,
          campaigns: result.data.total_campaigns,
          exploits: 0, // Would need separate API call
          tasks: result.data.total_tasks,
        });
      }
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  };

  const loadTableData = async (table: DatabaseTable) => {
    setLoading(true);
    try {
      let result;
      switch (table) {
        case 'bots':
          result = await apiService.getBots();
          break;
        case 'commands':
          result = await apiService.getTasks(); // Commands are stored as tasks
          break;
        case 'targets':
          result = await apiService.getTargets();
          break;
        case 'payloads':
          result = await apiService.getPayloads();
          break;
        case 'campaigns':
          result = await apiService.getCampaigns();
          break;
        case 'exploits':
          result = await apiService.getExploits();
          break;
        case 'tasks':
          result = await apiService.getTasks();
          break;
        default:
          return;
      }

      if (result.success && result.data) {
        setTableData(result.data);
        setSelectedTable(table);
      } else {
        Alert.alert('Error', `Failed to load ${table} data`);
      }
    } catch (error) {
      console.error(`Failed to load ${table} data:`, error);
      Alert.alert('Error', `Failed to load ${table} data`);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!searchQuery.trim()) return tableData;

    return tableData.filter(item => {
      // Search in common fields
      const searchableFields = ['id', 'name', 'hostname', 'ip_address', 'command', 'status'];
      return searchableFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  };

  const renderTableCard = ({ item }: { item: TableInfo }) => (
    <TouchableOpacity
      style={[styles.tableCard, { borderLeftColor: item.color }]}
      onPress={() => {
        loadTableData(item.name);
        setShowTableModal(true);
      }}
    >
      <View style={styles.tableIcon}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.tableInfo}>
        <Text style={styles.tableName}>{item.label}</Text>
        <Text style={styles.tableCount}>{item.count || 0} records</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  const renderDataItem = ({ item, index }: { item: any; index: number }) => {
    const getItemPreview = () => {
      switch (selectedTable) {
        case 'bots':
          return `${item.hostname || item.id} • ${item.ip_address} • ${item.status}`;
        case 'commands':
          return `${item.command} • ${item.status}`;
        case 'targets':
          return `${item.ip_address} • ${item.os_info || 'Unknown'} • ${item.status}`;
        case 'payloads':
          return `${item.name} • ${item.platform}/${item.architecture} • ${item.payload_type}`;
        case 'campaigns':
          return `${item.name} • ${item.status} • ${item.targets_exploited}/${item.targets_discovered}`;
        case 'exploits':
          return `${item.name} • ${item.exploit_type} • ${item.target_platform}`;
        case 'tasks':
          return `${item.command} • ${item.status} • ${item.bot_id}`;
        default:
          return JSON.stringify(item).slice(0, 100) + '...';
      }
    };

    return (
      <View style={styles.dataItem}>
        <View style={styles.dataIndex}>
          <Text style={styles.dataIndexText}>{index + 1}</Text>
        </View>
        <View style={styles.dataContent}>
          <Text style={styles.dataPreview} numberOfLines={2}>
            {getItemPreview()}
          </Text>
          <Text style={styles.dataId}>
            ID: {item.id?.toString().slice(0, 8)}...
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dataAction}
          onPress={() => {
            const details = JSON.stringify(item, null, 2);
            Alert.alert('Record Details', details);
          }}
        >
          <Ionicons name="eye" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const exportData = () => {
    if (!selectedTable || tableData.length === 0) {
      Alert.alert('Error', 'No data to export');
      return;
    }

    const dataString = JSON.stringify(tableData, null, 2);
    Alert.alert(
      'Export Data',
      `Export ${tableData.length} ${selectedTable} records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // In a real app, you'd save to file or share
            Alert.alert('Success', 'Data exported successfully!\n\n' + dataString.slice(0, 200) + '...');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Database Access</Text>
        <Text style={styles.headerSubtitle}>View and manage database records</Text>
      </View>

      {/* Database Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Database Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.bots + stats.commands + stats.targets + stats.payloads + stats.campaigns + stats.tasks}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Object.values(stats).reduce((a, b) => a + b, 0)}</Text>
            <Text style={styles.statLabel}>Active Entries</Text>
          </View>
        </View>
      </View>

      {/* Tables List */}
      <FlatList
        data={tables}
        renderItem={renderTableCard}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.tablesList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Database Tables</Text>
        }
      />

      {/* Table Data Modal */}
      <Modal
        visible={showTableModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTableModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTable ? tables.find(t => t.name === selectedTable)?.label : 'Database Table'}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalAction}
                  onPress={exportData}
                >
                  <Ionicons name="download" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalAction}
                  onPress={() => setShowTableModal(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search records..."
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Data List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="refresh-circle" size={40} color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading data...</Text>
              </View>
            ) : (
              <FlatList
                data={getFilteredData()}
                renderItem={renderDataItem}
                keyExtractor={(item, index) => `${item.id || index}`}
                contentContainerStyle={styles.dataList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={60} color={COLORS.textMuted} />
                    <Text style={styles.emptyTitle}>No Data Found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery ? 'Try adjusting your search query' : 'This table appears to be empty'}
                    </Text>
                  </View>
                }
              />
            )}
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
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
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
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginLeft: SPACING.md,
  },
  tablesList: {
    padding: SPACING.md,
  },
  tableCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...SHADOWS.md,
  },
  tableIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tableCount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginTop: 100,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
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
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAction: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  dataList: {
    padding: SPACING.md,
  },
  dataItem: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  dataIndexText: {
    fontSize: FONT_SIZES.sm,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  dataContent: {
    flex: 1,
  },
  dataPreview: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  dataId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  dataAction: {
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
});
