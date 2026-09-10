import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Todo } from '../types';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
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

      <Text
        style={[styles.text, todo.done && styles.textDone]}
        numberOfLines={2}
      >
        {todo.text}
      </Text>

      <TouchableOpacity
        onPress={() => onDelete(todo.id)}
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
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
  text: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
});
