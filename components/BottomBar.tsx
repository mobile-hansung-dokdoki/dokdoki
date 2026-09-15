import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface BottomBarProps {
  onMemoScan: () => void;
  onAdd: () => void;
}

export default function BottomBar({ onMemoScan, onAdd }: BottomBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.memoScan} onPress={onMemoScan} activeOpacity={0.7}>
        <Ionicons name="scan-outline" size={18} color={Colors.textSecondary} />
        <Text style={styles.memoText}>메모 스캔</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  memoScan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fab: {
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: Spacing.fabSize / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
