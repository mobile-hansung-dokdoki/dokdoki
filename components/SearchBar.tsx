import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { SortOrder } from '../types';

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'createdDesc', label: '날짜순' },
  { value: 'createdAsc', label: '작성 시간 순' },
  { value: 'dueDate',    label: '마감 날짜 순' },
];

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  dropdownOpen: boolean;
  onDropdownChange: (open: boolean) => void;
}

export default function SearchBar({ value, onChangeText, sortOrder, onSortChange, dropdownOpen, onDropdownChange }: SearchBarProps) {
  const currentLabel = SORT_OPTIONS.find(o => o.value === sortOrder)?.label ?? '날짜순';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* 검색 입력 */}
        <View style={styles.inputRow}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder="메모 내용 또는 날짜로 검색"
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* 정렬 버튼 */}
        <TouchableOpacity
          style={[styles.sortBtn, dropdownOpen && styles.sortBtnActive]}
          onPress={() => onDropdownChange(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-vertical-outline" size={14} color={dropdownOpen ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.sortBtnText, dropdownOpen && styles.sortBtnTextActive]}>{currentLabel}</Text>
          <Ionicons
            name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={dropdownOpen ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* 드롭다운 */}
      {dropdownOpen && (
        <View style={styles.dropdown}>
          {SORT_OPTIONS.map((option, idx) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.dropdownItem, idx < SORT_OPTIONS.length - 1 && styles.dropdownItemBorder]}
              onPress={() => { onSortChange(option.value); onDropdownChange(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownLabel, sortOrder === option.value && styles.dropdownLabelActive]}>
                {option.label}
              </Text>
              {sortOrder === option.value && (
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 10,
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EAF2EC',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sortBtnTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 46,
    right: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 140,
    zIndex: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  dropdownLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
