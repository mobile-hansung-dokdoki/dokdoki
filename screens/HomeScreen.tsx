import React, { useState, useMemo } from 'react';
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

  // 주간 통계 계산
  const { achievementRate, completedCount, totalCount, streak, weekDone, weekTotal } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const mon = new Date(now);
    mon.setDate(now.getDate() - diff);
    const weekStart = mon.toISOString().split('T')[0];

    const weekTodos = todos.filter(t => t.date && t.date >= weekStart && t.date <= today);
    const wDone = weekTodos.filter(t => t.done).length;
    const wTotal = weekTodos.length;
    const rate = wTotal > 0 ? Math.round(wDone / wTotal * 100) : 0;

    const doneDates = new Set(todos.filter(t => t.done && t.date).map(t => t.date!));
    let s = 0;
    const d = new Date(now);
    for (let i = 0; i < 365; i++) {
      const str = d.toISOString().split('T')[0];
      if (doneDates.has(str)) { s++; d.setDate(d.getDate() - 1); }
      else if (i === 0) { d.setDate(d.getDate() - 1); }
      else break;
    }

    return {
      achievementRate: rate,
      completedCount: todos.filter(t => t.done).length,
      totalCount: todos.length,
      streak: s,
      weekDone: wDone,
      weekTotal: wTotal,
    };
  }, [todos]);

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

        {/* 검색바 */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>할 일, 메모, 태그 검색</Text>
          <Ionicons name="mic-outline" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

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

        {/* OCR 배너 */}
        <View style={styles.ocrBanner}>
          <View style={styles.ocrLabelBadge}>
            <Text style={styles.ocrLabelText}>👁 AI SMART OCR</Text>
          </View>
          <View style={styles.ocrRow}>
            <View style={styles.ocrTextWrap}>
              <Text style={styles.ocrTitle}>AI 메모 스캔</Text>
              <Text style={styles.ocrSub}>손글씨·이미지 속 할 일을 변환해 만들어 보세요.</Text>
            </View>
            <TouchableOpacity style={styles.ocrBtn} activeOpacity={0.8} onPress={() => navigation.navigate('OcrIntro')}>
              <Text style={styles.ocrBtnText}>📷 스캔하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 주간 분석 카드 */}
        <View style={styles.analyticsCard}>
          {/* 카드 헤더 */}
          <View style={styles.analyticsHeader}>
            <Text style={styles.analyticsTitle}>WEEKLY ANALYTICS</Text>
            <View style={styles.analyticsTopBadge}>
              <Text style={styles.analyticsTopBadgeText}>상위 5% 🏆</Text>
            </View>
          </View>
          <Text style={styles.analyticsSubtitle}>나의 생산성 리포트</Text>

          {/* 도넛 + 범례 */}
          <View style={styles.analyticsContent}>
            <View style={styles.donutCircle}>
              <Text style={styles.donutPercent}>{achievementRate}%</Text>
              <Text style={styles.donutCaption}>달성률</Text>
            </View>
            <View style={styles.legendWrap}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.legendText}>완료 건수 {completedCount}건</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.textTertiary }]} />
                <Text style={styles.legendText}>전체 건수 {totalCount}건</Text>
              </View>
            </View>
          </View>

          {/* 하단 2칸 통계 */}
          <View style={styles.analyticsStatsRow}>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatLabel}>연속 달성</Text>
              <Text style={styles.analyticsStatValue}>{streak > 0 ? `${streak}일 연속` : '-'}</Text>
              <Text style={styles.analyticsStatSub}>{streak > 0 ? '지금도 꾸준히 하고 있어요!' : '오늘 할 일을 완료해보세요!'}</Text>
            </View>
            <View style={styles.analyticsStatItem}>
              <Text style={styles.analyticsStatLabel}>이번 주 목표</Text>
              <Text style={styles.analyticsStatValue}>{weekDone}/{weekTotal > 0 ? weekTotal : '-'}개</Text>
              <Text style={styles.analyticsStatSub}>{weekTotal > weekDone ? `목표까지 ${weekTotal - weekDone}개 남았어요!` : weekTotal > 0 ? '이번 주 목표 달성! 🎉' : '이번 주 할 일을 추가해보세요!'}</Text>
            </View>
          </View>
        </View>

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
  // SearchBar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.inputRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: Colors.textTertiary },
  // OCR 배너
  ocrBanner: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.cardRadius,
    padding: 16,
    marginBottom: 16,
  },
  ocrLabelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.blue,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  ocrLabelText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  ocrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  ocrTextWrap: { flex: 1, gap: 4 },
  ocrTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  ocrSub: { fontSize: 12, color: '#9DB4CB' },
  ocrBtn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ocrBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  // 주간 분석 카드
  analyticsCard: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  analyticsTitle: { fontSize: 12, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  analyticsTopBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  analyticsTopBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.amber },
  analyticsSubtitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  analyticsContent: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 16 },
  donutCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercent: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  donutCaption: { fontSize: 10, color: Colors.textSecondary },
  legendWrap: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, color: Colors.textSecondary },
  analyticsStatsRow: { flexDirection: 'row', gap: 12 },
  analyticsStatItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 3,
  },
  analyticsStatLabel: { fontSize: 11, color: Colors.textTertiary },
  analyticsStatValue: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  analyticsStatSub: { fontSize: 11, color: Colors.textSecondary },
});
