import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tag, TagId } from '../types';
import { Colors } from '../constants/colors';

interface TagSelectorProps {
  tags: Tag[];
  selected: TagId[];
  onChange: (tags: TagId[]) => void;
}

export default function TagSelector({ tags, selected, onChange }: TagSelectorProps) {
  const toggle = (id: TagId) => {
    onChange(
      selected.includes(id)
        ? selected.filter(t => t !== id)
        : [...selected, id]
    );
  };

  return (
    <View style={styles.row}>
      {tags.map(tag => {
        const isSelected = selected.includes(tag.id);
        return (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.chip,
              isSelected && { backgroundColor: tag.bgColor, borderColor: tag.color },
            ]}
            onPress={() => toggle(tag.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && { color: tag.color, fontWeight: '600' }]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
