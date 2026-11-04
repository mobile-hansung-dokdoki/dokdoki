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
    quality: 0.5,
    base64: true,
  });
  if (result.canceled) return undefined;
  const asset = result.assets[0];
  const { Platform } = await import('react-native');
  if (Platform.OS === 'web') {
    if (!asset.base64) throw new Error('사진을 저장할 수 없어요.');
    if (asset.base64.length > 2_000_000) throw new Error('더 작은 사진을 선택해 주세요.');
    return `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`;
  }
  const { File, Directory, Paths } = await import('expo-file-system');
  const folder = new Directory(Paths.document, 'profile-photos');
  folder.create({ idempotent: true, intermediates: true });
  const extension = asset.mimeType === 'image/png' ? 'png' : 'jpg';
  const destination = new File(folder, `profile-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`);
  new File(asset.uri).copy(destination);
  return destination.uri;
}
