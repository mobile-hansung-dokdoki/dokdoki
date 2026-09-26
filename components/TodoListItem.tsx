import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types';
import { Colors, CategoryColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import StatusBadge from './StatusBadge';

interface Props {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  getTodoStatus: (todo: Todo) => '완료' | '진행' | '대기';
}

export default function TodoListItem({ todo, onToggle, onEdit, onDelete, getTodoStatus }: Props) {
  const status = getTodoStatus(todo);
  const catColor = CategoryColors[todo.category]?.color ?? Colors.textSecondary;

  const handleMore = () => {
    Alert.alert(todo.title, undefined, [
      { text: '수정', onPress: () => onEdit(todo) },
      { text: '삭제', style: 'destructive', onPress: () => onDelete(todo.id) },
      { text: '취소', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => onToggle(todo.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, todo.done && styles.checkboxDone]}>
          {todo.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={() => onEdit(todo)} activeOpacity={0.7}>
        <Text style={[styles.title, todo.done && styles.titleDone]} numberOfLines={1}>
          {todo.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.dot, { backgroundColor: catColor }]} />
          <Text style={styles.metaText}>
            {todo.time ? `${todo.time} · ` : ''}{todo.category}
          </Text>
        </View>
      </TouchableOpacity>

      <StatusBadge status={status} />

      <TouchableOpacity onPress={handleMore} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="ellipsis-vertical" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
