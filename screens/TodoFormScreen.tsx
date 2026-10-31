import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Category, TodoSchedule } from '../types';
import ScheduleEditor from '../components/ScheduleEditor';
import { todayString } from '../utils/date';
import { expandSchedule, normalizeTime } from '../utils/schedule';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import CategoryChip from '../components/CategoryChip';
import PrimaryButton from '../components/PrimaryButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoForm'>;

export default function TodoFormScreen({ route, navigation }: Props) {
  const { todo } = route.params ?? {};
  const isEdit = !!todo;
  const { addTodo, editTodo, deleteSchedule, categories, addCategory, deleteCategory } = useTodosContext();

  const [schedule, setSchedule] = useState<TodoSchedule>(todo?.schedule ?? {
    mode: 'dates', slots: [{ date: todo?.date ?? todayString(), time: todo?.time ? normalizeTime(todo.time) : undefined }],
  });
  const [scheduleError, setScheduleError] = useState('');

  const [title, setTitle] = useState(todo?.title ?? '');
  const initialCategory = todo?.category ?? '과제';
  const [category, setCategory] = useState<Category>(categories.includes(initialCategory) ? initialCategory : '기타');
  const [memo, setMemo] = useState(todo?.memo ?? '');
  const [titleError, setTitleError] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const confirmCategoryDelete = () => {
    if (categoryToDelete === null) return;
    deleteCategory(categoryToDelete);
    if (category === categoryToDelete) setCategory('기타');
    setCategoryToDelete(null);
  };

  const closeCategoryInput = () => {
    setAddingCategory(false);
    setCategoryName('');
    setCategoryError('');
  };

  const handleAddCategory = () => {
    try {
      setCategory(addCategory(categoryName));
      closeCategoryInput();
    } catch (error) {
      setCategoryError((error as Error).message);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    try { expandSchedule(schedule); }
    catch (error) { setScheduleError((error as Error).message); return; }
    const params = {
      title,
      category,
      memo: memo.trim() || undefined,
      schedule,
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
    if (todo) deleteSchedule(todo.id);
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
        <TouchableOpacity onPress={() => navigation.navigate('OcrIntro')}>
          <View style={styles.scanBtn}>
            <Ionicons name="scan-outline" size={16} color={Colors.primary} />
            <Text style={styles.scanBtnText}>AI 스캔</Text>
          </View>
        </TouchableOpacity>
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
          {/* AI 스캔 배너 (추가 모드에서만) */}
          {!isEdit && (
            <TouchableOpacity style={styles.scanBanner} onPress={() => navigation.navigate('OcrIntro')} activeOpacity={0.8}>
              <View style={styles.scanBannerLeft}>
                <Ionicons name="scan-outline" size={22} color={Colors.primary} />
                <View style={styles.scanBannerText}>
                  <Text style={styles.scanBannerTitle}>AI 메모 스캔으로 추가</Text>
                  <Text style={styles.scanBannerSub}>손글씨·이미지를 자동으로 할 일로 변환해요</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}

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

          <ScheduleEditor value={schedule} onChange={next => { setSchedule(next); setScheduleError(''); }} />
          {!!scheduleError && <Text accessibilityRole="alert" style={styles.errorText}>{scheduleError}</Text>}
          {todo?.scheduleId && <Text style={styles.counter}>저장하면 묶인 일정 전체에 변경사항이 적용돼요.</Text>}

          <View style={styles.field}>
            <Text style={styles.label}>카테고리</Text>
            <View style={styles.chipRow}>
              {categories.map(cat => (
                <CategoryChip
                  key={cat}
                  label={cat}
                  selected={category === cat}
                  onPress={() => setCategory(cat)}
                  onLongPress={cat === '기타' ? undefined : () => setCategoryToDelete(cat)}
                />
              ))}
              <TouchableOpacity
                style={styles.addCategoryChip}
                accessibilityRole="button"
                accessibilityLabel="카테고리 추가"
                accessibilityState={{ expanded: addingCategory }}
                onPress={() => setAddingCategory(true)}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.counter}>길게 눌러 삭제할 수 있어요. 기본 카테고리 ‘기타’는 유지돼요.</Text>
            {addingCategory && (
              <View style={styles.categoryEditor}>
                <TextInput
                  style={[styles.input, categoryError && styles.inputError]}
                  accessibilityLabel="새 카테고리 이름"
                  value={categoryName}
                  onChangeText={value => { setCategoryName(value); setCategoryError(''); }}
                  placeholder="새 카테고리 이름"
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleAddCategory}
                />
                {!!categoryError && <Text accessibilityRole="alert" style={styles.errorText}>{categoryError}</Text>}
                <View style={styles.chipRow}>
                  <TouchableOpacity style={styles.categoryAction} accessibilityRole="button" onPress={handleAddCategory}>
                    <Text style={styles.categoryActionText}>추가</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.categoryAction} accessibilityRole="button" onPress={closeCategoryInput}>
                    <Text style={styles.selectText}>취소</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
              <Text style={styles.deleteBtnText}>{todo?.scheduleId ? '묶인 일정 전체 삭제' : '할 일 삭제'}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={confirmVisible}
        description={todo?.scheduleId ? '묶인 일정이 모두 삭제돼요. 삭제한 일정은 복구할 수 없어요.' : undefined}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmDelete}
      />
      <ConfirmDialog
        visible={categoryToDelete !== null}
        title={`“${categoryToDelete ?? ''}”을 삭제하시겠습니까?`}
        description="카테고리만 삭제하고, 기존 할 일은 ‘기타’로 옮겨요."
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={confirmCategoryDelete}
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
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: Spacing.screenHorizontal,
    gap: 20,
    paddingBottom: 40,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.cardRadius,
    padding: 14,
  },
  scanBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  scanBannerText: { gap: 2, flex: 1 },
  scanBannerTitle: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  scanBannerSub: { fontSize: 12, color: Colors.textSecondary },
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
  addCategoryChip: {
    minWidth: 44, minHeight: 44,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: Spacing.chipRadius,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  categoryEditor: { gap: 8 },
  categoryAction: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' },
  categoryActionText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
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
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  scanBtnText: { fontSize: 13, fontWeight: '500', color: Colors.primary },
});
