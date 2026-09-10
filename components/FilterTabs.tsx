import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Filter } from '../types';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface FilterTabsProps {
  activeFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const TABS: { label: string; value: Filter }[] = [
  { label: '전체', value: 'all' },
  { label: '진행중', value: 'active' },
  { label: '완료', value: 'done' },
];

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {TABS.map(tab => {
          const isActive = activeFilter === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onFilterChange(tab.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive ? styles.textActive : styles.textInactive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.tabActiveBg,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textActive: {
    color: Colors.tabActiveText,
  },
  textInactive: {
    color: Colors.tabInactiveText,
  },
});
