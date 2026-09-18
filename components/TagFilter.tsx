import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TagId } from '../types';
import { TAGS } from '../constants/tags';
import { Spacing } from '../constants/spacing';
import { Colors } from '../constants/colors';

interface TagFilterProps {
  activeTag: TagId | null;
  onTagChange: (tag: TagId | null) => void;
}

export default function TagFilter({ activeTag, onTagChange }: TagFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity
        style={[styles.chip, activeTag === null && styles.chipActive]}
        onPress={() => onTagChange(null)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, activeTag === null && styles.chipTextActive]}>
          전체
        </Text>
      </TouchableOpacity>

      {TAGS.map(tag => {
        const isActive = activeTag === tag.id;
        return (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.chip,
              isActive && { backgroundColor: tag.bgColor, borderColor: tag.color },
            ]}
            onPress={() => onTagChange(isActive ? null : tag.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && { color: tag.color, fontWeight: '600' }]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: Spacing.screenHorizontal,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
