import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TodoStatus } from '../types';
import { StatusColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

export default function StatusBadge({ status }: { status: TodoStatus }) {
  const s = StatusColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Spacing.chipRadius,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
