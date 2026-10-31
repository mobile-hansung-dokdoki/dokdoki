import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_PROFILE_MOTTO, normalizeProfile, UserProfile } from '../utils/profile';

interface ProfileContextValue {
  profile: UserProfile;
  updateProfile: (next: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({ nickname: '나', motto: DEFAULT_PROFILE_MOTTO });
  const updateProfile = (next: UserProfile) => setProfile(normalizeProfile(next));
  return <ProfileContext.Provider value={{ profile, updateProfile }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
