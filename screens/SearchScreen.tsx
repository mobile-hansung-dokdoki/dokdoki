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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Todo } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import TodoListItem from '../components/TodoListItem';
import EmptyState from '../components/EmptyState';
import { RootStackParamList } from '../navigation/RootNavigator';

type SearchNavProp = NativeStackNavigationProp<RootStackParamList>;
type StatusFilter = '전체' | '미완료' | '완료';

const STATUS_FILTERS: StatusFilter[] = ['전체', '미완료', '완료'];

export default function SearchScreen() {
  const navigation = useNavigation<SearchNavProp>();
  const { todos, toggleTodo, deleteTodo, getTodoStatus } = useTodosContext();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');

  const filtered = todos.filter(t => {
    const matchQuery =
      !query ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.memo ?? '').toLowerCase().includes(query.toLowerCase());
    const matchStatus =
      statusFilter === '전체' ||
      (statusFilter === '완료' && t.done) ||
      (statusFilter === '미완료' && !t.done);
    return matchQuery && matchStatus;
  });

  const getStatusCount = (status: StatusFilter): number => {
    if (status === '전체') return todos.length;
    if (status === '완료') return todos.filter(t => t.done).length;
    return todos.filter(t => !t.done).length;
  };

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
        <Text style={styles.headerTitle}>검색</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 검색 입력 */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="할 일, 메모 검색"
          placeholderTextColor={Colors.textTertiary}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 상태 필터 칩 */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(status => {
          const isActive = statusFilter === status;
          const count = getStatusCount(status);
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {status} {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 결과 수 */}
      <Text style={styles.resultCount}>검색 결과 {filtered.length}</Text>

      {/* 결과 목록 */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="검색 결과가 없어요"
            description="다른 검색어나 필터를 시도해 보세요."
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.inputRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
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
});
