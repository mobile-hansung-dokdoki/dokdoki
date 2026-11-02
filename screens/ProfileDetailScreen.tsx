import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useProfile } from '../navigation/ProfileContext';
import { DEFAULT_PROFILE_MOTTO, pickProfilePhoto } from '../utils/profile';
import ProfileAvatar from '../components/ProfileAvatar';
import PrimaryButton from '../components/PrimaryButton';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>;

export default function ProfileDetailScreen({ navigation }: Props) {
  const { profile, updateProfile } = useProfile();
  const [nickname, setNickname] = useState(profile.nickname);
  const [photoUri, setPhotoUri] = useState(profile.photoUri);
  const [motto, setMotto] = useState(profile.motto ?? DEFAULT_PROFILE_MOTTO);
  const [nicknameError, setNicknameError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const handlePickPhoto = async () => {
    if (pickingPhoto) return;
    setPickingPhoto(true);
    setPhotoError('');
    try {
      const uri = await pickProfilePhoto();
      if (uri !== undefined) setPhotoUri(uri);
    } catch {
      setPhotoError('사진을 불러오지 못했어요. 사진 접근 권한을 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setPickingPhoto(false);
    }
  };

  const handleApply = () => {
    try {
      updateProfile({ nickname, photoUri, motto });
      navigation.goBack();
    } catch (error) {
      setNicknameError((error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="내 정보로 돌아가기"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.photoSection}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="프로필 사진 변경"
              accessibilityState={{ disabled: pickingPhoto, busy: pickingPhoto }}
              onPress={handlePickPhoto}
              disabled={pickingPhoto}
              style={styles.photoButton}
            >
              <ProfileAvatar profile={{ nickname: nickname.trim() || '나', photoUri }} size={104} />
              <View style={styles.cameraBadge}>
                <Ionicons name="image-outline" size={18} color={Colors.surface} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>{pickingPhoto ? '사진을 불러오는 중이에요…' : '사진을 눌러 앨범에서 변경하세요.'}</Text>
            {!!photoUri && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => { setPhotoUri(undefined); setPhotoError(''); }}
                disabled={pickingPhoto}
                style={styles.resetButton}
              >
                <Text style={styles.resetText}>기본 이미지로 변경</Text>
              </TouchableOpacity>
            )}
            {!!photoError && <Text style={styles.error} accessibilityRole="alert">{photoError}</Text>}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              accessibilityLabel="닉네임"
              value={nickname}
              onChangeText={value => { setNickname(value); setNicknameError(''); }}
              placeholder="닉네임을 입력해 주세요."
              placeholderTextColor={Colors.textTertiary}
              maxLength={20}
              autoCorrect={false}
              returnKeyType="done"
              style={[styles.input, !!nicknameError && styles.inputError]}
            />
            <Text style={styles.counter}>{nickname.length}/20</Text>
            {!!nicknameError && <Text style={styles.error} accessibilityRole="alert">{nicknameError}</Text>}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>소개 / 좌우명</Text>
            <TextInput
              accessibilityLabel="소개 / 좌우명"
              value={motto}
              onChangeText={setMotto}
              placeholder={DEFAULT_PROFILE_MOTTO}
              placeholderTextColor={Colors.textTertiary}
              maxLength={100}
              multiline
              textAlignVertical="top"
              style={[styles.input, { minHeight: 88 }]}
            />
            <Text style={styles.counter}>{motto.length}/100</Text>
            <Text style={styles.sessionHint}>내 정보에 표시되는 문구예요. 비워두면 기본 문구로 돌아가요.</Text>
          </View>
          <PrimaryButton label="변경사항 적용" onPress={handleApply} disabled={pickingPhoto} />
          <Text style={styles.sessionHint}>현재 실행 중인 앱에만 반영돼요. 앱을 종료하면 초기화돼요.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal, paddingVertical: 14,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },
  content: {
    width: '100%', maxWidth: 640, alignSelf: 'center',
    padding: Spacing.screenHorizontal, paddingBottom: 40, gap: 24,
  },
  photoSection: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  photoButton: { width: 104, height: 104 },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.blue, borderWidth: 2, borderColor: Colors.surface,
  },
  photoHint: { fontSize: 13, color: Colors.textSecondary },
  resetButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  resetText: { fontSize: 14, color: Colors.blue },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Spacing.inputRadius, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.textPrimary,
  },
  inputError: { borderColor: Colors.red },
  counter: { textAlign: 'right', fontSize: 12, color: Colors.textTertiary },
  error: { fontSize: 13, color: Colors.red },
  sessionHint: { fontSize: 12, textAlign: 'center', color: Colors.textSecondary },
});
