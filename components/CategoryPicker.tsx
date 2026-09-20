import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TodoCategory } from '../types';
import { TODO_CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';

interface CategoryPickerProps {
  value: TodoCategory;
  onChange: (category: TodoCategory) => void;
}

export default function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>카테고리</Text>
      <View style={styles.options}>
        {TODO_CATEGORIES.map(category => {
          const selected = value === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              accessibilityRole="radio"
              accessibilityLabel={category.label}
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(category.id)}
              activeOpacity={0.7}
              style={[
                styles.option,
                { borderColor: selected ? category.color : Colors.border,
                  backgroundColor: selected ? category.backgroundColor : Colors.surface },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: category.color }]} />
              <Text style={[styles.optionText, { color: category.color }, selected && styles.selectedText]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  options: { flexDirection: 'row', gap: 6 },
  option: {
    flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 4, paddingVertical: 8,
    borderWidth: 1.5, borderRadius: 10, gap: 4,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  optionText: { fontSize: 13 },
  selectedText: { fontWeight: '700' },
});
