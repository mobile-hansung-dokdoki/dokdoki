import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function SyncStatusBadge({ synced }: { synced: boolean }) {
  const label = synced ? '동기화' : '비 동기화';
  const color = synced ? Colors.green : Colors.red;

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
