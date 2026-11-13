import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Network from 'expo-network';
import { Todo, TodoInput } from '../types';
import { buildTodos, replaceSchedule, removeOccurrence, normalizeTime } from '../utils/schedule';
import { toDateString } from '../utils/date';
import { DEFAULT_CATEGORIES, appendCategory, removeCategory } from '../utils/category';
import { usePersistentState } from './usePersistentState';
import { useLocalClock } from './useLocalClock';
import { decodeTodoState, TodoState } from '../utils/storageSchema';
import {
  clearPendingSnapshot,
  fetchSharedSnapshot,
  isCloudSyncConfigured,
  pushSharedSnapshot,
  queueSnapshot,
  readPendingSnapshot,
} from '../utils/sharedSync';

const INITIAL: TodoState = { version: 1, todos: [], categories: DEFAULT_CATEGORIES };
export type CloudSyncStatus = 'offline' | 'syncing' | 'synced' | 'error';

export function useTodos() {
  const saved = usePersistentState('dokdoki.todos.v1', INITIAL, decodeTodoState);
  const { todos, categories } = saved.data;
  const now = useLocalClock();
  const latestState = useRef(saved.data);
  latestState.current = saved.data;
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>(isCloudSyncConfigured() ? 'syncing' : 'error');
  const [syncError, setSyncError] = useState(isCloudSyncConfigured() ? '' : 'Supabase 설정을 확인해 주세요.');
  const localRevision = useRef(0);
  const localDirty = useRef(false);
  const syncRequested = useRef(false);
  const syncTask = useRef<Promise<void> | null>(null);

  const commit = (change: (previous: TodoState) => TodoState) => {
    const next = decodeTodoState(change(saved.data));
    localRevision.current += 1;
    localDirty.current = true;
    latestState.current = next;
    saved.update(() => next);
    void queueSnapshot(next).then(() => {
      syncRequested.current = true;
      void runSyncRef.current();
    }).catch(() => {
      setSyncStatus('error');
      setSyncError('변경 사항을 동기화 대기열에 저장하지 못했어요. 기기 저장 공간을 확인해 주세요.');
    });
  };

  const runSyncRef = useRef<() => Promise<void>>(async () => undefined);
  runSyncRef.current = async () => {
    if (!saved.loaded || !isCloudSyncConfigured()) return;
    if (syncTask.current) return syncTask.current;

    syncRequested.current = true;
    const task = (async () => {
      while (syncRequested.current) {
        syncRequested.current = false;
        const revisionAtStart = localRevision.current;
        try {
          const network = await Network.getNetworkStateAsync();
          if (network.isConnected === false || network.isInternetReachable === false) {
            setSyncStatus('offline');
            setSyncError('인터넷에 연결되면 대기 중인 변경 사항을 전송합니다.');
            continue;
          }

          setSyncStatus('syncing');
          setSyncError('');
          let pending = await readPendingSnapshot();
          if (!pending && localDirty.current) {
            await queueSnapshot(latestState.current);
            syncRequested.current = true;
            continue;
          }
          if (pending) {
            const uploadRevision = localRevision.current;
            await pushSharedSnapshot(pending.state);
            await clearPendingSnapshot(pending.token);
            // A newer edit may have been queued while this upload was in flight.
            pending = await readPendingSnapshot();
            if (pending) {
              syncRequested.current = true;
              continue;
            }
            if (uploadRevision === localRevision.current) localDirty.current = false;
            else {
              syncRequested.current = true;
              continue;
            }
          }

          const remote = await fetchSharedSnapshot();
          if (!remote) {
            const local = latestState.current;
            if (local.todos.length > 0 || JSON.stringify(local.categories) !== JSON.stringify(INITIAL.categories)) {
              await queueSnapshot(local);
              syncRequested.current = true;
              continue;
            }
          } else if (revisionAtStart === localRevision.current && !localDirty.current && !(await readPendingSnapshot())) {
            if (JSON.stringify(remote) !== JSON.stringify(saved.data)) {
              latestState.current = remote;
              saved.update(() => remote);
            }
          }

          if (localDirty.current) {
            setSyncStatus('error');
            setSyncError('변경 사항을 동기화 대기열에 보관하지 못했어요. 새로고침해 재시도해 주세요.');
          } else {
            setSyncStatus('synced');
            setSyncError('');
          }
        } catch {
          // Keep the local snapshot and outbox for a later retry.
          setSyncStatus('error');
          setSyncError('서버에 연결하지 못했어요. 새로고침하거나 연결을 확인해 주세요.');
        }
      }
    })();
    syncTask.current = task;
    try { await task; } finally { syncTask.current = null; }
  };

  const refreshFromServer = useCallback(() => {
    syncRequested.current = true;
    return runSyncRef.current();
  }, []);

  useEffect(() => {
    if (!saved.loaded || !isCloudSyncConfigured()) return;
    void runSyncRef.current();
    const networkSubscription = Network.addNetworkStateListener(state => {
      if (state.isConnected !== false && state.isInternetReachable !== false) {
        syncRequested.current = true;
        void runSyncRef.current();
      } else {
        setSyncStatus('offline');
        setSyncError('오프라인 상태입니다. 변경 사항은 기기에 저장됩니다.');
      }
    });
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        syncRequested.current = true;
        void runSyncRef.current();
      }
    });
    return () => {
      networkSubscription.remove();
      appStateSubscription.remove();
    };
  }, [saved.loaded]);

  const addCategory = (name: string) => {
    commit(prev => ({ ...prev, categories: appendCategory(prev.categories, name) }));
    return name.trim();
  };
  const deleteCategory = (name: string) => commit(prev => ({ ...prev, ...removeCategory(prev.categories, prev.todos, name) }));
  const addTodo = (params: TodoInput) => {
    if (!params.title.trim()) return;
    commit(prev => ({ ...prev, todos: [...buildTodos({ ...params, category: prev.categories.includes(params.category) ? params.category : '기타' }), ...prev.todos] }));
  };
  const editTodo = (id: string, params: TodoInput) => {
    if (!params.title.trim()) return;
    commit(prev => ({ ...prev, todos: replaceSchedule(prev.todos, id, params) }));
  };
  const deleteSchedule = (id: string) => commit(prev => {
    const target = prev.todos.find(t => t.id === id);
    return { ...prev, todos: prev.todos.filter(t => target?.scheduleId ? t.scheduleId !== target.scheduleId : t.id !== id) };
  });
  const toggleTodo = (id: string) => commit(prev => ({ ...prev, todos: prev.todos.map(t => t.id === id
    ? { ...t, done: !t.done, completedAt: t.done ? undefined : new Date().toISOString(), updatedAt: new Date().toISOString() } : t) }));
  const deleteTodo = (id: string) => commit(prev => ({ ...prev, todos: removeOccurrence(prev.todos, id) }));
  const getTodoStatus = (todo: Todo): '완료' | '진행' | '대기' => {
    if (todo.done) return '완료';
    if (!todo.date || !todo.time) return '대기';
    return new Date(`${todo.date}T${normalizeTime(todo.time)}:00`).getTime() <= now.getTime() ? '진행' : '대기';
  };
  return {
    todos, categories, now, addCategory, deleteCategory, addTodo, editTodo, toggleTodo, deleteTodo, deleteSchedule, getTodoStatus,
    todayTodos: todos.filter(t => !t.date || t.date === toDateString(now)),
    doneCount: todos.filter(t => t.done).length,
    sync: { status: syncStatus, error: syncError, refresh: refreshFromServer },
    storage: { loaded: saved.loaded, saving: saved.saving, error: saved.error, retry: saved.retry },
  };
}
