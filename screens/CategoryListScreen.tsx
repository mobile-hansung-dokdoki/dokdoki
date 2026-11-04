import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTodosContext } from '../navigation/TodosContext';
import { Category } from '../types';
import { Colors, CategoryColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

import { RootStackParamList } from '../navigation/RootNavigator';

type CategoryListNavProp = NativeStackNavigationProp<RootStackParamList>;

type CategoryMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
};

const CATEGORY_META: Record<Category, CategoryMeta> = Object.assign(Object.create(null), {
  '과제':      { icon: 'document-text-outline',               desc: '학교 과제 및 리포트' },
  '업무':      { icon: 'briefcase-outline',                   desc: '직장 업무 및 프로젝트' },
  '개인 루틴': { icon: 'person-outline',                      desc: '건강, 생활, 자기계발' },
  '학습':      { icon: 'school-outline',                      desc: '강의, 자격증, 공부' },
  '기타':      { icon: 'ellipsis-horizontal-circle-outline',  desc: '기타 할 일' },
});

export default function CategoryListScreen() {
  const navigation = useNavigation<CategoryListNavProp>();
  const { todos, categories, addCategory } = useTodosContext();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const saveCategory = () => {
    try { addCategory(name); setAdding(false); setName(''); setError(''); }
    catch (e) { setError((e as Error).message); }
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
        <Text style={styles.headerTitle}>카테고리</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {/* 카테고리 카드들 */}
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] ?? CATEGORY_META['기타'];
            const catColor = CategoryColors[cat] ?? CategoryColors['기타'];
            const count = todos.filter(t => t.category === cat).length;

            return (
              <TouchableOpacity
                key={cat}
                style={styles.card}
                onPress={() => navigation.navigate('CategoryDetail', { category: cat })}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: catColor.bg }]}>
                  <Ionicons name={meta.icon} size={22} color={catColor.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.catName}>{cat}</Text>
                  <Text style={styles.catDesc}>{meta.desc}</Text>
                </View>
                <Text style={styles.catCount}>{count}개</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            );
          })}

          {/* 카테고리 추가 카드 */}
          <TouchableOpacity
            style={[styles.card, styles.addCard]}
            onPress={() => setAdding(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: Colors.background }]}>
              <Ionicons name="add-outline" size={22} color={Colors.textSecondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.addCardText}>카테고리 추가</Text>
            </View>
          </TouchableOpacity>
          {adding && <View style={[styles.card, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
            <TextInput accessibilityLabel="새 카테고리 이름" placeholder="새 카테고리 이름" value={name} onChangeText={v => { setName(v); setError(''); }} onSubmitEditing={saveCategory} autoFocus style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12 }} />
            {!!error && <Text accessibilityRole="alert" style={{ color: Colors.red }}>{error}</Text>}
            <TouchableOpacity onPress={saveCategory} style={{ padding: 12 }}><Text>추가</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setAdding(false); setName(''); setError(''); }} style={{ padding: 12 }}><Text>취소</Text></TouchableOpacity>
          </View>}
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
  listContainer: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  addCard: {
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 3 },
  catName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  catDesc: { fontSize: 13, color: Colors.textSecondary },
  catCount: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  addCardText: { fontSize: 15, fontWeight: '500', color: Colors.textSecondary },
});
