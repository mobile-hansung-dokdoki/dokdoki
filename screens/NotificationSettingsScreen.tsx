import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationSettings'>;

const OPTIONS = [
  { label: '전체 알림', description: '앱의 알림을 한 번에 관리해요.' },
  { label: '할 일 알림', description: '할 일의 예정 시간에 알림을 받아요.' },
  { label: '일일 요약', description: '오늘의 할 일을 요약해서 받아요.' },
];

export default function NotificationSettingsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="내 정보로 돌아가기"
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <View style={styles.noticeHeading}>
            <Ionicons name="notifications-outline" size={22} color={Colors.blue} />
            <Text style={styles.noticeTitle}>알림 기능 준비 중</Text>
          </View>
          <Text style={styles.description}>
            설정 화면만 준비되어 있어요. 알림 권한 요청과 실제 알림 발송은 아직 연결되지 않았어요.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>알림 종류</Text>
        <View style={styles.card}>
          {OPTIONS.map((option, index) => (
            <View key={option.label} style={[styles.row, index > 0 && styles.rowBorder]}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{option.label}</Text>
                <Text style={styles.description}>{option.description}</Text>
              </View>
              <Switch
                value={false}
                disabled
                accessibilityLabel={option.label}
                accessibilityHint="알림 기능 연결 후 사용할 수 있어요."
                trackColor={{ false: Colors.border, true: Colors.blue }}
              />
            </View>
          ))}
        </View>
        <Text style={styles.footnote}>알림 기능이 연결되면 이 화면에서 설정할 수 있어요.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal, paddingVertical: 14,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  content: {
    width: '100%', maxWidth: 640, alignSelf: 'center',
    padding: Spacing.screenHorizontal, paddingBottom: 40, gap: 16,
  },
  notice: { padding: 16, borderRadius: Spacing.cardRadius, backgroundColor: '#DBEAFE', gap: 10 },
  noticeHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeTitle: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  description: { fontSize: 13, lineHeight: 20, color: Colors.textSecondary, flexShrink: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  card: {
    backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.border, borderRadius: Spacing.cardRadius, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowContent: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  footnote: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary },
});
