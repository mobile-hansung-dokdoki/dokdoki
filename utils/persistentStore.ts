export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function createPersistentStore<T>(key: string, initial: T, decode: (value: unknown) => T, storage: StorageAdapter) {
  let snapshot = { data: initial, loaded: false, saving: false, error: '' };
  const listeners = new Set<() => void>();
  let loading: Promise<void> | undefined;
  let tail = Promise.resolve();
  let revision = 0;
  const publish = (patch: Partial<typeof snapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach(listener => listener());
  };
  const load = () => {
    if (snapshot.loaded) return Promise.resolve();
    if (loading) return loading;
    publish({ error: '' });
    loading = (async () => {
      try {
        const raw = await storage.getItem(key);
        const data = raw === null ? initial : decode(JSON.parse(raw));
        publish({ data, loaded: true, error: '' });
      } catch {
        // Never replace unreadable data with the initial empty state.
        publish({ error: '저장된 데이터를 읽지 못했어요. 원본은 유지돼요. 다시 시도해 주세요.' });
      } finally { loading = undefined; }
    })();
    return loading;
  };
  const save = () => {
    if (!snapshot.loaded) return load();
    const current = ++revision;
    const encoded = JSON.stringify(snapshot.data);
    publish({ saving: true, error: '' });
    tail = tail.then(async () => {
      try {
        await storage.setItem(key, encoded);
        if (current === revision) publish({ saving: false, error: '' });
      } catch {
        if (current === revision) publish({ saving: false, error: '기기에 저장하지 못했어요. 앱을 닫기 전에 다시 시도해 주세요.' });
      }
    });
    return tail;
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load,
    retry: () => snapshot.loaded ? save() : load(),
    update: (change: (previous: T) => T) => {
      if (!snapshot.loaded) throw new Error('데이터를 불러오는 중이에요.');
      publish({ data: change(snapshot.data) });
      void save();
    },
    flush: () => tail,
  };
}
