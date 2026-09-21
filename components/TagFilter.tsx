import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tag, TagId } from '../types';
import { Spacing } from '../constants/spacing';
import { Colors } from '../constants/colors';

interface TagFilterProps {
  tags: Tag[];
  activeTags: TagId[];
  onTagToggle: (tagId: TagId) => void;
  onClearTags: () => void;
  onAddPress: () => void;
}

export default function TagFilter({ tags, activeTags, onTagToggle, onClearTags, onAddPress }: TagFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {/* 전체 칩 */}
        <TouchableOpacity
          style={[styles.chip, activeTags.length === 0 && styles.chipAllActive]}
          onPress={onClearTags}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, activeTags.length === 0 && styles.chipTextAllActive]}>
            전체
          </Text>
        </TouchableOpacity>

        {tags.map(tag => {
          const isActive = activeTags.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.chip,
                isActive && { backgroundColor: tag.bgColor, borderColor: tag.color },
              ]}
              onPress={() => onTagToggle(tag.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && { color: tag.color, fontWeight: '600' }]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 태그 추가 버튼 (고정) */}
      <TouchableOpacity style={styles.addBtn} onPress={onAddPress} activeOpacity={0.7}>
        <Ionicons name="add" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingLeft: Spacing.screenHorizontal,
    paddingRight: 8,
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
  chipAllActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextAllActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addBtn: {
    width: 36,
    height: 36,
    marginRight: Spacing.screenHorizontal,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
