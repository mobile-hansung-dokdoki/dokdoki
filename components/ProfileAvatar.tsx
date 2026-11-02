import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { UserProfile } from '../utils/profile';
import { Colors } from '../theme/colors';

interface Props {
  profile: UserProfile;
  size: number;
}

export default function ProfileAvatar({ profile, size }: Props) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {profile.photoUri ? (
        <Image
          source={{ uri: profile.photoUri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityLabel={`${profile.nickname}의 프로필 사진`}
        />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.36 }]}>{Array.from(profile.nickname)[0]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  initial: { fontWeight: '700', color: Colors.surface },
});
