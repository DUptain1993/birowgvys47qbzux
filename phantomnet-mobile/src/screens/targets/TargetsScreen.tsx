// Targets Discovery Screen Component

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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import services and types
import apiService from '../../services/api';
import { Target, TargetDiscoveryRequest } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function TargetsScreen() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Discovery form state
  const [discoveryConfig, setDiscoveryConfig] = useState({
    query: 'product:"Apache httpd"',
    network: '192.168.1.0/24',
    ports: '22,80,443',
    domain: 'example.com',
    wordlist: '/usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt',
  });

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const result = await apiService.getTargets();
      if (result.success && result.data) {
        setTargets(result.data);
      }
    } catch (error) {
      console.error('Failed to load targets:', error);
      Alert.alert('Error', 'Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const discoverTargets = async () => {
    setDiscovering(true);
    try {
      const request: TargetDiscoveryRequest = {
        criteria: {
          query: discoveryConfig.query,
          network: discoveryConfig.network,
          ports: discoveryConfig.ports,
          domain: discoveryConfig.domain,
          wordlist: discoveryConfig.wordlist,
        },
      };

      const result = await apiService.discoverTargets(request);

      if (result.success) {
        Alert.alert(
          'Discovery Complete',
          `Found ${result.data?.targets_found || 0} potential targets`,
          [
            {
              text: 'View Results',
              onPress: () => {
                setShowDiscoveryModal(false);
                loadTargets(); // Refresh the targets list
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Target discovery failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Target discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  const getFilteredTargets = () => {
    if (!searchQuery.trim()) return targets;

    return targets.filter(target =>
      target.ip_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.hostname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.os_info?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'exploited':
        return COLORS.success;
      case 'discovered':
        return COLORS.warning;
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'exploited':
        return 'checkmark-circle';
      case 'discovered':
        return 'search';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const TargetItem = ({ target }: { target: Target }) => (
    <View style={styles.targetItem}>
      <View style={styles.targetIcon}>
        <Ionicons name="locate" size={24} color={getStatusColor(target.status)} />
      </View>

      <View style={styles.targetInfo}>
        <View style={styles.targetHeader}>
          <Text style={styles.targetIp} numberOfLines={1}>
            {target.ip_address}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(target.status) }]}>
            <Ionicons name={getStatusIcon(target.status)} size={12} color="#ffffff" />
            <Text style={styles.statusText}>{target.status}</Text>
          </View>
        </View>

        <Text style={styles.targetHostname} numberOfLines={1}>
          {target.hostname || 'No hostname'}
        </Text>

        <Text style={styles.targetOs}>
          OS: {target.os_info || 'Unknown'}
        </Text>

        <Text style={styles.targetPorts}>
          Ports: {target.open_ports ? JSON.parse(target.open_ports).join(', ') : 'None scanned'}
        </Text>

        <Text style={styles.targetDiscovered}>
          Discovered: {new Date(target.discovered_at).toLocaleString()}
        </Text>

        {target.notes && (
          <Text style={styles.targetNotes} numberOfLines={2}>
            Notes: {target.notes}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.targetAction}
        onPress={() => {
          const details = `IP: ${target.ip_address}\nHostname: ${target.hostname || 'N/A'}\nOS: ${target.os_info || 'N/A'}\nStatus: ${target.status}\nPorts: ${target.open_ports ? JSON.parse(target.open_ports).join(', ') : 'N/A'}\nNotes: ${target.notes || 'N/A'}`;
          Alert.alert('Target Details', details);
        }}
      >
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const DiscoveryMethod = ({
    title,
    description,
    icon,
    onPress,
  }: {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.discoveryMethod} onPress={onPress}>
      <View style={styles.methodIcon}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  const DiscoveryModal = () => (
    <Modal
      visible={showDiscoveryModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDiscoveryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Target Discovery</Text>
            <TouchableOpacity onPress={() => setShowDiscoveryModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Shodan Search */}
            <View style={styles.discoverySection}>
              <Text style={styles.sectionTitle}>Shodan Search</Text>
              <TextInput
                style={styles.discoveryInput}
                value={discoveryConfig.query}
                onChangeText={(query) => setDiscoveryConfig({ ...discoveryConfig, query })}
                placeholder='e.g., product:"Apache httpd"'
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Network Scan */}
            <View style={styles.discoverySection}>
              <Text style={styles.sectionTitle}>Network Scan</Text>
              <TextInput
                style={styles.discoveryInput}
                value={discoveryConfig.network}
                onChangeText={(network) => setDiscoveryConfig({ ...discoveryConfig, network })}
                placeholder="e.g., 192.168.1.0/24"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={[styles.discoveryInput, { marginTop: SPACING.sm }]}
                value={discoveryConfig.ports}
                onChangeText={(ports) => setDiscoveryConfig({ ...discoveryConfig, ports })}
                placeholder="e.g., 22,80,443"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* DNS Enumeration */}
            <View style={styles.discoverySection}>
              <Text style={styles.sectionTitle}>DNS Enumeration</Text>
              <TextInput
                style={styles.discoveryInput}
                value={discoveryConfig.domain}
                onChangeText={(domain) => setDiscoveryConfig({ ...discoveryConfig, domain })}
                placeholder="e.g., example.com"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDiscoveryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.discoverButton, discovering && styles.discoverButtonDisabled]}
              onPress={discoverTargets}
              disabled={discovering}
            >
              {discovering ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#ffffff" style={styles.discoverIcon} />
                  <Text style={styles.discoverButtonText}>Start Discovery</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading targets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Discovery Button */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Target Discovery</Text>
          <Text style={styles.headerSubtitle}>
            {targets.length} targets discovered
          </Text>
        </View>
        <TouchableOpacity
          style={styles.discoveryButton}
          onPress={() => setShowDiscoveryModal(true)}
        >
          <Ionicons name="search" size={20} color="#ffffff" />
          <Text style={styles.discoveryButtonText}>Discover</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search targets by IP, hostname, or OS..."
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {targets.filter(t => t.status === 'exploited').length}
          </Text>
          <Text style={styles.statLabel}>Exploited</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {targets.filter(t => t.status === 'discovered').length}
          </Text>
          <Text style={styles.statLabel}>Discovered</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {targets.filter(t => t.status === 'failed').length}
          </Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {/* Targets List */}
      <FlatList
        data={getFilteredTargets()}
        renderItem={({ item }) => <TargetItem target={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.targetsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="locate-outline" size={80} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Targets Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search query' : 'Start target discovery to find potential targets'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowDiscoveryModal(true)}
            >
              <Text style={styles.emptyButtonText}>Start Discovery</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Discovery Modal */}
      <DiscoveryModal />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerInfo: {
    flex: 1,
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
  discoveryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  discoveryButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
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
  targetsList: {
    padding: SPACING.md,
  },
  targetItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.md,
  },
  targetIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  targetInfo: {
    flex: 1,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  targetIp: {
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
  targetHostname: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  targetOs: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  targetPorts: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  targetDiscovered: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  targetNotes: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  targetAction: {
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
  emptyButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
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
    maxHeight: '90%',
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
  discoverySection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  discoveryInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    backgroundColor: COLORS.surface,
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
  discoverButton: {
    backgroundColor: COLORS.primary,
  },
  discoverButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  discoverIcon: {
    marginRight: SPACING.sm,
  },
  discoverButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
