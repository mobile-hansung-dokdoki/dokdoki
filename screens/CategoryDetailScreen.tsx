import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Category, Todo } from '../types';
import { Colors, CategoryColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import TodoListItem from '../components/TodoListItem';
import EmptyState from '../components/EmptyState';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryDetail'>;

const CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

export default function CategoryDetailScreen({ route, navigation }: Props) {
  const { todos, toggleTodo, deleteTodo, getTodoStatus } = useTodosContext();
  const [selectedCategory, setSelectedCategory] = useState<Category>(route.params.category);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = todos.filter(
    t =>
      t.category === selectedCategory &&
      (!searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryCount = (cat: Category) => todos.filter(t => t.category === cat).length;

  const handleEdit = (todo: Todo) => {
    navigation.navigate('TodoForm', { todo });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedCategory}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 카테고리 전환 칩 행 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipRow}
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          const catColor = CategoryColors[cat];
          const count = getCategoryCount(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                isActive && { backgroundColor: Colors.primary, borderColor: Colors.primary },
                !isActive && { backgroundColor: catColor.bg, borderColor: catColor.bg },
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryChipText,
                isActive && styles.categoryChipTextActive,
                !isActive && { color: catColor.color },
              ]}>
                {cat} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 검색바 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`${selectedCategory} 내 검색`}
          placeholderTextColor={Colors.textTertiary}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 결과 수 */}
      <Text style={styles.resultCount}>{filtered.length}개의 할 일</Text>

      {/* 목록 */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <EmptyState
            icon="folder-outline"
            title="할 일이 없어요"
            description={`${selectedCategory} 카테고리에 할 일을 추가해 보세요!`}
            actionLabel="할 일 추가"
            onAction={() => navigation.navigate('TodoForm', {})}
          />
        ) : (
          <View style={styles.listCard}>
            {filtered.map(todo => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onEdit={handleEdit}
                onDelete={deleteTodo}
                getTodoStatus={getTodoStatus}
              />
            ))}
          </View>
        )}

        {/* 하단 추가 버튼 */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('TodoForm', {})}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.addBtnText}>+ 할 일 추가</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  categoryChipRow: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 13, fontWeight: '500' },
  categoryChipTextActive: { color: '#FFFFFF' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.inputRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 8,
  },
  listCard: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 12,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});
