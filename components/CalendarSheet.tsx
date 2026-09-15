import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Todo } from '../types';

interface CalendarSheetProps {
  visible: boolean;
  onClose: () => void;
  todos: Todo[];
}

interface CalendarDay {
  date: number;
  month: 'prev' | 'current' | 'next';
  fullDate: string; // 'YYYY-MM-DD'
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const MONTH_LABELS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function timestampToDateString(ts: number): string {
  const d = new Date(ts);
  return toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// Always returns exactly 42 cells (6 rows × 7 cols)
function buildCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const days: CalendarDay[] = [];

  // Leading: last few days of previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    days.push({ date: d, month: 'prev', fullDate: toDateString(prevYear, prevMonth, d) });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: d, month: 'current', fullDate: toDateString(year, month, d) });
  }

  // Trailing: first few days of next month (fill to exactly 42)
  let nextDay = 1;
  while (days.length < 42) {
    days.push({ date: nextDay, month: 'next', fullDate: toDateString(nextYear, nextMonth, nextDay) });
    nextDay++;
  }

  return days;
}

function todayDateString(): string {
  const now = new Date();
  return toDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export default function CalendarSheet({ visible, onClose, todos }: CalendarSheetProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(600)).current;

  const todayStr = todayDateString();

  const todoDateSet = new Set<string>(
    todos.map(t => timestampToDateString(t.createdAt))
  );

  // Open: overlay fades in first, then sheet slides up
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth() + 1);
      setSelectedDate(null);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(600);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  // Close: sheet slides down first, then overlay fades out
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onClose());
  }, [onClose, overlayOpacity, sheetTranslateY]);

  const days = buildCalendarDays(viewYear, viewMonth);

  const goToPrevMonth = useCallback(() => {
    setSelectedDate(null);
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else { setViewMonth(m => m - 1); }
  }, [viewMonth]);

  const goToNextMonth = useCallback(() => {
    setSelectedDate(null);
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else { setViewMonth(m => m + 1); }
  }, [viewMonth]);

  const handleDayPress = useCallback((day: CalendarDay) => {
    if (day.month !== 'current') return;
    setSelectedDate(prev => (prev === day.fullDate ? null : day.fullDate));
  }, []);

  const selectedTodos = selectedDate
    ? todos.filter(t => timestampToDateString(t.createdAt) === selectedDate)
    : [];

  const selectedLabel = selectedDate
    ? (() => {
        const [, mm, dd] = selectedDate.split('-');
        return `${parseInt(mm, 10)}월 ${parseInt(dd, 10)}일 할 일`;
      })()
    : null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Overlay: appears first */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet: slides up after overlay */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <View style={styles.handle} />

        {/* Month navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={goToPrevMonth} activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{viewYear}년 {MONTH_LABELS[viewMonth - 1]}</Text>
          <TouchableOpacity onPress={goToNextMonth} activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekRow}>
          {WEEKDAY_LABELS.map((label, idx) => (
            <Text key={label} style={[
              styles.weekLabel,
              idx === 0 && styles.weekLabelSun,
              idx === 6 && styles.weekLabelSat,
            ]}>
              {label}
            </Text>
          ))}
        </View>

        {/* Day grid: always 42 cells (6 rows fixed) */}
        <View style={styles.grid}>
          {days.map((day, idx) => {
            const isToday = day.fullDate === todayStr;
            const isSelected = day.month === 'current' && day.fullDate === selectedDate;
            const isOtherMonth = day.month !== 'current';
            const isSunCol = idx % 7 === 0;
            const isSatCol = idx % 7 === 6;

            return (
              <TouchableOpacity
                key={idx}
                style={styles.dayCell}
                onPress={() => handleDayPress(day)}
                activeOpacity={isOtherMonth ? 1 : 0.7}
                disabled={isOtherMonth}
              >
                <View style={[
                  styles.dayCircle,
                  isSelected && styles.dayCircleSelected,
                  !isSelected && isToday && styles.dayCircleToday,
                ]}>
                  <Text style={[
                    styles.dayText,
                    isOtherMonth && styles.dayTextOther,
                    !isOtherMonth && isSelected && styles.dayTextSelected,
                    !isOtherMonth && !isSelected && isToday && styles.dayTextToday,
                    !isOtherMonth && !isSelected && isSunCol && styles.dayTextSun,
                    !isOtherMonth && !isSelected && isSatCol && styles.dayTextSat,
                  ]}>
                    {day.date}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected date todo list */}
        {selectedDate && (
          <>
            <View style={styles.divider} />
            <Text style={styles.selectedHeader}>{selectedLabel}</Text>
            {selectedTodos.length === 0 ? (
              <Text style={styles.emptyText}>이 날은 할 일이 없어요</Text>
            ) : (
              <ScrollView style={styles.todoList} showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {selectedTodos.map(todo => (
                  <View key={todo.id} style={styles.todoRow}>
                    <View style={[styles.todoCheckbox, todo.done && styles.todoCheckboxDone]}>
                      {todo.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                    <Text style={[styles.todoText, todo.done && styles.todoTextDone]}
                      numberOfLines={2}>
                      {todo.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.8}>
          <Text style={styles.closeBtnText}>닫기</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    paddingVertical: 4,
  },
  weekLabelSun: { color: '#EF4444' },
  weekLabelSat: { color: '#3B82F6' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
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
  dayCircleSelected: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
  },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textPrimary,
  },
  dayTextOther: {
    color: Colors.textDisabled,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  dayTextSun: { color: '#EF4444' },
  dayTextSat: { color: '#3B82F6' },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  selectedHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  todoList: {
    maxHeight: 200,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  todoCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  todoCheckboxDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  todoText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  todoTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textDisabled,
  },
  closeBtn: {
    height: Spacing.buttonHeight,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
