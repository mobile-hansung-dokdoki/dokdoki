import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTodosContext } from '../navigation/TodosContext';
import { Category, Todo } from '../types';
import { Colors, CategoryColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

const BAR_MAX_HEIGHT = 80;
const CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

type PeriodTab = '주간' | '월간' | '전체';
const PERIOD_TABS: PeriodTab[] = ['주간', '월간', '전체'];
const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_MAP = [1, 2, 3, 4, 5, 6, 0]; // label index → getDay()

function calcStreak(todos: Todo[]): number {
  const doneDates = new Set(todos.filter(t => t.done && t.date).map(t => t.date!));
  let s = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const str = d.toISOString().split('T')[0];
    if (doneDates.has(str)) { s++; d.setDate(d.getDate() - 1); }
    else if (i === 0) { d.setDate(d.getDate() - 1); }
    else break;
  }
  return s;
}

export default function ReportScreen() {
  const { todos } = useTodosContext();
  const [activeTab, setActiveTab] = useState<PeriodTab>('주간');

  const { filteredTodos, completedCount, totalCount, achievementRate, inProgressCount, streak, dayData, categoryData, weekTotal, weekDone } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let filtered: Todo[];
    if (activeTab === '주간') {
      const diff = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const mon = new Date(now);
      mon.setDate(now.getDate() - diff);
      const weekStart = mon.toISOString().split('T')[0];
      filtered = todos.filter(t => !t.date || (t.date >= weekStart && t.date <= today));
    } else if (activeTab === '월간') {
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      filtered = todos.filter(t => !t.date || (t.date >= monthStart && t.date <= today));
    } else {
      filtered = todos;
    }

    const done = filtered.filter(t => t.done).length;
    const total = filtered.length;
    const rate = total > 0 ? Math.round(done / total * 100) : 0;
    const inProg = filtered.filter(t => !t.done && t.time).length;

    const days = DAY_LABELS.map((label, i) => {
      const target = DAY_MAP[i];
      const count = filtered.filter(t => {
        if (!t.done || !t.date) return false;
        return new Date(t.date + 'T00:00:00').getDay() === target;
      }).length;
      return { label, value: count };
    });

    const cats = CATEGORIES.map(cat => ({
      name: cat,
      done: filtered.filter(t => t.category === cat && t.done).length,
      total: filtered.filter(t => t.category === cat).length,
    })).filter(c => c.total > 0);

    // 주간 수치 (탭 무관하게 항상 이번 주 기준)
    const wDiff = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const wMon = new Date(now);
    wMon.setDate(now.getDate() - wDiff);
    const wStart = wMon.toISOString().split('T')[0];
    const weekF = todos.filter(t => t.date && t.date >= wStart && t.date <= today);

    return {
      filteredTodos: filtered,
      completedCount: done,
      totalCount: total,
      achievementRate: rate,
      inProgressCount: inProg,
      streak: calcStreak(todos),
      dayData: days,
      categoryData: cats,
      weekTotal: weekF.length,
      weekDone: weekF.filter(t => t.done).length,
    };
  }, [todos, activeTab]);

  const maxDayValue = Math.max(...dayData.map(d => d.value), 1);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 생산성 리포트</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 기간 탭 */}
        <View style={styles.tabRow}>
          {PERIOD_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 격려 문구 */}
        <View style={styles.encourageWrap}>
          <Text style={styles.encourageTitle}>
            {completedCount > 0 ? '잘하고 있어요!' : '할 일을 추가해보세요!'}
          </Text>
          <Text style={styles.encourageSub}>
            {completedCount > 0 ? '꾸준히 이어가는 모습이 멋져요. ✨' : '첫 번째 할 일을 완료해보세요.'}
          </Text>
        </View>

        {/* 달성률 도넛 카드 */}
        <View style={styles.donutCard}>
          <View style={styles.donutOuter}>
            <View style={styles.donutInner}>
              <Text style={styles.donutPercent}>{achievementRate}%</Text>
              <Text style={styles.donutCaption}>
                {activeTab === '주간' ? '이번 주 달성률' : activeTab === '월간' ? '이번 달 달성률' : '전체 달성률'}
              </Text>
            </View>
          </View>
          <View style={styles.legendWrap}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
              <Text style={styles.legendLabel}>완료</Text>
              <Text style={styles.legendValue}>{completedCount}건</Text>
            </View>
            <View style={styles.legendDivider} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.blue }]} />
              <Text style={styles.legendLabel}>진행 중</Text>
              <Text style={styles.legendValue}>{inProgressCount}건</Text>
            </View>
            <View style={styles.legendDivider} />
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.border }]} />
              <Text style={styles.legendLabel}>전체</Text>
              <Text style={styles.legendValue}>{totalCount}건</Text>
            </View>
          </View>
        </View>

        {/* 통계 카드 2개 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>연속 달성</Text>
            <Text style={styles.statValue}>{streak > 0 ? `${streak}일 연속` : '-'}</Text>
            <Text style={styles.statSub}>{streak > 0 ? '지금도 꾸준히 하고 있어요!' : '오늘 할 일을 완료해보세요!'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>이번 주 목표</Text>
            <Text style={styles.statValue}>{weekDone}/{weekTotal > 0 ? weekTotal : '-'}개</Text>
            <Text style={styles.statSub}>{weekTotal > weekDone ? `목표까지 ${weekTotal - weekDone}개 남았어요!` : weekTotal > 0 ? '이번 주 목표 달성! 🎉' : '이번 주 할 일을 추가해보세요!'}</Text>
          </View>
        </View>

        {/* 요일별 완료 추이 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>요일별 완료 추이</Text>
            <Text style={styles.sectionBadge}>총 완료 {completedCount}건</Text>
          </View>
          <View style={styles.barChartWrap}>
            {dayData.map((item) => {
              const barHeight = Math.max(4, (item.value / maxDayValue) * BAR_MAX_HEIGHT);
              const isHighlight = item.value === Math.max(...dayData.map(d => d.value)) && item.value > 0;
              return (
                <View key={item.label} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: barHeight, backgroundColor: isHighlight ? Colors.blue : '#CBD5E1' }]} />
                  </View>
                  <Text style={[styles.barLabel, isHighlight && styles.barLabelHighlight]}>{item.label}</Text>
                  {item.value > 0 && <Text style={styles.barValue}>{item.value}</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* 카테고리별 진행 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>카테고리별 진행 상황</Text>
          </View>
          {categoryData.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>할 일을 추가하면 카테고리별 통계가 표시돼요.</Text>
            </View>
          ) : (
            <View style={styles.categoryCard}>
              {categoryData.map((item, idx) => {
                const percent = item.total > 0 ? Math.round(item.done / item.total * 100) : 0;
                const catColor = CategoryColors[item.name]?.color ?? Colors.textSecondary;
                return (
                  <View key={item.name} style={[styles.categoryRow, idx < categoryData.length - 1 && styles.categoryRowBorder]}>
                    <View style={[styles.catDot, { backgroundColor: catColor }]} />
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Text style={styles.categoryCount}>{item.done}/{item.total}개</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: catColor }]} />
                    </View>
                    <Text style={styles.categoryPercent}>{percent}%</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 999 },
  tabItemActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  encourageWrap: { paddingHorizontal: Spacing.screenHorizontal, marginBottom: 20, gap: 4 },
  encourageTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  encourageSub: { fontSize: 14, color: Colors.textSecondary },
  donutCard: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    gap: 24,
  },
  donutOuter: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 14, borderColor: Colors.blue,
    alignItems: 'center', justifyContent: 'center',
  },
  donutInner: { alignItems: 'center', gap: 4 },
  donutPercent: { fontSize: 32, fontWeight: '700', color: Colors.primary },
  donutCaption: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  legendWrap: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Spacing.cardRadius,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  legendItem: { flex: 1, alignItems: 'center', gap: 6 },
  legendDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: Colors.textSecondary },
  legendValue: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenHorizontal,
    gap: Spacing.itemGap,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
  },
  statLabel: { fontSize: 12, color: Colors.textTertiary, fontWeight: '500' },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  statSub: { fontSize: 11, color: Colors.textSecondary },
  section: { marginHorizontal: Spacing.screenHorizontal, marginBottom: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sectionBadge: { fontSize: 12, color: Colors.textSecondary },
  barChartWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    paddingBottom: 12,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { height: BAR_MAX_HEIGHT, justifyContent: 'flex-end', alignItems: 'center', width: '100%' },
  bar: { width: '60%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 12, color: Colors.textSecondary },
  barLabelHighlight: { color: Colors.blue, fontWeight: '700' },
  barValue: { fontSize: 10, color: Colors.textTertiary },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  categoryRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: { fontSize: 13, color: Colors.textPrimary, width: 56 },
  categoryCount: { fontSize: 12, color: Colors.textSecondary, width: 36 },
  progressTrack: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  categoryPercent: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, width: 32, textAlign: 'right' },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: Colors.textTertiary, textAlign: 'center' },
});
