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
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { CategoryColors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_WIDTH = (SCREEN_WIDTH - Spacing.screenHorizontal * 2) / 7;
const CELL_HEIGHT = 44;

type MockTodoItem = {
  time: string;
  title: string;
  category: string;
  done: boolean;
};

const MOCK_DATE_TODOS: Record<string, MockTodoItem[]> = {
  '2026-09-11': [
    { time: '09:00', title: '영어 단어장 복습', category: '학습', done: false },
  ],
  '2026-09-14': [
    { time: '10:00', title: '자료구조 과제 제출', category: '과제', done: true },
    { time: '14:00', title: '팀 회의 준비', category: '업무', done: false },
    { time: '17:00', title: '헬스장 가기', category: '개인 루틴', done: false },
  ],
  '2026-09-20': [
    { time: '11:00', title: 'React Native 강의', category: '학습', done: false },
  ],
  '2026-09-26': [
    { time: '09:00', title: '주간 리뷰', category: '업무', done: false },
    { time: '14:00', title: '알고리즘 문제', category: '학습', done: true },
  ],
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function padDate(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function todayString(): string {
  const now = new Date();
  return padDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function formatSelectedDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = DAY_LABELS[date.getDay()];
  return `${m}월 ${d}일 (${dayOfWeek})`;
}

export default function CalendarScreen() {
  const today = todayString();
  const todayParts = today.split('-').map(Number);
  const [currentYear, setCurrentYear] = useState(todayParts[0]);
  const [currentMonth, setCurrentMonth] = useState(todayParts[1]);
  const [selectedDate, setSelectedDate] = useState(today);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleTodayPress = () => {
    const t = todayString();
    const [y, m] = t.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m);
    setSelectedDate(t);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedTodos = MOCK_DATE_TODOS[selectedDate] ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>캘린더</Text>
        </View>
        <TouchableOpacity style={styles.headerRight} onPress={handleTodayPress}>
          <Text style={styles.todayBtn}>오늘</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 월 네비게이션 */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{currentYear}년 {currentMonth}월</Text>
          <TouchableOpacity onPress={handleNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View style={styles.dayRow}>
          {DAY_LABELS.map((d, i) => (
            <View key={d} style={styles.dayCell}>
              <Text style={[
                styles.dayLabel,
                i === 0 && styles.dayLabelSun,
                i === 6 && styles.dayLabelSat,
              ]}>
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* 달력 그리드 */}
        <View style={styles.grid}>
          {cells.map((day, idx) => {
            if (day === null) {
              return <View key={`empty-${idx}`} style={styles.cell} />;
            }
            const dateStr = padDate(currentYear, currentMonth, day);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const hasTodos = Boolean(MOCK_DATE_TODOS[dateStr]);
            const colIndex = idx % 7;

            return (
              <TouchableOpacity
                key={dateStr}
                style={styles.cell}
                onPress={() => setSelectedDate(dateStr)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.dayCircle,
                  isSelected && styles.dayCircleSelected,
                  !isSelected && isToday && styles.dayCircleToday,
                ]}>
                  <Text style={[
                    styles.dayNum,
                    isSelected && styles.dayNumSelected,
                    !isSelected && colIndex === 0 && styles.dayNumSun,
                    !isSelected && colIndex === 6 && styles.dayNumSat,
                  ]}>
                    {day}
                  </Text>
                </View>
                {hasTodos && !isSelected && (
                  <View style={styles.dot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 선택된 날짜 섹션 */}
        <View style={styles.selectedSection}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedDateText}>{formatSelectedDate(selectedDate)}</Text>
            <Text style={styles.selectedCount}>{selectedTodos.length}개의 할 일</Text>
          </View>

          {selectedTodos.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>이날의 할 일이 없어요</Text>
            </View>
          ) : (
            <View style={styles.todoListCard}>
              {selectedTodos.map((item, idx) => {
                const catColor = CategoryColors[item.category] ?? CategoryColors['기타'];
                return (
                  <View
                    key={`${item.time}-${idx}`}
                    style={[styles.todoRow, idx < selectedTodos.length - 1 && styles.todoRowBorder]}
                  >
                    <Text style={styles.todoTime}>{item.time}</Text>
                    <View style={[styles.checkCircle, item.done && styles.checkCircleDone]}>
                      {item.done && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={[styles.todoTitle, item.done && styles.todoTitleDone]}>
                      {item.title}
                    </Text>
                    <View style={[styles.catDot, { backgroundColor: catColor.color }]} />
                    <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="ellipsis-vertical" size={16} color={Colors.textTertiary} />
                    </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  headerRight: { position: 'absolute', right: Spacing.screenHorizontal },
  todayBtn: { fontSize: 14, fontWeight: '600', color: Colors.blue },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  monthLabel: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, minWidth: 100, textAlign: 'center' },
  dayRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 4,
  },
  dayCell: { width: CELL_WIDTH, alignItems: 'center' },
  dayLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  dayLabelSun: { color: Colors.red },
  dayLabelSat: { color: Colors.blue },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.screenHorizontal,
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: { backgroundColor: Colors.primary },
  dayCircleToday: { borderWidth: 2, borderColor: Colors.blue },
  dayNum: { fontSize: 14, color: Colors.textPrimary },
  dayNumSelected: { color: '#FFFFFF', fontWeight: '700' },
  dayNumSun: { color: Colors.red },
  dayNumSat: { color: Colors.blue },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  selectedSection: {
    marginTop: 16,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  selectedCount: { fontSize: 13, color: Colors.textSecondary },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: Colors.textTertiary },
  todoListCard: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  todoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  todoTime: { fontSize: 12, color: Colors.textTertiary, width: 40 },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: Colors.green, borderColor: Colors.green },
  todoTitle: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  todoTitleDone: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  catDot: { width: 8, height: 8, borderRadius: 4 },
});
