import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
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
import Toast from '../components/Toast';
import { RootStackParamList } from '../navigation/RootNavigator';

type CategoryListNavProp = NativeStackNavigationProp<RootStackParamList>;

type CategoryMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  desc: string;
};

const CATEGORY_META: Record<Category, CategoryMeta> = {
  '과제':      { icon: 'document-text-outline',               desc: '학교 과제 및 리포트' },
  '업무':      { icon: 'briefcase-outline',                   desc: '직장 업무 및 프로젝트' },
  '개인 루틴': { icon: 'person-outline',                      desc: '건강, 생활, 자기계발' },
  '학습':      { icon: 'school-outline',                      desc: '강의, 자격증, 공부' },
  '기타':      { icon: 'ellipsis-horizontal-circle-outline',  desc: '기타 할 일' },
};

const CATEGORIES: Category[] = ['과제', '업무', '개인 루틴', '학습', '기타'];

export default function CategoryListScreen() {
  const navigation = useNavigation<CategoryListNavProp>();
  const { todos } = useTodosContext();
  const [toastVisible, setToastVisible] = useState(false);

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
          {CATEGORIES.map(cat => {
            const meta = CATEGORY_META[cat];
            const catColor = CategoryColors[cat];
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
            onPress={() => setToastVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: Colors.background }]}>
              <Ionicons name="add-outline" size={22} color={Colors.textSecondary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.addCardText}>카테고리 추가</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast
        message="준비 중이에요."
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
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
