import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Category } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import CategoryChip from '../components/CategoryChip';
import PrimaryButton from '../components/PrimaryButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { RootStackParamList } from '../navigation/RootNavigator';

const CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

type Props = NativeStackScreenProps<RootStackParamList, 'TodoForm'>;

export default function TodoFormScreen({ route, navigation }: Props) {
  const { todo } = route.params ?? {};
  const isEdit = !!todo;
  const { addTodo, editTodo, deleteTodo } = useTodosContext();

  const [title, setTitle] = useState(todo?.title ?? '');
  const [category, setCategory] = useState<Category>(todo?.category ?? '과제');
  const [date, setDate] = useState<Date | null>(todo?.date ? new Date(todo.date) : new Date());
  const [time, setTime] = useState<Date | null>(
    todo?.time ? parseTime(todo.time) : null
  );
  const [memo, setMemo] = useState(todo?.memo ?? '');
  const [titleError, setTitleError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  function parseTime(str: string): Date {
    const d = new Date();
    const match = str.match(/(\d+):(\d+)/);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      if (str.includes('오후') && h < 12) h += 12;
      d.setHours(h, m, 0, 0);
    }
    return d;
  }

  function formatDate(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${year}년 ${month}월 ${day}일 (${days[d.getDay()]})`;
  }

  function formatTime(d: Date) {
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h < 12 ? '오전' : '오후';
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${ampm} ${hh}:${String(m).padStart(2, '0')}`;
  }

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const params = {
      title,
      category,
      date: date ? date.toISOString().split('T')[0] : undefined,
      time: time ? formatTime(time) : undefined,
      memo: memo.trim() || undefined,
    };
    if (isEdit && todo) {
      editTodo(todo.id, params);
    } else {
      addTodo(params);
    }
    navigation.goBack();
  };

  const handleDelete = () => {
    setConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (todo) deleteTodo(todo.id);
    setConfirmVisible(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? '할 일 수정' : '할 일 추가'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 제목 */}
          <View style={styles.field}>
            <Text style={styles.label}>
              할 일 제목 <Text style={{ color: Colors.red }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, titleError && styles.inputError]}
              value={title}
              onChangeText={v => { setTitle(v); if (v.trim()) setTitleError(false); }}
              placeholder="할 일을 입력해 주세요."
              placeholderTextColor={Colors.textTertiary}
              returnKeyType="next"
              maxLength={100}
            />
            {titleError && (
              <View style={styles.errorRow}>
                <Ionicons name="close-circle" size={14} color={Colors.red} />
                <Text style={styles.errorText}>할 일을 입력해 주세요.</Text>
              </View>
            )}
          </View>

          {/* 날짜 */}
          <View style={styles.field}>
            <Text style={styles.label}>날짜</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.selectText}>{date ? formatDate(date) : '날짜를 선택하세요'}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }}
            />
          )}

          {/* 시간 */}
          <View style={styles.field}>
            <Text style={styles.label}>시간</Text>
            <TouchableOpacity style={styles.selectField} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={[styles.selectText, !time && styles.placeholder]}>
                {time ? formatTime(time) : '시간을 선택하세요 (선택)'}
              </Text>
              {time && (
                <TouchableOpacity onPress={() => setTime(null)}>
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
          {showTimePicker && (
            <DateTimePicker
              value={time ?? new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => { setShowTimePicker(false); if (d) setTime(d); }}
            />
          )}

          {/* 카테고리 */}
          <View style={styles.field}>
            <Text style={styles.label}>카테고리</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map(cat => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  selected={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </View>
          </View>

          {/* 메모 */}
          <View style={styles.field}>
            <Text style={styles.label}>메모 (선택)</Text>
            <TextInput
              style={[styles.input, styles.memoInput]}
              value={memo}
              onChangeText={setMemo}
              placeholder="세부 내용을 입력해 주세요."
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.counter}>{memo.length}/500</Text>
          </View>

          {/* 버튼 */}
          <PrimaryButton
            label={isEdit ? '변경사항 저장' : '할 일 추가'}
            onPress={handleSave}
          />
          {isEdit && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={16} color={Colors.red} />
              <Text style={styles.deleteBtnText}>할 일 삭제</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmDelete}
      />
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
  scroll: { flex: 1 },
  content: {
    padding: Spacing.screenHorizontal,
    gap: 20,
    paddingBottom: 40,
  },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: { borderColor: Colors.red },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { fontSize: 13, color: Colors.red },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 8,
  },
  selectText: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  placeholder: { color: Colors.textTertiary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memoInput: { height: 120, paddingTop: 12 },
  counter: { fontSize: 12, color: Colors.textTertiary, textAlign: 'right' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: Spacing.buttonRadius,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: Colors.red },
});
