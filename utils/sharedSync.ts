import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoState, decodeTodoState } from './storageSchema';
import { isSupabaseConfigured, supabase } from './supabase';

const TABLE = 'shared_todo_state';
const SHARED_ROW_ID = 'dokdoki-shared';
const OUTBOX_KEY = 'dokdoki.todos.sync-outbox.v1';
let outboxWriteTail = Promise.resolve();

export interface PendingSnapshot {
  token: string;
  state: TodoState;
}

export function isCloudSyncConfigured() {
  return isSupabaseConfigured;
}

export async function readPendingSnapshot(): Promise<PendingSnapshot | null> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { token?: unknown; state?: unknown };
  if (typeof parsed.token !== 'string') throw new Error('저장된 동기화 대기 항목을 읽지 못했어요.');
  return { token: parsed.token, state: decodeTodoState(parsed.state) };
}

export async function queueSnapshot(state: TodoState): Promise<PendingSnapshot> {
  const snapshot = decodeTodoState(state);
  const pending = { token: `${Date.now()}-${Math.random().toString(36).slice(2)}`, state: snapshot };
  const write = outboxWriteTail.then(() => AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(pending)));
  outboxWriteTail = write.then(() => undefined, () => undefined);
  await write;
  return pending;
}

export async function clearPendingSnapshot(token: string) {
  const latest = await readPendingSnapshot();
  if (latest?.token === token) await AsyncStorage.removeItem(OUTBOX_KEY);
}

export async function fetchSharedSnapshot(): Promise<TodoState | null> {
  if (!supabase) throw new Error('Supabase 설정을 찾지 못했어요. .env 값을 확인해 주세요.');
  const { data, error } = await supabase
    .from(TABLE)
    .select('state')
    .eq('id', SHARED_ROW_ID)
    .maybeSingle();
  if (error) throw error;
  return data ? decodeTodoState(data.state) : null;
}

export async function pushSharedSnapshot(state: TodoState) {
  if (!supabase) throw new Error('Supabase 설정을 찾지 못했어요. .env 값을 확인해 주세요.');
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: SHARED_ROW_ID, state: decodeTodoState(state) }, { onConflict: 'id' });
  if (error) throw error;
}
