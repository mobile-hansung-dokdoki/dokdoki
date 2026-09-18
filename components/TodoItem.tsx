import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Tag } from '../types';
import { formatDateKorean, fromDateString, todayString } from '../utils/date';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  tagMap: Record<string, Tag>;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete, tagMap }: TodoItemProps) {
  const [expanded, setExpanded] = useState(false);
  const isToday = !!todo.dueDate && todo.dueDate === todayString();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onToggle(todo.id)}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={[styles.checkbox, todo.done && styles.checkboxDone]}>
          {todo.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.textBlock}
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.text, todo.done && styles.textDone]}
          numberOfLines={expanded ? undefined : 2}
        >
          {todo.text}
        </Text>
        {todo.tags && todo.tags.length > 0 && (
          <View style={styles.tagRow}>
            {todo.tags.map(tagId => {
              const tag = tagMap[tagId];
              if (!tag) return null;
              return (
                <View key={tagId} style={[styles.tagChip, { backgroundColor: tag.bgColor }]}>
                  <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        )}
        {todo.dueDate && (
          <View style={styles.dateRow}>
            <Text style={[styles.dateText, todo.done && styles.textDone]}>
              {formatDateKorean(fromDateString(todo.dueDate))}
            </Text>
            {isToday && !todo.done && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>오늘</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onEdit(todo)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.iconBtn}
      >
        <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onDelete(todo.id)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 12 }}
        style={styles.iconBtn}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.border} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.itemVertical,
    paddingHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  checkbox: {
    width: Spacing.checkboxSize,
    height: Spacing.checkboxSize,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  checkboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  todayBadge: {
    backgroundColor: '#E8F4EC',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
  iconBtn: {
    marginTop: 3,
  },
});
