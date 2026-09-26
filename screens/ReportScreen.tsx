import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PeriodTab = '주간' | '월간' | '전체';

const PERIOD_TABS: PeriodTab[] = ['주간', '월간', '전체'];

const DAY_DATA: { label: string; value: number }[] = [
  { label: '월', value: 1 },
  { label: '화', value: 3 },
  { label: '수', value: 2 },
  { label: '목', value: 4 },
  { label: '금', value: 3 },
  { label: '토', value: 1 },
  { label: '일', value: 2 },
];

const MAX_DAY_VALUE = Math.max(...DAY_DATA.map(d => d.value));
const BAR_MAX_HEIGHT = 80;

type CategoryData = {
  name: string;
  done: number;
  total: number;
};

const CATEGORY_DATA: CategoryData[] = [
  { name: '과제', done: 3, total: 5 },
  { name: '업무', done: 2, total: 4 },
  { name: '개인 루틴', done: 4, total: 6 },
  { name: '학습', done: 1, total: 3 },
];

export default function ReportScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<PeriodTab>('주간');

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 생산성 리포트</Text>
        <View style={{ width: 22 }} />
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
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 격려 문구 */}
        <View style={styles.encourageWrap}>
          <Text style={styles.encourageTitle}>이번 주도 잘하고 있어요!</Text>
          <Text style={styles.encourageSub}>꾸준히 이어가는 모습이 멋져요. ✨</Text>
        </View>

        {/* 달성률 도넛 카드 */}
        <View style={styles.donutCard}>
          <View style={styles.donutRow}>
            {/* 도넛 원 */}
            <View style={styles.donutOuter}>
              <View style={styles.donutInner}>
                <Text style={styles.donutPercent}>72%</Text>
                <Text style={styles.donutCaption}>이번 주 달성률</Text>
              </View>
            </View>

            {/* 범례 */}
            <View style={styles.legendWrap}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
                <Text style={styles.legendText}>완료 건수 18건</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Colors.blue }]} />
                <Text style={styles.legendText}>진행 중 7건</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 통계 카드 2개 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>연속 달성</Text>
            <Text style={styles.statValue}>12일 연속</Text>
            <Text style={styles.statSub}>지금도 꾸준히 하고 있어요!</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>이번 주 목표</Text>
            <Text style={styles.statValue}>18/25개</Text>
            <Text style={styles.statSub}>목표까지 7개 남았어요!</Text>
          </View>
        </View>

        {/* 요일별 완료 추이 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>요일별 완료 추이</Text>
            <Text style={styles.sectionBadge}>총 완료 36건</Text>
          </View>

          <View style={styles.barChartWrap}>
            {DAY_DATA.map((item, idx) => {
              const barHeight = Math.max(4, (item.value / MAX_DAY_VALUE) * BAR_MAX_HEIGHT);
              const isHighlight = item.label === '목';
              return (
                <View key={item.label} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        { height: barHeight, backgroundColor: isHighlight ? Colors.blue : '#CBD5E1' },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isHighlight && styles.barLabelHighlight]}>
                    {item.label}
                  </Text>
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

          <View style={styles.categoryCard}>
            {CATEGORY_DATA.map((item, idx) => {
              const percent = Math.round((item.done / item.total) * 100);
              const barWidth = (SCREEN_WIDTH - Spacing.screenHorizontal * 2 - 32 - 80) * (percent / 100);
              const totalBarWidth = SCREEN_WIDTH - Spacing.screenHorizontal * 2 - 32 - 80;
              return (
                <View
                  key={item.name}
                  style={[
                    styles.categoryRow,
                    idx < CATEGORY_DATA.length - 1 && styles.categoryRowBorder,
                  ]}
                >
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryCount}>{item.done}/{item.total}개</Text>
                  <View style={[styles.progressTrack, { width: totalBarWidth }]}>
                    <View style={[styles.progressFill, { width: barWidth }]} />
                  </View>
                  <Text style={styles.categoryPercent}>{percent}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.buttonRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  encourageWrap: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 20,
    gap: 4,
  },
  encourageTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  encourageSub: { fontSize: 14, color: Colors.textSecondary },
  donutCard: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 16,
  },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  donutOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: { alignItems: 'center', gap: 4 },
  donutPercent: { fontSize: 28, fontWeight: '700', color: Colors.primary },
  donutCaption: { fontSize: 12, color: Colors.textSecondary },
  legendWrap: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: Colors.textSecondary },
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
  section: {
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 16,
  },
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
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: { fontSize: 12, color: Colors.textSecondary },
  barLabelHighlight: { color: Colors.blue, fontWeight: '700' },
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
  categoryName: { fontSize: 13, color: Colors.textPrimary, width: 60 },
  categoryCount: { fontSize: 12, color: Colors.textSecondary, width: 36 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    flex: 1,
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.blue,
    borderRadius: 4,
  },
  categoryPercent: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, width: 32, textAlign: 'right' },
});
