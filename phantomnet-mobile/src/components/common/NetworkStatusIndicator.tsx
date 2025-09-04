// Network Status Indicator Component

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../constants';
import offlineManager from '../../services/offline';

interface NetworkStatusIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
}

export default function NetworkStatusIndicator({
  showDetails = false,
  onPress
}: NetworkStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [queueLength, setQueueLength] = useState(0);
  const [lastSync, setLastSync] = useState<number>(0);

  useEffect(() => {
    // Initial status check
    checkNetworkStatus();

    // Set up network monitoring
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      const type = state.type || 'unknown';

      setIsConnected(connected);
      setConnectionType(type);

      if (!connected) {
        // App went offline
        Alert.alert(
          'Connection Lost',
          'You are now offline. Some features may be limited.',
          [{ text: 'OK' }]
        );
      } else {
        // App came back online
        Alert.alert(
          'Connection Restored',
          'You are back online. Syncing pending data...',
          [{ text: 'OK' }]
        );
        // Trigger sync
        offlineManager.forceSync();
      }
    });

    // Update queue length and sync time periodically
    const updateStatus = () => {
      setQueueLength(offlineManager.getQueueLength());
      setLastSync(offlineManager.getLastSyncTime());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const checkNetworkStatus = async () => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
      setConnectionType(state.type || 'unknown');
    } catch (error) {
      console.error('Failed to check network status:', error);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return COLORS.error;
    if (connectionType === 'wifi') return COLORS.success;
    if (connectionType === 'cellular') return COLORS.warning;
    return COLORS.info;
  };

  const getStatusIcon = () => {
    if (!isConnected) return 'cloud-offline';
    if (connectionType === 'wifi') return 'wifi';
    if (connectionType === 'cellular') return 'cellular';
    return 'help-circle';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Offline';
    if (connectionType === 'wifi') return 'Online (WiFi)';
    if (connectionType === 'cellular') return 'Online (Cellular)';
    return 'Online';
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    // Default action - show network details
    const details = `
Connection: ${getStatusText()}
Queue: ${queueLength} pending items
Last Sync: ${lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
    `.trim();

    Alert.alert(
      'Network Status',
      details,
      [
        {
          text: 'Force Sync',
          onPress: async () => {
            try {
              await offlineManager.forceSync();
              Alert.alert('Success', 'Sync completed!');
              checkNetworkStatus();
            } catch (error) {
              Alert.alert('Error', 'Sync failed');
            }
          }
        },
        { text: 'OK' }
      ]
    );
  };

  const renderDetailedView = () => (
    <View style={styles.detailedContainer}>
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {queueLength > 0 && (
        <View style={styles.queueInfo}>
          <Ionicons name="time" size={16} color={COLORS.warning} />
          <Text style={styles.queueText}>
            {queueLength} item{queueLength !== 1 ? 's' : ''} queued
          </Text>
        </View>
      )}

      {lastSync > 0 && (
        <Text style={styles.syncText}>
          Last sync: {new Date(lastSync).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );

  if (showDetails) {
    return renderDetailedView();
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: getStatusColor() }]}
      onPress={handlePress}
    >
      <Ionicons
        name={getStatusIcon()}
        size={16}
        color={getStatusColor()}
      />
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
      {queueLength > 0 && (
        <View style={styles.queueBadge}>
          <Text style={styles.queueBadgeText}>{queueLength}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  queueBadge: {
    backgroundColor: COLORS.warning,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  queueBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  detailedContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  queueText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
  },
  syncText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
});
