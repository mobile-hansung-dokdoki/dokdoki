import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Category } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

interface Props {
  label: Category;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function CategoryChip({ label, selected, onPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      accessibilityHint={onLongPress ? '길게 누르면 카테고리를 삭제할 수 있어요.' : undefined}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Spacing.chipRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedText: {
    color: '#FFFFFF',
  },
});
