import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  right?: string;
};

const SETTING_ITEMS: SettingItem[] = [
  { icon: 'notifications-outline', label: '알림 설정' },
  { icon: 'cloud-outline', label: '동기화 설정' },
  { icon: 'bar-chart-outline', label: '생산성 리포트' },
  { icon: 'flag-outline', label: '목표 설정' },
];

const INFO_ITEMS: SettingItem[] = [
  { icon: 'information-circle-outline', label: '앱 정보', right: 'v1.0.0' },
  { icon: 'document-text-outline', label: '개인정보 처리방침' },
  { icon: 'help-circle-outline', label: '도움말' },
];

export default function ProfileScreen() {
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
            <Text style={styles.statValue}>49</Text>
            <Text style={styles.statLabel}>총 할 일</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>18</Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12일</Text>
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
