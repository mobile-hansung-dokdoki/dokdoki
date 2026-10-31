import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TodoSchedule, ScheduleSlot } from '../types';
import { addDays, fromDateString, toDateString, todayString } from '../utils/date';
import { Colors } from '../theme/colors';
import { expandSchedule } from '../utils/schedule';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function DateTimeField({ label, value, mode, onChange }: {
  label: string; value: string; mode: 'date' | 'time'; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const parsed = mode === 'date' ? fromDateString(value || todayString()) : new Date(`2000-01-01T${value || '09:00'}:00`);
  return <View style={styles.field}>
    <Text style={styles.caption}>{label}</Text>
    {Platform.OS === 'web' ? React.createElement('input', {
      type: mode, value, 'aria-label': label,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => { if (event.target.value) onChange(event.target.value); },
      style: { boxSizing: 'border-box', width: '100%', minWidth: 0, minHeight: 46, padding: 10, borderRadius: 10, border: `1px solid ${Colors.border}`, background: Colors.surface, color: Colors.textPrimary, fontSize: 15 },
    }) : <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} style={styles.control} onPress={() => setOpen(true)}>
      <Text style={styles.value}>{value || '선택 안 함'}</Text>
    </TouchableOpacity>}
    {open && <DateTimePicker value={parsed} mode={mode} is24Hour
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={(event, date) => {
        setOpen(false);
        if (event.type === 'set' && date) onChange(mode === 'date' ? toDateString(date) : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
      }} />}
  </View>;
}

export default function ScheduleEditor({ value, onChange }: { value: TodoSchedule; onChange: (value: TodoSchedule) => void }) {
  const [dates, setDates] = useState<ScheduleSlot[]>(value.mode === 'dates' ? value.slots : [{ date: value.start, time: value.times[0] }]);
  const [weekly, setWeekly] = useState<Extract<TodoSchedule, { mode: 'weekly' }>>(value.mode === 'weekly' ? value : {
    mode: 'weekly', start: value.slots[0]?.date ?? todayString(),
    end: addDays(value.slots[0]?.date ?? todayString(), 90),
    weekdays: [fromDateString(value.slots[0]?.date ?? todayString()).getDay()], times: [value.slots[0]?.time ?? '09:00'],
  });
  const updateDates = (slots: ScheduleSlot[]) => { setDates(slots); onChange({ mode: 'dates', slots }); };
  const updateWeekly = (patch: Partial<typeof weekly>) => { const next = { ...weekly, ...patch }; setWeekly(next); onChange(next); };
  let count = 0;
  try { count = expandSchedule(value).length; } catch { /* The form shows validation on save. */ }
  return <View style={styles.section}>
    <Text style={styles.label}>일정 설정</Text>
    <View style={styles.tabs}>
      {(['dates', 'weekly'] as const).map(mode => <TouchableOpacity key={mode}
        accessibilityRole="button" accessibilityState={{ selected: value.mode === mode }}
        style={[styles.tab, value.mode === mode && styles.active]}
        onPress={() => onChange(mode === 'dates' ? { mode, slots: dates } : weekly)}>
        <Text style={[styles.tabText, value.mode === mode && styles.activeText]}>{mode === 'dates' ? '날짜별 지정' : '매주 반복'}</Text>
      </TouchableOpacity>)}
    </View>
    {value.mode === 'dates' ? <>
      <Text style={styles.help}>같은 할 일을 여러 날짜와 시간에 추가할 수 있어요.</Text>
      {dates.map((slot, index) => <View key={index} style={styles.card}>
        <View style={styles.heading}><Text style={styles.label}>일정 {index + 1}</Text>
          {dates.length > 1 && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`일정 ${index + 1} 삭제`} style={styles.remove} onPress={() => updateDates(dates.filter((_, i) => i !== index))}><Text style={styles.removeText}>삭제</Text></TouchableOpacity>}
        </View>
        <DateTimeField label={`일정 ${index + 1} 날짜`} mode="date" value={slot.date} onChange={date => updateDates(dates.map((s, i) => i === index ? { ...s, date } : s))} />
        <DateTimeField label={`일정 ${index + 1} 시간 (선택)`} mode="time" value={slot.time ?? ''} onChange={time => updateDates(dates.map((s, i) => i === index ? { ...s, time } : s))} />
        {slot.time && <TouchableOpacity style={styles.remove} onPress={() => updateDates(dates.map((s, i) => i === index ? { date: s.date } : s))}><Text style={styles.help}>시간 지정 해제</Text></TouchableOpacity>}
      </View>)}
      <TouchableOpacity style={styles.add} onPress={() => updateDates([...dates, { date: addDays(dates[dates.length - 1].date, 1), time: dates[dates.length - 1].time }])}><Text style={styles.addText}>+ 다른 날짜·시간 추가</Text></TouchableOpacity>
    </> : <>
      <Text style={styles.help}>선택한 기간 동안 매주 반복해요. 기간은 최대 1년이에요.</Text>
      <View style={styles.card}>
        <DateTimeField label="반복 시작일" mode="date" value={weekly.start} onChange={start => updateWeekly({ start })} />
        <DateTimeField label="반복 종료일" mode="date" value={weekly.end} onChange={end => updateWeekly({ end })} />
        <Text style={styles.caption}>반복 요일 (여러 개 선택)</Text>
        <View style={styles.days}>{[1, 2, 3, 4, 5, 6, 0].map(day => <TouchableOpacity key={day}
          accessibilityRole="checkbox" accessibilityLabel={`${DAYS[day]}요일`} accessibilityState={{ checked: weekly.weekdays.includes(day) }}
          style={[styles.day, weekly.weekdays.includes(day) && styles.active]}
          onPress={() => updateWeekly({ weekdays: weekly.weekdays.includes(day) ? weekly.weekdays.filter(d => d !== day) : [...weekly.weekdays, day] })}>
          <Text style={[styles.tabText, weekly.weekdays.includes(day) && styles.activeText]}>{DAYS[day]}</Text>
        </TouchableOpacity>)}</View>
        <Text style={styles.help}>선택한 모든 요일에 아래 시간들이 적용돼요.</Text>
        {weekly.times.map((time, index) => <View key={index} style={styles.timeRow}>
          <DateTimeField label={`반복 시간 ${index + 1}`} mode="time" value={time} onChange={next => updateWeekly({ times: weekly.times.map((t, i) => i === index ? next : t) })} />
          <TouchableOpacity accessibilityLabel={`반복 시간 ${index + 1} 삭제`} style={styles.remove} onPress={() => updateWeekly({ times: weekly.times.filter((_, i) => i !== index) })}><Text style={styles.removeText}>삭제</Text></TouchableOpacity>
        </View>)}
        <TouchableOpacity style={styles.add} onPress={() => updateWeekly({ times: [...weekly.times, '09:00'] })}><Text style={styles.addText}>+ 반복 시간 추가</Text></TouchableOpacity>
      </View>
    </>}
    {count > 0 && <Text style={styles.help}>총 {count}개의 일정이 저장돼요. 같은 날짜·시간의 중복은 하나로 합쳐요.</Text>}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: 12 }, label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  tabs: { flexDirection: 'row', gap: 8 }, tab: { flex: 1, padding: 13, alignItems: 'center', borderRadius: 10, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  active: { backgroundColor: Colors.primary, borderColor: Colors.primary }, activeText: { color: '#FFFFFF' }, tabText: { color: Colors.textSecondary, fontWeight: '600' },
  help: { fontSize: 12, lineHeight: 19, color: Colors.textSecondary }, caption: { fontSize: 13, color: Colors.textSecondary },
  card: { padding: 14, gap: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, field: { flex: 1, gap: 6, minWidth: 0 },
  control: { padding: 12, minHeight: 46, borderWidth: 1, borderColor: Colors.border, borderRadius: 10 }, value: { color: Colors.textPrimary, fontSize: 15 },
  days: { flexDirection: 'row', gap: 5 }, day: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  remove: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }, removeText: { color: Colors.red, fontSize: 13 },
  add: { minHeight: 46, padding: 12, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: Colors.border }, addText: { color: Colors.primary, fontWeight: '600' },
});
