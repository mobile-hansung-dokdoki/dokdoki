import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createPersistentStore, StorageAdapter } from '../utils/persistentStore';

// Lazy import keeps platform storage outside pure utility and server rendering tests.
const storage: StorageAdapter = {
  getItem: async key => (await import('@react-native-async-storage/async-storage')).default.getItem(key),
  setItem: async (key, value) => (await import('@react-native-async-storage/async-storage')).default.setItem(key, value),
};

export function usePersistentState<T>(key: string, initial: T, decode: (value: unknown) => T) {
  const store = useMemo(() => createPersistentStore(key, initial, decode, storage), [key]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => { void store.load(); }, [store]);
  return { ...state, update: store.update, retry: store.retry };
}
