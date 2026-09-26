import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTodosContext } from '../navigation/TodosContext';
import { Todo } from '../types';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import Toast from '../components/Toast';

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

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  right?: string;
  action: 'report' | 'wip';
};

const SETTING_ITEMS: SettingItem[] = [
  { icon: 'notifications-outline', label: '알림 설정',   action: 'wip' },
  { icon: 'cloud-outline',          label: '동기화 설정', action: 'wip' },
  { icon: 'bar-chart-outline',      label: '생산성 리포트', action: 'report' },
  { icon: 'flag-outline',           label: '목표 설정',  action: 'wip' },
];

const INFO_ITEMS: SettingItem[] = [
  { icon: 'information-circle-outline', label: '앱 정보',          right: 'v1.0.0', action: 'wip' },
  { icon: 'document-text-outline',      label: '개인정보 처리방침', action: 'wip' },
  { icon: 'help-circle-outline',        label: '도움말',           action: 'wip' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { todos } = useTodosContext();
  const [toastVisible, setToastVisible] = useState(false);

  const { totalCount, doneCount, streak } = useMemo(() => ({
    totalCount: todos.length,
    doneCount: todos.filter(t => t.done).length,
    streak: calcStreak(todos),
  }), [todos]);

  const handleItemPress = (action: SettingItem['action']) => {
    if (action === 'report') {
      navigation.navigate('Tabs', { screen: 'Report' });
    } else {
      setToastVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 상단 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>나</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>나의 프로필</Text>
            <Text style={styles.profileSub}>할 일을 꾸준히 관리하고 있어요 ✨</Text>
          </View>
        </View>

        {/* 통계 요약 행 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>총 할 일</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{doneCount}</Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak > 0 ? `${streak}일` : '-'}</Text>
            <Text style={styles.statLabel}>연속 달성</Text>
          </View>
        </View>

        {/* 설정 섹션 */}
        <Text style={styles.sectionLabel}>설정</Text>
        <View style={styles.menuCard}>
          {SETTING_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, idx < SETTING_ITEMS.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
              onPress={() => handleItemPress(item.action)}
            >
              <Ionicons name={item.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 정보 섹션 */}
        <Text style={styles.sectionLabel}>정보</Text>
        <View style={styles.menuCard}>
          {INFO_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, idx < INFO_ITEMS.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
              onPress={() => handleItemPress(item.action)}
            >
              <Ionicons name={item.icon} size={20} color={Colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.right ? (
                <Text style={styles.menuRight}>{item.right}</Text>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screenHorizontal,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { gap: 4 },
  profileName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  profileSub: { fontSize: 13, color: Colors.textSecondary },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screenHorizontal,
    marginBottom: 20,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statDivider: { width: 1, backgroundColor: Colors.border },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.screenHorizontal,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.screenHorizontal,
    borderRadius: Spacing.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  menuRight: { fontSize: 13, color: Colors.textSecondary },
});
