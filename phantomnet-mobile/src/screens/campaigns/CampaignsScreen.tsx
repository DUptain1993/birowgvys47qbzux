// Campaigns Management Screen Component

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
import { Campaign, Payload, CampaignRequest } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';

export default function CampaignsScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    payload_id: '',
    target_criteria: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load campaigns and payloads in parallel
      const [campaignsResult, payloadsResult] = await Promise.all([
        apiService.getCampaigns(),
        apiService.getPayloads(),
      ]);

      if (campaignsResult.success && campaignsResult.data) {
        setCampaigns(campaignsResult.data);
      }

      if (payloadsResult.success && payloadsResult.data) {
        setPayloads(payloadsResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load campaigns data');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!campaignForm.name.trim()) {
      Alert.alert('Error', 'Please enter a campaign name');
      return;
    }

    if (!campaignForm.payload_id) {
      Alert.alert('Error', 'Please select a payload');
      return;
    }

    if (!campaignForm.target_criteria.trim()) {
      Alert.alert('Error', 'Please enter target criteria');
      return;
    }

    setCreating(true);
    try {
      let targetCriteria = {};
      try {
        targetCriteria = JSON.parse(campaignForm.target_criteria);
      } catch (error) {
        Alert.alert('Error', 'Invalid JSON in target criteria');
        setCreating(false);
        return;
      }

      const request: CampaignRequest = {
        name: campaignForm.name.trim(),
        description: campaignForm.description.trim(),
        payload_id: parseInt(campaignForm.payload_id),
        target_criteria: targetCriteria,
      };

      const result = await apiService.createCampaign(request);

      if (result.success) {
        Alert.alert('Success', 'Campaign created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setShowCreateModal(false);
              setCampaignForm({
                name: '',
                description: '',
                payload_id: '',
                target_criteria: '',
              });
              loadData(); // Refresh the campaigns list
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to create campaign');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const getFilteredCampaigns = () => {
    if (!searchQuery.trim()) return campaigns;

    return campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return COLORS.success;
      case 'active':
        return COLORS.primary;
      case 'paused':
        return COLORS.warning;
      default:
        return COLORS.info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'play-circle';
      case 'paused':
        return 'pause-circle';
      default:
        return 'help-circle';
    }
  };

  const CampaignItem = ({ campaign }: { campaign: Campaign }) => {
    const progress = campaign.targets_discovered > 0
      ? (campaign.targets_exploited / campaign.targets_discovered) * 100
      : 0;

    return (
      <View style={styles.campaignItem}>
        <View style={styles.campaignIcon}>
          <Ionicons name="rocket" size={24} color={getStatusColor(campaign.status)} />
        </View>

        <View style={styles.campaignInfo}>
          <View style={styles.campaignHeader}>
            <Text style={styles.campaignName} numberOfLines={1}>
              {campaign.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) }]}>
              <Ionicons name={getStatusIcon(campaign.status)} size={12} color="#ffffff" />
              <Text style={styles.statusText}>{campaign.status}</Text>
            </View>
          </View>

          {campaign.description && (
            <Text style={styles.campaignDescription} numberOfLines={2}>
              {campaign.description}
            </Text>
          )}

          <View style={styles.campaignStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{campaign.targets_discovered}</Text>
              <Text style={styles.statLabel}>Discovered</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{campaign.targets_exploited}</Text>
              <Text style={styles.statLabel}>Exploited</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{campaign.success_rate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                  { backgroundColor: getStatusColor(campaign.status) },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(1)}%</Text>
          </View>

          <Text style={styles.campaignDate}>
            Created: {new Date(campaign.created_at).toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.campaignAction}
          onPress={() => {
            const details = `Name: ${campaign.name}\nDescription: ${campaign.description || 'N/A'}\nStatus: ${campaign.status}\nTargets Discovered: ${campaign.targets_discovered}\nTargets Exploited: ${campaign.targets_exploited}\nSuccess Rate: ${campaign.success_rate}%\nCreated: ${new Date(campaign.created_at).toLocaleString()}`;
            Alert.alert('Campaign Details', details);
          }}
        >
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const PayloadSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Payload</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {payloads.map((payload) => (
          <TouchableOpacity
            key={payload.id}
            style={[
              styles.payloadOption,
              campaignForm.payload_id === payload.id.toString() && styles.payloadOptionSelected,
            ]}
            onPress={() => setCampaignForm({ ...campaignForm, payload_id: payload.id.toString() })}
          >
            <Text style={[
              styles.payloadOptionText,
              campaignForm.payload_id === payload.id.toString() && styles.payloadOptionTextSelected,
            ]}>
              {payload.name}
            </Text>
            <Text style={[
              styles.payloadOptionSubtext,
              campaignForm.payload_id === payload.id.toString() && styles.payloadOptionSubtextSelected,
            ]}>
              {payload.platform}/{payload.architecture}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading campaigns...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Create Button */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Exploitation Campaigns</Text>
          <Text style={styles.headerSubtitle}>
            {campaigns.length} campaigns created
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search campaigns..."
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
            {campaigns.filter(c => c.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {campaigns.filter(c => c.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {campaigns.reduce((sum, c) => sum + c.targets_exploited, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Exploits</Text>
        </View>
      </View>

      {/* Campaigns List */}
      <FlatList
        data={getFilteredCampaigns()}
        renderItem={({ item }) => <CampaignItem campaign={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.campaignsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="rocket-outline" size={80} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Campaigns Created</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search query' : 'Create your first exploitation campaign'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create Campaign</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Campaign Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Campaign</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Campaign Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Campaign Name</Text>
                <TextInput
                  style={styles.input}
                  value={campaignForm.name}
                  onChangeText={(name) => setCampaignForm({ ...campaignForm, name })}
                  placeholder="Enter campaign name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={campaignForm.description}
                  onChangeText={(description) => setCampaignForm({ ...campaignForm, description })}
                  placeholder="Enter campaign description"
                  multiline
                  numberOfLines={3}
                  autoCapitalize="sentences"
                  autoCorrect={false}
                />
              </View>

              {/* Payload Selection */}
              <PayloadSelector />

              {/* Target Criteria */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Target Criteria (JSON)</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={campaignForm.target_criteria}
                  onChangeText={(criteria) => setCampaignForm({ ...campaignForm, target_criteria: criteria })}
                  placeholder='{"query": "product:Apache", "network": "192.168.1.0/24"}'
                  multiline
                  numberOfLines={4}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputHint}>
                  Define target discovery criteria in JSON format
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton, creating && styles.createModalButtonDisabled]}
                onPress={createCampaign}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="rocket" size={20} color="#ffffff" style={styles.createIcon} />
                    <Text style={styles.createModalButtonText}>Create Campaign</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  createButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  createButtonText: {
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
  campaignsList: {
    padding: SPACING.md,
  },
  campaignItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOWS.md,
  },
  campaignIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  campaignName: {
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
  campaignDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  campaignStats: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  campaignDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  campaignAction: {
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  codeInput: {
    height: 100,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  inputHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  selectorContainer: {
    marginBottom: SPACING.lg,
  },
  selectorLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  payloadOption: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    minWidth: 120,
  },
  payloadOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  payloadOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  payloadOptionTextSelected: {
    color: '#ffffff',
  },
  payloadOptionSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  payloadOptionSubtextSelected: {
    color: '#ffffff',
    opacity: 0.8,
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
  createModalButton: {
    backgroundColor: COLORS.primary,
  },
  createModalButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  createIcon: {
    marginRight: SPACING.sm,
  },
  createModalButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
