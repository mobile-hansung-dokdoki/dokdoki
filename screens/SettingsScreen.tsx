import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

interface RowProps {
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}

function Row({ label, value, danger, onPress, isLast }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  const handleDataReset = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 할 일 데이터가 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '초기화', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>설정</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 동기화 섹션 */}
            <Text style={styles.sectionLabel}>동기화</Text>
            <View style={styles.card}>
              <Row
                label="동기화 상태"
                value="미연동"
                onPress={() => {}}
              />
              <Row
                label="저장 방식 설정"
                value="로컬"
                onPress={() => {}}
                isLast
              />
            </View>

            {/* 계정 섹션 */}
            <Text style={styles.sectionLabel}>계정</Text>
            <View style={styles.card}>
              <Row label="로그아웃" onPress={() => {}} />
              <Row
                label="데이터 초기화"
                danger
                onPress={handleDataReset}
                isLast
              />
            </View>

            {/* 정보 섹션 */}
            <Text style={styles.sectionLabel}>정보</Text>
            <View style={styles.card}>
              <Row label="앱 버전" value="v1.0.0" />
              <Row label="개인정보 처리방침" onPress={() => {}} isLast />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Spacing.screenTop,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerPlaceholder: {
    width: 30,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  rowLabelDanger: {
    color: Colors.danger,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
