import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StyleSheet, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Category, Todo } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import TodoListItem from '../components/TodoListItem';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { RootStackParamList } from '../navigation/RootNavigator';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

type HomeNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { todos, todayTodos, doneCount, toggleTodo, deleteTodo, getTodoStatus } = useTodosContext();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [toast, setToast] = useState(false);

  const filtered = (activeCategory
    ? todayTodos.filter(t => t.category === activeCategory)
    : todayTodos
  ).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: 'easeInEaseOut', property: 'scaleXY' },
    });
    toggleTodo(id);
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
  };

  const handleEdit = (todo: Todo) => {
    navigation.navigate('TodoForm', { todo });
  };

  const getCategoryCount = (cat: Category) =>
    todayTodos.filter(t => t.category === cat).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>똑똑이 인텔리전스 LIVE</Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>나</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 인사/요약 */}
        <View style={styles.summary}>
          <Text style={styles.greeting}>오늘도 집중하는 멋진 하루! ✨</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.monthCount}>
              이번 달 할 일 <Text style={styles.countNum}>{todos.length}</Text>
            </Text>
            <View style={styles.syncBadge}>
              <View style={[styles.syncDot, { backgroundColor: Colors.green }]} />
              <Text style={styles.syncText}>동기화됨</Text>
            </View>
          </View>
        </View>

        {/* 카테고리 필터 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* 전체 칩 */}
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === null && styles.filterChipActive]}
            onPress={() => setActiveCategory(null)}
          >
            <Text style={[styles.filterChipText, activeCategory === null && styles.filterChipTextActive]}>
              전체 {todayTodos.length}
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => {
            const count = getCategoryCount(cat);
            if (count === 0) return null;
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveCategory(isActive ? null : cat)}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {cat} {count}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 오늘의 할 일 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>오늘의 할 일 {filtered.length}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>전체보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            icon="checkbox-outline"
            title="아직 할 일이 없어요"
            description="등록된 할 일이 없어요. 지금 바로 새로운 할 일을 추가해 보세요!"
            actionLabel="할 일 추가하기"
            onAction={() => navigation.navigate('TodoForm', {})}
          />
        ) : (
          <View style={styles.listCard}>
            {filtered.map(todo => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getTodoStatus={getTodoStatus}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Toast message="할 일을 추가했어요." visible={toast} onHide={() => setToast(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.green },
  liveText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  summary: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 4,
  },
  greeting: { fontSize: 14, color: Colors.textSecondary },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthCount: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  countNum: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  syncText: { fontSize: 12, color: Colors.textSecondary },
  filterRow: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: 13, color: Colors.textSecondary },
  listCard: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
