import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { formatTime } from '../utils/date';

type SyncStatus = 'synced' | 'offline' | 'none';

interface AppHeaderProps {
  syncStatus?: SyncStatus;
  lastSyncAt?: number;
  onSettingsPress?: () => void;
  onCalendarPress?: () => void;
  doneCount?: number;
  totalCount?: number;
}

const BADGE_CONFIG = {
  synced: { icon: 'checkmark-circle-outline', label: '동기화됨', color: Colors.primary },
  offline: { icon: 'cloud-offline-outline',   label: '오프라인',  color: Colors.warning },
} as const;

export default function AppHeader({ syncStatus = 'none', lastSyncAt, onSettingsPress, onCalendarPress, doneCount = 0, totalCount = 0 }: AppHeaderProps) {
  const config = syncStatus !== 'none' ? BADGE_CONFIG[syncStatus] : null;
  const rate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>똑똑이</Text>
        <Text style={styles.subtitle}>스마트한 하루 정리</Text>
        <View style={styles.progressWrapper}>
          <Text style={styles.progress}>
            {totalCount}개 중 {doneCount}개 완료 · {rate}%
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${rate}%` }]} />
          </View>
        </View>
      </View>
      <View style={styles.right}>
        {config && (
          <View style={styles.badge}>
            <Ionicons name={config.icon} size={14} color={config.color} />
            <Text style={[styles.badgeText, { color: config.color }]}>
              {config.label}
              {syncStatus === 'synced' && lastSyncAt
                ? ` ${formatTime(new Date(lastSyncAt))}`
                : ''}
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={onCalendarPress} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
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
  progressWrapper: {
    marginTop: 5,
    gap: 4,
  },
  progress: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  barTrack: {
    width: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
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
