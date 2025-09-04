// Payload Generation Screen Component

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// Import services and types
import apiService from '../../services/api';
import { Payload, PayloadGenerationRequest } from '../../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS, PLATFORMS, ARCHITECTURES, PAYLOAD_TYPES } from '../../constants';

export default function PayloadsScreen() {
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator form state
  const [payloadName, setPayloadName] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORMS>('WINDOWS');
  const [selectedArchitecture, setSelectedArchitecture] = useState<keyof typeof ARCHITECTURES>('X64');
  const [selectedType, setSelectedType] = useState<string>('exe');

  useEffect(() => {
    loadPayloads();
  }, []);

  const loadPayloads = async () => {
    try {
      setLoading(true);
      const result = await apiService.getPayloads();
      if (result.success && result.data) {
        setPayloads(result.data);
      }
    } catch (error) {
      console.error('Failed to load payloads:', error);
      Alert.alert('Error', 'Failed to load payloads');
    } finally {
      setLoading(false);
    }
  };

  const generatePayload = async () => {
    if (!payloadName.trim()) {
      Alert.alert('Error', 'Please enter a payload name');
      return;
    }

    setGenerating(true);
    try {
      const payloadRequest: PayloadGenerationRequest = {
        name: payloadName.trim(),
        platform: PLATFORMS[selectedPlatform].toLowerCase() as any,
        architecture: ARCHITECTURES[selectedArchitecture].toLowerCase() as any,
        payload_type: selectedType,
      };

      const result = await apiService.generatePayload(payloadRequest);

      if (result.success) {
        Alert.alert('Success', 'Payload generated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setShowGenerator(false);
              setPayloadName('');
              loadPayloads(); // Refresh the list
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate payload');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate payload');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPayload = async (payload: Payload) => {
    try {
      const result = await apiService.downloadPayload(payload.id);

      if (result.success) {
        Alert.alert('Success', 'Payload downloaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to download payload');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download payload');
    }
  };

  const sharePayload = async (payload: Payload) => {
    try {
      const result = await Share.share({
        message: `Payload: ${payload.name}\nPlatform: ${payload.platform}/${payload.architecture}\nType: ${payload.payload_type}\nGenerated: ${new Date(payload.created_at).toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error sharing payload:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Success', 'Copied to clipboard!');
  };

  const PayloadItem = ({ payload }: { payload: Payload }) => (
    <View style={styles.payloadItem}>
      <View style={styles.payloadIcon}>
        <Ionicons name="nuclear" size={24} color={COLORS.primary} />
      </View>

      <View style={styles.payloadInfo}>
        <View style={styles.payloadHeader}>
          <Text style={styles.payloadName} numberOfLines={1}>
            {payload.name}
          </Text>
          <View style={styles.payloadBadge}>
            <Text style={styles.payloadBadgeText}>
              {payload.platform}/{payload.architecture}
            </Text>
          </View>
        </View>

        <Text style={styles.payloadType}>
          Type: {payload.payload_type.toUpperCase()}
        </Text>

        <Text style={styles.payloadDate}>
          Created: {new Date(payload.created_at).toLocaleString()}
        </Text>

        <View style={styles.payloadStatus}>
          <View style={[styles.statusIndicator, payload.is_active && styles.statusActive]} />
          <Text style={styles.statusText}>
            {payload.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.payloadActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => downloadPayload(payload)}
        >
          <Ionicons name="download" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => sharePayload(payload)}
        >
          <Ionicons name="share" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const PlatformSelector = ({ selected, onSelect }: {
    selected: keyof typeof PLATFORMS;
    onSelect: (platform: keyof typeof PLATFORMS) => void;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Platform</Text>
      <View style={styles.selectorButtons}>
        {Object.keys(PLATFORMS).map((platform) => (
          <TouchableOpacity
            key={platform}
            style={[
              styles.selectorButton,
              selected === platform && styles.selectorButtonActive,
            ]}
            onPress={() => onSelect(platform as keyof typeof PLATFORMS)}
          >
            <Text style={[
              styles.selectorButtonText,
              selected === platform && styles.selectorButtonTextActive,
            ]}>
              {platform}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ArchitectureSelector = ({ selected, onSelect }: {
    selected: keyof typeof ARCHITECTURES;
    onSelect: (arch: keyof typeof ARCHITECTURES) => void;
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Architecture</Text>
      <View style={styles.selectorButtons}>
        {Object.keys(ARCHITECTURES).map((arch) => (
          <TouchableOpacity
            key={arch}
            style={[
              styles.selectorButton,
              selected === arch && styles.selectorButtonActive,
            ]}
            onPress={() => onSelect(arch as keyof typeof ARCHITECTURES)}
          >
            <Text style={[
              styles.selectorButtonText,
              selected === arch && styles.selectorButtonTextActive,
            ]}>
              {arch}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const TypeSelector = ({ platform, selected, onSelect }: {
    platform: keyof typeof PLATFORMS;
    selected: string;
    onSelect: (type: string) => void;
  }) => {
    const availableTypes = PAYLOAD_TYPES[platform.toLowerCase() as keyof typeof PAYLOAD_TYPES] || {};

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Payload Type</Text>
        <View style={styles.selectorButtons}>
          {Object.keys(availableTypes).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectorButton,
                selected === type && styles.selectorButtonActive,
              ]}
              onPress={() => onSelect(type)}
            >
              <Text style={[
                styles.selectorButtonText,
                selected === type && styles.selectorButtonTextActive,
              ]}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Payloads...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Generate Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payloads</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => setShowGenerator(true)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      </View>

      {/* Payloads List */}
      <FlatList
        data={payloads}
        renderItem={({ item }) => <PayloadItem payload={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="nuclear-outline" size={80} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Payloads Generated</Text>
            <Text style={styles.emptySubtitle}>
              Create your first payload to get started
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowGenerator(true)}
            >
              <Text style={styles.emptyButtonText}>Generate Payload</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Payload Generator Modal */}
      <Modal
        visible={showGenerator}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGenerator(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Payload</Text>
              <TouchableOpacity onPress={() => setShowGenerator(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Payload Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Payload Name</Text>
                <TextInput
                  style={styles.input}
                  value={payloadName}
                  onChangeText={setPayloadName}
                  placeholder="Enter payload name"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Platform Selector */}
              <PlatformSelector
                selected={selectedPlatform}
                onSelect={(platform) => {
                  setSelectedPlatform(platform);
                  // Reset type when platform changes
                  const defaultTypes = PAYLOAD_TYPES[platform.toLowerCase() as keyof typeof PAYLOAD_TYPES];
                  if (defaultTypes && !defaultTypes[selectedType]) {
                    setSelectedType(Object.keys(defaultTypes)[0]);
                  }
                }}
              />

              {/* Architecture Selector */}
              <ArchitectureSelector
                selected={selectedArchitecture}
                onSelect={setSelectedArchitecture}
              />

              {/* Type Selector */}
              <TypeSelector
                platform={selectedPlatform}
                selected={selectedType}
                onSelect={setSelectedType}
              />

              {/* Generate Button */}
              <TouchableOpacity
                style={[styles.modalGenerateButton, generating && styles.modalGenerateButtonDisabled]}
                onPress={generatePayload}
                disabled={generating || !payloadName.trim()}
              >
                {generating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="nuclear" size={20} color="#ffffff" style={styles.modalGenerateIcon} />
                    <Text style={styles.modalGenerateButtonText}>Generate Payload</Text>
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
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  listContainer: {
    padding: SPACING.md,
  },
  payloadItem: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  payloadIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  payloadInfo: {
    flex: 1,
  },
  payloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  payloadName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  payloadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  payloadBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  payloadType: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  payloadDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  payloadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  statusActive: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  payloadActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
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
  selectorContainer: {
    marginBottom: SPACING.lg,
  },
  selectorLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  selectorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectorButton: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selectorButtonActive: {
    backgroundColor: COLORS.primary,
  },
  selectorButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: '#ffffff',
  },
  modalGenerateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  modalGenerateButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  modalGenerateIcon: {
    marginRight: SPACING.sm,
  },
  modalGenerateButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
