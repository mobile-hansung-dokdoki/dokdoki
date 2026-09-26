import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import PrimaryButton from '../components/PrimaryButton';
import { RootStackParamList } from '../navigation/RootNavigator';

type OcrIntroNavProp = NativeStackNavigationProp<RootStackParamList>;

export default function OcrIntroScreen() {
  const navigation = useNavigation<OcrIntroNavProp>();
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 영역 (파란 배경) */}
      <View style={styles.topSection}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI 메모 스캔</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 뱃지 */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👁 AI SMART OCR</Text>
        </View>

        {/* 타이틀 */}
        <Text style={styles.mainTitle}>종이 메모를 촬영하면{'\n'}할 일로 바꿔드려요.</Text>
        <Text style={styles.subTitle}>손글씨나 인쇄된 메모도 기기에서 바로 인식해요.</Text>

        {/* 스캔 프레임 */}
        <View style={styles.frameWrap}>
          <View style={styles.frame}>
            {/* 모서리 코너 */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* 프레임 내부 */}
            <View style={styles.frameInner}>
              <Ionicons name="camera-outline" size={36} color="rgba(255,255,255,0.6)" />
              <Text style={styles.frameHint}>메모를 이 안에 맞춰 주세요</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 하단 영역 (흰 배경) */}
      <View style={styles.bottomSection}>
        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>사진은 저장되거나 서버로 전송되지 않아요.</Text>
            <Text style={styles.privacySub}>모든 처리는 사용자의 기기에서만 이루어져요.</Text>
          </View>
        </View>

        <PrimaryButton
          label="카메라 열기"
          onPress={() => setPermissionDialogVisible(true)}
        />
      </View>

      {/* 권한 다이얼로그 */}
      <Modal visible={permissionDialogVisible} transparent animationType="fade">
        <View style={styles.dimOverlay}>
          <View style={styles.dialog}>
            <Ionicons name="camera-outline" size={28} color={Colors.primary} />
            <Text style={styles.dialogTitle}>카메라 접근을 허용할까요?</Text>
            <Text style={styles.dialogDesc}>
              종이 메모를 촬영해 할 일을 인식하려면{'\n'}카메라 권한이 필요해요.
            </Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPermissionDialogVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>나중에</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  setPermissionDialogVisible(false);
                  navigation.navigate('OcrResult');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>허용</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  topSection: {
    flex: 0.6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.screenHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.blue,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 30,
    marginBottom: 8,
  },
  subTitle: { fontSize: 14, color: '#9DB4CB', marginBottom: 20 },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 200,
    height: 140,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  frameInner: { alignItems: 'center', gap: 8 },
  frameHint: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  bottomSection: {
    flex: 0.4,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
    justifyContent: 'center',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: Spacing.cardRadius,
    padding: 16,
  },
  privacyTextWrap: { flex: 1, gap: 4 },
  privacyTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  privacySub: { fontSize: 13, color: Colors.textSecondary },
  // 다이얼로그
  dimOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.cardRadius,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  dialogDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.buttonRadius,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: Spacing.buttonRadius,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
