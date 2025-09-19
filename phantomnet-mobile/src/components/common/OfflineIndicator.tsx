// Offline Indicator Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';

interface OfflineIndicatorProps {
  visible: boolean;
  message?: string;
  type?: 'info' | 'warning' | 'success';
}

export default function OfflineIndicator({
  visible,
  message = 'Using cached data',
  type = 'info'
}: OfflineIndicatorProps) {
  if (!visible) return null;

  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'success':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return COLORS.warning;
      case 'success':
        return COLORS.success;
      default:
        return COLORS.info;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Ionicons
        name={getIconName()}
        size={16}
        color="#ffffff"
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginVertical: SPACING.xs,
    alignSelf: 'flex-start',
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
});
