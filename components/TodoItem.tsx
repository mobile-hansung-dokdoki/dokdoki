import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types';
import { Colors } from '../constants/colors';
import { getCategory } from '../constants/categories';
import { Spacing } from '../constants/spacing';
import { formatDateKorean, fromDateString } from '../utils/date';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const category = getCategory(todo.category);
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

      <View style={styles.textBlock}>
        <View style={[styles.categoryBadge, { backgroundColor: category.backgroundColor }]}>
          <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
        </View>
        <Text
          style={[styles.text, todo.done && styles.textDone]}
          numberOfLines={2}
        >
          {todo.text}
        </Text>
        {todo.dueDate && (
          <Text style={[styles.dateText, todo.done && styles.textDone]}>
            {formatDateKorean(fromDateString(todo.dueDate))}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onEdit(todo)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onDelete(todo.id)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 12 }}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.border} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  checkboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 3,
  },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  text: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
});
