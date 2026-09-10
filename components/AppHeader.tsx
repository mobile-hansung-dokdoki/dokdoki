import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

type SyncStatus = 'synced' | 'offline' | 'none';

interface AppHeaderProps {
  syncStatus?: SyncStatus;
  onSettingsPress?: () => void;
}

const BADGE_CONFIG = {
  synced: { icon: 'checkmark-circle-outline', label: '동기화됨', color: Colors.primary },
  offline: { icon: 'cloud-offline-outline',   label: '오프라인',  color: Colors.warning },
} as const;

export default function AppHeader({ syncStatus = 'none', onSettingsPress }: AppHeaderProps) {
  const config = syncStatus !== 'none' ? BADGE_CONFIG[syncStatus] : null;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>할 일 앱</Text>
        <Text style={styles.subtitle}>스마트한 하루 정리</Text>
      </View>
      <View style={styles.right}>
        {config && (
          <View style={styles.badge}>
            <Ionicons name={config.icon} size={14} color={config.color} />
            <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
          </View>
        )}
        <TouchableOpacity onPress={onSettingsPress} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.screenTop,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
