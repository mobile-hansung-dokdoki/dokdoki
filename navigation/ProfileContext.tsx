import React, { createContext, useContext } from 'react';
import { DEFAULT_PROFILE_MOTTO, normalizeProfile, UserProfile } from '../utils/profile';

import { usePersistentState } from '../hooks/usePersistentState';

const INITIAL = { nickname: '나', motto: DEFAULT_PROFILE_MOTTO };
function decode(value: unknown): UserProfile {
  const p = value as UserProfile;
  if (!p || typeof p.nickname !== 'string' || (p.photoUri !== undefined && typeof p.photoUri !== 'string') || (p.motto !== undefined && typeof p.motto !== 'string')) throw new Error('Invalid profile');
  return normalizeProfile(p);
}
interface ProfileContextValue {
  storage: { loaded: boolean; saving: boolean; error: string; retry: () => Promise<void> };
  profile: UserProfile;
  updateProfile: (next: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const saved = usePersistentState<UserProfile>('dokdoki.profile.v1', INITIAL, decode);
  const profile = saved.data;
  const storage = { loaded: saved.loaded, saving: saved.saving, error: saved.error, retry: saved.retry };
  const updateProfile = (next: UserProfile) => saved.update(() => normalizeProfile(next));
  return <ProfileContext.Provider value={{ profile, updateProfile, storage }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}
