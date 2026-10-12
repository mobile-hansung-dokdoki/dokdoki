import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Category } from '../types';
import { Colors, CategoryColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/RootNavigator';

type OcrResultNavProp = NativeStackNavigationProp<RootStackParamList>;

type OcrItem = {
  id: string;
  text: string;
  category: Category;
  checked: boolean;
};

const CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

const MOCK_OCR_ITEMS: OcrItem[] = [
  { id: '1', text: '과제 제출하기',       category: '과제',    checked: true },
  { id: '2', text: '우유 사기',           category: '개인 루틴', checked: true },
  { id: '3', text: '교수님께 메일 보내기', category: '업무',    checked: true },
];

export default function OcrResultScreen() {
  const navigation = useNavigation<OcrResultNavProp>();
  const { addTodo } = useTodosContext();
  const [items, setItems] = useState<OcrItem[]>(MOCK_OCR_ITEMS);
  const [categoryPickerFor, setCategoryPickerFor] = useState<string | null>(null);

  const checkedCount = items.filter(i => i.checked).length;

  const toggleCheck = (id: string) => {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const updateText = (id: string, text: string) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, text } : i)));
  };

  const updateCategory = (id: string, category: Category) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, category } : i)));
    setCategoryPickerFor(null);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const addItem = () => {
    const newId = `${Date.now()}`;
    setItems(prev => [
      ...prev,
      { id: newId, text: '', category: '기타', checked: true },
    ]);
  };

  const handleSave = () => {
    const toSave = items.filter(i => i.checked && i.text.trim());
    if (toSave.length === 0) {
      Alert.alert('저장 실패', '저장할 항목을 선택하거나 내용을 입력해 주세요.');
      return;
    }
    toSave.forEach(item => addTodo({ title: item.text.trim(), category: item.category }));
    Alert.alert('저장 완료', `${toSave.length}개의 할 일을 추가했어요.`, [
      { text: '확인', onPress: () => navigation.navigate('Tabs') },
    ]);
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
        <Text style={styles.headerTitle}>인식 결과 편집</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* 인식 정보 카드 */}
        <View style={styles.ocrInfoCard}>
          <View style={styles.ocrInfoHeader}>
            <View style={styles.ocrBadge}>
              <Text style={styles.ocrBadgeText}>ON-DEVICE OCR</Text>
            </View>
            <Text style={styles.ocrStatus}>오프라인에서도 인식 중</Text>
          </View>
          <View style={styles.ocrProgressRow}>
            <Text style={styles.ocrProgressText}>기기에서 글자를 읽고 있어요.</Text>
            <Text style={styles.ocrTime}>1.8초</Text>
          </View>
          {/* 진행바 (완료) */}
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>

        {/* 인식된 항목 */}
        <Text style={styles.sectionLabel}>인식된 항목 선택</Text>

        <View style={styles.itemList}>
          {items.map(item => {
            const catColor = CategoryColors[item.category];
            return (
              <View key={item.id} style={styles.itemRow}>
                {/* 체크박스 */}
                <TouchableOpacity
                  onPress={() => toggleCheck(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View style={[styles.checkbox, item.checked && styles.checkboxDone]}>
                    {item.checked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>

                {/* 텍스트 */}
                <TextInput
                  style={styles.itemInput}
                  value={item.text}
                  onChangeText={text => updateText(item.id, text)}
                  placeholder="할 일 입력"
                  placeholderTextColor={Colors.textTertiary}
                />

                {/* 카테고리 칩 */}
                <TouchableOpacity
                  style={[styles.catChip, { backgroundColor: catColor.bg }]}
                  onPress={() => setCategoryPickerFor(categoryPickerFor === item.id ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.catChipText, { color: catColor.color }]}>{item.category}</Text>
                </TouchableOpacity>

                {/* 삭제 */}
                <TouchableOpacity
                  onPress={() => removeItem(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.red} />
                </TouchableOpacity>

                {/* 카테고리 선택기 */}
                {categoryPickerFor === item.id && (
                  <View style={styles.categoryPicker}>
                    {CATEGORIES.map(cat => {
                      const cc = CategoryColors[cat];
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.pickerOption, { backgroundColor: cc.bg }]}
                          onPress={() => updateCategory(item.id, cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.pickerOptionText, { color: cc.color }]}>{cat}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 항목 추가 버튼 */}
        <TouchableOpacity style={styles.addItemBtn} onPress={addItem} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.addItemBtnText}>+ 항목 추가</Text>
        </TouchableOpacity>

        {/* 저장 버튼 */}
        <View style={styles.saveWrap}>
          <PrimaryButton
            label={`선택한 ${checkedCount}개 저장`}
            onPress={handleSave}
            disabled={checkedCount === 0}
          />
        </View>

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
  ocrInfoCard: {
    margin: Spacing.screenHorizontal,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.cardRadius,
    padding: 16,
    gap: 10,
  },
  ocrInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ocrBadge: {
    backgroundColor: Colors.blue,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ocrBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  ocrStatus: { fontSize: 13, color: '#9DB4CB' },
  ocrProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ocrProgressText: { fontSize: 14, color: '#FFFFFF' },
  ocrTime: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', width: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
  },
  itemList: {
    marginHorizontal: Spacing.screenHorizontal,
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'visible',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
    flexWrap: 'wrap',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  itemInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
    minWidth: 80,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catChipText: { fontSize: 12, fontWeight: '600' },
  categoryPicker: {
    position: 'absolute',
    right: 40,
    top: 44,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 8,
    gap: 6,
    zIndex: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 220,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pickerOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pickerOptionText: { fontSize: 12, fontWeight: '600' },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 8,
  },
  addItemBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  saveWrap: {
    paddingHorizontal: Spacing.screenHorizontal,
    marginTop: 8,
  },
});
