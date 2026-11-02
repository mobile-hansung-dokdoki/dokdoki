import * as ImagePicker from 'expo-image-picker';

export const DEFAULT_PROFILE_MOTTO = '할일을 꾸준히 하고 있어요';

export interface UserProfile {
  nickname: string;
  photoUri?: string;
  motto?: string;
}

export function normalizeProfile(profile: UserProfile): UserProfile {
  const nickname = profile.nickname.trim();
  if (!nickname) throw new Error('닉네임을 입력해 주세요.');
  if (nickname.length > 20) throw new Error('닉네임은 20자 이내로 입력해 주세요.');
  return { ...profile, nickname, motto: profile.motto?.trim() || DEFAULT_PROFILE_MOTTO };
}

export async function pickProfilePhoto(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  return result.canceled ? undefined : result.assets[0].uri;
}
