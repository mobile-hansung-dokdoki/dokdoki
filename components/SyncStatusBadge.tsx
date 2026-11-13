import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import type { CloudSyncStatus } from '../hooks/useTodos';

const STATUS: Record<CloudSyncStatus, { label: string; color: string }> = {
  offline: { label: '오프라인 · 기기에 저장됨', color: Colors.amber },
  syncing: { label: '동기화 중', color: Colors.blue },
  synced: { label: '동기화 완료', color: Colors.green },
  error: { label: '동기화 확인 필요', color: Colors.red },
};

export default function SyncStatusBadge({ status = 'offline', synced }: { status?: CloudSyncStatus; synced?: boolean }) {
  const view = synced === undefined ? STATUS[status] : (synced ? STATUS.synced : STATUS.offline);
  const { label, color } = view;

  return (
    <View
      style={styles.badge}
      accessible
      accessibilityLabel={`동기화 상태: ${label}`}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '600' },
});
