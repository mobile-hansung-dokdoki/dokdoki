import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, Filter, SortOrder, TodoCategory } from '../types';
import { normalizeCategory } from '../constants/categories';
import { formatDateKorean, fromDateString } from '../utils/date';

// 앱을 다시 켜도 같은 이름으로 저장된 목록을 찾아옵니다.
const STORAGE_KEY = '@dokdoki/todos:v1';
type TodoUpdate = (previous: Todo[]) => Todo[];
type StoredTodo = Omit<Todo, 'category'> & { category?: unknown };

// 빠른 연속 조작도 순서대로 저장해 오래된 목록이 최신 목록을 덮지 않게 합니다.
let storageQueue: Promise<void> = Promise.resolve();

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

function isTodoList(value: unknown): value is StoredTodo[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    const todo = item as Record<string, unknown>;
    if (
      typeof todo.id !== 'string' || !todo.id || ids.has(todo.id) ||
      typeof todo.text !== 'string' || typeof todo.done !== 'boolean' ||
      typeof todo.createdAt !== 'number' || !Number.isFinite(todo.createdAt) ||
      typeof todo.updatedAt !== 'number' || !Number.isFinite(todo.updatedAt) ||
      (todo.dueDate !== undefined && typeof todo.dueDate !== 'string')
    ) return false;
    ids.add(todo.id);
    return true;
  });
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('createdDesc');
  const [loadAttempt, setLoadAttempt] = useState(0);

  const latestTodos = useRef<Todo[]>([]);
  const ready = useRef(false);
  const mounted = useRef(false);
  const pendingUpdates = useRef<TodoUpdate[]>([]);
  const saveWarningShown = useRef(false);

  const saveTodos = useCallback((next: Todo[]): void => {
    const snapshot = JSON.stringify(next);
    storageQueue = storageQueue
      .then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot))
      .then(() => { saveWarningShown.current = false; })
      .catch(() => {
        if (!mounted.current || saveWarningShown.current) return;
        saveWarningShown.current = true;
        Alert.alert(
          '할 일 저장 실패',
          '변경 내용이 휴대폰에 저장되지 않았어요. 앱을 종료하기 전에 다시 저장해 주세요.',
          [
            { text: '닫기', style: 'cancel', onPress: () => {
              saveWarningShown.current = false;
            } },
            { text: '다시 저장', onPress: () => {
              if (!mounted.current) return;
              saveWarningShown.current = false;
              // 실패 당시 내용이 아니라 현재 최신 목록을 다시 저장합니다.
              saveTodos(latestTodos.current);
            } },
          ],
        );
      });
  }, []);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    ready.current = false;

    const loadTodos = async (): Promise<void> => {
      try {
        await storageQueue;
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: unknown = stored === null ? [] : JSON.parse(stored);
        if (!isTodoList(parsed)) throw new Error('Invalid saved todo list');
        if (!active) return;

        // 불러오는 동안 사용자가 추가한 항목도 기존 목록 위에 반영합니다.
        const waiting = pendingUpdates.current;
        const restored: Todo[] = parsed.map(todo => ({
          ...todo, category: normalizeCategory(todo.category),
        }));
        const next = waiting.reduce((list, update) => update(list), restored);
        pendingUpdates.current = [];
        latestTodos.current = next;
        ready.current = true;
        setTodos(next);
        if (waiting.length > 0) saveTodos(next);
      } catch {
        if (!active) return;
        // 읽기가 실패하면 저장을 시작하지 않아 기존 데이터를 보호합니다.
        Alert.alert(
          '할 일 불러오기 실패',
          '저장된 목록을 읽지 못했어요. 기존 데이터는 지우지 않았어요. 대기 중인 변경은 불러오기에 성공한 뒤 반영돼요.',
          [{ text: '다시 불러오기', onPress: () => {
            if (active) setLoadAttempt(attempt => attempt + 1);
          } }],
          { cancelable: false },
        );
      }
    };

    void loadTodos();
    return () => {
      active = false;
      mounted.current = false;
      ready.current = false;
    };
  }, [loadAttempt, saveTodos]);

  const updateTodos = useCallback((update: TodoUpdate): void => {
    if (!ready.current) {
      pendingUpdates.current.push(update);
      return;
    }
    const next = update(latestTodos.current);
    latestTodos.current = next;
    setTodos(next);
    saveTodos(next);
  }, [saveTodos]);

  const addTodo = useCallback((text: string, dueDate?: string, category: TodoCategory = 'none') => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    const id = generateId();
    updateTodos(prev => [
      { id, text: trimmed, done: false, dueDate, category: normalizeCategory(category), createdAt: now, updatedAt: now },
      ...prev,
    ]);
  }, [updateTodos]);

  const toggleTodo = useCallback((id: string) => {
    updateTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done, updatedAt: Date.now() }
          : todo
      )
    );
  }, [updateTodos]);

  const editTodo = useCallback((id: string, text: string, dueDate?: string, category?: TodoCategory) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    updateTodos(prev =>
      prev.map(todo =>
        todo.id === id ? {
          ...todo, text: trimmed, dueDate,
          category: category === undefined ? todo.category : normalizeCategory(category),
          updatedAt: Date.now(),
        } : todo
      )
    );
  }, [updateTodos]);

  const deleteTodo = useCallback((id: string) => {
    updateTodos(prev => prev.filter(todo => todo.id !== id));
  }, [updateTodos]);

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'active' && todo.done) return false;
      if (filter === 'done' && !todo.done) return false;

      const q = searchQuery.trim();
      if (q) {
        const lower = q.toLowerCase();
        const textMatch = todo.text.toLowerCase().includes(lower);
        const dateMatch = todo.dueDate
          ? formatDateKorean(fromDateString(todo.dueDate)).includes(q)
          : false;
        return textMatch || dateMatch;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'createdDesc') return b.createdAt - a.createdAt;
      if (sortOrder === 'createdAsc') return a.createdAt - b.createdAt;
      // dueDate 순: 마감일 없는 항목은 맨 뒤로
      if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const doneCount = todos.filter(todo => todo.done).length;

  return {
    todos,
    filteredTodos,
    doneCount,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  };
}
